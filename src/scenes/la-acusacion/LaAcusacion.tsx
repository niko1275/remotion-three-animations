import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {GLSL3, Vector2, Vector3, Vector4} from 'three';
import {FocoCaption, FocoGrain} from '../efecto-foco/overlays';
import {accusationShader} from './shader';
import {accusationFrame} from './timeline';

const vertexShader = `in vec3 position;
void main() { gl_Position = vec4(position.xy, 0., 1.); }`;
const fragmentShader = accusationShader.replace('precision highp float;',
  'precision highp float;\nout vec4 outputColor;\n#define gl_FragColor outputColor\n');

export function LaAcusacion() {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const {time, camera, target, caption, interrogator, protagonist, hands} = accusationFrame(frame);
  const uniforms = {
    R: {value: new Vector2(width, height)},
    T: {value: time},
    CAM: {value: new Vector3(...camera)},
    TA: {value: new Vector3(...target)},
    INTERROGATOR: {value: new Vector4(...interrogator)},
    PROTAGONIST: {value: new Vector4(...protagonist)},
    HANDS: {value: new Vector2(...hands)},
  };

  return <AbsoluteFill style={{background: '#1c1714', overflow: 'hidden'}}>
    <ThreeCanvas width={width} height={height} dpr={1} frameloop="demand" gl={{antialias: false}}>
      <mesh frustumCulled={false}>
        <planeGeometry args={[2, 2]} />
        <rawShaderMaterial
          vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms}
          glslVersion={GLSL3} depthTest={false} depthWrite={false}
        />
      </mesh>
    </ThreeCanvas>
    <FocoGrain />
    <FocoCaption top="79%">{caption}</FocoCaption>
  </AbsoluteFill>;
}
