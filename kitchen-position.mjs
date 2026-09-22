// User comparison offset: +Z is toward the entrance, independent of drawing anchors.
export const kitchenPositionLimits=Object.freeze({min:-30,max:50,initial:10});
export function normalizeKitchenPosition(value){
 const n=Number(value);return Number.isFinite(n)?Math.round(Math.max(-30,Math.min(50,n))):10;
}
export function createKitchenPosition({THREE,scene,parts,layout,cooking}){
 const root=new THREE.Group();root.name='movable-island-dining';scene.add(root);
 // Group only after material registration; local coordinates and surface keys survive.
 for(const part of new Set(parts))root.attach(part);
 let offset=10;
 const api={root,get offsetCm(){return offset;},setOffset(cm){offset=normalizeKitchenPosition(cm);root.position.z=offset/100;root.updateMatrixWorld(true);return offset;},clearances(){return {working:layout.island.z+offset/100-cooking.frontZ,entry:layout.entryFront-(layout.island.z+layout.island.depth+offset/100)};}};
 api.setOffset(10);return api;
}

export function createFridgePerson({THREE,scene,cooking,ground=.032}){
 const root=new THREE.Group();root.name='fridge-operator-170cm';scene.add(root);
 root.position.set(cooking.fridgeX+cooking.fridgeBayWidth/2,ground,cooking.frontZ+.49);
 const material=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
 const skin=material('#c9a88d'),shirt=material('#e1e7df'),pants=material('#536966'),shoe=material('#eee9df'),hair=material('#493d33');
 function mesh(g,m,name){const o=new THREE.Mesh(g,m);o.name=name;o.castShadow=o.receiveShadow=true;root.add(o);return o;}
 function ellipsoid(p,r,m,name){const o=mesh(new THREE.SphereGeometry(1,28,20),m,name);o.position.set(...p);o.scale.set(...r);return o;}
 function limb(a,b,r1,r2,m,name){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=mesh(new THREE.CylinderGeometry(r2,r1,d.length(),20),m,name);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;}
 // A closed, tapered shirt profile with real UVs for both realtime and path tracing.
 const torso=new THREE.LatheGeometry([[0,1.0],[.145,1.0],[.16,1.13],[.205,1.34],[.19,1.38],[.075,1.43],[0,1.43]].map(([r,y])=>new THREE.Vector2(r,y)),40);
 const body=mesh(torso,shirt,'operator-shirt');body.scale.z=.60;
 ellipsoid([0,.96,0],[.163,.12,.10],pants,'operator-hips');
 limb([0,1.39,0],[0,1.49,0],.056,.054,skin,'operator-neck');
 ellipsoid([0,1.565,-.012],[.098,.135,.098],skin,'operator-head');
 // Hair cap stops at the head's 1.70 m crown; the face points toward the fridge (-Z).
 const cap=mesh(new THREE.SphereGeometry(1,28,16,0,Math.PI*2,0,1.05),hair,'operator-hair');cap.position.set(0,1.565,-.012);cap.scale.set(.099,.135,.099);
 ellipsoid([0,1.556,-.111],[.016,.025,.022],skin,'operator-nose');
 for(const x of [-.037,.037])ellipsoid([x,1.59,-.100],[.007,.006,.004],hair,'operator-eye');
 for(const sign of [-1,1]){
  const hip=[sign*.087,.93,0],knee=[sign*.10,.51,sign<0?-.035:.02],ankle=[sign*.11,.13,sign<0?-.07:.03];
  limb(hip,knee,.088,.061,pants,'operator-thigh');ellipsoid(knee,[.062,.067,.062],pants,'operator-knee');limb(knee,ankle,.061,.040,pants,'operator-calf');
  ellipsoid([ankle[0],.055,ankle[2]-.035],[.061,.055,.137],shoe,'operator-shoe');
 }
 const arms=[{shoulder:[.19,1.35,0],elbow:[.27,1.16,-.16],wrist:[.065,1.25,-.40],hand:[.047,1.27,-.433]}, {shoulder:[-.19,1.35,0],elbow:[-.255,1.09,-.055],wrist:[-.18,1.04,-.24],hand:[-.16,1.04,-.27]}];
 for(const {shoulder,elbow,wrist,hand} of arms){ellipsoid(shoulder,[.070,.075,.070],shirt,'operator-shoulder');limb(shoulder,elbow,.069,.047,shirt,'operator-sleeve');ellipsoid(elbow,[.047,.047,.047],skin,'operator-elbow');limb(elbow,wrist,.044,.026,skin,'operator-forearm');ellipsoid(hand,[.035,.060,.025],skin,'operator-hand');}
 root.userData.height=1.70;root.userData.pose='Facing refrigerator, right hand reaching for handle';
 return {root,setVisible(visible){root.visible=Boolean(visible);}};
}
