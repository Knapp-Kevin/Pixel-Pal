import test from 'node:test';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import { renderPreview, decodeGlb, encodePng } from './preview-glb.mjs';

function glbTriangle({color=[0.6,0.9,0.4,1],index=2,overlap=false}={}) {
  const bin=Buffer.alloc(44);
  const positions=[-4,0,-4, 4,0,-4, 0,0,4];
  positions.forEach((v,i)=>bin.writeFloatLE(v,i*4));
  [0,1,index].forEach((v,i)=>bin.writeUInt16LE(v,36+i*2));
  const doc={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{name:'probe',mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0},indices:1,material:0}]}],materials:[{pbrMetallicRoughness:{baseColorFactor:color}}],buffers:[{byteLength:bin.length}],bufferViews:[{buffer:0,byteOffset:0,byteLength:36},{buffer:0,byteOffset:36,byteLength:6}],accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3'},{bufferView:1,componentType:5123,count:3,type:'SCALAR'}]};
  if (overlap) {
    doc.nodes=[{name:'far',mesh:0}, {name:'near',mesh:1,translation:[2.8,3,3.2]}];
    doc.scenes[0].nodes=[0,1];
    doc.meshes.push({primitives:[{attributes:{POSITION:0},indices:1,material:1}]});
    doc.materials=[
      {pbrMetallicRoughness:{baseColorFactor:[0.2,0.85,0.25,1]}},
      {pbrMetallicRoughness:{baseColorFactor:[0.9,0.2,0.2,1]}}
    ];
  }
  let json=Buffer.from(JSON.stringify(doc));while(json.length%4)json=Buffer.concat([json,Buffer.from(' ')]);
  const out=Buffer.alloc(12+8+json.length+8+bin.length);
  out.write('glTF',0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(json.length,12);out.write('JSON',16);json.copy(out,20);
  const off=20+json.length;out.writeUInt32LE(bin.length,off);out.write('BIN\0',off+4);bin.copy(out,off+8);
  return out;
}

test('produces deterministic nonblank RGBA PNG with exact dimensions',()=>{
  const glb=glbTriangle();const a=renderPreview(glb,{width:320,height:240});const b=renderPreview(glb,{width:320,height:240});
  assert.ok(a.png.equals(b.png));assert.equal(a.width,320);assert.equal(a.height,240);
  assert.equal(a.triangles,1);assert.ok(a.paintedPixels>0);
  assert.deepEqual([...a.png.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  assert.equal(a.png.readUInt32BE(16),320);assert.equal(a.png.readUInt32BE(20),240);
});

test('portrait view is independently rendered, not stretched landscape',()=>{
  const glb=glbTriangle();const land=renderPreview(glb,{width:320,height:240});const port=renderPreview(glb,{width:240,height:320});
  assert.notDeepEqual(land.png,port.png);assert.ok(port.paintedPixels>0);
  assert.equal(port.png.readUInt32BE(16),240);assert.equal(port.png.readUInt32BE(20),320);
});

test('material changes visibly change preview binary',()=>{
  const green=renderPreview(glbTriangle({color:[0.4,0.8,0.4,1]}),{width:200,height:200});
  const red=renderPreview(glbTriangle({color:[0.8,0.3,0.2,1]}),{width:200,height:200});
  assert.ok(!green.png.equals(red.png));
});

test('refuses truncated GLB header, malformed indices and huge preview dimensions',()=>{
  const good=glbTriangle();assert.throws(()=>decodeGlb(good.subarray(0,-1)),/invalid GLB header/);
  assert.throws(()=>renderPreview(glbTriangle({index:10}),{width:200,height:200}),/out-of-range triangle index/);
  assert.throws(()=>renderPreview(good,{width:2000,height:2000}),/unsupported preview dimensions/);
});

test('PNG encoder enforces exactly width * height * 4 bytes',()=>{
  assert.throws(()=>encodePng(80,80,Buffer.alloc(3)),/bad rgba byte count/);
});

test('near geometry occludes far geometry in camera depth order',()=>{
  const {png}=renderPreview(glbTriangle({overlap:true}),{width:240,height:240});
  const offset=33,size=png.readUInt32BE(offset);
  assert.equal(png.toString('ascii',offset+4,offset+8),'IDAT');
  const raw=inflateSync(png.subarray(offset+8,offset+8+size));
  let red=0,green=0;
  for(let y=0;y<240;y++)for(let x=0;x<240;x++){
    const i=y*(240*4+1)+1+x*4;
    const r=raw[i],g=raw[i+1],b=raw[i+2];
    if(r>g*1.25&&r>b*1.25)red++;
    if(g>r*1.25&&g>b*1.25)green++;
  }
  assert.ok(red>30, 'front red geometry should be visible');
  assert.equal(green,0, 'rear green geometry should be fully hidden');
});
