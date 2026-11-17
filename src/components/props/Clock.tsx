import {Box,Cylinder,Plant} from '../../scenes/Kit';

export function Clock({position=[0,0,0],rotation=0}:{position?:[number,number,number];rotation?:number}={}){return <group position={position} rotation={[0,rotation,0]}> <Cylinder p={[.8,3.18,-2.84]} top={.32} bottom={.32} h={.09} r={[Math.PI/2,0,0]} ink c="#243d39"/>
 <Cylinder p={[.8,3.18,-2.78]} top={.265} bottom={.265} h={.02} r={[Math.PI/2,0,0]} ink c="#c1c3a1"/>
 <Box p={[.8,3.25,-2.75]} s={[.025,.18,.02]} ink c="#304c43" r={[0,0,-.5]}/><Box p={[.88,3.18,-2.75]} s={[.18,.02,.02]} ink c="#304c43"/>
</group>;}
