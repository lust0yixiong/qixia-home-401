// Correct the two ends of the west counter after material registration, retaining
// existing objects/IDs and custom finishes. Main P.12 counter runs stay fixed.
export function correctWestJunctions({THREE,layout:L,window:W,gas:G,height,walls,body,top}){
 const north=L.shortSide,south=L.longSide,t=.18;
 const X=p=>(p-855)/85.6,Z=p=>(p-610)/85.6;
 const a=south.x-t,b=south.x,c=north.x-t,d=north.x;
 const z0=Z(W.endPlanZ),z1=L.wallStepZ-t/2,z2=south.z,z3=Z(760),r=.05;
 // One joined wall silhouette replaces three butt-jointed boxes (which left
 // 90 mm notches). A small rounded exposed corner follows rendering 03.
 const shape=new THREE.Shape();shape.moveTo(c,-z0);shape.lineTo(d,-z0);
 shape.lineTo(d,-(z2-r));shape.quadraticCurveTo(d,-z2,d-r,-z2);
 shape.lineTo(b,-z2);shape.lineTo(b,-z3);shape.lineTo(a,-z3);
 shape.lineTo(a,-z1);shape.lineTo(c,-z1);shape.closePath();
 const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:16});geometry.rotateX(-Math.PI/2);
 const primary=walls[0];primary.updateMatrix();geometry.applyMatrix4(primary.matrix.clone().invert());
 primary.geometry.dispose();primary.geometry=geometry;primary.name='continuous-west-window-return';
 for(const wall of walls.slice(1))wall.visible=false;
 // The previous baseboards carried the same stepped joints. These surfaces sit
 // behind the cabinetry, so suppress them rather than leave small protrusions.
 for(const wall of walls)if(wall.skirt)wall.skirt.visible=false;
 // The wooden meter/shelf enclosure extends back to the doorway. Carry its
 // white base and worktop through to the SAME rear edge, closing the floor gap.
 const start=Z(G.backPlanZ),end=north.z+north.depth,arcStart=end-north.endRadius;
 const profile=new THREE.Shape();profile.moveTo(north.x,-start);profile.lineTo(north.x+north.width,-start);
 profile.lineTo(north.x+north.width,-arcStart);profile.absarc(north.x,-arcStart,north.endRadius,0,-Math.PI/2,true);profile.lineTo(north.x,-start);profile.closePath();
 for(const mesh of [body,top]){
  const h=mesh.geometry.parameters.options.depth;
  const next=new THREE.ExtrudeGeometry(profile,{depth:h,bevelEnabled:false,curveSegments:20});next.rotateX(-Math.PI/2);
  mesh.geometry.dispose();mesh.geometry=next;
 }
 body.name='west-curved-cabinet-to-doorway';top.name='west-curved-counter-to-doorway';
 return {cornerRadius:r,extension:north.z-start,doorwayEnd:start};
}
