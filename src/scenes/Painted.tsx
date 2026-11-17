import {useEffect, useMemo} from 'react';
import {DataTexture, LinearFilter, MeshToonMaterial, RGBAFormat} from 'three';

// A filtered four-value ramp, with no time uniforms or random sampling.
const rampData=new Uint8Array(256*4);
for(let i=0;i<256;i++){
 const x=i/255;const smooth=(a:number,b:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 const value=.28+.24*smooth(.12,.35)+.25*smooth(.4,.65)+.23*smooth(.72,.95);
 for(let j=0;j<3;j++)rampData[i*4+j]=Math.round(value*255);rampData[i*4+3]=255;
}
const gradient=new DataTexture(rampData,256,1,RGBAFormat);gradient.minFilter=LinearFilter;gradient.magFilter=LinearFilter;gradient.needsUpdate=true;
export function PaintedMaterial({color,vertexColors=false}:{color:string;vertexColors?:boolean}){
 const material=useMemo(()=>{
  const m=new MeshToonMaterial({color,gradientMap:gradient,vertexColors});
  m.onBeforeCompile=shader=>{
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 paintPosition; varying vec3 paintNormal;').replace('#include <begin_vertex>','#include <begin_vertex>\npaintPosition=position; paintNormal=normal;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 paintPosition; varying vec3 paintNormal;').replace('#include <color_fragment>',`#include <color_fragment>
    vec3 p=paintPosition;
    float wash=sin(p.x*5.2+p.y*3.1)*sin(p.z*4.3-p.y*2.7);
    float bristle=sin(p.x*86.+sin(p.z*9.)*2.+p.y*14.)*sin(p.z*19.+p.y*6.);
    float facet=dot(normalize(paintNormal),vec3(.021,.037,-.025));
    diffuseColor.rgb*=.96+wash*.045+bristle*.012+facet;
    diffuseColor.rgb=mix(diffuseColor.rgb, diffuseColor.rgb*vec3(.9,.95,1.04),.12*(1.-normalize(paintNormal).y));`);
  };
  m.customProgramCacheKey=()=> 'painted-toon-v1';return m;
 },[color,vertexColors]);
 useEffect(()=>()=>material.dispose(),[material]);
 return <primitive object={material} attach="material"/>;
}
