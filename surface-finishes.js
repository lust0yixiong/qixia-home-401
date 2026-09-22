// Bundled CC0 oak scans plus locally generated seamless PBR surfaces.
export const FINISHES = [
  {id:'paint',name:'哑光烤漆',color:'#e8e4dc',roughness:.68,metalness:0},
  {id:'oak',name:'自然橡木',color:'#ffffff',roughness:.58,metalness:0,asset:'oak_veneer_01'},
  {id:'walnut',name:'深色胡桃木',color:'#ffffff',roughness:.52,metalness:0},
  {id:'limestone',name:'浅色石材',color:'#ffffff',roughness:.6,metalness:0},
  {id:'slate',name:'深灰岩板',color:'#ffffff',roughness:.38,metalness:0},
  {id:'brushed',name:'拉丝金属',color:'#c2c8c6',roughness:.35,metalness:1},
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
  const baseKinds={wood:'oak',stone:'limestone',countertop:'slate',cream:'paint',wall:'paint',linen:'fabric',duvet:'fabric'};
  const baseMetal={};
  function get(id) {
    if(cache.has(id))return cache.get(id);
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
    if(!FINISHES.find(p=>p.id===id)?.asset)return get(id);
    if(cache.get(id)?.normal)return cache.get(id);
    if(pending.has(id))return pending.get(id);
    const job=(async()=>{
      const loader=new THREE.TextureLoader();
      // A failed request leaves the active material and saved configuration untouched.
      const jobs=await Promise.allSettled(['color','normal','roughness'].map(name=>loader.loadAsync(`./assets/materials/${id}-${name}.jpg`)));
      if(jobs.some(r=>r.status==='rejected')){for(const r of jobs)if(r.status==='fulfilled')r.value.dispose();throw Error('素材加载失败');}
      const textures=jobs.map(r=>r.value);
      textures.forEach((t,i)=>{t.colorSpace=i===0?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());});
      const value={map:textures[0],normal:textures[1],rough:textures[2],bump:null};cache.set(id,value);return value;
    })();
    pending.set(id,job);try{return await job;}finally{pending.delete(id);}
  }
  async function preload(){try{await ensure('oak');}catch{console.warn('木纹图片暂不可用，采用内置备用纹理。');}}
  function dispose(material){const record=owned.get(material);if(record){record.maps.forEach(t=>t?.dispose());owned.delete(material);}}
  function decorate(material,config,base) {
    const kind=config.mode==='preset'?config.preset:config.mode==='original'?(baseKinds[base]||null):null;
    let record=owned.get(material);
    const source=kind?get(kind):null;
    if(!record||record.kind!==kind||record.source!==source){
      dispose(material);
      record={kind,source,maps:source?[source.bump?.clone()||null,source.rough.clone(),source.normal?.clone()||null]:[]};owned.set(material,record);
      material.bumpMap=record.maps[0]||null;material.roughnessMap=record.maps[1]||null;material.normalMap=record.maps[2]||null;material.normalScale.set(.22,.22);material.needsUpdate=true;
    }
    material.bumpScale=kind==='oak'||kind==='walnut'?.0015:kind==='fabric'?.0015:kind==='paint'?.0004:kind==='brushed'?.0003:.0006;
    material.metalness=config.metalness??baseMetal[base]??0;
    for(const t of record.maps){if(!t)continue;t.repeat.set(config.repeatX,config.repeatY);t.center.set(.5,.5);t.rotation=THREE.MathUtils.degToRad(config.rotation);}
  }
  function initialize(materials) {
    for(const [key,m] of Object.entries(materials)) {
      baseMetal[key]=m.metalness;
      m.envMapIntensity=['chrome','metal','brass','sink','mirror'].includes(key)?.85:.48;
    }
    for(const [key,kind] of Object.entries(baseKinds)) {
      const m=materials[key],source=get(kind),old=m.map;
      if(source.map&&key!=='countertop'){m.map=source.map.clone();m.color.set('#ffffff');if(key==='stone')m.map.repeat.set(5,5);}
      if(old)old.dispose();
      m.roughness={wood:.58,stone:.6,countertop:.38,cream:.68,wall:.92,linen:.95,duvet:.95}[key];
      decorate(m,{mode:'original',repeatX:m.map?.repeat.x||1,repeatY:m.map?.repeat.y||1,rotation:0},key);
    }
  }
  return {get,ensure,decorate,dispose,initialize,preload};
}
