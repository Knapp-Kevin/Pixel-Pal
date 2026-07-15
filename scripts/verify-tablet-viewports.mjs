import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { startHeadlessChrome } from './cdp-browser.mjs';
import {
  clickButton,
  completeGardenGame,
  completeLeafChase,
  completeStoneStacking,
  setPalName,
  waitForEnabledButton
} from './viewport-actions.mjs';

const baseUrl = process.env.VIEWPORT_BASE_URL ?? 'http://127.0.0.1:4173';
const origin = new URL(baseUrl).origin;
const screenshotDirectory = join(process.cwd(), 'artifacts', 'tablet-viewports');

const profiles = [
  { name: 'compact-landscape', width: 800, height: 600, completion: 'leaf-chase' },
  { name: 'standard-landscape', width: 1024, height: 768, completion: 'garden-game' },
  { name: 'large-landscape', width: 1366, height: 1024, completion: 'stone-stacking' },
  { name: 'compact-portrait', width: 600, height: 800, completion: 'leaf-chase' },
  { name: 'standard-portrait', width: 768, height: 1024, completion: 'garden-game' }
];

const activities = {
  'stone-stacking': {
    button: 'Stack Stones',
    selector: '.stone-game-shell',
    complete: completeStoneStacking
  },
  'garden-game': {
    button: 'Garden Game',
    selector: '.garden-game-shell',
    complete: completeGardenGame
  },
  'leaf-chase': {
    button: 'Chase Leaves',
    selector: '.leaf-game-shell',
    complete: completeLeafChase
  }
};

async function setViewport(page, width, height) {
  await page.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
    screenOrientation: {
      type: width >= height ? 'landscapePrimary' : 'portraitPrimary',
      angle: width >= height ? 90 : 0
    }
  });
  await page.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
}

async function captureScreenshot(page, profile, state) {
  const result = await page.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
    fromSurface: true
  });
  const fileName = `${profile.name}-${state}.png`;
  await writeFile(join(screenshotDirectory, fileName), Buffer.from(result.data, 'base64'));
}

async function assertLayout(page, profile, state) {
  const snapshot = await page.evaluate(`(() => {
    const documentWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const shell = document.querySelector('.app-shell');
    const shellRect = shell?.getBoundingClientRect();
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const selectors = [
      '.world-nav button:not([disabled])',
      '.action-grid button:not([disabled])',
      '.inline-action:not([disabled])',
      'input:not([disabled])',
      '.leaf-finish-button',
      '.stone-finish-button',
      '.garden-finish-button'
    ].join(',');
    const controls = [...document.querySelectorAll(selectors)].filter(visible);
    const clippedControls = controls.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left < -1 || rect.top < -1 || rect.right > innerWidth + 1 || rect.bottom > innerHeight + 1;
    }).map((element) => element.textContent?.replace(/\\s+/g, ' ').trim() || element.getAttribute('aria-label'));
    const panels = [...document.querySelectorAll('.storybook-panel, .action-grid, .leaf-game-shell, .stone-game-shell, .garden-game-shell, .journal-shell')]
      .filter(visible)
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.top < -1 || rect.right > innerWidth + 1 || rect.bottom > innerHeight + 1;
      })
      .map((element) => element.className);
    return {
      documentWidth,
      documentHeight,
      scrollX,
      scrollY,
      shell: shellRect ? { left: shellRect.left, top: shellRect.top, right: shellRect.right, bottom: shellRect.bottom } : null,
      clippedControls,
      clippedPanels: panels
    };
  })()`);

  const failures = [];
  if (snapshot.documentWidth > profile.width + 1) failures.push(`document width ${snapshot.documentWidth}`);
  if (snapshot.documentHeight > profile.height + 1) failures.push(`document height ${snapshot.documentHeight}`);
  if (snapshot.scrollX !== 0 || snapshot.scrollY !== 0) failures.push(`window scroll ${snapshot.scrollX},${snapshot.scrollY}`);
  if (!snapshot.shell) failures.push('missing app shell');
  if (snapshot.shell && (snapshot.shell.left < -1 || snapshot.shell.top < -1 || snapshot.shell.right > profile.width + 1 || snapshot.shell.bottom > profile.height + 1)) {
    failures.push(`shell bounds ${JSON.stringify(snapshot.shell)}`);
  }
  if (snapshot.clippedControls.length) failures.push(`clipped controls: ${snapshot.clippedControls.join(' | ')}`);
  if (snapshot.clippedPanels.length) failures.push(`clipped panels: ${snapshot.clippedPanels.join(' | ')}`);

  if (failures.length) throw new Error(`${profile.name} ${state} failed: ${failures.join('; ')}`);
  console.log(`PASS ${profile.name}: ${state}`);
}

async function visitActivity(page, profile, activityId, complete) {
  const activity = activities[activityId];
  await waitForEnabledButton(page, activity.button);
  await clickButton(page, activity.button);
  await page.waitFor(`Boolean(document.querySelector('${activity.selector}'))`);
  await assertLayout(page, profile, activityId);

  if (complete) {
    await captureScreenshot(page, profile, activityId);
    await activity.complete(page);
    return;
  }

  await clickButton(page, 'Return to Willowmere');
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");
}

async function runProfile(browser, profile) {
  const page = await browser.newPage();
  try {
    await setViewport(page, profile.width, profile.height);
    await page.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' });
    await page.navigate(baseUrl);
    await page.waitFor("Boolean(document.querySelector('#first-pal-title'))");
    await assertLayout(page, profile, 'creation');
    await captureScreenshot(page, profile, 'creation');

    await clickButton(page, 'Fox', true);
    await setPalName(page, `Pip-${profile.width}`);
    await waitForEnabledButton(page, 'Meet my Pal');
    await clickButton(page, 'Meet my Pal');
    await page.waitFor("Boolean(document.querySelector('.world-nav'))");
    await assertLayout(page, profile, 'village');

    if (profile.name === 'standard-landscape') {
      await setViewport(page, 768, 1024);
      await assertLayout(page, { ...profile, width: 768, height: 1024 }, 'orientation-change-portrait');
      await setViewport(page, profile.width, profile.height);
      await assertLayout(page, profile, 'orientation-change-landscape');
    }

    for (const activityId of Object.keys(activities)) {
      await visitActivity(page, profile, activityId, activityId === profile.completion);
      if (activityId === profile.completion) break;
    }

    if (!documentedCompletionReached(profile.completion)) {
      throw new Error(`Unknown completion activity: ${profile.completion}`);
    }

    await page.waitFor("Boolean(document.querySelector('.world-nav'))");
    await assertLayout(page, profile, `friendship-created-${profile.completion}`);

    await waitForEnabledButton(page, 'Visit the Great Tree');
    await clickButton(page, 'Visit the Great Tree');
    await waitForEnabledButton(page, 'Home', true);
    await clickButton(page, 'Home', true);
    await page.waitFor("Boolean(document.querySelector('#home-title'))");
    await assertLayout(page, profile, 'home-exterior');

    await waitForEnabledButton(page, 'Go inside');
    await clickButton(page, 'Go inside');
    await page.waitFor(`Boolean(document.querySelector('[aria-label="Choose the first home object"]'))`);
    await assertLayout(page, profile, 'home-interior');
    await waitForEnabledButton(page, 'Window Cushion');
    await clickButton(page, 'Window Cushion');
    await page.waitFor("document.body.textContent?.includes('It Feels Like Home')");
    await assertLayout(page, profile, 'home-personalized');

    await waitForEnabledButton(page, 'Journal', true);
    await clickButton(page, 'Journal', true);
    await page.waitFor("Boolean(document.querySelector('.journal-shell'))");
    await assertLayout(page, profile, 'journal');
    await captureScreenshot(page, profile, 'journal');
  } finally {
    page.close();
  }
}

function documentedCompletionReached(activityId) {
  return Object.hasOwn(activities, activityId);
}

await rm(screenshotDirectory, { recursive: true, force: true });
await mkdir(screenshotDirectory, { recursive: true });

const browser = await startHeadlessChrome();
try {
  for (const profile of profiles) await runProfile(browser, profile);
  console.log(`Verified ${profiles.length} tablet viewport profiles with screenshots.`);
} finally {
  await browser.close();
}
