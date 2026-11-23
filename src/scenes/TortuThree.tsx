import React, {Suspense} from 'react';
import {useLoader} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const DURATION = 450;
const TAU = Math.PI * 2;
const WORLD_W = 2.82;
const WORLD_H = 5.02;
const LANDSCAPE = 'tortu/landscape.jpg';
const TURTLE = 'tortu/tortu.png';

const leafShape = new THREE.Shape();
leafShape.moveTo(0, -0.5);
leafShape.bezierCurveTo(-0.42, -0.15, -0.48, 0.36, 0, 0.5);
leafShape.bezierCurveTo(0.45, 0.27, 0.4, -0.2, 0, -0.5);
const birdShape = new THREE.Shape();
birdShape.moveTo(-0.5, -0.08);
birdShape.quadraticCurveTo(-0.25, 0.23, 0, -0.03);
birdShape.quadraticCurveTo(0.25, 0.23, 0.5, -0.08);
birdShape.lineTo(0.42, -0.16);
birdShape.quadraticCurveTo(0.2, 0.04, 0, -0.12);
birdShape.quadraticCurveTo(-0.2, 0.04, -0.42, -0.16);
birdShape.closePath();

const waterVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const waterFragment = `
  uniform sampler2D uMap;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float top = smoothstep(0.32, 0.37, vUv.y);
    float bottom = 1.0 - smoothstep(0.52, 0.57, vUv.y);
    float mask = top * bottom;
    float wave = sin(vUv.y * 95.0 + uTime * 1.6 + sin(vUv.x * 18.0) * 0.6);
    float dx = wave * 0.0022;
    vec4 color = texture2D(uMap, vUv + vec2(dx, 0.0));
    float shimmer = 0.5 + 0.5 * sin(vUv.x * 170.0 + vUv.y * 50.0 + uTime * 1.3);
    color.rgb = mix(color.rgb, vec3(1.0, 0.82, 0.57), shimmer * 0.12);
    color.a = mask * 0.62;
    gl_FragColor = color;
  }
`;

const mistFragment = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float top = smoothstep(0.32, 0.39, vUv.y);
    float bottom = 1.0 - smoothstep(0.50, 0.57, vUv.y);
    float ribbons = 0.5 + 0.5 * sin(vUv.x * 17.0 - uTime * 0.16 + sin(vUv.y * 28.0) * 0.8);
    float alpha = top * bottom * (0.025 + ribbons * 0.045);
    gl_FragColor = vec4(0.88, 0.88, 0.88, alpha);
  }
`;

const grassVertex = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float imageY = 1.0 - uv.y;
    float sides = max(1.0 - smoothstep(0.08, 0.31, uv.x), smoothstep(0.69, 0.93, uv.x));
    float rooted = smoothstep(0.48, 0.76, imageY);
    float sway = sin(uTime * 1.26 + uv.x * 24.0) * 0.018 * sides * rooted;
    p.x += sway;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const grassFragment = `
  uniform sampler2D uMap;
  varying vec2 vUv;
  void main() {
    float imageY = 1.0 - vUv.y;
    float sides = max(1.0 - smoothstep(0.08, 0.31, vUv.x), smoothstep(0.69, 0.93, vUv.x));
    float ground = smoothstep(0.48, 0.73, imageY);
    float alpha = sides * ground * 0.88;
    vec4 color = texture2D(uMap, vUv);
    color.a *= alpha;
    gl_FragColor = color;
  }
`;

const glowFragment = `
  uniform float uPulse;
  varying vec2 vUv;
  void main() {
    float d = distance(vUv, vec2(0.5));
    float glow = pow(max(0.0, 1.0 - d * 2.0), 2.0);
    float haze = exp(-d * 7.0) * 0.2;
    float alpha = (glow * 0.2 + haze) * uPulse;
    gl_FragColor = vec4(1.0, 0.72, 0.38, alpha);
  }
`;

const Scene: React.FC<{frame: number}> = ({frame}) => {
  const landscape = useLoader(THREE.TextureLoader, staticFile(LANDSCAPE));
  const turtle = useLoader(THREE.TextureLoader, staticFile(TURTLE));
  const phase = (TAU * frame) / DURATION;
  const breeze = (TAU * frame) / 150;
  const pulse = 0.925 + 0.075 * (0.5 + 0.5 * Math.sin((TAU * frame) / 90));
  const cameraZoom = 1 + 0.025 * (1 - Math.cos(phase));
  const screenDrift = Math.sin(phase) * 0.012;
  const waterUniforms = {uMap: {value: landscape}, uTime: {value: frame / 30}};
  const grassUniforms = {uMap: {value: landscape}, uTime: {value: frame / 30}};
  const mistUniforms = {uTime: {value: frame / 30}};
  const glowUniforms = {uPulse: {value: pulse}};

  const progress = frame / (DURATION - 1);
  const breath = 1 + 0.015 * (1 - Math.cos((TAU * frame) / 90)) / 2;
  const turtleRock = Math.sin((TAU * frame) / 150) * 0.006;
  const leafData = [
    {x: -0.86, y: 0.42, phase: 0, color: '#bd8a45', size: 0.052},
    {x: 0.9, y: 0.04, phase: 2.1, color: '#989252', size: 0.044},
    {x: -0.68, y: -0.31, phase: 4.2, color: '#d1a353', size: 0.038},
  ];

  return (
    <group scale={cameraZoom}>
      <mesh position={[screenDrift * 0.2, 0, -0.3]}>
        <planeGeometry args={[WORLD_W * 1.01, WORLD_H * 1.01]} />
        <meshBasicMaterial map={landscape} toneMapped={false} />
      </mesh>

      <mesh position={[screenDrift * 0.6, 0, -0.15]}>
        <planeGeometry args={[WORLD_W, WORLD_H, 48, 64]} />
        <shaderMaterial
          uniforms={waterUniforms}
          vertexShader={waterVertex}
          fragmentShader={waterFragment}
          transparent
          depthWrite={false}
        />
      </mesh>

      <mesh position={[screenDrift * 0.8, 0, -0.1]}>
        <planeGeometry args={[WORLD_W, WORLD_H, 32, 32]} />
        <shaderMaterial
          uniforms={mistUniforms}
          vertexShader={waterVertex}
          fragmentShader={mistFragment}
          transparent
          depthWrite={false}
        />
      </mesh>

      <mesh position={[screenDrift * 1.2, 0, -0.04]}>
        <planeGeometry args={[WORLD_W, WORLD_H, 48, 64]} />
        <shaderMaterial
          uniforms={grassUniforms}
          vertexShader={grassVertex}
          fragmentShader={grassFragment}
          transparent
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0.54, 0.78, 0.03]}>
        <planeGeometry args={[0.76, 0.76]} />
        <shaderMaterial
          uniforms={glowUniforms}
          vertexShader={waterVertex}
          fragmentShader={glowFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <group position={[-1.7 + progress * 3.4, 1.3, 0.12]}>
        {[0, 1, 2].map((index) => {
          const flap = 0.78 + Math.abs(Math.sin((TAU * frame) / 30 + index)) * 0.36;
          return (
            <mesh key={index} position={[-index * 0.13, -index * 0.065, 0]} scale={[0.12, flap * 0.12, 1]}>
              <shapeGeometry args={[birdShape]} />
              <meshBasicMaterial color="#554c58" transparent opacity={0.72} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>

      {leafData.map((leaf, index) => {
        const drift = breeze + leaf.phase;
        return (
          <mesh
            key={index}
            position={[leaf.x + Math.sin(drift) * 0.035, leaf.y + Math.cos(drift) * 0.025, 0.14]}
            rotation={[0, 0, Math.sin(drift) * 0.18]}
            scale={[leaf.size, leaf.size * 1.25, 1]}
          >
            <shapeGeometry args={[leafShape]} />
            <meshBasicMaterial color={leaf.color} transparent opacity={0.76} side={THREE.DoubleSide} />
          </mesh>
        );
      })}

      <group position={[0.035 + screenDrift * 0.9, -0.62, 0.2]} rotation={[0, 0, turtleRock]} scale={[1, breath, 1]}>
        <mesh>
          <planeGeometry args={[1.2, 1.4]} />
          <meshBasicMaterial map={turtle} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

const captionStyle: React.CSSProperties = {
  position: 'absolute',
  top: 145,
  left: '50%',
  width: '88%',
  transform: 'translateX(-50%)',
  padding: '14px 22px',
  borderRadius: 16,
  background: 'rgba(31, 35, 48, 0.13)',
  color: '#fffaf3',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 56,
  lineHeight: 1.16,
  textAlign: 'center',
  textShadow: '0 3px 8px rgba(20,18,24,.7)',
  whiteSpace: 'pre-line',
};

const Caption: React.FC<{text: string; durationInFrames: number}> = ({text, durationInFrames}) => {
  const frame = useCurrentFrame();
  const fade = 10;
  const fadeIn = interpolate(frame, [0, fade], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [durationInFrames - fade - 1, durationInFrames - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{...captionStyle, opacity: Math.min(fadeIn, fadeOut)}}>{text}</div>;
};

export const TortuThree: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#e4bd91'}}>
      <ThreeCanvas
        width={width}
        height={height}
        orthographic
        camera={{
          position: [0, 0, 6],
          left: -WORLD_W / 2,
          right: WORLD_W / 2,
          top: WORLD_H / 2,
          bottom: -WORLD_H / 2,
          near: 0.1,
          far: 50,
        }}
      >
        <ambientLight intensity={1} />
        <Suspense fallback={null}>
          <Scene frame={frame} />
        </Suspense>
      </ThreeCanvas>
      <Sequence from={0} durationInFrames={150} layout="none">
        <Caption text="No vas tarde." durationInFrames={150} />
      </Sequence>
      <Sequence from={150} durationInFrames={150} layout="none">
        <Caption text={'Estás siguiendo\ntu propio camino.'} durationInFrames={150} />
      </Sequence>
      <Sequence from={300} durationInFrames={150} layout="none">
        <Caption text="Sigue a tu ritmo." durationInFrames={150} />
      </Sequence>
      <Audio src={staticFile('tortu/music-loop-15s.wav')} volume={0.72} loop />
    </AbsoluteFill>
  );
};
