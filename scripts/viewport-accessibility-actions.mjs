const SETTINGS_KEY = 'pixel-pals-accessibility-v1';

function quoted(value) {
  return JSON.stringify(value);
}

export async function applyAccessibilityProfile(page, baseUrl, profile) {
  const preference = profile.accessibility;
  await page.send('Emulation.setEmulatedMedia', {
    media: '',
    features: [{
      name: 'prefers-reduced-motion',
      value: preference.emulateReducedMotion ? 'reduce' : 'no-preference'
    }]
  });

  await page.evaluate(`localStorage.setItem(${quoted(SETTINGS_KEY)}, ${quoted(JSON.stringify({
    motion: preference.motion,
    textSize: preference.textSize,
    contrast: preference.contrast
  }))})`);
  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('#first-pal-title'))");
  await page.waitFor(`document.documentElement.dataset.motion === ${quoted(preference.motion)}
    && document.documentElement.dataset.textSize === ${quoted(preference.textSize)}
    && document.documentElement.dataset.contrast === ${quoted(preference.contrast)}`);

  const motionResult = await page.evaluate(`(() => {
    const probe = document.createElement('button');
    probe.style.transitionProperty = 'transform';
    probe.style.transitionDuration = '2s';
    probe.style.animationDuration = '2s';
    document.body.append(probe);
    const style = getComputedStyle(probe);
    const result = {
      transitionDuration: style.transitionDuration,
      animationDuration: style.animationDuration
    };
    probe.remove();
    return result;
  })()`);

  const reduced = motionResult.transitionDuration !== '2s' || motionResult.animationDuration !== '2s';
  if (reduced !== preference.expectReducedMotion) {
    throw new Error(`${profile.name} motion preference mismatch: ${JSON.stringify(motionResult)}`);
  }
}

export async function assertAccessibilityProfilePersisted(page, profile) {
  const expected = profile.accessibility;
  const actual = await page.evaluate(`(() => {
    const raw = localStorage.getItem(${quoted(SETTINGS_KEY)});
    return raw ? JSON.parse(raw) : null;
  })()`);

  if (!actual
    || actual.motion !== expected.motion
    || actual.textSize !== expected.textSize
    || actual.contrast !== expected.contrast) {
    throw new Error(`${profile.name} lost its accessibility preferences: ${JSON.stringify(actual)}`);
  }

  const root = await page.evaluate(`({
    motion: document.documentElement.dataset.motion,
    textSize: document.documentElement.dataset.textSize,
    contrast: document.documentElement.dataset.contrast
  })`);
  if (root.motion !== expected.motion || root.textSize !== expected.textSize || root.contrast !== expected.contrast) {
    throw new Error(`${profile.name} stopped applying accessibility preferences: ${JSON.stringify(root)}`);
  }
}
