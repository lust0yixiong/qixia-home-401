import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/three.module.js';
import {correctLaundryStorage} from '../laundry-storage.mjs';
import {createWetSharedDoor} from '../wet-shared-door.mjs';
import {createPhotoSnapshot} from '../photo-scene.mjs';
const near=(a,b)=>assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);
test('470 x 450 storage is front-aligned with 650 washer; EL.07 levels and open hamper survive',()=>{
 const scene=new THREE.Scene(),m=new THREE.MeshStandardMaterial(),materials={cream:m,white:m,linen:m,dark:m,metal:m,chrome:m,wood:m,frosted:m,wall:m};
 const legacy=Array.from({length:5},()=>new THREE.Mesh(new THREE.BoxGeometry(1,1,1),m));legacy.forEach(o=>scene.add(o));
 const X=p=>(p-855)/85.6,Z=p=>(p-610)/85.6,wx=X(806),wz=Z(280);
 const c=correctLaundryStorage({THREE,scene,washerX:wx,washerZ:wz,washerWidth:.65,washerDepth:.65,legacy,materials});scene.updateMatrixWorld(true);
 near(c.front,wz+.65);near(c.back,wz+.20);near(c.lowerTop,.78);near(c.upperBottom,1.28);
 const bounds=new THREE.Box3().setFromObject(c.root);near(bounds.max.x-bounds.min.x,.47);near(bounds.max.z-bounds.min.z,.45);near(bounds.max.y,2.35);
 for(const o of [c.upperDoor,c.lowerDoor]){near(new THREE.Box3().setFromObject(o).max.z,c.front);assert.equal(o.material,m);}
 const from=(y)=>new THREE.Raycaster(new THREE.Vector3(wx+.65+.235,y,c.front+.1),new THREE.Vector3(0,0,-1),0,.14);
 assert.equal(from(.59).intersectObject(c.lowerDoor).length,0,'real open hamper slot');assert(from(.30).intersectObject(c.lowerDoor).length>0,'solid front below slot');
 assert.equal(from(1.05).intersectObject(c.root,true).length,0,'niche must not be filled by cabinet volume');
 const original=c.upperDoor.position.clone();c.setOpen(true);assert.equal(c.upperDoor.material,m);c.setOpen(false);assert(c.upperDoor.position.equals(original));
 const openingGroup=new THREE.Group();scene.add(openingGroup);const divider=new THREE.Group();const door=createWetSharedDoor({THREE,scene,openingGroup,materials,legacy:[],divider});door.setSide('between');scene.updateMatrixWorld(true);
 const frameBounds=new THREE.Box3();door.leaf.children.filter(o=>!o.name.includes('handle')).forEach(o=>frameBounds.union(new THREE.Box3().setFromObject(o)));assert(frameBounds.min.x>bounds.max.x,'shared door still clears shifted cabinetry');
 const snap=createPhotoSnapshot(THREE,scene,{sources:[]},THREE.SpotLight);for(const mesh of snap.scene.children)for(const k of ['position','normal','uv','tangent'])assert([...mesh.geometry.attributes[k].array].every(Number.isFinite),`${mesh.name}: ${k}`);snap.dispose();
});
