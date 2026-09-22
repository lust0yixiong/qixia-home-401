// Appearance reconstructed from the user's design renders, not recovered designer PBR files.
export const REFERENCE_REVISION = 1;
export const REFERENCE_FINISHES = [
  {id:'ref-wood', name:'效果图 · 灰棕木饰面', file:'wood.png', base:'wood', roughness:.58, fallback:'oak'},
  {id:'ref-floor', name:'效果图 · 暖灰石材地面', file:'floor.png', base:'stone', roughness:.72, fallback:'limestone'},
  {id:'ref-countertop', name:'效果图 · 炭灰台面', file:'countertop.png', base:'countertop', roughness:.43, fallback:'slate'},
  {id:'ref-green', name:'效果图 · 深绿釉面砖', file:'green.png', base:'green', roughness:.23, fallback:'paint'},
  {id:'ref-vanity', name:'效果图 · 洗漱区细纹石材', file:'vanity.png', base:'vanityStone', roughness:.48, fallback:'limestone'}
].map(p=>({...p,category:'reference',color:'#ffffff',metalness:0,reference:true}));
export const REFERENCE_PALETTE = {
  cream:'#dcd6c9', wall:'#ece7dd', linen:'#d0c8b9', duvet:'#ece8df', pink:'#b9807c',
  headboard:'#686259', darkwood:'#786657', white:'#f0eadf', rug:'#aaa69b'
};
const legacy = {
  wood:['#ffffff',.58,1],stone:['#ffffff',.6,5],countertop:['#343936',.38,1],
  cream:['#e7e3d7',.68,1],wall:['#f5f2e8',.92,1],green:['#205b38',.25,1],
  wetTile:['#d7d9d1',.75,1],windowFrame:['#ffffff',.35,1,.08],
  linen:['#ddd6c3',.95,1],duvet:['#f5f1e8',.95,1],pink:['#c47f8b',.75,1]
};
export function isLegacyDefault(key,c) {
  const old=legacy[key];
  return !!old && c?.mode==='original' && c.color?.toLowerCase()===old[0] && c.roughness===old[1]
    && c.repeatX===old[2] && c.repeatY===old[2] && c.rotation===0 && (c.metalness??old[3]??0)===(old[3]??0);
}
// Only untouched category defaults migrate. Explicit component overrides and custom choices survive.
export function migrateReferenceDefaults(plan, defaults) {
  if(plan.defaultRevision===REFERENCE_REVISION)return plan;
  const next=structuredClone(plan);
  for(const [key,c] of Object.entries(next.materials||{}))if(isLegacyDefault(key,c)&&defaults[key]){
    const {map,...config}=defaults[key];next.materials[key]={...config};
  }
  // The wash-area finish is now separate; old intentional wet-room choices still carry over.
  if(!next.materials.vanityStone && plan.materials?.wetTile && !isLegacyDefault('wetTile',plan.materials.wetTile))
    next.materials.vanityStone=structuredClone(plan.materials.wetTile);
  next.defaultRevision=REFERENCE_REVISION;
  return next;
}
