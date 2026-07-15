const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function freezeAndResume(page, snapshotExpression, label) {
  const before = await page.evaluate(snapshotExpression);
  await page.send('Page.setWebLifecycleState', { state: 'frozen' });
  await delay(160);
  await page.send('Page.setWebLifecycleState', { state: 'active' });
  await delay(80);
  const after = await page.evaluate(snapshotExpression);

  if (JSON.stringify(after) !== JSON.stringify(before)) {
    throw new Error(`${label} changed across freeze and resume: ${JSON.stringify({ before, after })}`);
  }
}

export async function verifyIncompleteStoneSuspension(page) {
  const snapshot = `(() => ({
    variant: document.querySelector('.stone-game-shell')?.getAttribute('data-stone-variant'),
    count: document.querySelector('.tower-count')?.textContent?.trim(),
    friendTurn: !document.querySelector('.stone-game-pal-right')?.hasAttribute('disabled')
  }))()`;

  await page.waitFor("Boolean(document.querySelector('.stone-game-shell'))");
  await page.waitFor("Boolean(document.querySelector('.loose-stone-button[data-target-match=\"true\"]:not([disabled])'))");
  await page.evaluate("document.querySelector('.loose-stone-button[data-target-match=\"true\"]:not([disabled])')?.click()");
  await page.waitFor("document.querySelector('.tower-count')?.textContent?.trim() === '2 stones'");
  await freezeAndResume(page, snapshot, 'Incomplete Stone Stacking state');
}

export async function verifyIncompleteHelpingSuspension(page) {
  const snapshot = `(() => ({
    cleared: document.querySelectorAll('.path-care-item.cleared').length,
    available: document.querySelectorAll('.path-care-item:not([disabled])').length,
    title: document.querySelector('.day-scene-header h1')?.textContent?.trim()
  }))()`;

  await page.waitFor("Boolean(document.querySelector('.path-care-item:not([disabled])'))");
  await page.evaluate("document.querySelector('.path-care-item:not([disabled])')?.click()");
  await page.waitFor("document.querySelectorAll('.path-care-item.cleared').length === 1");
  await freezeAndResume(page, snapshot, 'Incomplete helping state');
}

export async function verifySavedSummarySuspension(page, day) {
  const snapshot = `(() => ({
    summaryVisible: document.body.textContent?.includes('Day ${day} in Willowmere'),
    openNextDay: [...document.querySelectorAll('button')].some((button) => button.innerText?.includes('See What Willowmere Offers') && !button.disabled)
  }))()`;
  await freezeAndResume(page, snapshot, `Saved day ${day} summary`);
}
