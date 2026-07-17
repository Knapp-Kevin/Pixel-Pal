import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDirectory = resolve('artifacts/art-parity');
const enforceProduction = process.argv.includes('--enforce-production');

function fail(message) {
  throw new Error(`Art parity report failed: ${message}`);
}

function countStatuses(records) {
  const counts = { planned: 0, benchmark: 0, approved: 0, production: 0 };
  for (const record of records) {
    if (!(record.status in counts)) fail(`Unsupported art status ${record.status}.`);
    counts[record.status] += 1;
  }
  return counts;
}

const productionManifest = JSON.parse(await readFile(resolve('art/production-manifest.json'), 'utf8'));
const adventureManifest = JSON.parse(await readFile(resolve('art/adventure-production-manifest.json'), 'utf8'));
const registrySource = await readFile(resolve('apps/tablet/src/generatedProductionArtRegistry.ts'), 'utf8');

if (productionManifest.product !== 'Pixel Pals' || adventureManifest.product !== 'Pixel Pals') {
  fail('Both manifests must belong to Pixel Pals.');
}

const coreAssets = productionManifest.assets.map((asset) => ({
  id: asset.id,
  subject: asset.subject,
  category: asset.category,
  releaseRequired: asset.releaseRequired === true,
  status: asset.status,
  scope: 'core'
}));
const adventureViews = adventureManifest.assets.flatMap((asset) => asset.views.map((view) => ({
  id: `${asset.id}:${view.variant}:${view.orientation}`,
  subject: `${asset.subject}: ${view.variant} ${view.orientation}`,
  category: asset.category,
  releaseRequired: asset.releaseRequired === true,
  status: view.status,
  scope: 'adventure',
  assetId: asset.id,
  variant: view.variant,
  orientation: view.orientation
})));
const allRecords = [...coreAssets, ...adventureViews];
const releaseRecords = allRecords.filter((record) => record.releaseRequired);
const blockers = releaseRecords.filter((record) => record.status !== 'production');
const approvedNotProduction = releaseRecords.filter((record) => record.status === 'approved');
const benchmarkCandidates = releaseRecords.filter((record) => record.status === 'benchmark');
const planned = releaseRecords.filter((record) => record.status === 'planned');

const palSection = registrySource.match(/palAssets:\s*\[(.*?)\],\s*sceneAssets:/s)?.[1] ?? '';
const sceneSection = registrySource.match(/sceneAssets:\s*\[(.*)\]\s*};/s)?.[1] ?? '';
const registryPalAssets = (palSection.match(/\bid:\s*/g) ?? []).length;
const registrySceneAssets = (sceneSection.match(/\bid:\s*/g) ?? []).length;

const categorySummary = Object.fromEntries(
  [...new Set(releaseRecords.map((record) => record.category))]
    .sort()
    .map((category) => {
      const records = releaseRecords.filter((record) => record.category === category);
      return [category, {
        total: records.length,
        production: records.filter((record) => record.status === 'production').length,
        blockers: records.filter((record) => record.status !== 'production').length
      }];
    })
);

const summary = {
  generatedAt: new Date().toISOString(),
  product: 'Pixel Pals',
  releaseReady: blockers.length === 0,
  manifestStatus: {
    core: productionManifest.manifestStatus,
    adventures: adventureManifest.manifestStatus
  },
  counts: {
    all: countStatuses(allRecords),
    releaseRequired: countStatuses(releaseRecords),
    releaseBlockers: blockers.length,
    approvedNotProduction: approvedNotProduction.length,
    benchmarkCandidates: benchmarkCandidates.length,
    planned: planned.length
  },
  registry: {
    palAssets: registryPalAssets,
    sceneAssets: registrySceneAssets,
    alphaPalFallbackStillRequired: registryPalAssets === 0
  },
  categorySummary,
  releaseBlockers: blockers,
  immediatePriority: [
    'Canonical Fern and starter Pal model sheets',
    'Living-world Pal atlases for five starter species and Fern',
    'Willowmere, Great Tree, first-home, and activity scene kits',
    'First-session storybook illustrations',
    'Complete responsive art for both adventures'
  ]
};

const markdown = [
  '# Pixel Pals Art Parity Report',
  '',
  `Generated: ${summary.generatedAt}`,
  '',
  `Release ready: ${summary.releaseReady ? 'yes' : 'no'}`,
  `Release-blocking records: ${blockers.length}`,
  `Runtime Pal assets: ${registryPalAssets}`,
  `Runtime scene assets: ${registrySceneAssets}`,
  '',
  '## Status counts',
  '',
  `- Planned: ${summary.counts.releaseRequired.planned}`,
  `- Benchmark: ${summary.counts.releaseRequired.benchmark}`,
  `- Approved: ${summary.counts.releaseRequired.approved}`,
  `- Production: ${summary.counts.releaseRequired.production}`,
  '',
  '## Category coverage',
  '',
  ...Object.entries(categorySummary).map(([category, value]) =>
    `- ${category}: ${value.production}/${value.total} production, ${value.blockers} blocking`
  ),
  '',
  '## Immediate priority',
  '',
  ...summary.immediatePriority.map((item) => `1. ${item}`),
  '',
  '## Release blockers',
  '',
  ...(blockers.length === 0
    ? ['None.']
    : blockers.map((record) => `- ${record.id} | ${record.status} | ${record.subject}`)),
  ''
].join('\n');

await mkdir(outputDirectory, { recursive: true });
await writeFile(resolve(outputDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(resolve(outputDirectory, 'ART_PARITY.md'), markdown, 'utf8');

console.log(`Art parity: ${summary.counts.releaseRequired.production}/${releaseRecords.length} release records in production; ${blockers.length} blockers.`);
console.log(`Runtime registry: ${registryPalAssets} Pal assets, ${registrySceneAssets} scene assets.`);

if (enforceProduction && blockers.length > 0) {
  fail(`${blockers.length} release-required art records are not production.`);
}
