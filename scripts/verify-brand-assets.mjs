import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
const expected = [
  ['assets/brand/readme-banner.png', 1600, 520],
  ['assets/brand/social-preview.png', 1280, 640]
];
for (const [file, width, height] of expected) {
  const path = resolve(file);
  const stats = await stat(path).catch(() => null);
  if (!stats?.isFile() || stats.size < 20000 || stats.size > 5000000)
    throw new Error(file + ' must be a PNG of 20 KB to 5 MB');
  const image = await readFile(path);
  if (!image.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
    throw new Error(file + ' is not a PNG');
  const w = image.readUInt32BE(16), h = image.readUInt32BE(20);
  if (w !== width || h !== height)
    throw new Error(file + ' dimensions ' + w + 'x' + h + ' expected ' + width + 'x' + height);
  console.log('PASS ' + file + ' ' + w + 'x' + h);
}
