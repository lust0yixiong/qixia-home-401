// User-selected LIXIL 830 x 560 W-support / 3D family.
// Overall width/depth are confirmed; bowl, accessories, depth and cutout are
// visual approximations from the manufacturer's images, not a fabrication template.
export const islandSinkSpec={width:.830,depth:.560,bowlDepth:.225,openingWidth:.800,openingDepth:.530,centerX:1.52,centerZ:.34};
export function installIslandSink({THREE,scene,island,top,body,legacy,materials}){
 const S=islandSinkSpec;
 function outline(w,d,r,cx=0,cz=0){const points=[];for(const [x,z,a] of [[w/2-r,d/2-r,0],[-w/2+r,d/2-r,Math.PI/2],[-w/2+r,-d/2+r,Math.PI],[w/2-r,-d/2+r,Math.PI*1.5]])for(let i=0;i<12;i++){const angle=a+i/11*Math.PI/2;points.push([cx+x+r*Math.cos(angle),cz+z+r*Math.sin(angle)]);}return points;}
 function path(points,Shape=THREE.Shape){const p=new Shape();points.forEach(([x,z],i)=>i?p.lineTo(x,-z):p.moveTo(x,-z));p.closePath();return p;}
 function plate(w,d,height,y,holes=[],cx=0,cz=0,r=.001){const shape=path(outline(w,d,r,cx,cz));shape.holes=holes.map(p=>path(p,THREE.Path));const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:16});geo.rotateX(-Math.PI/2);geo.translate(0,y,0);return geo;}
 function merge(geos){const positions=[],normals=[],uvs=[];for(const original of geos){const g=original.index?original.toNonIndexed():original;positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);uvs.push(...g.attributes.uv.array);if(g!==original)g.dispose();original.dispose();}const result=new THREE.BufferGeometry();result.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));result.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));result.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));return result;}
 function replace(mesh,geo){mesh.geometry.dispose();mesh.geometry=geo;}
 // Preserve the registered meshes and their material overrides. Only the actual
 // surface is 20 mm thick; the documented 120 mm island edge remains intact.
 const topHeight=top.geometry.parameters.height||.12,opening=outline(S.openingWidth,S.openingDepth,.048,S.centerX-island.width/2,S.centerZ-island.depth/2);
 replace(top,merge([plate(island.width,island.depth,.02,topHeight/2-.02,[opening]),plate(island.width,island.depth,topHeight-.02,-topHeight/2,[outline(island.width-.1,island.depth-.1,.001)])]));
 const b=body.geometry.parameters;
 replace(body,merge([plate(b.width,b.depth,b.height-.018,-b.height/2+.018,[outline(b.width-.036,b.depth-.036,.001)]),plate(b.width,b.depth,.018,-b.height/2)]));
 legacy.forEach(o=>o.visible=false);
 const root=new THREE.Group();root.name='LIXIL-830-3D-island-sink';root.position.set(island.x+S.centerX,top.position.y+topHeight/2+.001,island.z+S.centerZ);root.rotation.y=Math.PI;scene.add(root);
 const steel=materials.chrome.clone();steel.name='lixil-embossed-stainless';steel.color.set('#c5c9cd');steel.metalness=1;steel.roughness=.31;steel.envMapIntensity=.9;
 const polished=steel.clone();polished.roughness=.18;
 function mesh(g,m=steel,parent=root,name=''){const o=new THREE.Mesh(g,m);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(w,h,d,x,y,z,m=steel,parent=root){const o=mesh(new THREE.BoxGeometry(w,h,d),m,parent);o.position.set(x,y,z);return o;}
 function tube(points,r=.004,m=steel,parent=root){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(12,points.length*10),r,10,false),m,parent);}
 function ring(w,d,r,y,wire=.002,parent=root){const pts=outline(w,d,r).map(([x,z])=>[x,y,z]);pts.push(pts[0]);return tube(pts,wire,steel,parent);}
 // Rounded, tapered open basin with two ledges at different working heights.
 const levels=[{w:S.width,d:S.depth,r:.055,y:0,z:0},{w:.760,d:.492,r:.052,y:-.004,z:.012},{w:.758,d:.490,r:.052,y:-.036,z:.012},{w:.746,d:.462,r:.051,y:-.047,z:.012},{w:.740,d:.458,r:.050,y:-.105,z:.012},{w:.730,d:.430,r:.05,y:-.115,z:.012},{w:.713,d:.411,r:.058,y:-.195,z:.012},{w:.695,d:.395,r:.064,y:-.211,z:.012}];
 const positions=[],uv=[];
 for(let k=0;k<levels.length-1;k++){
  const a=levels[k],b=levels[k+1],pa=outline(a.w,a.d,a.r,0,a.z),pb=outline(b.w,b.d,b.r,0,b.z);
  for(let i=0;i<pa.length;i++){const j=(i+1)%pa.length;for(const [p,y] of [[pa[i],a.y],[pb[i],b.y],[pa[j],a.y],[pa[j],a.y],[pb[i],b.y],[pb[j],b.y]]){positions.push(p[0],y,p[1]);uv.push(p[0]/S.width+.5,p[1]/S.depth+.5);}}
 }
 const shell=new THREE.BufferGeometry();shell.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));shell.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));shell.computeVertexNormals();steel.side=THREE.DoubleSide;
 mesh(shell,steel,root,'rounded-basin-with-two-rails');
 const drainX=.085,drainZ=-.045,drainR=.082;
 const circle=Array.from({length:64},(_,i)=>[drainX+drainR*Math.cos(i*Math.PI/32),drainZ+drainR*Math.sin(i*Math.PI/32)]);
 mesh(plate(.695,.395,.002,-.213,[circle],0,.012,.064),steel,root,'basin-bottom');
 const collar=mesh(new THREE.TorusGeometry(.082,.003,8,64),polished);collar.rotation.x=Math.PI/2;collar.position.set(drainX,-.211,drainZ);
 const dark=materials.dark.clone();dark.color.set('#343939');dark.roughness=.6;
 const drain=mesh(new THREE.CylinderGeometry(.081,.081,.010,48),dark);drain.position.set(drainX,-.220,drainZ);
 const cover=mesh(new THREE.CylinderGeometry(.071,.071,.004,64),steel,root,'round-drain-cover');cover.position.set(drainX,-.207,drainZ);
 box(.024,.002,.004,drainX,-.203,drainZ,polished);
 const accessories=new THREE.Group();accessories.name='removable-W-support-accessories';root.add(accessories);
 // Upper wave tray at the left, with the lower perforated tray exposed beside it.
 const upper=new THREE.Group();upper.position.set(-.25,-.026,.012);accessories.add(upper);
 mesh(plate(.235,.475,.002,-.001,[],0,0,.012),steel,upper,'upper-wave-tray');
 for(let z=-.213;z<.225;z+=.026)tube([[-.103,0,z],[0,.005,z],[.103,0,z]],.003,steel,upper);
 const lower=new THREE.Group();lower.position.set(-.215,-.099,.012);accessories.add(lower);
 const holes=[];for(let x=-.113;x<=.115;x+=.023)for(let z=-.180;z<=.18;z+=.025)holes.push(outline(.008,.014,.003,x,z));
 mesh(plate(.280,.435,.002,-.002,holes,0,0,.012),steel,lower,'lower-perforated-draining-tray');ring(.282,.438,.012,0,.002,lower);
 // Rear wire basket and board holder match the manufacturer's W-support layout.
 const basket=new THREE.Group();basket.position.set(.075,-.023,-.183);accessories.add(basket);
 ring(.315,.07,.012,0,.002,basket);ring(.300,.06,.01,-.068,.002,basket);
 for(let x=-.14;x<=.145;x+=.023){tube([[x,0,-.03],[x,-.066,-.024],[x,-.066,.024],[x,0,.03]],.0015,steel,basket);}
 for(let z of[-.03,.03])for(let y of[-.025,-.047])tube([[-.147,y,z],[.147,y,z]],.0016,steel,basket);
 tube([[-.10,0,-.04],[-.10,.115,-.04],[.095,.115,-.04],[.095,0,-.04]],.0025,steel,basket);
 // Reference-style arched faucet; no exact faucet SKU was specified by the user.
 const tapX=-.29,tapZ=-.253;
 const foot=mesh(new THREE.CylinderGeometry(.025,.028,.012,32),polished);foot.position.set(tapX,.006,tapZ);
 tube([[tapX,.008,tapZ],[tapX,.14,tapZ],[tapX,.27,tapZ+.025],[tapX,.335,tapZ+.105],[tapX,.29,tapZ+.205],[tapX,.24,tapZ+.21]],.016,polished);
 const head=mesh(new THREE.CylinderGeometry(.02,.017,.052,32),polished);head.position.set(tapX,.217,tapZ+.21);
 tube([[tapX+.018,.085,tapZ],[tapX+.065,.12,tapZ]],.007,polished);
 root.userData.product='LIXIL 830 × 560 W-support 3D';root.userData.approximateDetails=true;
 return {root,accessories,spec:S};
}
