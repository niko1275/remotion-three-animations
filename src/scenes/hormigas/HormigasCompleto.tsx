import {useLayoutEffect, useMemo, useRef} from 'react';
import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type CalculateMetadataFunction,
} from 'remotion';
import '@fontsource/space-grotesk/latin-700.css';
import {readVoiceDuration} from '../../compositions/ViniloAnimatico';
import {createAntStage} from './stage';
import {antTimeline, buildAntTimeline, type AntVoiceDurations, type AntVoiceFiles} from './timeline';

type AntAudioProps = {voiceFiles: AntVoiceFiles; voiceDurations: AntVoiceDurations};

export const antDefaultProps: AntAudioProps = {voiceFiles: {}, voiceDurations: {}};

export const calculateAntMetadata: CalculateMetadataFunction<AntAudioProps> = async ({props, abortSignal}) => {
  const measured = await Promise.all(antTimeline.scenes.map(async ({id}) => {
    const path = props.voiceFiles[id];
    return [id, path ? await readVoiceDuration(staticFile(path), abortSignal) : undefined] as const;
  }));
  const voiceDurations = Object.fromEntries(measured.filter(([, duration]) => duration !== undefined)) as AntVoiceDurations;
  return {durationInFrames: buildAntTimeline(voiceDurations).durationInFrames, props: {...props, voiceDurations}};
};

export function HormigasCompleto({voiceFiles, voiceDurations}: AntAudioProps) {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<ReturnType<typeof createAntStage> | null>(null);
  const {scenes} = useMemo(() => buildAntTimeline(voiceDurations), [voiceDurations]);
  const take = scenes.find((scene) => frame < scene.end) ?? scenes[scenes.length - 1];
  const visualFrames = take.id === 'gancho' ? take.seconds * fps : take.duration;
  const progress = Math.min(1, (frame - take.from) / (visualFrames - 1));
  const labels: readonly (readonly [number, string])[] = take.labels;
  const label = labels.reduce<string | null>((current, [at, text]) => progress >= at ? text : current, null);

  useLayoutEffect(() => {
    if (canvas.current) stage.current = createAntStage(canvas.current, width, height);
    return () => {
      stage.current?.dispose();
      stage.current = null;
    };
  }, [width, height]);

  useLayoutEffect(() => {
    stage.current?.draw(take.id, progress, frame / fps);
  }, [take.id, progress, frame, fps, width, height]);

  return (
    <AbsoluteFill>
      <canvas ref={canvas} style={{display: 'block', width: '100%', height: '100%'}} />
      {label && <div style={{
        position: 'absolute', top: take.id === 'remate' ? '62%' : '69%', insetInline: '7%',
        color: '#fff', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
        fontSize: width * 58 / 1080, lineHeight: 1.12, textAlign: 'center',
        WebkitTextStroke: `${width * 4 / 1080}px #1B1714`, paintOrder: 'stroke fill',
        textShadow: `0 ${width * 4 / 1080}px ${width * 10 / 1080}px #1B171499`,
      }}>{label}</div>}
      {scenes.map(({id, from, voiceLead, voiceFrames}) => {
        const path = voiceFiles[id];
        return path && voiceFrames > 0 && (
          <Sequence key={id} name={id} from={from + voiceLead} durationInFrames={voiceFrames} layout="none">
            <Html5Audio src={staticFile(path)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
