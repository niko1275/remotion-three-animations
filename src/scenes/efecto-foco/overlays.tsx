import {useLayoutEffect, useState} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';

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

export function FocoGrain() {
  const {width} = useVideoConfig();
  const [grain, setGrain] = useState('');
  useLayoutEffect(() => setGrain(makeGrain()), []);
  return <AbsoluteFill style={{
    pointerEvents: 'none', mixBlendMode: 'multiply', opacity: 0.5,
    backgroundImage: grain ? `url(${grain})` : undefined,
    backgroundSize: `${200 * width / 420}px`,
  }} />;
}

export function FocoCaption({children, top = '66%'}: {children: string; top?: string}) {
  const {width} = useVideoConfig();
  const scale = width / 420;
  return <div style={{
    position: 'absolute', left: '6%', right: '6%', top, textAlign: 'center',
    fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
    fontWeight: 800, fontSize: width * 0.06, lineHeight: 1.2, color: '#fff',
    textShadow: [
      `0 ${2 * scale}px #2a1a10`, `${2 * scale}px 0 #2a1a10`,
      `${-2 * scale}px 0 #2a1a10`, `0 ${-2 * scale}px #2a1a10`,
      `0 ${4 * scale}px ${10 * scale}px rgba(0,0,0,.5)`,
    ].join(','),
  }}>{children}</div>;
}
