import {useMemo,useEffect} from 'react';
import {BufferGeometry,Float32BufferAttribute,DoubleSide} from 'three';
import {useCurrentFrame} from 'remotion';
import {Box,Cylinder} from '../../scenes/Kit';
import {PaintedMaterial} from '../../scenes/Painted';
function Curtain({offset}:{offset:number}){
 const frame=useCurrentFrame();
 const geometry=useMemo(()=>{
  const p:number[]=[],indices:number[]=[];const cols=24,rows=6;
  for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){
   const u=x/cols,v=y/rows;
   const ripple=Math.sin(u*Math.PI*10)*.065+Math.sin(frame*.028+u*5)*.018*v;
   p.push(-3.16+ripple,3.54-v*2.8+Math.cos(u*10)*.018,offset+u*.7);
  }
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*(cols+1)+x;indices.push(a,a+1,a+cols+1,a+1,a+cols+2,a+cols+1);}
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();return g;
 },[frame,offset]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color="#315c56" roughness={1} side={DoubleSide}/></mesh>;
}
export function Window(){return <>
 <Box p={[-3.39,2.25,-.9]} s={[.045,2.6,1.8]} c="#1c423e" ink/>
 <Box p={[-3.35,2.25,-.9]} s={[.03,2.4,1.6]} c="#739e91"/>
 <Box p={[-3.3,2.25,-.9]} s={[.07,2.6,.06]} c="#31574e" ink/>
 <Box p={[-3.3,2.25,-.9]} s={[.07,.06,1.8]} c="#31574e" ink/>
 <Curtain offset={-1.75}/><Curtain offset={-.72}/>
 <Cylinder p={[-3.16,3.65,-.9]} h={2.05} top={.035} bottom={.035} r={[Math.PI/2,0,0]} c="#1f3936" ink/>
 </>;}
