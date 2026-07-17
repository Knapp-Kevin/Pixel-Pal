import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { startHeadlessChrome } from './cdp-browser.mjs';
import { clickButton, setPalName, waitForEnabledButton } from './viewport-actions.mjs';

const baseUrl = process.env.VIEWPORT_BASE_URL ?? 'http://127.0.0.1:4173';
const origin = new URL(baseUrl).origin;
const screenshotDirectory = join(process.cwd(), 'artifacts', 'family-map');

const profiles = [
  { name: 'compact-landscape', width: 800, height: 600, species: 'Fox', palName: 'Pip' },
  { name: 'compact-portrait', width: 600, height: 800, species: 'Duckling', palName: 'Dara' }
];

async function setViewport(page, profile) {
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: profile.width,
    height: profile.height,
    deviceScaleFactor: 1,
    mobile: false,
    screenOrientation: {
      type: profile.width >= profile.height ? 'landscapePrimary' : 'portraitPrimary',
      angle: profile.width >= profile.height ? 90 : 0
    }
  });
  await page.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
}

async function capture(page, profile, state) {
  const result = await page.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    fromSurface: true
  });
  await writeFile(join(screenshotDirectory, `${profile.name}-${state}.png`), Buffer.from(result.data, 'base64'));
}

async function createWorld(page, profile) {
  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('#first-pal-title'))");
  await clickButton(page, profile.species, true);
  await setPalName(page, profile.palName);
  await waitForEnabledButton(page, 'Meet my Pal');
  await clickButton(page, 'Meet my Pal');
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");
}

async function assertLocked(page, profile) {
  const snapshot = JSON.parse(await page.evaluate(`JSON.stringify({
    gate: Boolean(document.querySelector('.parent-access-gate')),
    familyMap: Boolean(document.querySelector('.family-map'))
  })`));
  if (!snapshot.gate || snapshot.familyMap) {
    throw new Error(`${profile.name} exposed the Family Map before parent access was unlocked.`);
  }
  console.log(`PASS ${profile.name}: Family Map remains parent protected`);
}

async function unlockForVerification(page) {
  await page.evaluate("sessionStorage.setItem('pixel-pals-parent-unlocked', 'true')");
  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('.family-map'))");
}

async function familySnapshot(page) {
  return JSON.parse(await page.evaluate(`JSON.stringify((() => {
    const familyMap = document.querySelector('.family-map');
    const controls = [...document.querySelectorAll('.family-map button, .family-map select')].map((control) => {
      const rect = control.getBoundingClientRect();
      return {
        label: control.textContent?.trim() || control.getAttribute('aria-label'),
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height
      };
    });
    const art = [...document.querySelectorAll('.family-map-pal-art')].map((element) => ({
      tag: element.tagName,
      label: element.getAttribute('aria-label') || element.getAttribute('alt'),
      assetId: element.getAttribute('data-art-asset-id')
    }));
    return {
      count: Number(familyMap?.getAttribute('data-family-bond-count') ?? '-1'),
      palCards: document.querySelectorAll('[data-reusable-art="pal-artwork"]').length,
      art,
      bonds: [...document.querySelectorAll('.family-bond-card')].map((bond) => bond.textContent?.trim()),
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      controls
    };
  })())`));
}

function assertResponsive(snapshot, profile, expectedCount) {
  const failures = [];
  if (snapshot.count !== expectedCount) failures.push(`bond count ${snapshot.count}`);
  if (snapshot.palCards !== 2) failures.push(`${snapshot.palCards} reusable Pal cards`);
  if (snapshot.art.length !== 2) failures.push(`${snapshot.art.length} rendered Pal artworks`);
  for (const artwork of snapshot.art) {
    if (!['svg', 'IMG'].includes(artwork.tag)) failures.push(`unexpected art element ${artwork.tag}`);
    if (!artwork.label) failures.push('Pal artwork without accessible label');
  }
  if (snapshot.documentWidth > profile.width + 1) failures.push(`document width ${snapshot.documentWidth}`);
  for (const control of snapshot.controls) {
    if (control.width < 44 || control.height < 44) failures.push(`undersized control ${control.label}`);
    if (control.left < -1 || control.right > profile.width + 1) failures.push(`clipped control ${control.label}`);
  }
  if (failures.length) throw new Error(`${profile.name} Family Map failed: ${failures.join('; ')}`);
}

async function waitForSaved(page) {
  await page.waitFor("document.body.textContent?.includes('Saved. Your world will remember this.')");
}

async function runProfile(browser, profile) {
  const page = await browser.newPage();
  try {
    await setViewport(page, profile);
    await page.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' });
    await createWorld(page, profile);
    await assertLocked(page, profile);
    await unlockForVerification(page);

    const empty = await familySnapshot(page);
    assertResponsive(empty, profile, 0);

    await clickButton(page, 'Add family bond', true);
    await page.waitFor("document.querySelector('.family-map')?.getAttribute('data-family-bond-count') === '1'");
    await waitForSaved(page);
    const added = await familySnapshot(page);
    assertResponsive(added, profile, 1);
    if (!added.bonds.some((bond) => bond?.includes('Chosen family'))) {
      throw new Error(`${profile.name} did not render the persisted chosen-family bond.`);
    }
    await capture(page, profile, 'chosen-family-added');

    await page.navigate(baseUrl);
    await page.waitFor("document.querySelector('.family-map')?.getAttribute('data-family-bond-count') === '1'");
    const reloaded = await familySnapshot(page);
    assertResponsive(reloaded, profile, 1);
    console.log(`PASS ${profile.name}: family bond survived reload`);

    await page.evaluate("document.querySelector('.family-bond-remove')?.click()");
    await page.waitFor("document.querySelector('.family-map')?.getAttribute('data-family-bond-count') === '0'");
    await waitForSaved(page);
    await page.navigate(baseUrl);
    await page.waitFor("document.querySelector('.family-map')?.getAttribute('data-family-bond-count') === '0'");
    const removed = await familySnapshot(page);
    assertResponsive(removed, profile, 0);
    console.log(`PASS ${profile.name}: family bond removal survived reload`);
  } finally {
    page.close();
  }
}

await rm(screenshotDirectory, { recursive: true, force: true });
await mkdir(screenshotDirectory, { recursive: true });
const browser = await startHeadlessChrome();
try {
  for (const profile of profiles) await runProfile(browser, profile);
  console.log('Verified the persisted, parent-protected, reusable-art Family Map in compact landscape and portrait profiles.');
} finally {
  await browser.close();
}