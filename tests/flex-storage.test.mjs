import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/three.module.js';
import {interiorLayout as D} from '../interior-layout.mjs';
import {correctFlexStorage,flexStorageBounds} from '../flex-storage.mjs';
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('P.12 storage is 800 square, reaches back 200 mm, and aligns with the 600-deep wardrobe',()=>{
 const F=D.flexWardrobe,b=flexStorageBounds(F,4,0);
 near(F.serviceWidth,.8);near(F.serviceDepth,.8);near(F.width,3.4);near(F.depth,.6);
 near(b.serviceBack,-.2);near(b.front,.6);near(b.wardrobeLeft-b.serviceLeft,.8);
 near(b.serviceBack+F.serviceDepth,b.front);
});
test('EL.01 has a solid activity-room side, one corridor leaf, full-height wardrobe fronts and a clear rear notch',()=>{
 const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial();
 function box(w,h,d,x=0,y=h/2,z=0){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);scene.add(mesh);return mesh;}
 const service={body:box(.8,2.65,.8),doors:Array.from({length:4},()=>box(.38,1,.012)),handles:Array.from({length:2},()=>box(.01,.15,.01))};
 const wardrobe={doors:Array.from({length:12},()=>box(.54,1,.012,0,.55,.606))};
 const partition=box(4,2.65,.22,2,1.325,-.11);partition.skirt=box(4,.09,.238,2,.045,-.11);
 const b=correctFlexStorage({THREE,F:D.flexWardrobe,right:4,back:0,service,wardrobe,partition});
 near(service.body.position.z,.2);assert.equal(service.doors.filter(m=>m.visible).length,1);
 const leaf=service.doors[0];assert(leaf.position.x<b.serviceLeft);near(leaf.geometry.parameters.depth,.68);near(leaf.geometry.parameters.width,.018);
 near(leaf.position.y-leaf.geometry.parameters.height/2,.06);
 assert.equal(wardrobe.doors.filter(m=>m.visible).length,6);
 for(const door of wardrobe.doors.filter(m=>m.visible))near(door.position.y+door.geometry.parameters.height/2,2.62);
 near(partition.position.x-partition.geometry.parameters.width/2,b.wallStart);
 scene.updateMatrixWorld(true);
 const rayAt=(x,z)=>new THREE.Raycaster(new THREE.Vector3(x,4,z),new THREE.Vector3(0,-1,0)).intersectObject(service.body).length;
 assert.equal(rayAt(b.wardrobeLeft-.1,b.serviceBack+.1),0,'rear-right notch must be open for the partition');
 assert(rayAt(b.serviceLeft+.2,b.serviceBack+.1)>0,'corridor side of storage must extend behind the wardrobe');
 assert(rayAt(b.wardrobeLeft-.1,b.front-.1)>0,'activity-room timber face remains continuous');
});
