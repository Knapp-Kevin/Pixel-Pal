import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const manifestPath = resolve('art/pal-candidate-manifest.json');
const expectedSpecies = ['fox', 'cat', 'dragon', 'bunny', 'bird'];
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
if (manifest.schemaVersion !== 1 || manifest.product !== 'Pixel Pals') {
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
if (!Array.isArray(manifest.species) || manifest.species.length !== expectedSpecies.length) {
  fail(`expected exactly ${expectedSpecies.length} starter species.`);
}

let candidateAssetCount = 0;
const encounteredSpecies = [];
for (const entry of manifest.species) {
  encounteredSpecies.push(entry.species);
  for (const field of ['species', 'artIdentity', 'palette', 'marking', 'accessory']) {
    requireKey(entry[field], `${entry.species}.${field}`);
  }
  if (!['planned', 'candidate', 'approved', 'rejected'].includes(entry.reviewState)) {
    fail(`${entry.species}.reviewState is unsupported.`);
  }
  if (!['pending', 'approved', 'rejected'].includes(entry.decision)) {
    fail(`${entry.species}.decision is unsupported.`);
  }
  if (entry.decision === 'approved' && entry.reviewState !== 'approved') {
    fail(`${entry.species} cannot be approved while reviewState=${entry.reviewState}.`);
  }
  for (const field of ['silhouette', 'face', 'outfitPalette']) {
    if (typeof entry[field] !== 'string' || entry[field].trim().length < 20) {
      fail(`${entry.species}.${field} is too vague to anchor generation.`);
    }
  }
  if (!entry.assets || typeof entry.assets !== 'object' || Array.isArray(entry.assets)) {
    fail(`${entry.species}.assets must be an object.`);
  }

  for (const [assetKey, asset] of Object.entries(entry.assets)) {
    if (!expectedAssets.includes(assetKey)) {
      fail(`${entry.species} has unsupported asset ${assetKey}.`);
    }
    requireKey(asset.expression, `${entry.species}.${assetKey}.expression`);
    requireKey(asset.pose, `${entry.species}.${assetKey}.pose`);
    if (!asset.path.startsWith(`${manifest.candidateRoot}/${entry.species}/`)) {
      fail(`${entry.species}.${assetKey} escapes the candidate root.`);
    }
    if (!['png', 'webp', 'avif'].includes(asset.format)) {
      fail(`${entry.species}.${assetKey} has unsupported format.`);
    }
    if (!Number.isInteger(asset.width) || !Number.isInteger(asset.height) || asset.width < 512 || asset.height < 512) {
      fail(`${entry.species}.${assetKey} dimensions are invalid.`);
    }
    if (!Number.isInteger(asset.bytes) || asset.bytes <= 0 || asset.bytes > 900000) {
      fail(`${entry.species}.${assetKey} exceeds the 900 KB candidate budget.`);
    }
    if (!/^[a-f0-9]{64}$/.test(asset.sha256)) {
      fail(`${entry.species}.${assetKey} sha256 is invalid.`);
    }
    if (!asset.provenance || typeof asset.provenance.creator !== 'string' || typeof asset.provenance.ownershipBasis !== 'string') {
      fail(`${entry.species}.${assetKey} provenance is incomplete.`);
    }

    const candidatePath = resolve(asset.path);
    const candidateStat = await stat(candidatePath).catch(() => null);
    if (!candidateStat?.isFile()) {
      fail(`${entry.species}.${assetKey} file is missing.`);
    }
    if (candidateStat.size !== asset.bytes) {
      fail(`${entry.species}.${assetKey} byte count drifted.`);
    }
    if (digest(await readFile(candidatePath)) !== asset.sha256) {
      fail(`${entry.species}.${assetKey} sha256 drifted.`);
    }
    candidateAssetCount += 1;
  }
}

if (JSON.stringify(encounteredSpecies) !== JSON.stringify(expectedSpecies)) {
  fail(`starter species order must be ${expectedSpecies.join(', ')}.`);
}

console.log(`Verified ${manifest.species.length} canonical Pal identities and ${candidateAssetCount} isolated candidate assets.`);
