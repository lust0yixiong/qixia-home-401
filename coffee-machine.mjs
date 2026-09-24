// Exterior study of Hauswirt C9 Pro. Envelope is provisionally based on the
// manufacturer's C9 dimensions, not a verified C9 Pro installation drawing.
export const coffeeMachineSpec=Object.freeze({width:.315,depth:.493,height:.406,backGap:.035,offsetZ:2.0625,top:.970});
export function installCoffeeMachine({THREE,scene,counter,shellMaterial}){
 const S=coffeeMachineSpec,root=new THREE.Group();root.name='hauswirt-c9-pro';
 // Local +Z is the operating face; turn it towards the kitchen aisle (+world X).
 root.position.set(counter.x+S.backGap+S.depth/2,S.top,counter.z+S.offsetZ);root.rotation.y=Math.PI/2;scene.add(root);
 root.userData.product={brand:'海氏',model:'C9 Pro 开创者',dimensions:'approximate C9 reference'};
 const mat=(color,roughness,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness,envMapIntensity:.9});
 const silver=mat('#c5c9ce',.29,1),chrome=mat('#e0e3e7',.16,1),satin=mat('#aeb5bd',.46,.95),black=mat('#16191c',.4),wood=mat('#573921',.36),ivory=mat('#e6e2d7',.38);
 const add=(geometry,material,x,y,z,name)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.name=name;m.castShadow=m.receiveShadow=true;root.add(m);return m;};
 const box=(x,y,z,w,h,d,m,name)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,name);
 const rod=(a,b,r,m,name,r2=r,segments=24)=>{const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),delta=vb.clone().sub(va);const mesh=add(new THREE.CylinderGeometry(r2,r,delta.length(),segments),m,...va.clone().add(vb).multiplyScalar(.5).toArray(),name);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return mesh;};
 const tube=(points,r,m,name)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),32,r,10,false),m,0,0,0,name);
 const rounded=(x,y,z,w,h,d,m,name,r=.003)=>{const shape=new THREE.Shape(),l=-w/2,b=-h/2;shape.moveTo(l+r,b);shape.lineTo(l+w-r,b);shape.quadraticCurveTo(l+w,b,l+w,b+r);shape.lineTo(l+w,b+h-r);shape.quadraticCurveTo(l+w,b+h,l+w-r,b+h);shape.lineTo(l+r,b+h);shape.quadraticCurveTo(l,b+h,l,b+h-r);shape.lineTo(l,b+r);shape.quadraticCurveTo(l,b,l+r,b);const g=new THREE.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r/2,bevelSegments:2,steps:1,curveSegments:4});g.translate(0,0,-d/2+r);return add(g,m,x,y,z,name);};
 // Recessed rubber feet, low wide base, solid rear boiler casing and thin side wings.
 for(const x of [-.12,.12])for(const z of [-.20,.19])rod([x,0,z],[x,.016,z],.018,black,'coffee-foot');
 rounded(0,.035,0,.312,.043,.490,satin,'coffee-plinth');
 rounded(0,.221,-.089,.302,.338,.303,silver,'coffee-boiler-housing');
 for(const x of [-.155,.155])box(x,.225,-.080,.005,.350,.320,satin,'coffee-side-wing');
 box(0,.225,.083,.300,.332,.005,chrome,'coffee-polished-front');
 for(const x of [-.154,.154])box(x,.402,-.085,.007,.008,.321,silver,'coffee-top-lip');
 for(const z of [-.242,.072])box(0,.402,z,.308,.008,.007,silver,'coffee-top-lip');
 box(0,.398,-.086,.284,.004,.291,black,'coffee-warming-tray');
 for(let i=0;i<23;i++)box(-.130+i*.0118,.401,-.077,.004,.002,.246,satin,'coffee-warming-grille');
 // Shallow catch basin with actual open grille: shadows and reflections survive ray tracing.
 box(0,.065,.165,.300,.025,.158,black,'coffee-drip-well');
 box(0,.062,.242,.305,.041,.006,silver,'coffee-drip-front');
 for(const x of [-.15,.15])box(x,.070,.167,.005,.027,.15,silver,'coffee-drip-rim');
 for(let i=0;i<29;i++)box(-.14+i*.01,.081,.167,.003,.003,.144,chrome,'coffee-drip-grille');
 box(0,.048,.247,.092,.010,.003,black,'coffee-tray-recess');
 // The upper two walnut steam/water knobs have inset silver end caps.
 for(const x of [-.116,.116]){
  rod([x,.346,.083],[x,.346,.112],.019,chrome,'coffee-knob-collar');
  rod([x,.346,.111],[x,.346,.143],.024,wood,'coffee-walnut-knob',.023,8);
  rod([x,.346,.143],[x,.346,.145],.015,ivory,'coffee-knob-inlay');
 }
 // Gauge faces are geometry so that they remain visible in both renderers.
 const gauge=(x,y,z,r,digital=false)=>{
  rod([x,y,z-.008],[x,y,z],r,chrome,'coffee-gauge-bezel');
  rod([x,y,z],[x,y,z+.001],r*.84,digital?black:ivory,'coffee-gauge-face');
  if(digital){
   // Small illuminated OLED temperature indication, constructed from segments.
   const screen=new THREE.MeshStandardMaterial({color:'#b4d8da',emissive:'#688a8b',emissiveIntensity:.3,roughness:.45});
   for(const [dx,n] of [[-.007,9],[.007,3]]){const segments=n===9?[0,1,2,3,5,6]:[0,1,2,3,6];for(const s of segments){const coords=[[0,.007,.008,.0014],[.004,.0035,.0014,.007],[.004,-.0035,.0014,.007],[0,-.007,.008,.0014],[-.004,-.0035,.0014,.007],[-.004,.0035,.0014,.007],[0,0,.008,.0014]][s];box(x+dx+coords[0],y+coords[1],z+.0018,coords[2],coords[3],.0005,screen,'coffee-oled-segment');}}
  }else{
   for(let i=0;i<13;i++){const a=(-135+i*22.5)*Math.PI/180,mark=box(x+Math.sin(a)*r*.65,y+Math.cos(a)*r*.65,z+.002,.0008,r*.17,.0007,black,'coffee-gauge-tick');mark.rotation.z=-a;}
   rod([x,y,z+.003],[x+r*.44,y+r*.27,z+.003],.0009,black,'coffee-gauge-needle');
  }
 };
 gauge(-.058,.346,.091,.023);gauge(.058,.346,.091,.023,true);
 box(0,.373,.087,.014,.017,.001,mat('#a71e22',.42),'coffee-red-brand-badge');
 for(const dx of [-.003,.003])box(dx,.373,.088,.0016,.010,.0004,ivory,'coffee-brand-H');box(0,.373,.088,.007,.0016,.0004,ivory,'coffee-brand-H');
 // Exposed E61 bell, group gauge, paddle, 58 mm portafilter and dual spouts.
 rod([0,.258,.085],[0,.258,.150],.024,chrome,'coffee-group-mount');
 rod([0,.229,.153],[0,.308,.153],.032,chrome,'coffee-e61-bell',.020,48);
 rod([0,.306,.153],[0,.325,.153],.019,chrome,'coffee-paddle-neck');
 rounded(-.014,.329,.153,.074,.015,.030,wood,'coffee-flow-paddle',.002);
 gauge(-.017,.284,.179,.022);
 rod([0,.207,.158],[0,.232,.158],.043,chrome,'coffee-group-flange',.039,48);
 rod([0,.184,.158],[0,.207,.158],.029,chrome,'coffee-portafilter-basket',.034,40);
 rod([0,.198,.18],[0,.193,.222],.011,chrome,'coffee-handle-neck');
 rod([0,.193,.222],[0,.183,.330],.015,wood,'coffee-walnut-portafilter',.012,32);
 rod([0,.183,.330],[0,.183,.333],.012,chrome,'coffee-handle-end');
 tube([[0,.184,.158],[0,.173,.158],[-.018,.167,.165],[-.022,.156,.168]],.005,chrome,'coffee-left-spout');
 tube([[0,.184,.158],[0,.173,.158],[.018,.167,.165],[.022,.156,.168]],.005,chrome,'coffee-right-spout');
 // Steam and hot water arms curve outward and back down over the tray.
 for(const sign of [-1,1]){
  tube([[sign*.112,.302,.093],[sign*.125,.285,.121],[sign*.138,.255,.144],[sign*.129,.220,.170],[sign*.116,.115,.202]],.0045,chrome,'coffee-wand');
  rod([sign*.127,.211,.173],[sign*.121,.168,.185],.008,black,'coffee-wand-insulator');
  rod([sign*.116,.115,.202],[sign*.114,.105,.206],.006,chrome,'coffee-wand-tip');
 }
 rod([.038,.211,.152],[.070,.231,.176],.006,chrome,'coffee-brew-lever');
 rod([.070,.231,.176],[.078,.280,.181],.009,wood,'coffee-brew-lever-grip');
 if(shellMaterial){const shells=new Set(['coffee-plinth','coffee-boiler-housing','coffee-side-wing','coffee-polished-front','coffee-top-lip','coffee-drip-front','coffee-drip-rim']);root.traverse(o=>{if(o.isMesh&&shells.has(o.name))o.material=shellMaterial;});}
 root.updateMatrixWorld(true);return {root,spec:S};
}
