import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { extname, isAbsolute, normalize, resolve } from 'node:path';

const manifestPath = resolve('art/pal-runtime-manifest.json');
const releaseMode = process.argv.includes('--release');
const allowedStatuses = new Set(['planned', 'benchmark', 'approved', 'production']);
const allowedFormats = new Set(['png', 'webp', 'avif']);
const allowedSpecies = new Set(['fox', 'deer', 'rabbit', 'cat', 'duck']);
const allowedExpressions = new Set(['content', 'curious', 'delighted', 'uncertain', 'thoughtful']);
const allowedPoses = new Set(['standing', 'playful']);
const requiredIds = new Set([
  'starter-fox-idle-happy',
  'starter-fox-joyful-reaction',
  'starter-deer-idle-happy',
  'starter-deer-joyful-reaction',
  'starter-rabbit-idle-happy',
  'starter-rabbit-joyful-reaction',
  'starter-kitten-idle-happy',
  'starter-kitten-joyful-reaction',
  'starter-duckling-idle-happy',
  'starter-duckling-joyful-reaction',
  'fern-idle-happy',
  'fern-joyful-reaction'
]);

function fail(message) {
  throw new Error(`Pal runtime art verification failed: ${message}`);
}

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} must be a non-empty string.`);
}

function requirePositiveInteger(value, label) {
  if (!Number.isInteger(value) || value <= 0) fail(`${label} must be a positive integer.`);
}

function validIsoDate(value) {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value));
}

function publicRuntimePath(runtimePath, label) {
  requireString(runtimePath, label);
  const normalized = runtimePath.replaceAll('\\', '/');
  if (!normalized.startsWith('apps/tablet/public/art/pals/')) {
    fail(`${label} must live under apps/tablet/public/art/pals/.`);
  }
  return normalized;
}

function productionPath(filePath, format, label) {
  requireString(filePath, label);
  if (isAbsolute(filePath) || normalize(filePath).startsWith('..')) {
    fail(`${label} must remain inside the repository.`);
  }
  if (!filePath.startsWith('art/production/pals/')) {
    fail(`${label} must live under art/production/pals/.`);
  }
  if (extname(filePath).slice(1).toLowerCase() !== format) {
    fail(`${label} extension does not match ${format}.`);
  }
}

function validateProvenance(provenance, label) {
  if (!provenance || typeof provenance !== 'object') fail(`${label} requires provenance.`);
  for (const field of ['creator', 'method', 'ownershipBasis', 'createdAt', 'reviewer', 'approvedAt']) {
    requireString(provenance[field], `${label}.provenance.${field}`);
  }
  if (!validIsoDate(provenance.createdAt) || !validIsoDate(provenance.approvedAt)) {
    fail(`${label}.provenance timestamps must be valid ISO-8601 dates.`);
  }
  if (!Array.isArray(provenance.sourceReferenceIds)) {
    fail(`${label}.provenance.sourceReferenceIds must be an array.`);
  }
  if (provenance.humanArtApproval !== true) {
    fail(`${label}.provenance.humanArtApproval must be true for active runtime art.`);
  }
}

function resolverKey(asset) {
  return [
    asset.species,
    asset.artIdentity ?? '',
    asset.paletteId ?? '',
    asset.markingId ?? '',
    asset.accessoryId ?? '',
    asset.expression ?? '',
    asset.pose ?? ''
  ].join('::');
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.schemaVersion !== 1 || manifest.product !== 'Pixel Pals' || !Array.isArray(manifest.assets)) {
  fail('pal-runtime-manifest.json must be a Pixel Pals schemaVersion 1 manifest.');
}
if (!Array.isArray(manifest.allowedStatuses)) fail('allowedStatuses must be an array.');
for (const status of allowedStatuses) {
  if (!manifest.allowedStatuses.includes(status)) fail(`allowedStatuses is missing ${status}.`);
}

const seenIds = new Set();
const activeResolverKeys = new Set();
let activeCount = 0;
let productionCount = 0;
for (const asset of manifest.assets) {
  requireString(asset.id, 'asset.id');
  requireString(asset.subject, `${asset.id}.subject`);
  requireString(asset.alt, `${asset.id}.alt`);
  requirePositiveInteger(asset.maxBytes, `${asset.id}.maxBytes`);
  requirePositiveInteger(asset.width, `${asset.id}.width`);
  requirePositiveInteger(asset.height, `${asset.id}.height`);
  if (seenIds.has(asset.id)) fail(`duplicate asset id ${asset.id}.`);
  seenIds.add(asset.id);
  if (!allowedStatuses.has(asset.status)) fail(`${asset.id} has unsupported status ${asset.status}.`);
  if (!allowedFormats.has(asset.format)) fail(`${asset.id} has unsupported format ${asset.format}.`);
  if (!allowedSpecies.has(asset.species)) fail(`${asset.id} has unsupported species ${asset.species}.`);
  if (!allowedExpressions.has(asset.expression)) fail(`${asset.id} has unsupported expression ${asset.expression}.`);
  if (!allowedPoses.has(asset.pose)) fail(`${asset.id} has unsupported pose ${asset.pose}.`);
  requireString(asset.artIdentity, `${asset.id}.artIdentity`);
  requireString(asset.objectPosition, `${asset.id}.objectPosition`);

  if (asset.status === 'planned') {
    if (asset.filePath !== null || asset.runtimePath !== null || asset.provenance !== null) {
      fail(`${asset.id} is planned and must not claim files or provenance.`);
    }
  } else {
    activeCount += 1;
    productionPath(asset.filePath, asset.format, `${asset.id}.filePath`);
    publicRuntimePath(asset.runtimePath, `${asset.id}.runtimePath`);
    validateProvenance(asset.provenance, asset.id);
    const source = await stat(resolve(asset.filePath)).catch(() => null);
    const runtime = await stat(resolve(asset.runtimePath)).catch(() => null);
    if (!source?.isFile()) fail(`${asset.id} points to a missing production file.`);
    if (!runtime?.isFile()) fail(`${asset.id} points to a missing runtime file.`);
    if (source.size > asset.maxBytes || runtime.size > asset.maxBytes) {
      fail(`${asset.id} exceeds its ${asset.maxBytes}-byte budget.`);
    }
    const sourceDigest = createHash('sha256').update(await readFile(resolve(asset.filePath))).digest('hex');
    const runtimeDigest = createHash('sha256').update(await readFile(resolve(asset.runtimePath))).digest('hex');
    if (sourceDigest !== runtimeDigest) fail(`${asset.id} source and runtime bytes differ.`);
    const key = resolverKey(asset);
    if (activeResolverKeys.has(key)) fail(`${asset.id} duplicates an active PalArtwork resolver signature.`);
    activeResolverKeys.add(key);
  }

  if (asset.status === 'production') productionCount += 1;
  if (releaseMode && asset.releaseRequired === true && asset.status !== 'production') {
    fail(`${asset.id} is release-required but is not production.`);
  }
}

for (const id of requiredIds) {
  if (!seenIds.has(id)) fail(`required runtime slot ${id} is missing.`);
}
if (seenIds.size !== requiredIds.size) {
  fail('the initial runtime manifest must contain exactly the twelve governed slots.');
}

console.log(`Pal runtime art valid: ${manifest.assets.length} slots, ${activeCount} active, ${productionCount} production.`);
