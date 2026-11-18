import {ThreeCanvas} from '@remotion/three';
import {useEffect, useMemo, type ReactNode} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CanvasTexture, GLSL3, LinearFilter, Vector2, Vector3, Vector4} from 'three';
import {FocoCaption, FocoGrain} from '../efecto-foco/overlays';
import {keys, keyboardDepth, keyboardWidth, keyboardZ} from './keyboard';
import {experimentShader} from './shader';
import {experimentFrame, typingFrame} from './timeline';
import {armPose, type HandHover} from './armPose';

const vertexShader = `in vec3 position;
void main() { gl_Position = vec4(position.xy, 0., 1.); }`;
export function toLabFragmentShader(shader: string) {
  return shader.replace('precision highp float;',
    'precision highp float;\nout vec4 outputColor;\n#define gl_FragColor outputColor\n');
}

const fragmentShader = toLabFragmentShader(experimentShader);

export function canvasTexture(width: number, height: number, paint: (context: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d')!;
  paint(context);
  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function makeLegends() {
  const width = 1024;
  const height = 384;
  return canvasTexture(width, height, context => {
    context.fillStyle = '#fff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    for (const key of keys) {
      if (key.label === 'SPACE') continue;
      const size = key.label.length > 2 ? 20 : 29;
      context.font = `700 ${size}px system-ui, sans-serif`;
      context.fillText(key.label, (key.x / keyboardWidth + .5) * width,
        ((key.z - keyboardZ) / keyboardDepth + .5) * height, key.width / keyboardWidth * width * .85);
    }
  });
}

function makeDisplay(letters: string) {
  return canvasTexture(512, 352, context => {
    context.fillStyle = 'rgba(255,255,255,.65)';
    context.font = '700 25px monospace';
    context.fillText('DICTADO', 43, 58);
    context.fillRect(43, 72, 426, 2);
    context.fillStyle = '#fff';
    context.font = '700 30px monospace';
    const lines = letters ? letters.split(' ') : [];
    for (let i = 0; i < Math.max(1, Math.ceil(lines.length / 9)); i++) {
      const text = lines.slice(i * 9, (i + 1) * 9).join(' ');
      const y = 132 + i * 50;
      context.fillText(text, 43, y);
      if (i === Math.max(0, Math.ceil(lines.length / 9) - 1)) {
        context.fillRect(46 + context.measureText(text).width, y + 5, 15, 3);
      }
    }
  });
}

type LabShot = Pick<ReturnType<typeof experimentFrame>, 'camera' | 'target' | 'time' | 'withdrawal'> & {pose: readonly [number, number, number, number]};

export function LabStage({shot, motion, rule, shader = fragmentShader, displayTexture, extraUniforms, leftHover, children}: {
  shot: LabShot;
  motion: ReturnType<typeof typingFrame>;
  rule: boolean;
  shader?: string;
  displayTexture?: CanvasTexture;
  extraUniforms?: Record<string, {value: unknown}>;
  leftHover?: HandHover;
  children?: ReactNode;
}) {
  const {width, height} = useVideoConfig();
  const legends = useMemo(makeLegends, []);
  const display = useMemo(() => displayTexture ? null : makeDisplay(motion.text), [displayTexture, motion.text]);
  useEffect(() => () => legends.dispose(), [legends]);
  useEffect(() => () => display?.dispose(), [display]);
  const {stroke, travel} = motion;
  const left = armPose(true, motion, shot.time, shot.withdrawal, shot.pose[0], leftHover);
  const right = armPose(false, motion, shot.time, shot.withdrawal, shot.pose[0]);

  const uniforms = {
    R: {value: new Vector2(width, height)},
    T: {value: shot.time},
    RULE: {value: rule ? 1 : 0},
    CAM: {value: new Vector3(...shot.camera)},
    TA: {value: new Vector3(...shot.target)},
    STUDENT: {value: new Vector4(...shot.pose)},
    PRESS: {value: new Vector2(stroke?.key.id ?? -1, travel * .009)},
    REACH: {value: new Vector2(left.reach, right.reach)},
    WRIST_YAW: {value: new Vector2(left.yaw, right.yaw)},
    LEFT_SHOULDER: {value: left.shoulder},
    RIGHT_SHOULDER: {value: right.shoulder},
    LEFT_ELBOW: {value: left.elbow},
    RIGHT_ELBOW: {value: right.elbow},
    LEFT_HAND: {value: left.wrist},
    RIGHT_HAND: {value: right.wrist},
    LEGENDS: {value: legends},
    DISPLAY: {value: displayTexture ?? display},
    ...extraUniforms,
  };

  return <AbsoluteFill style={{background: '#1c1714', overflow: 'hidden'}}>
    <ThreeCanvas width={width} height={height} dpr={1} frameloop="demand" gl={{antialias: false}}>
      <mesh frustumCulled={false}>
        <planeGeometry args={[2, 2]} />
        <rawShaderMaterial vertexShader={vertexShader} fragmentShader={shader}
          uniforms={uniforms} glslVersion={GLSL3} depthTest={false} depthWrite={false} />
      </mesh>
    </ThreeCanvas>
    <FocoGrain />
    {children}
  </AbsoluteFill>;
}

export function ElExperimento() {
  const frame = useCurrentFrame();
  const shot = experimentFrame(frame);
  return <LabStage shot={shot} motion={typingFrame(frame)} rule={shot.shot === 'regla'}>
    {shot.shot === 'laboratorio' && shot.local >= 25 && shot.local < 108 && <FocoCaption top="16%">1996</FocoCaption>}
    {shot.shot === 'regla' && shot.local >= 20 && <FocoCaption top="78%">NO PRESIONAR ALT</FocoCaption>}
  </LabStage>;
}
