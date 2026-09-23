// P.12: 470 x 450 side cabinet, 650 x 650 washer bay; EL.07: 740/500/1070.
// Front alignment is user-confirmed. The 40 mm base reconciles the 2310 mm
// cabinet stack with the 2350 mm upper datum. Fittings are rendering approximations.
export const laundryStorageSpec=Object.freeze({width:.47,depth:.45,base:.04,lower:.74,niche:.50,upper:1.07,top:2.35,panel:.018});
export function correctLaundryStorage({THREE,scene,washerX,washerZ,washerWidth,washerDepth,legacy,materials}){
 const S=laundryStorageSpec,x=washerX+washerWidth,front=washerZ+washerDepth,back=front-S.depth,w=S.width,t=S.panel;
 const lowerTop=S.base+S.lower,upperBottom=lowerTop+S.niche;
 const root=new THREE.Group();root.name='laundry-storage-470x450';scene.add(root);
 const [lowerBody,top,upperBody,upperDoor,lowerDoor]=legacy;
 function mesh(g,m,name){const o=new THREE.Mesh(g,m);o.name=name;o.castShadow=o.receiveShadow=true;root.add(o);return o;}
 function box(xx,y,z,ww,h,d,m,name){const o=mesh(new THREE.BoxGeometry(ww,h,d),m,name);o.position.set(xx,y,z);return o;}
 function geomBox(xx,y,z,ww,h,d){const g=new THREE.BoxGeometry(ww,h,d).toNonIndexed();g.translate(xx,y,z);return g;}
 function merge(gs){const out=new THREE.BufferGeometry();for(const [key,size] of [['position',3],['normal',3],['uv',2]]){const a=[];for(const g of gs)a.push(...g.attributes[key].array);out.setAttribute(key,new THREE.Float32BufferAttribute(a,size));}gs.forEach(g=>g.dispose());return out;}
 function replace(o,g,xx,y,z,name){o.geometry.dispose();o.geometry=g;o.position.set(xx,y,z);o.rotation.set(0,0,0);o.name=name;root.add(o);return o;}
 function carcass(h,hasTop){const gs=[geomBox(-w/2+t/2,0,0,t,h,S.depth),geomBox(w/2-t/2,0,0,t,h,S.depth),geomBox(0,0,-S.depth/2+t/2,w-2*t,h,t),geomBox(0,-h/2+t/2,0,w-2*t,t,S.depth)];if(hasTop)gs.push(geomBox(0,h/2-t/2,0,w-2*t,t,S.depth));return merge(gs);}
 replace(lowerBody,carcass(S.lower,false),x+w/2,S.base+S.lower/2,back+S.depth/2,'laundry-lower-carcass');
 replace(top,new THREE.BoxGeometry(w,.022,S.depth),x+w/2,lowerTop-.011,back+S.depth/2,'laundry-niche-bottom');
 replace(upperBody,carcass(S.upper,true),x+w/2,upperBottom+S.upper/2,back+S.depth/2,'laundry-upper-carcass');
 // One tall side-cabinet door rather than two arbitrary 500 mm shallow fronts.
 replace(upperDoor,new THREE.BoxGeometry(w-2*t-.004,S.upper-.008,t),x+w/2,upperBottom+S.upper/2,front-t/2,'laundry-upper-door');
 const hinge=new THREE.Group();hinge.name='laundry-upper-hinge';hinge.position.set(x+w-t,0,front-t/2);root.add(hinge);root.updateMatrixWorld(true);hinge.attach(upperDoor);
 const dh=S.lower-.026,shape=new THREE.Shape();shape.moveTo(-w/2+t,-dh/2);shape.lineTo(w/2-t,-dh/2);shape.lineTo(w/2-t,dh/2);shape.lineTo(-w/2+t,dh/2);shape.closePath();
 const hole=new THREE.Path(),hw=.33,hh=.155,r=.024,cy=.18;
 hole.moveTo(-hw/2+r,cy-hh/2);hole.lineTo(hw/2-r,cy-hh/2);hole.quadraticCurveTo(hw/2,cy-hh/2,hw/2,cy-hh/2+r);hole.lineTo(hw/2,cy+hh/2-r);hole.quadraticCurveTo(hw/2,cy+hh/2,hw/2-r,cy+hh/2);hole.lineTo(-hw/2+r,cy+hh/2);hole.quadraticCurveTo(-hw/2,cy+hh/2,-hw/2,cy+hh/2-r);hole.lineTo(-hw/2,cy-hh/2+r);hole.quadraticCurveTo(-hw/2,cy-hh/2,-hw/2+r,cy-hh/2);hole.closePath();shape.holes.push(hole);
 const g=new THREE.ExtrudeGeometry(shape,{depth:t,bevelEnabled:false,curveSegments:12});
 replace(lowerDoor,g,x+w/2,S.base+S.lower/2,front-t,'laundry-hamper-front-with-opening');
 const basket=materials.linen.clone();basket.color.set('#777269');basket.roughness=.95;
 box(x+w/2,.36,front-.14,w-.085,.54,.03,basket,'laundry-recessed-basket');
 box(x+w/2,(lowerTop+upperBottom)/2,back+t/2,w-2*t,S.niche,t,materials.cream,'laundry-niche-back');
 for(const xx of [x+t/2,x+w-t/2])box(xx,(lowerTop+upperBottom)/2,back+S.depth/2,t,S.niche,S.depth,materials.cream,'laundry-niche-cheek');
 // EL.07 socket stack sits on the back of the open niche.
 for(const y of [.91,1.015,1.12]){box(x+w*.62,y,back+t+.005,.072,.079,.010,materials.white,'laundry-niche-socket');for(const dx of [-.015,.015])box(x+w*.62+dx,y,back+t+.011,.004,.015,.003,materials.dark,'laundry-socket-slot');}
 // Folded linens remain behind the flush face, with room above to reach in.
 for(let i=0;i<3;i++)box(x+w*.48,lowerTop+.025+i*.033,front-.125,.27-i*.008,.030,.19,materials.linen,'laundry-folded-towel');
 // Concealed two-fold ironing board: two padded leaves on a pull-out tray.
 box(x+w/2,upperBottom+.045,front-.225,w-.065,.018,.36,materials.metal,'laundry-ironing-tray');
 for(const xx of [x+.045,x+w-.045])box(xx,upperBottom+.040,front-.225,.012,.025,.36,materials.chrome,'laundry-ironing-slide');
 for(let i=0;i<2;i++)box(x+w/2,upperBottom+.080+i*.035,front-.22,.34,.027,.31,materials.linen,'laundry-folded-ironing-leaf');
 box(x+w/2,upperBottom+.165,front-.23,w-2*t,.018,.36,materials.cream,'laundry-internal-shelf');
 for(const y of [upperBottom+.2,S.top-.2])box(x+w-t-.012,y,front-.048,.025,.048,.035,materials.chrome,'laundry-upper-hinge-fitting');
 return {root,upperDoor,lowerDoor,legacy,spec:S,front,back,lowerTop,upperBottom,setOpen(open){hinge.rotation.y=open?Math.PI/2:0;root.updateMatrixWorld(true);}};
}
