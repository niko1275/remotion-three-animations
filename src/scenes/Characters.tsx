import {InkOutline} from './Ink';
import {PaintedMaterial} from './Painted';
import {useEffect, useMemo} from 'react';
import {BufferGeometry, Float32BufferAttribute, Quaternion, Vector3} from 'three';
import {interpolate, useCurrentFrame} from 'remotion';

type V = [number, number, number];
type Ring = [number, number, number, number?];
// Elliptical cross sections sculpt the silhouette, rather than stacking boxes.
function silhouette(rings: Ring[], sides=12) {
  const vertices:number[]=[]; const indices:number[]=[];
  rings.forEach(([y,w,d,z=0])=>{for(let i=0;i<sides;i++){const a=i/sides*Math.PI*2;const fold=1.+.035*Math.sin(a*3.+y*2.)+.018*Math.cos(a*5.-y*3.);
 vertices.push(Math.cos(a)*w*fold+.009*Math.sin(y*4.),y+.008*Math.sin(a*3.)*w,Math.sin(a)*d*fold+z);}});
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<sides;i++){const a=j*sides+i,b=j*sides+(i+1)%sides;indices.push(a,b,a+sides,b,b+sides,a+sides);}
  for(let i=1;i<sides-1;i++){indices.push(0,i+1,i);const a=(rings.length-1)*sides;indices.push(a,a+i,a+i+1);}
  const geo=new BufferGeometry();geo.setAttribute('position',new Float32BufferAttribute(vertices,3));for(let i=0;i<indices.length;i+=3){const a=indices[i];indices[i]=indices[i+1];indices[i+1]=a;}geo.setIndex(indices);geo.computeVertexNormals();
 const painted=geo.toNonIndexed();geo.dispose();const positions=painted.attributes.position;const colors:number[]=[];
 for(let i=0;i<positions.count;i+=3){const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);const value=.96+.035*Math.sin(x*7.1+y*6.3+z*11.7);for(let j=0;j<3;j++)colors.push(value,value*(1.+.012*Math.sin(y*5.)),value*.985);}
 painted.setAttribute('color',new Float32BufferAttribute(colors,3));return painted;
}
export function Sculpt({rings,color,p=[0,0,0],r=[0,0,0]}:{rings:Ring[];color:string;p?:V;r?:V}) {
  const key=JSON.stringify(rings);
  const geometry=useMemo(()=>silhouette(rings),[key]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <group position={p} rotation={r}><mesh geometry={geometry} castShadow receiveShadow><PaintedMaterial color={color} vertexColors/></mesh><InkOutline geometry={geometry}/></group>;
}
function Limb({a,b,radius,color}:{a:V;b:V;radius:number;color:string}) {
 const start=new Vector3(...a), end=new Vector3(...b), direction=end.clone().sub(start);
 const q=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),direction.clone().normalize());
 return <group position={start.add(end).multiplyScalar(.5)} quaternion={q}><Sculpt rings={[[-direction.length()/2,radius*.75,radius*.8],[0,radius,radius],[direction.length()/2,radius*.85,radius*.85]]} color={color}/></group>;
}
export const Ellipsoid=({p,s,c}:{p:V;s:V;c:string})=><mesh position={p} scale={s} castShadow><sphereGeometry args={[1,12,8]}/><PaintedMaterial color={c}/></mesh>;
export const Character=({p,child=false}:{p:V;child?:boolean})=>{
 const frame=useCurrentFrame(); const t=frame/30;
 // Smooth transitions between writing, explaining, listening and returning to work.
 const smooth=(x:number)=>x*x*(3-2*x);
 const phase=(keys:number[],values:number[])=>interpolate(frame,keys,values,{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:smooth});
 const explain=phase([0,65,95,135,165,239],[0,0,1,1,0,0]);
 const listen=phase([0,80,108,155,185,239],[0,0,1,1,0,0]);
 const nodWindow=phase([0,120,132,170,185,239],[0,0,1,1,0,0]);
 const nod=Math.sin((frame-120)*Math.PI/14)*.13*nodWindow;
 const mix=(a:V,b:V,v:number):V=>a.map((n,i)=>n+(b[i]-n)*v) as V;
 const skin='#d6bda0',coat=child?'#a28b59':'#625044',sleeve=child?'#b29b69':'#846b56';
 const write:V=[.4+Math.sin(t*15)*.065,1.71+Math.sin(t*30)*.009,-.72+Math.cos(t*7)*.035];
 const hand:V=child?mix([.23,1.95,-.43],[.35,1.4,-.2],listen):mix(write,[.68,2.42,-.32],explain);
 const elbow:V=child?mix([.5,1.58,-.05],[.5,1.62,-.02],listen):mix([.64,1.95,-.28],[.8,1.99,-.03],explain);
 const headX=child?.13+nod:.13-explain*.16;
 const headY=child?-.22-listen*.65:.12+explain*.5;
 return <group position={p} scale={child?.8:1} rotation={[.035,Math.sin(t*1.5)*.012+(child?-listen*.16:explain*-.12),0]}>
 {/* Tapered trousers, knees, ankles and shaped shoes */}
 {[-1,1].map(side=><group key={side}>
  <Sculpt p={[side*.18,0,0]} color="#333c37" rings={[[.12,.11,.12],[.43,.13,.14,.025],[.69,.145,.15,-.015],[1.03,.17,.18],[1.23,.18,.17]]}/>
  <Sculpt p={[side*.18,0,-.08]} color="#252b28" rings={[[.035,.145,.29,-.04],[.14,.155,.3,-.05],[.23,.11,.16,.04]]}/>
  <Sculpt p={[side*.18,0,0]} color="#455047" rings={[[.22,.118,.13],[.29,.126,.14],[.32,.123,.14]]}/>
 </group>)}
 {/* Coat has a waist, shoulder line and a flared, asymmetric hem. */}
 <Sculpt color={coat} rings={[[child?.98:.56,.34,.25,.025],[child?1.1:.73,.43,.28],[1.02,.4,.26],[1.2,.36,.25],[1.42,.29,.22],[1.74,.35,.24],[2.03,.43,.22],[2.13,.29,.19]]}/>
 <Sculpt color={child?'#85754d':'#51453c'} p={[0,0,.23]} rings={[[1,.025,.015],[1.4,.018,.018],[1.8,.022,.012]]}/>
 {[-1,1].map(side=><group key={side}><Sculpt color={child?'#968456':'#76604d'} p={[side*.23,1.15,.18]} r={[0,0,side*.14]} rings={[[0,.115,.04],[.2,.13,.045],[.24,.12,.04]]}/><Sculpt color="#a27854" p={[side*.17,1.93,-.16]} r={[.35,0,side*-.45]} rings={[[0,.09,.035],[.25,.12,.06],[.3,.07,.04]]}/></group>)}
 <Sculpt color={skin} rings={[[2.05,.11,.12],[2.25,.13,.12]]}/>
 <group position={[0,2.38,-.025]} rotation={[headX,headY,0]}>
  <Sculpt color={skin} rings={[[-.22,.1,.12,-.04],[-.15,.19,.17,-.04],[.02,.22,.2],[.19,.2,.18],[.25,.12,.12]]}/>
  {[-1,1].map(s=><Ellipsoid key={s} p={[s*.22,-.025,0]} s={[.045,.075,.055]} c={skin}/>)}
  <Ellipsoid p={[0,-.06,-.205]} s={[.05,.055,.075]} c="#c4a587"/>
  <Sculpt color={child?'#725438':'#48392e'} rings={[[.015,.237,.21,.035],[.13,.25,.225,.02],[.26,.21,.18],[.32,.1,.09]]}/>
  {Array.from({length:6},(_,i)=>{const a=i/6*Math.PI*2;return <Sculpt key={i} color={i%2?'#514739':'#5f5140'} p={[Math.cos(a)*.12,.07+Math.sin(a*2)*.025,Math.sin(a)*.105]} r={[Math.sin(a)*.14,0,Math.cos(a)*-.17]} rings={[[-.2,.045,.035],[-.08,.11,.07],[.1,.13,.095],[.2,.065,.045]]}/>;})}
 </group>
 {/* Bent arms: the adult writes while the child holds a hand near the chin. */}
 <Limb a={[.38,1.99,0]} b={elbow} radius={.15} color={sleeve}/><Limb a={elbow} b={hand} radius={.115} color={sleeve}/>
 <Ellipsoid p={hand} s={[.085,.06,.115]} c={skin}/>
 <Ellipsoid p={[hand[0]-.065,hand[1]-.015,hand[2]-.025]} s={[.035,.04,.065]} c={skin}/>
 <Limb a={mix(elbow,hand,.85)} b={mix(elbow,hand,.96)} radius={.105} color={child?'#8c7d53':'#5b4e42'}/>
 {[-1,1].map(side=><Sculpt key={`fold-${side}`} color={child?'#a38f65':'#6b5949'} p={[side*.22,1.45,.205]} r={[0,0,side*.22]} rings={[[0,.006,.008],[.17,.012,.01],[.38,.005,.006]]}/>)}
 <Limb a={[-.38,1.99,0]} b={child?[-.43,1.55,-.05]:[-.43,1.57,-.35]} radius={.14} color={sleeve}/>
 <Limb a={child?[-.43,1.55,-.05]:[-.43,1.57,-.35]} b={child?[.22,1.56,-.23]:[-.2,1.63,-.68]} radius={.105} color={sleeve}/>
 <Ellipsoid p={child?[.22,1.56,-.23]:[-.2,1.63,-.68]} s={[.09,.06,.12]} c={skin}/>
 {!child&&<Limb a={[hand[0],hand[1]-.03,hand[2]-.06]} b={[hand[0]-.13,hand[1]-.11,hand[2]-.18]} radius={.012} color="#dbc593"/>}
 </group>;
};
