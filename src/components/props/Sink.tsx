import {Box,Cylinder,Plant} from '../../scenes/Kit';

export function Sink({position=[0,0,0],rotation=0}:{position?:[number,number,number];rotation?:number}={}){return <group position={position} rotation={[0,rotation,0]}>
 <Box p={[2.35,2.35,-2.86]} s={[1.2,1.3,.1]} ink c="#193b39"/>
 <Box p={[2.35,2.35,-2.79]} s={[1.05,1.15,.035]} ink c="#507a75"/>
 <Box p={[2.35,1.3,-2.43]} s={[1.3,.18,.85]} ink c="#8baba0"/>
 <Box p={[2.35,1.41,-2.35]} s={[.9,.04,.5]} ink c="#4b7469"/>
 <Cylinder p={[2.35,1.58,-2.68]} top={.035} bottom={.035} h={.35} ink c="#8ca798"/>
</group>;}
