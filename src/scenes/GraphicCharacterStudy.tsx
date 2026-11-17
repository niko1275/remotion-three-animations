import {Suspense,useState,useCallback} from 'react';
import {AbsoluteFill,delayRender,continueRender,useCurrentFrame,useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {VSMShadowMap} from 'three';
import {GraphicProtagonist} from '../components/characters/graphic/GraphicProtagonist';
import {IsometricCamera} from '../components/cameras/IsometricCamera';
import {ContactShade} from './Atmosphere';
import {FilmGrade} from './FilmGrade';
export function GraphicCharacterStudy({view='body',expression='neutral'}:{view?:'body'|'face'|'profile'|'back';expression?:'neutral'|'worried'|'surprised'}){
 const [loadHandle]=useState(()=>delayRender('Loading graphic protagonist GLB'));
 const ready=useCallback(()=>continueRender(loadHandle),[loadHandle]);
 const {width,height}=useVideoConfig(),f=useCurrentFrame();const close=view==='face';
 const angle=view==='profile'?Math.PI/2:view==='back'?Math.PI:0;
 return <AbsoluteFill style={{background:'#0a272a'}}><ThreeCanvas width={width} height={height} orthographic camera={{position:[4,3,7],zoom:150,near:.1,far:60}} shadows={{type:VSMShadowMap}} gl={{antialias:true}}>
 <color attach="background" args={['#0a272a']}/>
 <IsometricCamera position={close?[2,2.7,-7]:[3.5,3.1,-8]} target={close?[0,2.24,0]:[0,1.4,0]} zoom={close?1500:430}/>
 <ambientLight color="#7babb8" intensity={.14}/><hemisphereLight args={['#8bb9c0','#1c2b2a',.35]}/>
 <directionalLight position={[-3,4,-1.8]} color="#ffe0ac" intensity={2.4} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={4} shadow-camera-bottom={-2} shadow-normalBias={.008} shadow-radius={4} shadow-blurSamples={8}/>
 <directionalLight position={[2,3,2]} color="#85c0be" intensity={1.0}/>
 {!close&&<><mesh position={[0,-.01,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#163b39" roughness={1}/></mesh>
 <ContactShade position={[0,.003,0]} scale={[1.4,1.4,1]} opacity={.55}/></>}
 <Suspense fallback={null}><GraphicProtagonist onReady={ready} rotation={angle} expression={expression} animation={expression==='surprised'?'surprise':'idle'}/></Suspense>
 </ThreeCanvas><FilmGrade/>
 <div style={{position:'absolute',left:50,top:45,color:'#d7cfad',fontFamily:'sans-serif',fontSize:22,letterSpacing:3}}>B / NOVELA GRÁFICA · MISTERIO</div>
 <div style={{position:'absolute',left:50,bottom:45,color:'#9fb6aa',fontFamily:'sans-serif',fontSize:16,letterSpacing:2}}>ESTUDIO 3D · {view.toUpperCase()} · {expression.toUpperCase()}</div>
 </AbsoluteFill>;
}
