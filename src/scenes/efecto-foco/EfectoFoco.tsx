import React, {useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {fragmentShader} from './shader';
import {timeline} from './timeline';

const vertexShader = `in vec3 position;
void main() { gl_Position = vec4(position, 1.0); }`;

function makeGrain() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 200;
  const context = canvas.getContext('2d');
  if (!context) return '';
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  context.fillStyle = '#fff';
  context.fillRect(0, 0, 200, 200);
  for (let i = 0; i < 5200; i++) {
    context.fillStyle = `rgba(90,70,40,${(random() * 0.16).toFixed(3)})`;
    context.fillRect(random() * 200, random() * 200, 1 + random() * 1.6, 1 + random() * 1.6);
  }
  return canvas.toDataURL();
}

export function EfectoFoco() {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const state = timeline(frame / fps);
  const canvas = useRef<HTMLCanvasElement>(null);
  const render = useRef<((state: ReturnType<typeof timeline>) => void) | null>(null);
  const [grain, setGrain] = useState('');

  useLayoutEffect(() => {
    if (!canvas.current) return;
    const context = canvas.current.getContext('webgl2', {antialias: false, depth: false, preserveDrawingBuffer: true});
    if (!context) throw new Error('WebGL 2 no está disponible. Prueba con --gl=swangle.');
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.current,
      context,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height, false);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(
      [-1, -1, 0, 3, -1, 0, -1, 3, 0], 3,
    ));
    const uniforms = {
      R: {value: new THREE.Vector2(width, height)},
      T: {value: 0}, F: {value: 0}, SP: {value: 0}, LT: {value: 0}, WK: {value: 0},
      PP: {value: new THREE.Vector3()}, CAM: {value: new THREE.Vector3()},
      TA: {value: new THREE.Vector3()},
    };
    const material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader: fragmentShader.replace('precision highp float;',
        'precision highp float;\nout vec4 outputColor;\n#define gl_FragColor outputColor\n'),
      glslVersion: THREE.GLSL3,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    const scene = new THREE.Scene();
    const screen = new THREE.Mesh(geometry, material);
    screen.frustumCulled = false;
    scene.add(screen);
    const camera = new THREE.Camera();
    render.current = (state) => {
      for (const key of ['T', 'F', 'SP', 'LT', 'WK'] as const) uniforms[key].value = state[key];
      for (const key of ['PP', 'CAM', 'TA'] as const) uniforms[key].value.fromArray(state[key]);
      renderer.render(scene, camera);
    };
    setGrain(makeGrain());

    return () => {
      render.current = null;
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [width, height]);

  useLayoutEffect(() => {
    render.current?.(state);
  });

  const scale = width / 420;
  return (
    <AbsoluteFill style={{background: '#E6D6B2', overflow: 'hidden'}}>
      <canvas ref={canvas} style={{display: 'block', width: '100%', height: '100%'}} />
      <AbsoluteFill style={{
        pointerEvents: 'none', mixBlendMode: 'multiply', opacity: 0.5,
        backgroundImage: grain ? `url(${grain})` : undefined,
        backgroundSize: `${200 * scale}px`,
      }} />
      <div style={{
        position: 'absolute', left: '6%', right: '6%', top: '66%', textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
        fontWeight: 800, fontSize: width * 0.06, lineHeight: 1.2, color: '#fff',
        textShadow: [
          `0 ${2 * scale}px #2a1a10`, `${2 * scale}px 0 #2a1a10`,
          `${-2 * scale}px 0 #2a1a10`, `0 ${-2 * scale}px #2a1a10`,
          `0 ${4 * scale}px ${10 * scale}px rgba(0,0,0,.5)`,
        ].join(','),
      }}>{state.caption}</div>
    </AbsoluteFill>
  );
}
