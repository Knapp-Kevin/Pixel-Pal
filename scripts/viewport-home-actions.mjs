import { clickButton, waitForEnabledButton } from './viewport-actions.mjs';

export async function completeHomeVisit(page) {
  for (let index = 0; index < 2; index += 1) {
    await page.waitFor("Boolean(document.querySelector('.home-day-action:not([disabled])'))");
    await page.evaluate("document.querySelector('.home-day-action:not([disabled])')?.click()");
  }
  await waitForEnabledButton(page, 'Let Home Remember This');
  await clickButton(page, 'Let Home Remember This');
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");
}
