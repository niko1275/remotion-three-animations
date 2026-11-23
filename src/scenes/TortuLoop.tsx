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

const DURATION = 192;
const TURTLE_WIDTH = 453;
const TURTLE_HEIGHT = 530;
const TURTLE_BOTTOM = 1458;

const leftLegPath =
  'M 119 438 C 102 438 87 446 78 458 C 71 470 72 485 82 494 C 93 504 112 507 128 499 C 138 494 145 484 145 473 C 145 462 139 451 131 445 Z';
const rightLegPath =
  'M 336 444 C 351 437 368 438 385 445 C 404 453 416 466 419 480 C 422 492 412 503 399 506 C 380 511 361 506 345 496 C 333 489 325 477 323 466 C 321 456 326 449 336 444 Z';

const captionStyle: CSSProperties = {
  position: 'absolute',
  top: 225,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '88%',
  boxSizing: 'border-box',
  padding: '16px 22px',
  borderRadius: 16,
  background: 'rgba(31, 35, 48, 0.22)',
  color: '#fffaf3',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 58,
  lineHeight: 1.16,
  textAlign: 'center',
  textShadow: '0 3px 8px rgba(20, 18, 24, 0.7)',
  whiteSpace: 'pre-line',
};

const Caption: React.FC<{text: string; durationInFrames: number}> = ({
  text,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fade = 7;
  const fadeIn = interpolate(frame, [0, fade], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fade - 1, durationInFrames - 1],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  return (
    <div style={{...captionStyle, opacity: Math.min(fadeIn, fadeOut)}}>
      {text}
    </div>
  );
};

export const TortuLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = (2 * Math.PI * frame) / (DURATION - 1);
  const breath = (1 - Math.cos(phase)) / 2;
  const scale = 1 + 0.012 * breath;
  const lift = 3 * breath;
  const legSwing = Math.sin(phase) * 1.2;

  const turtleFrameStyle: CSSProperties = {
    position: 'absolute',
    left: '53.24%',
    bottom: 1920 - TURTLE_BOTTOM + lift,
    width: TURTLE_WIDTH,
    height: TURTLE_HEIGHT,
    transform: 'translateX(-50%)',
  };

  const turtleBodyStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    transform: `scale(${scale})`,
    transformOrigin: '50% 100%',
    mask: 'url(#tortu-body-mask)',
    WebkitMask: 'url(#tortu-body-mask)',
  };

  const legStyle = (angle: number, origin: string): CSSProperties => ({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    transform: `scale(${scale}) rotate(${angle}deg)`,
    transformOrigin: origin,
    clipPath: 'url(#tortu-left-leg)',
  });

  const rightLegStyle: CSSProperties = {
    ...legStyle(-legSwing, '80.6% 87.2%'),
    clipPath: 'url(#tortu-right-leg)',
  };

  const shadowStyle: CSSProperties = {
    position: 'absolute',
    left: '53.24%',
    bottom: 441,
    width: 368 * (1 + 0.006 * breath),
    height: 55,
    transform: 'translateX(-50%)',
    borderRadius: '50%',
    background: 'rgba(38, 28, 22, 0.20)',
    filter: 'blur(20px)',
  };

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#e5c5a4'}}>
      <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden="true">
        <defs>
          <mask id="tortu-body-mask" x="0" y="0" width={TURTLE_WIDTH} height={TURTLE_HEIGHT} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
            <rect width={TURTLE_WIDTH} height={TURTLE_HEIGHT} fill="white" />
            <path d={leftLegPath} fill="black" />
            <path d={rightLegPath} fill="black" />
          </mask>
          <clipPath id="tortu-left-leg" clipPathUnits="userSpaceOnUse">
            <path d={leftLegPath} />
          </clipPath>
          <clipPath id="tortu-right-leg" clipPathUnits="userSpaceOnUse">
            <path d={rightLegPath} />
          </clipPath>
        </defs>
      </svg>
      <Img
        src={staticFile('tortu/landscape.jpg')}
        style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}}
      />
      <div style={shadowStyle} />
      <div style={turtleFrameStyle}>
        <Img src={staticFile('tortu/tortu.png')} style={turtleBodyStyle} />
        <Img src={staticFile('tortu/tortu.png')} style={legStyle(legSwing, '24.3% 86%')} />
        <Img src={staticFile('tortu/tortu.png')} style={rightLegStyle} />
      </div>

      <Sequence from={0} durationInFrames={54} layout="none">
        <Caption text="No vas tarde." durationInFrames={54} />
      </Sequence>
      <Sequence from={48} durationInFrames={78} layout="none">
        <Caption text={'Estás siguiendo\ntu propio camino.'} durationInFrames={78} />
      </Sequence>
      <Sequence from={120} durationInFrames={72} layout="none">
        <Caption text="Sigue a tu ritmo." durationInFrames={72} />
      </Sequence>
      <Audio src={staticFile('tortu/music.mp3')} volume={0.72} />
    </AbsoluteFill>
  );
};
