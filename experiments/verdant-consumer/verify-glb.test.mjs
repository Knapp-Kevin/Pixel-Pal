import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectGlb } from './verify-glb.mjs';

// Small, fully self-contained GLB generated in memory. No Verdant process or
// external fixtures required, so negative resource cases fail before Rust CI.
function fixture(edit = () => {}) {
  const document = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: ['orchard-ground', 'stone-bridge', 'orchard-stream', 'memory-tree', 'path-0', 'path-1']
      .map((name, index) => ({ name, ...(index === 0 ? { mesh: 0 } : {}) })),
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }] }],
    materials: [{ name: 'ground' }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 3, type: 'VEC3' },
      { bufferView: 1, componentType: 5123, count: 3, type: 'SCALAR' }
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 36 },
      { buffer: 0, byteOffset: 36, byteLength: 6 }
    ],
    buffers: [{ byteLength: 44 }]
  };
  edit(document);
  let json = Buffer.from(JSON.stringify(document), 'utf8');
  const pad = (4 - json.length % 4) % 4;
  if (pad) json = Buffer.concat([json, Buffer.alloc(pad, 0x20)]);
  const binary = Buffer.alloc(44);
  const glb = Buffer.alloc(12 + 8 + json.length + 8 + binary.length);
  glb.write('glTF', 0, 'ascii');
  glb.writeUInt32LE(2, 4);
  glb.writeUInt32LE(glb.length, 8);
  glb.writeUInt32LE(json.length, 12);
  glb.write('JSON', 16, 'ascii');
  json.copy(glb, 20);
  const binOffset = 20 + json.length;
  glb.writeUInt32LE(binary.length, binOffset);
  glb.write('BIN\0', binOffset + 4, 'ascii');
  binary.copy(glb, binOffset + 8);
  return glb;
}

test('accepts a structurally valid, wholly embedded orchard GLB', () => {
  const result = inspectGlb(fixture());
  assert.equal(result.triangles, 1);
  assert.equal(result.nodes, 6);
  assert.equal(result.meshes, 1);
});

test('rejects remotely loaded texture images despite embedded geometry buffers', () => {
  assert.throws(
    () => inspectGlb(fixture(doc => { doc.images = [{ uri: 'https://example.invalid/pal.png' }]; })),
    /image 0 must not reference a URI/
  );
});

test('rejects local file and data URI images, which bypass the embedded BIN contract', () => {
  for (const uri of ['file:///tmp/secret.webp', 'data:image/png;base64,iVBORw0KGgo=']) {
    assert.throws(
      () => inspectGlb(fixture(doc => { doc.images = [{ uri }]; })),
      /image 0 must not reference a URI/
    );
  }
});

test('accepts a declared embedded image buffer view and referencing texture', () => {
  const glb = fixture(doc => {
    doc.images = [{ bufferView: 0, mimeType: 'image/png' }];
    doc.textures = [{ source: 0 }];
  });
  assert.equal(inspectGlb(glb).triangles, 1);
});

test('rejects image bufferViews outside the embedded BIN index', () => {
  assert.throws(
    () => inspectGlb(fixture(doc => {
      doc.images = [{ bufferView: 999, mimeType: 'image/png' }];
    })),
    /must use a declared embedded BIN bufferView/
  );
});

test('rejects undeclared or unsupported image MIME types', () => {
  for (const mimeType of ['image/svg+xml', 'text/html', undefined]) {
    assert.throws(
      () => inspectGlb(fixture(doc => {
        doc.images = [{ bufferView: 0, ...(mimeType ? { mimeType } : {}) }];
      })),
      /must declare an allowed MIME type/
    );
  }
});

test('rejects a texture pointing outside the embedded image collection', () => {
  assert.throws(
    () => inspectGlb(fixture(doc => {
      doc.images = [{ bufferView: 0, mimeType: 'image/jpeg' }];
      doc.textures = [{ source: 3 }];
    })),
    /texture 0 must reference an embedded image/
  );
});

test('continues rejecting non-embedded geometry buffer URIs', () => {
  assert.throws(
    () => inspectGlb(fixture(doc => { doc.buffers[0].uri = 'https://example.invalid/mesh.bin'; })),
    /must be self-contained/
  );
});

test('rejects unsupported texture metadata and malformed arrays', () => {
  assert.throws(
    () => inspectGlb(fixture(doc => { doc.images = { uri: 'https://example.invalid/img.png' }; })),
    /images must be an array/
  );
  assert.throws(
    () => inspectGlb(fixture(doc => { doc.textures = [null]; })),
    /texture 0 must be an object/
  );
});
