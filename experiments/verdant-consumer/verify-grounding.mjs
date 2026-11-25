// Independent, zero-dependency spatial audit of the Verdant Orchard GLB.
// Checks the consumer's authored geometry against the actual exported terrain triangles.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { decodeGlb } from './preview-glb.mjs';

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const ensure = (condition, message) => { if (!condition) throw new Error(message); };

function accessor(scene, id, shape) {
  const a=scene.json.accessors?.[id],v=scene.json.bufferViews?.[a?.bufferView];
  ensure(a && v && v.buffer === 0 && a.type === shape && Number.isSafeInteger(a.count) && a.count>0, 'invalid '+shape+' accessor');
  const n=shape==='VEC3'?3:1;
  const allowed=shape==='VEC3'?[5126]:[5123,5125];
  ensure(allowed.includes(a.componentType), 'invalid '+shape+' component type');
  const width=a.componentType===5123?2:4;
  const step=v.byteStride??n*width;
  const start=(v.byteOffset??0)+(a.byteOffset??0);
  const limit=(v.byteOffset??0)+v.byteLength;
  ensure(start>=0&&step>=n*width&&start+(a.count-1)*step+n*width<=limit&&limit<=scene.binary.length,'accessor outside BIN');
  const rows=[];
  for(let i=0;i<a.count;i++){
    const at=start+i*step;
    const vals=[];
    for(let j=0;j<n;j++)vals.push(a.componentType===5126?scene.binary.readFloatLE(at+4*j):a.componentType===5125?scene.binary.readUInt32LE(at+4*j):scene.binary.readUInt16LE(at+2*j));
    ensure(vals.every(Number.isFinite),'non-finite accessor');
    rows.push(n===1?vals[0]:vals);
  }
  return rows;
}

function geometry(scene,name) {
  const node=scene.json.nodes.find(n=>n.name===name);
  ensure(node && Number.isInteger(node.mesh), 'missing named node: '+name);
  const p=scene.json.meshes[node.mesh]?.primitives?.[0];
  ensure(p && Number.isInteger(p.attributes?.POSITION) && Number.isInteger(p.indices),'missing geometry: '+name);
  const rotation=node.rotation??[0,0,0,1],scale=node.scale??[1,1,1];
  ensure(rotation.every((x,i)=>Math.abs(x-[0,0,0,1][i])<1e-5) && scale.every(x=>Math.abs(x-1)<1e-5),'audit does not support transformed meshes: '+name);
  const t=node.translation??[0,0,0];
  ensure(t.length===3 && t.every(Number.isFinite),'invalid node translation: '+name);
  return {name,vertices:accessor(scene,p.attributes.POSITION,'VEC3').map(v=>v.map((x,i)=>x+t[i])),faces:accessor(scene,p.indices,'SCALAR')};
}

function terrainSampler(mesh) {
  const triangles=[];
  for(let i=0;i<mesh.faces.length;i+=3){
    const a=mesh.vertices[mesh.faces[i]],b=mesh.vertices[mesh.faces[i+1]],c=mesh.vertices[mesh.faces[i+2]];
    ensure(a&&b&&c,'terrain index out of range');
    triangles.push([a,b,c]);
  }
  return (x,z)=>{
    for(const [a,b,c] of triangles){
      const ux=b[0]-a[0],uz=b[2]-a[2],vx=c[0]-a[0],vz=c[2]-a[2],det=ux*vz-uz*vx;
      if(Math.abs(det)<1e-12)continue;
      const px=x-a[0],pz=z-a[2],u=(px*vz-pz*vx)/det,v=(ux*pz-uz*px)/det;
      if(u>=-1e-6&&v>=-1e-6&&u+v<=1+1e-6)return a[1]+u*(b[1]-a[1])+v*(c[1]-a[1]);
    }
    throw new Error('no terrain sample at '+x+','+z);
  };
}

export function verifyGrounding(bytes) {
  const scene=decodeGlb(bytes),ground=geometry(scene,'orchard-ground'),sample=terrainSampler(ground);
  const trees={};
  for(const name of ['canopy-west','canopy-east','memory-tree']){
    const node=scene.json.nodes.find(n=>n.name===name);
    const mesh=geometry(scene,name);
    const base=Math.min(...mesh.vertices.map(v=>v[1]));
    const [x,,z]=node.translation;
    const delta=base-sample(x,z);
    ensure(Math.abs(delta)<=0.03,name+' base floats/buries relative to terrain by '+delta.toFixed(3)+'m');
    trees[name]=Number(delta.toFixed(5));
  }
  const bridge=scene.json.nodes.find(n=>n.name==='stone-bridge');
  ensure(bridge,'missing stone bridge');
  const bridgeGround=sample(bridge.translation[0],bridge.translation[2]);
  const bridgeOffset=bridge.translation[1]-bridgeGround;
  ensure(Math.abs(bridgeOffset-0.15)<0.03,'bridge anchor out of terrain range');
  const ranges={};
  for(const name of ['path-0','path-1','orchard-stream']){
    const mesh=geometry(scene,name);
    const deviations=mesh.vertices.map(v=>v[1]-sample(v[0],v[2]));
    const min=Math.min(...deviations),max=Math.max(...deviations);
    if(name==='orchard-stream')ensure(min>=0.025&&max<=0.065,'stream should track terrain within 2cm');
    else ensure(min>=0.045&&max<=0.94,'path should track terrain with bounded bridge approach');
    ranges[name]={min:Number(min.toFixed(4)),max:Number(max.toFixed(4)),vertices:mesh.vertices.length};
  }
  ensure(ranges['path-0'].vertices>=18&&ranges['path-1'].vertices>=18&&ranges['orchard-stream'].vertices>=18,'no terrain ribbon tessellation');
  const result={status:'PASS',glbSha256:sha256(bytes),treeBaseOffsetsMeters:trees,bridgeAnchorOffsetMeters:Number(bridgeOffset.toFixed(4)),ribbons:ranges};
  return result;
}

if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){
  const [glb,manifest]=process.argv.slice(2);
  if(!glb||!manifest){console.error('usage: node verify-grounding.mjs <orchard.glb> <manifest.json>');process.exit(2);}
  try{
    const report=verifyGrounding(readFileSync(glb));
    mkdirSync(dirname(manifest),{recursive:true});writeFileSync(manifest,JSON.stringify(report,null,2)+'\n');
    console.log('VERDANT_GROUNDING_PASS '+JSON.stringify(report));
  }catch(err){console.error('VERDANT_GROUNDING_REJECTED '+err.message);process.exit(1);}
}
