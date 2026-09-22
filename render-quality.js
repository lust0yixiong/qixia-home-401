import * as THREE from 'three';
import {RoomEnvironment} from './assets/three-addons/environments/RoomEnvironment.js';
import {EffectComposer} from './assets/three-addons/postprocessing/EffectComposer.js';
import {RenderPass} from './assets/three-addons/postprocessing/RenderPass.js';
import {SSAOPass} from './assets/three-addons/postprocessing/SSAOPass.js';
import {OutputPass} from './assets/three-addons/postprocessing/OutputPass.js';

// Exclude glazing from the normal/depth pass; it must not cast opaque AO silhouettes.
class InteriorAO extends SSAOPass {
  overrideVisibility(){
    super.overrideVisibility();
    this.scene.traverse(o=>{if(o.isMesh){const ms=Array.isArray(o.material)?o.material:[o.material];if(ms.every(m=>m.transparent&&m.opacity<.85))o.visible=false;}});
  }
}
export function createRenderQuality({renderer,scene,camera,sun}) {
  const envScene=new RoomEnvironment(renderer),pmrem=new THREE.PMREMGenerator(renderer);
  const environment=pmrem.fromScene(envScene,.035);scene.environment=environment.texture;envScene.dispose();pmrem.dispose();
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  let composer=null,ao=null,quality='smooth',width=1,height=1,failed=false;
  const supported=renderer.capabilities.isWebGL2&&!!renderer.extensions.get('EXT_color_buffer_float');
  const ui=document.createElement('div');ui.className='quality-control';ui.innerHTML='<label for="render-quality">画质</label><select id="render-quality"><option value="smooth">流畅</option><option value="high">高画质</option></select><span id="quality-status" role="status"></span>';
  document.querySelector('#scene-view').append(ui);const select=ui.querySelector('select'),status=ui.querySelector('span');
  if(!supported){select.querySelector('[value="high"]').disabled=true;select.title='此设备使用流畅模式';}
  function setupComposer(){
    if(composer)return;
    const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});target.samples=2;
    composer=new EffectComposer(renderer,target);
    composer.addPass(new RenderPass(scene,camera));
    ao=new InteriorAO(scene,camera,1,1,16);ao.kernelRadius=.28;ao.minDistance=.00006;ao.maxDistance=.0025;
    // Keep cavity shading gentle instead of turning bright walls grey.
    ao.ssaoMaterial.fragmentShader=ao.ssaoMaterial.fragmentShader.replace('1.0 - occlusion','1.0 - 0.65 * occlusion');
    composer.addPass(ao);composer.addPass(new OutputPass());
  }
  function resize(w,h){
    width=w;height=h;
    const ratio=Math.min(devicePixelRatio,quality==='high'?1.65:1.25,(quality==='high'?1900:1500)/Math.max(w,h));
    renderer.setPixelRatio(Math.max(.5,ratio));renderer.setSize(w,h);
    if(composer){composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(w,h);}
  }
  function setQuality(value,persist=true){
    quality=value==='high'&&supported&&!failed?'high':'smooth';
    if(quality==='high')try{setupComposer();}catch(error){console.warn('当前设备改用流畅模式。',error);quality='smooth';failed=true;select.querySelector('[value="high"]').disabled=true;}
    select.value=quality;
    const resolution=quality==='high'?2048:1024;
    if(sun.shadow.mapSize.x!==resolution){sun.shadow.mapSize.set(resolution,resolution);sun.shadow.map?.dispose();sun.shadow.map=null;}
    status.textContent=quality==='high'?'细腻阴影 · 环境反射':'轻量阴影 · 环境反射';
    resize(width,height);
    if(persist)try{localStorage.setItem('qixia-render-quality',quality);}catch{}
  }
  select.onchange=()=>setQuality(select.value);
  let saved;try{saved=localStorage.getItem('qixia-render-quality');}catch{}
  setQuality(saved|| (matchMedia('(pointer: coarse)').matches?'smooth':'high'),false);
  return {
    resize,
    render(){
      if(quality==='high'){
        try{composer.render();}
        catch(error){console.warn('高画质不可用，已切换流畅模式。',error);failed=true;select.querySelector('[value="high"]').disabled=true;renderer.setRenderTarget(null);scene.overrideMaterial=null;if(ao._visibilityCache.size)ao.restoreVisibility();setQuality('smooth');renderer.render(scene,camera);}
      }else renderer.render(scene,camera);
    }
  };
}
