import {Box,Cylinder,Plant} from '../../scenes/Kit';

export function IVStand({position=[0,0,0],rotation=0}:{position?:[number,number,number];rotation?:number}={}){return <group position={position} rotation={[0,rotation,0]}>
 <Cylinder p={[.3,1.4,.8]} h={2.8} top={.025} bottom={.025} ink c="#7d9990"/>
 <Box p={[.3,.08,.8]} s={[.8,.06,.08]} ink c="#55736a"/><Box p={[.3,.08,.8]} s={[.08,.06,.8]} ink c="#55736a"/>
 <Box p={[.3,2.8,.8]} s={[.65,.035,.035]} ink c="#7d9990"/><Box p={[.55,2.42,.8]} s={[.25,.45,.1]} ink c="#b6ccc0"/>
 <Cylinder p={[.55,1.7,.8]} h={1} top={.009} bottom={.009} ink c="#b3cbbb"/>
</group>;}
