import {useMemo} from 'react';
import {Color, DoubleSide} from 'three';

// Analytic occlusion is stable across frames and avoids stochastic SSAO sampling.
export function ContactShade({position,scale,rotation=[-Math.PI/2,0,0],opacity=.45}: {position:[number,number,number];scale:[number,number,number];rotation?:[number,number,number];opacity?:number}) {
 const uniforms=useMemo(()=>({strength:{value:opacity},tint:{value:new Color('#182228')}}),[opacity]);
 return <mesh position={position} scale={scale} rotation={rotation} renderOrder={2}>
 <planeGeometry/><shaderMaterial transparent depthWrite={false} side={DoubleSide} uniforms={uniforms}
 vertexShader={`varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
 fragmentShader={`varying vec2 vUv; uniform float strength; uniform vec3 tint; void main(){float d=length((vUv-.5)*2.);float a=pow(1.-smoothstep(0.,1.,d),1.5)*strength;gl_FragColor=vec4(tint,a);}`}/></mesh>;
}
export function WorkshopLighting(){return <>
 <ambientLight color="#8cacc3" intensity={.18}/>
 <hemisphereLight args={['#9bb6c8','#302a24',.65]}/>
 <directionalLight position={[-3,6,1]} color="#ffe7ca" intensity={1.8} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-camera-near={.1} shadow-camera-far={20} shadow-normalBias={.035} shadow-bias={-.0001} shadow-radius={6} shadow-blurSamples={12}/>
 <pointLight position={[.3,3,-1.2]} color="#bde0df" intensity={3} distance={4} decay={2}/>
 {[-1.25,.65].map(x=><ContactShade key={x} position={[x,.055,-.05]} scale={[1.1,1.4,1]} opacity={.75}/>)}
 <ContactShade position={[.45,.052,-1.3]} scale={[5.6,3.7,1]} opacity={.5}/>
 <ContactShade position={[0,.06,-2.8]} scale={[8,1.5,1]} opacity={.85}/>
 <ContactShade position={[-3.3,.06,0]} scale={[1.5,7,1]} opacity={.75}/>
 <ContactShade position={[.6,2.4,-2.91]} scale={[5,2.6,1]} rotation={[0,0,0]} opacity={.4}/>
 </>;}
