import {Box,Cylinder,Plant} from '../../scenes/Kit';

export function Decorations({position=[0,0,0],rotation=0}:{position?:[number,number,number];rotation?:number}={}){return <group position={position} rotation={[0,rotation,0]}><Cylinder p={[2.8,.3,-1.15]} top={.25} bottom={.2} h={.6} ink c="#517b66"/> <Box p={[-1.3,2.8,-2.86]} s={[1.5,1,.1]} ink c="#27443c"/><Box p={[-1.3,2.8,-2.79]} s={[1.32,.82,.035]} ink c="#52776c"/>
 <Plant p={[-2.9,.4,-2.2]}/>
</group>;}
