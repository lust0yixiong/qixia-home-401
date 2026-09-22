import * as THREE from 'three';
import {PathTracingSceneGenerator,PathTracingRenderer,PhysicalPathTracingMaterial,GradientEquirectTexture,DenoiseMaterial,PhysicalSpotLight,FullScreenQuad} from './assets/pathtracer-v0.0.20.js';
import {createPhotoSnapshot} from './photo-scene.mjs?v=29';
export function createPhotoRenderer({renderer,scene,camera,getLighting}){
 const material=new PhysicalPathTracingMaterial();material.bounces=10;material.transmissiveBounces=12;material.filterGlossyFactor=.25;
 const tracer=new PathTracingRenderer(renderer);tracer.camera=camera;tracer.material=material;tracer.tiles.set(2,2);
 const sky=new GradientEquirectTexture(256);sky.topColor.set('#dbeaff');sky.bottomColor.set('#a8a59a');sky.exponent=.65;sky.update();material.envMapInfo.updateFrom(sky);material.envMapInfo.map.needsUpdate=true;
 const denoise=new DenoiseMaterial({map:tracer.target.texture,sigma:2,kSigma:1,threshold:.06});
 const plain=new THREE.MeshBasicMaterial({map:tracer.target.texture,depthTest:false,depthWrite:false});const quad=new FullScreenQuad(denoise);
 let snapshot=null,geometry=null,width=1,height=1;
 return {
  get samples(){return tracer.samples;},
  resize(w,h){if(width===w&&height===h)return;width=w;height=h;tracer.setSize(w,h);},
  reset(){tracer.reset();},
  rebuild(){
   snapshot?.dispose();geometry?.dispose();
   const lighting=getLighting();snapshot=createPhotoSnapshot(THREE,scene,lighting,PhysicalSpotLight);
   const result=new PathTracingSceneGenerator().generate(snapshot.scene,{maxLeafTris:4});geometry=result.bvh.geometry;
   material.bvh.updateFrom(result.bvh);
   material.attributesArray.updateFrom(geometry.attributes.normal,geometry.attributes.tangent,geometry.attributes.uv,geometry.attributes.color);
   material.materialIndexAttribute.updateFrom(geometry.attributes.materialIndex);
   material.textures.setTextures(renderer,1024,1024,result.textures);
   material.materials.updateFrom(result.materials,result.textures);material.lights.updateFrom(result.lights);
   material.environmentIntensity=lighting.night?.025:3.5;tracer.reset();
  },
  render(advance,filtered){
   camera.updateMatrixWorld();if(advance){tracer.update();if(renderer.info.programs.some(p=>p.diagnostics?.runnable===false))throw new Error('路径追踪着色器未通过显卡编译');}
   renderer.setRenderTarget(null);
   if(tracer.samples>=1){quad.material=filtered?denoise:plain;quad.material.map=tracer.target.texture;quad.render(renderer);return true;}
   return false;
  },
  dispose(){snapshot?.dispose();geometry?.dispose();sky.dispose();tracer.dispose();material.dispose();denoise.dispose();plain.dispose();quad.dispose();}
 };
}
