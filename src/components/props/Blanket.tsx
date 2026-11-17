import {useMemo,useEffect} from 'react';
import {BufferGeometry,Float32BufferAttribute,DoubleSide} from 'three';
export function Blanket(){
 const geometry=useMemo(()=>{const vertices:number[]=[],indices:number[]=[];const cols=20,rows=18;
 for(let v=0;v<=rows;v++)for(let u=0;u<=cols;u++){
 const x=-1.1+(u/cols-.5)*2.4,z=-.35+v/rows*2.16;
 const edge=Math.max(0,(Math.abs(x+1.1)-.93)/.27);
 const y=1.255-edge*.32+Math.sin(u*.8+v*.36)*.025+Math.cos(v*.7)*.012;
 vertices.push(x,y,z+Math.sin(u*.5)*.025*v/rows);
 }
 for(let v=0;v<rows;v++)for(let u=0;u<cols;u++){const a=v*(cols+1)+u;indices.push(a,a+cols+1,a+1,a+1,a+cols+1,a+cols+2);}
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;},[]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color="#8b9f84" roughness={1} side={DoubleSide}/></mesh>;
}
