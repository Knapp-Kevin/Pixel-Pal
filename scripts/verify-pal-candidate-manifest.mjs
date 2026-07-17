import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const manifestPath = resolve(process.env.PAL_CANDIDATE_MANIFEST_PATH ?? 'art/pal-candidate-manifest.json');
const reviewDirectory = resolve(process.env.PAL_CANDIDATE_REVIEW_DIRECTORY ?? 'art/review/candidates/pals');
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
const requiredCriteria = [
  'visualQuality',
  'storybookIdentity',
  'silhouetteReadability',
  'anatomyConsistency',
  'expressionReadability',
  'crossPoseContinuity',
  'childSuitability',
  'transparentComposition',
  'ownershipAndRights',
  'tabletReadability',
  'performanceEvidence'
];
const validSpecies = new Set(['fox', 'deer', 'rabbit', 'cat', 'duck']);
const allowedReviewStates = new Set(['planned', 'candidate', 'approved', 'rejected']);
const allowedDecisions = new Set(['pending', 'approved', 'rejected']);
const allowedCriterionStates = new Set(['pending', 'pass', 'fail']);
const keyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message) {
  throw new Error(`Pal candidate manifest verification failed: ${message}`);
}

function requireKey(value, label) {
  if (typeof value !== 'string' || !keyPattern.test(value)) {
    fail(`${label} must use lowercase kebab-case.`);
  }
}

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} must be a non-empty string.`);
  return value.trim();
}

function validIsoDate(value) {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value));
}

function digest(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.schemaVersion !== 2 || manifest.product !== 'Pixel Pals') fail('unsupported manifest identity.');
if (manifest.productionPromotionAllowed !== false) fail('candidate manifest must forbid production promotion.');
if (manifest.candidateRoot !== 'art/candidates/pals') fail('candidate root must remain art/candidates/pals.');
if (!Number.isInteger(manifest.candidateMaxBytes) || manifest.candidateMaxBytes < 1000000) {
  fail('candidateMaxBytes must preserve source-quality artwork independently from runtime budgets.');
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

const reviewFiles = (await readdir(reviewDirectory, { withFileTypes: true }).catch(() => []))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
  .map((entry) => entry.name)
  .sort();
const reviewRecords = new Map();
for (const fileName of reviewFiles) {
  const label = `art/review/candidates/pals/${fileName}`;
  const record = JSON.parse(await readFile(resolve(reviewDirectory, fileName), 'utf8'));
  if (record.schemaVersion !== 1 || record.product !== 'Pixel Pals') fail(`${label} has an unsupported identity.`);
  requireKey(record.characterKey, `${label}.characterKey`);
  requireKey(record.assetKey, `${label}.assetKey`);
  if (!allowedDecisions.has(record.decision)) fail(`${label}.decision is unsupported.`);
  if (!/^[a-f0-9]{64}$/.test(record.assetSha256)) fail(`${label}.assetSha256 is invalid.`);
  if (!record.criteria || typeof record.criteria !== 'object') fail(`${label}.criteria must be an object.`);
  for (const criterion of requiredCriteria) {
    if (!allowedCriterionStates.has(record.criteria[criterion])) {
      fail(`${label}.criteria.${criterion} must be pending, pass, or fail.`);
    }
  }
  const unexpectedCriteria = Object.keys(record.criteria).filter((criterion) => !requiredCriteria.includes(criterion));
  if (unexpectedCriteria.length > 0) fail(`${label}.criteria contains unsupported keys: ${unexpectedCriteria.join(', ')}.`);
  if (!Array.isArray(record.requiredRevisions) || record.requiredRevisions.some((item) => typeof item !== 'string')) {
    fail(`${label}.requiredRevisions must be an array of strings.`);
  }
  if (record.decision === 'approved') {
    if (record.reviewer?.kind !== 'human') fail(`${label}.reviewer.kind must be human for approval.`);
    requireString(record.reviewer?.name, `${label}.reviewer.name`);
    if (!validIsoDate(record.reviewedAt)) fail(`${label}.reviewedAt must be a valid timestamp.`);
    for (const criterion of requiredCriteria) {
      if (record.criteria[criterion] !== 'pass') fail(`${label}.criteria.${criterion} must pass for approval.`);
    }
    if (record.requiredRevisions.length > 0) fail(`${label} cannot be approved with required revisions.`);
  }
  const key = `${record.characterKey}::${record.assetKey}`;
  if (reviewRecords.has(key)) fail(`multiple review records target ${key}.`);
  reviewRecords.set(key, { record, label });
}

let candidateAssetCount = 0;
const expectedReviewKeys = new Set();
for (const [index, entry] of manifest.characters.entries()) {
  const expected = expectedCharacters[index];
  requireKey(entry.key, `characters[${index}].key`);
  requireKey(entry.species, `${entry.key}.species`);
  requireKey(entry.artIdentity, `${entry.key}.artIdentity`);
  for (const field of ['palette', 'marking', 'accessory']) requireKey(entry[field], `${entry.key}.${field}`);
  if (entry.key !== expected.key || entry.species !== expected.species || entry.artIdentity !== expected.artIdentity) {
    fail(`${entry.key} does not match the canonical package at index ${index}.`);
  }
  if (!validSpecies.has(entry.species)) fail(`${entry.key}.species is not supported by PalPortrait.`);
  if (typeof entry.displayName !== 'string' || entry.displayName.trim().length < 2) fail(`${entry.key}.displayName is missing.`);
  if (!allowedReviewStates.has(entry.reviewState)) fail(`${entry.key}.reviewState is unsupported.`);
  if (!allowedDecisions.has(entry.decision)) fail(`${entry.key}.decision is unsupported.`);
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
    if (!expectedAssets.includes(assetKey)) fail(`${entry.key} has unsupported asset ${assetKey}.`);
    requireKey(asset.expression, `${entry.key}.${assetKey}.expression`);
    requireKey(asset.pose, `${entry.key}.${assetKey}.pose`);
    if (!asset.path.startsWith(`${manifest.candidateRoot}/${entry.key}/`)) {
      fail(`${entry.key}.${assetKey} escapes its candidate package.`);
    }
    if (asset.format !== 'png') fail(`${entry.key}.${assetKey} must preserve a transparent PNG source candidate.`);
    if (asset.alphaChannel !== true) fail(`${entry.key}.${assetKey} must record an alpha channel.`);
    if (!Number.isInteger(asset.width) || !Number.isInteger(asset.height) || asset.width < 512 || asset.height < 512) {
      fail(`${entry.key}.${assetKey} dimensions are invalid.`);
    }
    if (!Number.isInteger(asset.bytes) || asset.bytes <= 0 || asset.bytes > manifest.candidateMaxBytes) {
      fail(`${entry.key}.${assetKey} exceeds the source-quality candidate budget.`);
    }
    if (!/^[a-f0-9]{64}$/.test(asset.sha256)) fail(`${entry.key}.${assetKey} sha256 is invalid.`);
    if (!asset.provenance || typeof asset.provenance.creator !== 'string' || typeof asset.provenance.ownershipBasis !== 'string') {
      fail(`${entry.key}.${assetKey} provenance is incomplete.`);
    }
    if (asset.provenance.humanArtApproval !== false) {
      fail(`${entry.key}.${assetKey} candidate provenance must remain unapproved.`);
    }

    const candidatePath = resolve(asset.path);
    const candidateStat = await stat(candidatePath).catch(() => null);
    if (!candidateStat?.isFile()) fail(`${entry.key}.${assetKey} file is missing.`);
    if (candidateStat.size !== asset.bytes) fail(`${entry.key}.${assetKey} byte count drifted.`);
    const currentDigest = digest(await readFile(candidatePath));
    if (currentDigest !== asset.sha256) fail(`${entry.key}.${assetKey} sha256 drifted.`);

    const reviewKey = `${entry.key}::${assetKey}`;
    expectedReviewKeys.add(reviewKey);
    const review = reviewRecords.get(reviewKey);
    if (!review) fail(`${entry.key}.${assetKey} has no candidate review record.`);
    if (review.record.assetSha256 !== currentDigest) fail(`${review.label}.assetSha256 does not match the candidate.`);
    if (review.record.species !== entry.species || review.record.artIdentity !== entry.artIdentity) {
      fail(`${review.label} does not match the canonical character identity.`);
    }
    candidateAssetCount += 1;
  }
}

for (const key of reviewRecords.keys()) {
  if (!expectedReviewKeys.has(key)) fail(`orphan candidate review record ${key}.`);
}

console.log(
  `Verified ${manifest.characters.length} canonical character packages, ${candidateAssetCount} isolated candidates, ` +
  `${reviewRecords.size} bound review records.`
);
