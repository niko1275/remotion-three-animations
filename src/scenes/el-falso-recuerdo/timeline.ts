import {interpolate} from 'remotion';
import {smooth} from '../../components/characters/CharacterAnimations';
import type {HandHover} from '../el-experimento/armPose';
import {alt} from '../el-experimento/keyboard';
import {experimentFrames, typingFrame} from '../el-experimento/timeline';
import {witnessFrame, witnessFrames} from '../el-falso-testigo/timeline';
import {memoryScript} from './script';

type Point = [number, number, number];
type Fragment = {
  lift: number;
  offsetX: number;
  offsetZ: number;
  beats: {at: number; reach: number; linear?: boolean}[];
};
type Shot = {id: string; frames: number; camera: Point; target: Point; push: number; fragment?: Fragment};
export const memoryFps = 30;
const previous = witnessFrame(witnessFrames - 1);
export const shots: Shot[] = [
  {id: 'duda', frames: 90, camera: previous.camera, target: previous.target, push: .06},
  {id: 'fragmento-1', frames: 90, camera: [-.41,1.46,.71], target: [alt.x+.024,.998,alt.z-.012], push: .08,
    fragment: {lift: .038, offsetX: -.004, offsetZ: -.004, beats: [
      {at: 0, reach: 0}, {at: .13, reach: 0}, {at: .65, reach: .91},
      {at: .78, reach: .91}, {at: 1, reach: .73},
    ]}},
  {id: 'fragmento-2', frames: 90, camera: [.27,1.43,.72], target: [alt.x+.021,1.002,alt.z], push: .08,
    fragment: {lift: .023, offsetX: .006, offsetZ: -.006, beats: [
      {at: 0, reach: .24}, {at: .37, reach: .81}, {at: .57, reach: .71},
      {at: .88, reach: .98}, {at: 1, reach: .98},
    ]}},
  {id: 'fragmento-3', frames: 90, camera: [-.27,1.25,.55], target: [alt.x+.008,1.004,alt.z], push: .075,
    fragment: {lift: .011, offsetX: 0, offsetZ: 0, beats: [
      {at: 0, reach: .42}, {at: .44, reach: .87}, {at: .62, reach: .87},
      {at: .84, reach: .949}, {at: 1, reach: 1, linear: true},
    ]}},
  {id: 'regreso', frames: 120, camera: [-.60,1.56,.60], target: [-.022,1.275,.985], push: .12},
];

let nextCut = 0;
const edit = shots.map(shot => {
  const start = nextCut;
  nextCut += shot.frames;
  return {...shot, start, end: nextCut};
});
export const memoryFrames = nextCut;

export const thoughts = [
  {start: edit[0].start+12, frames: 23, text: memoryScript.wait},
  {start: edit[0].start+44, frames: 42, text: memoryScript.doubt},
  {start: edit[2].start+10, frames: 70, text: memoryScript.possibility},
];
export const narration = [
  {start: edit[4].start+4, frames: 62, text: memoryScript.confessions},
  {start: edit[4].start+72, frames: 48, text: memoryScript.belief},
];

const idle = typingFrame(0);
export const rememberedLetters = typingFrame(experimentFrames-1).text;

function fragmentReach(fragment: Fragment, progress: number) {
  const index = fragment.beats.findIndex(beat => progress <= beat.at);
  if (index <= 0) return fragment.beats[0].reach;
  const start = fragment.beats[index-1], end = fragment.beats[index];
  return interpolate(progress, [start.at,end.at], [start.reach,end.reach], {
    easing: end.linear ? undefined : smooth,
  });
}

export function memoryFrame(frame: number) {
  const shot = edit.find(({end}) => frame < end) ?? edit[edit.length-1];
  const local = frame-shot.start;
  const progress = Math.min(1,Math.max(0,local/Math.max(1,shot.frames-1)));
  const push = shot.push*smooth(progress);
  const phase = (a: number,b: number) => smooth((progress-a)/(b-a));
  const fragment = shot.fragment;
  const imagining = !!fragment;
  const drift = imagining ? Math.sin(progress*2.8)*.003 : 0;
  const camera = shot.camera.map((value,i) => value+(shot.target[i]-value)*push+(i===0?drift:0)) as Point;
  // The cuts reassemble the gesture at different positions. The keyboard receives idle input.
  const leftHover: HandHover | undefined = fragment && {
    x: alt.x+fragment.offsetX,
    z: alt.z+fragment.offsetZ,
    lift: fragment.lift,
    reach: fragmentReach(fragment,progress),
  };
  const returning = shot.id === 'regreso';
  const tension = phase(.12,.8);
  const flinch = returning ? phase(0,.18)-phase(.22,.64) : 0;
  const time = frame/memoryFps;
  const cue = (returning ? narration : thoughts).find(cue => frame >= cue.start && frame < cue.start+cue.frames);
  return {
    camera, target: shot.target, time,
    motion: idle, leftHover, imagining,
    withdrawal: imagining ? .93 : returning ? .91+.065*tension+.023*flinch : previous.withdrawal,
    pose: [
      imagining ? .058 : previous.pose[0]-.035*tension-.027*flinch,
      imagining ? 0 : previous.pose[1]-.075*tension,
      imagining ? .14 : previous.pose[2]-.10*tension+(returning ? .03-.055*flinch : 0),
      0,
    ] as const,
    surprise: imagining ? 0 : .10+.20*tension+.17*flinch,
    isolate: imagining ? .23 : .19+.09*tension,
    caption: cue?.text ?? '',
  };
}
