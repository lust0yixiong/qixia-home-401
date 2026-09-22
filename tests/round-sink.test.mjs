import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/three.module.js';
import {installRoundSink,roundSinkSpec as S} from '../round-sink.mjs';
function fixture(){
 const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial();
 const top=new THREE.Mesh(new THREE.BoxGeometry(.6,.04,2.24),material);top.position.set(.3,.95,1.12);scene.add(top);
 const body=new THREE.Mesh(new THREE.BoxGeometry(.6,.88,2.24),material);body.position.set(.3,.49,1.12);scene.add(body);
 const legacy=[new THREE.Mesh(new THREE.BoxGeometry(.4,.02,.42),material)];scene.add(...legacy);
 const result=installRoundSink({THREE,scene,top,body,legacy,metal:new THREE.MeshStandardMaterial()});scene.updateMatrixWorld(true);
 return {scene,top,body,legacy,material,...result};
}
test('320 mm circular aperture is recessed and the cabinet cannot fill the bowl',()=>{
 const f=fixture();assert.equal(S.diameter,.32);assert(f.legacy.every(o=>!o.visible));
 for(let a=0;a<Math.PI*2;a+=Math.PI/8){
  const ray=r=>new THREE.Raycaster(new THREE.Vector3(.29+r*Math.cos(a),2,.93+r*Math.sin(a)),new THREE.Vector3(0,-1,0));
  const inside=ray(.10).intersectObject(f.top);assert(inside.length);assert(inside[0].point.y<.82,'bowl is open');
  const outside=ray(.162).intersectObject(f.top);assert(Math.abs(outside[0].point.y-.97)<1e-5,'stone starts outside the 320 mm rim');
 }
 const cabinet=new THREE.Raycaster(new THREE.Vector3(.29,2,.93),new THREE.Vector3(0,-1,0)).intersectObject(f.body);
 assert(cabinet.every(h=>h.point.y<.08));
});
test('bowl belongs to the existing countertop material slot, preserving edits and geometry attributes',()=>{
 const f=fixture();assert.equal(f.top.material,f.material);assert(!Array.isArray(f.top.material));
 const replacement=new THREE.MeshStandardMaterial({color:'#ad9275'});f.top.material=replacement;assert.equal(f.top.material,replacement);
 f.scene.traverse(o=>{if(o.isMesh&&o.visible){assert(o.geometry.attributes.normal);assert(o.geometry.attributes.uv);assert([...o.geometry.attributes.position.array].every(Number.isFinite));}});
 assert(f.root.getObjectByName('round-sink-arched-tap'));
 const tap=f.root.getObjectByName('round-sink-tap-base');assert.equal(tap.position.z,.14);
 const tip=f.root.getObjectByName('round-sink-arched-tap').geometry.parameters.path.getPoint(1);
 assert(Math.hypot(tip.x,tip.z)<S.diameter/2,'offset faucet still discharges into the bowl');
});
