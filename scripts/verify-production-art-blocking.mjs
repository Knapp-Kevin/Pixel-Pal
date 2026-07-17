import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { startHeadlessChrome } from './cdp-browser.mjs';

const baseUrl = process.env.VIEWPORT_BASE_URL ?? 'http://127.0.0.1:4173';
const origin = new URL(baseUrl).origin;
const screenshotDirectory = join(process.cwd(), 'artifacts', 'production-art-blocking');
const profiles = [
  { name: 'compact-landscape', width: 800, height: 600, orientation: 'landscapePrimary', angle: 90 },
  { name: 'compact-portrait', width: 600, height: 800, orientation: 'portraitPrimary', angle: 0 }
];

async function capture(page, name) {
  const result = await page.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    fromSurface: true
  });
  await writeFile(join(screenshotDirectory, `${name}.png`), Buffer.from(result.data, 'base64'));
}

async function snapshot(page) {
  return JSON.parse(await page.evaluate(`JSON.stringify((() => {
    const boundary = document.querySelector('[data-production-art-release-blocked="true"]');
    const copy = document.querySelector('.production-art-release-copy');
    const rect = boundary?.getBoundingClientRect();
    const copyRect = copy?.getBoundingClientRect();
    return {
      boundary: Boolean(boundary),
      blockerCount: boundary?.getAttribute('data-production-art-blocker-count'),
      title: document.querySelector('#production-art-release-title')?.textContent?.trim(),
      alphaPalSvgs: [...document.querySelectorAll('svg[role="img"]')]
        .filter((node) => (node.getAttribute('aria-label') ?? '').includes(' Pal')).length,
      blockedPalCards: document.querySelectorAll('[data-production-art-blocked="pal"]').length,
      worldNav: Boolean(document.querySelector('.world-nav')),
      firstPalTitle: Boolean(document.querySelector('#first-pal-title')),
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      boundaryClientHeight: boundary?.clientHeight ?? null,
      boundaryScrollHeight: boundary?.scrollHeight ?? null,
      boundaryRect: rect ? { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom } : null,
      copyRect: copyRect ? { left: copyRect.left, right: copyRect.right, top: copyRect.top, bottom: copyRect.bottom } : null
    };
  })())`));
}

function assertBoundary(state, profile) {
  const failures = [];
  if (!state.boundary) failures.push('missing visual release boundary');
  if (state.blockerCount !== '35') failures.push(`reported ${state.blockerCount} blockers`);
  if (!state.title?.includes('finished artwork')) failures.push('missing release-block title');
  if (state.alphaPalSvgs !== 0) failures.push(`${state.alphaPalSvgs} alpha Pal SVGs rendered`);
  if (state.blockedPalCards !== 0) failures.push(`${state.blockedPalCards} per-component blocker cards rendered`);
  if (state.worldNav || state.firstPalTitle) failures.push('product routes rendered behind release boundary');
  if (state.documentWidth > profile.width + 1) failures.push(`document width ${state.documentWidth}`);
  if (state.boundaryScrollHeight > state.boundaryClientHeight + 1) failures.push('release boundary content overflows internally');
  if (!state.boundaryRect
    || state.boundaryRect.left < -1
    || state.boundaryRect.right > profile.width + 1
    || state.boundaryRect.top < -1
    || state.boundaryRect.bottom > profile.height + 1) {
    failures.push('release boundary clipped outside viewport');
  }
  if (!state.copyRect
    || !state.boundaryRect
    || state.copyRect.left < state.boundaryRect.left - 1
    || state.copyRect.right > state.boundaryRect.right + 1
    || state.copyRect.top < state.boundaryRect.top - 1
    || state.copyRect.bottom > state.boundaryRect.bottom + 1) {
    failures.push('release copy clipped by panel');
  }
  if (failures.length > 0) throw new Error(`${profile.name} production art release boundary failed: ${failures.join('; ')}`);
}

await rm(screenshotDirectory, { recursive: true, force: true });
await mkdir(screenshotDirectory, { recursive: true });
const browser = await startHeadlessChrome();

try {
  for (const profile of profiles) {
    const page = await browser.newPage();
    try {
      await page.send('Emulation.setDeviceMetricsOverride', {
        width: profile.width,
        height: profile.height,
        deviceScaleFactor: 1,
        mobile: false,
        screenOrientation: { type: profile.orientation, angle: profile.angle }
      });
      await page.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' });
      await page.navigate(baseUrl);
      await page.waitFor("Boolean(document.querySelector('[data-production-art-release-blocked=\"true\"]'))");
      const state = await snapshot(page);
      assertBoundary(state, profile);
      await capture(page, `${profile.name}-visual-release-blocked`);
      console.log(`PASS ${profile.name}: production is blocked by ${state.blockerCount} incomplete art records with no alpha fallback or clipped copy.`);
    } finally {
      page.close();
    }
  }
} finally {
  await browser.close();
}
