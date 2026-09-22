import {STAINLESS_FINISHES,sampleStainless,stainlessPixels} from './stainless-finishes.mjs?v=33';
import {REFERENCE_FINISHES, REFERENCE_PALETTE} from './reference-materials.js?v=25';
// Bundled CC0 oak scans plus locally generated seamless PBR surfaces.
export const FINISHES = [
  ...REFERENCE_FINISHES,
  {id:'paint',name:'哑光烤漆',color:'#e8e4dc',roughness:.68,metalness:0},
  {id:'oak',name:'自然橡木',color:'#ffffff',roughness:.58,metalness:0,asset:'oak_veneer_01'},
  {id:'walnut',name:'深色胡桃木',color:'#ffffff',roughness:.52,metalness:0},
  {id:'limestone',name:'浅色石材',color:'#ffffff',roughness:.6,metalness:0},
  {id:'slate',name:'深灰哑光岩板',color:'#ffffff',roughness:.38,metalness:0,category:'slab'},
  {id:'slab-white',name:'浅灰石纹岩板',color:'#ffffff',roughness:.32,metalness:0,category:'slab',asset:'Marble012',sourceUrl:'https://ambientcg.com/view?id=Marble012',normalStrength:.06},
  {id:'slab-black',name:'黑色石纹岩板',color:'#ffffff',roughness:.26,metalness:0,category:'slab',asset:'Marble006',sourceUrl:'https://ambientcg.com/view?id=Marble006',normalStrength:.06},
  ...STAINLESS_FINISHES,
  {id:'walnut-natural',name:'天然黑胡桃木',color:'#ffffff',roughness:.65,metalness:0,asset:'black_walnut_veneer_01'},
  {id:'marble-beige',name:'米色大理石',color:'#ffffff',roughness:.32,metalness:0,asset:'marble_01'},
  {id:'terrazzo',name:'彩粒水磨石',color:'#ffffff',roughness:.6,metalness:0,asset:'terrazzo_tiles'},
  {id:'plaster-fine',name:'白色灰泥',color:'#ffffff',roughness:.95,metalness:0,asset:'white_stucco'},
  {id:'fabric-check',name:'格纹织物',color:'#ffffff',roughness:1,metalness:0,asset:'fabric_pattern_05'}
];
const TAU=Math.PI*2;
function noise(x,y,frequency,seed=0) {
  x*=frequency;y*=frequency;
  const ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy;
  const s=u*u*(3-2*u),t=v*v*(3-2*v);
  const hash=(a,b)=>{let n=Math.imul((a+frequency)%frequency+seed*131,374761393)^Math.imul((b+frequency)%frequency+71,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
  const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);
  return (a+(b-a)*s)*(1-t)+(c+(d-c)*s)*t;
}
export function sampleSurface(kind,u,v) {
  if(STAINLESS_FINISHES.some(p=>p.id===kind))return sampleStainless(kind,u,v);
  const n=noise(u,v,8,9),fine=noise(u,v,128,2),mid=noise(u,v,32,3);
  let color, height,rough;
  if(kind==='oak'||kind==='walnut') {
    const bend=.012*Math.sin(v*TAU)+.004*Math.sin(v*TAU*3+u*TAU);
    const grain=Math.sin((u+bend)*TAU*46+1.6*Math.sin(u*TAU*3)+.45*Math.sin(v*TAU*2));
    const pore=Math.pow((grain+1)/2,12),ribbon=Math.sin((u+bend)*TAU*9);
    const tone=.95+.06*n+.009*ribbon-.045*pore+(fine-.5)*.018;
    const base=kind==='oak'?[187,150,103]:[111,77,50];color=base.map(c=>c*tone);
    height=.53-.19*pore+.05*mid;rough=.78+.14*pore+.06*mid;
  } else if(kind==='limestone'||kind==='slate') {
    const broad=noise(u,v,4,4),cloud=.5*broad+.3*n+.2*mid;
    const vein=Math.pow(Math.max(0,1-Math.abs(Math.sin((u*3+v*2+.4*n)*TAU))*14),3);
    const base=kind==='limestone'?[207,201,186]:[69,73,69];
    color=base.map(c=>c+(cloud-.5)*(kind==='slate'?12:18)-vein*(kind==='slate'?2:8)+(fine-.5)*3);
    height=.47+.12*fine+.035*mid;rough=.76+.18*mid+.06*fine;
  } else if(kind==='brushed') {
    const stripe=.5+.5*Math.sin(u*TAU*190+.2*Math.sin(v*TAU));
    color=[242,242,242];height=.45+.1*stripe;rough=.65+.25*stripe;
  } else if(kind==='fabric') {
    const weave=Math.sin(u*TAU*96)*Math.sin(v*TAU*96);
    color=[255,255,255];height=.5+.15*weave;rough=.9+.06*weave;
  } else {
    color=[255,255,255];height=.5+(fine-.5)*.1;rough=.88+(mid-.5)*.08;
  }
  return {color,height,rough};
}
export function createFinishLibrary(THREE,renderer) {
  const cache=new Map(),owned=new WeakMap();
  const baseKinds={...Object.fromEntries(REFERENCE_FINISHES.map(p=>[p.base,p.id])),cream:'paint',wall:'paint',linen:'fabric',duvet:'fabric'};
  const baseMetal={},baseEnvironment={};
  function get(id) {
    if(cache.has(id))return cache.get(id);
    const reference=REFERENCE_FINISHES.find(p=>p.id===id);if(reference)return get(reference.fallback);
    if(STAINLESS_FINISHES.some(p=>p.id===id)){
      const size=512,pixels=stainlessPixels(id,size),canvases={};
      for(const key of ['normal','rough','preview']){const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d'),image=ctx.createImageData(size,size);image.data.set(pixels[key]);ctx.putImageData(image,0,0);canvases[key]=canvas;}
      const texture=canvas=>{const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;};
      const value={map:null,bump:null,normal:texture(canvases.normal),rough:texture(canvases.rough),preview:canvases.preview};cache.set(id,value);return value;
    }
    const size=512,canvases=[0,1,2].map(()=>{const c=document.createElement('canvas');c.width=c.height=size;return c;});
    const contexts=canvases.map(c=>c.getContext('2d')),images=contexts.map(c=>c.createImageData(size,size));
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const s=sampleSurface(id,x/size,y/size),i=(y*size+x)*4;
      for(let k=0;k<3;k++) {const rgb=k===0?s.color:Array(3).fill((k===1?s.height:s.rough)*255);for(let ch=0;ch<3;ch++)images[k].data[i+ch]=rgb[ch];images[k].data[i+3]=255;}
    }
    const textures=canvases.map((c,i)=>{contexts[i].putImageData(images[i],0,0);const t=new THREE.CanvasTexture(c);t.colorSpace=i===0?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;});
    const value={map:['paint','fabric','brushed'].includes(id)?null:textures[0],bump:textures[1],rough:textures[2]};
    if(!value.map)textures[0].dispose();cache.set(id,value);return value;
  }
  const pending=new Map();
  async function ensure(id){
    const reference=REFERENCE_FINISHES.find(p=>p.id===id);
    if(!reference&&!FINISHES.find(p=>p.id===id)?.asset)return get(id);
    if(cache.get(id)?.normal||cache.get(id)?.reference)return cache.get(id);
    if(pending.has(id))return pending.get(id);
    const job=(async()=>{
      const loader=new THREE.TextureLoader();
      if(reference){
        const map=await loader.loadAsync(`./assets/reference-materials/${reference.file}`);
        map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;
        map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
        const detail=get('paint');
        const value={map,bump:detail.bump,rough:detail.rough,normal:null,reference:true};
        cache.set(id,value);return value;
      }
      // A failed request leaves the active material and saved configuration untouched.
      const jobs=await Promise.allSettled(['color','normal','roughness'].map(name=>loader.loadAsync(`./assets/materials/${id}-${name}.jpg`)));
      if(jobs.some(r=>r.status==='rejected')){for(const r of jobs)if(r.status==='fulfilled')r.value.dispose();throw Error('素材加载失败');}
      const textures=jobs.map(r=>r.value);
      textures.forEach((t,i)=>{t.colorSpace=i===0?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());});
      const value={map:textures[0],normal:textures[1],rough:textures[2],bump:null};cache.set(id,value);return value;
    })();
    pending.set(id,job);try{return await job;}finally{pending.delete(id);}
  }
  async function preload(){await Promise.all(REFERENCE_FINISHES.map(async p=>{try{await ensure(p.id);}catch{console.warn(`${p.name}暂不可用，采用备用纹理。`);}}));}
  function dispose(material){const record=owned.get(material);if(record){record.maps.forEach(t=>t?.dispose());owned.delete(material);}}
  function decorate(material,config,base) {
    const kind=config.mode==='preset'?config.preset:config.mode==='original'?(baseKinds[base]||null):null;
    let record=owned.get(material);
    const source=kind?get(kind):null;
    if(!record||record.kind!==kind||record.source!==source){
      dispose(material);
      record={kind,source,maps:source?[source.bump?.clone()||null,source.rough.clone(),source.normal?.clone()||null]:[]};owned.set(material,record);
      material.bumpMap=record.maps[0]||null;material.roughnessMap=record.maps[1]||null;material.normalMap=record.maps[2]||null;material.normalScale.setScalar(FINISHES.find(p=>p.id===kind)?.normalStrength??.22);material.needsUpdate=true;
    }
    material.bumpScale=kind==='oak'||kind==='walnut'?.0015:kind==='fabric'?.0015:kind==='paint'?.0004:kind==='brushed'?.0003:.0006;
    material.metalness=config.metalness??baseMetal[base]??0;
    material.envMapIntensity=STAINLESS_FINISHES.some(p=>p.id===kind)?.9:(baseEnvironment[base]??.48);
    for(const t of record.maps){if(!t)continue;t.repeat.set(config.repeatX,config.repeatY);t.center.set(.5,.5);t.rotation=THREE.MathUtils.degToRad(config.rotation);}
  }
  function initialize(materials) {
    for(const [key,m] of Object.entries(materials)) {
      baseMetal[key]=m.metalness;
      m.envMapIntensity=['chrome','metal','brass','sink','mirror'].includes(key)?.85:.48;
      baseEnvironment[key]=m.envMapIntensity;
    }
    for(const [key,color] of Object.entries(REFERENCE_PALETTE))materials[key]?.color.set(color);
    for(const [key,kind] of Object.entries(baseKinds)) {
      const m=materials[key];if(!m)continue;const source=get(kind),old=m.map;
      if(source.map){m.map=source.map.clone();m.color.set('#ffffff');if(key==='stone')m.map.repeat.set(1,1);}
      if(old)old.dispose();
      m.roughness=REFERENCE_FINISHES.find(p=>p.base===key)?.roughness??{cream:.68,wall:.92,linen:.95,duvet:.95}[key];
      decorate(m,{mode:'original',repeatX:m.map?.repeat.x||1,repeatY:m.map?.repeat.y||1,rotation:0},key);
    }
  }
  return {get,ensure,decorate,dispose,initialize,preload};
}
