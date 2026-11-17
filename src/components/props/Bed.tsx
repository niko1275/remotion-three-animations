import {Blanket} from './Blanket';
import {Box,Cylinder,Plant} from '../../scenes/Kit';

export function Bed({position=[0,0,0],rotation=0}:{position?:[number,number,number];rotation?:number}={}){return <group position={position} rotation={[0,rotation,0]}>
 <Box p={[-1.1,.65,.2]} s={[2.1,.16,3.6]} ink c="#244944"/>
 <Box p={[-1.1,.91,.2]} s={[2,.4,3.5]} ink c="#b6baa0"/>
 <Box p={[-1.1,1.15,-.9]} s={[1.6,.22,.65]} ink c="#d1d0ac" r={[.08,0,0]}/>

 <Blanket/>
 {[-2.15,-.05].map(x=>[-1.65,2].map(z=><group key={`${x},${z}`}><Cylinder p={[x,.75,z]} h={1.5} top={.045} bottom={.045} ink c="#42655c"/><Cylinder p={[x,.27,z]} h={.18} top={.1} bottom={.1} ink c="#1b302e"/></group>))}
 {[-1.65,2].map(z=><group key={z}><Cylinder p={[-1.1,1.5,z]} h={2.1} top={.045} bottom={.045} r={[0,0,Math.PI/2]} ink c="#42655c"/><Box p={[-1.1,.95,z]} s={[2.1,.12,.08]} ink c="#42655c"/></group>)}
</group>;}
