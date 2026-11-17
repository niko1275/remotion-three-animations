import {useMemo} from 'react';
import {BackSide, BufferGeometry, Float32BufferAttribute, Quaternion, Vector3} from 'three';
import {useCurrentFrame} from 'remotion';

type V = [number, number, number];
type Ring = [number, number, number, number?];
// Elliptical cross sections sculpt the silhouette, rather than stacking boxes.
function silhouette(rings: Ring[], sides=12) {
  const vertices:number[]=[]; const indices:number[]=[];
  rings.forEach(([y,w,d,z=0])=>{for(let i=0;i<sides;i++){const a=i/sides*Math.PI*2;vertices.push(Math.cos(a)*w,y,Math.sin(a)*d+z);}});
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<sides;i++){const a=j*sides+i,b=j*sides+(i+1)%sides;indices.push(a,b,a+sides,b,b+sides,a+sides);}
  for(let i=1;i<sides-1;i++){indices.push(0,i+1,i);const a=(rings.length-1)*sides;indices.push(a,a+i,a+i+1);}
  const geo=new BufferGeometry();geo.setAttribute('position',new Float32BufferAttribute(vertices,3));for(let i=0;i<indices.length;i+=3){const a=indices[i];indices[i]=indices[i+1];indices[i+1]=a;}geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
function Sculpt({rings,color,p=[0,0,0],r=[0,0,0]}:{rings:Ring[];color:string;p?:V;r?:V}) {
  const key=JSON.stringify(rings);
  const geometry=useMemo(()=>silhouette(rings),[key]);
  return <group position={p} rotation={r}><mesh geometry={geometry} castShadow receiveShadow><meshToonMaterial color={color}/></mesh><mesh geometry={geometry} scale={1.025}><meshBasicMaterial color="#242825" side={BackSide}/></mesh></group>;
}
function Limb({a,b,radius,color}:{a:V;b:V;radius:number;color:string}) {
 const start=new Vector3(...a), end=new Vector3(...b), direction=end.clone().sub(start);
 const q=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),direction.clone().normalize());
 return <group position={start.add(end).multiplyScalar(.5)} quaternion={q}><Sculpt rings={[[-direction.length()/2,radius*.75,radius*.8],[0,radius,radius],[direction.length()/2,radius*.85,radius*.85]]} color={color}/></group>;
}
const Ellipsoid=({p,s,c}:{p:V;s:V;c:string})=><mesh position={p} scale={s} castShadow><sphereGeometry args={[1,12,8]}/><meshToonMaterial color={c}/></mesh>;
export const Character=({p,child=false}:{p:V;child?:boolean})=>{
 const frame=useCurrentFrame(); const t=frame/30; const sway=Math.sin(t*1.5)*.015;
 const skin='#d6bda0',coat=child?'#c18b43':'#73503f',sleeve=child?'#cc9951':'#936447';
 const hand:V=child?[.23,1.95,-.43]:[.4+Math.sin(t*3)*.035,1.71,-.72];
 const elbow:V=child?[.5,1.58,-.05]:[.64,1.95,-.28];
 return <group position={p} scale={child?.8:1} rotation={[.035,sway,0]}>
 {/* Tapered trousers, knees, ankles and shaped shoes */}
 {[-1,1].map(side=><group key={side}>
  <Sculpt p={[side*.18,0,0]} color="#333c37" rings={[[.12,.11,.12],[.43,.13,.14,.025],[.69,.145,.15,-.015],[1.03,.17,.18],[1.23,.18,.17]]}/>
  <Sculpt p={[side*.18,0,-.08]} color="#252b28" rings={[[.035,.145,.29,-.04],[.14,.155,.3,-.05],[.23,.11,.16,.04]]}/>
  <Sculpt p={[side*.18,0,0]} color="#455047" rings={[[.22,.118,.13],[.29,.126,.14],[.32,.123,.14]]}/>
 </group>)}
 {/* Coat has a waist, shoulder line and a flared, asymmetric hem. */}
 <Sculpt color={coat} rings={[[.88,.34,.23,.025],[1.02,.41,.27],[1.2,.37,.25],[1.42,.29,.22],[1.74,.35,.24],[2.03,.43,.22],[2.13,.29,.19]]}/>
 <Sculpt color={child?'#a27335':'#5b4033'} p={[0,0,.23]} rings={[[1,.025,.015],[1.4,.018,.018],[1.8,.022,.012]]}/>
 {[-1,1].map(side=><group key={side}><Sculpt color={child?'#b0803b':'#825a42'} p={[side*.23,1.15,.18]} r={[0,0,side*.14]} rings={[[0,.115,.04],[.2,.13,.045],[.24,.12,.04]]}/><Sculpt color="#a27854" p={[side*.17,1.93,-.16]} r={[.35,0,side*-.45]} rings={[[0,.09,.035],[.25,.12,.06],[.3,.07,.04]]}/></group>)}
 <Sculpt color={skin} rings={[[2.05,.11,.12],[2.25,.13,.12]]}/>
 <group position={[0,2.38,-.025]} rotation={[.13+Math.sin(t*1.3)*.025,child?-.22:.12,0]}>
  <Sculpt color={skin} rings={[[-.22,.1,.12,-.04],[-.15,.19,.17,-.04],[.02,.22,.2],[.19,.2,.18],[.25,.12,.12]]}/>
  {[-1,1].map(s=><Ellipsoid key={s} p={[s*.22,-.025,0]} s={[.045,.075,.055]} c={skin}/>)}
  <Ellipsoid p={[0,-.06,-.205]} s={[.05,.055,.075]} c="#c4a587"/>
  <Sculpt color={child?'#725438':'#48392e'} rings={[[.015,.237,.21,.035],[.13,.25,.225,.02],[.26,.21,.18],[.32,.1,.09]]}/>
  {Array.from({length:9},(_,i)=>{const a=i/9*Math.PI*2;return <Sculpt key={i} color={i%2?'#574333':'#654b36'} p={[Math.cos(a)*.18,.08,Math.sin(a)*.16]} r={[Math.sin(a)*.14,0,Math.cos(a)*-.17]} rings={[[-.15,.055,.045],[.04,.075,.055],[.17,.045,.04]]}/>;})}
 </group>
 {/* Bent arms: the adult writes while the child holds a hand near the chin. */}
 <Limb a={[.38,1.99,0]} b={elbow} radius={.15} color={sleeve}/><Limb a={elbow} b={hand} radius={.115} color={sleeve}/>
 <Ellipsoid p={hand} s={[.095,.065,.115]} c={skin}/>
 <Limb a={[-.38,1.99,0]} b={child?[-.43,1.55,-.05]:[-.43,1.57,-.35]} radius={.14} color={sleeve}/>
 <Limb a={child?[-.43,1.55,-.05]:[-.43,1.57,-.35]} b={child?[.22,1.56,-.23]:[-.2,1.63,-.68]} radius={.105} color={sleeve}/>
 <Ellipsoid p={child?[.22,1.56,-.23]:[-.2,1.63,-.68]} s={[.09,.06,.12]} c={skin}/>
 {!child&&<Limb a={[hand[0],hand[1]-.03,hand[2]-.06]} b={[hand[0]-.13,1.6,hand[2]-.18]} radius={.012} color="#dbc593"/>}
 </group>;
};
