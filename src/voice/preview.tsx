import {Html5Audio, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';
import {AccusationStage} from '../scenes/la-acusacion/LaAcusacion';
import {accusationFrame, accusationFrames} from '../scenes/la-acusacion/timeline';
import {ClosingStage, ClosingCaption} from '../scenes/el-cierre/ElCierre';
import {closingFrame, closingFrames} from '../scenes/el-cierre/timeline';
import {accusationCameraCuts, accusationScript, voiceFps, voiceScript} from './script';
import {Subtitles} from './Subtitles';
import {audioFrames, buildVoiceTimeline, sampleVisualFrame, safeExcerpt, usableAudio, type VoiceTrack} from './timing';
import type {VoiceManifest} from './types';

export type VoicePreviewProps = {
  manifest?: VoiceManifest;
  subtitles: boolean;
  ambience: string;
  ambienceVolume: number;
  pauses: Record<string,number>;
};
export const voicePreviewDefaults: VoicePreviewProps = {subtitles:true,ambience:'',ambienceVolume:.12,pauses:{}};
const excerpt=3*voiceFps;
export const loopVoiceFrames=4*excerpt;
const timeline=(manifest:VoiceManifest, pauses: Record<string,number>)=>
  buildVoiceTimeline(accusationScript.map(cue=>({...cue,pauseBeforeSeconds:pauses[cue.id]??cue.pauseBeforeSeconds})),
    manifest,accusationFrames,voiceFps,accusationCameraCuts);

export async function localManifest(): Promise<VoiceManifest> {
  const response=await fetch(staticFile('voices/manifest.json'),{cache:'no-store'});
  if(response.status===404) return {};
  if(!response.ok) throw new Error(`No se pudo leer el manifiesto de voces (HTTP ${response.status}).`);
  return response.json();
}

export const voiceMetadata = (loop: boolean): CalculateMetadataFunction<VoicePreviewProps> =>
  async ({props}) => {
    const manifest=props.manifest??await localManifest();
    return {durationInFrames:loop?loopVoiceFrames:timeline(manifest,props.pauses).frames,props:{...props,manifest}};
  };

export function Track({track}: {track: VoiceTrack}) {
  if(!track.audio) return null;
  return <Sequence from={track.start} durationInFrames={track.frames} layout="none" name={track.cue.id}>
    <Html5Audio src={staticFile(track.audio.file)} trimBefore={track.trimBefore}
      trimAfter={track.trimBefore+track.frames}/>
  </Sequence>;
}

export function Ambience({ambience,ambienceVolume}: VoicePreviewProps) {
  return ambience ? <Html5Audio src={staticFile(ambience)} loop volume={ambienceVolume}/> : null;
}

export function LaAcusacionVoces(props: VoicePreviewProps) {
  const frame=useCurrentFrame();
  const plan=timeline(props.manifest??{},props.pauses);
  const active=plan.tracks.find(track=>frame>=track.start&&frame<track.start+track.frames);
  const shot=accusationFrame(sampleVisualFrame(plan,frame));
  return <AccusationStage shot={shot}>
    <Ambience {...props}/>
    {plan.tracks.map(track=><Track key={track.cue.id} track={track}/>)}
    {props.subtitles&&active&&frame>=3&&<Subtitles track={active} frame={frame} fps={voiceFps}/>}
  </AccusationStage>;
}

export function PruebaLoopVoces(props: VoicePreviewProps) {
  const frame=useCurrentFrame();
  const local=frame%(2*excerpt);
  const manifest=props.manifest??{};
  const plan=timeline(manifest,props.pauses);
  const visualEnd=local<excerpt ? closingFrame(closingFrames-excerpt+local) : undefined;
  const shot=visualEnd??accusationFrame(sampleVisualFrame(plan,local-excerpt));
  const finalCue=voiceScript.find(cue=>cue.id==='s7-03')!;
  const finalAudio=usableAudio(finalCue,manifest);
  const recording=finalAudio?audioFrames(finalAudio,voiceFps):undefined;
  const ending=recording&&safeExcerpt({cue:finalCue,audio:finalAudio,
    start:excerpt-recording.frames,...recording},0,excerpt,voiceFps);
  const startTracks=plan.tracks.map(track=>safeExcerpt(track,0,excerpt,voiceFps)).filter(Boolean) as VoiceTrack[];
  const localTracks=[...(ending?[ending]:[]),...startTracks.map(track=>({...track,start:track.start+excerpt}))];
  const active=localTracks.find(track=>local>=track.start&&local<track.start+track.frames);
  const previewTrack=active&&{
    ...active,
    // Keep the match frame free of captions, as in the approved visual loop.
    show:local<excerpt-7 || local>=excerpt+3,
  };
  return <ClosingStage shot={shot} closingArms={visualEnd?.closingArms??0}>
    <Ambience {...props}/>
    {[0,2*excerpt].flatMap(offset=>localTracks.map(track=>
      <Track key={`${offset}-${track.cue.id}`} track={{...track,start:offset+track.start}}/>))}
    {props.subtitles&&previewTrack?.show&&<Subtitles track={previewTrack} frame={local} fps={voiceFps}/>}
    {props.subtitles&&visualEnd&&!finalAudio&&<ClosingCaption state={visualEnd}/>}
  </ClosingStage>;
}
