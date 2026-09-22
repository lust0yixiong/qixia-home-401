import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/three.module.js';
import {installIslandSink,islandSinkSpec as S} from '../island-sink.mjs';
function fixture(){
 const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial(),island={x:0,z:0,width:2,depth:1.1};
 const top=new THREE.Mesh(new THREE.BoxGeometry(2,.12,1.1),material);top.position.set(1,.95,.55);scene.add(top);
 const body=new THREE.Mesh(new THREE.BoxGeometry(1.9,.85,.832),material);body.position.set(1,.465,.416);scene.add(body);
 const legacy=[new THREE.Mesh(new THREE.BoxGeometry(.8,.02,.52),material)];scene.add(...legacy);
 const installed=installIslandSink({THREE,scene,island,top,body,legacy,materials:{chrome:material,dark:material}});scene.updateMatrixWorld(true);
 return {scene,top,body,legacy,...installed};
}
test('830 x 560 3D sink opens the stone and cabinet without replacing editable objects',()=>{
 const f=fixture();assert.equal(S.width,.83);assert.equal(S.depth,.56);assert(f.legacy.every(m=>!m.visible));
 const ray=new THREE.Raycaster(new THREE.Vector3(1.52,2,.34),new THREE.Vector3(0,-1,0));
 assert.equal(ray.intersectObject(f.top).length,0,'stone must not cover basin');
 const cabinetHits=ray.intersectObject(f.body);assert(cabinetHits.every(h=>h.point.y<.06),'cabinet must not fill basin');
 f.top.geometry.computeBoundingBox();const size=f.top.geometry.boundingBox.getSize(new THREE.Vector3());
 assert(Math.abs(size.x-2)<1e-6&&Math.abs(size.y-.12)<1e-6&&Math.abs(size.z-1.1)<1e-6,'retain island and fascia dimensions');
});
test('open basin has a recessed bottom, distinct upper/lower trays and removable accessories',()=>{
 const f=fixture();f.accessories.visible=false;
 const floor=f.root.getObjectByName('basin-bottom');
 const ray=new THREE.Raycaster(new THREE.Vector3(1.52,2,.32),new THREE.Vector3(0,-1,0));
 const hits=ray.intersectObject(floor);assert(hits.length>0);assert(hits[0].point.y<.82&&hits[0].point.y>.78);
 const upper=f.root.getObjectByName('upper-wave-tray'),lower=f.root.getObjectByName('lower-perforated-draining-tray');
 assert(upper.getWorldPosition(new THREE.Vector3()).y>lower.getWorldPosition(new THREE.Vector3()).y+.05);
 assert(f.root.getObjectByName('round-drain-cover'));
 // Tracer requires complete normal/UV attributes and no invalid vertices.
 f.root.traverse(o=>{if(o.isMesh){assert(o.geometry.attributes.normal);assert(o.geometry.attributes.uv);assert([...o.geometry.attributes.position.array].every(Number.isFinite));}});
});
