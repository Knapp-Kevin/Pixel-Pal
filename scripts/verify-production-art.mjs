import { readFile, stat } from 'node:fs/promises';
import { extname, isAbsolute, normalize, resolve } from 'node:path';

const manifestPath = resolve('art/production-manifest.json');
const adventureManifestPath = resolve('art/adventure-production-manifest.json');
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
  'home-personalization-storybook',
  'lanterns-in-the-rain-adventure',
  'humming-bridge-adventure'
]);

const requiredAdventureViews = new Map([
  ['lanterns-in-the-rain-adventure', [
    ['rain-path', 'landscape'],
    ['rain-path', 'portrait'],
    ['lantern-colors', 'landscape'],
    ['lantern-colors', 'portrait'],
    ['welcoming-path', 'landscape'],
    ['welcoming-path', 'portrait']
  ]],
  ['humming-bridge-adventure', [
    ['bridge-listening', 'landscape'],
    ['bridge-listening', 'portrait'],
    ['bridge-patterns', 'landscape'],
    ['bridge-patterns', 'portrait'],
    ['bridge-gathering', 'landscape'],
    ['bridge-gathering', 'portrait']
  ]]
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
const allowedOrientations = new Set(['landscape', 'portrait']);
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

function requirePercentage(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
    fail(`${label} must be a percentage from 0 through 100.`);
  }
}

function validateProvenance(provenance, label) {
  if (!provenance || typeof provenance !== 'object') fail(`${label} requires provenance metadata.`);
  for (const field of requiredProvenanceFields) {
    requireNonEmptyString(provenance[field], `${label}.provenance.${field}`);
  }
  if (!Array.isArray(provenance.sourceReferenceIds)) {
    fail(`${label}.provenance.sourceReferenceIds must be an array.`);
  }
}

function validateAssetPath(filePath, format, label) {
  requireNonEmptyString(filePath, `${label}.filePath`);
  if (isAbsolute(filePath) || normalize(filePath).startsWith('..')) {
    fail(`${label}.filePath must remain inside the repository.`);
  }
  if (!filePath.startsWith('art/production/')) {
    fail(`${label}.filePath must live under art/production/.`);
  }
  const extension = extname(filePath).slice(1).toLowerCase();
  if (extension !== format) fail(`${label}.filePath extension does not match its format.`);
}

async function validatePhysicalFile(record, label) {
  validateAssetPath(record.filePath, record.format, label);
  const file = await stat(resolve(record.filePath)).catch(() => null);
  if (!file?.isFile()) fail(`${label} points to a missing file.`);
  if (file.size > record.maxBytes) {
    fail(`${label} is ${file.size} bytes, above its ${record.maxBytes}-byte budget.`);
  }
  validateProvenance(record.provenance, label);
}

function validatePlannedFile(record, label) {
  if (record.filePath !== null || record.provenance !== null) {
    fail(`${label} is planned and must not claim a file or provenance record yet.`);
  }
}

function validateSafeArea(area, label) {
  if (!area || typeof area !== 'object') fail(`${label} must be an object.`);
  for (const field of ['leftPercent', 'rightPercent', 'bottomPercent', 'heightPercent']) {
    requirePercentage(area[field], `${label}.${field}`);
  }
  if (area.leftPercent + area.rightPercent >= 100) fail(`${label} leaves no usable horizontal area.`);
  if (area.bottomPercent + area.heightPercent > 100) fail(`${label} extends beyond the image height.`);
}

const raw = await readFile(manifestPath, 'utf8');
const manifest = JSON.parse(raw);
const adventureRaw = await readFile(adventureManifestPath, 'utf8');
const adventureManifest = JSON.parse(adventureRaw);

if (manifest.schemaVersion !== 1) fail('production-manifest.json schemaVersion must be 1.');
if (manifest.product !== 'Pixel Pals') fail('product must be Pixel Pals.');
if (!Array.isArray(manifest.allowedStatuses) || !Array.isArray(manifest.assets)) {
  fail('allowedStatuses and assets must be arrays.');
}
if (adventureManifest.schemaVersion !== 2 || adventureManifest.product !== 'Pixel Pals' || !Array.isArray(adventureManifest.assets)) {
  fail('adventure-production-manifest.json must be a Pixel Pals schemaVersion 2 responsive asset supplement.');
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

const compositionContract = adventureManifest.compositionContract;
if (compositionContract?.mode !== 'environment-with-live-pal-overlay') {
  fail('adventure composition mode must preserve live Pal overlays.');
}
if (compositionContract.charactersBakedIntoScene !== false) {
  fail('adventure environments must not bake a fixed starter Pal or Fern into scene art.');
}
for (const role of ['first-pal', 'first-neighbor']) {
  if (!compositionContract.requiredLivePalRoles?.includes(role)) {
    fail(`adventure composition contract is missing live role ${role}.`);
  }
}
validateSafeArea(compositionContract.landscapeCharacterSafeArea, 'compositionContract.landscapeCharacterSafeArea');
validateSafeArea(compositionContract.portraitCharacterSafeArea, 'compositionContract.portraitCharacterSafeArea');

const seenIds = new Set();
let plannedCount = 0;
let productionCount = 0;
let adventureViewCount = 0;

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
    validatePlannedFile(asset, asset.id);
  } else {
    await validatePhysicalFile(asset, asset.id);
  }

  if (asset.status === 'production') productionCount += 1;
  if (releaseMode && asset.releaseRequired && asset.status !== 'production') {
    fail(`${asset.id} is release-required but is not in production state.`);
  }
}

for (const asset of adventureManifest.assets) {
  requireNonEmptyString(asset.id, 'adventure asset.id');
  requireNonEmptyString(asset.subject, `${asset.id}.subject`);
  requireNonEmptyString(asset.sceneId, `${asset.id}.sceneId`);

  if (seenIds.has(asset.id)) fail(`duplicate asset id ${asset.id}.`);
  seenIds.add(asset.id);

  if (asset.category !== 'storybook-illustration') fail(`${asset.id} must be a storybook illustration.`);
  if (asset.compositionMode !== 'environment-with-live-pal-overlay') {
    fail(`${asset.id} must use environment-with-live-pal-overlay composition.`);
  }
  for (const role of ['first-pal', 'first-neighbor']) {
    if (!asset.livePalRoles?.includes(role)) fail(`${asset.id} is missing live Pal role ${role}.`);
  }
  if (asset.accessibility?.reducedMotion !== 'static-compatible') {
    fail(`${asset.id} must preserve meaning as a static reduced-motion scene.`);
  }
  if (asset.accessibility?.colorOnlyCommunication !== false) {
    fail(`${asset.id} must not rely on color alone.`);
  }
  if (!Array.isArray(asset.views) || asset.views.length === 0) fail(`${asset.id}.views must be a non-empty array.`);

  const seenViews = new Set();
  for (const view of asset.views) {
    const label = `${asset.id}.views.${view.id}`;
    requireNonEmptyString(view.id, `${asset.id}.view.id`);
    requireNonEmptyString(view.variant, `${label}.variant`);
    requireNonEmptyString(view.objectPosition, `${label}.objectPosition`);
    requirePositiveInteger(view.maxBytes, `${label}.maxBytes`);
    requirePositiveInteger(view.width, `${label}.width`);
    requirePositiveInteger(view.height, `${label}.height`);

    if (seenViews.has(view.id)) fail(`${asset.id} contains duplicate view id ${view.id}.`);
    seenViews.add(view.id);
    if (!allowedOrientations.has(view.orientation)) fail(`${label} has unsupported orientation ${view.orientation}.`);
    if (!statuses.has(view.status)) fail(`${label} has unsupported status ${view.status}.`);
    if (!allowedFormats.has(view.format)) fail(`${label} has unsupported format ${view.format}.`);
    if (view.orientation === 'landscape' && view.width <= view.height) fail(`${label} must be wider than it is tall.`);
    if (view.orientation === 'portrait' && view.height <= view.width) fail(`${label} must be taller than it is wide.`);

    if (view.status === 'planned') {
      plannedCount += 1;
      validatePlannedFile(view, label);
    } else {
      await validatePhysicalFile(view, label);
    }
    if (view.status === 'production') productionCount += 1;
    if (releaseMode && asset.releaseRequired && view.status !== 'production') {
      fail(`${label} is release-required but is not in production state.`);
    }
    adventureViewCount += 1;
  }

  const requiredViews = requiredAdventureViews.get(asset.id);
  if (!requiredViews) fail(`${asset.id} is not a recognized required adventure package.`);
  for (const [variant, orientation] of requiredViews) {
    const match = asset.views.find((view) => view.variant === variant && view.orientation === orientation);
    if (!match) fail(`${asset.id} is missing ${variant} ${orientation}.`);
  }
}

for (const assetId of requiredAssetIds) {
  if (!seenIds.has(assetId)) fail(`required asset slot ${assetId} is missing.`);
}

if (releaseMode) {
  if (manifest.manifestStatus !== 'production-ready') fail('manifestStatus must be production-ready in release mode.');
  if (adventureManifest.manifestStatus !== 'production-ready') fail('adventure manifest must be production-ready in release mode.');
  requireNonEmptyString(manifest.benchmarkFamily, 'manifest.benchmarkFamily');
}

console.log(
  `Production art manifests valid: ${seenIds.size} packages, ${adventureViewCount} adventure views, ${plannedCount} planned, ${productionCount} production, mode=${releaseMode ? 'release' : 'planning'}.`
);
