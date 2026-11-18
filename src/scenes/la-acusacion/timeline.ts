import {smooth} from '../../components/characters/CharacterAnimations';

type Point = [number, number, number];
type Dialogue = {
  speaker: 'interrogador' | 'protagonista';
  text: string;
  offset: number;
  frames: number;
  pause?: [from: number, to: number];
};
type Shot = {
  id: 'general' | 'investigador' | 'estudiante' | 'hombro';
  frames: number;
  camera: Point;
  target: Point;
  push?: number;
  dialogue?: Dialogue;
};

// At 30 fps, dialogue offsets are relative to the cut and pauses to the cue.
export const accusationFps = 30;
export const shots: Shot[] = [
  {id: 'general', frames: 42, camera: [4.73, 1.86, .40], target: [0, 1.18, 0]},
  {id: 'investigador', frames: 93, camera: [.61, 1.57, .53], target: [0, 1.32, -.92]},
  {id: 'estudiante', frames: 96, camera: [.58, 1.54, -.54], target: [0, 1.32, .99],
    dialogue: {speaker: 'protagonista', offset: 14, frames: 72, pause: [7, 14],
      text: 'No. Estoy seguro de que no fui yo.'}},
  {id: 'hombro', frames: 123, camera: [.43, 1.59, -1.86], target: [-.04, 1.28, 1.02], push: .035,
    dialogue: {speaker: 'interrogador', offset: 13, frames: 83,
      text: 'Entonces, ¿por qué ella dice que te vio hacerlo?'}},
];

let nextCut = 0;
const edit = shots.map(shot => {
  const {dialogue} = shot;
  if (!Number.isInteger(shot.frames) || shot.frames < 1) {
    throw new Error(`Duración de plano inválida: ${shot.id}`);
  }
  if (dialogue && (!Number.isInteger(dialogue.offset) || dialogue.offset < 0
    || !Number.isInteger(dialogue.frames) || dialogue.frames < 1
    || dialogue.offset + dialogue.frames > shot.frames)) {
    throw new Error(`El diálogo queda fuera del plano: ${shot.id}`);
  }
  if (dialogue?.pause) {
    const [from, to] = dialogue.pause;
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to <= from || to > dialogue.frames) {
      throw new Error(`Pausa de diálogo inválida: ${shot.id}`);
    }
  }

  const start = nextCut;
  nextCut += shot.frames;
  const cue = dialogue && {
    ...dialogue,
    start: start + dialogue.offset,
    end: start + dialogue.offset + dialogue.frames,
  };
  return {...shot, start, end: nextCut, cue};
});

export const accusationFrames = nextCut;
// Absolute frame positions for an editor or a future audio Sequence.
const openingDialogue = {
  shot: 'general', speaker: 'interrogador', offset: 0, start: 0, frames: 68, end: 68,
  pause: [19,25], text: 'Fuiste tú. Presionaste la tecla.',
} as const;
export const accusationCues = [openingDialogue, ...edit.flatMap(({id, cue}) => cue ? [{shot: id, ...cue}] : [])];

function articulation(frame: number, start: number, end: number) {
  if (frame < start || frame >= end) return 0;
  const ease = smooth((frame - start) / 3) * smooth((end - frame) / 3);
  return ease * Math.pow(Math.abs(Math.sin((frame - start) * .43)), 1.4) * .63;
}

export function accusationFrame(frame: number) {
  const current = Math.max(0, Math.min(accusationFrames - 1, frame));
  const shot = edit.find(({end}) => current < end)!;
  const elapsed = current - shot.start;
  const progress = elapsed / Math.max(1, shot.frames - 1);
  const phase = (a: number, b: number) => smooth((progress - a) / (b - a));
  const cue = current < openingDialogue.end ? openingDialogue : shot.cue;
  const speaking = cue && current >= cue.start && current < cue.end;
  const pause = cue?.pause && cue.pause.map(offset => cue.start + offset);
  const mouth = !cue ? 0 : pause && current < pause[1]
    ? articulation(current, cue.start, pause[0])
    : articulation(current, pause?.[1] ?? cue.start, cue.end);

  const wide = shot.id === 'general';
  const accusation = shot.id === 'investigador';
  const denial = shot.id === 'estudiante';
  const overShoulder = shot.id === 'hombro';
  const setHands = wide ? 0 : accusation ? phase(.06, .28) : 1;
  const lean = .12 + .09 * (wide ? phase(.28, 1) : 1) + .10 * setHands;
  const recoil = denial ? phase(.08, .30) : overShoulder ? 1 - .11 * phase(.40, .72) : 0;
  const shake = denial ? .085 * (phase(.10, .19) - 1.65 * phase(.20, .31) + .65 * phase(.32, .45)) : 0;
  const pressure = overShoulder ? phase(.16, .34) * (1 - phase(.54, .75)) : 0;
  const gaze = overShoulder ? .19 * phase(.40, .70) + .05 * phase(.74, .94) : 0;
  const time = current / accusationFps;
  const breath = Math.sin(time * 2.05);
  const push = (shot.push ?? 0) * phase(.12, 1);
  const camera = shot.camera.map((value, i) => value + (shot.target[i] - value) * push) as Point;

  return {
    time,
    camera,
    target: shot.target,
    caption: speaking && current >= 3 ? cue.text : '',
    interrogator: [
      lean + .006 * breath + .018 * pressure,
      .012 * breath,
      -.87 * lean + .018 * pressure,
      cue?.speaker === 'interrogador' ? mouth : 0,
    ] as const,
    protagonist: [
      -.035 - .175 * recoil + .008 * breath,
      shake + .011 * breath,
      .035 + gaze - .06 * recoil,
      cue?.speaker === 'protagonista' ? mouth : 0,
    ] as const,
    hands: [.20 + .60 * setHands + .07 * pressure, .22 + .74 * recoil] as const,
  };
}
