export const APPLIANCE_GROUPS=[['fridgeShell','冰箱外壳与门板'],['washerShell','洗衣机外壳'],['dryerShell','烘干机外壳'],['dishwasherShell','洗碗机门板'],['coffeeShell','咖啡机外壳'],['hoodShell','烟机外壳'],['heaterShell','热水器外壳']];
export function createApplianceMaterials(materials){
 for(const [key] of APPLIANCE_GROUPS){
  const base=key==='fridgeShell'||key==='coffeeShell'?'metal':key==='hoodShell'?'dark':key==='dishwasherShell'?'cream':'white';
  const m=materials[base].clone();m.name=key;
  // These faces used to belong to cream; retain their geometry-derived IDs.
  if(['washerShell','dryerShell','dishwasherShell'].includes(key))m.userData.surfaceIdBase='cream';
  if(key==='coffeeShell'){m.color.set('#c5c9ce');m.roughness=.29;m.metalness=1;}
  materials[key]=m;
 }
 return materials;
}
