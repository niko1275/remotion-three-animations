import {AbsoluteFill, Sequence, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';
import {AccusationStage} from '../scenes/la-acusacion/LaAcusacion';
import {accusationFrame} from '../scenes/la-acusacion/timeline';
import {ElExperimento} from '../scenes/el-experimento/ElExperimento';
import {LaTrampa} from '../scenes/la-trampa/LaTrampa';
import {ElFalsoTestigo} from '../scenes/el-falso-testigo/ElFalsoTestigo';
import {ElFalsoRecuerdo} from '../scenes/el-falso-recuerdo/ElFalsoRecuerdo';
import {LosResultados} from '../scenes/los-resultados/LosResultados';
import {ClosingStage} from '../scenes/el-cierre/ElCierre';
import {closingFrame} from '../scenes/el-cierre/timeline';
import {Ambience, localManifest, Track, type VoicePreviewProps} from './preview';
import {narrationTimeline} from './narration-timing';
import {voiceFps} from './script';
import {Subtitles} from './Subtitles';
import {sampleVisualFrame} from './timing';

export const narrationMetadata: CalculateMetadataFunction<VoicePreviewProps> = async ({props}) => {
  const manifest = props.manifest ?? await localManifest();
  const clips = narrationTimeline(manifest, props.pauses);
  return {durationInFrames: clips.reduce((sum, clip) => sum + clip.durationInFrames, 0), props: {...props, manifest}};
};

const silent = ([torso, yaw, pitch]: readonly number[]) => [torso, yaw, pitch, 0] as const;

function Picture({id, frame}: {id: string; frame: number}) {
  switch (id) {
    case 'n1': {
      const shot = accusationFrame(frame);
      return <AccusationStage shot={{...shot, interrogator: silent(shot.interrogator), protagonist: silent(shot.protagonist)}}/>;
    }
    case 'n2': return <ElExperimento sourceFrame={frame}/>;
    case 'n3': return <LaTrampa sourceFrame={frame} narrated/>;
    case 'n4': return <ElFalsoTestigo sourceFrame={frame} narrated/>;
    case 'n5': return <ElFalsoRecuerdo sourceFrame={frame} narrated/>;
    case 'n6': return <LosResultados sourceFrame={frame}/>;
    case 'n7': {
      const shot = closingFrame(frame);
      return <ClosingStage shot={{...shot, interrogator: silent(shot.interrogator), protagonist: silent(shot.protagonist)}} closingArms={shot.closingArms}/>;
    }
    default: throw new Error(`Bloque desconocido: ${id}`);
  }
}

function NarratedClip({clip, subtitles}: {
  clip: ReturnType<typeof narrationTimeline>[number];
  subtitles: boolean;
}) {
  const frame = useCurrentFrame();
  const {cue, plan} = clip;
  const [track] = plan.tracks;
  const source = frame >= plan.frames - 1 ? cue.frames - 1 : Math.floor(sampleVisualFrame(plan, frame));
  const seam = (cue.id === 'n1' && frame < 3) || (cue.id === 'n7' && frame >= plan.frames - 3);
  // Keep the existing ALT card and the lower results graphic clear.
  const top = cue.id === 'n6' && source >= 150 && source < 300 ? '20%'
    : cue.id === 'n2' && source >= 270 && source < 420 ? '65%' : '76%';
  return <>
    <Picture id={cue.id} frame={source}/>
    <Track track={track}/>
    {subtitles && !seam && frame < track.frames && <Subtitles track={track} frame={frame} fps={voiceFps} top={top}/>}
  </>;
}

export function CerebroTramposoNarrado(props: VoicePreviewProps) {
  const clips = narrationTimeline(props.manifest ?? {}, props.pauses);
  return <AbsoluteFill>
    <Ambience {...props}/>
    {clips.map(clip => <Sequence key={clip.cue.id} from={clip.startFrame}
      durationInFrames={clip.durationInFrames} name={clip.cue.scene}>
      <NarratedClip clip={clip} subtitles={props.subtitles}/>
    </Sequence>)}
  </AbsoluteFill>;
}
