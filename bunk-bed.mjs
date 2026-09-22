// Main dimensions: IKEA CN VITVAL 706.199.32, 2070 x 970 x 1650 mm,
// 2000 x 900 mattresses. Pink finish follows the apartment design, not the SKU.
export const bunkBedSpec=Object.freeze({length:2.07,width:.97,height:1.65,mattressLength:2,mattressWidth:.90,mattressThickness:.12,wallGap:.02,ladderProjection:.18});
export function bunkBedPlacement(){
 const s=bunkBedSpec,north=(267-610)/85.6+.09,east=(712-855)/85.6-.11;
 return {x:east-s.wallGap-s.length/2,z:north+s.wallGap+s.width/2,north,east};
}
export function createBunkBed({THREE,scene,materials}){
 const s=bunkBedSpec,p=bunkBedPlacement(),root=new THREE.Group();root.name='second-bedroom-wall-aligned-bunk';root.position.set(p.x,0,p.z);scene.add(root);
 const frame=materials.pink,fabric=materials.linen,bedding=materials.white,r=.016,hx=s.length/2-.020,hz=s.width/2-.020;
 const add=(g,m,x,y,z,name)=>{const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);return mesh;};
 const box=(x,y,z,w,h,d,m,name)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,name);
 const rod=(a,b,radius=r,name='bunk-frame')=>{const v=new THREE.Vector3(...a),w=new THREE.Vector3(...b),delta=w.clone().sub(v),mesh=add(new THREE.CylinderGeometry(radius,radius,delta.length(),20),frame,...v.clone().add(w).multiplyScalar(.5).toArray(),name);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return mesh;};
 const curve=points=>{const x=points[0][0],v=(y,z)=>new THREE.Vector3(x,y,z),path=new THREE.CurvePath();
  path.add(new THREE.QuadraticBezierCurve3(v(1.584,-hz),v(1.634,-hz),v(1.634,-hz+.05)));
  path.add(new THREE.LineCurve3(v(1.634,-hz+.05),v(1.634,hz-.05)));
  path.add(new THREE.QuadraticBezierCurve3(v(1.634,hz-.05),v(1.634,hz),v(1.584,hz)));
  return add(new THREE.TubeGeometry(path,48,r,10,false),frame,0,0,0,'bunk-rounded-end-rail');};
 function cushion(x,y,z,l,w,h,name){
  const shape=new THREE.Shape(),bevel=.005,rr=.04,a=-l/2+bevel,b=-w/2+bevel,L=l-2*bevel,W=w-2*bevel;
  shape.moveTo(a+rr,b);shape.lineTo(a+L-rr,b);shape.quadraticCurveTo(a+L,b,a+L,b+rr);shape.lineTo(a+L,b+W-rr);shape.quadraticCurveTo(a+L,b+W,a+L-rr,b+W);shape.lineTo(a+rr,b+W);shape.quadraticCurveTo(a,b+W,a,b+W-rr);shape.lineTo(a,b+rr);shape.quadraticCurveTo(a,b,a+rr,b);
  const g=new THREE.ExtrudeGeometry(shape,{depth:h-2*bevel,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,curveSegments:8});g.rotateX(-Math.PI/2);
  return add(g,name==='bunk-mattress'?fabric:bedding,x,y+bevel,z,name);
 }
 // Posts lie outside the mattress envelope. End rails curve into the uprights.
 for(const x of [-hx,hx]){
  for(const z of [-hz,hz])rod([x,0,z],[x,1.584,z]);
  curve([[x,1.584,-hz],[x,1.622,-hz+.014],[x,1.634,-hz+.05],[x,1.634,hz-.05],[x,1.622,hz-.014],[x,1.584,hz]]);
 }
 const mattresses=[];
 for(const level of [.275,1.225]){
  for(const z of [-hz,hz])rod([-hx,level-.025,z],[hx,level-.025,z],.02,'bunk-bed-base-rail');
  for(const x of [-hx,hx])rod([x,level-.025,-hz],[x,level-.025,hz],.02,'bunk-bed-base-rail');
  for(let i=0;i<17;i++)box(-.96+i*.12,level-.009,0,.08,.018,.90,materials.wood,'bunk-bed-slat');
  mattresses.push(cushion(0,level,0,2,.90,.12,'bunk-mattress'));
  cushion(.72,level+.12,0,.42,.63,.09,'bunk-pillow');
  box(-.27,level+.122,0,1.36,.016,.87,bedding,'bunk-folded-duvet');
 }
 // Soft guard panels inspired by VITVAL. The upper aisle side has an opening
 // aligned to the ladder; the lower aisle side stays open for entry.
 rod([-hx,1.634,-hz],[hx,1.634,-hz]);
 rod([-.50,1.634,hz],[hx,1.634,hz]);rod([-.50,1.25,hz],[-.50,1.634,hz]);
 box(0,1.451,-hz,2.00,.326,.008,fabric,'bunk-upper-back-guard');
 box(.253,1.451,hz,1.476,.326,.008,fabric,'bunk-upper-front-guard');
 for(const x of [-hx,hx]){
  box(x,1.451,0,.008,.326,.90,fabric,'bunk-upper-end-guard');
  rod([x,.72,-hz],[x,.72,hz]);box(x,.507,0,.008,.384,.90,fabric,'bunk-lower-end-guard');
 }
 rod([-hx,.72,-hz],[hx,.72,-hz]);box(0,.507,-hz,2.0,.384,.008,fabric,'bunk-lower-back-guard');
 // All ladder tubing stays beyond +Z mattress edge, including its top ends.
 const ladder=new THREE.Group();ladder.name='bunk-external-ladder';root.add(ladder);
 const railZ=y=>s.width/2+.026+(1-y/1.58)*.138;
 for(const x of [-.965,-.575]){const mesh=rod([x,.016,railZ(.016)],[x,1.58,railZ(1.58)],r,'bunk-ladder-rail');ladder.attach(mesh);}
 for(const y of [.25,.48,.71,.94,1.17,1.40]){const mesh=box(-.77,y,railZ(y),.39,.023,.064,frame,'bunk-ladder-tread');ladder.attach(mesh);}
 root.updateMatrixWorld(true);return {root,mattresses,ladder,spec:s,placement:p};
}
