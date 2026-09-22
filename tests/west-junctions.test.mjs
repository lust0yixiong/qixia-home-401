import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/three.module.js';
import {correctWestJunctions} from '../west-junctions.mjs';
import {kitchenLayout as L,kitchenWindow as W,kitchenGasCabinet as G} from '../kitchen-layout.mjs';
test('west wall return is continuous; shelf base ends at the timber enclosure while curved tip stays fixed',()=>{
 const scene=new THREE.Scene(),m=new THREE.MeshStandardMaterial(),height=2.65;
 const walls=Array.from({length:3},()=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(.5,height,.18),m);mesh.position.set(-5,height/2,1);mesh.rotation.y=-Math.PI/2;mesh.skirt=new THREE.Mesh(new THREE.BoxGeometry(),m);scene.add(mesh,mesh.skirt);return mesh;});
 const body=new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(1,0),new THREE.Vector2(1,1)]),{depth:.88}),m);body.position.y=.05;
 const top=new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(1,0),new THREE.Vector2(1,1)]),{depth:.04}),m);top.position.y=.93;scene.add(body,top);
 const result=correctWestJunctions({THREE,layout:L,window:W,gas:G,height,walls,body,top});scene.updateMatrixWorld(true);
 assert(result.extension>.18&&result.extension<.20);assert.equal(body.material,m);assert.equal(top.material,m);
 for(const mesh of [body,top]){const b=new THREE.Box3().setFromObject(mesh);assert(Math.abs(b.min.z-(G.backPlanZ-610)/85.6)<1e-6);assert(Math.abs(b.max.z-(L.shortSide.z+L.shortSide.depth))<1e-6);assert(Math.abs(b.max.x-L.shortSide.x-L.shortSide.width)<1e-6);}
 const b=new THREE.Box3().setFromObject(top);assert(Math.abs(b.max.y-.97)<1e-6);
 assert(walls[0].visible);assert(walls.slice(1).every(w=>!w.visible));
 // Probe across the formerly separated wall ends: every point hits the same
 // south-facing plane instead of a 90 mm recessed strip or open corner.
 for(const x of [L.longSide.x+.02,L.shortSide.x-.14,L.shortSide.x-.075]){
  const ray=new THREE.Raycaster(new THREE.Vector3(x,1.3,L.longSide.z+.5),new THREE.Vector3(0,0,-1));const hits=ray.intersectObject(walls[0]);assert(hits.length>0);assert(Math.abs(hits[0].point.z-L.longSide.z)<1e-6);
 }
});
