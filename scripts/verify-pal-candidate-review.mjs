import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { startHeadlessChrome } from './cdp-browser.mjs';

const baseUrl = process.env.PAL_REVIEW_BASE_URL ?? 'http://127.0.0.1:4177';
const output = resolve('artifacts/pal-candidate-review/screenshots');
const profiles = [
  { name: 'compact-landscape', width: 800, height: 600 },
  { name: 'compact-portrait', width: 600, height: 800 }
];

function fail(message) {
  throw new Error(`Pal candidate review verification failed: ${message}`);
}

await mkdir(output, { recursive: true });
const browser = await startHeadlessChrome({ port: 9237 });
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
      await page.navigate(`${baseUrl}/index.html`);
      await page.waitFor(`document.querySelectorAll('.pal-card').length === 5`);
      await page.waitFor(`Array.from(document.images).every((image) => image.complete)`);
      const evidence = await page.evaluate(`(() => {
        const cards = Array.from(document.querySelectorAll('.pal-card'));
        const stages = Array.from(document.querySelectorAll('.stage'));
        const images = Array.from(document.images);
        return {
          cardCount: cards.length,
          species: cards.map((card) => card.dataset.species),
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
          viewportWidth: innerWidth,
          viewportHeight: innerHeight,
          reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
          activeAnimations: Array.from(document.querySelectorAll('*')).filter((element) => {
            const style = getComputedStyle(element);
            return style.animationName !== 'none' || style.transitionDuration !== '0s';
          }).length,
          stageContainment: stages.every((stage) => {
            const rect = stage.getBoundingClientRect();
            return rect.left >= -1 && rect.right <= innerWidth + 1;
          }),
          decodedImages: images.map((image) => ({
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
            complete: image.complete
          }))
        };
      })()`);
      if (evidence.cardCount !== 5) fail(`${profile.name} rendered ${evidence.cardCount} Pal cards.`);
      if (evidence.species.join(',') !== 'fox,cat,dragon,bunny,bird') fail(`${profile.name} starter order drifted.`);
      if (evidence.horizontalOverflow || !evidence.stageContainment) fail(`${profile.name} overflows horizontally.`);
      if (!evidence.reducedMotion || evidence.activeAnimations !== 0) fail(`${profile.name} violates reduced-motion review.`);
      if (evidence.decodedImages.some((image) => image.complete && (image.naturalWidth === 0 || image.naturalHeight === 0))) {
        fail(`${profile.name} contains an undecodable candidate image.`);
      }
      const screenshot = await page.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false,
        fromSurface: true
      });
      await writeFile(resolve(output, `${profile.name}.png`), Buffer.from(screenshot.data, 'base64'));
      results.push({ profile: profile.name, ...evidence });
    } finally {
      page.close();
    }
  }
} finally {
  await browser.close();
}

await writeFile(
  resolve('artifacts/pal-candidate-review/browser-verification.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`,
  'utf8'
);
console.log(`Verified ${results.length} canonical Pal candidate viewports.`);
