import type {Intervention} from './script';
import type {LocalVoice, VoiceManifest} from './types';

export const wordKey = (word: string) => word.toLocaleLowerCase('es').replace(/[^\p{L}\p{N}]/gu,'');
export type VoiceTrack = {
  cue: Intervention;
  start: number;
  frames: number;
  trimBefore: number;
  audio?: LocalVoice;
};

export function usableAudio(cue: Intervention, manifest: VoiceManifest) {
  const audio = manifest[cue.id];
  return audio?.text === cue.text ? audio : undefined;
}

export function audioFrames(audio: LocalVoice, fps: number) {
  const trimBefore = Math.floor(audio.inSeconds*fps);
  return {trimBefore, frames: Math.max(1,Math.ceil(audio.outSeconds*fps)-trimBefore)};
}

export function buildVoiceTimeline(cues: Intervention[], manifest: VoiceManifest, sourceFrames: number, fps: number, cameraCuts: number[]=[]) {
  const tracks: VoiceTrack[] = [];
  const points: {source:number; output:number}[] = [{source:0,output:0}];
  let source = 0, output = 0;
  for(const cue of cues) {
    if(cue.start<source || cue.start+cue.frames>sourceFrames) throw new Error(`Intervalo inválido para ${cue.id}`);
    if(cue.pauseBeforeSeconds!==undefined && (!Number.isFinite(cue.pauseBeforeSeconds)||cue.pauseBeforeSeconds<0)) {
      throw new Error(`Pausa inválida para ${cue.id}`);
    }
    const gap = cue.start-source;
    if (gap>0) {
      output += cue.pauseBeforeSeconds===undefined ? gap : Math.max(0,Math.round(cue.pauseBeforeSeconds*fps));
      points.push({source:cue.start,output});
    }
    const audio = usableAudio(cue,manifest);
    const {trimBefore,frames} = audio ? audioFrames(audio,fps) : {trimBefore:0,frames:cue.frames};
    tracks.push({cue,start:output,frames,trimBefore,audio});
    const markers = new Map<number,number>();
    for (const cut of cameraCuts.filter(cut=>cut>cue.start&&cut<cue.start+cue.frames)) {
      // Word ends are safe edit points. Without alignment, the waveform runs
      // continuously across the existing picture cut.
      const relative = (cut-cue.start)/cue.frames*frames;
      const boundaries = (audio?.words??[]).map(word=>Math.ceil(word.end*fps)-trimBefore)
        .filter(frame=>frame>0&&frame<frames);
      if (boundaries.length) markers.set(cut,boundaries.reduce((best,frame)=>
        Math.abs(frame-relative)<Math.abs(best-relative)?frame:best));
    }
    for(const event of cue.gestures) {
      const match = event.word && audio?.words.find(word=>wordKey(word.text)===wordKey(event.word!));
      const at = event.atSeconds ?? (match ? match.start : undefined);
      if (at!==undefined && !markers.has(event.sourceFrame)) markers.set(event.sourceFrame,Math.round(at*fps)-trimBefore);
    }
    let last = 0;
    for(const [visual,frame] of [...markers].sort(([a],[b])=>a-b)) {
      if(visual>cue.start&&visual<cue.start+cue.frames&&frame>last&&frame<frames) {
        points.push({source:visual,output:output+frame});
        last=frame;
      }
    }
    source=cue.start+cue.frames;
    output+=frames;
    points.push({source,output});
  }
  output+=sourceFrames-source;
  if(source<sourceFrames) points.push({source:sourceFrames,output});
  return {tracks,points,frames:output};
}

export function sampleVisualFrame(timeline: ReturnType<typeof buildVoiceTimeline>, frame: number) {
  const points = timeline.points;
  const next = points.findIndex(point=>point.output>frame);
  if (next<=0) return points[points.length-1].source-1;
  const a=points[next-1], b=points[next];
  return a.source+(b.source-a.source)*(frame-a.output)/(b.output-a.output);
}

// Preserve complete words at the two outer edges of the test excerpt. A clip
// without word timings is played only if it fits entirely in the excerpt.
export function safeExcerpt(track: VoiceTrack, from: number, to: number, fps: number): VoiceTrack|undefined {
  if(!track.audio||track.start>=to||track.start+track.frames<=from) return;
  const first=Math.max(from,track.start), last=Math.min(to,track.start+track.frames);
  let a=first-track.start+track.trimBefore, b=last-track.start+track.trimBefore;
  const words=track.audio.words;
  if(first>track.start) {
    const word=words.find(word=>Math.floor(word.start*fps)>=a);
    if(!word) return;
    a=Math.floor(word.start*fps);
  }
  if(last<track.start+track.frames) {
    const word=[...words].reverse().find(word=>Math.ceil(word.end*fps)<=b);
    if(!word) return;
    b=Math.ceil(word.end*fps);
  }
  if(b<=a) return;
  return {...track,start:track.start+a-track.trimBefore,frames:b-a,trimBefore:a};
}
