// Independent static validation of exported GLB. No Verdant runtime or external packages.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';
import assert from 'node:assert/strict';

const digest = (buf) => createHash('sha256').update(buf).digest('hex');

export function inspectGlb(bytes) {
  assert.ok(Buffer.isBuffer(bytes) && bytes.length >= 20, 'too-small GLB');
  assert.equal(bytes.toString('ascii', 0, 4), 'glTF', 'GLB magic');
  assert.equal(bytes.readUInt32LE(4), 2, 'GLB version');
  assert.equal(bytes.readUInt32LE(8), bytes.length, 'file length must match header');
  let pos = 12;
  const chunks = [];
  while (pos < bytes.length) {
    assert.ok(pos + 8 <= bytes.length, 'truncated chunk header');
    const size = bytes.readUInt32LE(pos);
    const kind = bytes.toString('ascii', pos + 4, pos + 8);
    pos += 8;
    assert.equal(size % 4, 0, 'chunk must be 4-byte aligned');
    assert.ok(pos + size <= bytes.length, 'chunk exceeds file');
    chunks.push({ kind, content: bytes.subarray(pos, pos + size) });
    pos += size;
  }
  assert.equal(pos, bytes.length, 'no trailing data');
  assert.equal(chunks[0]?.kind, 'JSON', 'first chunk must be JSON');
  assert.equal(chunks[1]?.kind, 'BIN\0', 'second chunk must be BIN');
  assert.equal(chunks.length, 2, 'no unknown chunks');
  const json = JSON.parse(chunks[0].content.toString('utf8').trim());
  assert.equal(json.asset?.version, '2.0', 'valid glTF asset version');
  assert.ok(Array.isArray(json.scenes) && json.scenes.length, 'must have scene');
  assert.ok(Array.isArray(json.nodes) && json.nodes.length, 'must have nodes');
  assert.ok(Array.isArray(json.meshes) && json.meshes.length, 'must have meshes');
  assert.ok(Array.isArray(json.materials) && json.materials.length, 'must have materials');
  assert.ok(Array.isArray(json.accessors) && json.accessors.length, 'must have accessors');
  assert.ok(Array.isArray(json.bufferViews) && json.bufferViews.length, 'must have views');
  assert.ok(Array.isArray(json.buffers) && json.buffers.length === 1, 'one embedded BIN buffer');
  assert.equal(json.buffers[0].uri, undefined, 'must be self-contained');
  assert.equal((json.extensionsRequired ?? []).length, 0, 'no required extensions');
  assert.ok(json.buffers[0].byteLength <= chunks[1].content.length, 'declared binary within BIN');
  for (const view of json.bufferViews) {
    assert.equal(view.buffer, 0, 'only buffer 0 allowed');
    assert.ok(Number.isSafeInteger(view.byteLength) && view.byteLength > 0, 'nonempty buffer view');
    assert.ok((view.byteOffset ?? 0) + view.byteLength <= chunks[1].content.length, 'view within BIN');
  }
  let triangles = 0;
  for (const mesh of json.meshes) {
    assert.ok(Array.isArray(mesh.primitives) && mesh.primitives.length, 'mesh has primitives');
    for (const primitive of mesh.primitives) {
      assert.ok(Number.isInteger(primitive.indices), 'indexed mesh required');
      const index = json.accessors[primitive.indices];
      assert.ok(index && index.count > 0 && index.count % 3 === 0, 'triangle indices required');
      assert.equal(primitive.mode ?? 4, 4, 'triangle topology');
      assert.ok(json.accessors[primitive.attributes?.POSITION]?.count >= 3, 'position accessor');
      assert.ok(primitive.material >= 0 && primitive.material < json.materials.length, 'material reference');
      triangles += index.count / 3;
    }
  }
  const names = new Set(json.nodes.map((node) => node.name).filter(Boolean));
  for (const needed of ['orchard-ground', 'stone-bridge', 'orchard-stream', 'memory-tree', 'path-0', 'path-1']) {
    assert.ok(names.has(needed), 'missing expected authored node ' + needed);
  }
  return {
    nodes: json.nodes.length, meshes: json.meshes.length,
    materials: json.materials.length, triangles,
    names: [...names].sort(), bytes: bytes.length,
  };
}

export function compareGlbs(first, second) {
  const a = inspectGlb(first);
  const b = inspectGlb(second);
  assert.deepEqual(a, b, 'same semantic properties');
  assert.ok(first.equals(second), 'two exports of same input must be byte-identical');
  return { ...a, sha256: digest(first) };
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const [left, right, output] = process.argv.slice(2);
  if (!left || !right || !output) {
    process.stderr.write('usage: node verify-glb.mjs <first.glb> <second.glb> <manifest.json>\n');
    process.exit(2);
  }
  const summary = compareGlbs(readFileSync(left), readFileSync(right));
  const manifest = {
    status: 'PASS', engine: 'verdant-core', version: '2.21.7',
    upstreamCommit: 'cf25bac29df05f97573ca5ef2a1d83c2f201aff3',
    inputSha256: digest(readFileSync(new URL('./orchard.json', import.meta.url))),
    ...summary,
    provenance: 'isolated experiment only; no Pixel Pals game saves or runtime import'
  };
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify(manifest, null, 2) + '\n');
  console.log('VERDANT_EXTERNAL_CONSUMER_PASS ' + JSON.stringify(manifest));
}
