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

  const turtleStyle: CSSProperties = {
    position: 'absolute',
    left: '53.24%',
    bottom: 1920 - TURTLE_BOTTOM + lift,
    width: TURTLE_WIDTH * scale,
    height: TURTLE_HEIGHT * scale,
    transform: 'translateX(-50%)',
    transformOrigin: '50% 100%',
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
      <Img
        src={staticFile('tortu/landscape.png')}
        style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}}
      />
      <div style={shadowStyle} />
      <Img src={staticFile('tortu/tortu.png')} style={turtleStyle} />

      <Sequence from={0} durationInFrames={54} layout="none">
        <Caption text="No vas tarde." durationInFrames={54} />
      </Sequence>
      <Sequence from={48} durationInFrames={78} layout="none">
        <Caption text={'Estás siguiendo\ntu propio camino.'} durationInFrames={78} />
      </Sequence>
      <Sequence from={120} durationInFrames={72} layout="none">
        <Caption text="Sigue a tu ritmo." durationInFrames={72} />
      </Sequence>
      <Audio src={staticFile('tortu/music.wav')} volume={0.72} />
    </AbsoluteFill>
  );
};
