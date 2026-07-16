import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const manifestPath = resolve('art/adventure-production-manifest.json');
const decisionsDirectory = resolve('art/review/decisions');
const evidenceDirectory = resolve('artifacts/art-review-decisions');
const allowedDecisions = new Set(['pending', 'rejected', 'approved']);
const allowedCriterionStates = new Set(['pending', 'pass', 'fail']);
const requiredCriteria = [
  'visualQuality',
  'storybookIdentity',
  'environmentalDepth',
  'livePalSafeAreas',
  'portraitAndLandscapeContinuity',
  'childSuitability',
  'accessibility',
  'sourceSimilarity',
  'ownershipAndRights',
  'tabletReadability',
  'performanceEvidence'
];

function fail(message) {
  throw new Error(`Human art review verification failed: ${message}`);
}

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} must be a non-empty string.`);
  return value.trim();
}

function pairKey(assetId, variant) {
  return `${assetId}::${variant}`;
}

function isReviewedStatus(status) {
  return status === 'approved' || status === 'production';
}

function isValidIsoDate(value) {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value));
}

async function sha256(filePath) {
  const buffer = await readFile(resolve(filePath));
  return createHash('sha256').update(buffer).digest('hex');
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.schemaVersion !== 2 || manifest.product !== 'Pixel Pals' || !Array.isArray(manifest.assets)) {
  fail('adventure-production-manifest.json must be a Pixel Pals schemaVersion 2 manifest.');
}

const manifestPairs = new Map();
for (const asset of manifest.assets) {
  const variants = new Set((asset.views ?? []).map((view) => view.variant));
  for (const variant of variants) {
    const matchingViews = asset.views.filter((view) => view.variant === variant);
    const landscape = matchingViews.find((view) => view.orientation === 'landscape');
    const portrait = matchingViews.find((view) => view.orientation === 'portrait');
    if (!landscape || !portrait || matchingViews.length !== 2) {
      fail(`${asset.id}.${variant} must contain exactly one landscape and one portrait view.`);
    }
    if (landscape.status !== portrait.status) {
      fail(`${asset.id}.${variant} has mismatched responsive statuses.`);
    }
    manifestPairs.set(pairKey(asset.id, variant), { asset, variant, landscape, portrait });
  }
}

const decisionFiles = (await readdir(decisionsDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
  .map((entry) => entry.name)
  .sort();

const decisions = new Map();
const summary = {
  generatedAt: new Date().toISOString(),
  evidenceClass: 'human-art-review-gate',
  decisionFiles: decisionFiles.length,
  pending: 0,
  rejected: 0,
  approved: 0,
  reviewedManifestPairs: 0,
  records: []
};

for (const fileName of decisionFiles) {
  const path = resolve(decisionsDirectory, fileName);
  const decision = JSON.parse(await readFile(path, 'utf8'));
  const label = `art/review/decisions/${fileName}`;

  if (decision.schemaVersion !== 1 || decision.product !== 'Pixel Pals') {
    fail(`${label} must be a Pixel Pals schemaVersion 1 decision.`);
  }
  if (!allowedDecisions.has(decision.decision)) {
    fail(`${label}.decision must be pending, rejected, or approved.`);
  }

  const assetId = requireString(decision.assetPair?.manifestAssetId, `${label}.assetPair.manifestAssetId`);
  const variant = requireString(decision.assetPair?.variant, `${label}.assetPair.variant`);
  const key = pairKey(assetId, variant);
  const pair = manifestPairs.get(key);
  if (!pair) fail(`${label} references unknown manifest pair ${assetId}.${variant}.`);
  if (decisions.has(key)) fail(`multiple decision records target ${assetId}.${variant}.`);

  if (decision.assetPair.landscapeViewId !== pair.landscape.id) {
    fail(`${label}.assetPair.landscapeViewId does not match the manifest.`);
  }
  if (decision.assetPair.portraitViewId !== pair.portrait.id) {
    fail(`${label}.assetPair.portraitViewId does not match the manifest.`);
  }

  if (!decision.criteria || typeof decision.criteria !== 'object') {
    fail(`${label}.criteria must be an object.`);
  }
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

  if (isReviewedStatus(pair.landscape.status) && decision.decision !== 'approved') {
    fail(`${assetId}.${variant} is ${pair.landscape.status} but its human review is not approved.`);
  }
  if (decision.decision === 'approved') {
    if (decision.reviewer?.kind !== 'human') fail(`${label}.reviewer.kind must be human for approval.`);
    const reviewerName = requireString(decision.reviewer?.name, `${label}.reviewer.name`);
    if (!isValidIsoDate(decision.reviewedAt)) fail(`${label}.reviewedAt must be a valid ISO-8601 timestamp.`);
    for (const criterion of requiredCriteria) {
      if (decision.criteria[criterion] !== 'pass') fail(`${label}.criteria.${criterion} must pass for approval.`);
    }
    if (decision.requiredRevisions.length > 0) fail(`${label} cannot be approved with required revisions.`);
    if (!isReviewedStatus(pair.landscape.status)) {
      fail(`${label} is approved but the manifest pair remains ${pair.landscape.status}.`);
    }

    const landscapeDigest = requireString(
      decision.assetDigests?.landscapeSha256,
      `${label}.assetDigests.landscapeSha256`
    );
    const portraitDigest = requireString(
      decision.assetDigests?.portraitSha256,
      `${label}.assetDigests.portraitSha256`
    );
    if (landscapeDigest !== await sha256(pair.landscape.filePath)) {
      fail(`${label} does not match the current landscape file digest.`);
    }
    if (portraitDigest !== await sha256(pair.portrait.filePath)) {
      fail(`${label} does not match the current portrait file digest.`);
    }

    for (const view of [pair.landscape, pair.portrait]) {
      const file = await stat(resolve(view.filePath)).catch(() => null);
      if (!file?.isFile()) fail(`${assetId}.${view.id} points to a missing reviewed file.`);
      if (file.size > view.maxBytes) fail(`${assetId}.${view.id} exceeds its byte budget after review.`);
      if (view.provenance?.humanArtApproval !== true) {
        fail(`${assetId}.${view.id}.provenance.humanArtApproval must be true after approval.`);
      }
      if (view.provenance.reviewer !== reviewerName) {
        fail(`${assetId}.${view.id}.provenance.reviewer must match the human review record.`);
      }
      if (!isValidIsoDate(view.provenance.approvedAt)) {
        fail(`${assetId}.${view.id}.provenance.approvedAt must be a valid timestamp.`);
      }
    }
  }

  if (decision.decision === 'rejected' && isReviewedStatus(pair.landscape.status)) {
    fail(`${label} rejects a pair that the manifest exposes as ${pair.landscape.status}.`);
  }

  decisions.set(key, decision);
  summary[decision.decision] += 1;
  summary.records.push({
    file: `art/review/decisions/${fileName}`,
    assetId,
    variant,
    manifestStatus: pair.landscape.status,
    decision: decision.decision,
    reviewer: decision.reviewer?.name ?? null,
    reviewedAt: decision.reviewedAt ?? null,
    requiredRevisions: decision.requiredRevisions.length
  });
}

for (const [key, pair] of manifestPairs) {
  if (pair.landscape.status !== 'planned') {
    summary.reviewedManifestPairs += 1;
    if (!decisions.has(key)) {
      fail(`${pair.asset.id}.${pair.variant} is ${pair.landscape.status} but has no review decision record.`);
    }
  }
  if (isReviewedStatus(pair.landscape.status) && decisions.get(key)?.decision !== 'approved') {
    fail(`${pair.asset.id}.${pair.variant} requires an approved human review decision.`);
  }
}

await mkdir(evidenceDirectory, { recursive: true });
await writeFile(resolve(evidenceDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(
  `Human art reviews valid: ${summary.decisionFiles} decisions, ${summary.pending} pending, ` +
  `${summary.rejected} rejected, ${summary.approved} approved, ${summary.reviewedManifestPairs} non-planned manifest pairs.`
);
