import {RoundedBoxGeometry} from './assets/three-addons/geometries/RoundedBoxGeometry.js';

// Apply AFTER the material registry is built, keeping saved component IDs stable.
// Only shave the original edges inward; the measured outer dimensions stay fixed.
export function softenFurnitureEdges(scene,materials) {
  const finishes=new Set([materials.cream,materials.wood,materials.countertop]),cache=new Map();
  scene.traverse(mesh=>{
    if(!mesh.isMesh||mesh.geometry.type!=='BoxGeometry'||!finishes.has(mesh.material))return;
    const {width:w,height:h,depth:d}=mesh.geometry.parameters;
    if(![w,h,d].every(Number.isFinite)||Math.min(w,h,d)<.009||[w,h,d].filter(v=>v>.15).length<2)return;
    const radius=Math.min(.003,Math.min(w,h,d)*.09),key=[w,h,d,radius].join(',');
    if(!cache.has(key))cache.set(key,new RoundedBoxGeometry(w,h,d,1,radius));
    const old=mesh.geometry;mesh.geometry=cache.get(key);old.dispose();
  });
}
