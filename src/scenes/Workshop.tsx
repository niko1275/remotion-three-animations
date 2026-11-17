import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Box,Cylinder,Plant,Room,Stage} from './Kit';
import {Character} from './Characters';
export const Workshop = () => {
 const f=useCurrentFrame(); const pulse=1+Math.sin(f*.06)*.035;
 return <><Stage workshop><Room ink/>
 {Array.from({length:7},(_,x)=>Array.from({length:6},(_,z)=><Box key={`${x}-${z}`} p={[-3+x,.015,-2.5+z]} s={[.975,.025,.975]} c={(x+z)%2?'#737f76':'#89938a'} ink/>))}
 {/* Desk and shelves */}
 <Box p={[.45,1.5,-1.35]} s={[4.65,.16,2.1]} c="#a8c7ba" ink/>
 {[-1.65,2.5].map(x=>[-2.1,-.6].map(z=><Box key={`${x}${z}`} p={[x,.75,z]} s={[.12,1.5,.12]} c="#616e60" ink/>))}
 <Box p={[.8,2.45,-2.65]} s={[4,.12,.55]} c="#a0b5a2" ink/>
 <Box p={[.8,3.15,-2.65]} s={[4,.12,.55]} c="#a0b5a2" ink/>
 {[-.8,2.1].map(x=><Box key={x} p={[x,2.4,-2.85]} s={[.08,1.7,.08]} c="#303d35" ink/>)}
 <Plant p={[-1.35,1.78,-1.8]} ink/><Plant p={[2.25,3.35,-2.65]} ink/>
 <Box p={[.9,2.58,-2.6]} s={[1.5,.15,.37]} c="#d5d4ba" ink/>
 {[-.45,0,.45].map(x=><group key={x} position={[.9+x,2.7,-2.6]} scale={.55}><Plant p={[0,0,0]} ink/></group>)}
 {/* Open notebook, tool, cup */}
 <Box p={[.5,1.61,-.85]} s={[1.05,.04,.72]} c="#e3e5c9" ink r={[0,.1,0]}/>
 <Box p={[.5,1.64,-.85]} s={[.018,.01,.66]} c="#7c8f7b"/>
 {[0,1,2,3].map(i=><Box key={i} p={[.77,1.644,-1.07+i*.12]} s={[.32,.008,.015]} c="#8c9a8a"/>)}
 <Cylinder p={[2,1.78,-.65]} top={.14} bottom={.12} h={.35} c="#dae2d2" ink/>
 <Cylinder p={[2,1.96,-.65]} top={.108} bottom={.108} h={.006} c="#39483d" ink/>
 <Box p={[-.4,1.64,-1]} s={[.45,.055,.04]} c="#845f36" ink r={[0,.5,0]}/>
 {/* Storage and back door */}
 <Box p={[-3.35,1.55,-1.5]} s={[.12,3.1,1.8]} c="#29352f" ink/>
 {Array.from({length:7},(_,i)=><Box key={i} p={[-3.25,.35+i*.4,-1.5]} s={[.07,.035,1.65]} c="#182622" ink/>)}
 {[[ -2.6,.55,-2.3],[-2.5,1.4,-2.3],[-2.4,2.15,-2.3]].map((p,i)=><Box key={i} p={p as [number,number,number]} s={[1,.7,.85]} c={['#72705a','#8a8669','#676a58'][i]} ink r={[0,i*.12,0]}/>)}
 <Character p={[.65,0,-.12]}/><Character p={[-1.25,0,-.15]} child/>
 <pointLight position={[-1.8,2,1]} color="#ffbd59" intensity={5} distance={4}/>
 </Stage>
 <AbsoluteFill style={{pointerEvents:'none'}}><div style={{position:'absolute',left:'13%',top:'23%',transform:`scale(${pulse})`,width:120,height:120,borderRadius:'50%',background:'radial-gradient(circle, #ffbf4560, #f79b2220 60%, transparent 72%)',filter:'drop-shadow(0 0 18px #ffab32)'}}>
 <svg viewBox="0 0 120 120" width="120" height="120" fill="none" stroke="#fff3bd" strokeWidth="3.5" strokeLinecap="round"><circle cx="60" cy="60" r="48" stroke="#bd7c2d" strokeWidth="2" opacity=".6"/><path d="M47 63 C27 39 47 22 60 25 C80 23 92 43 74 63 L72 76 H49 Z M50 82 H71 M53 89 H68 M58 70 L52 45 L60 51 L68 44 L64 70"/>{Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return <path key={i} d={`M${60+Math.cos(a)*38} ${48+Math.sin(a)*38} l${Math.cos(a)*7} ${Math.sin(a)*7}`}/>;})}</svg>
 </div></AbsoluteFill></>;
};
