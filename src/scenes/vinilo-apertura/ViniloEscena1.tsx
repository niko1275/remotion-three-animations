import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/space-grotesk/latin-700.css';
import {vinylTimeline} from '../../timeline';
import {createVinylOpening} from './render';

export const openingDurationInFrames = vinylTimeline.scenes[0].durationInFrames;
const titleFrame = vinylTimeline.scenes[0].screenText[0].atFrame;

export function ViniloEscena1() {
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const canvas = useRef<HTMLCanvasElement>(null);
  const opening = useRef<ReturnType<typeof createVinylOpening> | null>(null);

  useLayoutEffect(() => {
    if (!canvas.current) return;
    const instance = createVinylOpening(canvas.current, width, height);
    opening.current = instance;
    return () => {
      opening.current = null;
      instance.dispose();
    };
  }, [width, height]);

  useLayoutEffect(() => {
    opening.current?.draw(frame, durationInFrames, fps);
  }, [frame, durationInFrames, fps, width, height]);

  const titleIn = Math.round(titleFrame * durationInFrames / openingDurationInFrames);
  const titleOpacity = Math.max(0, Math.min(1, (frame - titleIn) / 12));
  return (
    <AbsoluteFill style={{backgroundColor: '#929D8B'}}>
      <canvas ref={canvas} style={{width: '100%', height: '100%', display: 'block'}} />
      {frame >= titleIn && (
        <div style={{
          position: 'absolute', top: '69%', left: '8%', right: '8%', textAlign: 'center',
          fontFamily: 'Space Grotesk, system-ui, sans-serif', fontSize: 58, fontWeight: 700, lineHeight: 1.05,
          color: '#fff', WebkitTextStroke: '4px #1B1714', paintOrder: 'stroke fill', opacity: titleOpacity,
        }}>
          {vinylTimeline.scenes[0].screenText[0].text}
        </div>
      )}
    </AbsoluteFill>
  );
}
