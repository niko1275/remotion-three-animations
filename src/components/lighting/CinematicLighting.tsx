import {ContactShade} from '../../scenes/Atmosphere';
export type LightingMode='normal'|'night'|'red'|'single';
export function lampPower(frame:number,flicker=false){
 if(!flicker||frame<360)return 1;
 // Deliberate, repeatable interruptions, with short ramps to avoid frame noise.
 const t=frame-360;
 const dip=(at:number,width:number)=>Math.max(0,1-Math.abs(t-at)/width);
 return Math.max(.08,1-.92*dip(9,3)-.8*dip(22,4)-.93*dip(45,3)-.7*dip(60,5));
}
export function CinematicLighting({mode='night',power=1}:{mode?:LightingMode;power?:number}){
 const single=mode==='single';
 return <>
 {!single&&<><ambientLight color={mode==='red'?'#763846':'#82aab2'} intensity={mode==='normal'?.55:.16}/><hemisphereLight args={['#9fbdbe','#132e2a',mode==='normal'?.7:.25]}/><directionalLight position={[-4,6,-1]} color={mode==='red'?'#d65b4b':'#a8d2c4'} intensity={mode==='normal'?1.5:.45} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-camera-far={20} shadow-normalBias={.035} shadow-radius={5} shadow-blurSamples={8}/></>}
 <pointLight position={[.85,2,-1.55]} color={mode==='red'?'#fa4b32':'#ffe0a0'} intensity={(single?24:19)*power} distance={7} decay={2} castShadow shadow-mapSize={[512,512]} shadow-bias={-.0004} shadow-normalBias={.025}/>
 <ContactShade position={[-1.1,.035,.2]} scale={[3.1,4.6,1]} opacity={.75}/>
 <ContactShade position={[.85,.035,-1.55]} scale={[1.6,1.4,1]} opacity={.7}/>
 <ContactShade position={[0,.035,-2.85]} scale={[7.6,1.4,1]} opacity={.8}/>
 <ContactShade position={[-3.35,.035,0]} scale={[1.3,6,1]} opacity={.7}/>
 </>;
}
