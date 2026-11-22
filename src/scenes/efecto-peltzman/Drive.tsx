import {ThreeCanvas} from '@remotion/three';
import {GLSL3, Vector2, Vector3} from 'three';
import {driveShader} from './shader';
import type {Shot} from './timeline';

type Point = [number, number, number];
const vertexShader = `in vec3 position;
void main() { gl_Position = vec4(position.xy, 0., 1.); }`;

export function Drive({width, height, state, time}: {width: number; height: number; state: Shot; time: number}) {
  const cameras: Record<Shot['view'], [Point, Point]> = {
    road: [[-.47,1.44,-.14],[-.16,1.40,-8]],
    buckle: [[.18,1.18,-.025],[-.19,.66,.28]],
    belt: [[.38,1.30,-.42],[-.47,.85,.17]],
    pedal: [[-.163,.37,-.30],[-.36,.16,-.62]],
    profile: [[.64,1.29,-.33],[-.48,1.04,.14]],
    wheel: [[-.08,1.40,.19],[-.47,1.07,-.41]],
    passenger: [[.52,1.40,.87],[-.79-.42*state.glance,1.23,-.83]],
  };
  const blend = state.cameraSlide ?? 0;
  const [camera, target] = cameras[state.view].map((point, index) =>
    new Vector3(...point).lerp(new Vector3(...cameras.passenger[index]), blend));
  const uniforms = {
    R: {value: new Vector2(width, height)}, CAM: {value: camera}, TA: {value: target},
    T: {value: time}, DISTANCE: {value: state.distance}, PEDAL: {value: state.pedal},
    BUCKLE: {value: state.buckle}, STEERING: {value: state.steering}, GLANCE: {value: state.glance},
    INSERT: {value: state.view === 'buckle' ? 1 : state.view === 'pedal' ? 2 : 0},
  };
  return <ThreeCanvas width={width} height={height} dpr={1} frameloop="demand" gl={{antialias:false}}>
    <mesh frustumCulled={false}>
      <planeGeometry args={[2,2]}/>
      <rawShaderMaterial glslVersion={GLSL3} vertexShader={vertexShader} fragmentShader={driveShader}
        depthTest={false} depthWrite={false} uniforms={uniforms}/>
    </mesh>
  </ThreeCanvas>;
}
