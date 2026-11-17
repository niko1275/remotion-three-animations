import {Cylinder} from '../../scenes/Kit';
export function Lamp({power=1}:{power?:number}){return <group>
 <Cylinder p={[.85,1.4,-1.55]} top={.22} bottom={.25} h={.07} c="#65694b" ink/>
 <Cylinder p={[.85,1.72,-1.55]} top={.035} bottom={.035} h={.62} c="#65694b" ink/>
 <mesh position={[.85,2.1,-1.55]} castShadow><cylinderGeometry args={[.2,.4,.5,16,1,true]}/><meshStandardMaterial color="#ead5a0" roughness={1} emissive="#f8d68b" emissiveIntensity={power*.8} side={2}/></mesh>
 <mesh position={[.85,1.98,-1.55]}><sphereGeometry args={[.075,8,6]}/><meshBasicMaterial color={power<.2?'#8a7350':'#fff1c0'}/></mesh>
 </group>;}
