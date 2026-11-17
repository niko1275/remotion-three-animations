import {useCurrentFrame,useVideoConfig} from 'remotion';
import {CharacterRig} from './CharacterRig';
import {animationPose,blendPose} from './CharacterAnimations';
import type {AnimationName,Expression,RigPose} from './CharacterAnimations';
export type ProtagonistProps={position?:[number,number,number];rotation?:number;animation?:AnimationName;expression?:Expression;lookAt?:[number,number,number];lookWeight?:number;actionStart?:number;blendFrom?:AnimationName;blendFrames?:number;seated?:boolean;poseOverride?:Partial<RigPose>};
export function Protagonist({position=[0,0,0],rotation=0,animation='idle',expression='neutral',lookAt,lookWeight=1,actionStart=0,blendFrom,blendFrames=12,seated=false,poseOverride={}}:ProtagonistProps){
 const frame=useCurrentFrame(),{fps}=useVideoConfig();const local=Math.max(0,frame-actionStart);
 let pose=animationPose(animation,local,fps);
 if(blendFrom)pose=blendPose(animationPose(blendFrom,local,fps),pose,local/Math.max(1,blendFrames));
 if(seated){const sit=animationPose('sit',local,fps);pose={...pose,hipL:sit.hipL,hipR:sit.hipR,kneeL:sit.kneeL,kneeR:sit.kneeR,lift:sit.lift};}
 if(lookAt){const dx=lookAt[0]-position[0],dz=lookAt[2]-position[2];const yaw=Math.atan2(-dx,-dz)-rotation;const targetYaw=Math.max(-.85,Math.min(.85,Math.atan2(Math.sin(yaw),Math.cos(yaw))));const targetPitch=-Math.max(-.3,Math.min(.3,Math.atan2(lookAt[1]-(position[1]+2.3),Math.hypot(dx,dz))));pose.headY+=(targetYaw-pose.headY)*lookWeight;pose.headX+=(targetPitch-pose.headX)*lookWeight;}
 return <group position={position} rotation={[0,rotation,0]}><CharacterRig pose={{...pose,...poseOverride}} expression={expression}/></group>;
}
