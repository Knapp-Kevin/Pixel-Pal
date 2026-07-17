import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';

function fail(message) {
  throw new Error(`Pal candidate import verification failed: ${message}`);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function transparentPng(width, height) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const rowBytes = width * 4 + 1;
  const pixels = Buffer.alloc(rowBytes * height);
  for (let row = 0; row < height; row += 1) pixels[row * rowBytes] = 0;
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(pixels)),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function run(script, args, options) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: options.cwd,
    env: options.env,
    encoding: 'utf8'
  });
}

const repositoryRoot = process.cwd();
const importScript = resolve('scripts/import-pal-candidate.mjs');
const verifyScript = resolve('scripts/verify-pal-candidate-manifest.mjs');
const temporaryRoot = await mkdtemp(join(tmpdir(), 'pixel-pals-pal-import-'));

try {
  const manifestTarget = join(temporaryRoot, 'art', 'pal-candidate-manifest.json');
  const reviewDirectory = join(temporaryRoot, 'art', 'review', 'candidates', 'pals');
  const sourcePath = join(temporaryRoot, 'fixture.png');
  await mkdir(dirname(manifestTarget), { recursive: true });
  await mkdir(reviewDirectory, { recursive: true });
  await copyFile(resolve('art/pal-candidate-manifest.json'), manifestTarget);
  await writeFile(sourcePath, transparentPng(512, 512));

  const environment = {
    ...process.env,
    PAL_CANDIDATE_MANIFEST_PATH: manifestTarget,
    PAL_CANDIDATE_REVIEW_DIRECTORY: reviewDirectory
  };
  const importArgs = [
    '--character-key', 'starter-fox',
    '--asset-key', 'idle-happy',
    '--source', sourcePath,
    '--creator', 'Pixel Pals CI fixture',
    '--ownership-basis', 'Generated test fixture',
    '--source-references', 'ci:transparent-png-fixture',
    '--created-at', '2026-07-17T00:00:00.000Z'
  ];

  const first = run(importScript, importArgs, { cwd: temporaryRoot, env: environment });
  if (first.status !== 0) fail(first.stderr || first.stdout || 'first import failed.');

  const manifest = JSON.parse(await readFile(manifestTarget, 'utf8'));
  const fox = manifest.characters.find((entry) => entry.key === 'starter-fox');
  const asset = fox?.assets?.['idle-happy'];
  if (!asset) fail('first import did not populate starter-fox.idle-happy.');
  if (fox.reviewState !== 'candidate' || fox.decision !== 'pending') fail('first import did not set pending candidate state.');
  if (asset.width !== 512 || asset.height !== 512 || asset.format !== 'png' || asset.alphaChannel !== true) {
    fail('first import did not preserve transparent PNG metadata.');
  }
  const reviewPath = join(reviewDirectory, 'starter-fox-idle-happy.json');
  const review = JSON.parse(await readFile(reviewPath, 'utf8'));
  if (review.assetSha256 !== asset.sha256 || review.decision !== 'pending') {
    fail('candidate review record is not bound to the imported digest.');
  }

  const verification = run(verifyScript, [], { cwd: temporaryRoot, env: environment });
  if (verification.status !== 0) fail(verification.stderr || verification.stdout || 'candidate verification failed.');

  const duplicate = run(importScript, importArgs, { cwd: temporaryRoot, env: environment });
  if (duplicate.status === 0 || !`${duplicate.stderr}${duplicate.stdout}`.includes('already exists')) {
    fail('duplicate import did not require explicit replacement.');
  }

  const replacement = run(importScript, [...importArgs, '--replace', 'true'], { cwd: temporaryRoot, env: environment });
  if (replacement.status !== 0) fail(replacement.stderr || replacement.stdout || 'explicit replacement failed.');

  console.log('Verified transparent PNG intake, manifest update, digest-bound review, duplicate protection, and explicit replacement.');
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
