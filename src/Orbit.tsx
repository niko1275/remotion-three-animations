import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';

export const Orbit = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const angle = (frame / durationInFrames) * Math.PI * 2;
  return <AbsoluteFill style={{background: '#090d20'}}>
    <ThreeCanvas width={width} height={height} camera={{position: [0, 0, 6], fov: 45}}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={3} />
      <pointLight position={[-3, -2, 2]} color="#a78bfa" intensity={20} />
      <group rotation={[0.3, angle, 0.15]}>
        <mesh>
          <torusKnotGeometry args={[1, 0.3, 160, 32]} />
          <meshStandardMaterial color="#67e8f9" metalness={0.65} roughness={0.23} />
        </mesh>
      </group>
      <mesh position={[Math.cos(angle) * 2.2, Math.sin(angle) * 1.4, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#c4b5fd" emissive="#8b5cf6" emissiveIntensity={0.7} />
      </mesh>
    </ThreeCanvas>
    <div style={{position: 'absolute', left: 80, bottom: 70, color: 'white', fontFamily: 'sans-serif'}}>
      <div style={{fontSize: 22, letterSpacing: 6, color: '#67e8f9'}}>REMOTION + THREE.JS</div>
      <div style={{fontSize: 72, fontWeight: 700}}>Órbita creativa</div>
    </div>
  </AbsoluteFill>;
};

