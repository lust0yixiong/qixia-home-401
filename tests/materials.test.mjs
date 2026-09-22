import test from 'node:test';
import assert from 'node:assert/strict';
import {FINISHES,sampleSurface,createFinishLibrary} from '../surface-finishes.js';
import {validatePlan,validateSurfacePlan} from '../material-editor.js';
import * as THREE from '../assets/three.module.js';
import {buildSurfaceRegistry,assignSurfaceMaterial} from '../material-selection.js';
const basic={mode:'original',color:'#ffffff',repeatX:1,repeatY:1,rotation:0,roughness:.6};
test('old category and component plans remain valid',()=>{
 for(const version of [1,2])assert.deepEqual(validatePlan({version,materials:{wood:basic}}).wood,basic);
 const registry=new Map([['stable',{base:'wood'}]]);
 assert.deepEqual(validateSurfacePlan({version:2,surfaces:{stable:{...basic,base:'wood'}}},registry).stable,basic);
});
test('presets and metalness round-trip, reject unknown/malformed before applying',()=>{
 for(const finish of FINISHES){const config={...basic,mode:'preset',preset:finish.id,metalness:finish.metalness};assert.deepEqual(validatePlan({version:3,materials:{wood:config}}).wood,config);}
 for(const config of [{...basic,metalness:2},{...basic,mode:'preset',preset:'unknown'}])assert.throws(()=>validatePlan({version:3,materials:{wood:config}}));
});
test('generated finish tiles join seamlessly and are deterministic',()=>{
 for(const kind of ['oak','walnut','slate','limestone','paint','brushed','fabric'])for(const t of [.11,.39,.78]){
  for(const [a,b] of [[sampleSurface(kind,0,t),sampleSurface(kind,1,t)],[sampleSurface(kind,t,0),sampleSurface(kind,t,1)]]){
   assert(Math.abs(a.height-b.height)<1e-8);assert(Math.abs(a.rough-b.rough)<1e-8);a.color.forEach((v,i)=>assert(Math.abs(v-b.color[i])<1e-8));
  }
 }
});
test('independent PBR detail maps never change the same-class material',()=>{
 const oldDocument=globalThis.document;
 globalThis.document={createElement:()=>({getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}})})};
 try{
  const library=createFinishLibrary(THREE,{capabilities:{getMaxAnisotropy:()=>4}}),material=new THREE.MeshStandardMaterial();
  library.decorate(material,basic,'wood');const clone=material.clone();
  library.decorate(clone,{...basic,rotation:90,repeatX:3},'wood');
  assert.notEqual(clone.bumpMap,material.bumpMap);assert.notEqual(clone.roughnessMap,material.roughnessMap);
  assert.equal(material.bumpMap.repeat.x,1);assert.equal(clone.bumpMap.repeat.x,3);
  library.decorate(clone,{...basic,mode:'custom'},'wood');assert.equal(clone.bumpMap,null);assert.equal(clone.roughnessMap,null);assert.equal(clone.normalMap,null);
  library.dispose(clone);library.dispose(material);
 }finally{globalThis.document=oldDocument;}
});
test('registry stable IDs and slot-specific material assignment',()=>{
 const scene=new THREE.Scene(),wood=new THREE.MeshStandardMaterial(),mesh=new THREE.Mesh(new THREE.BoxGeometry(1,2,3),[wood,wood]);scene.add(mesh);
 const a=buildSurfaceRegistry(scene,{wood},[['wood']]),b=buildSurfaceRegistry(scene,{wood},[['wood']]);assert.deepEqual([...a.registry.keys()],[...b.registry.keys()]);
 const clone=wood.clone();assignSurfaceMaterial([...a.registry.values()][0],clone);assert.equal(mesh.material[0],clone);assert.equal(mesh.material[1],wood);
});

test('scan loading shares in-flight work, rejects incomplete maps, and can retry',async()=>{
 let fail=true,calls=0,disposed=0;
 class Loader{async loadAsync(url){calls++;if(fail&&url.includes('normal'))throw Error('offline');const t=new THREE.Texture();t.dispose=()=>disposed++;return t;}}
 const library=createFinishLibrary({...THREE,TextureLoader:Loader},{capabilities:{getMaxAnisotropy:()=>4}});
 const first=await Promise.allSettled([library.ensure('terrazzo'),library.ensure('terrazzo')]);
 assert(first.every(r=>r.status==='rejected'));assert.equal(calls,3);assert.equal(disposed,2);
 fail=false;const [a,b]=await Promise.all([library.ensure('terrazzo'),library.ensure('terrazzo')]);
 assert.equal(calls,6);assert.equal(a,b);assert(a.normal);assert.equal(a.map.colorSpace,THREE.SRGBColorSpace);assert.equal(a.normal.colorSpace,THREE.NoColorSpace);
 assert.equal(await library.ensure('terrazzo'),a);assert.equal(calls,6);
});

test('reference defaults migrate untouched categories, preserving custom colors and per-part overrides',async()=>{
 const {migrateReferenceDefaults,REFERENCE_REVISION}=await import('../reference-materials.js');
 const wood={...basic,roughness:.58,metalness:0},stone={...basic,repeatX:5,repeatY:5};
 const edited={...wood,color:'#aabbcc'},preset={...wood,mode:'preset',preset:'slab-white'};
 const defaults={wood:{...wood,roughness:.57,map:{}},stone:{...basic,roughness:.72,map:{}},cream:{...basic,color:'#dcd6c9'}};
 const plan={version:3,materials:{wood,stone,cream:edited,countertop:preset},surfaces:{one:{...edited,base:'wood'}}};
 const next=migrateReferenceDefaults(plan,defaults);
 assert.equal(next.materials.wood.roughness,.57);assert.equal(next.materials.stone.repeatX,1);assert(!('map' in next.materials.wood));
 assert.deepEqual(next.materials.cream,edited);assert.deepEqual(next.materials.countertop,preset);assert.deepEqual(next.surfaces,plan.surfaces);
 assert.equal(plan.materials.stone.repeatX,5);assert.equal(next.defaultRevision,REFERENCE_REVISION);
 assert.equal(migrateReferenceDefaults(next,defaults),next);
});
test('separating vanity stone preserves historical surface IDs and accepts old overrides',()=>{
 const scene=new THREE.Scene(),wetTile=new THREE.MeshStandardMaterial(),mesh=new THREE.Mesh(new THREE.BoxGeometry(1,.2,.018),wetTile);scene.add(mesh);
 const before=buildSurfaceRegistry(scene,{wetTile},[['wetTile']]);
 const vanityStone=wetTile.clone();vanityStone.userData.surfaceIdBase='wetTile';mesh.material=vanityStone;
 const after=buildSurfaceRegistry(scene,{wetTile,vanityStone},[['wetTile'],['vanityStone']]);
 const key=[...before.registry.keys()][0];assert.deepEqual([...after.registry.keys()],[key]);
 assert.equal(after.registry.get(key).base,'vanityStone');
 assert.deepEqual(validateSurfacePlan({version:3,surfaces:{[key]:{...basic,base:'wetTile'}}},after.registry)[key],basic);
});
test('reference maps initialize correct defaults and do not multiply the countertop color twice',async()=>{
 const oldDocument=globalThis.document;
 globalThis.document={createElement:()=>({getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}})})};
 try {
  const urls=[];
  class Loader{async loadAsync(url){urls.push(url);return new THREE.Texture();}}
  const lib=createFinishLibrary({...THREE,TextureLoader:Loader},{capabilities:{getMaxAnisotropy:()=>4}});
  await lib.preload();assert.equal(urls.length,5);
  const materials=Object.fromEntries(['wood','stone','countertop','green','vanityStone','cream','wall','linen','duvet','windowFrame'].map(key=>[key,new THREE.MeshStandardMaterial({color:key==='windowFrame'?'#ffffff':'#343936'})]));
  lib.initialize(materials);
  for(const key of ['wood','stone','countertop','green','vanityStone']){assert(materials[key].map);assert.equal(materials[key].color.getHexString(),'ffffff');assert.equal(materials[key].map.colorSpace,THREE.SRGBColorSpace);}
  assert.equal(materials.windowFrame.color.getHexString(),'ffffff');assert.equal(materials.stone.map.repeat.x,1);
  const source=await lib.ensure('ref-countertop');assert.equal(urls.length,5);assert.notEqual(materials.countertop.map,source.map);
  const clone=materials.countertop.clone();lib.decorate(clone,{...basic,repeatX:3},'countertop');assert.notEqual(clone.bumpMap,materials.countertop.bumpMap);assert.equal(materials.countertop.bumpMap.repeat.x,1);
 } finally {globalThis.document=oldDocument;}
});
