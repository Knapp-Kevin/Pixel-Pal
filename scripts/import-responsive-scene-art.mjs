import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const manifestPath = resolve('art/adventure-production-manifest.json');
const decisionsDirectory = resolve('art/review/decisions');

function fail(message) {
  throw new Error(`Responsive scene art import failed: ${message}`);
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

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readThreeByteLittleEndian(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function webpDimensions(buffer, label) {
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    fail(`${label} is not a valid WebP file.`);
  }

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunk = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;

    if (chunk === 'VP8X' && data + 10 <= buffer.length) {
      return {
        width: readThreeByteLittleEndian(buffer, data + 4) + 1,
        height: readThreeByteLittleEndian(buffer, data + 7) + 1
      };
    }

    if (chunk === 'VP8L' && data + 5 <= buffer.length && buffer[data] === 0x2f) {
      const bits = buffer.readUInt32LE(data + 1);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >>> 14) & 0x3fff) + 1
      };
    }

    if (chunk === 'VP8 ') {
      const end = Math.min(buffer.length - 7, data + size);
      for (let cursor = data; cursor <= end; cursor += 1) {
        if (buffer[cursor] === 0x9d && buffer[cursor + 1] === 0x01 && buffer[cursor + 2] === 0x2a) {
          return {
            width: buffer.readUInt16LE(cursor + 3) & 0x3fff,
            height: buffer.readUInt16LE(cursor + 5) & 0x3fff
          };
        }
      }
    }

    offset = data + size + (size % 2);
  }

  fail(`${label} does not expose readable WebP dimensions.`);
}

function safeSegment(value, label) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(value)) fail(`${label} must use lowercase kebab-case.`);
  return value;
}

function pathsFor(assetId, variant, orientation, existing) {
  const packageName = assetId.replace(/-adventure$/, '');
  const filename = `${variant}-${orientation}.webp`;
  return {
    filePath: existing.filePath ?? `art/production/adventures/${packageName}/${filename}`,
    runtimePath: existing.runtimePath ?? `apps/tablet/public/art/adventures/${packageName}/${filename}`,
    sourcePath: `art/source/responsive-scenes/${packageName}/${filename}`
  };
}

async function copyIntoRepository(sourcePath, targets) {
  for (const target of targets) {
    await mkdir(dirname(resolve(target)), { recursive: true });
    await copyFile(resolve(sourcePath), resolve(target));
  }
}

function pendingDecision(asset, variant, landscape, portrait, digests) {
  return {
    schemaVersion: 1,
    product: 'Pixel Pals',
    assetPair: {
      manifestAssetId: asset.id,
      variant,
      landscapeViewId: landscape.id,
      portraitViewId: portrait.id
    },
    decision: 'pending',
    reviewer: { kind: 'human', name: null },
    reviewedAt: null,
    assetDigests: {
      landscapeSha256: digests.landscape,
      portraitSha256: digests.portrait
    },
    criteria: {
      visualQuality: 'pending',
      storybookIdentity: 'pending',
      environmentalDepth: 'pending',
      livePalSafeAreas: 'pending',
      portraitAndLandscapeContinuity: 'pending',
      childSuitability: 'pending',
      accessibility: 'pending',
      sourceSimilarity: 'pending',
      ownershipAndRights: 'pending',
      tabletReadability: 'pending',
      performanceEvidence: 'pass'
    },
    requiredRevisions: [
      'Complete human review against the Pixel Pals painterly production-art standard.',
      'Confirm both orientations preserve live Pal overlay safe areas on compact and large tablets.',
      'Promote the pair only after all review criteria pass.'
    ],
    notes: 'Imported as a responsive benchmark candidate. Import does not constitute human approval.'
  };
}

const args = parseArgs(process.argv.slice(2));
const assetId = safeSegment(required(args, 'asset-id'), 'asset id');
const variant = safeSegment(required(args, 'variant'), 'variant');
const landscapeInput = required(args, 'landscape');
const portraitInput = required(args, 'portrait');
const creator = args.get('creator') ?? 'OpenAI assistant';
const ownershipBasis = args.get('ownership-basis') ?? 'User-directed work product for MythologIQ Labs, LLC';
const sourceReferences = (args.get('source-references') ?? `${basename(landscapeInput)},${basename(portraitInput)}`)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const createdAt = args.get('created-at') ?? new Date().toISOString();

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const asset = manifest.assets.find((candidate) => candidate.id === assetId);
if (!asset) fail(`Manifest asset ${assetId} was not found.`);
const matching = asset.views.filter((view) => view.variant === variant);
const landscape = matching.find((view) => view.orientation === 'landscape');
const portrait = matching.find((view) => view.orientation === 'portrait');
if (!landscape || !portrait || matching.length !== 2) {
  fail(`${assetId}.${variant} must define exactly one landscape and one portrait view.`);
}

const landscapeBuffer = await readFile(resolve(landscapeInput));
const portraitBuffer = await readFile(resolve(portraitInput));
const landscapeSize = webpDimensions(landscapeBuffer, 'landscape input');
const portraitSize = webpDimensions(portraitBuffer, 'portrait input');
if (landscapeSize.width <= landscapeSize.height) fail('Landscape input must be wider than it is tall.');
if (portraitSize.height <= portraitSize.width) fail('Portrait input must be taller than it is wide.');
if (landscapeBuffer.length > landscape.maxBytes) fail(`Landscape input exceeds ${landscape.maxBytes} bytes.`);
if (portraitBuffer.length > portrait.maxBytes) fail(`Portrait input exceeds ${portrait.maxBytes} bytes.`);

const landscapePaths = pathsFor(assetId, variant, 'landscape', landscape);
const portraitPaths = pathsFor(assetId, variant, 'portrait', portrait);
await copyIntoRepository(landscapeInput, Object.values(landscapePaths));
await copyIntoRepository(portraitInput, Object.values(portraitPaths));

const provenance = (orientation, sourcePath, digest) => ({
  creator,
  method: `Responsive ${orientation} painterly scene imported through scripts/import-responsive-scene-art.mjs`,
  ownershipBasis,
  createdAt,
  reviewer: 'Pending human review',
  approvedAt: createdAt,
  sourceReferenceIds: sourceReferences,
  approvalScope: 'Benchmark review candidate only; not approved or production art',
  humanArtApproval: false,
  sourcePath,
  sha256: digest
});

const landscapeDigest = sha256(landscapeBuffer);
const portraitDigest = sha256(portraitBuffer);
Object.assign(landscape, {
  status: 'benchmark',
  filePath: landscapePaths.filePath,
  runtimePath: landscapePaths.runtimePath,
  format: 'webp',
  width: landscapeSize.width,
  height: landscapeSize.height,
  provenance: provenance('landscape', landscapePaths.sourcePath, landscapeDigest)
});
Object.assign(portrait, {
  status: 'benchmark',
  filePath: portraitPaths.filePath,
  runtimePath: portraitPaths.runtimePath,
  format: 'webp',
  width: portraitSize.width,
  height: portraitSize.height,
  provenance: provenance('portrait', portraitPaths.sourcePath, portraitDigest)
});

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
await mkdir(decisionsDirectory, { recursive: true });
const decisionName = `${assetId.replace(/-adventure$/, '')}-${variant}.json`;
await writeFile(
  resolve(decisionsDirectory, decisionName),
  `${JSON.stringify(pendingDecision(asset, variant, landscape, portrait, {
    landscape: landscapeDigest,
    portrait: portraitDigest
  }), null, 2)}\n`,
  'utf8'
);

const generation = spawnSync(process.execPath, ['scripts/generate-production-art-registry.mjs'], {
  cwd: process.cwd(),
  encoding: 'utf8'
});
if (generation.status !== 0) fail(generation.stderr || generation.stdout || 'Registry generation failed.');

console.log(`Imported ${assetId}.${variant} as a responsive benchmark candidate.`);
console.log(`Landscape: ${landscapeSize.width}x${landscapeSize.height}, ${landscapeBuffer.length} bytes, sha256:${landscapeDigest}`);
console.log(`Portrait: ${portraitSize.width}x${portraitSize.height}, ${portraitBuffer.length} bytes, sha256:${portraitDigest}`);
console.log('Human review and explicit promotion remain required.');
