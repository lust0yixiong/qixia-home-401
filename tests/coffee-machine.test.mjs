import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/three.module.js';
import {installCoffeeMachine,coffeeMachineSpec as S} from '../coffee-machine.mjs';
import {createPhotoSnapshot} from '../photo-scene.mjs';
import {kitchenLayout as K} from '../kitchen-layout.mjs';
test('coffee machine fits the countertop south of the round sink and faces the aisle',()=>{
 const scene=new THREE.Scene(),{root}=installCoffeeMachine({THREE,scene,counter:K.longSide}),L=K.longSide;
 const forward=new THREE.Vector3(0,0,1).applyQuaternion(root.quaternion);assert(forward.x>.999);
 const bound=new THREE.Box3().setFromObject(root);
 assert(Math.abs(bound.min.y-S.top)<1e-6,'feet sit on the original countertop');
 assert(bound.min.x>L.x+.02,'leave clearance to the rear wall');
 // The operating handle can protrude; the base and feet must remain supported.
 for(const name of ['coffee-plinth','coffee-foot']){
  const b=new THREE.Box3().setFromObject(root.getObjectByName(name));assert(b.max.x<L.x+L.width);assert(b.min.x>L.x);
 }
 assert(Math.abs(L.z+L.depth-bound.max.z-.020)<.002,'sit beside the raised entry cabinet with a 20 mm gap');
 assert(bound.min.z>L.z+.93+.16+.3,'leave working space beside the round sink');
 assert(bound.max.y<S.top+S.height+.005);
});
test('coffee geometry survives photo snapshot with finite normals, UVs and tangents',()=>{
 const scene=new THREE.Scene();installCoffeeMachine({THREE,scene,counter:K.longSide});
 const snap=createPhotoSnapshot(THREE,scene,{sources:[]},THREE.SpotLight);
 assert(snap.scene.children.length>100);
 for(const mesh of snap.scene.children){for(const name of ['position','normal','uv','tangent'])assert([...mesh.geometry.attributes[name].array].every(Number.isFinite),`${mesh.name} ${name}`);}
 snap.dispose();
});
