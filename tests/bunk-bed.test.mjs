import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/three.module.js';
import {createBunkBed,bunkBedSpec as S} from '../bunk-bed.mjs';
import {createPhotoSnapshot} from '../photo-scene.mjs';
test('dimensioned bunk hugs both walls and its ladder clears both mattresses and the wardrobe',()=>{
 const scene=new THREE.Scene(),m=new THREE.MeshStandardMaterial(),materials={pink:m,linen:m,white:m,wood:m};
 const {root,mattresses,ladder,placement:p}=createBunkBed({THREE,scene,materials});scene.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(root);
 assert(Math.abs(bounds.min.z-p.north-S.wallGap)<.001);
 assert(Math.abs(p.east-bounds.max.x-S.wallGap)<.001);
 assert(Math.abs(bounds.max.x-bounds.min.x-S.length)<.001);
 assert(Math.abs(bounds.max.y-S.height)<.004);
 const lb=new THREE.Box3().setFromObject(ladder);
 for(const mattress of mattresses){const b=new THREE.Box3().setFromObject(mattress);assert(!lb.intersectsBox(b),'ladder must be outside mattress');assert(Math.abs(b.max.x-b.min.x-2)<.001);assert(Math.abs(b.max.z-b.min.z-.9)<.001);assert(b.min.z>=p.north);}
 const wardrobeFront=(502-610)/85.6;
 assert(wardrobeFront-bounds.max.z>1.4,'preserve wardrobe-side passage');
 const snap=createPhotoSnapshot(THREE,scene,{sources:[]},THREE.SpotLight);
 for(const mesh of snap.scene.children)for(const k of ['position','normal','uv','tangent'])assert([...mesh.geometry.attributes[k].array].every(Number.isFinite),`${mesh.name} ${k}`);
 snap.dispose();
});
