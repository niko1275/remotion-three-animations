import {AbsoluteFill,interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {VSMShadowMap} from 'three';
import {Bedroom} from '../components/environments/Bedroom';
import {CinematicLighting,lampPower} from '../components/lighting/CinematicLighting';
import type {LightingMode} from '../components/lighting/CinematicLighting';
import {IsometricCamera} from '../components/cameras/IsometricCamera';
import {Protagonist} from '../components/characters/Protagonist';
import {smooth} from '../components/characters/CharacterAnimations';
import {FilmGrade} from './FilmGrade';
export function BedroomStory({lighting='night'}:{lighting?:LightingMode}){
 const f=useCurrentFrame(),{width,height}=useVideoConfig();
 const sit=smooth((f-180)/30),react=smooth((f-366)/12);
 const segment=smooth((f-90)/40),approach=smooth((f-130)/50);
 const x=3.8-3.15*segment-.05*approach-.98*sit,z=3.5-1.05*segment-1.2*approach;
 const cameraProgress=smooth(f/449),power=lampPower(f,true);
 return <AbsoluteFill style={{background:'#062a2c'}}>
 <ThreeCanvas width={width} height={height} orthographic camera={{position:[8,7.5,10],zoom:90,near:.1,far:60}} shadows={{type:VSMShadowMap}} gl={{antialias:true}}>
 <color attach="background" args={['#062a2c']}/>
 <IsometricCamera zoom={88+cameraProgress*65} target={[-.2-cameraProgress*.2,1.4+cameraProgress*.35,0]} position={[8,8.2,10]}/>
 <CinematicLighting mode={lighting} power={power}/><Bedroom lampPower={power}/>
 {f>=90&&<Protagonist position={[x,0,z]} rotation={interpolate(f,[90,125,145,180,210], [1.25,1.25,0,0,-Math.PI/2],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})} animation={f<180?'walk':f<270?'sit':f<360?'lookAround':'surprise'} actionStart={f<180?90:f<270?180:f<360?270:360} blendFrom={f>=180&&f<210?'idle':undefined} blendFrames={30} seated={f>=210} expression={f>=366?'surprised':f>=270?'worried':'neutral'} lookWeight={smooth((f-270)/18)*smooth((360-f)/12)} lookAt={f>=270&&f<360?[.8,3.18,-2.8]:undefined} poseOverride={f>=180&&f<210?{hipL:1.45*sit,hipR:1.45*sit,kneeL:-1.5*sit,kneeR:-1.5*sit,lift:.3*sit}:f>=360?{armL:1.0*react,armR:1.0*react,elbowL:1.65*react,elbowR:1.65*react}:undefined}/>}
 </ThreeCanvas>
 <FilmGrade/>
 </AbsoluteFill>;
}
