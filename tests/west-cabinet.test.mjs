import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/three.module.js';
import {installRoundSink} from '../round-sink.mjs';
import {recessWestCabinet} from '../west-cabinet.mjs';
test('west cabinet recedes 200 mm with fixed wall side, countertop and bowl; front avoids bowl',()=>{
 const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial();
 const box=(x,y,z,w,h,d)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);scene.add(m);return m;};
 const body=box(.3,.49,1.12,.6,.88,2.24),top=box(.3,.95,1.12,.6,.04,2.24),fronts=[],handles=[];
 let z=0;for(const d of [.6,.65,.55,.44]){fronts.push(box(.596,.49,z+d/2,.008,.78,d-.014));handles.push(box(.608,.657,z+.13,.016,.014,.17));z+=d;}
 const frontXs=fronts.map(m=>m.position.x),handleXs=handles.map(m=>m.position.x);
 const sink=installRoundSink({THREE,scene,top,body,legacy:[],metal:material});
 const geometry=top.geometry,position=top.position.clone(),sinkPosition=sink.root.position.clone();
 recessWestCabinet({THREE,body,fronts,handles,sink:{z:.93,top:.97}});scene.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(body);
 assert(Math.abs(bounds.min.x)<1e-6);assert(Math.abs(bounds.max.x-.4)<1e-6);
 for(let i=0;i<4;i++){assert(Math.abs(frontXs[i]-fronts[i].position.x-.2)<1e-9);assert(Math.abs(handleXs[i]-handles[i].position.x-.2)<1e-9);}
 assert.equal(top.geometry,geometry);assert(top.position.equals(position));assert(sink.root.position.equals(sinkPosition));assert.equal(body.material,material);
 const ray=new THREE.Raycaster(new THREE.Vector3(1,.84,.93),new THREE.Vector3(-1,0,0));
 assert(ray.intersectObjects([body,...fronts]).every(hit=>hit.point.x<.1),'front panel must not intersect the retained bowl');
 const below=new THREE.Raycaster(new THREE.Vector3(1,.6,.93),new THREE.Vector3(-1,0,0));
 assert(Math.abs(below.intersectObjects([body,...fronts])[0].point.x-.4)<1e-6);
});
