import {Sculpt,Ellipsoid} from '../../scenes/Characters';
import {PaintedMaterial} from '../../scenes/Painted';
import type {RigPose,Expression} from './CharacterAnimations';
const skin='#c5b496',jacket='#344e43',trim='#4a6352',pants='#28332f';
function Hand(){return <><Ellipsoid p={[0,-.045,0]} s={[.073,.105,.055]} c={skin}/><Ellipsoid p={[-.06,-.015,-.018]} s={[.03,.055,.035]} c={skin}/></>;}
export function CharacterRig({pose,expression='neutral'}:{pose:RigPose;expression?:Expression}){
 const worried=expression==='worried'||expression==='afraid';const surprised=expression==='surprised'||expression==='afraid';
 return <group position={[0,pose.lift,0]}>
 {[-1,1].map(side=><group key={`leg${side}`} position={[side*.17,1.08,0]} rotation={[side<0?pose.hipL:pose.hipR,0,0]}>
  <Sculpt color={pants} rings={[[-.52,.12,.13],[-.25,.15,.16],[0,.17,.17]]}/>
  <group position={[0,-.52,0]} rotation={[side<0?pose.kneeL:pose.kneeR,0,0]}><Sculpt color="#2c3731" rings={[[-.42,.105,.11],[-.22,.12,.13],[0,.12,.13]]}/><Sculpt p={[0,-.48,-.07]} color="#202925" rings={[[-.04,.135,.25,-.055],[.08,.14,.25,-.05],[.17,.1,.12,.03]]}/></group>
 </group>)}
 <group position={[0,1.08,0]} rotation={[pose.lean,0,0]}>
 <Sculpt color={jacket} rings={[[-.12,.31,.23],[.02,.33,.24],[.24,.28,.21],[.63,.33,.21],[.87,.38,.19],[.94,.23,.17]]}/>
 <Sculpt p={[0,0,.225]} color="#293e36" rings={[[.04,.012,.01],[.4,.014,.014],[.78,.01,.01]]}/>
 {[-1,1].map(side=><group key={`details${side}`}><Sculpt p={[side*.2,.16,.185]} color={trim} rings={[[0,.095,.035],[.14,.11,.045],[.18,.1,.035]]}/><Sculpt p={[side*.15,.76,-.15]} r={[.2,0,side*-.35]} color={trim} rings={[[0,.065,.025],[.2,.09,.04],[.25,.05,.025]]}/></group>)}
 {[-1,1].map(side=><group key={`arm${side}`} position={[side*.34,.8,0]} rotation={[side<0?pose.armL:pose.armR,0,side*pose.spread]}>
 <Sculpt color={jacket} rings={[[-.4,.1,.1],[-.19,.14,.14],[0,.14,.14]]}/>
 <group position={[0,-.39,0]} rotation={[side<0?pose.elbowL:pose.elbowR,0,0]}><Sculpt color={trim} rings={[[-.34,.08,.09],[-.15,.1,.11],[0,.105,.105]]}/><group position={[0,-.39,0]}><Hand/></group></group>
 </group>)}
 <Sculpt color={skin} rings={[[.9,.105,.1],[1.1,.12,.11]]}/>
 <group position={[0,1.23,-.015]} rotation={[pose.headX,pose.headY,0]}>
 <Sculpt color={skin} rings={[[-.2,.09,.1,-.035],[-.13,.17,.15,-.035],[.04,.205,.19],[.19,.19,.17],[.25,.12,.1]]}/>
 {[-1,1].map(side=><group key={`face${side}`}><Ellipsoid p={[side*.205,0,0]} s={[.035,.06,.045]} c={skin}/><Ellipsoid p={[side*.075,.015,-.174]} s={[.018,surprised?.03:.018,.012]} c="#242d29"/><mesh position={[side*.075,worried?.075:.08,-.17]} rotation={[0,0,side*(worried?.24:surprised?-.25:0)]}><boxGeometry args={[.08,.014,.014]}/><PaintedMaterial color="#3a3930"/></mesh></group>)}
 <Ellipsoid p={[0,-.04,-.192]} s={[.035,.045,.045]} c="#b5a283"/>
 <Ellipsoid p={[0,-.115,-.167]} s={[surprised?.035:.04,.008+pose.mouth*.023,.012]} c="#625346"/>
 <Sculpt color="#292f29" rings={[[.04,.218,.193,.01],[.17,.226,.19],[.28,.17,.135],[.32,.08,.07]]}/>
 {Array.from({length:6},(_,i)=>{const a=i/6*Math.PI*2;return <Sculpt key={i} color={i%2?'#333b31':'#3b4032'} p={[Math.cos(a)*.13,.07,Math.sin(a)*.11]} r={[Math.sin(a)*.15,0,Math.cos(a)*-.14]} rings={[[-.16,.035,.03],[.02,.1,.07],[.16,.08,.06],[.2,.03,.025]]}/>;})}
 </group>
 </group>
 </group>;
}
