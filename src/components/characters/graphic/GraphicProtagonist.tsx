import {useEffect,useLayoutEffect,useMemo} from 'react';
import {useLoader,useThree} from '@react-three/fiber';
import {staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {BackSide,DataTexture,DoubleSide,LinearFilter,Mesh,MeshBasicMaterial,MeshStandardMaterial,MeshToonMaterial,RGBAFormat} from 'three';
import type {AnimationName,Expression} from '../CharacterAnimations';
import {animationPose} from '../CharacterAnimations';
const pixels=new Uint8Array(256*4);
for(let i=0;i<256;i++){
 const x=i/255,s=(a:number,b:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 const v=.22+.24*s(.10,.26)+.30*s(.38,.52)+.24*s(.72,.84);
 for(let j=0;j<3;j++)pixels[i*4+j]=Math.round(v*255);pixels[i*4+3]=255;
}
const gradient=new DataTexture(pixels,256,1,RGBAFormat);gradient.minFilter=gradient.magFilter=LinearFilter;gradient.needsUpdate=true;
export function GraphicProtagonist({position=[0,0,0],rotation=0,animation='idle',expression='neutral',actionStart=0,onReady}:{onReady?:()=>void;position?:[number,number,number];rotation?:number;animation?:AnimationName;expression?:Expression;actionStart?:number}){
 const {advance}=useThree();
 const gltf=useLoader(GLTFLoader,staticFile('models/graphic-protagonist.glb'));
 const frame=useCurrentFrame(),{fps}=useVideoConfig();
 const asset=useMemo(()=>{
  const scene=gltf.scene.clone(true);const materials:(MeshToonMaterial|MeshBasicMaterial)[]=[];
  const ink=new MeshBasicMaterial({color:'#141c1e',side:BackSide});
  ink.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed+=normal*.0022;');};ink.customProgramCacheKey=()=> 'graphic-ink-v1';materials.push(ink);
  const meshes:Mesh[]=[];scene.traverse(o=>{if(o instanceof Mesh)meshes.push(o);});
  for(const mesh of meshes){
   const original=(Array.isArray(mesh.material)?mesh.material[0]:mesh.material) as MeshStandardMaterial;
   const material=new MeshToonMaterial({color:original.color.clone(),gradientMap:gradient,side:DoubleSide});
   material.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vPaint;').replace('#include <begin_vertex>','#include <begin_vertex>\nvPaint=position;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vPaint;').replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=.985+.018*sin(vPaint.x*29.+vPaint.y*17.)*sin(vPaint.z*23.-vPaint.y*8.);');};
   if(mesh.name==='Surprise_Mouth')material.color.set('#241b19');
   material.customProgramCacheKey=()=> 'graphic-cel-v1';materials.push(material);mesh.material=material;
   const detail=/Eye|Iris|Pupil|Glint|Lid|Brow|Mouth|Nose_Shadow|Cheek|Finger|Zipper|Lace|Fold|Seam/.test(mesh.name);
   mesh.castShadow=!detail;mesh.receiveShadow=!detail;
   if(!detail&&!/Hair_Lock|Collar/.test(mesh.name)){const outline=new Mesh(mesh.geometry,ink);outline.name='Ink_'+mesh.name;outline.renderOrder=-1;mesh.add(outline);}
  }
  return {scene,materials};
 },[gltf]);
 useEffect(()=>()=>asset.materials.forEach(m=>m.dispose()),[asset]);
 useLayoutEffect(()=>{
  const pose=animationPose(animation,Math.max(0,frame-actionStart),fps);const obj=(name:string)=>asset.scene.getObjectByName(name);
  for(const [suffix,hip,knee,arm,elbow,sign] of [['L',pose.hipL,pose.kneeL,pose.armL,pose.elbowL,-1],['R',pose.hipR,pose.kneeR,pose.armR,pose.elbowR,1]] as const){
   const h=obj('Hip_'+suffix),k=obj('Knee_'+suffix),a=obj('Shoulder_'+suffix),e=obj('Elbow_'+suffix);
   if(h)h.rotation.x=hip;if(k)k.rotation.x=knee;if(a){a.rotation.x=arm;a.rotation.z=sign*pose.spread;}if(e)e.rotation.x=elbow;
   const brow=obj('Brow_'+suffix);if(brow){const worry=expression==='worried'||expression==='afraid';brow.rotation.z=sign*(worry?-.20:expression==='surprised'?.16:0);brow.position.y=.075+(expression==='surprised'?.023:0);}
  }
  const torso=obj('Torso');if(torso)torso.rotation.x=pose.lean;
  const head=obj('Head');if(head){head.rotation.x=pose.headX;head.rotation.y=pose.headY;}
  const root=obj('GraphicProtagonist');if(root)root.position.y=pose.lift-.12;
  const mouth=obj('Mouth');if(mouth){mouth.visible=expression!=='surprised';mouth.scale.y=1+pose.mouth*2;}const openMouth=obj('Surprise_Mouth');if(openMouth)openMouth.visible=expression==='surprised';
 },[asset,animation,expression,frame,fps,actionStart]);
 useEffect(()=>{advance(frame/fps*1000);onReady?.();},[asset,advance,frame,fps,onReady]);
 return <group position={position} rotation={[0,rotation,0]}><primitive object={asset.scene}/></group>;
}
