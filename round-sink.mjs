// User-confirmed visible diameter. Depth and faucet are reference-image approximations.
export const roundSinkSpec={diameter:.320,depth:.168,offsetX:.29,offsetZ:.93,faucetOffsetZ:.14};
export function installRoundSink({THREE,scene,top,body,legacy,metal}){
 const S=roundSinkSpec,{width,height,depth}=top.geometry.parameters;
 const cx=S.offsetX-width/2,cz=S.offsetZ-depth/2,level=height/2;
 const circle=(r,x=0,z=0)=>{const p=new THREE.Path();p.absarc(x,-z,r,0,Math.PI*2,false);return p;};
 const rectangle=(w,d)=>{const p=new THREE.Shape();p.moveTo(-w/2,-d/2);p.lineTo(w/2,-d/2);p.lineTo(w/2,d/2);p.lineTo(-w/2,d/2);p.closePath();return p;};
 function extrude(shape,h,y){const g=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,curveSegments:64});g.rotateX(-Math.PI/2);g.translate(0,y,0);return g;}
 function merge(geometries){
  const arrays={position:[],normal:[],uv:[]};
  for(const original of geometries){const g=original.index?original.toNonIndexed():original;for(const k in arrays)for(const v of g.attributes[k].array)arrays[k].push(v);if(g!==original)g.dispose();original.dispose();}
  const result=new THREE.BufferGeometry();for(const k in arrays)result.setAttribute(k,new THREE.Float32BufferAttribute(arrays[k],k==='uv'?2:3));return result;
 }
 const shape=rectangle(width,depth);shape.holes.push(circle(S.diameter/2,cx,cz));
 const surface=extrude(shape,height,-height/2);
 // Profile travels from rim into the bowl so front-side normals face the cavity.
 const profile=[[.160,.001],[.156,0],[.152,-.004],[.149,-.010],[.147,-.125],[.144,-.145],[.136,-.157],[.124,-.164],[.108,-.167],[.035,-S.depth]];
 const bowl=new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),96);
 bowl.translate(cx,level,cz);
 // One mesh/material slot: per-part edits and imported material plans necessarily
 // color the counter and bowl together, with the same stone grain scale.
 for(const g of [surface,bowl]){const pos=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/width+.5,pos.getZ(i)/depth+.5);}
 top.geometry.dispose();top.geometry=merge([surface,bowl]);
 // Hollow the existing cabinet, preserving its mesh and registered surface ID.
 const b=body.geometry.parameters,wall=.018,frame=rectangle(b.width,b.depth);
 frame.holes.push(rectangle(b.width-wall*2,b.depth-wall*2));
 const cabinet=merge([extrude(frame,b.height-wall,-b.height/2+wall),extrude(rectangle(b.width,b.depth),wall,-b.height/2)]);
 body.geometry.dispose();body.geometry=cabinet;legacy.forEach(o=>o.visible=false);
 const root=new THREE.Group();root.name='west-counter-round-sink-320';root.position.set(top.position.x+cx,top.position.y+level,top.position.z+cz);scene.add(root);
 const mesh=(g,name)=>{const o=new THREE.Mesh(g,metal);o.name=name;o.castShadow=true;o.receiveShadow=true;root.add(o);return o;};
 const drain=mesh(new THREE.CylinderGeometry(.036,.036,.003,64),'round-sink-drain');drain.position.y=-S.depth+.003;
 const collar=mesh(new THREE.TorusGeometry(.038,.0015,8,64),'round-sink-drain-ring');collar.rotation.x=Math.PI/2;collar.position.y=-S.depth+.002;
 // Offset along the wall instead of aligning the mount with the basin centre;
 // the arched spout turns diagonally back into the bowl.
 const tap=mesh(new THREE.CylinderGeometry(.025,.026,.12,32),'round-sink-tap-base');tap.position.set(-.218,.06,S.faucetOffsetZ);
 const curve=new THREE.CatmullRomCurve3([[-.218,.115,S.faucetOffsetZ],[-.218,.29,S.faucetOffsetZ],[-.18,.335,.12],[-.10,.30,.07],[-.035,.22,.025]].map(p=>new THREE.Vector3(...p)));
 mesh(new THREE.TubeGeometry(curve,48,.010,16,false),'round-sink-arched-tap');
 const lever=mesh(new THREE.CylinderGeometry(.004,.004,.065,12),'round-sink-tap-lever');lever.rotation.x=Math.PI/2;lever.position.set(-.218,.115,S.faucetOffsetZ+.037);
 return {root,spec:S};
}
