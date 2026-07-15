function quoted(value) {
  return JSON.stringify(value);
}

function buttonCondition(text, exact = false) {
  return `(() => {
    const expected = ${quoted(text)};
    const exact = ${exact};
    return [...document.querySelectorAll('button')].some((candidate) => {
      const label = candidate.innerText?.trim() ?? '';
      const style = getComputedStyle(candidate);
      const rect = candidate.getBoundingClientRect();
      const visible = style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      return visible && !candidate.disabled && (exact ? label === expected : label.includes(expected));
    });
  })()`;
}

export async function waitForEnabledButton(page, text, exact = false) {
  await page.waitFor(buttonCondition(text, exact));
}

export async function clickButton(page, text, exact = false) {
  await waitForEnabledButton(page, text, exact);
  await page.evaluate(`(() => {
    const expected = ${quoted(text)};
    const exact = ${exact};
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const button = [...document.querySelectorAll('button')].find((candidate) => {
      const label = candidate.innerText?.trim() ?? '';
      return visible(candidate) && !candidate.disabled && (exact ? label === expected : label.includes(expected));
    });
    if (!button) throw new Error('Could not find enabled button: ' + expected);
    button.click();
    return true;
  })()`);
}

export async function clickEnabledSelector(page, selector) {
  const encodedSelector = quoted(selector);
  await page.waitFor(`(() => {
    const element = document.querySelector(${encodedSelector});
    if (!(element instanceof HTMLButtonElement)) return false;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return !element.disabled && style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  })()`);
  await page.evaluate(`(() => {
    const element = document.querySelector(${encodedSelector});
    if (!(element instanceof HTMLButtonElement) || element.disabled) {
      throw new Error('Could not find enabled button selector: ' + ${encodedSelector});
    }
    element.click();
    return true;
  })()`);
}

export async function setPalName(page, name) {
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

async function clickFriendTurn(page, selector) {
  await page.waitFor(`Boolean(document.querySelector('${selector}:not([disabled])'))`);
  await page.evaluate(`document.querySelector('${selector}:not([disabled])')?.click()`);
}

export async function completeLeafChase(page) {
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
    if (friendTurn) await page.evaluate("document.querySelector('.leaf-game-pal-right:not([disabled])')?.click()");
  }

  await clickButton(page, 'Remember This Chase');
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");
}

export async function completeStoneStacking(page) {
  const childChoices = ['wide stone', 'middle stone', 'small stone'];

  for (let index = 0; index < childChoices.length; index += 1) {
    await clickButton(page, childChoices[index], true);
    if (index < 2) await clickFriendTurn(page, '.stone-game-pal-right');
  }

  await clickButton(page, 'Place the Top Stone Together');
  await clickButton(page, 'Remember This Moment');
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");
}

export async function completeGardenGame(page) {
  for (let matchNumber = 1; matchNumber <= 4; matchNumber += 1) {
    await page.waitFor("Boolean(document.querySelector('.garden-target-guide .garden-bloom'))");
    await page.evaluate(`(() => {
      const target = document.querySelector('.garden-target-guide .garden-bloom');
      if (!target) throw new Error('Garden target bloom is missing.');
      const shape = [...target.classList].find((name) => name.startsWith('bloom-shape-'));
      const color = [...target.classList].find((name) => name.startsWith('bloom-color-'));
      const bed = [...document.querySelectorAll('.garden-bed')].find((candidate) => {
        const bloom = candidate.querySelector('.garden-bloom');
        return bloom?.classList.contains(shape) && bloom.classList.contains(color);
      });
      if (!bed) throw new Error('Matching garden bloom is missing.');
      bed.click();
      return true;
    })()`);
    await page.waitFor(`document.querySelector('.garden-progress')?.getAttribute('aria-label')?.startsWith('${matchNumber} of 4')`);

    const friendTurn = await page.evaluate("Boolean(document.querySelector('.garden-game-pal-right:not([disabled])'))");
    if (friendTurn) await page.evaluate("document.querySelector('.garden-game-pal-right:not([disabled])')?.click()");
  }

  await clickButton(page, 'Remember This Garden Game');
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");
}

export async function completeQuietVisit(page) {
  for (let index = 0; index < 2; index += 1) {
    await page.waitFor("Boolean(document.querySelector('.quiet-observation:not([disabled])'))");
    await page.evaluate("document.querySelector('.quiet-observation:not([disabled])')?.click()");
  }
  await clickButton(page, 'Carry This Quiet Moment Forward');
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");
}

export async function completeVillageHelping(page) {
  for (let index = 0; index < 3; index += 1) {
    await page.waitFor("Boolean(document.querySelector('.path-care-item:not([disabled])'))");
    await page.evaluate("document.querySelector('.path-care-item:not([disabled])')?.click()");
  }
  await clickButton(page, 'Leave the Path Better');
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");
}
