import {useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {OrthographicCamera} from 'three';
export function IsometricCamera({zoom=110,target=[0,1.4,0],position=[8,7.5,10]}:{zoom?:number;target?:[number,number,number];position?:[number,number,number]}){
 const {camera}=useThree();const [x,y,z]=position,[tx,ty,tz]=target;
 useLayoutEffect(()=>{if(!(camera instanceof OrthographicCamera))return;camera.position.set(x,y,z);camera.lookAt(tx,ty,tz);camera.zoom=zoom;camera.updateProjectionMatrix();},[camera,x,y,z,tx,ty,tz,zoom]);return null;
}
