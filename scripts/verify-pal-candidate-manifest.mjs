import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const manifestPath = resolve('art/pal-candidate-manifest.json');
const expectedCharacters = [
  { key: 'starter-fox', species: 'fox', artIdentity: 'starter-fox-v1' },
  { key: 'starter-deer', species: 'deer', artIdentity: 'starter-deer-v1' },
  { key: 'starter-rabbit', species: 'rabbit', artIdentity: 'starter-rabbit-v1' },
  { key: 'starter-kitten', species: 'cat', artIdentity: 'starter-kitten-v1' },
  { key: 'starter-duckling', species: 'duck', artIdentity: 'starter-duckling-v1' },
  { key: 'fern', species: 'rabbit', artIdentity: 'fern' }
];
const expectedAssets = [
  'model-sheet',
  'idle-happy',
  'waving',
  'sleeping',
  'listening',
  'surprised',
  'joyful-reaction',
  'confirmation',
  'error'
];
const validSpecies = new Set(['fox', 'deer', 'rabbit', 'cat', 'duck']);
const keyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message) {
  throw new Error(`Pal candidate manifest verification failed: ${message}`);
}

function requireKey(value, label) {
  if (typeof value !== 'string' || !keyPattern.test(value)) {
    fail(`${label} must use lowercase kebab-case.`);
  }
}

function digest(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.schemaVersion !== 2 || manifest.product !== 'Pixel Pals') {
  fail('unsupported manifest identity.');
}
if (manifest.productionPromotionAllowed !== false) {
  fail('candidate manifest must forbid production promotion.');
}
if (manifest.candidateRoot !== 'art/candidates/pals') {
  fail('candidate root must remain art/candidates/pals.');
}
if (JSON.stringify(manifest.requiredAssetSet) !== JSON.stringify(expectedAssets)) {
  fail('required asset set drifted from the M3 contract.');
}
if (!Array.isArray(manifest.sharedIdentityContract?.forbidden) || manifest.sharedIdentityContract.forbidden.length < 6) {
  fail('shared identity contract needs explicit rejection rules.');
}
if (!Array.isArray(manifest.characters) || manifest.characters.length !== expectedCharacters.length) {
  fail(`expected exactly ${expectedCharacters.length} canonical character packages.`);
}

let candidateAssetCount = 0;
for (const [index, entry] of manifest.characters.entries()) {
  const expected = expectedCharacters[index];
  requireKey(entry.key, `characters[${index}].key`);
  requireKey(entry.species, `${entry.key}.species`);
  requireKey(entry.artIdentity, `${entry.key}.artIdentity`);
  for (const field of ['palette', 'marking', 'accessory']) {
    requireKey(entry[field], `${entry.key}.${field}`);
  }
  if (entry.key !== expected.key || entry.species !== expected.species || entry.artIdentity !== expected.artIdentity) {
    fail(`${entry.key} does not match the canonical package at index ${index}.`);
  }
  if (!validSpecies.has(entry.species)) {
    fail(`${entry.key}.species is not supported by PalPortrait.`);
  }
  if (typeof entry.displayName !== 'string' || entry.displayName.trim().length < 2) {
    fail(`${entry.key}.displayName is missing.`);
  }
  if (!['planned', 'candidate', 'approved', 'rejected'].includes(entry.reviewState)) {
    fail(`${entry.key}.reviewState is unsupported.`);
  }
  if (!['pending', 'approved', 'rejected'].includes(entry.decision)) {
    fail(`${entry.key}.decision is unsupported.`);
  }
  if (entry.decision === 'approved' && entry.reviewState !== 'approved') {
    fail(`${entry.key} cannot be approved while reviewState=${entry.reviewState}.`);
  }
  for (const field of ['silhouette', 'face', 'outfitPalette']) {
    if (typeof entry[field] !== 'string' || entry[field].trim().length < 20) {
      fail(`${entry.key}.${field} is too vague to anchor generation.`);
    }
  }
  if (!entry.assets || typeof entry.assets !== 'object' || Array.isArray(entry.assets)) {
    fail(`${entry.key}.assets must be an object.`);
  }

  for (const [assetKey, asset] of Object.entries(entry.assets)) {
    if (!expectedAssets.includes(assetKey)) {
      fail(`${entry.key} has unsupported asset ${assetKey}.`);
    }
    requireKey(asset.expression, `${entry.key}.${assetKey}.expression`);
    requireKey(asset.pose, `${entry.key}.${assetKey}.pose`);
    if (!asset.path.startsWith(`${manifest.candidateRoot}/${entry.key}/`)) {
      fail(`${entry.key}.${assetKey} escapes its candidate package.`);
    }
    if (!['png', 'webp', 'avif'].includes(asset.format)) {
      fail(`${entry.key}.${assetKey} has unsupported format.`);
    }
    if (!Number.isInteger(asset.width) || !Number.isInteger(asset.height) || asset.width < 512 || asset.height < 512) {
      fail(`${entry.key}.${assetKey} dimensions are invalid.`);
    }
    if (!Number.isInteger(asset.bytes) || asset.bytes <= 0 || asset.bytes > 900000) {
      fail(`${entry.key}.${assetKey} exceeds the 900 KB candidate budget.`);
    }
    if (!/^[a-f0-9]{64}$/.test(asset.sha256)) {
      fail(`${entry.key}.${assetKey} sha256 is invalid.`);
    }
    if (!asset.provenance || typeof asset.provenance.creator !== 'string' || typeof asset.provenance.ownershipBasis !== 'string') {
      fail(`${entry.key}.${assetKey} provenance is incomplete.`);
    }

    const candidatePath = resolve(asset.path);
    const candidateStat = await stat(candidatePath).catch(() => null);
    if (!candidateStat?.isFile()) {
      fail(`${entry.key}.${assetKey} file is missing.`);
    }
    if (candidateStat.size !== asset.bytes) {
      fail(`${entry.key}.${assetKey} byte count drifted.`);
    }
    if (digest(await readFile(candidatePath)) !== asset.sha256) {
      fail(`${entry.key}.${assetKey} sha256 drifted.`);
    }
    candidateAssetCount += 1;
  }
}

console.log(`Verified ${manifest.characters.length} canonical character packages and ${candidateAssetCount} isolated candidate assets.`);
