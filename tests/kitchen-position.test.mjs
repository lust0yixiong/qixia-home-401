import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/three.module.js';
import {createKitchenPosition,createFridgePerson,normalizeKitchenPosition} from '../kitchen-position.mjs';
import {kitchenLayout as K,cookingWallLayout as C} from '../kitchen-layout.mjs';
import {createPhotoSnapshot} from '../photo-scene.mjs';
const near=(a,b)=>assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);
test('island, dining, seats, sink and outlets translate together without cumulative drift',()=>{
 const scene=new THREE.Scene(),names=['island','table','chair','stool','bench','sink','outlet'];
 const parts=names.map((n,i)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1),new THREE.MeshStandardMaterial());m.name=n;m.position.set(i,.3,i/2);scene.add(m);return m;});
 const fixed=new THREE.Group();fixed.position.set(3,0,4);scene.add(fixed);
 const originals=parts.map(p=>p.position.clone()),geometries=parts.map(p=>p.geometry),materials=parts.map(p=>p.material);
 const placement=createKitchenPosition({THREE,scene,parts,layout:K,cooking:C});near(placement.offsetCm,10);
 for(const cm of [10,50,-30,0,20,10]){placement.setOffset(cm);scene.updateMatrixWorld(true);parts.forEach((p,i)=>{const v=p.getWorldPosition(new THREE.Vector3());near(v.x,originals[i].x);near(v.y,originals[i].y);near(v.z,originals[i].z+cm/100);assert.equal(p.geometry,geometries[i]);assert.equal(p.material,materials[i]);});near(fixed.position.z,4);near(placement.clearances().entry,K.clearances.islandToEntry-cm/100);}
 near(normalizeKitchenPosition(999),50);near(normalizeKitchenPosition(-999),-30);near(normalizeKitchenPosition(NaN),10);
});
test('operator stands 170 cm tall in front of refrigerator and is omitted when hidden',()=>{
 const scene=new THREE.Scene(),person=createFridgePerson({THREE,scene,cooking:C});scene.updateMatrixWorld(true);
 const b=new THREE.Box3().setFromObject(person.root);near(b.min.y,.032);near(b.max.y-b.min.y,1.7);assert(b.min.z>C.frontZ,'body and hand stay in front of refrigerator');
 assert(b.max.z<K.island.z+.10,'operator stays north of shifted island');
 const snapshot=createPhotoSnapshot(THREE,scene,{sources:[]},THREE.SpotLight);assert(snapshot.scene.children.length>20);
 for(const mesh of snapshot.scene.children)for(const k of ['position','normal','uv','tangent'])assert([...mesh.geometry.attributes[k].array].every(Number.isFinite),`${mesh.name} ${k}`);snapshot.dispose();
 person.setVisible(false);const hidden=createPhotoSnapshot(THREE,scene,{sources:[]},THREE.SpotLight);assert.equal(hidden.scene.children.length,0);hidden.dispose();
});
