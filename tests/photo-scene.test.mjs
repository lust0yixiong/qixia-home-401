import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/three.module.js';
import {createPhotoSnapshot} from '../photo-scene.mjs';
test('photo snapshot respects hidden ancestry and world transforms without editing originals',()=>{
 const scene=new THREE.Scene(),group=new THREE.Group();group.position.set(3,2,1);scene.add(group);
 const geometry=new THREE.BoxGeometry(),material=new THREE.MeshStandardMaterial();
 const mesh=new THREE.Mesh(geometry,material);mesh.name='visible';mesh.position.x=2;group.add(mesh);
 const hidden=new THREE.Group();hidden.visible=false;hidden.add(new THREE.Mesh(geometry,material));scene.add(hidden);
 const sky=new THREE.Mesh(geometry,material);sky.userData.photoExclude=true;scene.add(sky);
 const before=Object.keys(geometry.attributes);
 const snap=createPhotoSnapshot(THREE,scene,{sources:[]},THREE.SpotLight);
 assert.equal(snap.scene.children.length,1);const copy=snap.scene.getObjectByName('visible');
 assert.deepEqual(copy.matrixWorld.elements.slice(12,15),[5,2,1]);assert.notEqual(copy.geometry,geometry);assert.notEqual(copy.material,material);
 snap.dispose();assert.deepEqual(Object.keys(geometry.attributes),before);assert.equal(mesh.material,material);
});
test('photo glass and mirrors use physical optics without changing editable materials',()=>{
 const scene=new THREE.Scene(),g=new THREE.BoxGeometry();
 const glass=new THREE.MeshPhysicalMaterial({transparent:true,opacity:.17});glass.name='glass';
 const mirror=new THREE.MeshStandardMaterial({color:'#cadbdc',metalness:.25});mirror.name='mirror';
 const a=new THREE.Mesh(g,glass),b=new THREE.Mesh(g,mirror);a.name='window';b.name='mirror';scene.add(a,b);
 const snap=createPhotoSnapshot(THREE,scene,{sources:[{x:1,y:2.3,z:3,power:10,angle:.9}]},THREE.SpotLight);
 assert.equal(snap.scene.getObjectByName('window').material.transmission,.98);
 assert.equal(snap.scene.getObjectByName('mirror').material.metalness,1);assert.equal(mirror.metalness,.25);assert.equal(glass.opacity,.17);
 const light=snap.scene.children.find(o=>o.isSpotLight);assert.deepEqual(light.position.toArray(),[1,2.3,3]);assert.equal(light.distance,0);snap.dispose();
});
test('photo texture ownership protects original UV settings and area lights point down',()=>{
 const scene=new THREE.Scene(),map=new THREE.Texture();map.repeat.set(3,2);map.matrixAutoUpdate=false;
 const material=new THREE.MeshStandardMaterial({map}),mesh=new THREE.Mesh(new THREE.BoxGeometry(),material);mesh.name='textured';scene.add(mesh);
 const snap=createPhotoSnapshot(THREE,scene,{sources:[],areas:[{id:'panel',x:0,y:2.35,z:0,width:1.46,height:2.87,power:6,rotation:.7}]},THREE.SpotLight);
 const copied=snap.scene.getObjectByName('textured').material.map;
 assert.notEqual(copied,map);assert.equal(copied.source,map.source);copied.repeat.set(1,1);assert.deepEqual(map.repeat.toArray(),[3,2]);
 const normal=new THREE.Vector3(0,0,-1).applyQuaternion(snap.scene.getObjectByName('panel').quaternion);assert(normal.distanceTo(new THREE.Vector3(0,-1,0))<1e-7);
 snap.dispose();assert.equal(map.matrixAutoUpdate,false);
});
