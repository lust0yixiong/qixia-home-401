// A render-only snapshot: never mutate editor materials, geometry, or surface IDs.
export function createPhotoSnapshot(THREE, source, lighting, PhysicalSpotLight) {
 const snapshot=new THREE.Scene(), geometries=new Map(), materials=new Map(), textures=new Map();
 const materialFor=m=>{
  if(materials.has(m))return materials.get(m);
  let copy=m.isMeshStandardMaterial?m.clone():new THREE.MeshStandardMaterial({color:m.color||0xffffff,map:m.map||null,side:m.side,roughness:.8});
  if(['glass','frosted','teaGlass'].includes(m.name)){
   copy.dispose();copy=new THREE.MeshPhysicalMaterial({color:m.name==='teaGlass'?'#c9b39a':'#ffffff',transmission:.98,ior:1.5,roughness:m.name==='frosted'?.42:.025,metalness:0,side:THREE.DoubleSide,thickness:.012});
  }
  if(m.name==='mirror'){copy.color.set('#fafafa');copy.metalness=1;copy.roughness=.015;copy.map=null;copy.bumpMap=null;copy.roughnessMap=null;}
  for(const key of Object.keys(copy)){const texture=copy[key];if(texture?.isTexture){if(!textures.has(texture))textures.set(texture,texture.clone());copy[key]=textures.get(texture);}}
  materials.set(m,copy);return copy;
 };
 source.updateMatrixWorld(true);
 source.traverseVisible(o=>{
  if(!o.isMesh||o.userData.photoExclude)return;
  if(!geometries.has(o.geometry))geometries.set(o.geometry,o.geometry.clone());
  const mesh=new THREE.Mesh(geometries.get(o.geometry),Array.isArray(o.material)?o.material.map(materialFor):materialFor(o.material));
  mesh.name=o.name;mesh.matrixAutoUpdate=false;mesh.matrix.copy(o.matrixWorld);snapshot.add(mesh);
 });
 const sunlight=source.getObjectByName('photo-sun');
 if(sunlight){const sun=sunlight.clone();sun.target=sunlight.target.clone();snapshot.add(sun,sun.target);}
 // Every source keeps its documented position; no room-dependent pooled lights.
 for(const s of lighting.sources){
  const light=new PhysicalSpotLight('#ffdfb5',s.power,0,s.angle,.55,2);light.radius=.035;
  light.position.set(s.x,s.y,s.z);light.target.position.set(s.x,s.y-1,s.z);snapshot.add(light,light.target);
 }
 for(const s of lighting.areas||[]){
  const light=new THREE.RectAreaLight('#ffdfb5',s.power,s.width,s.height);light.name=s.id;
  light.position.set(s.x,s.y,s.z);light.rotation.set(-Math.PI/2,0,0);light.rotateOnWorldAxis(new THREE.Vector3(0,1,0),s.rotation);snapshot.add(light);
 }
 snapshot.updateMatrixWorld(true);
 return {scene:snapshot,dispose(){for(const g of geometries.values())g.dispose();for(const m of materials.values())m.dispose();for(const t of textures.values())t.dispose();}};
}
