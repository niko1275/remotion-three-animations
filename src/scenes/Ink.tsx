import {useEffect, useMemo} from 'react';
import {BackSide, BoxGeometry, EdgesGeometry, MeshBasicMaterial} from 'three';
import type {BufferGeometry} from 'three';
export function InkOutline({geometry,width=.008}:{geometry:BufferGeometry;width?:number}) {
 const material=useMemo(()=>{const m=new MeshBasicMaterial({color:'#191d20',side:BackSide});m.onBeforeCompile=s=>{
 s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 float irregular=1.+.12*sin(position.y*21.+position.x*17.)*sin(position.z*19.);
 transformed+=normal*${width.toFixed(5)}*irregular;`);
 };m.customProgramCacheKey=()=>`ink-${width}`;return m;},[width]);
 useEffect(()=>()=>material.dispose(),[material]);
 return <mesh geometry={geometry} material={material}/>;
}
export function InkBox({size}:{size:[number,number,number]}){
 const geometry=useMemo(()=>{const box=new BoxGeometry(...size);const e=new EdgesGeometry(box);box.dispose();const a=e.attributes.position;
 for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i);a.setXYZ(i,x+.002*Math.sin(y*17+z*9),y+.002*Math.sin(x*11+z*7),z+.002*Math.sin(x*13+y*19));}return e;},[...size]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <lineSegments geometry={geometry}><lineBasicMaterial color="#202327" transparent opacity={.78}/></lineSegments>;
}
