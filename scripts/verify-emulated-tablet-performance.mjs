import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { startHeadlessChrome } from './cdp-browser.mjs';
import { clickButton, setPalName, waitForEnabledButton } from './viewport-actions.mjs';

const baseUrl = process.env.PERFORMANCE_BASE_URL ?? 'http://127.0.0.1:4173';
const origin = new URL(baseUrl).origin;
const outputDirectory = join(process.cwd(), 'artifacts', 'performance');
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const budgets = {
  coldLaunchMs: 5_000,
  worldCreationMs: 3_500,
  activityOpenMs: 2_000,
  offlineReloadMs: 5_000,
  heapGrowthBytes: 32 * 1024 * 1024
};

async function startPerformanceBrowser() {
  const failures = [];
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await startHeadlessChrome({ port: 9231 + attempt, startupTimeoutMs: 15_000 });
    } catch (error) {
      failures.push(error.message);
      if (attempt < 2) await delay(500);
    }
  }
  throw new Error(`Could not start Chrome for performance verification after 3 attempts: ${failures.join(' | ')}`);
}

async function setOldestTabletProfile(page) {
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 800,
    height: 600,
    deviceScaleFactor: 1,
    mobile: false,
    screenOrientation: { type: 'landscapePrimary', angle: 90 }
  });
  await page.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await page.send('Emulation.setCPUThrottlingRate', { rate: 4 });
}

async function heapUsed(page) {
  const result = await page.send('Performance.getMetrics');
  const metric = result.metrics.find((candidate) => candidate.name === 'JSHeapUsedSize');
  if (!metric) throw new Error('Chrome did not report JSHeapUsedSize.');
  return metric.value;
}

async function timed(action) {
  const started = performance.now();
  await action();
  return Math.round(performance.now() - started);
}

function assertBudget(name, value, budget) {
  if (value > budget) {
    throw new Error(`${name} was ${value}, above the provisional budget ${budget}.`);
  }
}

await mkdir(outputDirectory, { recursive: true });
const browser = await startPerformanceBrowser();
const page = await browser.newPage();

try {
  await page.send('Performance.enable');
  await page.send('Network.enable');
  await setOldestTabletProfile(page);
  await page.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' });

  const coldLaunchMs = await timed(async () => {
    await page.navigate(baseUrl);
    await page.waitFor("Boolean(document.querySelector('#first-pal-title'))", 15_000);
  });
  const heapAfterLaunch = await heapUsed(page);

  await clickButton(page, 'Fox', true);
  await setPalName(page, 'Performance Pal');
  await waitForEnabledButton(page, 'Meet my Pal');
  const worldCreationMs = await timed(async () => {
    await clickButton(page, 'Meet my Pal');
    await page.waitFor("Boolean(document.querySelector('.world-nav'))", 15_000);
  });
  const heapAfterWorld = await heapUsed(page);

  await waitForEnabledButton(page, 'Stack Stones');
  const activityOpenMs = await timed(async () => {
    await clickButton(page, 'Stack Stones');
    await page.waitFor("Boolean(document.querySelector('.stone-game-shell'))", 10_000);
  });
  const heapAfterActivity = await heapUsed(page);
  await clickButton(page, 'Return to Willowmere');
  await page.waitFor("Boolean(document.querySelector('.world-nav'))");

  await page.evaluate('navigator.serviceWorker.ready.then(() => true)');
  await page.navigate(baseUrl);
  await page.waitFor("Boolean(document.querySelector('.world-nav'))", 15_000);
  await page.waitFor("Boolean(navigator.serviceWorker.controller)", 15_000);

  await page.send('Network.emulateNetworkConditions', {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
    connectionType: 'none'
  });
  const offlineReloadMs = await timed(async () => {
    await page.navigate(baseUrl);
    await page.waitFor("Boolean(document.querySelector('.world-nav'))", 15_000);
  });
  await page.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
    connectionType: 'wifi'
  });

  const heapAfterOfflineReload = await heapUsed(page);
  const heapGrowthBytes = Math.max(0, heapAfterOfflineReload - heapAfterLaunch);
  const imageResources = await page.evaluate(`JSON.stringify(
    performance.getEntriesByType('resource')
      .filter((entry) => entry.initiatorType === 'img')
      .map((entry) => ({ name: entry.name, duration: Math.round(entry.duration), transferSize: entry.transferSize }))
  )`);

  const result = {
    generatedAt: new Date().toISOString(),
    profile: {
      viewport: '800x600',
      cpuThrottlingRate: 4,
      touchPoints: 5,
      evidenceClass: 'emulated-oldest-tablet'
    },
    budgets,
    measurements: {
      coldLaunchMs,
      worldCreationMs,
      activityOpenMs,
      offlineReloadMs,
      heapAfterLaunch,
      heapAfterWorld,
      heapAfterActivity,
      heapAfterOfflineReload,
      heapGrowthBytes,
      imageResources: JSON.parse(imageResources)
    },
    limitations: [
      'This is CI browser emulation, not physical family-tablet evidence.',
      'Production image decode measurements remain incomplete while the production art registry is empty.',
      'Battery, thermal throttling, operating-system memory pressure, and long-session behavior require real hardware.'
    ]
  };

  assertBudget('coldLaunchMs', coldLaunchMs, budgets.coldLaunchMs);
  assertBudget('worldCreationMs', worldCreationMs, budgets.worldCreationMs);
  assertBudget('activityOpenMs', activityOpenMs, budgets.activityOpenMs);
  assertBudget('offlineReloadMs', offlineReloadMs, budgets.offlineReloadMs);
  assertBudget('heapGrowthBytes', heapGrowthBytes, budgets.heapGrowthBytes);

  await writeFile(join(outputDirectory, 'emulated-oldest-tablet.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(`Performance gate passed: cold=${coldLaunchMs}ms create=${worldCreationMs}ms activity=${activityOpenMs}ms offline=${offlineReloadMs}ms heapGrowth=${Math.round(heapGrowthBytes / 1024 / 1024)}MB.`);
} finally {
  await page.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
    connectionType: 'wifi'
  }).catch(() => undefined);
  page.close();
  await browser.close();
}
