import {useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {BoxGeometry} from 'three';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import type {ReactNode} from 'react';

type V = [number, number, number];
export const Box = ({p=[0,0,0], s=[1,1,1], c='#73847d', r=[0,0,0], ink=false}: {p?:V;s?:V;c?:string;r?:V;ink?:boolean}) => <group position={p} rotation={r}>
  <mesh castShadow receiveShadow><boxGeometry args={s}/>{ink ? <meshToonMaterial color={c}/> : <meshStandardMaterial color={c} roughness={0.9}/>}</mesh>
  {ink && <lineSegments><edgesGeometry args={[new BoxGeometry(...s)]}/><lineBasicMaterial color="#202b2a"/></lineSegments>}
</group>;
export const Cylinder = ({p=[0,0,0], top=.2, bottom=.2, h=1, c='#66776e', r=[0,0,0], ink=false}: {p?:V;top?:number;bottom?:number;h?:number;c?:string;r?:V;ink?:boolean}) => <mesh position={p} rotation={r} castShadow receiveShadow><cylinderGeometry args={[top,bottom,h,ink?6:12]}/>{ink?<meshToonMaterial color={c}/>:<meshStandardMaterial color={c} roughness={.85}/>}</mesh>;
export const Plant = ({p,ink=false}: {p:V;ink?:boolean}) => <group position={p}><Cylinder top={.19} bottom={.12} h={.28} c="#ab8064" ink={ink}/>{[-1,0,1].map((n)=><mesh key={n} position={[n*.08,.34,0]} rotation={[0,0,n*-.3]} castShadow><coneGeometry args={[.1,.65,4]}/><meshToonMaterial color={n===0?'#8baf61':'#5f8149'}/></mesh>)}</group>;
const Camera = () => {
 const {camera}=useThree(); const f=useCurrentFrame();
 useLayoutEffect(()=>{camera.position.set(8-f*.001,7.5,10); camera.lookAt(0,1.3,0); camera.updateProjectionMatrix();},[camera,f]);
 return null;
};
export const Stage = ({children, workshop=false}: {children:ReactNode;workshop?:boolean}) => {
 const {width,height}=useVideoConfig();
 return <AbsoluteFill style={{background:workshop?'#202829':'#073b3c'}}><ThreeCanvas width={width} height={height} orthographic camera={{position:[8,7.5,10],zoom:105,near:.1,far:100}} shadows gl={{antialias:true}}><Camera/><color attach="background" args={[workshop?'#202829':'#073b3c']}/><ambientLight intensity={workshop?.65:.38}/><directionalLight position={[-3,8,4]} intensity={workshop?2:0.65} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-normalBias={.025}/>{children}</ThreeCanvas><AbsoluteFill style={{pointerEvents:'none',background:'radial-gradient(ellipse at 50% 45%, transparent 38%, rgba(0,10,14,.48) 100%)'}}/></AbsoluteFill>;
};
export const Room = ({ink=false}: {ink?:boolean}) => <>
<Box p={[0,-.16,0]} s={[7,.3,6]} c={ink?'#414b49':'#183d3c'} ink={ink}/>
<Box p={[0,1.9,-3]} s={[7,4,.14]} c={ink?'#65706b':'#42716a'} ink={ink}/>
<Box p={[-3.5,1.9,0]} s={[.14,4,6]} c={ink?'#525b56':'#315f5a'} ink={ink}/>
<Box p={[0,.12,-2.88]} s={[7,.2,.12]} c="#263c39"/>
</>;
