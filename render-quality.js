import * as THREE from 'three';
import {runPhotoRequest,photoFailureMessage} from './photo-recovery.mjs?v=31';
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
export function createRenderQuality({renderer,scene,camera,sun,getLighting,onPhotoView,onPhotoExit}) {
  const envScene=new RoomEnvironment(renderer),pmrem=new THREE.PMREMGenerator(renderer);
  const environment=pmrem.fromScene(envScene,.035);scene.environment=environment.texture;envScene.dispose();pmrem.dispose();
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  let composer=null,ao=null,quality='smooth',width=1,height=1,failed=false;
  let photo=null,loading=null,dirty=true,lastChange=0,lastCamera='',paused=false,lastStatus=0,requestId=0,photoError=null,loadAttempt=0;
  const photoPanel=document.createElement('div');photoPanel.className='photo-controls hidden';
  photoPanel.innerHTML=`<div class="photo-title">照片级渲染 <span>10 次光线反弹</span></div><label>室内取景 <select id="photo-view"><option value="kitchen">餐厨空间</option><option value="vanity">洗漱区镜面</option><option value="master">主卧室</option><option value="flex">多功能活动区</option></select></label><label>画面长边 <select id="photo-size"><option value="1280">1280 像素</option><option value="1920" selected>1920 像素</option><option value="3840">3840 像素 · 4K</option></select></label><label>采样目标 <select id="photo-samples"><option value="128">128 · 预览</option><option value="512" selected>512 · 精细</option><option value="2048">2048 · 展示</option></select></label><label>曝光 <input id="photo-exposure" type="range" min="0.5" max="3" value="1.8" step="0.05"></label><label><input type="checkbox" id="photo-denoise" checked>柔和降噪</label><div><button id="photo-pause">暂停采样</button><button id="photo-export" disabled>保存当前图片</button></div><p>拖动时快速预览，停下后重新采样。换材质或灯光后自动更新。</p><p id="photo-progress" role="status" aria-live="polite"></p><div id="photo-recovery" class="hidden"><button id="photo-retry">重试照片级</button><button id="photo-fallback">使用高画质</button></div>`;
  document.querySelector('#scene-view').append(photoPanel);
  const exportDialog=document.createElement('dialog');exportDialog.className='photo-export-dialog';
  exportDialog.innerHTML='<button class="photo-export-close" aria-label="关闭图片预览">×</button><h2>渲染图片</h2><img id="photo-export-image" alt="当前三维场景的渲染图片"><p id="photo-export-info"></p><a id="photo-download">下载 PNG 图片</a>';
  document.body.append(exportDialog);let exportURL=null;
  exportDialog.querySelector('button').onclick=()=>exportDialog.close();
  exportDialog.addEventListener('close',()=>{if(exportURL)URL.revokeObjectURL(exportURL);exportURL=null;exportDialog.querySelector('img').removeAttribute('src');});
  const field=id=>photoPanel.querySelector('#photo-'+id),progress=field('progress');
  function invalidate(){dirty=true;lastChange=performance.now();photo?.reset();field('export').disabled=true;}
  field('view').addEventListener('click',()=>{if(!document.querySelector('.photo-interior')){onPhotoView(field('view').value);invalidate();}});
  field('view').onchange=()=>{onPhotoView(field('view').value);invalidate();};
  field('size').onchange=()=>{resize(width,height);lastChange=performance.now();};
  field('pause').onclick=()=>{paused=!paused;field('pause').textContent=paused?'继续采样':'暂停采样';};
  field('exposure').oninput=()=>{renderer.toneMappingExposure=Number(field('exposure').value);};
  field('export').onclick=()=>{
    if(!photo||dirty||photo.samples<1)return;
    photo.render(false,field('denoise').checked);
    const samples=Math.floor(photo.samples),w=renderer.domElement.width,h=renderer.domElement.height;
    renderer.domElement.toBlob(blob=>{
      if(!blob){progress.textContent='图片生成失败，请重试。';return;}
      if(exportURL)URL.revokeObjectURL(exportURL);exportURL=URL.createObjectURL(blob);
      exportDialog.querySelector('img').src=exportURL;
      const link=exportDialog.querySelector('a');link.href=exportURL;link.download=`栖霞苑-${field('view').selectedOptions[0].text}-${samples}采样.png`;
      exportDialog.querySelector('p').textContent=`${w} × ${h} 像素 · ${samples} 采样 · PNG`;
      exportDialog.showModal();
    },'image/png');
  };
  field('retry').onclick=()=>startPhoto();
  field('fallback').onclick=()=>setQuality('high');
  async function startPhoto(){
    const id=++requestId;
    photoError=null;renderer.toneMappingExposure=Number(field('exposure').value);field('recovery').classList.add('hidden');field('pause').disabled=false;
    status.textContent='加载照片级引擎…';progress.textContent='首次使用需要准备模型与着色器。';
    await runPhotoRequest({
      load:()=>photo?null:(loading ||= import('./photo-renderer.js?v=33&attempt='+ ++loadAttempt)),
      isCurrent:()=>id===requestId&&quality==='photo',
      ready:module=>{
        if(!photo)photo=module.createPhotoRenderer({renderer,scene,camera,getLighting});
        paused=false;field('pause').textContent='暂停采样';
        onPhotoView(field('view').value);resize(width,height);invalidate();
      },
      failed:failPhoto
    });
  }
  function failPhoto(error){
    console.error('照片级渲染无法启动',error);requestId++;photoError=error;
    const previous=photo;photo=null;loading=null;
    try{previous?.dispose();}catch(cleanupError){console.warn('照片级资源清理失败',cleanupError);}
    renderer.setRenderTarget(null);renderer.resetState();scene.overrideMaterial=null;
    renderer.toneMappingExposure=1.05;
    field('pause').disabled=true;field('export').disabled=true;field('recovery').classList.remove('hidden');
    progress.textContent=photoFailureMessage(error);status.textContent='照片级暂停 · 实时预览';
  }

  const supported=renderer.capabilities.isWebGL2&&!!renderer.extensions.get('EXT_color_buffer_float');
  const ui=document.createElement('div');ui.className='quality-control';ui.innerHTML='<label for="render-quality">画质</label><select id="render-quality"><option value="smooth">流畅</option><option value="high">高画质</option><option value="photo">照片级 · 路径追踪</option></select><span id="quality-status" role="status"></span>';
  document.querySelector('#scene-view').append(ui);const select=ui.querySelector('select'),status=ui.querySelector('span');
  if(!supported){select.querySelector('[value="high"]').disabled=true;select.querySelector('[value="photo"]').disabled=true;select.title='此设备使用流畅模式';}
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
    const ratio=quality==='photo'?Math.min(Number(field('size').value),renderer.capabilities.maxTextureSize)/Math.max(w,h):Math.min(devicePixelRatio,quality==='high'?2:1.25,(quality==='high'?2560:1500)/Math.max(w,h));
    renderer.setPixelRatio(Math.max(.5,ratio));renderer.setSize(w,h);
    if(photo&&quality==='photo'){const size=renderer.getDrawingBufferSize(new THREE.Vector2());photo.resize(size.x,size.y);lastChange=performance.now();}
    if(composer&&quality!=='photo'){composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(w,h);}
  }
  function setQuality(value,persist=true){
    const previous=quality;
    quality=value==='photo'&&supported?'photo':value==='high'&&supported&&!failed?'high':'smooth';
    if(previous==='photo'&&quality!=='photo'){requestId++;onPhotoExit();renderer.toneMappingExposure=1.05;}
    photoPanel.classList.toggle('hidden',quality!=='photo');
    if(quality==='photo'){renderer.toneMappingExposure=Number(field('exposure').value);paused=false;field('pause').textContent='暂停采样';startPhoto();}
    if(quality==='high')try{setupComposer();}catch(error){console.warn('当前设备改用流畅模式。',error);quality='smooth';failed=true;select.querySelector('[value="high"]').disabled=true;}
    select.value=quality;
    const resolution=quality==='high'?2048:1024;
    if(sun.shadow.mapSize.x!==resolution){sun.shadow.mapSize.set(resolution,resolution);sun.shadow.map?.dispose();sun.shadow.map=null;}
    status.textContent=quality==='photo'?'准备照片级模式…':quality==='high'?'细腻阴影 · 环境反射':'轻量阴影 · 环境反射';
    resize(width,height);
    if(persist&&quality!=='photo')try{localStorage.setItem('qixia-render-quality',quality);}catch{}
  }
  select.onchange=()=>setQuality(select.value);
  let saved;try{saved=localStorage.getItem('qixia-render-quality');}catch{}
  setQuality(saved|| (matchMedia('(pointer: coarse)').matches?'smooth':'high'),false);
  return {
    resize,invalidate,
    render(){
      if(quality==='photo'){
        if(photoError||!photo){renderer.render(scene,camera);return;}
        try{
          const now=performance.now(),signature=[...camera.matrixWorld.elements,...camera.projectionMatrix.elements].map(n=>n.toFixed(5)).join(',');
          if(signature!==lastCamera){lastCamera=signature;lastChange=now;photo.reset();field('export').disabled=true;}
          if(now-lastChange<650){renderer.render(scene,camera);status.textContent='调整视角 · 停下后采样';return;}
          if(dirty){status.textContent='准备光线计算…';progress.textContent='正在准备模型与材质…';dirty=false;photo.rebuild();return;}
          const target=Number(field('samples').value);
          if(!photo.render(!paused&&photo.samples<target,field('denoise').checked))renderer.render(scene,camera);
          field('export').disabled=photo.samples<1;
          if(now-lastStatus>300){const n=Math.floor(photo.samples);status.textContent=`${n} / ${target} 采样`;progress.textContent=`${paused?'已暂停':n>=target?'本次采样完成':'光线计算中'} · ${renderer.domElement.width} × ${renderer.domElement.height} · ${n} / ${target} 采样`;lastStatus=now;}
        }catch(error){failPhoto(error);}
        return;
      }
      if(quality==='high'){
        try{composer.render();}
        catch(error){console.warn('高画质不可用，已切换流畅模式。',error);failed=true;select.querySelector('[value="high"]').disabled=true;renderer.setRenderTarget(null);scene.overrideMaterial=null;if(ao._visibilityCache.size)ao.restoreVisibility();setQuality('smooth');renderer.render(scene,camera);}
      }else renderer.render(scene,camera);
    }
  };
}
