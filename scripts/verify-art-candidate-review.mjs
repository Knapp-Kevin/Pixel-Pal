import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { startHeadlessChrome } from './cdp-browser.mjs';

const baseUrl = process.env.CANDIDATE_REVIEW_BASE_URL ?? 'http://127.0.0.1:4176';
const outputDirectory = resolve('artifacts/art-candidate-review/screenshots');

const profiles = [
  { name: 'compact-landscape', orientation: 'landscape', width: 800, height: 600 },
  { name: 'compact-portrait', orientation: 'portrait', width: 600, height: 800 }
];

function fail(message) {
  throw new Error(`Art candidate review verification failed: ${message}`);
}

await mkdir(outputDirectory, { recursive: true });
const browser = await startHeadlessChrome({ port: 9236 });
const results = [];

try {
  for (const profile of profiles) {
    const page = await browser.newPage();
    try {
      await page.send('Emulation.setDeviceMetricsOverride', {
        width: profile.width,
        height: profile.height,
        deviceScaleFactor: 1,
        mobile: false
      });
      await page.send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
      });
      await page.navigate(`${baseUrl}/index.html?orientation=${profile.orientation}`);
      await page.waitFor(`document.querySelectorAll('.review-card[data-orientation="${profile.orientation}"]').length === 1`);
      await page.waitFor(`Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0)`);

      const evidence = await page.evaluate(`(() => {
        const card = document.querySelector('.review-card[data-orientation="${profile.orientation}"]');
        const frame = card?.querySelector('.art-frame');
        const safeArea = card?.querySelector('.character-safe-area');
        const image = card?.querySelector('img');
        if (!card || !frame || !safeArea || !image) return { missing: true };
        const frameRect = frame.getBoundingClientRect();
        const safeRect = safeArea.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const expectedWidth = Number(card.dataset.expectedWidth);
        const expectedHeight = Number(card.dataset.expectedHeight);
        const animations = Array.from(document.querySelectorAll('*')).filter((element) => {
          const style = getComputedStyle(element);
          return style.animationName !== 'none' || style.transitionDuration !== '0s';
        }).length;
        return {
          missing: false,
          decision: card.dataset.decision,
          orientation: card.dataset.orientation,
          imageWidth: image.naturalWidth,
          imageHeight: image.naturalHeight,
          expectedWidth,
          expectedHeight,
          viewportWidth: innerWidth,
          viewportHeight: innerHeight,
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
          verticalOverflow: document.documentElement.scrollHeight > innerHeight + 1,
          cardContained:
            cardRect.left >= -1 &&
            cardRect.right <= innerWidth + 1 &&
            cardRect.top >= -1 &&
            cardRect.bottom <= innerHeight + 1,
          frameContained:
            frameRect.left >= -1 &&
            frameRect.right <= innerWidth + 1 &&
            frameRect.top >= -1 &&
            frameRect.bottom <= innerHeight + 1,
          safeAreaContained:
            safeRect.left >= frameRect.left - 1 &&
            safeRect.right <= frameRect.right + 1 &&
            safeRect.top >= frameRect.top - 1 &&
            safeRect.bottom <= frameRect.bottom + 1,
          reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
          activeAnimations: animations
        };
      })()`);

      if (evidence.missing) fail(`${profile.name} is missing candidate review elements.`);
      if (evidence.decision !== 'pending') fail(`${profile.name} decision must remain pending.`);
      if (evidence.orientation !== profile.orientation) fail(`${profile.name} loaded the wrong orientation.`);
      if (evidence.imageWidth <= 0 || evidence.imageHeight <= 0) fail(`${profile.name} image did not decode.`);
      if (evidence.imageWidth !== evidence.expectedWidth || evidence.imageHeight !== evidence.expectedHeight) {
        fail(`${profile.name} decoded ${evidence.imageWidth}x${evidence.imageHeight}, expected ${evidence.expectedWidth}x${evidence.expectedHeight}.`);
      }
      if (evidence.horizontalOverflow || evidence.verticalOverflow) fail(`${profile.name} overflows the review viewport.`);
      if (!evidence.cardContained || !evidence.frameContained) fail(`${profile.name} review card escapes the viewport.`);
      if (!evidence.safeAreaContained) fail(`${profile.name} safe area escapes the art frame.`);
      if (!evidence.reducedMotion || evidence.activeAnimations !== 0) fail(`${profile.name} does not respect reduced motion.`);

      const screenshot = await page.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false,
        fromSurface: true
      });
      await writeFile(resolve(outputDirectory, `${profile.name}.png`), Buffer.from(screenshot.data, 'base64'));
      results.push({ profile: profile.name, ...evidence });
    } finally {
      page.close();
    }
  }
} finally {
  await browser.close();
}

await writeFile(
  resolve('artifacts/art-candidate-review/browser-verification.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`,
  'utf8'
);
console.log(`Verified ${results.length} responsive art candidate review profiles.`);
