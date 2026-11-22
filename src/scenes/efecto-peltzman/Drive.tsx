import {useLayoutEffect, useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {BufferGeometry, Float32BufferAttribute, Quaternion, Vector3} from 'three';
import type {Shot} from './timeline';

type Point = [number, number, number];
const ink = '#202629';
const cream = '#dfd6b8';
const ochre = '#dfab55';
const skin = '#bc8360';
const suit = '#5b7480';

function Box({at, size, color, turn = [0, 0, 0]}: {at: Point; size: Point; color: string; turn?: Point}) {
  return <mesh position={at} rotation={turn}>
    <boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.92} flatShading/>
  </mesh>;
}

function Joint({at, size, color}: {at: Point; size: Point; color: string}) {
  return <mesh position={at} scale={size}><sphereGeometry args={[1, 12, 8]}/>
    <meshStandardMaterial color={color} roughness={.85} flatShading/>
  </mesh>;
}

function Bar({a, b, width, depth, color}: {a: Point; b: Point; width: number; depth: number; color: string}) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const length = Math.hypot(dx, dy, dz);
  const direction = new Vector3(dx,dy,dz).normalize();
  const rotation = new Quaternion().setFromUnitVectors(new Vector3(0,1,0), direction);
  return <group position={[(a[0]+b[0])/2, (a[1]+b[1])/2, (a[2]+b[2])/2]} quaternion={rotation}>
    <Box at={[0,0,0]} size={[width,length,depth]} color={color}/>
  </group>;
}

function bend(s: number) {
  const d = Math.max(0, s - 43);
  return .016 * d * d;
}

function Strip({from, to, offset, width, y, color}: {
  from: number; to: number; offset: number; width: number; y: number; color: string;
}) {
  const geometry = useMemo(() => {
    const points: number[] = [];
    const count = Math.ceil((to-from)/2);
    for (let i = 0; i < count; i++) {
      const a = from + (to-from)*i/count, b = from + (to-from)*(i+1)/count;
      const l = bend(a)+offset-width/2, r = l+width, ll = bend(b)+offset-width/2, rr = ll+width;
      points.push(l,y,-a,r,y,-a,ll,y,-b, r,y,-a,rr,y,-b,ll,y,-b);
    }
    const mesh = new BufferGeometry();
    mesh.setAttribute('position', new Float32BufferAttribute(points, 3));
    mesh.computeVertexNormals();
    return mesh;
  }, [from, to, offset, width, y]);
  return <mesh geometry={geometry}><meshStandardMaterial color={color} roughness={1}/></mesh>;
}


function Road() {
  return <>
    <Box at={[24,-.4,-48]} size={[210,.65,215]} color="#806e54"/>
    <Strip from={-20} to={138} offset={0} width={7.1} y={0} color="#57595a"/>
    <Strip from={-20} to={138} offset={-3.39} width={.09} y={.012} color="#b9b3a0"/>
    <Strip from={-20} to={138} offset={3.39} width={.09} y={.012} color="#b9b3a0"/>
    {Array.from({length:33}, (_, i) => <Strip key={i} from={i*4-3} to={i*4-1} offset={0} width={.095} y={.013} color="#d2a457"/>)}
    {Array.from({length:29}, (_, i) => {
      const s = 31 + i*3;
      return <Box key={i} at={[bend(s)-5.6,1.06,-s]} size={[1.1,2.32,3.12]}
        turn={[0,-Math.atan(.032*Math.max(0,s-43)),0]} color={i%3===0?'#7b6854':'#8d7a63'}/>;
    })}
    <Box at={[4.03,.88,-25]} size={[.07,1.76,.07]} color="#484645"/>
    <group position={[4.03,1.88,-24.97]} rotation={[0,0,Math.PI/4]}>
      <Box at={[0,0,0]} size={[.78,.78,.065]} color={ink}/>
      <Box at={[0,0,.039]} size={[.69,.69,.012]} color={ochre}/>
      <group rotation={[0,0,-Math.PI/4]}>
        <Bar a={[-.13,-.22,.05]} b={[-.13,.075,.05]} width={.072} depth={.012} color={ink}/>
        <Bar a={[-.13,.075,.05]} b={[.18,.075,.05]} width={.072} depth={.012} color={ink}/>
        <Bar a={[.05,.20,.05]} b={[.19,.075,.05]} width={.06} depth={.012} color={ink}/>
        <Bar a={[.05,-.05,.05]} b={[.19,.075,.05]} width={.06} depth={.012} color={ink}/>
      </group>
    </group>
    {[[-36,6,-98],[-17,4,-112],[13,4,-115],[48,9,-114],[73,8,-101]].map(([x,y,z]) =>
      <Joint key={x} at={[x,0,z]} size={[23,y,12]} color="#9d8264"/>)}
  </>;
}

const buckle: Point = [-.19,.59,.27];

function Cabin({state}: {state: Shot}) {
  const angle = -.88 * state.steering;
  const hands = [-1,1].map(side => {
    const a = Math.PI/2 + side*.9 + angle;
    return [-.48 + Math.cos(a)*.21, 1.12 + Math.sin(a)*.21, -.37] as Point;
  });
  const shoeY = .155 + .19*(1-state.pedal);
  const shoeZ = -.655 + .19*(1-state.pedal);
  const footwell = state.view === 'pedal';
  const tongue: Point = [buckle[0]+.24*(1-state.buckle), buckle[1]+.22*(1-state.buckle), buckle[2]+.03];
  return <>
    <Box at={[0,.07,.18]} size={[1.76,.11,1.95]} color={ink}/>
    <Box at={[0,.89,-.75]} size={[1.81,.24,.46]} color="#333d40"/>
    <Box at={[0,1.01,-.66]} size={[1.82,.045,.45]} color="#68706a"/>
    <Box at={[0,.74,-1.19]} size={[1.69,.10,.86]} color="#716a57"/>
    <Box at={[0,.43,-.03]} size={[.30,.49,1.28]} color="#333b3c"/>
    {footwell && <Box at={[-.41,.31,-.81]} size={[.69,.54,.07]} color="#394244"/>}
    {[-1, 1].map(side => <group key={side}>
      <Box at={[side*.88,.67,.12]} size={[.12,.56,1.64]} color="#485051"/>
      <Box at={[side*.875,.98,.16]} size={[.12,.055,1.60]} color="#77776b"/>
      <Bar a={[side*.86,1.03,-.68]} b={[side*.79,1.66,.11]} width={.065} depth={.075} color={ink}/>
      <Box at={[side*.47,.38,.34]} size={[.55,.16,.58]} color="#505c5e"/>
      <Box at={[side*.47,.77,.68]} size={[.52,.78,.17]} turn={[-.12,0,0]} color="#414c4e"/>
    </group>)}
    <Bar a={[-.81,1.65,.1]} b={[.81,1.65,.1]} width={.075} depth={.11} color={ink}/>
    <Box at={[-.48,.76,.33]} size={[.40,.47,.22]} turn={[-.10,0,0]} color={cream}/>
    <Joint at={[-.48,1.027,.30]} size={[.075,.11,.075]} color={skin}/>
    <group position={[-.48,1.205,.30]} rotation={[0,-state.glance,0]}>
      <Joint at={[0,.035,.01]} size={[.127,.16,.122]} color={ink}/>
      <Joint at={[0,0,-.036]} size={[.112,.139,.102]} color={skin}/>
      <Joint at={[0,-.021,-.132]} size={[.026,.027,.03]} color={skin}/>
      {[-1,1].map(side => <group key={side}>
        <Joint at={[side*.042,.017,-.127]} size={[.015,.009,.007]} color={ink}/>
        <Box at={[side*.043,.043,-.125]} size={[.039,.008,.016]} color={ink} turn={[0,0,side*.14]}/>
      </group>)}
      <Box at={[0,-.066,-.120]} size={[.052,.010,.014]} color="#714739"/>
    </group>
    <Bar a={[-.69,.98,.205]} b={tongue} width={.067} depth={.034} color="#3d453e"/>
    <Box at={[...buckle]} size={[.10,.116,.09]} color={ink}/>
    <Box at={[buckle[0],buckle[1]+.054,buckle[2]-.003]} size={[.078,.025,.06]} color="#b94c36"/>
    <Box at={[buckle[0],buckle[1]+.068,buckle[2]-.002]} size={[.050,.006,.027]} color="#541f27"/>
    <Box at={tongue} size={[.052,.076,.042]} color="#b1ad97"/>
    {state.view === 'buckle' && state.buckle < .99 && <Joint at={[tongue[0]+.04,tongue[1]+.035,tongue[2]+.012]}
      size={[.072,.039,.043]} color={skin}/>}
    <group position={[-.48,1.12,-.405]} rotation={[-.14,0,angle]}>
      <mesh><torusGeometry args={[.212,.025,10,42]}/><meshStandardMaterial color={ink}/></mesh>
      <Box at={[0,0,0]} size={[.39,.041,.038]} color="#4c5451"/>
      <Box at={[0,-.10,0]} size={[.043,.18,.041]} color="#4c5451"/>
      <Box at={[0,0,.027]} size={[.13,.087,.045]} color="#303738"/>
    </group>
    {hands.map((hand,i) => {
      const shoulder: Point = [-.48+(i===0?-.19:.19),.94,.28];
      const elbow: Point = [shoulder[0]+(i===0?-.04:.04),.80,.02];
      return <group key={i}>
        <Bar a={shoulder} b={elbow} width={.099} depth={.103} color={cream}/>
        <Bar a={elbow} b={hand} width={.071} depth={.077} color={skin}/>
        <Joint at={hand} size={[.055,.047,.042]} color={skin}/>
      </group>;
    })}
    <Bar a={[-.38,.44,.32]} b={[-.34,.38,-.12]} width={.15} depth={.14} color={suit}/>
    <Bar a={[-.34,.38,-.12]} b={[-.31,shoeY,shoeZ+.087]} width={.11} depth={.12} color={suit}/>
    <group position={[-.31,shoeY,shoeZ]} rotation={[.30-.56*state.pedal,0,0]}>
      <Box at={[0,0,0]} size={[.135,.090,.235]} color="#292625"/>
      <Box at={[0,-.038,-.004]} size={[.139,.018,.239]} color="#9a8e74"/>
      <Box at={[0,.031,-.073]} size={[.132,.027,.078]} color="#3c3730"/>
    </group>
    <Box at={[-.31,.127,-.688]} size={[.10,.165,.032]} turn={[.28+.40*state.pedal,0,0]} color="#777b6d"/>
    {[0,1,2].map(i => <Box key={i} at={[-.31,.092+i*.038,-.665+i*.008]} size={[.086,.012,.010]} color={ink}/>)}
  </>;
}

function Camera({state}: {state: Shot}) {
  const {camera, invalidate} = useThree();
  const {view, distance, glance, cameraSlide = 0} = state;
  useLayoutEffect(() => {
    const cameras: Record<Shot['view'], [Point, Point]> = {
      road: [[-.47,1.49,.24],[-.16,1.39,-8]],
      buckle: [[.135,1.14,.025],[-.17,.63,.27]],
      belt: [[.36,1.34,-.38],[-.45,.81,.24]],
      pedal: [[-.078,.36,-.40],[-.31,.185,-.635]],
      profile: [[.63,1.31,.15],[-.46,.97,.22]],
      wheel: [[-.02,1.43,.30],[-.48,1.12,-.40]],
      passenger: [[.56,1.42,.98],[-.74-.54*glance,1.18,-.54]],
    };
    const [eye, target] = cameras[view].map((point, index) =>
      point.map((value, axis) => value + (cameras.passenger[index][axis] - value) * cameraSlide) as Point);
    const yaw = -Math.atan(.032*Math.max(0,distance-43));
    const position = ([x,y,z]: Point): Point => [
      bend(distance)+1.66+x*Math.cos(yaw)+z*Math.sin(yaw),y,
      -distance-x*Math.sin(yaw)+z*Math.cos(yaw),
    ];
    camera.position.set(...position(eye));
    camera.lookAt(...position(target));
    invalidate();
  }, [camera, cameraSlide, distance, glance, invalidate, view]);
  return null;
}

export function Drive({width, height, state}: {width: number; height: number; state: Shot}) {
  const s = state.distance;
  return <ThreeCanvas width={width} height={height} dpr={1} frameloop="demand" camera={{fov: 49, near:.025, far:190}}>
    <color attach="background" args={['#b39c7f']}/>
    <fog attach="fog" args={['#b39c7f',23,120]}/>
    <ambientLight intensity={1.52}/>
    <directionalLight position={[-3,6,-4]} color="#ffdab1" intensity={2.0}/>
    <Road/>
    <group position={[bend(s)+1.66,0,-s]} rotation={[0,-Math.atan(.032*Math.max(0,s-43)),0]}>
      <Cabin state={state}/>
    </group>
    <Camera state={state}/>
  </ThreeCanvas>;
}
