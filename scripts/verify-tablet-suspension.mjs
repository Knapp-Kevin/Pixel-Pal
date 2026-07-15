import { startHeadlessChrome } from './cdp-browser.mjs';
import {
  clickButton,
  completeStoneStacking,
  completeVillageHelping,
  setPalName,
  waitForEnabledButton
} from './viewport-actions.mjs';
import {
  verifyIncompleteHelpingSuspension,
  verifyIncompleteStoneSuspension,
  verifySavedSummarySuspension
} from './viewport-lifecycle-actions.mjs';

const baseUrl = process.env.VIEWPORT_BASE_URL ?? 'http://127.0.0.1:4173';
const origin = new URL(baseUrl).origin;

async function setTabletViewport(page) {
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 800,
    height: 600,
    deviceScaleFactor: 1,
    mobile: false,
    screenOrientation: { type: 'landscapePrimary', angle: 90 }
  });
  await page.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
}

async function invitationLabels(page) {
  return page.evaluate(`JSON.stringify([...document.querySelectorAll('.day-invitation-card')].map((card) => ({
    kind: card.getAttribute('data-invitation-kind'),
    activity: card.getAttribute('data-activity-id'),
    label: card.innerText?.trim()
  })))`);
}

async function createWorld(page) {
  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('#first-pal-title'))");
  await clickButton(page, 'Fox', true);
  await setPalName(page, 'Resume-Pal');
  await clickButton(page, 'Meet my Pal');
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");
}

async function verifyInitialActivityBoundary(page) {
  await clickButton(page, 'Stack Stones');
  await verifyIncompleteStoneSuspension(page);

  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");
  await waitForEnabledButton(page, 'Stack Stones');
  const historyWasInvented = await page.evaluate("document.body.textContent?.includes('Visit the Great Tree')");
  if (historyWasInvented) throw new Error('Reloading an unfinished first activity invented a completed friendship.');

  await clickButton(page, 'Stack Stones');
  await completeStoneStacking(page);
  await waitForEnabledButton(page, 'Visit the Great Tree');
  await clickButton(page, 'Visit the Great Tree');
  await waitForEnabledButton(page, 'Home', true);
  await clickButton(page, 'Home', true);
  await waitForEnabledButton(page, 'Go inside');
  await clickButton(page, 'Go inside');
  await waitForEnabledButton(page, 'Window Cushion');
  await clickButton(page, 'Window Cushion');
  await waitForEnabledButton(page, 'Village', true);
}

async function verifyRepeatableInvitationBoundary(page) {
  await clickButton(page, 'Village', true);
  await clickButton(page, 'See What Willowmere Offers');
  await page.waitFor("Boolean(document.querySelector('.day-invitation-grid'))");
  const beforePartialScene = await invitationLabels(page);

  await clickButton(page, 'Care for Willowmere');
  await page.waitFor("Boolean(document.querySelector('.helping-scene-shell'))");
  await verifyIncompleteHelpingSuspension(page);

  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('.day-invitation-grid'))");
  const afterProcessReload = await invitationLabels(page);
  if (afterProcessReload !== beforePartialScene) {
    throw new Error('Reloading an unfinished invitation changed the offered world day.');
  }

  await clickButton(page, 'Care for Willowmere');
  await page.waitFor("Boolean(document.querySelector('.helping-scene-shell'))");
  await completeVillageHelping(page);
  await waitForEnabledButton(page, 'See What Willowmere Offers');
  await verifySavedSummarySuspension(page, 1);

  await page.navigate(baseUrl);
  await page.waitFor("document.body.textContent?.includes('Day 1 in Willowmere')");
  await waitForEnabledButton(page, 'See What Willowmere Offers');
  const persistedDay = await page.evaluate("document.body.textContent?.includes('Day 1 in Willowmere')");
  if (!persistedDay) throw new Error('A completed saved world day was lost after process-style reload.');
}

const browser = await startHeadlessChrome({ port: 9223 });
try {
  const page = await browser.newPage();
  try {
    await setTabletViewport(page);
    await page.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' });
    await createWorld(page);
    await verifyInitialActivityBoundary(page);
    await verifyRepeatableInvitationBoundary(page);
    console.log('Verified tablet freeze, resume, unfinished-scene reload, and saved-world recovery boundaries.');
  } finally {
    page.close();
  }
} finally {
  await browser.close();
}
