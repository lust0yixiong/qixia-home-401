import * as THREE from 'three';
import {fixtures,tracks,strips,membrane,lightingGroups} from './lighting-layout.mjs?v=21';
const X=x=>(x-855)/85.6,Z=z=>(z-610)/85.6;
// Physical positions follow the drawings. Fixture optics/flux/3000 K appearance are preview assumptions.
export function createLightingDesign({scene,sun,fill,hemi,renderer,extras=[]}){
 const overhead=new THREE.Group();overhead.name='P04-P07-light-fixtures';scene.add(overhead);
 const sources=[],glows=[],enabled=new Set(lightingGroups.map(([id])=>id));
 const housing=new THREE.MeshStandardMaterial({color:'#f5f3eb',roughness:.6});
 const railMat=new THREE.MeshStandardMaterial({color:'#333831',roughness:.48});
 let mode='day',room='all',shown=false;
 function glow(room,material){glows.push({room,material});return material;}
 function face(room){return glow(room,new THREE.MeshStandardMaterial({color:'#fff0dc',emissive:'#ffddab',emissiveIntensity:0,roughness:.7,side:THREE.FrontSide}));}
 function mesh(geo,mat,x,y,z,parent=overhead){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
 function source(id,room,x,y,z,power=10,angle=.9,range=4.3){sources.push({id,room,x,y,z,power,angle,range});}
 function spot(f){
  const x=X(f.x),z=Z(f.z),ceiling=f.type==='ceiling',r=ceiling?.16:.044,h=f.type==='surface'?.12:.026,y=f.height-h/2;
  const m=mesh(new THREE.CylinderGeometry(r,r,h,24),housing,x,y,z);m.name=f.id;m.userData.drawingCircuit=f.circuit;
  const light=mesh(new THREE.CircleGeometry(r*.82,24),face(f.room),x,y-h/2-.001,z);light.rotation.x=Math.PI/2;
  source(f.id,f.room,x,y-h/2-.012,z,ceiling?15:10,ceiling?1.35:.87);
 }
 fixtures.forEach(spot);
 for(const t of tracks){
  const a=new THREE.Vector3(X(t.from[0]),t.height-.025,Z(t.from[1])),b=new THREE.Vector3(X(t.to[0]),t.height-.025,Z(t.to[1]));
  const m=mesh(new THREE.BoxGeometry(a.distanceTo(b),.04,.032),railMat,(a.x+b.x)/2,a.y,(a.z+b.z)/2);m.name=t.id;m.rotation.y=-Math.atan2(b.z-a.z,b.x-a.x);
  // Module count and beam angles are illustrative; only the rail is defined in P.04/P.07.
  for(let i=0;i<4;i++){const p=a.clone().lerp(b,(i+.5)/4);spot({id:`${t.id}-module-${i+1}`,room:t.room,type:'surface',x:p.x*85.6+855,z:p.z*85.6+610,height:t.height-.035,circuit:t.circuit});}
 }
 for(const t of strips){
  const a=new THREE.Vector3(X(t.from[0]),t.height,Z(t.from[1])),b=new THREE.Vector3(X(t.to[0]),t.height,Z(t.to[1]));
  const m=mesh(new THREE.BoxGeometry(a.distanceTo(b),.012,.016),face(t.room),(a.x+b.x)/2,a.y,(a.z+b.z)/2);m.rotation.y=-Math.atan2(b.z-a.z,b.x-a.x);m.name=t.id;
  source(t.id,t.room,m.position.x,t.height-.05,m.position.z,6,1.3,2.8);
 }
 const p=membrane,px=X(p.x),pz=Z(p.z),panel=mesh(new THREE.PlaneGeometry(p.width,p.depth),face(p.room),px,p.height,pz);panel.rotation.x=Math.PI/2;panel.name=p.id;
 // Downward facing membrane stays open from above in the cutaway model.
 for(const sign of [-1,1]){
  mesh(new THREE.BoxGeometry(.025,.025,p.depth),housing,px+sign*p.width/2,p.height,pz);
  mesh(new THREE.BoxGeometry(p.width,.025,.025),housing,px,p.height,pz+sign*p.depth/2);
 }
 for(const dz of [-.85,0,.85])source(`${p.id}-${dz}`,p.room,px,p.height-.02,pz+dz,17,1.2,4);
 for(const e of extras){glow(e.room,e.material);source(e.id,e.room,...e.position,e.power||4,1.35,1.8);}
 // A fixed pool bounds shader cost. All fittings remain drawn; illumination is a preview, not lux analysis.
 const pool=Array.from({length:12},()=>{const light=new THREE.SpotLight('#ffdfb5',0,4.3,.9,.65,2);scene.add(light,light.target);return light;});
 const envMaterials=new Map();scene.traverse(o=>{if(o.isMesh)for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m.isMeshStandardMaterial&&!envMaterials.has(m))envMaterials.set(m,m.envMapIntensity);});
 const button=document.createElement('button');button.id='lighting-toggle';button.textContent='灯光设计';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','lighting-panel');document.querySelector('.scene-tools').append(button);
 const ui=document.createElement('section');ui.id='lighting-panel';ui.className='hidden';ui.setAttribute('aria-label','灯光设计');
 ui.innerHTML=`<div class="material-head"><h2>灯光设计</h2><button id="lighting-close" aria-label="关闭灯光设计">×</button></div><p class="material-note">灯位依据 P.04 / P.07，照明分组参考 P.09。</p><label for="lighting-mode">照明场景</label><select id="lighting-mode"><option value="day">日间 · 自然采光</option><option value="evening">夜间 · 图纸灯光</option><option value="mixed">日间 · 同时开灯</option></select><label class="lighting-check"><input type="checkbox" id="lighting-fixtures">显示顶部灯具</label><p class="material-note">隐藏灯具方便查看家具，不影响照明。</p><fieldset id="lighting-rooms"><legend>分区开关</legend>${lightingGroups.map(([id,label])=>`<label class="lighting-check"><input type="checkbox" data-light-room="${id}" checked>${label}</label>`).join('')}</fieldset><p id="lighting-status" role="status"></p><p class="material-note">暖白光约 3000 K、亮度与光束为展示参数；图纸未注明灯具光学规格。</p><button id="lighting-drawing">查看灯位尺寸图 ↗</button>`;
 document.querySelector('#scene-view').append(ui);
 const status=ui.querySelector('#lighting-status');
 function refresh(){
  const lit=mode!=='day';overhead.visible=shown;
  const night=mode==='evening';document.querySelector('#scene-view').classList.toggle('night-scene',night);sun.intensity=night?.055:2.8;fill.intensity=night?.045:.4;hemi.intensity=night?.14:.65;
  scene.background.set(night?'#273039':'#e9eeeb');scene.fog.color.copy(scene.background);
  // Updated clones from material editing inherit the current lighting ambience.
  scene.traverse(o=>{if(o.isMesh)for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m.isMeshStandardMaterial){if(!envMaterials.has(m))envMaterials.set(m,.48);m.envMapIntensity=night?.1:envMaterials.get(m);}});
  for(const g of glows)g.material.emissiveIntensity=lit&&enabled.has(g.room)?1.6:0;
  const activeGroups=lightingGroups.filter(([id])=>enabled.has(id));
  const quotas=Object.fromEntries(activeGroups.map(([id])=>[id,1]));
  let remaining=pool.length-activeGroups.length;
  const priority=room==='all'?['kitchen','flex','bath','master','second','balcony']: [room,room,room,room,'kitchen','bath','flex','master','second','balcony'];
  for(let i=0;remaining>0&&activeGroups.length;i++){const id=priority[i%priority.length];if(enabled.has(id)){quotas[id]++;remaining--;}}
  // Cluster adjacent sources per room, preserving their combined contribution rather than dropping fittings.
  const chosen=[];
  for(const [id] of activeGroups){
   const clusters=sources.filter(s=>s.room===id).map(s=>({...s}));
   while(clusters.length>quotas[id]){
    let pair=[0,1],distance=Infinity;
    for(let i=0;i<clusters.length;i++)for(let j=i+1;j<clusters.length;j++){
     const a=clusters[i],b=clusters[j],d=(a.x-b.x)**2+(a.y-b.y)**2+(a.z-b.z)**2;
     if(d<distance){distance=d;pair=[i,j];}
    }
    const [i,j]=pair,a=clusters[i],b=clusters[j],power=a.power+b.power;
    clusters[i]={...a,x:(a.x*a.power+b.x*b.power)/power,y:(a.y*a.power+b.y*b.power)/power,z:(a.z*a.power+b.z*b.power)/power,power,angle:Math.min(1.4,Math.max(a.angle,b.angle)+.12),range:Math.max(a.range,b.range)};
    clusters.splice(j,1);
   }
   chosen.push(...clusters);
  }
  pool.forEach((light,i)=>{const s=chosen[i];light.intensity=lit&&s?Math.min(s.power,45):0;if(s){light.position.set(s.x,s.y,s.z);light.target.position.set(s.x,.05,s.z);light.angle=s.angle;light.distance=s.range;light.target.updateMatrixWorld();}});
  ui.querySelector('#lighting-rooms').disabled=!lit;
  status.textContent=lit?`已开启 ${enabled.size} 个区域 · ${shown?'显示':'隐藏'}灯具`:'自然采光 · 室内灯具关闭';
 }
 button.onclick=()=>{const open=ui.classList.contains('hidden');ui.classList.toggle('hidden',!open);button.setAttribute('aria-expanded',String(open));if(open){document.querySelector('#material-panel')?.classList.add('hidden');document.querySelector('#materials-toggle')?.setAttribute('aria-expanded','false');}};
 function close(){ui.classList.add('hidden');button.setAttribute('aria-expanded','false');}
 ui.querySelector('#lighting-close').onclick=close;ui.addEventListener('keydown',e=>{if(e.key==='Escape'){close();button.focus();}});
 ui.querySelector('#lighting-mode').onchange=e=>{mode=e.target.value;refresh();};
 ui.querySelector('#lighting-fixtures').onchange=e=>{shown=e.target.checked;refresh();};
 ui.querySelectorAll('[data-light-room]').forEach(el=>el.onchange=()=>{if(el.checked)enabled.add(el.dataset.lightRoom);else enabled.delete(el.dataset.lightRoom);refresh();});
 ui.querySelector('#lighting-drawing').onclick=()=>{document.querySelector('[data-mode="plan"]').click();const select=document.querySelector('#drawing-select');select.value='lighting-dimensions';select.dispatchEvent(new Event('change'));};
 refresh();return {setRoom(id){room=id;refresh();},close,refresh};
}
