import {useCurrentFrame} from 'remotion';
import {Box,Cylinder,Plant,Room,Stage} from './Kit';

export const Hospital = () => {
 const f=useCurrentFrame();
 return <Stage><Room/>
 {/* Bed frame, mattress and folded linen */}
 <Box p={[-1.1,.65,.2]} s={[2.1,.16,3.6]} c="#244944"/>
 <Box p={[-1.1,.91,.2]} s={[2,.4,3.5]} c="#b6baa0"/>
 <Box p={[-1.1,1.15,-.9]} s={[1.6,.22,.65]} c="#d1d0ac" r={[.08,0,0]}/>
 <Box p={[-1.1,1.15,.65]} s={[2.03,.18,2]} c="#8caa97"/>
 {Array.from({length:9},(_,i)=><Box key={i} p={[-2+i*.225,1.257,.65]} s={[.035,.025,2]} c="#829f8b"/>)}
 {[-2.15,-.05].map(x=>[-1.65,2].map(z=><group key={`${x},${z}`}><Cylinder p={[x,.75,z]} h={1.5} top={.045} bottom={.045} c="#42655c"/><Cylinder p={[x,.27,z]} h={.18} top={.1} bottom={.1} c="#1b302e"/></group>))}
 {[-1.65,2].map(z=><group key={z}><Cylinder p={[-1.1,1.5,z]} h={2.1} top={.045} bottom={.045} r={[0,0,Math.PI/2]} c="#42655c"/><Box p={[-1.1,.95,z]} s={[2.1,.12,.08]} c="#42655c"/></group>)}
 {/* Window and softly moving pleated curtain */}
 <Box p={[-3.4,2.25,-.9]} s={[.05,2.55,1.7]} c="#8eb5a3"/>
 <Box p={[-3.34,2.25,-.9]} s={[.07,2.6,.055]} c="#345951"/>
 {Array.from({length:12},(_,i)=><Box key={i} p={[-3.19+Math.sin(f*.035+i)*.025,2.12,-1.7+i*.14]} s={[.09,2.85,.17]} c={i%2?'#305f59':'#3b7068'}/>)}
 <Cylinder p={[-3.16,3.65,-.9]} h={2.05} top={.035} bottom={.035} r={[Math.PI/2,0,0]} c="#1f3936"/>
 {/* Nightstand and warm bedside lamp */}
 <Box p={[.85,.68,-1.55]} s={[1.05,1.35,.85]} c="#344c3c"/>
 {[.25,.65,1.05].map(y=><group key={y}><Box p={[.85,y,-1.105]} s={[.92,.32,.045]} c="#405847"/><Box p={[.85,y,-1.065]} s={[.25,.035,.035]} c="#8e9472"/></group>)}
 <Cylinder p={[.85,1.4,-1.55]} top={.22} bottom={.25} h={.07} c="#65694b"/>
 <Cylinder p={[.85,1.72,-1.55]} top={.035} bottom={.035} h={.62} c="#65694b"/>
 <Cylinder p={[.85,2.1,-1.55]} top={.2} bottom={.4} h={.5} c="#f9e6ac"/>
 <pointLight position={[.85,2,-1.55]} color="#ffe3a0" intensity={15+Math.sin(f*.045)*.4} distance={6} decay={2} castShadow shadow-bias={-.001}/>
 {/* IV stand */}
 <Cylinder p={[.3,1.4,.8]} h={2.8} top={.025} bottom={.025} c="#7d9990"/>
 <Box p={[.3,.08,.8]} s={[.8,.06,.08]} c="#55736a"/><Box p={[.3,.08,.8]} s={[.08,.06,.8]} c="#55736a"/>
 <Box p={[.3,2.8,.8]} s={[.65,.035,.035]} c="#7d9990"/><Box p={[.55,2.42,.8]} s={[.25,.45,.1]} c="#b6ccc0"/>
 <Cylinder p={[.55,1.7,.8]} h={1} top={.009} bottom={.009} c="#b3cbbb"/>
 {/* Sink, mirror and clock */}
 <Box p={[2.35,2.35,-2.86]} s={[1.2,1.3,.1]} c="#193b39"/>
 <Box p={[2.35,2.35,-2.79]} s={[1.05,1.15,.035]} c="#507a75"/>
 <Box p={[2.35,1.3,-2.43]} s={[1.3,.18,.85]} c="#8baba0"/>
 <Box p={[2.35,1.41,-2.35]} s={[.9,.04,.5]} c="#4b7469"/>
 <Cylinder p={[2.35,1.58,-2.68]} top={.035} bottom={.035} h={.35} c="#8ca798"/>
 <Cylinder p={[.8,3.18,-2.84]} top={.32} bottom={.32} h={.09} r={[Math.PI/2,0,0]} c="#243d39"/>
 <Cylinder p={[.8,3.18,-2.78]} top={.265} bottom={.265} h={.02} r={[Math.PI/2,0,0]} c="#c1c3a1"/>
 <Box p={[.8,3.25,-2.75]} s={[.025,.18,.02]} c="#304c43" r={[0,0,-.5]}/><Box p={[.88,3.18,-2.75]} s={[.18,.02,.02]} c="#304c43"/>
 <Box p={[-1.3,2.8,-2.86]} s={[1.5,1,.1]} c="#27443c"/><Box p={[-1.3,2.8,-2.79]} s={[1.32,.82,.035]} c="#52776c"/>
 <Plant p={[-2.9,.4,-2.2]}/>
 {/* Visitor chair */}
 <group position={[1.8,0,1.6]} rotation={[0,-.3,0]}><Box p={[0,.6,0]} s={[.8,.12,.75]} c="#47765c"/><Box p={[0,1.05,-.32]} s={[.8,.75,.1]} c="#47765c"/>{[-.3,.3].map(x=>[-.25,.25].map(z=><Cylinder key={`${x}${z}`} p={[x,.3,z]} h={.6} top={.025} bottom={.025} c="#57766a"/>))}</group>
 <Cylinder p={[2.8,.3,-1.15]} top={.25} bottom={.2} h={.6} c="#517b66"/>
 {Array.from({length:28},(_,i)=><mesh key={i} position={[Math.sin(i*12.3)*2.8,.4+((i*.19+f*.002)%3),Math.cos(i*5.7)*2.4]}><sphereGeometry args={[.009,4,4]}/><meshBasicMaterial color="#dddeb5" transparent opacity={.25}/></mesh>)}
 </Stage>;
};
