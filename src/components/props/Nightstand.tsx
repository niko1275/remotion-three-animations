import {Box,Cylinder,Plant} from '../../scenes/Kit';

export function Nightstand({position=[0,0,0],rotation=0}:{position?:[number,number,number];rotation?:number}={}){return <group position={position} rotation={[0,rotation,0]}>
 <Box p={[.85,.68,-1.55]} s={[1.05,1.35,.85]} ink c="#344c3c"/>
 {[.25,.65,1.05].map(y=><group key={y}><Box p={[.85,y,-1.105]} s={[.92,.32,.045]} ink c="#405847"/><Box p={[.85,y,-1.065]} s={[.25,.035,.035]} ink c="#8e9472"/></group>)}
</group>;}
