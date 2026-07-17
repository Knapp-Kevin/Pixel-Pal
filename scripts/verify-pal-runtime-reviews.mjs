import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const manifestPath = resolve('art/pal-runtime-manifest.json');
const decisionsDirectory = resolve('art/review/pal-decisions');
const evidenceDirectory = resolve('artifacts/pal-runtime-reviews');
const requiredCriteria = [
  'visualQuality',
  'storybookIdentity',
  'silhouetteReadability',
  'anatomyConsistency',
  'expressionReadability',
  'childSuitability',
  'transparentComposition',
  'ownershipAndRights',
  'tabletReadability',
  'performanceEvidence',
  'resolverCompatibility'
];
const allowedDecisions = new Set(['pending', 'rejected', 'approved']);
const allowedCriterionStates = new Set(['pending', 'pass', 'fail']);

function fail(message) {
  throw new Error(`Pal runtime review verification failed: ${message}`);
}

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} must be a non-empty string.`);
  return value.trim();
}

function validIsoDate(value) {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value));
}

async function sha256(filePath) {
  return createHash('sha256').update(await readFile(resolve(filePath))).digest('hex');
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.schemaVersion !== 1 || manifest.product !== 'Pixel Pals' || !Array.isArray(manifest.assets)) {
  fail('pal-runtime-manifest.json must be a Pixel Pals schemaVersion 1 manifest.');
}
const assets = new Map(manifest.assets.map((asset) => [asset.id, asset]));

const files = (await readdir(decisionsDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
  .map((entry) => entry.name)
  .sort();
const decisions = new Map();
const summary = {
  generatedAt: new Date().toISOString(),
  evidenceClass: 'pal-runtime-human-review-gate',
  decisionFiles: files.length,
  pending: 0,
  rejected: 0,
  approved: 0,
  activeAssets: 0,
  records: []
};

for (const fileName of files) {
  const label = `art/review/pal-decisions/${fileName}`;
  const decision = JSON.parse(await readFile(resolve(decisionsDirectory, fileName), 'utf8'));
  if (decision.schemaVersion !== 1 || decision.product !== 'Pixel Pals') {
    fail(`${label} must be a Pixel Pals schemaVersion 1 decision.`);
  }
  if (!allowedDecisions.has(decision.decision)) {
    fail(`${label}.decision must be pending, rejected, or approved.`);
  }
  const assetId = requireString(decision.manifestAssetId, `${label}.manifestAssetId`);
  const asset = assets.get(assetId);
  if (!asset) fail(`${label} references unknown asset ${assetId}.`);
  if (decisions.has(assetId)) fail(`multiple review decisions target ${assetId}.`);
  if (!decision.criteria || typeof decision.criteria !== 'object') fail(`${label}.criteria must be an object.`);
  for (const criterion of requiredCriteria) {
    if (!allowedCriterionStates.has(decision.criteria[criterion])) {
      fail(`${label}.criteria.${criterion} must be pending, pass, or fail.`);
    }
  }
  const unexpectedCriteria = Object.keys(decision.criteria).filter((criterion) => !requiredCriteria.includes(criterion));
  if (unexpectedCriteria.length > 0) {
    fail(`${label}.criteria contains unsupported keys: ${unexpectedCriteria.join(', ')}.`);
  }
  if (!Array.isArray(decision.requiredRevisions) || decision.requiredRevisions.some((item) => typeof item !== 'string')) {
    fail(`${label}.requiredRevisions must be an array of strings.`);
  }

  const reviewedStatus = asset.status === 'approved' || asset.status === 'production';
  if (reviewedStatus && decision.decision !== 'approved') {
    fail(`${assetId} is ${asset.status} but its human decision is not approved.`);
  }
  if (decision.decision === 'approved') {
    if (decision.reviewer?.kind !== 'human') fail(`${label}.reviewer.kind must be human.`);
    const reviewer = requireString(decision.reviewer?.name, `${label}.reviewer.name`);
    if (!validIsoDate(decision.reviewedAt)) fail(`${label}.reviewedAt must be a valid ISO-8601 timestamp.`);
    for (const criterion of requiredCriteria) {
      if (decision.criteria[criterion] !== 'pass') fail(`${label}.criteria.${criterion} must pass for approval.`);
    }
    if (decision.requiredRevisions.length > 0) fail(`${label} cannot be approved with required revisions.`);
    if (!reviewedStatus) fail(`${label} is approved but ${assetId} remains ${asset.status}.`);
    const expectedDigest = requireString(decision.assetSha256, `${label}.assetSha256`);
    if (expectedDigest !== await sha256(asset.filePath)) fail(`${label} does not match the production file digest.`);
    if (expectedDigest !== await sha256(asset.runtimePath)) fail(`${label} does not match the runtime file digest.`);
    if (asset.provenance?.humanArtApproval !== true) fail(`${assetId}.provenance.humanArtApproval must be true.`);
    if (asset.provenance.reviewer !== reviewer) fail(`${assetId}.provenance.reviewer must match the decision.`);
    if (!validIsoDate(asset.provenance.approvedAt)) fail(`${assetId}.provenance.approvedAt must be valid.`);
  }
  if (decision.decision === 'rejected' && reviewedStatus) {
    fail(`${label} rejects an asset exposed as ${asset.status}.`);
  }

  decisions.set(assetId, decision);
  summary[decision.decision] += 1;
  summary.records.push({
    file: label,
    assetId,
    manifestStatus: asset.status,
    decision: decision.decision,
    reviewer: decision.reviewer?.name ?? null,
    reviewedAt: decision.reviewedAt ?? null,
    requiredRevisions: decision.requiredRevisions.length
  });
}

for (const asset of manifest.assets) {
  if (asset.status === 'planned') continue;
  summary.activeAssets += 1;
  const decision = decisions.get(asset.id);
  if (!decision) fail(`${asset.id} is ${asset.status} but has no human review decision.`);
  if ((asset.status === 'approved' || asset.status === 'production') && decision.decision !== 'approved') {
    fail(`${asset.id} requires an approved human review decision.`);
  }
}

await mkdir(evidenceDirectory, { recursive: true });
await writeFile(resolve(evidenceDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(
  `Pal runtime reviews valid: ${summary.decisionFiles} decisions, ${summary.pending} pending, ` +
  `${summary.rejected} rejected, ${summary.approved} approved, ${summary.activeAssets} active assets.`
);
