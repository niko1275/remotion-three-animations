import {smooth} from '../../components/characters/CharacterAnimations';
import {alt, keys} from './keyboard';

type Vec3 = [number, number, number];
export const experimentFps = 30;
export const studentZ = 1.245;
export const shots = [
  {id: 'laboratorio', frames: 120, camera: [2.72,1.81,.71], target: [-.02,1.19,.55], move: [-.18,-.045,-.075]},
  {id: 'tarea', frames: 150, camera: [2.04,1.93,.89], target: [-.035,1.18,.68], move: [-.045,-.026,-.035]},
  {id: 'regla', frames: 150, camera: [-.47,1.50,.72], target: [alt.x+.030,.991,.560], move: [.028,-.035,-.018]},
  {id: 'anticipacion', frames: 120, camera: [-.29,1.42,.48], target: [alt.x+.045,.993,.570], move: [.060,-.054,.014]},
] satisfies {id: string; frames: number; camera: Vec3; target: Vec3; move: Vec3}[];

let cut = 0;
const edits = shots.map(shot => {
  const start = cut;
  cut += shot.frames;
  return {...shot, start, end: cut};
});
export const experimentFrames = cut;

export function experimentFrame(frame: number) {
  const shot = edits.find(({end}) => frame < end) ?? edits[edits.length - 1];
  const local = Math.max(0, Math.min(shot.frames - 1, frame - shot.start));
  const ease = smooth(local / Math.max(1, shot.frames - 1));
  const camera = shot.camera.map((coordinate, i) => coordinate + ease * shot.move[i]) as Vec3;
  const time = frame / experimentFps;
  const headDip = shot.id === 'regla' || shot.id === 'anticipacion' ? .12 : .035;

  const headYaw = shot.id === 'tarea' ? -.10 * Math.sin(Math.PI * ease) : 0;

  return {
    shot: shot.id,
    local,
    camera,
    target: shot.target,
    time,
    withdrawal: shot.id === 'regla' ? smooth(ease * 13) * (1 - smooth((ease - .26) / .29)) : 0,
    pose: [.062 + .009*Math.sin(time*2.1), headYaw + .025*Math.sin(time*.9), headDip + .022*Math.sin(time*1.7), 0] as const,
  };
}

const typingPatterns = [
  {shot: edits[1], reference: 150, letters: 'F J D K S L A F G', offsets: [6,21,37,55,70,88,105,123,140]},
  {shot: edits[2], reference: 150, letters: 'H R U E', offsets: [83,99,115,131]},
  {shot: edits[3], reference: 120, letters: 'V M C N X V C', offsets: [12,30,48,64,83,97,110]},
];

// Only letter keys can produce a typing event. The last stroke completes before the cut.
const events = typingPatterns.flatMap(({shot, reference, letters, offsets}) => {
  const scale = shot.frames / reference;
  return letters.split(' ').map((letter, i) => {
    if (!/^[A-Z]$/.test(letter)) throw new Error(`Tecla inválida para el dictado: ${letter}`);
    const key = keys.find(key => key.label === letter)!;
    const start = shot.start + offsets[i] * scale;
    const length = Math.min(10, reference - offsets[i]) * scale;
    return {letter, key, start, length, down: start + length / 2, left: key.x < -.015};
  });
});

export function typingFrame(frame: number) {
  // One stroke drives the pose, key travel and displayed letter.
  const stroke = events.find(event => frame >= event.start && frame < event.start + event.length);
  const progress = stroke ? (frame - stroke.start) / stroke.length : 0;
  const reach = stroke ? smooth(progress / .4) * (1 - smooth((progress - .65) / .35)) : 0;
  const travel = stroke ? smooth((progress - .3) / .2) * (1 - smooth((progress - .6) / .3)) : 0;
  const text = events.filter(event => frame >= event.down).map(event => event.letter).join(' ');
  return {stroke, reach, travel, text};
}
