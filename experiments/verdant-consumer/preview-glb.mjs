// Zero-dependency, offline diagnostic orthographic renderer for Verdant-generated GLB.
// This is an engineering preview, not Pixel Pals production art or a game renderer.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const minus = (a,b) => [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const normalized = (v) => {const n=Math.hypot(...v);if(n<=0)throw new Error('zero camera vector');return v.map(x=>x/n);};
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));

export function decodeGlb(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length<28 || bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length) throw new Error('invalid GLB header');
  const jsonLen=bytes.readUInt32LE(12);
  if (bytes.toString('ascii',16,20)!=='JSON'||jsonLen<2||jsonLen%4 || 20+jsonLen+8>bytes.length) throw new Error('invalid GLB JSON chunk');
  const json=JSON.parse(bytes.toString('utf8',20,20+jsonLen).trim());
  const off=20+jsonLen;
  const binLength=bytes.readUInt32LE(off);
  if (bytes.toString('ascii',off+4,off+8)!=='BIN\0'||binLength%4!==0||off+8+binLength!==bytes.length) throw new Error('invalid GLB binary chunk');
  if(json.asset?.version!=='2.0'||!Array.isArray(json.meshes)||!Array.isArray(json.nodes)||!Array.isArray(json.accessors)||!Array.isArray(json.bufferViews)||json.buffers?.length!==1||json.buffers[0].byteLength>binLength) throw new Error('invalid glTF scene');
  return {json,binary:bytes.subarray(off+8),bytes};
}

function values(scene,index,components,allowedTypes) {
  const acc=scene.json.accessors[index];
  if (!acc || !allowedTypes.includes(acc.componentType)||!Number.isSafeInteger(acc.count)||acc.count<1 || acc.count>4e6) throw new Error('unsupported or invalid accessor');
  const view=scene.json.bufferViews[acc.bufferView];
  if(!view||view.buffer!==0)throw new Error('missing buffer view');
  const width=acc.componentType===5126||acc.componentType===5125?4:acc.componentType===5123?2:0;
  if (!width) throw new Error('unsupported component width');
  const stride=view.byteStride??width*components;
  if(!Number.isInteger(stride)||stride<width*components||stride>255||stride%width)throw new Error('bad accessor stride');
  const start=(view.byteOffset??0)+(acc.byteOffset??0);
  const limit=(view.byteOffset??0)+view.byteLength;
  if(!Number.isSafeInteger(start)||start<0||!Number.isSafeInteger(limit)||limit>scene.binary.length||start+(acc.count-1)*stride+components*width>limit) throw new Error('out-of-bounds accessor');
  const output=[];
  for(let i=0;i<acc.count;i++){
    const pos=start+i*stride;
    const row=[];
    for(let j=0;j<components;j++){
      const n=acc.componentType===5126?scene.binary.readFloatLE(pos+j*width):acc.componentType===5125?scene.binary.readUInt32LE(pos+j*width):scene.binary.readUInt16LE(pos+j*width);
      if(!finite(n))throw new Error('non-finite vertex');
      row.push(n);
    }
    output.push(components===1?row[0]:row);
  }
  return output;
}

function transform(vertex,node){
  const s=node.scale??[1,1,1],t=node.translation??[0,0,0],q=node.rotation??[0,0,0,1];
  if(s.length!==3||t.length!==3||q.length!==4||![...s,...t,...q].every(finite))throw new Error('bad node transform');
  const p=[vertex[0]*s[0],vertex[1]*s[1],vertex[2]*s[2]],u=q.slice(0,3),v=cross(u,p),w=cross(u,v);
  return p.map((n,i)=>n+2*(q[3]*v[i]+w[i])+t[i]);
}

function rgbaColor(material){
  const rgba=material?.pbrMetallicRoughness?.baseColorFactor??[0.8,0.8,0.8,1];
  if(!Array.isArray(rgba)||rgba.length!==4||!rgba.every(finite))throw new Error('invalid material color');
  return rgba;
}

export function renderPreview(glb,{width=720,height=480}={}){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<64||height<64||width*height>1_000_000)throw new Error('unsupported preview dimensions');
  const scene=decodeGlb(glb),rgba=Buffer.alloc(width*height*4),zbuf=new Float64Array(width*height).fill(-Infinity);
  for(let p=0;p<rgba.length;p+=4){rgba[p]=243;rgba[p+1]=242;rgba[p+2]=234;rgba[p+3]=255;}
  const forward=normalized([-28,-30,-32]);const right=normalized(cross(forward,[0,1,0]));const up=normalized(cross(right,forward));
  const scale=Math.min(width/64,height/47);
  const project=(p)=>[width*0.5+dot(p,right)*scale,height*0.54-dot(p,up)*scale,dot(p,forward)];
  const light=normalized([-0.42,0.85,0.38]);
  let triangles=0,paintedPixels=0;
  for(const node of scene.json.nodes){
    if(!Number.isInteger(node.mesh))continue;
    const mesh=scene.json.meshes[node.mesh];if(!mesh?.primitives?.length)throw new Error('missing mesh primitives');
    for(const primitive of mesh.primitives){
      if((primitive.mode??4)!==4||!Number.isInteger(primitive.indices)||!Number.isInteger(primitive.attributes?.POSITION))throw new Error('unsupported non-triangle primitive');
      const positions=values(scene,primitive.attributes.POSITION,3,[5126]).map(v=>transform(v,node)).map(project);
      const indices=values(scene,primitive.indices,1,[5123,5125]);
      if(indices.length%3)throw new Error('non-triangle index count');
      const color=rgbaColor(scene.json.materials?.[primitive.material]);
      for(let k=0;k<indices.length;k+=3){
        const p=positions[indices[k]],q=positions[indices[k+1]],r=positions[indices[k+2]];
        if(!p||!q||!r)throw new Error('out-of-range triangle index');
        triangles++;
        const minX=clamp(Math.floor(Math.min(p[0],q[0],r[0])),0,width-1),maxX=clamp(Math.ceil(Math.max(p[0],q[0],r[0])),0,width-1);
        const minY=clamp(Math.floor(Math.min(p[1],q[1],r[1])),0,height-1),maxY=clamp(Math.ceil(Math.max(p[1],q[1],r[1])),0,height-1);
        if(minX>maxX||minY>maxY)continue;
        const cross2=(a,b,c)=>(c[0]-a[0])*(b[1]-a[1])-(c[1]-a[1])*(b[0]-a[0]);
        const area=cross2(p,q,r);if(Math.abs(area)<1e-7)continue;
        const norm=normalized(cross(minus(q,p),minus(r,p)));
        const shade=clamp(0.70+0.30*Math.abs(dot(norm,light)),0.68,1.0);
        const ink=color.slice(0,3).map(x=>Math.round(clamp(x*shade,0,1)*255));
        for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
          const sample=[x+0.5,y+0.5];const w0=cross2(q,r,sample)/area,w1=cross2(r,p,sample)/area,w2=cross2(p,q,sample)/area;
          if(w0 < -1e-6||w1 < -1e-6||w2 < -1e-6)continue;
          const z=w0*p[2]+w1*q[2]+w2*r[2],n=y*width+x;if(z<=zbuf[n])continue;
          zbuf[n]=z;const j=4*n;rgba[j]=ink[0];rgba[j+1]=ink[1];rgba[j+2]=ink[2];rgba[j+3]=255;paintedPixels++;
        }
      }
    }
  }
  if(triangles===0||paintedPixels===0)throw new Error('empty/offscreen preview');
  return {png:encodePng(width,height,rgba),width,height,triangles,paintedPixels};
}

let crcTable;
function crc32(data){
  if(!crcTable)crcTable=Array.from({length:256},(_,i)=>{let x=i;for(let k=0;k<8;k++)x=(x>>>1)^((x&1)?0xedb88320:0);return x>>>0;});
  let result=0xffffffff;for(const b of data)result=(result>>>8)^crcTable[(result^b)&255];return (result^0xffffffff)>>>0;
}
function pngChunk(type,data){const typeBuf=Buffer.from(type,'ascii');const size=Buffer.alloc(4);size.writeUInt32BE(data.length);const check=Buffer.alloc(4);check.writeUInt32BE(crc32(Buffer.concat([typeBuf,data])));return Buffer.concat([size,typeBuf,data,check]);}
export function encodePng(width,height,rgba){
  if(rgba.length!==width*height*4)throw new Error('bad rgba byte count');
  const header=Buffer.alloc(13);header.writeUInt32BE(width,0);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
  const line=width*4;const raw=Buffer.alloc(height*(line+1));for(let y=0;y<height;y++)rgba.copy(raw,y*(line+1)+1,y*line,(y+1)*line);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),pngChunk('IHDR',header),pngChunk('IDAT',deflateSync(raw,{level:9})),pngChunk('IEND',Buffer.alloc(0))]);
}

if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){
  const [input,landscape,portrait,manifestPath]=process.argv.slice(2);
  if(!input||!landscape||!portrait||!manifestPath){console.error('usage: node preview-glb.mjs <in.glb> <landscape.png> <portrait.png> <manifest.json>');process.exit(2);}
  const bytes=readFileSync(input);
  const variants=[{name:'landscape',width:720,height:480,path:landscape},{name:'portrait',width:480,height:720,path:portrait}];
  const report={status:'PASS',kind:'unapproved-diagnostic-preview',glbSha256:hash(bytes),views:[]};
  for(const v of variants){const o=renderPreview(bytes,v);mkdirSync(dirname(v.path),{recursive:true});writeFileSync(v.path,o.png);report.views.push({name:v.name,width:o.width,height:o.height,triangles:o.triangles,paintedPixels:o.paintedPixels,bytes:o.png.length,sha256:hash(o.png)});}
  mkdirSync(dirname(manifestPath),{recursive:true});writeFileSync(manifestPath,JSON.stringify(report,null,2)+'\n');
  console.log('VERDANT_PREVIEW_PASS '+JSON.stringify(report));
}
