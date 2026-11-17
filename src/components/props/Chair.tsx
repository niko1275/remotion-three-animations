import {Box,Cylinder,Plant} from '../../scenes/Kit';

export function Chair({position=[0,0,0],rotation=0}:{position?:[number,number,number];rotation?:number}={}){return <group position={position} rotation={[0,rotation,0]}>
 <group position={[1.8,0,1.6]} rotation={[0,-.3,0]}><Box p={[0,.6,0]} s={[.8,.12,.75]} ink c="#47765c"/><Box p={[0,1.05,-.32]} s={[.8,.75,.1]} ink c="#47765c"/>{[-.3,.3].map(x=>[-.25,.25].map(z=><Cylinder key={`${x}${z}`} p={[x,.3,z]} h={.6} top={.025} bottom={.025} ink c="#57766a"/>))}</group>

</group>;}
