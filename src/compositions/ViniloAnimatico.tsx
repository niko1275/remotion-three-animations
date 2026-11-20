import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  type CalculateMetadataFunction,
} from 'remotion';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import {
  buildVinylTimeline,
  VINYL_FPS,
  vinylScenes,
  type VoiceDurations,
  type VoiceFiles,
} from '../timeline';
import './vinilo-animatico.css';

type Props = {
  voiceFiles: VoiceFiles;
  voiceDurations: VoiceDurations;
};

export const animaticDefaultProps: Props = {voiceFiles: {}, voiceDurations: {}};

export function readVoiceDuration(src: string, signal: AbortSignal): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    const cleanUp = () => {
      audio.onloadedmetadata = null;
      audio.onerror = null;
      signal.removeEventListener('abort', abort);
      audio.removeAttribute('src');
      audio.load();
    };
    const abort = () => {
      cleanUp();
      reject(signal.reason);
    };
    audio.onloadedmetadata = () => {
      const duration = audio.duration;
      cleanUp();
      if (Number.isFinite(duration) && duration > 0) resolve(duration);
      else reject(new Error(`Duración de voz inválida para ${src}.`));
    };
    audio.onerror = () => {
      cleanUp();
      reject(new Error(`No se pudo leer la duración de ${src}.`));
    };
    if (signal.aborted) abort();
    else {
      signal.addEventListener('abort', abort, {once: true});
      audio.src = src;
    }
  });
}

export const calculateVinylMetadata: CalculateMetadataFunction<Props> = async ({props, abortSignal}) => {
  const measured = await Promise.all(vinylScenes.map(async ({id}) => {
    const file = props.voiceFiles[id];
    return [id, file ? await readVoiceDuration(staticFile(file), abortSignal) : undefined] as const;
  }));
  const voiceDurations = Object.fromEntries(measured.filter(([, duration]) => duration !== undefined)) as VoiceDurations;
  return {durationInFrames: buildVinylTimeline(voiceDurations).durationInFrames, props: {...props, voiceDurations}};
};

function timecode(frame: number) {
  const seconds = Math.floor(frame / VINYL_FPS);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function cueText(cues: readonly {atFrame: number; text: string}[], frame: number) {
  return cues.reduce<string | undefined>((active, cue) => cue.atFrame <= frame ? cue.text : active, undefined);
}

export function ViniloAnimatico({voiceFiles, voiceDurations}: Props) {
  const frame = useCurrentFrame();
  const {scenes} = buildVinylTimeline(voiceDurations);
  const index = scenes.findIndex((scene) => frame < scene.end);
  const scene = scenes[index];
  const localFrame = frame - scene.from;
  const screenText = cueText(scene.screenText, localFrame);
  const action = cueText(scene.animation, localFrame);
  const sound = cueText(scene.sound, localFrame);
  const voiceFile = voiceFiles[scene.id];

  return (
    <AbsoluteFill className="vinilo-animatico">
      <header className="vinilo-animatico-header">
        <span>Cómo funciona un vinilo</span>
        <span>Animático · {index + 1} / {scenes.length}</span>
      </header>
      <section className="vinilo-animatico-plan">
        <div className="vinilo-animatico-time">{timecode(scene.from)}–{timecode(scene.end)}</div>
        <h1>{scene.title}</h1>
        <p className="vinilo-animatico-visual">{scene.visual}</p>
        <dl>
          <div><dt>Cámara</dt><dd>{scene.camera}</dd></div>
          {localFrame >= scene.durationInFrames - 30
            ? <div><dt>Corte</dt><dd>{scene.transition}</dd></div>
            : <div><dt>Acción</dt><dd>{action}</dd></div>}
          {sound && <div><dt>Sonido</dt><dd>{sound}</dd></div>}
        </dl>
      </section>
      <div className="vinilo-animatico-overlay">{screenText}</div>
      <section className="vinilo-animatico-voice">
        <div>Narración</div>
        <p>{scene.narration}</p>
      </section>
      {voiceFile && (
        <Sequence from={scene.from + scene.voiceLead} durationInFrames={scene.voiceDurationInFrames}>
          <Html5Audio src={staticFile(voiceFile)} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
}
