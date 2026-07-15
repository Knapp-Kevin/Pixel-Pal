import { readFile, stat } from 'node:fs/promises';
import { extname, isAbsolute, normalize, resolve } from 'node:path';

const manifestPath = resolve('art/production-manifest.json');
const releaseMode = process.argv.includes('--release');

const requiredAssetIds = new Set([
  'starter-fox-model-sheet',
  'starter-deer-model-sheet',
  'starter-rabbit-model-sheet',
  'starter-kitten-model-sheet',
  'starter-duckling-model-sheet',
  'fern-model-sheet',
  'starter-fox-living-world-atlas',
  'starter-deer-living-world-atlas',
  'starter-rabbit-living-world-atlas',
  'starter-kitten-living-world-atlas',
  'starter-duckling-living-world-atlas',
  'fern-living-world-atlas',
  'willowmere-village-scene-kit',
  'great-tree-clearing-scene-kit',
  'first-home-exterior-scene-kit',
  'first-home-interior-scene-kit',
  'leaf-chase-scene-kit',
  'stone-stacking-scene-kit',
  'garden-game-scene-kit',
  'first-meeting-storybook',
  'first-shared-activity-storybook',
  'friendship-ceremony-storybook',
  'home-personalization-storybook'
]);

const requiredViewportCrops = new Set([
  '800x600',
  '1024x768',
  '1366x1024',
  '600x800',
  '768x1024'
]);

const allowedCategories = new Set([
  'character-model-sheet',
  'living-world-character-atlas',
  'living-world-scene-kit',
  'activity-scene-kit',
  'storybook-illustration'
]);

const allowedFormats = new Set(['png', 'webp', 'avif']);
const requiredProvenanceFields = [
  'creator',
  'method',
  'ownershipBasis',
  'createdAt',
  'reviewer',
  'approvedAt'
];

function fail(message) {
  throw new Error(`Production art verification failed: ${message}`);
}

function requireNonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} must be a non-empty string.`);
}

function requirePositiveInteger(value, label) {
  if (!Number.isInteger(value) || value <= 0) fail(`${label} must be a positive integer.`);
}

function validateProvenance(provenance, assetId) {
  if (!provenance || typeof provenance !== 'object') fail(`${assetId} requires provenance metadata.`);
  for (const field of requiredProvenanceFields) {
    requireNonEmptyString(provenance[field], `${assetId}.provenance.${field}`);
  }
  if (!Array.isArray(provenance.sourceReferenceIds)) {
    fail(`${assetId}.provenance.sourceReferenceIds must be an array.`);
  }
}

function validateAssetPath(filePath, format, assetId) {
  requireNonEmptyString(filePath, `${assetId}.filePath`);
  if (isAbsolute(filePath) || normalize(filePath).startsWith('..')) {
    fail(`${assetId}.filePath must remain inside the repository.`);
  }
  if (!filePath.startsWith('art/production/')) {
    fail(`${assetId}.filePath must live under art/production/.`);
  }
  const extension = extname(filePath).slice(1).toLowerCase();
  if (extension !== format) fail(`${assetId}.filePath extension does not match its format.`);
}

async function validatePhysicalAsset(asset) {
  validateAssetPath(asset.filePath, asset.format, asset.id);
  const file = await stat(resolve(asset.filePath)).catch(() => null);
  if (!file?.isFile()) fail(`${asset.id} points to a missing file.`);
  if (file.size > asset.maxBytes) {
    fail(`${asset.id} is ${file.size} bytes, above its ${asset.maxBytes}-byte budget.`);
  }
  validateProvenance(asset.provenance, asset.id);
}

const raw = await readFile(manifestPath, 'utf8');
const manifest = JSON.parse(raw);

if (manifest.schemaVersion !== 1) fail('schemaVersion must be 1.');
if (manifest.product !== 'Pixel Pals') fail('product must be Pixel Pals.');
if (!Array.isArray(manifest.allowedStatuses) || !Array.isArray(manifest.assets)) {
  fail('allowedStatuses and assets must be arrays.');
}

const statuses = new Set(manifest.allowedStatuses);
for (const requiredStatus of ['planned', 'benchmark', 'approved', 'production']) {
  if (!statuses.has(requiredStatus)) fail(`allowedStatuses is missing ${requiredStatus}.`);
}

const viewportCrops = new Set(manifest.requiredViewportCrops ?? []);
for (const crop of requiredViewportCrops) {
  if (!viewportCrops.has(crop)) fail(`requiredViewportCrops is missing ${crop}.`);
}

for (const [name, value] of Object.entries(manifest.performanceBudgets ?? {})) {
  requirePositiveInteger(value, `performanceBudgets.${name}`);
}

const seenIds = new Set();
let plannedCount = 0;
let productionCount = 0;

for (const asset of manifest.assets) {
  requireNonEmptyString(asset.id, 'asset.id');
  requireNonEmptyString(asset.subject, `${asset.id}.subject`);
  requirePositiveInteger(asset.maxBytes, `${asset.id}.maxBytes`);

  if (seenIds.has(asset.id)) fail(`duplicate asset id ${asset.id}.`);
  seenIds.add(asset.id);

  if (!allowedCategories.has(asset.category)) fail(`${asset.id} has unsupported category ${asset.category}.`);
  if (!statuses.has(asset.status)) fail(`${asset.id} has unsupported status ${asset.status}.`);
  if (!allowedFormats.has(asset.format)) fail(`${asset.id} has unsupported format ${asset.format}.`);
  if (!Array.isArray(asset.requiredViews) || asset.requiredViews.length === 0) {
    fail(`${asset.id}.requiredViews must contain at least one entry.`);
  }

  if (asset.status === 'planned') {
    plannedCount += 1;
    if (asset.filePath !== null || asset.provenance !== null) {
      fail(`${asset.id} is planned and must not claim a file or provenance record yet.`);
    }
  } else {
    await validatePhysicalAsset(asset);
  }

  if (asset.status === 'production') productionCount += 1;
  if (releaseMode && asset.releaseRequired && asset.status !== 'production') {
    fail(`${asset.id} is release-required but is not in production state.`);
  }
}

for (const assetId of requiredAssetIds) {
  if (!seenIds.has(assetId)) fail(`required asset slot ${assetId} is missing.`);
}

if (releaseMode) {
  if (manifest.manifestStatus !== 'production-ready') fail('manifestStatus must be production-ready in release mode.');
  requireNonEmptyString(manifest.benchmarkFamily, 'benchmarkFamily');
}

console.log(
  `Production art manifest valid: ${manifest.assets.length} slots, ${plannedCount} planned, ${productionCount} production, mode=${releaseMode ? 'release' : 'planning'}.`
);
