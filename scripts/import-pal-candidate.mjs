import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';

const manifestPath = resolve(process.env.PAL_CANDIDATE_MANIFEST_PATH ?? 'art/pal-candidate-manifest.json');
const reviewDirectory = resolve(process.env.PAL_CANDIDATE_REVIEW_DIRECTORY ?? 'art/review/candidates/pals');

const assetContracts = {
  'model-sheet': { expression: 'content', pose: 'standing', square: false },
  'idle-happy': { expression: 'content', pose: 'standing', square: true },
  waving: { expression: 'content', pose: 'waving', square: true },
  sleeping: { expression: 'content', pose: 'sleeping', square: true },
  listening: { expression: 'thoughtful', pose: 'listening', square: true },
  surprised: { expression: 'curious', pose: 'surprised', square: true },
  'joyful-reaction': { expression: 'delighted', pose: 'playful', square: true },
  confirmation: { expression: 'content', pose: 'standing', square: true },
  error: { expression: 'uncertain', pose: 'standing', square: true }
};

function fail(message) {
  throw new Error(`Pal candidate import failed: ${message}`);
}

function parseArgs(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) fail(`Unexpected argument ${token}.`);
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) fail(`Missing value for --${key}.`);
    values.set(key, value);
    index += 1;
  }
  return values;
}

function required(args, key) {
  const value = args.get(key);
  if (!value) fail(`--${key} is required.`);
  return value;
}

function safeKey(value, label) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) fail(`${label} must use lowercase kebab-case.`);
  return value;
}

function parseBoolean(value, label) {
  if (value === undefined) return false;
  if (value === 'true') return true;
  if (value === 'false') return false;
  fail(`${label} must be true or false.`);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function pngMetadata(buffer, label) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 33 || !buffer.subarray(0, 8).equals(signature) || buffer.toString('ascii', 12, 16) !== 'IHDR') {
    fail(`${label} is not a valid PNG file.`);
  }
  const colorType = buffer[25];
  if (colorType !== 4 && colorType !== 6) {
    fail(`${label} must use a PNG color type with an alpha channel.`);
  }
  return {
    format: 'png',
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    alphaChannel: true
  };
}

function metadataFor(buffer, extension, label) {
  if (extension === '.png') return pngMetadata(buffer, label);
  fail(`${label} must be a transparent PNG. Runtime WebP conversion occurs only after approval.`);
}

function pendingReview(entry, assetKey, asset, sourceReferences) {
  return {
    schemaVersion: 1,
    product: 'Pixel Pals',
    characterKey: entry.key,
    displayName: entry.displayName,
    species: entry.species,
    artIdentity: entry.artIdentity,
    assetKey,
    decision: 'pending',
    reviewer: { kind: 'human', name: null },
    reviewedAt: null,
    assetSha256: asset.sha256,
    sourceReferenceIds: sourceReferences,
    criteria: {
      visualQuality: 'pending',
      storybookIdentity: 'pending',
      silhouetteReadability: 'pending',
      anatomyConsistency: 'pending',
      expressionReadability: 'pending',
      crossPoseContinuity: 'pending',
      childSuitability: 'pending',
      transparentComposition: 'pass',
      ownershipAndRights: 'pending',
      tabletReadability: 'pending',
      performanceEvidence: 'pending'
    },
    requiredRevisions: [
      'Complete named human review against the canonical character identity and painterly production-art standard.',
      'Confirm the full silhouette, ground anchor, eye line, outfit, anatomy, and facial language remain consistent with the model sheet.',
      'Normalize to the runtime byte budget only after visual approval.'
    ],
    notes: 'Imported as an isolated source-quality candidate. Import does not constitute approval or runtime promotion.'
  };
}

const args = parseArgs(process.argv.slice(2));
const characterKey = safeKey(required(args, 'character-key'), 'character key');
const assetKey = safeKey(required(args, 'asset-key'), 'asset key');
const sourceInput = required(args, 'source');
const replace = parseBoolean(args.get('replace'), '--replace');
const creator = args.get('creator') ?? 'OpenAI image generation';
const ownershipBasis = args.get('ownership-basis') ?? 'User-directed work product for MythologIQ Labs, LLC';
const createdAt = args.get('created-at') ?? new Date().toISOString();
const sourceReferences = (args.get('source-references') ?? basename(sourceInput))
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const contract = assetContracts[assetKey];
if (!contract) fail(`Unsupported asset key ${assetKey}.`);

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.schemaVersion !== 2 || manifest.product !== 'Pixel Pals') fail('unsupported candidate manifest.');
const entry = manifest.characters.find((candidate) => candidate.key === characterKey);
if (!entry) fail(`Unknown canonical character package ${characterKey}.`);
if (!manifest.requiredAssetSet.includes(assetKey)) fail(`${assetKey} is not part of the required asset set.`);

const sourcePath = resolve(sourceInput);
const sourceStat = await stat(sourcePath).catch(() => null);
if (!sourceStat?.isFile()) fail(`Source file ${sourceInput} does not exist.`);
const extension = extname(sourcePath).toLowerCase();
const buffer = await readFile(sourcePath);
const metadata = metadataFor(buffer, extension, 'source input');
if (metadata.width < 512 || metadata.height < 512) fail('Candidate dimensions must be at least 512 by 512.');
if (contract.square && metadata.width !== metadata.height) fail(`${assetKey} must use a square transparent canvas.`);
if (!Number.isInteger(manifest.candidateMaxBytes) || manifest.candidateMaxBytes < 1000000) {
  fail('candidateMaxBytes must preserve source-quality artwork rather than reuse the runtime budget.');
}
if (buffer.length > manifest.candidateMaxBytes) {
  fail(`Candidate is ${buffer.length} bytes, above the ${manifest.candidateMaxBytes}-byte source budget.`);
}

const repositoryPath = `${manifest.candidateRoot}/${characterKey}/${assetKey}${extension}`;
const targetPath = resolve(repositoryPath);
const existing = await stat(targetPath).catch(() => null);
if (existing && !replace) fail(`${repositoryPath} already exists. Pass --replace true for an intentional replacement.`);
await mkdir(dirname(targetPath), { recursive: true });
await copyFile(sourcePath, targetPath);

const digest = sha256(buffer);
entry.reviewState = 'candidate';
entry.decision = 'pending';
entry.assets[assetKey] = {
  path: repositoryPath,
  format: metadata.format,
  width: metadata.width,
  height: metadata.height,
  bytes: buffer.length,
  sha256: digest,
  expression: contract.expression,
  pose: contract.pose,
  alphaChannel: metadata.alphaChannel,
  provenance: {
    creator,
    method: `Transparent source candidate imported through scripts/import-pal-candidate.mjs`,
    ownershipBasis,
    createdAt,
    sourceReferenceIds: sourceReferences,
    sourceName: basename(sourcePath),
    humanArtApproval: false
  }
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

await mkdir(reviewDirectory, { recursive: true });
const reviewPath = resolve(reviewDirectory, `${characterKey}-${assetKey}.json`);
await writeFile(
  reviewPath,
  `${JSON.stringify(pendingReview(entry, assetKey, entry.assets[assetKey], sourceReferences), null, 2)}\n`,
  'utf8'
);

console.log(`Imported ${characterKey}.${assetKey} as an isolated transparent PNG candidate.`);
console.log(`${metadata.width}x${metadata.height}, ${buffer.length} bytes, sha256:${digest}`);
console.log(`Candidate: ${repositoryPath}`);
console.log(`Review: ${reviewPath}`);
console.log('Named human review and explicit runtime promotion remain required.');
