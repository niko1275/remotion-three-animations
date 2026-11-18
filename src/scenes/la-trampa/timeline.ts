import {smooth} from '../../components/characters/CharacterAnimations';
import {alt} from '../el-experimento/keyboard';
import {experimentFrames, typingFrame} from '../el-experimento/timeline';

type Point = [number, number, number];
export const trapFps = 30;
export const shots = [
  {id: 'fallo', frames: 120, camera: [.99,1.57,1.24], target: [-.015,1.25,.49], push: .028},
  {id: 'acusacion', frames: 150, camera: [2.17,1.76,.79], target: [-.37,1.40,.78], push: .026},
  {id: 'negacion', frames: 120, camera: [-.62,1.58,.38], target: [0,1.35,1.04], push: .035},
  {id: 'revelacion', frames: 150, camera: [-.45,1.49,.70], target: [alt.x+.021,1.00,alt.z], push: .17},
] satisfies {id: string; frames: number; camera: Point; target: Point; push: number}[];

let nextCut = 0;
const edit = shots.map(shot => {
  const start = nextCut;
  nextCut += shot.frames;
  return {...shot, start, end: nextCut};
});
export const trapFrames = nextCut;

export const actions = {
  freeze: 40,
  blink: 50,
  error: 59,
  point: edit[1].start + 25,
  notice: edit[1].start + 45,
  surprise: edit[2].start - 5,
  recoil: edit[2].start + 46,
  denial: edit[2].start + 70,
  dim: edit[3].start + 18,
  black: trapFrames - 10,
};

export const dialogue = {
  investigador: [
    {start: edit[1].end - 49, frames: 49, text: 'Presionaste la tecla ALT.'},
    {start: edit[2].start + 10, frames: 59, text: 'Te advertimos que no lo hicieras.'},
  ],
  estudiante: [{start: edit[2].start + 73, frames: 43, text: '¡Pero yo nunca presioné esa tecla!'}],
};
export const narration = [
  {start: edit[3].start + 14, frames: 65, text: 'Pero había algo que el estudiante no sabía...'},
  {start: edit[3].start + 88, frames: 40, text: 'La acusación era falsa.'},
];

const active = (cue: {start: number; frames: number}, frame: number) => frame >= cue.start && frame < cue.start + cue.frames;
const mouth = (cue: {start: number; frames: number} | undefined, frame: number) =>
  cue ? Math.abs(Math.sin((frame-cue.start)*.43))*.55 * smooth((frame-cue.start)/3) * smooth((cue.start+cue.frames-frame)/3) : 0;

export function trapFrame(frame: number) {
  const shot = edit.find(({end}) => frame < end) ?? edit[edit.length-1];
  const phase = (start: number, end: number) => smooth((frame-start)/(end-start));
  const progress = phase(shot.start, shot.end-1);
  const camera = shot.camera.map((p, i) => p + (shot.target[i]-p)*progress*shot.push) as Point;
  const researcher = dialogue.investigador.find(cue => active(cue,frame));
  const student = dialogue.estudiante.find(cue => active(cue,frame));
  const voice = narration.find(cue => active(cue,frame));
  const surprise = phase(actions.surprise, actions.surprise+10);
  const deny = phase(actions.denial,actions.denial+9) - 1.6*phase(actions.denial+9,actions.denial+18)
    + .6*phase(actions.denial+18,actions.denial+29);
  const time = frame/trapFps;
  const typing = typingFrame(126 + Math.min(frame,actions.freeze-1));
  const frozen = frame >= actions.freeze;
  const release = 1-phase(actions.freeze,actions.freeze+6);
  const motion = frozen ? {
    ...typing, stroke: release > 0 ? typing.stroke : undefined,
    reach: typing.reach * release, travel: 0,
  } : typing;
  const letters = [typingFrame(experimentFrames-1).text,typing.text].filter(Boolean).join(' ');
  const blink = (frame >= actions.blink && frame < actions.blink+3) || (frame >= actions.blink+6 && frame < actions.blink+8);
  return {
    time, camera, target: shot.target, motion, letters,
    researcherPresent: shot.id !== 'fallo',
    displayMode: frame >= actions.error ? 'error' : 'text',
    dimScreen: blink ? .14 : 1,
    withdrawal: .13*phase(actions.freeze,actions.freeze+16) + .86*phase(actions.recoil,actions.recoil+28),
    pose: [
      .062+.006*Math.sin(time*2.1)-.12*phase(actions.recoil,actions.recoil+27),
      .29*phase(actions.notice,edit[2].start-22)+.18*surprise+.14*deny,
      .04-.065*phase(actions.freeze,actions.error+10)-.085*surprise+.022*Math.sin(time*1.7),
      mouth(student,frame),
    ] as const,
    surprise: surprise*(1-.55*phase(edit[2].start+65,edit[2].start+90)),
    point: phase(actions.point,actions.point+25)*(1-phase(edit[2].start+30,edit[2].start+63)),
    researcherMouth: mouth(researcher,frame),
    caption: (researcher ?? student ?? voice)?.text ?? '',
    rule: shot.id === 'revelacion',
    exposure: 1-.17*phase(actions.dim,trapFrames-1),
    black: phase(actions.black,trapFrames-1),
  };
}
