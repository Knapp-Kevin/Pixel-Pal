import { startHeadlessChrome } from './cdp-browser.mjs';
import {
  clickButton,
  clickEnabledSelector,
  completeLeafChase,
  setPalName,
  waitForEnabledButton
} from './viewport-actions.mjs';

const baseUrl = process.env.VIEWPORT_BASE_URL ?? 'http://127.0.0.1:4173';
const origin = new URL(baseUrl).origin;

function quoted(value) {
  return JSON.stringify(value);
}

async function setInputValue(page, selector, value) {
  await page.evaluate(`(() => {
    const input = document.querySelector(${quoted(selector)});
    if (!(input instanceof HTMLInputElement)) throw new Error('Missing input: ' + ${quoted(selector)});
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    if (!setter) throw new Error('Could not update input: ' + ${quoted(selector)});
    setter.call(input, ${quoted(value)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
}

async function waitForSaved(page) {
  await page.waitFor("document.body.textContent?.includes('Saved. Your world will remember this.')");
}

async function createWorld(page, species, palLabel, name) {
  await page.waitFor("Boolean(document.querySelector('#first-pal-title'))");
  await clickButton(page, species, true);
  await page.waitFor(`document.querySelector('button[aria-pressed="true"]')?.innerText?.trim() === ${quoted(species)}`);
  await page.waitFor(`Boolean(document.querySelector('[aria-label*="a ${palLabel} Pal"]'))`);
  await setPalName(page, name);
  await clickButton(page, 'Meet my Pal');
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");
  await page.waitFor(`Boolean(document.querySelector('[aria-label*="a ${palLabel} Pal"]'))`);
  await waitForSaved(page);
}

async function openWorldChooser(page) {
  await clickButton(page, 'Worlds');
  await page.waitFor("Boolean(document.querySelector('.world-chooser-dialog'))");
}

async function readWorldCards(page) {
  return page.evaluate(`JSON.stringify([...document.querySelectorAll('.world-card')].map((card) => ({
    text: card.innerText?.trim(),
    selected: card.getAttribute('aria-pressed') === 'true'
  })))`);
}

async function assertWorldCards(page) {
  await openWorldChooser(page);
  const serialized = await readWorldCards(page);
  const cards = JSON.parse(serialized);
  const pip = cards.find((card) => card.text?.includes('Pip'));
  const moss = cards.find((card) => card.text?.includes('Moss'));

  if (!pip?.text?.includes('1 remembered moment')) {
    throw new Error(`Pip's saved memory was missing from the world chooser: ${serialized}`);
  }
  if (!moss?.text?.includes('0 remembered moments')) {
    throw new Error(`Moss's untouched world was not isolated: ${serialized}`);
  }
}

async function switchToWorld(page, firstPalName, palLabel) {
  await openWorldChooser(page);
  await clickButton(page, firstPalName);
  await page.waitFor(`Boolean(document.querySelector('[aria-label*="a ${palLabel} Pal"]'))`);
  await page.waitFor(`document.body.textContent?.includes(${quoted(firstPalName)})`);
}

async function unlockParentTools(page) {
  await page.evaluate("sessionStorage.setItem('pixel-pals-parent-unlocked', 'true')");
  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('[aria-label=\"Parent tools\"]'))");
}

async function exportCurrentWorld(page) {
  await clickButton(page, 'Export world backup');
  await page.waitFor("document.body.textContent?.includes('World backup exported.')");
}

async function verifyDeleteAuthorizationIsWorldScoped(page) {
  await setInputValue(page, '.reset-zone input', 'DELETE Moss');
  const disabledBeforeExport = await page.evaluate("document.querySelector('.dangerous-action')?.hasAttribute('disabled')");
  if (!disabledBeforeExport) throw new Error('A backup from another world unlocked Moss world deletion.');

  await exportCurrentWorld(page);
  await page.waitFor("!document.querySelector('.dangerous-action')?.hasAttribute('disabled')");
}

const browser = await startHeadlessChrome();
const page = await browser.newPage();

try {
  await page.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' });
  await page.navigate(baseUrl);

  await createWorld(page, 'Fox', 'fox', 'Pip');
  await clickButton(page, 'Chase Leaves');
  await page.waitFor("Boolean(document.querySelector('.leaf-game-shell'))");
  await completeLeafChase(page);
  await waitForSaved(page);
  await page.waitFor("document.body.textContent?.includes('1 remembered moment')");

  await unlockParentTools(page);
  await exportCurrentWorld(page);
  await clickButton(page, 'Begin another local world');
  await page.waitFor("Boolean(document.querySelector('#first-pal-title'))");
  await createWorld(page, 'Deer', 'deer', 'Moss');
  await page.waitFor("document.body.textContent?.includes('0 remembered moments')");

  await assertWorldCards(page);
  await clickButton(page, 'Close', true);

  await switchToWorld(page, 'Pip', 'fox');
  await page.waitFor("document.body.textContent?.includes('1 remembered moment')");
  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('[aria-label*=" + quoted('a fox Pal') + "]'))");
  await page.waitFor("document.body.textContent?.includes('1 remembered moment')");

  await switchToWorld(page, 'Moss', 'deer');
  await page.waitFor("document.body.textContent?.includes('0 remembered moments')");
  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('[aria-label*=" + quoted('a deer Pal') + "]'))");
  await page.waitFor("document.body.textContent?.includes('0 remembered moments')");

  await verifyDeleteAuthorizationIsWorldScoped(page);
  await clickEnabledSelector(page, '.dangerous-action');
  await page.waitFor("Boolean(document.querySelector('[aria-label*=" + quoted('a fox Pal') + "]'))");
  await page.waitFor("document.body.textContent?.includes('1 remembered moment')");

  const chooserStillPresent = await page.evaluate("Boolean(document.querySelector('.world-chooser-trigger'))");
  if (chooserStillPresent) throw new Error('The world chooser remained after only one local world was left.');

  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('[aria-label*=" + quoted('a fox Pal') + "]'))");
  await page.waitFor("document.body.textContent?.includes('1 remembered moment')");

  console.log('Verified isolated creation, switching, reload, backup authorization, and deletion for multiple local worlds.');
} finally {
  page.close();
  await browser.close();
}
