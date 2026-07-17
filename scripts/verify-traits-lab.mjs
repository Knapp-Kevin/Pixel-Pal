import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { startHeadlessChrome } from './cdp-browser.mjs';
import { clickButton, setPalName, waitForEnabledButton } from './viewport-actions.mjs';

const baseUrl = process.env.VIEWPORT_BASE_URL ?? 'http://127.0.0.1:4173';
const origin = new URL(baseUrl).origin;
const screenshotDirectory = join(process.cwd(), 'artifacts', 'traits-lab');

const profiles = [
  { name: 'compact-landscape', width: 800, height: 600, species: 'Fox', palName: 'Pip' },
  { name: 'compact-portrait', width: 600, height: 800, species: 'Kitten', palName: 'Mina' }
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
  const snapshot = await page.evaluate(`JSON.stringify({
    gate: Boolean(document.querySelector('.parent-access-gate')),
    lab: Boolean(document.querySelector('.traits-lab'))
  })`);
  const parsed = JSON.parse(snapshot);
  if (!parsed.gate || parsed.lab) {
    throw new Error(`${profile.name} exposed the Traits Lab before parent access was unlocked.`);
  }
  console.log(`PASS ${profile.name}: Traits Lab remains parent protected`);
}

async function unlockForVerification(page) {
  await page.evaluate("sessionStorage.setItem('pixel-pals-parent-unlocked', 'true')");
  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('.traits-lab'))");
}

async function traitsSnapshot(page) {
  return JSON.parse(await page.evaluate(`JSON.stringify((() => {
    const lab = document.querySelector('.traits-lab');
    const boundary = document.querySelector('.traits-boundary')?.textContent ?? '';
    const controls = [...document.querySelectorAll('.traits-lab button')].map((button) => {
      const rect = button.getBoundingClientRect();
      return { label: button.textContent?.trim(), left: rect.left, right: rect.right, width: rect.width, height: rect.height };
    });
    return {
      sample: lab?.getAttribute('data-traits-lab-sample'),
      profiles: document.querySelectorAll('.trait-profile-card').length,
      outcomes: document.querySelectorAll('.trait-outcome-card').length,
      expressed: [...document.querySelectorAll('.trait-outcome-card h3')].map((heading) => heading.textContent?.trim()),
      carried: [...document.querySelectorAll('.trait-carried')].map((element) => element.textContent?.trim()),
      boundary,
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      controls
    };
  })())`));
}

function assertTraitsSnapshot(snapshot, profile, expectedSample) {
  const failures = [];
  if (snapshot.sample !== String(expectedSample)) failures.push(`sample ${snapshot.sample}`);
  if (snapshot.profiles !== 2) failures.push(`${snapshot.profiles} source profiles`);
  if (snapshot.outcomes !== 2) failures.push(`${snapshot.outcomes} outcomes`);
  if (!snapshot.boundary.includes('does not create a child or relationship')) failures.push('missing family boundary');
  if (!snapshot.boundary.includes('culture') || !snapshot.boundary.includes('personality') || !snapshot.boundary.includes('adoption')) {
    failures.push('missing non-genetic identity boundary');
  }
  if (snapshot.documentWidth > profile.width + 1) failures.push(`document width ${snapshot.documentWidth}`);
  for (const control of snapshot.controls) {
    if (control.width < 44 || control.height < 44) failures.push(`undersized control ${control.label}`);
    if (control.left < -1 || control.right > profile.width + 1) failures.push(`clipped control ${control.label}`);
  }
  if (failures.length > 0) throw new Error(`${profile.name} Traits Lab failed: ${failures.join('; ')}`);
}

async function runProfile(browser, profile) {
  const page = await browser.newPage();
  try {
    await setViewport(page, profile);
    await page.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' });
    await createWorld(page, profile);
    await assertLocked(page, profile);
    await unlockForVerification(page);

    const first = await traitsSnapshot(page);
    assertTraitsSnapshot(first, profile, 1);
    await capture(page, profile, 'sample-1');

    await clickButton(page, 'Next sample', true);
    await page.waitFor("document.querySelector('.traits-lab')?.getAttribute('data-traits-lab-sample') === '2'");
    const second = await traitsSnapshot(page);
    assertTraitsSnapshot(second, profile, 2);
    if (JSON.stringify(first.expressed) === JSON.stringify(second.expressed)
      && JSON.stringify(first.carried) === JSON.stringify(second.carried)) {
      throw new Error(`${profile.name} did not produce repeat-play inheritance variation.`);
    }
    await capture(page, profile, 'sample-2');
    console.log(`PASS ${profile.name}: Traits Lab is responsive, deterministic, and variable`);
  } finally {
    page.close();
  }
}

await rm(screenshotDirectory, { recursive: true, force: true });
await mkdir(screenshotDirectory, { recursive: true });
const browser = await startHeadlessChrome();
try {
  for (const profile of profiles) await runProfile(browser, profile);
  console.log('Verified the parent-protected Traits Lab in compact landscape and portrait profiles.');
} finally {
  await browser.close();
}
