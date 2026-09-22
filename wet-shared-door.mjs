// P.01 / EL.07: one leaf pivots between the laundry and shower front bays.
// Coordinates are traced plan anchors; 2350 mm height follows the elevation.
export const wetSharedDoorLayout=Object.freeze({left:804,pivot:904,right:1004,front:415,height:2.35});
export function createWetSharedDoor({THREE,scene,openingGroup,materials,legacy,divider}){
 for(const mesh of legacy)mesh.visible=false;
 divider.visible=false;if(divider.skirt)divider.skirt.visible=false;
 const L=wetSharedDoorLayout,X=p=>(p-855)/85.6,Z=p=>(p-610)/85.6;
 const root=new THREE.Group();root.name='laundry-shower-shared-door';openingGroup.add(root);
 const box=(parent,x,y,z,w,h,d,m,name)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const front=Z(L.front),left=X(L.left),right=X(L.right),pivotX=X(L.pivot),h=L.height;
 // One wide lintel, two outer jambs, and the shared narrow hinge post. No wall
 // or fixed glass occupies the sweep between the washer and shower.
 for(const x of [left,right])box(root,x,h/2,front,.04,h,.12,materials.wood,'shared-door-outer-jamb');
 box(root,pivotX,h/2,front,.026,h,.05,materials.wood,'shared-door-pivot-post');
 box(root,(left+right)/2,h+.025,front,right-left+.04,.05,.12,materials.wood,'shared-door-lintel');
 box(root,(left+right)/2,(h+.05+2.65)/2,front,right-left,2.65-h-.05,.12,materials.wall,'shared-door-overhead-wall');
 const leaf=new THREE.Group();leaf.name='single-wet-shared-leaf';leaf.position.set(pivotX,0,front);root.add(leaf);
 const width=(L.pivot-L.left)/85.6-.04,edge=.008;
 box(leaf,-width/2-edge,h/2,0,width-.075,h-.09,.012,materials.frosted,'shared-door-frosted-infill');
 for(const x of [-edge-.019,-width-edge+.019])box(leaf,x,h/2,0,.038,h,.040,materials.wood,'shared-door-leaf-stile');
 for(const y of [.022,h-.022])box(leaf,-width/2-edge,y,0,width,.044,.040,materials.wood,'shared-door-leaf-rail');
 for(const z of [-.043,.043])box(leaf,-width+.11,1.04,z,.095,.016,.025,materials.metal,'shared-door-handle');
 for(const y of [.24,1.18,2.12])box(root,pivotX,y,front,.025,.070,.042,materials.chrome,'shared-door-hinge');
 // Reference rendering 08: laundry open, leaf closing the shower front.
 leaf.rotation.y=-Math.PI;
 return {root,leaf,width,layout:L,setSide(side){leaf.rotation.y=side==='laundry'?0:side==='between'?-Math.PI/2:-Math.PI;}};
}
