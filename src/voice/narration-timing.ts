import {narrationBlocks} from './narration';
import {voiceFps} from './script';
import {buildVoiceTimeline, usableAudio} from './timing';
import type {VoiceManifest} from './types';

export function narrationTimeline(manifest: VoiceManifest, pauses: Record<string, number> = {}) {
  let startFrame = 0;
  return narrationBlocks.map(({cue, beats}, index) => {
    const audio = usableAudio(cue, manifest);
    let wordIndex = 0;
    const count = cue.text.split(/\s+/).length;
    const gestures = beats.map(beat => {
      const offset = wordIndex;
      wordIndex += beat.text.split(/\s+/).length;
      const estimated = audio && audio.inSeconds + offset / count * (audio.outSeconds - audio.inSeconds);
      return {
        label: beat.event, sourceFrame: beat.frame,
        atSeconds: beat.atSeconds ?? audio?.words[offset]?.start ?? estimated,
      };
    });
    const plan = buildVoiceTimeline([{...cue, gestures}], manifest, cue.frames, voiceFps);
    const pause = index === narrationBlocks.length - 1 ? 0 : pauses[cue.id] ?? 0;
    if (!Number.isFinite(pause) || pause < 0) throw new Error(`Pausa inválida después de ${cue.id}`);
    const clip = {
      cue, beats, plan, startFrame, durationInFrames: plan.frames + Math.round(pause * voiceFps),
      audioFile: audio?.file ?? null, durationSeconds: audio?.seconds ?? null,
      startSeconds: startFrame / voiceFps,
    };
    startFrame += clip.durationInFrames;
    return clip;
  });
}
