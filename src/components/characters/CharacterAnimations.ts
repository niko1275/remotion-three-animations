export type AnimationName='idle'|'walk'|'sit'|'talk'|'think'|'surprise'|'fear'|'lookAround';
export type Expression='neutral'|'worried'|'happy'|'surprised'|'afraid';
export type RigPose={hipL:number;hipR:number;kneeL:number;kneeR:number;armL:number;armR:number;elbowL:number;elbowR:number;headX:number;headY:number;lean:number;lift:number;spread:number;mouth:number};
export const smooth=(value:number)=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
export function animationPose(animation:AnimationName,frame:number,fps=30):RigPose{
 const t=frame/fps, cycle=t*Math.PI*2*1.25;
 const p:RigPose={hipL:0,hipR:0,kneeL:.035,kneeR:.035,armL:.05,armR:.05,elbowL:.12,elbowR:.12,headX:Math.sin(t*1.1)*.025,headY:Math.sin(t*.7)*.04,lean:0,lift:Math.sin(t*2)*.012,spread:.05,mouth:0};
 switch(animation){
 case 'walk':p.hipL=Math.sin(cycle)*.48;p.hipR=-p.hipL;p.kneeL=-Math.max(0,-Math.sin(cycle))*.65;p.kneeR=-Math.max(0,Math.sin(cycle))*.65;p.armL=-p.hipL*.65;p.armR=-p.hipR*.65;p.lift=Math.abs(Math.sin(cycle))*.035;break;
 case 'sit':p.hipL=p.hipR=1.45;p.kneeL=p.kneeR=-1.5;p.armL=p.armR=.45;p.elbowL=p.elbowR=.75;p.lift=.3;p.lean=.055;break;
 case 'talk':p.armR=.35+Math.sin(t*3)*.15;p.elbowR=.9;p.headY=Math.sin(t*1.5)*.1;p.mouth=Math.abs(Math.sin(t*10));break;
 case 'think':p.armR=1.25;p.elbowR=2.0;p.headX=.18;p.headY=-.2;break;
 case 'surprise':{const v=smooth(frame/8);p.armL=p.armR=1.0*v;p.elbowL=p.elbowR=1.65*v;p.spread=.35*v;p.headX=-.18*v;p.lean=-.12*v;p.mouth=v;break;}
 case 'fear':p.armL=p.armR=.8;p.elbowL=p.elbowR=1.9;p.headX=.12;p.headY=Math.sin(t*3)*.12;p.lean=.12;p.spread=.2;break;
 case 'lookAround':p.headY=Math.sin(t*1.5)*.65;p.headX=.03+Math.sin(t*1.2)*.08;break;
 }
 return p;
}
export function blendPose(a:RigPose,b:RigPose,amount:number):RigPose{
 const t=smooth(amount);return Object.fromEntries(Object.keys(a).map(k=>{const key=k as keyof RigPose;return [key,a[key]+(b[key]-a[key])*t];})) as RigPose;
}
