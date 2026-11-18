import {test} from 'node:test';
import assert from 'node:assert/strict';
import {accusationCameraCuts,accusationScript,voiceFps} from '../src/voice/script';
import {accusationFrames} from '../src/scenes/la-acusacion/timeline';
import {buildVoiceTimeline,safeExcerpt,sampleVisualFrame} from '../src/voice/timing';
import type {LocalVoice} from '../src/voice/types';

const cue=accusationScript[0];
const audio: LocalVoice = {
  file:'voices/fixture.mp3',text:cue.text,seconds:4,inSeconds:0,outSeconds:4,approved:false,
  words:cue.text.split(' ').map((text,i)=>({text,start:i*.8,end:i*.8+.7})),
};
test('long MP3 lengthens the scene without moving the start or cutting the voice at the camera edit',()=>{
  const plan=buildVoiceTimeline(accusationScript,{[cue.id]:audio},accusationFrames,voiceFps,accusationCameraCuts);
  assert.equal(plan.frames,accusationFrames+120-68);
  assert.equal(plan.tracks[0].start,0);
  assert.equal(plan.tracks[0].frames,120);
  const cut=plan.points.find(point=>point.source===42)!;
  assert.ok(audio.words.some(word=>Math.ceil(word.end*voiceFps)===cut.output));
  assert.equal(sampleVisualFrame(plan,cut.output),42);
  assert.equal(plan.tracks[1].start,149+120-68);
});

test('caption timing is preserved and a preview excerpt does not split a word',()=>{
  const plan=buildVoiceTimeline(accusationScript,{[cue.id]:audio},accusationFrames,voiceFps);
  const visible=safeExcerpt(plan.tracks[0],0,90,voiceFps)!;
  assert.ok(visible.frames<90);
  assert.ok(audio.words.some(word=>Math.ceil(word.end*voiceFps)===visible.trimBefore+visible.frames));
  const unaligned={...plan.tracks[0],audio:{...audio,words:[]}};
  assert.equal(safeExcerpt(unaligned,0,90,voiceFps),undefined);
});

test('stale recording falls back to original frames and pauses can be edited',()=>{
  const plan=buildVoiceTimeline(accusationScript,{[cue.id]:{...audio,text:'Un texto anterior'}},accusationFrames,voiceFps);
  assert.equal(plan.frames,accusationFrames);
  assert.equal(plan.tracks[0].audio,undefined);
  const cues=accusationScript.map((item,i)=>i===1?{...item,pauseBeforeSeconds:.5}:item);
  assert.equal(buildVoiceTimeline(cues,{},accusationFrames,voiceFps).tracks[1].start,68+15);
});
