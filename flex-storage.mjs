// P.01/P.12: 800 x 800 "8百库", entered from the west corridor.
// EL.01: an uninterrupted timber side faces the activity room, flush with
// the 3400 x 600 wardrobe fronts. Small jamb/notch dimensions are traced,
// not labelled construction dimensions.
export function flexStorageBounds(F,right,back) {
  const front=back+F.depth,wardrobeLeft=right-F.width,serviceLeft=wardrobeLeft-F.serviceWidth;
  return {front,wardrobeLeft,serviceLeft,serviceBack:front-F.serviceDepth,
    wallStart:wardrobeLeft-F.serviceNotchWidth};
}
function reshapeBox(THREE,mesh,w,h,d,x,y,z) {
  mesh.geometry.dispose();mesh.geometry=new THREE.BoxGeometry(w,h,d);
  mesh.position.set(x,y,z);
}
// Run after material registration: old saved per-component keys remain valid.
export function correctFlexStorage({THREE,F,right,back,wardrobe,service,partition}) {
  const b=flexStorageBounds(F,right,back),w=F.serviceWidth,d=F.serviceDepth,h=F.height;
  const shape=new THREE.Shape();
  const points=[[-w/2,-d/2],[w/2-F.serviceNotchWidth,-d/2],
    [w/2-F.serviceNotchWidth,-d/2+F.serviceNotchDepth],[w/2,-d/2+F.serviceNotchDepth],
    [w/2,d/2],[-w/2,d/2]];
  points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,steps:1});
  geometry.rotateX(-Math.PI/2);geometry.translate(0,-h/2,0);
  service.body.geometry.dispose();service.body.geometry=geometry;
  service.body.position.set(b.serviceLeft+w/2,h/2,b.serviceBack+d/2);
  service.body.name='flex-storage-solid-timber-side';
  // One corridor-facing full-height leaf; no door seams on the activity-room face.
  for(const leaf of service.doors)leaf.visible=false;
  for(const handle of service.handles)handle.visible=false;
  const leaf=service.doors[0],doorDepth=F.serviceDoorWidth;
  reshapeBox(THREE,leaf,.018,h-.09,doorDepth,b.serviceLeft-.009,(h+.03)/2,b.serviceBack+.02+doorDepth/2);
  leaf.visible=true;leaf.name='flex-storage-corridor-door';
  const handle=service.handles[0];
  reshapeBox(THREE,handle,.024,.15,.012,b.serviceLeft-.028,1.02,b.serviceBack+.02+doorDepth-.06);
  handle.visible=true;
  // Shelf/dashed lines on EL.01 are internal, not horizontal splits in the door skins.
  wardrobe.doors.forEach((door,i)=>{
    if(i%2){door.visible=false;return;}
    const {width,depth}=door.geometry.parameters;
    reshapeBox(THREE,door,width,h-.09,depth,door.position.x,(h+.03)/2,door.position.z);
  });
  // The partition starts at the rear-right notch, leaving the west storage access clear.
  if(partition){
    const p=partition.geometry.parameters,end=partition.position.x+p.width/2;
    reshapeBox(THREE,partition,end-b.wallStart,p.height,p.depth,(end+b.wallStart)/2,partition.position.y,partition.position.z);
    const skirt=partition.skirt,s=skirt.geometry.parameters;
    reshapeBox(THREE,skirt,end-b.wallStart,s.height,s.depth,(end+b.wallStart)/2,skirt.position.y,skirt.position.z);
  }
  return b;
}
