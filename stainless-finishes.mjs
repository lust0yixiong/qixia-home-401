// Seamless procedural finishes; visual samples, not a manufacturer's alloy specification.
export const STAINLESS_FINISHES=[
 {id:'brushed',name:'不锈钢 · 直纹拉丝',roughness:.34,normalStrength:.08,repeatX:4,repeatY:4},
 {id:'steel-cross',name:'不锈钢 · 交叉拉丝',roughness:.39,normalStrength:.07,repeatX:4,repeatY:4},
 {id:'steel-satin',name:'不锈钢 · 细砂面',roughness:.58,normalStrength:.13,repeatX:2,repeatY:2},
 {id:'steel-mirror',name:'不锈钢 · 镜面',roughness:.075,normalStrength:0},
 {id:'steel-hammered',name:'不锈钢 · 锤纹',roughness:.35,normalStrength:.35,repeatX:3,repeatY:3},
 {id:'steel-diamond',name:'不锈钢 · 菱形压纹',roughness:.32,normalStrength:.30,repeatX:3,repeatY:3}
].map(p=>({...p,color:'#d3d6d8',metalness:1,category:'stainless'}));
const TAU=Math.PI*2,mod=(v,n)=>(v%n+n)%n;
function grain(u,v,n){
 const x=u*n,y=v*n,ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
 const a=fx*fx*(3-2*fx),b=fy*fy*(3-2*fy);
 const hash=(x,y)=>{let h=Math.imul(mod(x,n)+19,374761393)^Math.imul(mod(y,n)+61,668265263);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295;};
 return (hash(ix,iy)*(1-a)+hash(ix+1,iy)*a)*(1-b)+(hash(ix,iy+1)*(1-a)+hash(ix+1,iy+1)*a)*b;
}
export function sampleStainless(id,u,v){
 let height=.5,rough=.95;
 if(id==='brushed'){
  const line=Math.sin(u*TAU*100+.28*Math.sin(v*TAU*2))*.7+Math.sin(u*TAU*173)*.3;
  height+=line*.055;rough=.88+line*.05;
 }else if(id==='steel-cross'){
  const line=(Math.sin(u*TAU*102)+Math.sin(v*TAU*102))*.5;
  height+=line*.045;rough=.88+line*.05;
 }else if(id==='steel-satin'){
  const g=grain(u,v,128);height+=(g-.5)*.12;rough=.87+g*.12;
 }else if(id==='steel-hammered'){
  const x=mod(u*10,1)-.5,y=mod(v*10,1)-.5;
  const dent=Math.max(0,1-(x*x+y*y)/.23);height-=.18*dent*dent;rough=.80+.13*grain(u,v,20);
 }else if(id==='steel-diamond'){
  const line=Math.max(Math.max(0,1-Math.abs(Math.sin((u+v)*TAU*9))*5),Math.max(0,1-Math.abs(Math.sin((u-v)*TAU*9))*5));
  height+=.07*line*line;rough=.83-line*.12;
 }
 return {color:[255,255,255],height,rough};
}
export function stainlessPixels(id,size=512){
 const heights=new Float32Array(size*size),roughness=new Float32Array(size*size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const s=sampleStainless(id,x/size,y/size),i=y*size+x;heights[i]=s.height;roughness[i]=s.rough;}
 const normal=new Uint8ClampedArray(size*size*4),rough=new Uint8ClampedArray(normal.length),preview=new Uint8ClampedArray(normal.length);
 const h=(x,y)=>heights[mod(y,size)*size+mod(x,size)];
 const strength=STAINLESS_FINISHES.find(p=>p.id===id)?.normalStrength??1;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=(y*size+x)*4,nx=(h(x-1,y)-h(x+1,y))*8,ny=(h(x,y-1)-h(x,y+1))*8,inv=1/Math.hypot(nx,ny,1);
  normal.set([(nx*inv*.5+.5)*255,(ny*inv*.5+.5)*255,(inv*.5+.5)*255,255],i);
  const r=roughness[y*size+x]*255;rough.set([r,r,r,255],i);
  // Swatch-only studio reflection. This illumination is never baked into model color.
  const band=Math.cos((x/size*.75+y/size*.3)*TAU),shade=173+band*(id==='steel-mirror'?70:35)+(nx-ny)*strength*65;
  preview.set([shade*.98,shade,shade*1.02,255],i);
 }
 return {normal,rough,preview};
}
