import {useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {VSMShadowMap, PCFSoftShadowMap} from 'three';
import {FilmGrade} from './FilmGrade';
import {InkBox} from './Ink';
import {PaintedMaterial} from './Painted';
import {WorkshopLighting} from './Atmosphere';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import type {ReactNode} from 'react';

type V = [number, number, number];
export const Box = ({p=[0,0,0], s=[1,1,1], c='#73847d', r=[0,0,0], ink=false,outline=true}: {p?:V;s?:V;c?:string;r?:V;ink?:boolean;outline?:boolean}) => <group position={p} rotation={r}>
  <mesh castShadow receiveShadow><boxGeometry args={s}/>{ink ? <PaintedMaterial color={c}/> : <meshStandardMaterial color={c} roughness={0.9}/>}</mesh>
  {ink && outline && <InkBox size={s}/>}
</group>;
export const Cylinder = ({p=[0,0,0], top=.2, bottom=.2, h=1, c='#66776e', r=[0,0,0], ink=false}: {p?:V;top?:number;bottom?:number;h?:number;c?:string;r?:V;ink?:boolean}) => <mesh position={p} rotation={r} castShadow receiveShadow><cylinderGeometry args={[top,bottom,h,ink?6:12]}/>{ink?<PaintedMaterial color={c}/>:<meshStandardMaterial color={c} roughness={.85}/>}</mesh>;
export const Plant = ({p,ink=false}: {p:V;ink?:boolean}) => <group position={p}><Cylinder top={.19} bottom={.12} h={.28} c="#ab8064" ink={ink}/>{[-1,0,1].map((n)=><mesh key={n} position={[n*.08,.34,0]} rotation={[0,0,n*-.3]} castShadow><coneGeometry args={[.1,.65,4]}/><PaintedMaterial color={n===0?'#82945b':'#526b48'}/></mesh>)}</group>;
const Camera = ({workshop=false}: {workshop?:boolean}) => {
 const {camera}=useThree(); const f=useCurrentFrame();
 useLayoutEffect(()=>{camera.position.set(workshop?6.3:8-f*.001,workshop?12.8:7.5,workshop?9.2:10); camera.lookAt(0,workshop?1.25:1.3,workshop?-.25:0); camera.updateProjectionMatrix();},[camera,f,workshop]);
 return null;
};
export const Stage = ({children, workshop=false}: {children:ReactNode;workshop?:boolean}) => {
 const {width,height}=useVideoConfig();
 return <AbsoluteFill style={{background:workshop?'#202829':'#073b3c'}}><AbsoluteFill style={{filter:workshop?'saturate(.83) contrast(1.035) brightness(1.04)':undefined}}><ThreeCanvas width={width} height={height} orthographic camera={{position:[8,7.5,10],zoom:workshop?190:105,near:.1,far:100}} shadows={{type:workshop?VSMShadowMap:PCFSoftShadowMap}} gl={{antialias:true}}><Camera workshop={workshop}/><color attach="background" args={[workshop?'#202829':'#073b3c']}/>{workshop?<WorkshopLighting/>:<><ambientLight intensity={.38}/><directionalLight position={[-3,8,4]} intensity={.65} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-normalBias={.025}/></>}{children}</ThreeCanvas></AbsoluteFill>{workshop?<FilmGrade/>:<AbsoluteFill style={{pointerEvents:'none',background:'radial-gradient(ellipse at 50% 45%, transparent 38%, rgba(0,10,14,.48) 100%)'}}/>}</AbsoluteFill>;
};
export const Room = ({ink=false}: {ink?:boolean}) => <>
<Box p={[0,-.16,0]} s={[7,.3,6]} c={ink?'#414b49':'#183d3c'} ink={ink}/>
<Box p={[0,1.9,-3]} s={[7,4,.14]} c={ink?'#65706b':'#42716a'} ink={ink}/>
<Box p={[-3.5,1.9,0]} s={[.14,4,6]} c={ink?'#525b56':'#315f5a'} ink={ink}/>
<Box p={[0,.12,-2.88]} s={[7,.2,.12]} c="#263c39"/>
</>;
