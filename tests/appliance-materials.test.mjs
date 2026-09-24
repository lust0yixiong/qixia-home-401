import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/three.module.js';
import {APPLIANCE_GROUPS,createApplianceMaterials} from '../appliance-materials.mjs';
import {buildSurfaceRegistry,assignSurfaceMaterial} from '../material-selection.js';
import {validatePlan,validateSurfacePlan} from '../material-editor.js';
import {installCoffeeMachine} from '../coffee-machine.mjs';
import {kitchenLayout} from '../kitchen-layout.mjs';
const config={mode:'solid',color:'#aa3344',repeatX:1,repeatY:1,rotation:0,roughness:.4,metalness:.7};
test('appliance categories isolate fixtures; historical cream surface edits still import',()=>{
 const materials=Object.fromEntries(['cream','white','metal','dark'].map(k=>[k,new THREE.MeshStandardMaterial()]));
 const scene=new THREE.Scene(),panel=new THREE.Mesh(new THREE.BoxGeometry(.6,.8,.02),materials.cream);scene.add(panel);
 const before=buildSurfaceRegistry(scene,materials,[['cream']]);const key=[...before.registry.keys()][0];
 createApplianceMaterials(materials);panel.material=materials.dishwasherShell;
 const registry=buildSurfaceRegistry(scene,materials,[['cream'],...APPLIANCE_GROUPS]);assert(registry.registry.has(key));
 assert.deepEqual(validateSurfacePlan({version:3,surfaces:{[key]:{...config,base:'cream'}}},registry.registry)[key],config);
 for(const [category] of APPLIANCE_GROUPS)assert.deepEqual(validatePlan({version:3,materials:{[category]:config}})[category],config);
 materials.fridgeShell.color.set('#ff0000');assert.equal(materials.metal.color.getHexString(),'ffffff');assert.equal(materials.washerShell.color.getHexString(),'ffffff');
 const changed=materials.dishwasherShell.clone();assignSurfaceMaterial(registry.registry.get(key),changed);assert.equal(panel.material,changed);assert.notEqual(changed,materials.cream);
});
test('coffee housing is selectable while glass, knobs and brew hardware retain their finishes',()=>{
 const scene=new THREE.Scene(),m=new THREE.MeshStandardMaterial({color:'#abcdef'});
 const {root}=installCoffeeMachine({THREE,scene,counter:kitchenLayout.longSide,shellMaterial:m});
 assert.equal(root.getObjectByName('coffee-boiler-housing').material,m);assert.equal(root.getObjectByName('coffee-polished-front').material,m);assert.notEqual(root.getObjectByName('coffee-walnut-knob').material,m);
 const surfaces=buildSurfaceRegistry(scene,{coffeeShell:m},APPLIANCE_GROUPS.filter(([k])=>k==='coffeeShell'));
 assert(surfaces.lookup.get(root.getObjectByName('coffee-polished-front')).size===1);
});
