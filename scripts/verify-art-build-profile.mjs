import { startHeadlessChrome } from './cdp-browser.mjs';

const baseUrl = process.env.VIEWPORT_BASE_URL ?? 'http://127.0.0.1:4173';
const expectedMode = process.env.EXPECTED_ART_MODE;
const expectedFallback = process.env.EXPECTED_ART_FALLBACK;
const expectedMinimumStatus = process.env.EXPECTED_ART_MINIMUM_STATUS;

if (!expectedMode || !expectedFallback || !expectedMinimumStatus) {
  throw new Error('EXPECTED_ART_MODE, EXPECTED_ART_FALLBACK, and EXPECTED_ART_MINIMUM_STATUS are required.');
}

const browser = await startHeadlessChrome();
const page = await browser.newPage();

try {
  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.documentElement.dataset.pixelPalsArtMode)");
  const profile = JSON.parse(await page.evaluate(`JSON.stringify({
    mode: document.documentElement.dataset.pixelPalsArtMode,
    fallback: document.documentElement.dataset.pixelPalsArtFallback,
    minimumStatus: document.documentElement.dataset.pixelPalsArtMinimumStatus,
    releaseBlocked: Boolean(document.querySelector('[data-production-art-release-blocked="true"]')),
    creationVisible: Boolean(document.querySelector('#first-pal-title'))
  })`));

  const failures = [];
  if (profile.mode !== expectedMode) failures.push(`mode ${profile.mode}`);
  if (profile.fallback !== expectedFallback) failures.push(`fallback ${profile.fallback}`);
  if (profile.minimumStatus !== expectedMinimumStatus) failures.push(`minimum status ${profile.minimumStatus}`);
  if (expectedFallback === 'alpha' && profile.releaseBlocked) failures.push('release boundary remained active');
  if (expectedFallback === 'alpha' && !profile.creationVisible) failures.push('creation route remained hidden');
  if (expectedFallback === 'block' && !profile.releaseBlocked) failures.push('release boundary was not active');

  if (failures.length > 0) {
    throw new Error(`Art build profile mismatch: ${failures.join('; ')}. Compiled profile: ${JSON.stringify(profile)}`);
  }

  console.log(`PASS art build profile: ${profile.mode}, ${profile.fallback} fallback, ${profile.minimumStatus} minimum status.`);
} finally {
  page.close();
  await browser.close();
}
