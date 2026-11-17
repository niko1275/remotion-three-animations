import {AbsoluteFill,useCurrentFrame,useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {VSMShadowMap} from 'three';
import {Protagonist} from '../components/characters/Protagonist';
import type {AnimationName} from '../components/characters/CharacterAnimations';
import {IsometricCamera} from '../components/cameras/IsometricCamera';
import {Box} from './Kit';
export const ACTIONS:AnimationName[]=['idle','walk','sit','talk','think','surprise','fear','lookAround'];
export function CharacterShowcase(){
 const f=useCurrentFrame(),{width,height}=useVideoConfig(),index=Math.min(7,Math.floor(f/90)),animation=ACTIONS[index];
 return <AbsoluteFill style={{background:'#123c38'}}><ThreeCanvas width={width} height={height} orthographic camera={{zoom:230,position:[4,3,7]}} shadows={{type:VSMShadowMap}}><IsometricCamera zoom={230} position={[4,3,7]} target={[0,1.35,0]}/><color attach="background" args={['#123c38']}/><ambientLight intensity={.65} color="#a8c5cb"/><directionalLight position={[-3,6,4]} intensity={2} color="#ffe0ae" castShadow shadow-normalBias={.03}/><Box p={[0,-.08,0]} s={[5,.15,5]} c="#24473b" ink/>{animation==='sit'&&<Box p={[0,1.22,.15]} s={[.9,.12,.8]} c="#657b5b" ink/>}<Protagonist rotation={-2.65} animation={animation} actionStart={index*90} expression={animation==='fear'?'afraid':animation==='surprise'?'surprised':animation==='think'?'worried':'neutral'}/></ThreeCanvas><div style={{position:'absolute',bottom:95,left:65,color:'#dbdac0',fontFamily:'sans-serif',fontSize:44,letterSpacing:3}}>{animation}</div></AbsoluteFill>;
}
