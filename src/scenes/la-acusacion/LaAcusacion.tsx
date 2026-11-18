import type {ReactNode} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {GLSL3, Vector2, Vector3, Vector4} from 'three';
import {FocoCaption, FocoGrain} from '../efecto-foco/overlays';
import {accusationShader} from './shader';
import {accusationFrame} from './timeline';

const vertexShader = `in vec3 position;
void main() { gl_Position = vec4(position.xy, 0., 1.); }`;
export function toAccusationFragmentShader(shader: string) {
  return shader.replace('precision highp float;',
    'precision highp float;\nout vec4 outputColor;\n#define gl_FragColor outputColor\n');
}
const fragmentShader = toAccusationFragmentShader(accusationShader);

type RoomShot = Omit<ReturnType<typeof accusationFrame>, 'caption'>;

export function AccusationStage({shot, shader = fragmentShader, extraUniforms, children}: {
  shot: RoomShot;
  shader?: string;
  extraUniforms?: Record<string, {value: unknown}>;
  children?: ReactNode;
}) {
  const {width, height} = useVideoConfig();
  const {time, camera, target, interrogator, protagonist, hands} = shot;
  const uniforms = {
    R: {value: new Vector2(width, height)},
    T: {value: time},
    CAM: {value: new Vector3(...camera)},
    TA: {value: new Vector3(...target)},
    INTERROGATOR: {value: new Vector4(...interrogator)},
    PROTAGONIST: {value: new Vector4(...protagonist)},
    HANDS: {value: new Vector2(...hands)},
    ...extraUniforms,
  };

  return <AbsoluteFill style={{background: '#1c1714', overflow: 'hidden'}}>
    <ThreeCanvas width={width} height={height} dpr={1} frameloop="demand" gl={{antialias: false}}>
      <mesh frustumCulled={false}>
        <planeGeometry args={[2, 2]} />
        <rawShaderMaterial
          vertexShader={vertexShader} fragmentShader={shader} uniforms={uniforms}
          glslVersion={GLSL3} depthTest={false} depthWrite={false}
        />
      </mesh>
    </ThreeCanvas>
    <FocoGrain />
    {children}
  </AbsoluteFill>;
}

export function LaAcusacion() {
  const shot = accusationFrame(useCurrentFrame());
  return <AccusationStage shot={shot}>
    <FocoCaption top="79%">{shot.caption}</FocoCaption>
  </AccusationStage>;
}
