import React, {CSSProperties} from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

const WIDTH = 1080;
const DURATION = 450; // 15 s; divisible by the 3 s and 5 s motion cycles.
const TAU = Math.PI * 2;
const LANDSCAPE = 'tortu/landscape.jpg';
const TURTLE = 'tortu/tortu.png';

/** Editable SVG masks for scene planes and the turtle's head/feet. */
const SceneMasks: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden="true">
    <defs>
      <clipPath id="sky-mask" clipPathUnits="objectBoundingBox">
        <path d="M0 0H1V.345 C.91 .36 .84 .37 .77 .365 C.69 .36 .63 .35 .55 .37 C.47 .39 .39 .355 .31 .365 C.22 .375 .14 .405 0 .395Z" />
      </clipPath>
      <clipPath id="mountains-mask" clipPathUnits="objectBoundingBox">
        <path d="M0 .345 C.14 .405 .22 .375 .31 .365 C.39 .355 .47 .39 .55 .37 C.63 .35 .69 .36 .77 .365 C.84 .37 .91 .36 1 .345 V.505 C.85 .49 .75 .52 .63 .505 C.48 .49 .39 .52 .27 .505 C.17 .49 .08 .515 0 .5Z" />
      </clipPath>
      <clipPath id="lake-mask" clipPathUnits="objectBoundingBox">
        <path d="M0 .485 C.13 .505 .2 .49 .3 .5 C.42 .51 .54 .49 .64 .505 C.76 .52 .86 .49 1 .48 V.665 C.85 .655 .76 .68 .63 .66 C.5 .64 .37 .68 .24 .66 C.14 .645 .08 .67 0 .655Z" />
      </clipPath>
      <clipPath id="rock-mask" clipPathUnits="objectBoundingBox">
        <path d="M.02 .68 C.13 .66 .19 .66 .27 .68 C.34 .655 .43 .655 .52 .69 C.64 .71 .73 .735 .82 .765 C.91 .79 .97 .83 1 .865 V1 H0Z" />
      </clipPath>
      <clipPath id="grass-left-a" clipPathUnits="objectBoundingBox">
        <path d="M0 .56 C.07 .57 .12 .61 .16 .67 C.2 .74 .22 .84 .27 .91 L.31 1 H0Z" />
      </clipPath>
      <clipPath id="grass-left-b" clipPathUnits="objectBoundingBox">
        <path d="M0 .75 C.1 .72 .16 .75 .22 .81 C.28 .88 .31 .94 .4 1 H0Z" />
      </clipPath>
      <clipPath id="grass-right-a" clipPathUnits="objectBoundingBox">
        <path d="M.72 .84 C.78 .76 .83 .7 .89 .66 C.93 .63 .97 .61 1 .6 V1 H.74Z" />
      </clipPath>
      <clipPath id="grass-right-b" clipPathUnits="objectBoundingBox">
        <path d="M.83 .91 C.87 .82 .9 .76 .94 .72 C.96 .69 .98 .67 1 .66 V1 H.85Z" />
      </clipPath>
      <clipPath id="flowers-mask" clipPathUnits="objectBoundingBox">
        <path d="M0 .78 C.05 .77 .1 .8 .13 .84 C.16 .89 .17 .95 .21 1 H0Z" />
        <path d="M.12 .88 C.19 .84 .24 .86 .29 .92 C.32 .96 .34 .98 .37 1 H.14Z" />
        <path d="M.78 .81 C.83 .76 .9 .75 .94 .8 C.98 .85 .98 .93 1 .96 V1 H.78Z" />
      </clipPath>

      <clipPath id="turtle-head-clip" clipPathUnits="objectBoundingBox">
        <path d="M.51 .055 C.39 .055 .32 .13 .3 .25 C.27 .36 .31 .44 .38 .48 C.45 .53 .56 .52 .65 .47 C.75 .42 .8 .32 .78 .21 C.76 .1 .66 .04 .51 .055Z" />
      </clipPath>
      <clipPath id="turtle-left-leg-clip" clipPathUnits="objectBoundingBox">
        <path d="M.263 .826 C.225 .826 .192 .842 .172 .864 C.157 .887 .159 .915 .181 .932 C.205 .951 .247 .956 .282 .942 C.305 .932 .32 .912 .32 .892 C.32 .87 .301 .846 .289 .84Z" />
      </clipPath>
      <clipPath id="turtle-right-leg-clip" clipPathUnits="objectBoundingBox">
        <path d="M.742 .838 C.775 .825 .812 .827 .85 .84 C.892 .856 .92 .88 .925 .906 C.93 .928 .908 .947 .879 .954 C.837 .964 .795 .954 .76 .936 C.733 .922 .716 .9 .712 .879 C.708 .86 .722 .846 .742 .838Z" />
      </clipPath>
      <mask id="turtle-body-mask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1">
        <rect width="1" height="1" fill="white" />
        <path d="M.51 .055 C.39 .055 .32 .13 .3 .25 C.27 .36 .31 .44 .38 .48 C.45 .53 .56 .52 .65 .47 C.75 .42 .8 .32 .78 .21 C.76 .1 .66 .04 .51 .055Z" fill="black" />
        <path d="M.263 .826 C.225 .826 .192 .842 .172 .864 C.157 .887 .159 .915 .181 .932 C.205 .951 .247 .956 .282 .942 C.305 .932 .32 .912 .32 .892 C.32 .87 .301 .846 .289 .84Z" fill="black" />
        <path d="M.742 .838 C.775 .825 .812 .827 .85 .84 C.892 .856 .92 .88 .925 .906 C.93 .928 .908 .947 .879 .954 C.837 .964 .795 .954 .76 .936 C.733 .922 .716 .9 .712 .879 C.708 .86 .722 .846 .742 .838Z" fill="black" />
      </mask>
    </defs>
  </svg>
);

const Layer: React.FC<{
  image: string;
  mask: string;
  style?: CSSProperties;
}> = ({image, mask, style}) => (
  <Img src={staticFile(image)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', clipPath: `url(#${mask})`, ...style}} />
);

const ParallaxLayer: React.FC<{
  image: string;
  mask: string;
  frame: number;
  depth: number;
  amplitude?: number;
  style?: CSSProperties;
}> = ({image, mask, frame, depth, amplitude = 5, style}) => {
  const phase = (TAU * frame) / DURATION;
  const x = Math.sin(phase) * amplitude * depth;
  const y = Math.cos(phase) * amplitude * 0.35 * depth;
  return <Layer image={image} mask={mask} style={{transform: `translate3d(${x}px, ${y}px, 0)`, ...style}} />;
};

const GrassWind: React.FC<{frame: number; amplitude?: number}> = ({frame, amplitude = 2}) => {
  const windPhase = (TAU * frame) / 150; // 5 s; three complete cycles per clip.
  const makeStyle = (offset: number, factor: number): CSSProperties => {
    const sway = Math.sin(windPhase + offset) * amplitude * factor;
    return {
      transform: `skewX(${sway}deg) translateX(${sway * 1.8}px)`,
      transformOrigin: '50% 100%',
    };
  };
  const flowerSway = Math.sin(windPhase + 1.1) * amplitude * 1.45;
  return (
    <>
      <Layer image={LANDSCAPE} mask="grass-left-a" style={makeStyle(0, 1)} />
      <Layer image={LANDSCAPE} mask="grass-left-b" style={makeStyle(1.4, 0.8)} />
      <Layer image={LANDSCAPE} mask="grass-right-a" style={makeStyle(2.8, 0.9)} />
      <Layer image={LANDSCAPE} mask="grass-right-b" style={makeStyle(4.2, 0.75)} />
      <Layer image={LANDSCAPE} mask="flowers-mask" style={{transform: `skewX(${flowerSway}deg)`, transformOrigin: '50% 100%'}} />
    </>
  );
};

const TurtleMotion: React.FC<{frame: number; amplitude?: number}> = ({frame, amplitude = 1}) => {
  const breathPhase = (TAU * frame) / 90; // 3 s.
  const headPhase = (TAU * frame) / 150; // 5 s.
  const legPhase = (TAU * frame) / 90;
  const breathing = 1 + 0.015 * (1 - Math.cos(breathPhase)) / 2;
  const headAngle = Math.sin(headPhase) * 1.5 * amplitude;
  const headShift = Math.sin(headPhase) * 2 * amplitude;
  const legSwing = Math.sin(legPhase) * 1.1 * amplitude;
  const frameStyle: CSSProperties = {
    position: 'absolute',
    left: '53.24%',
    bottom: 1920 - 1458,
    width: 453,
    height: 530,
    transform: 'translateX(-50%)',
  };
  const fullLayer: CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%'};
  return (
    <div style={frameStyle}>
      <Img src={staticFile(TURTLE)} style={{...fullLayer, mask: 'url(#turtle-body-mask)', WebkitMask: 'url(#turtle-body-mask)', transform: `scaleY(${breathing})`, transformOrigin: '50% 100%'}} />
      <Img src={staticFile(TURTLE)} style={{...fullLayer, clipPath: 'url(#turtle-head-clip)', transform: `rotate(${headAngle}deg) translateX(${headShift}px) scaleY(${breathing})`, transformOrigin: '63% 46%'}} />
      <Img src={staticFile(TURTLE)} style={{...fullLayer, clipPath: 'url(#turtle-left-leg-clip)', transform: `rotate(${legSwing}deg) scaleY(${breathing})`, transformOrigin: '24% 87%'}} />
      <Img src={staticFile(TURTLE)} style={{...fullLayer, clipPath: 'url(#turtle-right-leg-clip)', transform: `rotate(${-legSwing}deg) scaleY(${breathing})`, transformOrigin: '81% 88%'}} />
    </div>
  );
};

const Bird: React.FC<{x: number; y: number; flap: number; size: number}> = ({x, y, flap, size}) => (
  <svg viewBox="0 0 48 24" style={{position: 'absolute', left: x, top: y, width: size, height: size * 0.5, overflow: 'visible'}} aria-hidden="true">
    <path d="M2 17 Q12 4 24 16 Q36 4 46 17" fill="none" stroke="#534c57" strokeWidth="2.8" strokeLinecap="round" transform={`translate(0 12) scale(1 ${flap}) translate(0 -12)`} />
  </svg>
);

const Birds: React.FC<{frame: number}> = ({frame}) => {
  const progress = frame / (DURATION - 1);
  const flapBase = 0.72 + 0.35 * Math.abs(Math.sin((TAU * frame) / 30));
  const x = -100 + progress * (WIDTH + 200);
  return (
    <>
      {[0, 1, 2].map((index) => (
        <Bird key={index} x={x - index * 46} y={270 + index * 27 + Math.sin((TAU * frame) / 150 + index) * 5} flap={flapBase} size={32 - index * 4} />
      ))}
    </>
  );
};

const SunGlow: React.FC<{frame: number}> = ({frame}) => {
  const pulse = Math.sin((TAU * frame) / 90);
  const opacity = interpolate(pulse, [-1, 1], [0.85, 1]);
  return (
    <div
      style={{
        position: 'absolute',
        left: '53%',
        top: '24%',
        width: 360,
        height: 360,
        borderRadius: '50%',
        opacity,
        background: 'radial-gradient(circle, rgba(255,238,166,.28) 0%, rgba(255,218,137,.17) 28%, rgba(255,205,133,0) 72%)',
        filter: 'blur(10px)',
        pointerEvents: 'none',
      }}
    />
  );
};

const Mist: React.FC<{frame: number; amplitude?: number}> = ({frame, amplitude = 12}) => {
  const phase = (TAU * frame) / 150;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        clipPath: 'url(#lake-mask)',
        opacity: 0.22,
        transform: `translateX(${Math.sin(phase) * amplitude}px)`,
        background: 'linear-gradient(90deg, transparent 8%, rgba(247,239,223,.24) 37%, rgba(247,239,223,.09) 62%, transparent 94%)',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }}
    />
  );
};

const WaterShimmer: React.FC<{frame: number; amplitude?: number}> = ({frame, amplitude = 2}) => {
  const phase = (TAU * frame) / 50; // 50 frames divides the 450-frame loop.
  const frequency = 0.012 + 0.002 * Math.sin(phase);
  return (
    <>
      <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden="true">
        <filter id="water-ripple" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency={`${frequency} .045`} numOctaves="1" seed="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={amplitude} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: 'url(#lake-mask)',
          filter: 'url(#water-ripple)',
          opacity: 0.35,
          background: 'linear-gradient(90deg, transparent 48%, rgba(255,224,145,.42) 56%, rgba(255,239,190,.18) 63%, transparent 72%)',
          transform: `translateX(${Math.sin(phase) * amplitude}px)`,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

const captionStyle: CSSProperties = {
  position: 'absolute',
  top: 150,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '88%',
  boxSizing: 'border-box',
  padding: '14px 22px',
  borderRadius: 16,
  background: 'rgba(31, 35, 48, 0.14)',
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

export const TortuLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = (TAU * frame) / DURATION;
  const cameraZoom = 1 + 0.025 * (1 - Math.cos(phase)); // 1.00 → 1.05 → 1.00.

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#e5c5a4'}}>
      <SceneMasks />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${cameraZoom})`, transformOrigin: '50% 50%'}}>
        {/* The unmodified plate remains beneath the masked layers, so no holes appear. */}
        <Img src={staticFile(LANDSCAPE)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
        <ParallaxLayer image={LANDSCAPE} mask="sky-mask" frame={frame} depth={0.2} />
        <ParallaxLayer image={LANDSCAPE} mask="mountains-mask" frame={frame} depth={0.4} />
        <ParallaxLayer image={LANDSCAPE} mask="lake-mask" frame={frame} depth={0.6} />
        <ParallaxLayer image={LANDSCAPE} mask="rock-mask" frame={frame} depth={0.9} />
        <GrassWind frame={frame} amplitude={1.6} />
        <SunGlow frame={frame} />
        <Mist frame={frame} amplitude={10} />
        <WaterShimmer frame={frame} amplitude={2.2} />
        <Birds frame={frame} />
        <TurtleMotion frame={frame} amplitude={1} />
      </div>

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
