import { startHeadlessChrome } from './cdp-browser.mjs';

const baseUrl = process.env.VIEWPORT_BASE_URL ?? 'http://127.0.0.1:4173';
const origin = new URL(baseUrl).origin;

const profiles = [
  { name: 'compact-landscape', width: 800, height: 600 },
  { name: 'standard-landscape', width: 1024, height: 768 },
  { name: 'large-landscape', width: 1366, height: 1024 },
  { name: 'compact-portrait', width: 600, height: 800 },
  { name: 'standard-portrait', width: 768, height: 1024 }
];

function quoted(value) {
  return JSON.stringify(value);
}

function buttonCondition(text, exact = false) {
  return `(() => {
    const expected = ${quoted(text)};
    const exact = ${exact};
    return [...document.querySelectorAll('button')].some((candidate) => {
      const label = candidate.textContent?.replace(/\\s+/g, ' ').trim() ?? '';
      const style = getComputedStyle(candidate);
      const rect = candidate.getBoundingClientRect();
      const visible = style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      return visible && !candidate.disabled && (exact ? label === expected : label.includes(expected));
    });
  })()`;
}

async function waitForEnabledButton(page, text, exact = false) {
  await page.waitFor(buttonCondition(text, exact));
}

async function clickButton(page, text, exact = false) {
  await page.evaluate(`(() => {
    const expected = ${quoted(text)};
    const exact = ${exact};
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const button = [...document.querySelectorAll('button')].find((candidate) => {
      const label = candidate.textContent?.replace(/\\s+/g, ' ').trim() ?? '';
      return visible(candidate) && !candidate.disabled && (exact ? label === expected : label.includes(expected));
    });
    if (!button) throw new Error('Could not find enabled button: ' + expected);
    button.click();
    return true;
  })()`);
}

async function setPalName(page, name) {
  await page.evaluate(`(() => {
    const input = document.querySelector('input[aria-label="Pal name"]');
    if (!(input instanceof HTMLInputElement)) throw new Error('Pal name input is missing.');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    if (!setter) throw new Error('Could not set the Pal name.');
    setter.call(input, ${quoted(name)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
}

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

async function completeLeafChase(page) {
  for (let catchNumber = 1; catchNumber <= 5; catchNumber += 1) {
    await page.waitFor("document.querySelector('.leaf-target-guide')?.textContent?.trim().startsWith('Find the')");
    const target = await page.evaluate("document.querySelector('.leaf-target-guide')?.textContent?.trim().replace(/^Find the /, '')");
    await page.evaluate(`(() => {
      const expected = ${quoted('Catch the ')} + ${quoted(target)};
      const button = [...document.querySelectorAll('button')].find((candidate) => candidate.getAttribute('aria-label') === expected);
      if (!button) throw new Error('Could not find target leaf: ' + expected);
      button.click();
      return true;
    })()`);
    await page.waitFor(`document.querySelector('.leaf-catch-progress')?.getAttribute('aria-label')?.startsWith('${catchNumber} of 5')`);

    const friendTurn = await page.evaluate("Boolean(document.querySelector('.leaf-game-pal-right:not([disabled])'))");
    if (friendTurn) {
      await page.evaluate("document.querySelector('.leaf-game-pal-right:not([disabled])')?.click()");
    }
  }

  await waitForEnabledButton(page, 'Remember This Chase');
  await clickButton(page, 'Remember This Chase');
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

    await waitForEnabledButton(page, 'Stack Stones');
    await clickButton(page, 'Stack Stones');
    await page.waitFor("Boolean(document.querySelector('.stone-game-shell'))");
    await assertLayout(page, profile, 'stone-stacking');
    await clickButton(page, 'Return to Willowmere');
    await page.waitFor("Boolean(document.querySelector('.world-nav'))");

    await waitForEnabledButton(page, 'Garden Game');
    await clickButton(page, 'Garden Game');
    await page.waitFor("Boolean(document.querySelector('.garden-game-shell'))");
    await assertLayout(page, profile, 'garden-game');
    await clickButton(page, 'Return to Willowmere');
    await page.waitFor("Boolean(document.querySelector('.world-nav'))");

    await waitForEnabledButton(page, 'Chase Leaves');
    await clickButton(page, 'Chase Leaves');
    await page.waitFor("Boolean(document.querySelector('.leaf-game-shell'))");
    await assertLayout(page, profile, 'leaf-chase');
    await completeLeafChase(page);
    await assertLayout(page, profile, 'friendship-created');

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
  } finally {
    page.close();
  }
}

const browser = await startHeadlessChrome();
try {
  for (const profile of profiles) await runProfile(browser, profile);
  console.log(`Verified ${profiles.length} tablet viewport profiles.`);
} finally {
  await browser.close();
}
