import {smooth} from '../../components/characters/CharacterAnimations';
import {typingFrame} from '../el-experimento/timeline';
import {witnessScript} from './script';

type Point = [number, number, number];
export const witnessFps = 30;
export const shots = [
  {id: 'investigador', frames: 90, camera: [2.58,1.77,1.16], target: [-.50,1.37,.58], push: .023},
  {id: 'testigo', frames: 90, camera: [.15,1.71,.46], target: [-1.18,1.50,-.39], push: .021},
  {id: 'reaccion', frames: 120, camera: [-.66,1.57,.36], target: [0,1.36,1.045], push: .025},
  {id: 'duda', frames: 150, camera: [-.77,1.64,.60], target: [-.027,1.265,1.005], push: .17},
] satisfies {id: string; frames: number; camera: Point; target: Point; push: number}[];

let cursor = 0;
const edit = shots.map(shot => {
  const start = cursor;
  cursor += shot.frames;
  return {...shot, start, end: cursor};
});
export const witnessFrames = cursor;

export const dialogue = {
  investigator: {start: edit[0].start + 21, frames: 51, text: witnessScript.investigator},
  witness: {start: edit[1].start + 9, frames: 76, text: witnessScript.witness},
};
export const narration = [
  {start: edit[2].start + 4, frames: 112, text: witnessScript.context},
  {start: edit[3].start + 4, frames: 45, text: witnessScript.change},
  {start: edit[3].start + 52, frames: 96, text: witnessScript.doubt},
];
export const actions = {
  referral: edit[0].start + 12,
  confirmation: edit[1].start + 15,
  reaction: edit[2].start + 2,
  recoil: edit[2].start + 22,
  gaze: edit[3].start + 15,
};

const idleHands = typingFrame(0);
const inside = (cue: {start: number; frames: number}, frame: number) => frame >= cue.start && frame < cue.start+cue.frames;
function articulation(cue: {start: number; frames: number}, frame: number) {
  const time = frame-cue.start;
  return .57*Math.abs(Math.sin(time*.43))*smooth(time/3)*smooth((cue.frames-time)/3);
}

export function witnessFrame(frame: number) {
  const shot = edit.find(({end}) => frame < end) ?? edit[edit.length-1];
  const phase = (a: number,b: number) => smooth((frame-a)/(b-a));
  const push = shot.push*phase(shot.start,shot.end-1);
  const camera = shot.camera.map((value,i) => value+(shot.target[i]-value)*push) as Point;
  const time = frame/witnessFps;
  const referral = phase(actions.referral,actions.referral+35);
  const reaction = phase(actions.reaction,actions.reaction+16);
  const recoil = phase(actions.recoil,actions.recoil+24);
  const doubt = phase(actions.gaze,actions.gaze+75);
  const assent = phase(actions.confirmation,actions.confirmation+10)-phase(actions.confirmation+13,actions.confirmation+25);
  const investigatorTalking = inside(dialogue.investigator,frame);
  const witnessTalking = inside(dialogue.witness,frame);
  const voice = narration.find(cue => inside(cue,frame));
  return {
    camera, target: shot.target, time,
    motion: idleHands,
    withdrawal: .87+.12*recoil,
    pose: [
      -.044-.040*recoil+.055*doubt+.005*Math.sin(time*2.1),
      .34+.14*reaction-.34*doubt+.020*Math.sin(time*1.2),
      -.034-.096*reaction+.55*doubt+.014*Math.sin(time*1.6),
      0,
    ] as const,
    surprise: .55*reaction*(1-.84*doubt),
    researcherYaw: -.22+.83*referral-.19*reaction,
    researcherMouth: articulation(dialogue.investigator,frame),
    witnessHead: [-.075+.030*Math.sin(time*.90),-.025+.065*assent] as const,
    witnessMouth: articulation(dialogue.witness,frame),
    caption: investigatorTalking ? dialogue.investigator.text : witnessTalking ? dialogue.witness.text : voice?.text ?? '',
    black: 1-phase(0,10),
    isolate: .19*doubt,
  };
}
