import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/space-grotesk/latin-700.css';
import {createVinylStage} from '../vinilo-apertura/render';
import type {VinylSceneId} from '../../timeline';
import {buildCutting, buildStereo} from './studio';
import {buildPlating, buildPress} from './factory';
import {buildAmplification, buildClosing, buildPickup} from './playback';

type SceneId = Exclude<VinylSceneId, 'apertura'>;
type Cue = {atFrame: number; text: string};

const builders = {
  torno: buildCutting,
  estereo: buildStereo,
  galvanoplastia: buildPlating,
  prensa: buildPress,
  aguja: buildPickup,
  ecualizacion: buildAmplification,
  bucle: buildClosing,
};

export function ProductionScene({sceneId, duration, screenText}: {
  sceneId: SceneId;
  duration: number;
  screenText: readonly Cue[];
}) {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const canvas = useRef<HTMLCanvasElement>(null);
  const draw = useRef<((frame: number, duration: number, fps: number) => void) | null>(null);

  useLayoutEffect(() => {
    if (!canvas.current) return;
    const stage = createVinylStage(canvas.current, width, height);
    const motion = builders[sceneId](stage.room, stage.materials);
    draw.current = (f, d, speed) => {
      const t = f / speed;
      const {focus, exposure, atmosphere} = motion(stage.camera, f / Math.max(1, d - 1), t, f, d);
      stage.render(t, focus, exposure, atmosphere, true);
    };
    return () => {
      draw.current = null;
      stage.dispose();
    };
  }, [sceneId, width, height]);

  useLayoutEffect(() => {
    draw.current?.(frame, duration, fps);
  }, [sceneId, frame, duration, fps, width, height]);

  const active = screenText.reduce<Cue | undefined>((cue, item) => item.atFrame <= frame ? item : cue, undefined);
  const labels = active?.text === 'IZQ · DER';
  return (
    <AbsoluteFill style={{backgroundColor: '#929D8B'}}>
      <canvas ref={canvas} style={{width: '100%', height: '100%', display: 'block'}} />
      {active?.text && (
        <div style={{
          position: 'absolute', top: '69%', left: labels ? '22%' : '8%', right: labels ? '22%' : '8%',
          textAlign: 'center', fontFamily: 'Space Grotesk, system-ui, sans-serif', fontSize: 58,
          fontWeight: 700, lineHeight: 1.05, color: '#fff', WebkitTextStroke: '4px #1B1714', paintOrder: 'stroke fill',
          opacity: Math.min(1, (frame - active.atFrame) / 8),
          display: labels ? 'flex' : undefined, justifyContent: labels ? 'space-between' : undefined,
        }}>
          {labels ? <><span>IZQ</span><span>DER</span></> : active.text}
        </div>
      )}
    </AbsoluteFill>
  );
}
