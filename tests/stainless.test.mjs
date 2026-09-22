import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as THREE from '../assets/three.module.js';
import {STAINLESS_FINISHES,sampleStainless,stainlessPixels} from '../stainless-finishes.mjs';
import {createFinishLibrary} from '../surface-finishes.js';
test('six steel finishes tile without seams, stay distinct, and mirror normals remain flat',()=>{
 const hashes=new Set();assert.equal(STAINLESS_FINISHES.length,6);
 for(const p of STAINLESS_FINISHES){
  for(const t of [.03,.29,.71])for(const [a,b] of [[sampleStainless(p.id,0,t),sampleStainless(p.id,1,t)],[sampleStainless(p.id,t,0),sampleStainless(p.id,t,1)]]){
   assert(Math.abs(a.height-b.height)<1e-8);assert(Math.abs(a.rough-b.rough)<1e-8);
  }
  const maps=stainlessPixels(p.id,128);hashes.add(createHash('sha256').update(maps.normal).update(maps.rough).digest('hex'));
  for(let i=0;i<maps.normal.length;i+=4){assert(maps.normal[i+2]>=127);assert.equal(maps.normal[i+3],255);assert.equal(maps.rough[i+3],255);}
  if(p.id==='steel-mirror')for(let i=0;i<maps.normal.length;i+=4)assert.deepEqual([...maps.normal.slice(i,i+4)],[128,128,255,255]);
 }
 assert.equal(hashes.size,6);
});
test('steel uses normal maps for photo rendering and isolates per-part rotations',()=>{
 const old=globalThis.document;
 globalThis.document={createElement:()=>({getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}})})};
 try{
  const lib=createFinishLibrary(THREE,{capabilities:{getMaxAnisotropy:()=>8}}),a=new THREE.MeshStandardMaterial(),b=a.clone();
  const preset=STAINLESS_FINISHES.find(p=>p.id==='steel-diamond');
  const config={mode:'preset',preset:preset.id,metalness:1,repeatX:1,repeatY:1,rotation:0};
  lib.decorate(a,config,'countertop');lib.decorate(b,{...config,rotation:90,repeatX:3},'countertop');
  assert(a.normalMap);assert.equal(a.bumpMap,null);assert.equal(lib.get(preset.id).map,null);
  assert.equal(a.normalMap.colorSpace,THREE.NoColorSpace);assert.notEqual(a.normalMap,b.normalMap);
  assert.equal(a.normalMap.rotation,0);assert.equal(b.normalMap.rotation,Math.PI/2);assert.equal(a.normalMap.repeat.x,1);assert.equal(b.normalMap.repeat.x,3);
  assert.equal(a.metalness,1);assert.equal(a.envMapIntensity,.9);
  lib.decorate(b,{mode:'solid',repeatX:1,repeatY:1,rotation:0,metalness:0},'countertop');
  assert.equal(b.normalMap,null);assert.equal(b.roughnessMap,null);assert.equal(b.envMapIntensity,.48);assert(a.normalMap);
 }finally{globalThis.document=old;}
});
