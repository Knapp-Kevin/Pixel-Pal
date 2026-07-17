import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { startHeadlessChrome } from './cdp-browser.mjs';
import { clickButton, setPalName, waitForEnabledButton } from './viewport-actions.mjs';

const baseUrl = process.env.VIEWPORT_BASE_URL ?? 'http://127.0.0.1:4173';
const origin = new URL(baseUrl).origin;
const screenshotDirectory = join(process.cwd(), 'artifacts', 'production-art-blocking');

async function capture(page, name) {
  const result = await page.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    fromSurface: true
  });
  await writeFile(join(screenshotDirectory, `${name}.png`), Buffer.from(result.data, 'base64'));
}

async function artSnapshot(page) {
  return JSON.parse(await page.evaluate(`JSON.stringify({
    blockedPals: document.querySelectorAll('[data-production-art-blocked="pal"]').length,
    blockedScenes: document.querySelectorAll('[data-production-art-blocked="scene"]').length,
    alphaPalSvgs: [...document.querySelectorAll('svg[role="img"]')]
      .filter((node) => (node.getAttribute('aria-label') ?? '').includes(' Pal')).length,
    productionPalImages: document.querySelectorAll('img[data-art-asset-id]').length,
    productionSceneImages: document.querySelectorAll('img.production-scene-art[data-art-asset-id]').length,
    documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
  })`));
}

function assertNoAlpha(snapshot, label) {
  if (snapshot.alphaPalSvgs !== 0) {
    throw new Error(`${label} rendered ${snapshot.alphaPalSvgs} alpha Pal SVGs in production mode.`);
  }
  if (snapshot.documentWidth > 801) {
    throw new Error(`${label} overflowed the compact production viewport at ${snapshot.documentWidth}px.`);
  }
}

await rm(screenshotDirectory, { recursive: true, force: true });
await mkdir(screenshotDirectory, { recursive: true });
const browser = await startHeadlessChrome();
const page = await browser.newPage();

try {
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 800,
    height: 600,
    deviceScaleFactor: 1,
    mobile: false,
    screenOrientation: { type: 'landscapePrimary', angle: 90 }
  });
  await page.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' });
  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('#first-pal-title'))");

  const starter = await artSnapshot(page);
  assertNoAlpha(starter, 'Starter selection');
  if (starter.blockedPals < 5) {
    throw new Error(`Starter selection exposed only ${starter.blockedPals} blocked production Pal slots.`);
  }
  await capture(page, 'starter-production-art-blocked');

  await clickButton(page, 'Fox', true);
  await setPalName(page, 'Pip');
  await waitForEnabledButton(page, 'Meet my Pal');
  await clickButton(page, 'Meet my Pal');
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");

  const world = await artSnapshot(page);
  assertNoAlpha(world, 'First world');
  if (world.blockedPals < 1) throw new Error('The first world did not block missing production Pal art.');
  await capture(page, 'world-production-art-blocked');

  console.log(`PASS production art honesty: ${starter.blockedPals} starter Pal slots blocked; alpha SVG fallback absent.`);
  console.log(`World state: ${world.productionPalImages} production Pal images, ${world.productionSceneImages} production scene images, ${world.blockedScenes} blocked scene slots.`);
} finally {
  page.close();
  await browser.close();
}
