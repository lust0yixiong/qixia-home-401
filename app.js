import * as THREE from 'three';
import {createLightingDesign} from './lighting-design.js?v=21';
import { initMaterialEditor } from './material-editor.js?v=24';
import {createFinishLibrary} from './surface-finishes.js?v=24';
import {softenFurnitureEdges} from './surface-edges.js?v=21';
import {createRenderQuality} from './render-quality.js?v=21';
import { OrbitControls } from './assets/OrbitControls.js';
import { kitchenLayout as K, kitchenWindow as KW, cookingWallLayout as CW, kitchenGasCabinet as GC, planX, planZ } from './kitchen-layout.mjs';
import { foldingDoorLayout as FD } from './folding-door-layout.mjs';
import { interiorLayout as D } from './interior-layout.mjs';
const $=s=>document.querySelector(s);
const rooms=[
{id:'all',name:'全屋鸟瞰',en:'OVERVIEW',desc:'餐厨一体与多功能活动区相连，双卧室和独立卫浴分区位于内侧。',facts:['双卧室','开放餐厨','干湿分区'],x:850,z:600,dist:22},
{id:'kitchen',name:'餐厨空间',en:'KITCHEN & DINING',desc:'高低错层的黑灰色岛台与餐桌相接，绿色长条砖衬托浅色橱柜。西侧柜体按平面尺寸衔接墙体转折，距岛台净宽 1360 毫米。',facts:['西柜 600 × 2240','窄柜 440 × 1800','岛台侧净距 1360','岛台高 1010'],x:620,z:745,dist:10.5},
{id:'master',name:'主卧室',en:'MASTER BEDROOM',desc:'双人床与转角衣柜相对，窗侧保留通道。暖木色与浅色织物延续原设计。',facts:['床 1800 × 2000','衣柜进深约 600'],x:1150,z:410,dist:8.0},
{id:'second',name:'次卧室',en:'SECOND BEDROOM',desc:'上下床沿内侧布置，南侧整面衣柜收纳。粉色床架参考原设计效果图。',facts:['衣柜 2050 × 510','柜门朝向卧室'],x:555,z:410,dist:6.7},
{id:'bath',name:'卫浴与洗衣',en:'BATH & LAUNDRY',desc:'卫生间、洗衣房和淋浴区依次分开，外置洗漱台让日常使用更从容。',facts:['洗烘位 650 × 650','洗漱台 900 + 580 · 端部 100','抽拉高柜：面宽 340 · 进深 680'],x:855,z:425,dist:8.8},
{id:'flex',name:'多功能活动区',en:'FLEXIBLE LIVING',desc:'活动区按图纸保留开放地面，配整墙收纳与靠南墙收拢的四扇折叠移门，向右侧阳台延伸。',facts:['衣柜 3400 × 600','储藏柜宽 800','四扇折叠移门'],x:1130,z:765,dist:8.7}
];
let selected='all',mode='scene',fullWalls=false,showLabels=true,topMode=false,renderer,scene,camera,controls,flight=null,wallGroup,openingGroup,labelItems=[],frame=0;
let pulloutGroup=null,pulloutOpen=false,pulloutFlight=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const roomNav=$('#rooms');rooms.forEach((r,i)=>{let b=document.createElement('button');b.dataset.room=r.id;b.innerHTML=`<span class="room-num">0${i+1}</span>${r.name}<span class="chevron">›</span>`;b.onclick=()=>{selectRoom(r.id);setMode('scene')};roomNav.append(b)});
function selectRoom(id,move=true){selected=id;lightingDesign?.setRoom(id);$('#pullout-toggle').classList.toggle('hidden',id!=='bath');$('#vanity-detail').classList.toggle('hidden',id!=='bath');$('#kitchen-detail').classList.toggle('hidden',id!=='kitchen');let r=rooms.find(r=>r.id===id);document.querySelectorAll('[data-room]').forEach(b=>{b.classList.toggle('active',b.dataset.room===id);b.setAttribute('aria-current',b.dataset.room===id?'true':'false')});$('#room-code').textContent=`0${rooms.indexOf(r)+1} / ${r.en}`;$('#room-title').textContent=r.name;$('#room-desc').textContent=r.desc;$('#room-facts').replaceChildren(...r.facts.map(t=>{let el=document.createElement('span');el.textContent=t;return el}));$('#view-title').textContent=r.name;$('#view-subtitle').textContent=id==='all'?'开放的日常，安静的私享。':r.desc;if(move&&camera){topMode=false;updateViewButtons();moveCamera(r)}}
function setMode(m){mode=m;document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));['scene','gallery','plan'].forEach(v=>$('#'+v+'-view').classList.toggle('hidden',v!==m));if(m==='scene')requestAnimationFrame(resize)}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));$('#mini-plan').onclick=()=>setMode('plan');$('#about').onclick=()=>$('#about-dialog').showModal();$('#close-about').onclick=()=>$('#about-dialog').close();$('#about-dialog').onclick=e=>{if(e.target===$('#about-dialog'))$('#about-dialog').close()};
const gallery=[['02','玄关与连续收纳'],['03','餐厨一体'],['04','岛台与过道'],['05','餐厅视角'],['06','四扇折叠移门'],['07','外置洗漱台'],['08','洗烘收纳'],['09','主卧室'],['10','次卧室']];let galleryIndex=1;
gallery.forEach(([n,title],i)=>{let b=document.createElement('button');b.setAttribute('aria-label',title);b.innerHTML=`<img src="./assets/interior-${n}.jpg" alt="${title}" loading="lazy">`;b.onclick=()=>showImage(i);$('#thumbnails').append(b)});
function showImage(i){galleryIndex=(i+gallery.length)%gallery.length;const[n,title]=gallery[galleryIndex];$('#gallery-image').src=`./assets/interior-${n}.jpg`;$('#gallery-image').alt=title;$('#gallery-title').textContent=title;$('#gallery-counter').textContent=`${String(galleryIndex+1).padStart(2,'0')} / 09`;[...$('#thumbnails').children].forEach((b,i)=>b.classList.toggle('active',i===galleryIndex))}showImage(1);$('#prev-image').onclick=()=>showImage(galleryIndex-1);$('#next-image').onclick=()=>showImage(galleryIndex+1);
const drawings=[
 ['plan','P.01 · 平面布置'],['lighting-ceiling','P.04 · 天花布置'],['lighting-dimensions','P.07 · 灯位尺寸'],['lighting-switches','P.09 · 开关连线'],['dimensions','P.12 · 家具尺寸'],['flooring','P.08 · 地面铺贴'],
 ['el-01','EL.01 · 灶台与活动区柜体'],['el-02','EL.02 · 玄关与餐厅'],['el-03','EL.03 · 洗漱区与次卧'],['el-04','EL.04 · 西侧柜体与窗户'],['el-05','EL.05 · 移门与主卧衣柜'],['el-06','EL.06 · 主卧床头'],['el-07','EL.07 · 卫浴与洗衣'],['el-08','EL.08 · 岛台与餐桌']
];
for(const [value,title] of drawings){const option=document.createElement('option');option.value=value;option.textContent=title;$('#drawing-select').append(option)}
$('#drawing-select').onchange=()=>{const [value,title]=drawings.find(d=>d[0]===$('#drawing-select').value);$('#plan-image').src=`./assets/${value}.jpg`;$('#plan-image').alt=title;$('#drawing-title').textContent=title;$('.plan-stage').scrollTo(0,0)};
$('#plan-zoom').onclick=()=>{$('.plan-stage').classList.toggle('enlarged');$('#plan-zoom').textContent=$('.plan-stage').classList.contains('enlarged')?'适应窗口':'放大图纸'};
const X=x=>(x-855)/85.6,Z=z=>(z-610)/85.6;
function mat(c,rough=.75,metal=0){return new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal})}
let M,finishLibrary,renderQuality,lightingDesign;
function box(x,y,z,w,h,d,m,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function rect(x1,z1,x2,z2,y,h,m,parent=scene){return box(X((x1+x2)/2),y+h/2,Z((z1+z2)/2),(x2-x1)/85.6,h,(z2-z1)/85.6,m,parent)}
function cyl(x,y,z,r,h,m,r2=r,parent=scene){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r2,h,32),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function rounded(x,y,z,w,h,d,r,m){let s=new THREE.Shape(),a=-w/2,b=-d/2;s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+d-r);s.quadraticCurveTo(a+w,b+d,a+w-r,b+d);s.lineTo(a+r,b+d);s.quadraticCurveTo(a,b+d,a,b+d-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);let g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.012,bevelThickness:.012,curveSegments:5});g.rotateX(-Math.PI/2);let mesh=new THREE.Mesh(g,m);mesh.position.set(x,y-h/2,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh}
function rod(a,b,r,m,parent=scene){let av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);let mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),12),m);mesh.position.copy(av.add(bv).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());mesh.castShadow=true;parent.add(mesh);return mesh}
function wall(x1,z1,x2,z2,thick=.18,height=D.ceiling){let len=Math.hypot(x2-x1,z2-z1)/85.6;let o=box(X((x1+x2)/2),height/2,Z((z1+z2)/2),len,height,thick,M.wall,wallGroup);o.rotation.y=-Math.atan2(z2-z1,x2-x1);let base=box(X((x1+x2)/2),.045,Z((z1+z2)/2),len,.09,thick+.018,M.trim);base.rotation.y=o.rotation.y;return o}
// Opening widths are traced from P.01; only documented heights override defaults.
function windowWall(x1,z1,x2,z2,thick=.18,sill=.78,height=1.65,panes=2){
 const len=Math.hypot(x2-x1,z2-z1)/85.6,ang=-Math.atan2(z2-z1,x2-x1);
 const lower=box(X((x1+x2)/2),sill/2,Z((z1+z2)/2),len,sill,thick,M.wall,wallGroup);lower.rotation.y=ang;
 const g=new THREE.Group();g.position.set(X((x1+x2)/2),0,Z((z1+z2)/2));g.rotation.y=ang;openingGroup.add(g);
 const top=sill+height;
 box(0,top+(D.ceiling-top)/2,0,len,D.ceiling-top,thick,M.wall,g);
 box(0,sill+height/2,0,len-.08,height-.08,.015,M.glass,g);
 for(let n=0;n<=panes;n++)box(-len/2+.022+(len-.044)*n/panes,sill+height/2,0,.044,height,.09,M.windowFrame,g);
 for(let y of[sill+.02,top-.02])box(0,y,0,len,.04,.20,M.windowFrame,g);
 for(let n=0;n<panes;n++)box(-len/2+(len/panes)*(n+.85),sill+height*.45,-.065,.015,.11,.025,M.windowFrame,g);
}
// Kitchen window has its own documented elevation, unlike the generic windows.
function kitchenWindowWall(){
 const x1=KW.wallPlanX,z1=KW.startPlanZ,z2=KW.endPlanZ;
 const w=(z2-z1)/85.6,h=KW.height,y=KW.sill,thick=.18;
 // Split the wall at the actual aperture: there is no solid wall behind glass.
 const sillWall=box(X(x1),y/2,Z((z1+z2)/2),thick,y,w,M.wall,wallGroup);
 sillWall.name='kitchen-window-sill-wall';
 const g=new THREE.Group();g.position.set(X(x1),0,Z((z1+z2)/2));g.rotation.y=-Math.PI/2;openingGroup.add(g);g.name='kitchen-window';
 const lintelHeight=D.ceiling-y-h;
 box(0,y+h+lintelHeight/2,0,w,lintelHeight,thick,M.wall,g);
 const trim=KW.trim;
 // The room is on local -Z: reveal panels wrap the opening depth.
 box(-w/2+trim/2,y+h/2,.014,trim,h,.23,M.windowFrame,g);
 box(w/2-trim/2,y+h/2,.014,trim,h,.23,M.windowFrame,g);
 box(0,y+trim/2,.014,w,trim,.23,M.windowFrame,g);
 box(0,y+h-trim/2,.014,w,trim,.23,M.windowFrame,g);
 const f=.027,innerW=w-trim*2,innerH=h-trim*2;
 for(let xx of[-innerW/2+f/2,innerW/2-f/2])box(xx,y+h/2,-.025,f,innerH,.045,M.windowFrame,g);
 for(let yy of[y+trim+f/2,y+h-trim-f/2])box(0,yy,-.025,innerW,f,.045,M.windowFrame,g);
 box(0,y+h/2,-.027,innerW-f*2,innerH-f*2,.012,M.glass,g);
 box(innerW/2-.055,y+h*.44,-.065,.018,.115,.025,M.windowFrame,g);
 // A pale exterior background makes the aperture readable without a false wall.
 const sky=new THREE.MeshBasicMaterial({color:'#dce8ed',side:THREE.DoubleSide});
 box(0,y+h/2,.125,innerW-f*2,innerH-f*2,.003,sky,g);
}
// Door skins follow the room-facing side, including north-facing cupboards.
function wardrobe(x1,z1,x2,z2,front='z',height=2.35,finish=M.cream,split=1.12){
 rect(x1,z1,x2,z2,0,height,M.wood);
 const alongX=front.includes('z'),negative=front.startsWith('-'),span=alongX?x2-x1:z2-z1;
 const count=Math.max(2,Math.round(span/48)),levels=[.06,split,height-.03];
 for(let i=0;i<count;i++)for(let j=0;j<2;j++){
  const a=(alongX?x1:z1)+span*i/count+.7,b=(alongX?x1:z1)+span*(i+1)/count-.7;
  const y=levels[j]+.006,h=levels[j+1]-levels[j]-.012;
  if(alongX){const z=negative?z1-1:z2;rect(a,z,b,z+1,y,h,finish);if(j===0)rect(b-3,z+(negative?-1.2:1.2),b-2,z+(negative?-.2:2.2),.94,.15,M.brass)}
  else{const x=negative?x1-1:x2;rect(x,a,x+1,b,y,h,finish);if(j===0)rect(x+(negative?-1.2:1.2),b-3,x+(negative?-.2:2.2),b-2,.94,.15,M.brass)}
 }
}
// A framed leaf, usable for the drawn open room doors and the balcony slider.
function doorLeaf(x1,z1,x2,z2,height,finish=M.cream,glass=false,parent=scene){
 const w=Math.hypot(x2-x1,z2-z1)/85.6,g=new THREE.Group();g.position.set(X((x1+x2)/2),0,Z((z1+z2)/2));g.rotation.y=-Math.atan2(z2-z1,x2-x1);parent.add(g);
 box(0,height/2,0,w-.08,height-.10,glass?.012:.036,glass?(glass===true?M.glass:glass):finish,g);
 for(let x of[-w/2+.02,w/2-.02])box(x,height/2,0,.04,height,.06,finish,g);
 for(let y of[.025,height-.025])box(0,y,0,w,.05,.06,finish,g);
 box(w/2-.10,1.04,-.045,.09,.015,.025,M.metal,g);return g;
}
function doorway(x1,z1,x2,z2,height=2.35,finish=M.cream){
 const len=Math.hypot(x2-x1,z2-z1)/85.6,g=new THREE.Group();g.position.set(X((x1+x2)/2),0,Z((z1+z2)/2));g.rotation.y=-Math.atan2(z2-z1,x2-x1);openingGroup.add(g);
 for(let x of[-len/2,len/2])box(x,height/2,0,.04,height,.16,finish,g);
 box(0,height+.025,0,len+.04,.05,.16,finish,g);
 if(height+.05<D.ceiling)box(0,(height+.05+D.ceiling)/2,0,len,D.ceiling-height-.05,.16,M.wall,g);
}
function bed(x,z,w=1.8,d=2){const xx=X(x),zz=Z(z);rounded(xx,.18,zz,w+.12,.23,d+.16,.08,M.darkwood);rounded(xx,.38,zz,w,.23,d,.1,M.linen);rounded(xx,.525,zz+.32,w+.02,.07,d*.64,.05,M.duvet);box(xx,.57,zz-d/2-.09,w+.18,.96,.12,M.headboard);for(let i of[-1,1])rounded(xx+i*w*.24,.56,zz-d*.34,w*.4,.12,.4,.09,M.white);for(let i=0;i<6;i++)box(xx-w/2+.12+i*(w-.24)/5,.565,zz+d*.38,.014,.004,.25,M.thread)}
function stool(x,z){let xx=X(x),zz=Z(z);cyl(xx,.72,zz,.21,.09,M.wood);for(let dx of[-1,1])for(let dz of[-1,1])rod([xx+dx*.13,.68,zz+dz*.13],[xx+dx*.21,.06,zz+dz*.21],.024,M.darkwood);for(let dx of[-1,1])rod([xx+dx*.17,.27,zz-.17],[xx+dx*.17,.27,zz+.17],.012,M.darkwood)}
function chair(x,z,rotation=0){const g=new THREE.Group();scene.add(g);g.position.set(X(x),0,Z(z));g.rotation.y=rotation;box(0,.46,0,.45,.06,.44,M.wood,g);box(0,.79,-.20,.44,.55,.045,M.cream,g);for(let xx of[-.17,.17])for(let zz of[-.15,.15])box(xx,.23,zz,.032,.46,.032,M.darkwood,g)}
function plant(x,z){let xx=X(x),zz=Z(z);cyl(xx,.22,zz,.22,.44,M.pot,.16);rod([xx,.43,zz],[xx,1.65,zz],.018,M.darkwood);for(let i=0;i<13;i++){let a=i*2.4,h=.7+i*.075,end=[xx+Math.cos(a)*.34,h+.18,zz+Math.sin(a)*.34];rod([xx,h,zz],end,.009,M.leaf);let l=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),M.leaf);l.scale.set(.15,.038,.28);l.position.set(...end);l.rotation.set(.35,a,.15);l.castShadow=true;scene.add(l)}}
function sink(x,z,top=.95,w=.57,d=.42,rotation=0){
 const xx=X(x),zz=Z(z),sin=Math.sin(rotation),cos=Math.cos(rotation),point=(u,y,v)=>[xx+u*cos+v*sin,y,zz-u*sin+v*cos];
 rounded(xx,top+.005,zz,w,.018,d,.035,M.chrome);
 rounded(xx,top+.016,zz,w-.06,.02,d-.06,.028,M.sink);
 rod(point(w*.38,top+.04,-d/2),point(w*.38,top+.25,-d/2),.016,M.chrome);
 rod(point(w*.38,top+.25,-d/2),point(w*.12,top+.25,-d/2),.016,M.chrome);
}
async function build(){scene=new THREE.Scene();scene.background=new THREE.Color('#e9eeeb');scene.fog=new THREE.Fog('#e9eeeb',37,75);camera=new THREE.PerspectiveCamera(38,1,.05,150);renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.setClearColor('#e9eeeb');$('#canvas-wrap').prepend(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','可交互三维户型。拖动旋转，滚轮缩放，方向键平移。');controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.maxPolarAngle=Math.PI/2-.035;controls.minDistance=2;controls.maxDistance=43;controls.target.set(0,.2,0);controls.autoRotateSpeed=.55;controls.listenToKeyEvents(renderer.domElement);controls.addEventListener('start',()=>{flight=null});renderer.domElement.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='='){zoom(.85);e.preventDefault()}if(e.key==='-'){zoom(1.15);e.preventDefault()}});
let stone=mat('#fff');let wood=mat('#ffffff',.8);M={wall:mat('#f5f2e8'),trim:mat('#b8b4a7',.4),stone,wood,cream:mat('#e7e3d7'),dark:mat('#343936',.45),darkwood:mat('#745b43'),linen:mat('#ddd6c3'),duvet:mat('#f5f1e8'),headboard:mat('#77786c'),wetTile:mat('#d7d9d1'),tileStrip:mat('#dadbd2'),mirror:mat('#cadbdc',.20,.25),frosted:new THREE.MeshPhysicalMaterial({color:'#e8e6dc',transparent:true,opacity:.76,roughness:.85,side:THREE.DoubleSide,depthWrite:false}),teaGlass:new THREE.MeshPhysicalMaterial({color:'#796351',transparent:true,opacity:.60,roughness:.16,metalness:.18,depthWrite:false}),white:mat('#faf8f1'),windowFrame:mat('#ffffff',.35,.08),thread:mat('#a6a899'),pink:mat('#c47f8b'),green:mat('#205b38',.25),chrome:mat('#bcc9c8',.22,.85),metal:mat('#626e68',.35,.7),brass:mat('#a88958',.4,.6),sink:mat('#656e69',.32,.55),glass:new THREE.MeshPhysicalMaterial({color:'#b3ced0',transparent:true,opacity:.17,roughness:.12,side:THREE.DoubleSide,depthWrite:false}),leaf:mat('#46633d'),pot:mat('#b6a58b'),rug:mat('#b6b5a6')};
M.countertop=M.dark.clone();
M.vanityStone=M.wetTile.clone();M.vanityStone.userData.surfaceIdBase='wetTile';
finishLibrary=createFinishLibrary(THREE,renderer);await finishLibrary.preload();finishLibrary.initialize(M);
wallGroup=new THREE.Group();scene.add(wallGroup);openingGroup=new THREE.Group();scene.add(openingGroup);
const hemi=new THREE.HemisphereLight('#f5f5ef','#aaa394',.65);scene.add(hemi);let sun=new THREE.DirectionalLight('#fff3de',2.8);sun.position.set(-7,11,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-11,right:11,top:11,bottom:-11,near:.5,far:35});sun.shadow.bias=-.00015;sun.shadow.normalBias=.012;sun.shadow.radius=4;scene.add(sun);let fill=new THREE.DirectionalLight('#dae7f4',.4);fill.position.set(-8,8,-7);scene.add(fill);
box(0,-.37,0,200,.1,200,mat('#e9eeeb'));
const stepZ=planZ(K.wallStepZ);
const outline=[[340,945],[340,stepZ],[400,stepZ],[400,267],[1368,267],[1368,493],[1314,553],[1314,945]];let sh=new THREE.Shape();outline.forEach(([x,z],i)=>i?sh.lineTo(X(x),-Z(z)):sh.moveTo(X(x),-Z(z)));sh.closePath();let geom=new THREE.ExtrudeGeometry(sh,{depth:.23,bevelEnabled:false});geom.rotateX(-Math.PI/2);let floor=new THREE.Mesh(geom,[M.stone,mat('#bac5bc')]);floor.position.y=-.22;floor.receiveShadow=true;floor.castShadow=true;scene.add(floor);
// Tile joints are clipped to the apartment's footprint.
const poly=outline.map(([x,z])=>[X(x),Z(z)]);function inside(x,z){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){let[a,b]=poly[i],[u,v]=poly[j];if(((b>z)!=(v>z))&&(x<(u-a)*(z-b)/(v-b)+a))c=!c}return c}function tileJoints(bounds,dx,dz,eligible=()=>true,y=.018){
 const [x1,z1,x2,z2]=bounds,pts=[];
 for(let x=x1;x<=x2+.001;x+=dx)for(let z=z1;z<z2;z+=.045){let zz=Math.min(z+.045,z2);if(eligible(x,z)&&eligible(x,zz))pts.push(x,y,z,x,y,zz)}
 for(let z=z1;z<=z2+.001;z+=dz)for(let x=x1;x<x2;x+=.045){let xx=Math.min(x+.045,x2);if(eligible(x,z)&&eligible(xx,z))pts.push(x,y,z,xx,y,z)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));scene.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:'#90958b',transparent:true,opacity:.32})));
}
const isSecond=(x,z)=>x<X(712)&&z<Z(549),isWet=(x,z)=>x>X(723)&&x<X(1004)&&z<Z(415);
tileJoints([X(340),Z(267),X(1368),Z(945)],...D.flooring.main,(x,z)=>inside(x,z)&&!isSecond(x,z)&&!isWet(x,z));
tileJoints([X(400),Z(267),X(712),Z(549)],...D.flooring.second,(x,z)=>inside(x,z));
rect(723,276,1000,415,.018,.012,M.wetTile);
tileJoints([X(723),Z(276),X(1000),Z(415)],...D.flooring.wet,()=>true,.032);
// Envelope; gaps match the drawing's entrance and windows.
wall(400,267,425,267);windowWall(425,267,502,267);wall(502,267,1368,267);wall(400,267,400,356);windowWall(400,356,400,485);wall(400,485,400,KW.startPlanZ);kitchenWindowWall();wall(400,KW.endPlanZ,400,stepZ);wall(340,stepZ,400,stepZ);wall(340,stepZ,340,760);windowWall(340,760,340,870,.18,.97,1.44,2);wall(340,870,340,945);wall(340,945,720,945);wall(804,945,1314,945);wall(1368,267,1368,352);windowWall(1368,352,1368,492);windowWall(1368,492,1314,553,.18,.78,1.65,1);wall(1314,553,1314,688);wall(1314,860,1314,945);
// Interior partitions and the three wet rooms.
wall(712,267,712,416,.22);wall(planX(CW.pierX+CW.pierWidth/2),501,planX(CW.pierX+CW.pierWidth/2),planZ(CW.frontZ),CW.pierWidth);wall(526,549,712,549,.20);wall(723,565,724+D.vanity.basinBay*85.6,565,.12);wall(950,418,950,482,.20);wall(950,575,1314,575,.22);wall(1004,267,1004,415,.12);wall(804,267,804,411,.085);wall(902,267,902,411,.06);// Thin front glazing replaces the erroneous solid stubs across the wet-room entrances.
rect(905,267,945,302,0,D.ceiling,M.wall,wallGroup);
// Balcony rail is independent of cutaway wall height. P.08: 400 mm tiles.
rect(1315,609,1455,904,-.16,.18,M.stone);
tileJoints([X(1315),Z(609),X(1455),Z(904)],...D.flooring.balcony,()=>true,.026);
for(const [x1,z1,x2,z2] of[[1455,609,1455,904],[1315,609,1455,609],[1315,904,1455,904]]){
 const len=Math.hypot(x2-x1,z2-z1)/85.6,g=new THREE.Group();g.position.set(X((x1+x2)/2),0,Z((z1+z2)/2));g.rotation.y=-Math.atan2(z2-z1,x2-x1);scene.add(g);
 box(0,.12,0,len,.24,.09,M.wall,g);box(0,1.05,0,len,.045,.045,M.windowFrame,g);
 const n=Math.ceil(len/.18);for(let i=0;i<=n;i++)box(-len/2+len*i/n,.62,0,.02,.84,.025,M.windowFrame,g);
}
rect(1328,858,1371,902,.0,.85,M.cream);rect(1325,856,1374,904,.85,.03,M.white);sink(1348,878,.88,.32,.32);
rect(1322,625,1341,660,1.20,.64,M.white);rect(1341,632,1342,650,1.36,.20,M.dark);for(let z of[634,651])rod([X(1332),1.20,Z(z)],[X(1332),.95,Z(z)],.012,M.chrome);
// P.01 balcony sliding glass doorway, shown half open; widths are traced.
doorway(1314,688,1314,860);
for(let off of[0,3])doorLeaf(1314+off,688,1314+off,774,2.35,M.windowFrame,true,openingGroup);
rect(1310,688,1320,860,.015,.012,M.windowFrame);
// Kitchen is positioned using the P.12 dimension chains, in metres.
function slab(x,z,w,d,bottom,height,material){return box(x+w/2,bottom+height/2,z+d/2,w,height,d,material)}
const C=K.cooking,L=K.longSide,N=K.shortSide,I=K.island,T=K.table;
// P.12/EL.01 cooking wall: 1500 mm base run + 500 mm tall end unit.
const cookingBack=CW.frontZ-CW.depth,runW=CW.cookingWidth;
slab(CW.x,cookingBack,runW,CW.depth,.05,.715,M.cream);
slab(CW.x,cookingBack,runW,CW.depth,.765,.035,M.countertop);
for(let i=0;i<3;i++)for(let y of[.08,.43])slab(CW.x+i*.5+.008,CW.frontZ+.002,.484,.018,y,.315,M.cream);
slab(CW.x,cookingBack-.018,runW,.018,.80,.75,M.green);
for(let x=CW.x+.08;x<CW.x+runW;x+=.11)slab(x,cookingBack-.001,.004,.003,.81,.73,M.trim);
slab(CW.x,cookingBack,runW,.30,1.55,.80,M.cream);
for(let x=CW.x+.5;x<CW.x+runW;x+=.5)slab(x,cookingBack+.30,.008,.008,1.56,.78,M.trim);
slab(CW.x+.3,cookingBack+.23,1.13,.30,1.48,.07,M.dark);
// EL.01: separate spice shelf in the left-hand backsplash bay (350/50/350 chain).
slab(CW.x,cookingBack+.01,GC.spiceShelf.width,GC.spiceShelf.depth,GC.spiceShelf.bottom,GC.spiceShelf.thickness,M.dark);
for(let x of[CW.x+.64,CW.x+1.22]){cyl(x,.818,cookingBack+.34,.106,.012,M.metal);cyl(x,.83,cookingBack+.34,.067,.013,M.dark)}
// Renderings 03/04: a continuous handleless tower, not a recessed cabinet over a black ledge.
// P.12's 200 mm front storage zone does not create a setback in the visible elevation.
const towerX=CW.x+runW,towerDepth=CW.depth,towerFront=CW.frontZ;
const tower=new THREE.Group();tower.name='flush-handleless-cooking-tower';scene.add(tower);
box(towerX+CW.towerWidth/2,CW.cabinetHeight/2,cookingBack+towerDepth/2,CW.towerWidth,CW.cabinetHeight,towerDepth,M.cream,tower);
// Fine seams align with the base-counter and upper-cabinet datums in EL.01.
const towerLevels=[.04,D.kitchen.baseTop,D.kitchen.upperBottom,CW.cabinetHeight-.008];
for(let i=0;i<towerLevels.length-1;i++){
 const y1=towerLevels[i]+.0025,y2=towerLevels[i+1]-.0025;
 box(towerX+CW.towerWidth/2,(y1+y2)/2,towerFront+.009,CW.towerWidth-.008,y2-y1,.018,M.cream,tower);
}
// Retain the structural pier, clad its visible front/return per EL.01.
slab(CW.pierX,CW.frontZ+.001,CW.pierWidth,.016,0,CW.cabinetHeight,M.wood);
slab(CW.pierX-.012,cookingBack,.012,CW.depth,0,CW.cabinetHeight,M.wood);
slab(CW.pierX+CW.pierWidth,CW.frontZ-CW.depth,.012,CW.depth,0,CW.cabinetHeight,M.wood);
// Fridge sits within the surround, rather than as an isolated dark box.
const gap=.024,fx=CW.fridgeX+gap,fw=CW.fridgeBayWidth-gap*2,fridgeH=1.92;
slab(fx,CW.frontZ-.60,fw,.58,.03,fridgeH-.03,M.metal);
const fridgeFace=CW.frontZ+.002;
for(let i=0;i<2;i++)slab(fx+i*fw/2+.003,fridgeFace,fw/2-.006,.025,.91,1.005,M.metal);
for(let y of[.18,.54])slab(fx+.003,fridgeFace,fw-.006,.025,y,.345,M.metal);
for(let x of[fx+fw/2-.033,fx+fw/2+.022])slab(x,fridgeFace+.026,.011,.023,1.15,.4,M.dark);
for(let y of[.50,.86])slab(fx+.10,fridgeFace+.026,fw-.20,.018,y,.012,M.dark);
slab(fx,fridgeFace,fw,.025,.04,.105,M.dark);
for(let y of[.058,.085,.112])slab(fx+.018,fridgeFace+.026,fw-.036,.005,y,.006,M.metal);
// EL.01 shows a closed panel over the fridge and a service cabinet to its right.
slab(CW.fridgeX,CW.frontZ-.60,CW.fridgeBayWidth,.616,fridgeH+.025,CW.cabinetHeight-fridgeH-.025,M.wood);
const serviceW=CW.serviceRightX-CW.serviceX;
slab(CW.serviceX,CW.frontZ-CW.serviceDepth,serviceW,CW.serviceDepth,0,CW.cabinetHeight,M.wood);
slab(CW.serviceX+.005,CW.frontZ+.002,serviceW-.01,.016,.035,CW.cabinetHeight-.055,M.wood);
slab(CW.serviceRightX-.065,CW.frontZ+.02,.013,.022,.95,.22,M.brass);
// The 440 x 1800 mm north counter ends in the curved return shown on P.01.
// Its end and the 600 x 2240 mm south counter share the same wall-step station.
function curvedSide(bottom,height,material){
 const shape=new THREE.Shape(),x=N.x,z=N.z,w=N.width,d=N.depth,r=N.endRadius;
 shape.moveTo(x,-z);shape.lineTo(x+w,-z);shape.lineTo(x+w,-(z+d-r));
 shape.absarc(x,-(z+d-r),r,0,-Math.PI/2,true);shape.lineTo(x,-z);shape.closePath();
 const g=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:20});g.rotateX(-Math.PI/2);
 const mesh=new THREE.Mesh(g,material);mesh.position.y=bottom;mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh;
}
curvedSide(.05,KW.sill-.09,M.cream);curvedSide(KW.sill-.04,.04,M.countertop);
for(let z=N.z+.015;z<N.z+N.depth-N.endRadius;z+=.45)slab(N.x+N.width-.008,z,.008,Math.min(.43,N.z+N.depth-N.endRadius-z),.1,KW.sill-.16,M.cream);
slab(L.x,L.z,L.width,L.depth,.05,.88,M.cream);
slab(L.x,L.z,L.width,L.depth,.93,.04,M.countertop);
// Missing west return and timber gas-meter access cabinet, P.01 / EL.01.
const gasBack=Z(GC.backPlanZ),gasFront=Z(GC.frontPlanZ),gasDepth=gasFront-gasBack;
const gasReturn=rect(planX(GC.x),GC.returnPier.startPlanZ,planX(GC.x+GC.width),GC.returnPier.endPlanZ,0,D.ceiling,M.wall,wallGroup);gasReturn.name='gas-cabinet-wall-return';
const gasGroup=new THREE.Group();gasGroup.name='west-gas-meter-cabinet';scene.add(gasGroup);
// Side boards and rear lining leave a real recess behind the access panels.
box(GC.x+.009,(GC.bottom+GC.top)/2,(gasBack+gasFront)/2,.018,GC.top-GC.bottom,gasDepth,M.wood,gasGroup);
box(GC.x+GC.width-.009,(1.90+GC.top)/2,(gasBack+gasFront)/2,.018,GC.top-1.90,gasDepth,M.wood,gasGroup);
for(let y of[1.28,1.59,1.90])box(GC.x+GC.width/2,y,(gasBack+gasFront)/2,GC.width-.018,.018,gasDepth-.018,M.wood,gasGroup);
box(GC.x+GC.width/2,(GC.bottom+GC.top)/2,gasBack+.009,GC.width,GC.top-GC.bottom,.018,M.wood,gasGroup);
for(let y of[GC.bottom,GC.top-.018])box(GC.x+GC.width/2,y+.009,(gasBack+gasFront)/2,GC.width,.018,gasDepth,M.wood,gasGroup);
// EL.01's timber face is divided into lower/central/upper access sections.
const gasLevels=[GC.bottom,1.59,1.90,GC.top];
for(let i=0;i<gasLevels.length-1;i++){
 const y1=gasLevels[i]+.003,y2=gasLevels[i+1]-.003;
 box(GC.x+GC.width/2,(y1+y2)/2,gasFront+.008,GC.width-.014,y2-y1,.016,M.wood,gasGroup);
}
box(GC.x+GC.width-.055,1.72,gasFront+.023,.015,.105,.012,M.brass,gasGroup);
// Cabinet fronts face the aisle. The small basin belongs on this south run.
let segmentStart=L.z;for(let d of[.60,.65,.55,.44]){slab(L.x+L.width-.008,segmentStart+.007,.008,d-.014,.10,.78,M.cream);slab(L.x+L.width,segmentStart+.045,.016,.17,.65,.014,M.brass);segmentStart+=d}
sink(planX(L.x+.29),planZ(L.z+.93),D.westCounter.top,.40,.42);
// EL.08: island 1010 high, 120 mm stone fascia; table 800 high, 60 mm top.
// Rendering 03: the bar-facing doors sit behind the stone overhang.
// Recess the actual cabinet volume as well as its door skins; keep the 2000 x 1100 outer top.
const barFront=I.z+I.depth-D.island.seatingRecess,stoneEnd=D.island.endPanel;
const barDoorThickness=.018,barInnerWidth=I.width-2*stoneEnd;
slab(I.x+stoneEnd,I.z,barInnerWidth,barFront-I.z-barDoorThickness,.04,.85,M.cream);
slab(I.x,I.z,I.width,I.depth,D.island.top-D.island.topThickness,D.island.topThickness,M.countertop);
for(let x of[I.x,I.x+I.width-stoneEnd])slab(x,I.z,stoneEnd,I.depth,0,.89,M.countertop);
for(let n=0;n<2;n++)slab(I.x+stoneEnd+.007+n*barInnerWidth/2,barFront-barDoorThickness,barInnerWidth/2-.014,barDoorThickness,.06,.81,M.wood);
// Working side: drawers, dishwasher, sink cabinet, as the island plan.
for(let y of[.08,.345,.61])slab(I.x+.008,I.z-.018,.484,.018,y,.25,M.cream);
slab(I.x+.508,I.z-.02,.584,.022,.06,.815,M.cream);
slab(I.x+.508,I.z-.043,.584,.018,.79,.07,M.metal);
slab(I.x+1.108,I.z-.018,.884,.018,.06,.815,M.cream);
sink(planX(I.x+1.52),planZ(I.z+.34),D.island.top,.80,.52,Math.PI);
slab(T.x,T.z,T.width,T.depth,D.table.top-D.table.topThickness,D.table.topThickness,M.countertop);
slab(T.x+T.width-.065,T.z,.065,T.depth,0,.74,M.cream);
stool(planX(I.x+.55),planZ(I.z+I.depth+.30));stool(planX(I.x+1.32),planZ(I.z+I.depth+.30));
chair(planX(T.x+.63),planZ(T.z-.15));chair(planX(T.x+1.24),planZ(T.z-.15));
slab(T.x+.17,T.z+T.depth+.24,1.58,.34,.15,.31,M.wood);slab(T.x+.19,T.z+T.depth+.25,1.54,.32,.46,.075,M.linen);
// The entry cabinet starts where the long side cabinet ends (250 mm deep).
const entryRight=X(711);
slab(L.x,K.entryFront,entryRight-L.x,K.entryDepth,.04,1.025,M.wood);
slab(L.x,K.entryFront,entryRight-L.x,K.entryDepth,1.065,.035,M.cream);
for(let x=L.x;x<entryRight-.01;x+=.59)slab(x+.01,K.entryFront,Math.min(.56,entryRight-x-.02),.015,.08,.965,M.wood);
doorway(720,945,804,945,2.21);doorLeaf(720,945,804,945,2.21,M.wood);
rect(813,935,929,937,.12,2.18,M.cream,openingGroup);
rect(869,922,930,924,.10,2.22,M.cream,openingGroup);
for(let x=874;x<928;x+=5)for(let y=.25;y<2.24;y+=.085){const hole=new THREE.Mesh(new THREE.CircleGeometry(.009,8),M.trim);hole.position.set(X(x),y,Z(921.8));hole.rotation.y=Math.PI;openingGroup.add(hole)}
for(let x of[823,842,861])rod([X(x),1.65,Z(934)],[X(x),1.65,Z(927)],.013,M.wood,openingGroup);
// Master: P.12 L-shaped cabinet; EL.05/06 cream doors and tea glass.
rect(1084,313,1324,527,.025,.015,M.rug);bed(1190,385);
const MW=D.masterWardrobe,mx=X(1060),mz=Z(280),returnZ=mz+MW.overallLength-MW.depth;
wardrobe(planX(mx-MW.depth),planZ(mz),planX(mx),planZ(returnZ),'x',MW.height,M.cream,1.0);
// Return occupies the corner once; its south doors face the main bedroom.
wardrobe(planX(mx-MW.returnWidth),planZ(returnZ),planX(mx),planZ(mz+MW.overallLength),'z',MW.height,M.cream,1.0);
// Recessed tea-glass inserts are placed proud of a dark inner back, with cream rails.
const glassStart=mz+.64,glassLen=returnZ-glassStart;
slab(mx+.012,glassStart,.016,glassLen,.10,2.15,M.darkwood);
slab(mx+.031,glassStart+.025,.009,glassLen-.05,.12,2.11,M.teaGlass);
for(let z of[glassStart,glassStart+glassLen/2,returnZ])slab(mx+.043,z,.018,.024,.09,2.18,M.cream);
for(let y of[.1,1.0,2.25])slab(mx+.043,glassStart,.018,glassLen,y,.022,M.cream);
rect(1080,290,1114,326,.0,.42,M.darkwood);rect(1282,290,1316,326,.0,.42,M.darkwood);
// EL.06: 860 mm darker bed-head wall and the fine black inset above it.
rect(1070,274,1335,276,.04,.82,M.headboard,wallGroup);
rect(1070,274,1335,276,.86,1.45,M.wall,wallGroup);
rect(1070,273.7,1335,274,2.31,.012,M.dark,openingGroup);
for(let z=288;z<491;z+=7){let o=cyl(X(1344),1.30,Z(z),.045,2.6,M.linen);o.castShadow=false}
doorway(950,482,950,562);doorLeaf(950,562,1028,562,2.35,M.cream);
// Second bedroom bunk bed, with two mattresses and ladder.
const bx=X(607),bz=Z(344),bw=1.98,bd=1.20;for(let dx of[-.96,.96])for(let dz of[-.565,.565])box(bx+dx,.95,bz+dz,.08,1.9,.08,M.pink);for(let y of[.25,1.36]){box(bx,y,bz,bw,.10,bd,M.pink);rounded(bx,y+.13,bz,bw-.1,.18,bd-.06,.06,M.linen);rounded(bx-.66,y+.26,bz,.37,.12,.71,.07,M.white);for(let dz of[-.565,.565]){box(bx,y+.46,bz+dz,bw,.08,.055,M.pink);for(let x=-.8;x<.99;x+=.35)box(bx+x,y+.3,bz+dz,.032,.3,.032,M.pink)}}for(let x of[bx+.49,bx+.9])rod([x,.05,bz+.77],[x,1.65,bz+.49],.033,M.pink);for(let y=.25;y<1.6;y+=.26)rod([bx+.49,y,bz+.78-y*.17],[bx+.9,y,bz+.78-y*.17],.029,M.pink);const SW=D.secondWardrobe;wardrobe(526,502,526+SW.width*85.6,502+SW.depth*85.6,SW.front,SW.height,M.wood,SW.doorSplit);
// The wood folding/sliding partition shown in EL.03 is parked at the west jamb.
// Rendering 03: the bedroom portal and cooking-bank end form one timber return.
// EL.03 keeps the clear opening at 2190; the visible kitchen soffit aligns at 2350.
const portalZ=Z(GC.doorLinePlanZ),portalLeft=GC.x+GC.width,portalRight=CW.x;
const portal=new THREE.Group();portal.name='kitchen-bedroom-timber-portal';scene.add(portal);
// The west return is the left reveal; cladding wraps its passage-facing edge.
box(portalLeft+.009,1.175,Z((GC.returnPier.startPlanZ+GC.returnPier.endPlanZ)/2),.018,2.35,(GC.returnPier.endPlanZ-GC.returnPier.startPlanZ)/85.6,M.wood,portal);
// Rendering 03: the lower cheek reaches the base front; above the worktop it
// steps back to the 300 mm upper-cabinet depth. Register the original envelope
// first so existing per-component material plans keep their stable identifier.
const kitchenCheek=box(portalRight-.014,1.175,(portalZ+CW.frontZ)/2,.028,2.35,CW.frontZ-portalZ+.018,M.wood,portal);
kitchenCheek.name='stepped-kitchen-end-cheek';
// Wood wraps the back jamb, so it reads as a reveal rather than a free-standing door.
box(portalRight-.036,1.095,portalZ,.044,2.19,.10,M.wood,portal);
box(portalLeft+.014,1.095,portalZ,.028,2.19,.10,M.wood,portal);
box((portalLeft+portalRight)/2,2.27,portalZ,portalRight-portalLeft,.16,.10,M.wood,openingGroup);
box((portalLeft+portalRight)/2,2.50,portalZ,portalRight-portalLeft,.30,.10,M.wall,openingGroup);
// Leaves are parked behind the west return, leaving the visible passage open.
for(let i=0;i<GC.doorStack.length-1;i++){const a=GC.doorStack[i],b=GC.doorStack[i+1];doorLeaf(...a,...b,2.19,M.wood);}
// EL.07: lower large tiles, upper vertical strips, split at 1000 mm.
for(const [a,b] of[[724,802],[806,900],[946,1000]]){
 rect(a,275,b,277,.03,.97,M.wetTile,wallGroup);rect(a,275,b,277,1.00,1.35,M.tileStrip,wallGroup);
 for(let y of[.6,1.0])rect(a,274.8,b,275,y,.006,M.trim,wallGroup);
 for(let x=a;x<b;x+=7)rect(x,274.7,x+.25,275,1.01,1.33,M.trim,wallGroup);
 for(let y of[1.4,1.8,2.2])rect(a,274.6,b,275,y,.004,M.trim,wallGroup);
}
rect(741,280,785,298,.08,.83,M.cream);rounded(X(762),.33,Z(321),.44,.30,.63,.13,M.white);rounded(X(762),.499,Z(323),.37,.035,.44,.14,M.linen);
// P.12 uses a 650 x 650 bay; appliance details remain schematic.
const W=D.washerBay,wx=X(806),wz=Z(280);
slab(wx,wz,W.width,W.depth,.04,1.72,M.white);
for(let y of[.04,.90]){
 slab(wx+.015,wz+W.depth+.001,.62,.014,y+.72,.105,M.cream);
 slab(wx+.40,wz+W.depth+.018,.18,.007,y+.747,.045,M.dark);
 const ring=new THREE.Mesh(new THREE.CylinderGeometry(.225,.225,.038,32),M.chrome);ring.rotation.x=Math.PI/2;ring.position.set(wx+.325,y+.38,wz+W.depth+.017);scene.add(ring);
 const glass=new THREE.Mesh(new THREE.CylinderGeometry(.185,.185,.045,32),M.dark);glass.rotation.x=Math.PI/2;glass.position.set(wx+.325,y+.38,wz+W.depth+.027);scene.add(glass);
}
slab(wx,wz,.65,.65,1.78,.57,M.cream);
const lsx=wx+.65,LS=D.laundrySide;
slab(lsx,wz,LS.width,LS.depth,.04,.70,M.cream);slab(lsx,wz,LS.width,LS.depth,.74,.022,M.white);
slab(lsx,wz,.47,.18,1.24,1.07,M.cream);
for(let y of[1.27,1.80])slab(lsx+.018,wz+.18,.434,.018,y,.50,M.cream);
// Fixed side glazing and separate front doors, instead of opaque wall pieces.
rect(902,333,903,415,.02,2.33,M.glass);doorway(723,415,804,415,2.35,M.wood);doorway(804,415,902,415,2.35,M.wood);doorway(902,415,1004,415,2.35,M.wood);
doorLeaf(725,415,802,415,2.35,M.wood,M.frosted,openingGroup);
doorLeaf(806,415,900,415,2.35,M.wood,M.frosted,openingGroup);
doorLeaf(904,415,1002,415,2.35,M.wood,M.frosted,openingGroup);
rod([X(984),.95,Z(299)],[X(984),2.14,Z(299)],.015,M.chrome);rod([X(984),2.14,Z(299)],[X(964),2.14,Z(299)],.015,M.chrome);cyl(X(964),2.12,Z(299),.11,.025,M.chrome);rect(974,380,990,383,.034,.005,M.metal);
// P.12: 900 + 580 vanity/mirror bays, plus a 100 mm end bay; 450 mm basin depth.
// EL.03: 800 counter + 200 splashback + 800 mirror + 550 upper cupboard = 2350.
const V=D.vanity,vx=X(724),vz=Z(V.frontPlanZ),mirrorW=V.basinBay+V.sideBay,vw=mirrorW+V.endStorage,vback=vz+V.depth;
// Keep the back of the mirror and the deeper 580 mm storage bay behind one front plane.
const mirrorDepth=Z(565)-.06-vback;
slab(vx,vback,V.basinBay,mirrorDepth,.80,1.55,M.cream);
// User-confirmed tall pull-out storage: P.01 arrow points east into the corridor.
// Fixed casing protects the wash-area mirror; only the shelf carriage and end front move.
const px=vx+V.basinBay,pw=V.sideBay+V.endStorage,pd=V.rearSideDepth,pt=.018;
const py=V.pulloutBase,ph=V.pulloutTop-py;
const casing=new THREE.Group();casing.name='wash-area-pullout-casing';scene.add(casing);
box(px+pw/2,py/2,vback+pd/2,pw,py,pd,M.trim,casing);
for(let z of[vback+pt/2,vback+pd-pt/2])box(px+pw/2,py+ph/2,z,pw,ph,pt,M.cream,casing);
for(let y of[py+pt/2,V.pulloutTop-pt/2])box(px+pw/2,y,vback+pd/2,pw,pt,pd,M.cream,casing);
box(px+pt/2,py+ph/2,vback+pd/2,pt,ph,pd,M.cream,casing);
pulloutGroup=new THREE.Group();pulloutGroup.name='wash-area-tall-pullout';scene.add(pulloutGroup);
// Full-height front at the east end, with a narrow recessed-looking pull.
box(px+pw+.002,py+ph/2,vback+pd/2,.022,ph-.008,pd-.006,M.cream,pulloutGroup);
box(px+pw+.016,1.16,vback+pd-.060,.012,.28,.018,M.dark,pulloutGroup);
const shelfX=px+.034,shelfW=pw-.060,shelfZ=vback+.035,shelfD=pd-.070;
box(shelfX+.009,py+ph/2,shelfZ+shelfD/2,.018,ph-.08,shelfD,M.cream,pulloutGroup);
for(let y of[py+.05,.50,.94,1.38,1.82,2.27]){
 box(shelfX+shelfW/2,y,shelfZ+shelfD/2,shelfW,.020,shelfD,M.wood,pulloutGroup);
 // Low tray lips keep the long sides open for access when extended.
 for(let z of[shelfZ+.008,shelfZ+shelfD-.008])box(shelfX+shelfW/2,y+.045,z,shelfW,.07,.016,M.cream,pulloutGroup);
}
// Guide rails remain in the casing; the nested runners follow the carriage.
for(let y of[py+.028,V.pulloutTop-.042]){
 box(px+pw/2,y,vback+pd/2,pw-.055,.018,.045,M.chrome,casing);
 box(shelfX+shelfW/2,y+.012,vback+pd/2,shelfW,.014,.026,M.chrome,pulloutGroup);
}
// The masonry return remains behind the cabinet, outside its sliding envelope.
box(px+pw/2,D.ceiling/2,vback+pd+V.rearPierDepth/2,pw,D.ceiling,V.rearPierDepth,M.wall,wallGroup);
// Wood wall return at the bedroom-side jamb, as the rendering's right-hand reveal.
slab(vx-.016,vz-.025,.016,V.depth+mirrorDepth+.025,0,D.ceiling,M.wood);
slab(vx-.10,vz-.025,.10,.025,0,D.ceiling,M.wood);
// Floating two-row drawer cabinet; side storage has a floor-standing timber cheek.
slab(vx,vz+.025,mirrorW,V.depth-.025,.24,.44,M.wood);
for(const [offset,width] of[[0,V.basinBay],[V.basinBay,V.sideBay]])for(let y of[.25,.46])
 slab(vx+offset+.005,vz+.006,width-.01,.019,y,.20,M.wood);
slab(vx+mirrorW,vz,V.endStorage,V.depth,0,.68,M.wood);
// An integrated basin: four rim pieces surround a real recessed bowl, not a bowl on top.
const basinX=vx+.45,holeW=.54,holeD=.28,holeX=basinX-holeW/2,holeZ=vz+.09,apronBottom=.68;
slab(vx,vz,vw,.09,apronBottom,.12,M.white);
slab(vx,holeZ+holeD,vw,V.depth-.09-holeD,apronBottom,.12,M.white);
slab(vx,holeZ,holeX-vx,holeD,apronBottom,.12,M.white);
slab(holeX+holeW,holeZ,vx+vw-holeX-holeW,holeD,apronBottom,.12,M.white);
slab(holeX+.012,holeZ+.012,holeW-.024,holeD-.024,.695,.018,M.white);
cyl(basinX,.716,holeZ+holeD*.6,.018,.004,M.dark);
// 200 mm backsplash and matching return finish under the hanging cabinet.
slab(vx,vback-.018,mirrorW,.018,.03,.97,M.vanityStone);
// Continuous veined stone, as in reference rendering 07.
slab(vx-.010,vz,.010,V.depth,.03,.97,M.vanityStone);
// Black wall-mounted mixer and spout (rendering 07 / EL.03).
for(let x of[basinX-.085,basinX+.085])slab(x-.025,vback-.025,.05,.018,.875,.05,M.dark);
slab(basinX-.014,vback-.18,.028,.18,.902,.024,M.dark);
slab(basinX-.09,vback-.065,.01,.045,.91,.035,M.dark);
// Mirror and upper doors share the same face; no bulky projecting white box.
const mirrorFace=vback-.027;
slab(vx+.003,mirrorFace,mirrorW-.006,.018,1.00,.80,M.mirror);
const mirrorLight=new THREE.MeshStandardMaterial({color:'#fff7da',emissive:'#fff3ce',emissiveIntensity:.75});
for(let y of[1.07,1.73])slab(vx+.07,mirrorFace-.004,mirrorW-.14,.005,y,.009,mirrorLight);
for(let x of[vx+.07,vx+mirrorW-.079])slab(x,mirrorFace-.004,.009,.005,1.07,.669,mirrorLight);
for(const [offset,width] of[[0,V.basinBay],[V.basinBay,V.sideBay]])
 slab(vx+offset+.003,mirrorFace,width-.006,.018,1.803,V.upperHeight-.006,M.cream);
// User-confirmed clear glass partition above the counter, not a solid end cupboard.
// Keep the existing support below; a thin dark channel follows the partition perimeter.
const sideX=vx+mirrorW;
const sideGlass=slab(sideX-.010,vz+.014,.008,V.depth-.028,.814,1.522,M.glass);
sideGlass.name='vanity-side-glass-partition';sideGlass.castShadow=false;sideGlass.receiveShadow=false;
for(let z of[vz,vback-.014])slab(sideX-.014,z,.014,.014,.80,1.55,M.dark);
for(let y of[.80,2.336])slab(sideX-.014,vz,.014,V.depth,y,.014,M.dark);
// Two-use door at the wash-area / corridor boundary, parked across the bedroom opening.
doorway(712,416,712,501,2.21);doorLeaf(632,501,712,501,2.21,M.cream);
// Four connected folding/sliding leaves stack beside the south wall, as P.01.
const F=D.flexWardrobe,fxRight=X(1304),fz=Z(586),fxLeft=fxRight-F.width;
wardrobe(planX(fxLeft),586,1304,planZ(fz+F.depth),'z',F.height,M.cream,1.15);
// P.01 labels the left block an 8-cubic storage cabinet; EL.01 shows closed wood doors.
wardrobe(planX(fxLeft-F.serviceWidth),586,planX(fxLeft),planZ(fz+F.serviceDepth),'z',F.height,M.wood,2.30);
const doors=new THREE.Group();doors.name='four-leaf-folding-sliding-door';scene.add(doors);
for(let i=0;i<FD.count;i++){
 const a=FD.hinges[i],b=FD.hinges[i+1],width=Math.hypot(b.x-a.x,b.z-a.z),h=FD.height;
 const leaf=new THREE.Group();leaf.name=`folding-door-leaf-${i+1}`;
 leaf.position.set((a.x+b.x)/2,0,(a.z+b.z)/2);leaf.rotation.y=-Math.atan2(b.z-a.z,b.x-a.x);doors.add(leaf);
 // Timber rails surround a light infill; adjoining leaves share hinge axes.
 box(0,h/2,0,width-.09,h-.10,.012,M.linen,leaf);
 for(let xx of[-width/2+.024,width/2-.024])box(xx,h/2,0,.048,h,FD.thickness,M.wood,leaf);
 for(let yy of[.026,h-.026])box(0,yy,0,width,.052,FD.thickness,M.wood,leaf);
 for(let yy of[.59,1.18,1.77])box(0,yy,0,width-.07,.027,FD.thickness,M.wood,leaf);
 if(i===FD.count-1)box(-width/2+.075,1.05,-.027,.017,.16,.018,M.brass,leaf);
}
for(let i=1;i<FD.hinges.length-1;i++)for(let y of[.22,1.18,2.14])cyl(FD.hinges[i].x,y,FD.hinges[i].z,.022,.09,M.brass,.022,doors);
// The upper rail follows the partition line and is shown with complete walls.
box(FD.track.x,FD.track.y,(FD.track.fromZ+FD.track.toZ)/2,.048,.045,FD.track.toZ-FD.track.fromZ,M.windowFrame,openingGroup);
plant(1276,882);
// Outlet faces follow EL.01 / EL.03 / EL.06 / EL.08; unlabelled offsets are visual traces.
function outlet(x,y,z,angle=0,width=.086,parent=scene){
 const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=angle;parent.add(g);
 box(0,0,0,width,.086,.009,M.cream,g);
 for(let j=0;j<Math.round(width/.086);j++)for(let dx of[-.014,.014])box(-width/2+.043+j*.086+dx,0,.006,.006,.017,.004,M.dark,g);
}
outlet(CW.x+.22,1.13,cookingBack+.018,0,.172);
outlet(CW.pierX+.15,1.14,CW.frontZ+.024,0,.172);
for(let x of[I.x+.50,I.x+1.50])outlet(x,.54,barFront+.006,0,.172);
// Mirror-cabinet power is behind the closed mirror, not an exposed socket on its face.
for(let x of[1094,1296])outlet(X(x),.79,Z(277),0,.172,wallGroup);
// EL.01 / EL.03 cabinet LEDs; the lighting controller follows P.04/P.09.
const kitchenLed=new THREE.MeshStandardMaterial({color:'#fff0dc',emissive:'#ffddab',emissiveIntensity:0});
const vanityLed=kitchenLed.clone();
slab(CW.x,cookingBack+.28,runW,.02,1.54,.013,kitchenLed);
slab(vx+.03,vz+.08,mirrorW-.06,.014,.235,.012,vanityLed);
rooms.slice(1).forEach(r=>{let el=document.createElement('div');el.className='room-label';el.textContent=r.name;$('#labels').append(el);labelItems.push({el,point:new THREE.Vector3(X(r.x),.12,Z(r.z))})});let entry=document.createElement('div');entry.className='room-label';entry.textContent='入口';$('#labels').append(entry);labelItems.push({el:entry,point:new THREE.Vector3(X(762),.1,Z(985))});
renderQuality=createRenderQuality({renderer,scene,camera,sun});
initMaterialEditor({THREE,materials:M,renderer,scene,camera,finishLibrary,onOpen:()=>{lightingDesign?.close();controls.autoRotate=false;$('#rotate').setAttribute('aria-pressed','false');$('#rotate').textContent='自动旋转'}});
// Shape the existing registered cheek, preserving its material and component key.
// Upper depth is the model's 300 mm cabinet depth; the 230 mm inset is inferred
// from rendering 03 rather than a newly claimed construction dimension.
{
 const {width,height,depth}=kitchenCheek.geometry.parameters;
 const back=-depth/2,front=depth/2,upperFront=front-(CW.depth-.30);
 const bottom=-height/2,top=height/2,step=D.kitchen.baseTop-kitchenCheek.position.y;
 const profile=new THREE.Shape();
 profile.moveTo(-back,bottom);profile.lineTo(-front,bottom);
 profile.lineTo(-front,step);profile.lineTo(-upperFront,step);
 profile.lineTo(-upperFront,top);profile.lineTo(-back,top);profile.closePath();
 const geometry=new THREE.ExtrudeGeometry(profile,{depth:width,bevelEnabled:false,steps:1});
 geometry.rotateY(Math.PI/2);geometry.translate(-width/2,0,0);
 kitchenCheek.geometry.dispose();kitchenCheek.geometry=geometry;
}
softenFurnitureEdges(scene,M);
// Added after the registry so ceiling fittings do not intercept surface material picking.
lightingDesign=createLightingDesign({scene,sun,fill,hemi,renderer,extras:[
 {id:'kitchen-under-cabinet',room:'kitchen',material:kitchenLed,position:[CW.x+runW*.5,1.51,cookingBack+.28],power:3.5},
 {id:'vanity-under-cabinet',room:'bath',material:vanityLed,position:[vx+mirrorW*.5,.23,vz+.10],power:1.6},
 {id:'vanity-mirror-led',room:'bath',material:mirrorLight,position:[vx+mirrorW*.5,1.79,mirrorFace-.025],power:2.5}
]});
wallGroup.scale.y=.25;openingGroup.visible=false;resize();moveCamera(rooms[0],true);$('#loading').remove();animate();window.__qixia={scene,camera,renderer,rooms,source:'P.01 / P.12',kitchenLayout:K,kitchenWindow:KW,foldingDoorLayout:FD,cookingWallLayout:CW,kitchenGasCabinet:GC,interiorLayout:D,dimensions:{island:[2,1.1],table:[1.9,.9],bed:[1.8,2]}};
}
function moveCamera(r,immediate=false){if(!camera)return;let target=r.id==='all'?new THREE.Vector3(.0,.25,0):new THREE.Vector3(X(r.x),r.aimY??.35,Z(r.z));let dist=r.dist;if(r.fit!==false&&camera.aspect<1.15)dist*=1.15/camera.aspect;dist=Math.min(dist,41);let direction=topMode?new THREE.Vector3(0,1,.001):new THREE.Vector3(.58,.93,1.05).normalize();if(r.id==='master')direction=new THREE.Vector3(.55,2.2,1.4).normalize();if(r.id==='bath')direction=new THREE.Vector3(.15,2.0,-1.0).normalize();if(r.id==='second')direction=new THREE.Vector3(.40,1.8,-1.0).normalize();if(r.direction)direction=new THREE.Vector3(...r.direction).normalize();if(topMode)direction=new THREE.Vector3(0,1,.001);const pos=target.clone().addScaledVector(direction,dist);if(immediate||reduced){camera.position.copy(pos);controls.target.copy(target);controls.update();flight=null}else flight={from:camera.position.clone(),to:pos,fromTarget:controls.target.clone(),toTarget:target,start:performance.now()}}
function resize(){if(!renderer||mode!=='scene')return;let b=$('#canvas-wrap').getBoundingClientRect();if(!b.width||!b.height)return;camera.aspect=b.width/b.height;camera.updateProjectionMatrix();if(renderQuality)renderQuality.resize(b.width,b.height);else renderer.setSize(b.width,b.height);}
new ResizeObserver(()=>{let prior=camera?.aspect;resize();if(camera&&selected==='all'&&Math.abs(camera.aspect-(prior||0))>.15)moveCamera(rooms[0],true)}).observe($('main'));
function animate(){requestAnimationFrame(animate);if(mode!=='scene')return;if(pulloutFlight){const t=reduced?1:Math.min((performance.now()-pulloutFlight.start)/700,1),v=t*t*(3-2*t);pulloutGroup.position.x=THREE.MathUtils.lerp(pulloutFlight.from,pulloutFlight.to,v);if(t===1)pulloutFlight=null}if(flight){let t=Math.min((performance.now()-flight.start)/950,1),v=1-Math.pow(1-t,3);camera.position.lerpVectors(flight.from,flight.to,v);controls.target.lerpVectors(flight.fromTarget,flight.toTarget,v);if(t===1)flight=null}controls.update();renderQuality.render();if(frame++%2===0){let w=renderer.domElement.clientWidth,h=renderer.domElement.clientHeight;for(let l of labelItems){let p=l.point.clone().project(camera);l.el.style.left=(p.x*.5+.5)*w+'px';l.el.style.top=(-p.y*.5+.5)*h+'px';l.el.style.opacity=showLabels&&selected==='all'&&p.z<1&&p.z>0&&p.x>-1&&p.x<1&&p.y>-1&&p.y<1?'1':'0'}}}
function updateViewButtons(){$('#top').classList.toggle('active',topMode);$('#orbit').classList.toggle('active',!topMode)}
$('#pullout-toggle').onclick=()=>{
 if(!pulloutGroup)return;
 pulloutOpen=!pulloutOpen;
 pulloutFlight={from:pulloutGroup.position.x,to:pulloutOpen?D.vanity.pulloutTravel:0,start:performance.now()};
 $('#pullout-toggle').setAttribute('aria-pressed',String(pulloutOpen));$('#pullout-toggle').textContent=pulloutOpen?'收回高柜':'拉出高柜';
 topMode=false;controls.autoRotate=false;$('#rotate').setAttribute('aria-pressed','false');$('#rotate').textContent='自动旋转';if(fullWalls)$('#walls').click();updateViewButtons();
 moveCamera({id:'pullout-detail',x:852,z:552,dist:4.3,aimY:1.05,fit:false,direction:[.8,1.35,-1]});
};
$('#vanity-detail').onclick=()=>{topMode=false;controls.autoRotate=false;$('#rotate').setAttribute('aria-pressed','false');$('#rotate').textContent='自动旋转';if(fullWalls)$('#walls').click();updateViewButtons();moveCamera({id:'vanity-detail',x:790,z:527,dist:3.7,aimY:1.0,fit:false,direction:[.4,1.4,-1]})};
$('#kitchen-detail').onclick=()=>{topMode=false;controls.autoRotate=false;$('#rotate').setAttribute('aria-pressed','false');$('#rotate').textContent='自动旋转';if(!fullWalls)$('#walls').click();updateViewButtons();moveCamera({id:'kitchen-detail',x:480,z:565,dist:4.2,aimY:1.1,fit:false,direction:[.28,.34,1]})};
$('#walls').onclick=()=>{fullWalls=!fullWalls;wallGroup.scale.y=fullWalls?1:.25;openingGroup.visible=fullWalls;$('#walls').setAttribute('aria-pressed',String(fullWalls));$('#walls').textContent=fullWalls?'降低墙体':'完整墙体'};
$('#labels-toggle').onclick=()=>{showLabels=!showLabels;$('#labels-toggle').setAttribute('aria-pressed',String(showLabels))};$('#rotate').onclick=()=>{controls.autoRotate=!controls.autoRotate;$('#rotate').setAttribute('aria-pressed',String(controls.autoRotate));$('#rotate').textContent=controls.autoRotate?'停止旋转':'自动旋转'};$('#top').onclick=()=>{topMode=true;controls.autoRotate=false;$('#rotate').setAttribute('aria-pressed','false');$('#rotate').textContent='自动旋转';updateViewButtons();moveCamera(rooms.find(r=>r.id===selected))};$('#orbit').onclick=()=>{topMode=false;updateViewButtons();moveCamera(rooms.find(r=>r.id===selected))};$('#reset').onclick=()=>{controls.autoRotate=false;$('#rotate').setAttribute('aria-pressed','false');$('#rotate').textContent='自动旋转';selectRoom('all')};function zoom(f){if(!camera)return;flight=null;let offset=camera.position.clone().sub(controls.target).multiplyScalar(f);offset.clampLength(controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(offset);controls.update()}$('#zoom-in').onclick=()=>zoom(.85);$('#zoom-out').onclick=()=>zoom(1.15);
selectRoom('all',false);build().catch(err=>{console.error(err);$('#loading').textContent='三维画面暂时无法加载，请使用支持 WebGL 的浏览器。仍可查看设计效果图和平面图。';document.querySelectorAll('.scene-tools button,.view-controls button,.zoom-controls button').forEach(b=>b.disabled=true)});
