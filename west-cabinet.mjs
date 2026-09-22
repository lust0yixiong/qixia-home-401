export const westCabinetSetback=.20;
// Apply after surface registration and the round sink installation: neither the
// countertop nor saved material IDs change. Negative X is toward the west wall.
export function recessWestCabinet({THREE,body,fronts,handles,setback=westCabinetSetback,sink}){
 body.geometry.computeBoundingBox();const bounds=body.geometry.boundingBox,size=bounds.getSize(new THREE.Vector3());
 const w=size.x-setback,h=size.y,d=size.z,t=.018;
 if(w<=t*2)throw new Error('Cabinet setback leaves no usable depth');
 // The fixed 320 mm bowl projects a little past the recessed fronts. Reserve a
 // discreet notch under the overhang instead of drawing the door through it.
 const clearance={z:sink.z,width:.24,bottom:sink.top-.19};
 function notchedPanel(width,height,depth,worldY,worldZ){
  const lo=Math.max(-depth/2,-(clearance.z-worldZ)-clearance.width/2);
  const hi=Math.min(depth/2,-(clearance.z-worldZ)+clearance.width/2);
  const bottom=Math.max(-height/2,clearance.bottom-worldY);
  if(lo>=hi||bottom>=height/2)return new THREE.BoxGeometry(width,height,depth);
  const shape=new THREE.Shape();shape.moveTo(-depth/2,-height/2);shape.lineTo(depth/2,-height/2);shape.lineTo(depth/2,height/2);
  shape.lineTo(hi,height/2);shape.lineTo(hi,bottom);shape.lineTo(lo,bottom);shape.lineTo(lo,height/2);shape.lineTo(-depth/2,height/2);shape.closePath();
  const g=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(-width/2,0,0);return g;
 }
 function box(width,height,depth,x,y,z){const g=new THREE.BoxGeometry(width,height,depth);g.translate(x,y,z);return g;}
 const front=notchedPanel(t,h,d,body.position.y,body.position.z);front.translate(w/2-t/2,0,0);
 const parts=[front,box(t,h,d,-w/2+t/2,0,0),box(w-t*2,h,t,0,0,-d/2+t/2),box(w-t*2,h,t,0,0,d/2-t/2),box(w-t*2,t,d-t*2,0,-h/2+t/2,0)];
 const arrays={position:[],normal:[],uv:[]};
 for(const original of parts){const g=original.index?original.toNonIndexed():original;for(const key in arrays)for(const v of g.attributes[key].array)arrays[key].push(v);if(g!==original)g.dispose();original.dispose();}
 const geometry=new THREE.BufferGeometry();for(const key in arrays)geometry.setAttribute(key,new THREE.Float32BufferAttribute(arrays[key],key==='uv'?2:3));
 body.geometry.dispose();body.geometry=geometry;body.position.x-=setback/2;
 for(const door of fronts){const p=door.geometry.parameters;const next=notchedPanel(p.width,p.height,p.depth,door.position.y,door.position.z);door.geometry.dispose();door.geometry=next;door.position.x-=setback;}
 for(const handle of handles)handle.position.x-=setback;
 return {setback,depth:w,clearance};
}
