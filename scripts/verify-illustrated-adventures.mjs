import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { startHeadlessChrome } from './cdp-browser.mjs';
import { applyAccessibilityProfile, assertAccessibilityProfilePersisted } from './viewport-accessibility-actions.mjs';
import {
  clickButton,
  clickEnabledSelector,
  completeGardenGame,
  completeLeafChase,
  completeStoneStacking,
  setPalName,
  waitForEnabledButton
} from './viewport-actions.mjs';

const baseUrl = process.env.VIEWPORT_BASE_URL ?? 'http://127.0.0.1:4173';
const origin = new URL(baseUrl).origin;
const screenshotSubdirectory = process.env.ADVENTURE_SCREENSHOT_SUBDIR ?? 'tablet-viewports';
const screenshotDirectory = join(process.cwd(), 'artifacts', screenshotSubdirectory);
const expectedRainPathStatus = process.env.EXPECT_RAIN_PATH_ART_STATUS;
const expectRainPathFallback = process.env.EXPECT_RAIN_PATH_FALLBACK === 'true';
const rainPathAssetId = 'lanterns-in-the-rain-adventure-rain-path';

const profiles = [
  {
    name: 'compact-landscape', width: 800, height: 600, species: 'Fox', palLabel: 'fox', activity: 'leaf-chase', adventure: 'lanterns-in-the-rain',
    accessibility: { motion: 'system', textSize: 'standard', contrast: 'standard', emulateReducedMotion: true, expectReducedMotion: true }
  },
  {
    name: 'standard-landscape', width: 1024, height: 768, species: 'Deer', palLabel: 'deer', activity: 'garden-game', adventure: 'humming-bridge',
    accessibility: { motion: 'system', textSize: 'standard', contrast: 'strong', emulateReducedMotion: false, expectReducedMotion: false }
  },
  {
    name: 'large-landscape', width: 1366, height: 1024, species: 'Rabbit', palLabel: 'rabbit', activity: 'stone-stacking', adventure: 'lanterns-in-the-rain',
    accessibility: { motion: 'full', textSize: 'standard', contrast: 'standard', emulateReducedMotion: true, expectReducedMotion: false }
  },
  {
    name: 'compact-portrait', width: 600, height: 800, species: 'Kitten', palLabel: 'kitten', activity: 'leaf-chase', adventure: 'humming-bridge',
    accessibility: { motion: 'system', textSize: 'large', contrast: 'standard', emulateReducedMotion: false, expectReducedMotion: false }
  },
  {
    name: 'standard-portrait', width: 768, height: 1024, species: 'Duckling', palLabel: 'duckling', activity: 'garden-game', adventure: 'lanterns-in-the-rain',
    accessibility: { motion: 'reduced', textSize: 'large', contrast: 'strong', emulateReducedMotion: false, expectReducedMotion: true }
  }
];

const activities = {
  'leaf-chase': { button: 'Chase Leaves', selector: '.leaf-game-shell', complete: completeLeafChase },
  'stone-stacking': { button: 'Stack Stones', selector: '.stone-game-shell', complete: completeStoneStacking },
  'garden-game': { button: 'Garden Game', selector: '.garden-game-shell', complete: completeGardenGame }
};

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

async function assertLayout(page, profile, state) {
  const snapshot = await page.evaluate(`(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const controls = [...document.querySelectorAll('button:not([disabled]), input:not([disabled])')].filter(visible);
    const clippedControls = controls.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left < -1 || rect.top < -1 || rect.right > innerWidth + 1 || rect.bottom > innerHeight + 1;
    }).map((element) => element.innerText?.trim() || element.getAttribute('aria-label'));
    const panels = [...document.querySelectorAll('.adventure-library, .adventure-stage-shell, .adventure-completion-panel, .journal-shell, .storybook-panel')]
      .filter(visible)
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.top < -1 || rect.right > innerWidth + 1 || rect.bottom > innerHeight + 1;
      })
      .map((element) => element.className);
    return {
      width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
      scrollX,
      scrollY,
      clippedControls,
      clippedPanels: panels
    };
  })()`);

  const failures = [];
  if (snapshot.width > profile.width + 1) failures.push(`document width ${snapshot.width}`);
  if (snapshot.height > profile.height + 1) failures.push(`document height ${snapshot.height}`);
  if (snapshot.scrollX !== 0 || snapshot.scrollY !== 0) failures.push(`window scroll ${snapshot.scrollX},${snapshot.scrollY}`);
  if (snapshot.clippedControls.length) failures.push(`clipped controls: ${snapshot.clippedControls.join(' | ')}`);
  if (snapshot.clippedPanels.length) failures.push(`clipped panels: ${snapshot.clippedPanels.join(' | ')}`);
  if (failures.length) throw new Error(`${profile.name} ${state} failed: ${failures.join('; ')}`);
  console.log(`PASS ${profile.name}: ${state}`);
}

async function capture(page, profile, state) {
  await mkdir(screenshotDirectory, { recursive: true });
  const result = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: true });
  await writeFile(join(screenshotDirectory, `${profile.name}-${state}.png`), Buffer.from(result.data, 'base64'));
}

async function assertRainPathArt(page, profile) {
  if (profile.adventure !== 'lanterns-in-the-rain') return;
  const selector = `img[data-art-asset-id="${rainPathAssetId}"]`;

  if (expectedRainPathStatus) {
    await page.waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`);
    const snapshot = JSON.parse(await page.evaluate(`JSON.stringify((() => {
      const image = document.querySelector(${JSON.stringify(selector)});
      const picture = image?.closest('picture');
      return image ? {
        status: image.getAttribute('data-art-status'),
        currentSrc: image.currentSrc,
        responsiveId: picture?.getAttribute('data-responsive-art-asset-id') ?? null
      } : null;
    })())`));
    if (!snapshot) throw new Error(`${profile.name} did not render Rain Path benchmark art.`);
    if (snapshot.status !== expectedRainPathStatus) {
      throw new Error(`${profile.name} rendered Rain Path status ${snapshot.status}, expected ${expectedRainPathStatus}.`);
    }
    if (snapshot.responsiveId !== rainPathAssetId) {
      throw new Error(`${profile.name} did not render the responsive Rain Path picture contract.`);
    }
    const expectedFile = profile.width < profile.height ? 'rain-path-portrait.webp' : 'rain-path-landscape.webp';
    if (!snapshot.currentSrc.endsWith(expectedFile)) {
      throw new Error(`${profile.name} selected ${snapshot.currentSrc}, expected ${expectedFile}.`);
    }
    console.log(`PASS ${profile.name}: Rain Path ${expectedRainPathStatus} art selected ${expectedFile}`);
    return;
  }

  if (expectRainPathFallback) {
    const rendered = await page.evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`);
    if (rendered) throw new Error(`${profile.name} rendered benchmark Rain Path art in a production-only build.`);
    console.log(`PASS ${profile.name}: Rain Path benchmark remains excluded from production build`);
  }
}

async function prepareWorld(page, profile) {
  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('#first-pal-title'))");
  await applyAccessibilityProfile(page, baseUrl, profile);
  await clickButton(page, profile.species, true);
  await page.waitFor(`Boolean(document.querySelector('[aria-label*="a ${profile.palLabel} Pal"]'))`);
  await setPalName(page, `Adventure-${profile.palLabel}`);
  await clickButton(page, 'Meet my Pal');
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");

  const activity = activities[profile.activity];
  await clickButton(page, activity.button);
  await page.waitFor(`Boolean(document.querySelector('${activity.selector}'))`);
  await activity.complete(page);
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");

  await clickButton(page, 'Visit the Great Tree');
  await clickButton(page, 'Home', true);
  await clickButton(page, 'Go inside');
  await clickButton(page, 'Window Cushion');
  await page.waitFor("document.body.textContent?.includes('It Feels Like Home')");
}

async function openAdventure(page, profile) {
  await clickButton(page, 'Adventures', true);
  await page.waitFor("Boolean(document.querySelector('.adventure-library'))");
  await assertLayout(page, profile, 'adventure-library');
  await clickEnabledSelector(page, `[data-adventure-action="${profile.adventure}"]`);
  await page.waitFor(`document.querySelector('.adventure-stage-shell')?.getAttribute('data-adventure-id') === '${profile.adventure}'`);
  await assertRainPathArt(page, profile);
}

async function chooseCurrentStage(page, expectedStage) {
  await page.waitFor(`document.querySelector('.adventure-stage-shell')?.getAttribute('data-stage-index') === '${expectedStage}'`);
  await clickEnabledSelector(page, '.adventure-choice:not([disabled])');
}

async function completeAdventure(page, profile) {
  await openAdventure(page, profile);
  await assertLayout(page, profile, `${profile.adventure}-stage-1`);
  await capture(page, profile, `${profile.adventure}-stage-1`);
  await chooseCurrentStage(page, 0);
  await page.waitFor("document.querySelector('.adventure-stage-shell')?.getAttribute('data-stage-index') === '1'");

  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");
  await assertAccessibilityProfilePersisted(page, profile);
  await clickButton(page, 'Adventures', true);
  await clickEnabledSelector(page, `[data-adventure-action="${profile.adventure}"]`);
  await page.waitFor("document.querySelector('.adventure-stage-shell')?.getAttribute('data-stage-index') === '1'");
  await assertLayout(page, profile, `${profile.adventure}-resumed-stage-2`);

  await chooseCurrentStage(page, 1);
  await page.waitFor("document.querySelector('.adventure-stage-shell')?.getAttribute('data-stage-index') === '2'");
  await assertLayout(page, profile, `${profile.adventure}-stage-3`);
  await chooseCurrentStage(page, 2);
  await page.waitFor(`document.querySelector('.adventure-completion-panel')?.getAttribute('data-adventure-id') === '${profile.adventure}'`);
  await assertLayout(page, profile, `${profile.adventure}-completion`);
  await capture(page, profile, `${profile.adventure}-completion`);

  await clickButton(page, 'Return to Willowmere');
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");
  await clickButton(page, 'Village', true);
  const marker = profile.adventure === 'lanterns-in-the-rain' ? '.adventure-village-lanterns' : '.adventure-village-bridge';
  await page.waitFor(`Boolean(document.querySelector('${marker}'))`);
  await assertLayout(page, profile, `${profile.adventure}-village-change`);

  await clickButton(page, 'Journal', true);
  await page.waitFor("Boolean(document.querySelector('.journal-shell'))");
  const memoryTitle = profile.adventure === 'lanterns-in-the-rain' ? 'A Warm Path Through the Rain' : 'The Bridge Found Its Song';
  await page.waitFor(`document.body.textContent?.includes(${JSON.stringify(memoryTitle)})`);
  await assertLayout(page, profile, `${profile.adventure}-journal-memory`);
}

const browser = await startHeadlessChrome();
try {
  for (const profile of profiles) {
    const page = await browser.newPage();
    try {
      await setViewport(page, profile);
      await page.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' });
      await prepareWorld(page, profile);
      await completeAdventure(page, profile);
    } finally {
      page.close();
    }
  }
  console.log('Verified both illustrated adventures across five starter species, accessibility profiles, tablet viewports, and configured art status expectations.');
} finally {
  await browser.close();
}
