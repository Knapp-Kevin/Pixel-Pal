import { access, readFile, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve(process.argv[2] ?? 'apps/tablet/dist');
const requiredFiles = [
  'index.html',
  'manifest.webmanifest',
  'pixel-pals-icon.svg',
  'pixel-pals-maskable.svg',
  '_headers',
  'sw.js'
];

function fail(message) {
  throw new Error(`Build artifact verification failed: ${message}`);
}

for (const file of requiredFiles) {
  const path = resolve(dist, file);
  await access(path, constants.R_OK).catch(() => fail(`missing ${file}`));
  const details = await stat(path);
  if (!details.isFile() || details.size === 0) fail(`${file} is empty or not a file`);
}

const manifest = JSON.parse(await readFile(resolve(dist, 'manifest.webmanifest'), 'utf8'));
if (manifest.name !== 'Pixel Pals') fail('manifest name is not Pixel Pals');
if (manifest.display !== 'standalone') fail('manifest must use standalone display');
if (manifest.orientation !== 'landscape') fail('manifest must request landscape orientation');

const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
const standardIcon = icons.find((icon) => icon.src === '/pixel-pals-icon.svg' && String(icon.purpose).includes('any'));
const maskableIcon = icons.find((icon) => icon.src === '/pixel-pals-maskable.svg' && String(icon.purpose).includes('maskable'));
if (!standardIcon) fail('standard install icon is not registered');
if (!maskableIcon) fail('maskable install icon is not registered');

const headers = await readFile(resolve(dist, '_headers'), 'utf8');
for (const requirement of [
  'Content-Security-Policy:',
  "frame-ancestors 'none'",
  'X-Content-Type-Options: nosniff',
  'Referrer-Policy: no-referrer',
  'Permissions-Policy:',
  '/manifest.webmanifest',
  '/sw.js',
  'Cache-Control: no-cache'
]) {
  if (!headers.includes(requirement)) fail(`_headers is missing ${requirement}`);
}

const index = await readFile(resolve(dist, 'index.html'), 'utf8');
if (!index.includes('manifest.webmanifest')) fail('index.html does not link the generated manifest');

console.log(`Verified Pixel Pals build artifacts in ${dist}`);
console.log(`Manifest icons: ${icons.length}; required files: ${requiredFiles.length}`);
