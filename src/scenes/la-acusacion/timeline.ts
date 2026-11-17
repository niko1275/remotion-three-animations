import {smooth} from '../../components/characters/CharacterAnimations';

type Point = [number, number, number];
type Beat = {at: number; text: string} & (
  {speaker: 'interrogador' | 'protagonista'; duration: number} |
  {speaker: 'silencio'; duration: 0}
);
type Shot = {
  duration: number;
  camera: Point;
  target: Point;
  push: number;
  beat: Beat;
  pose: 'espera' | 'acusa' | 'niega' | 'presiona';
};

export const shots: Shot[] = [
  {duration: 1.7, camera: [4.73, 1.86, .40], target: [0, 1.18, 0], push: .035,
    beat: {speaker: 'silencio', at: 0, duration: 0, text: ''}, pose: 'espera'},
  {duration: 3.05, camera: [.61, 1.57, .53], target: [0, 1.32, -.92], push: .065,
    beat: {speaker: 'interrogador', at: .38, duration: 2.28, text: 'Fuiste tú. Presionaste la tecla.'}, pose: 'acusa'},
  {duration: 3.2, camera: [.58, 1.54, -.54], target: [0, 1.32, .99], push: .04,
    beat: {speaker: 'protagonista', at: .48, duration: 2.38, text: 'No. Estoy seguro de que no fui yo.'}, pose: 'niega'},
  {duration: 4.1, camera: [.43, 1.59, -1.86], target: [-.04, 1.28, 1.02], push: .035,
    beat: {speaker: 'interrogador', at: .42, duration: 2.76, text: 'Entonces, ¿por qué ella dice que te vio hacerlo?'}, pose: 'presiona'},
];

export const accusationFps = 30;
// Round each cut once so the registered duration and frame lookup agree after edits.
let nextCut = 0;
const shotsInFrames = shots.map(shot => {
  const frames = Math.max(1, Math.round(shot.duration * accusationFps));
  const start = nextCut;
  nextCut += frames;
  return {...shot, start, frames};
});
export const accusationFrames = nextCut;

export function accusationFrame(frame: number) {
  const current = Math.max(0, Math.min(accusationFrames - 1, frame));
  const shot = shotsInFrames.find(shot => current < shot.start + shot.frames)!;
  const elapsed = current - shot.start;
  const t = elapsed / accusationFps;
  const progress = smooth(elapsed / Math.max(1, shot.frames - 1));
  const phase = (a: number, b: number) => smooth((t - a) / (b - a));
  const voiceTime = t - shot.beat.at;
  const speaking = voiceTime >= 0 && voiceTime < shot.beat.duration;
  const syllable = speaking ? Math.pow(Math.abs(Math.sin(voiceTime * 15)), 1.4) : 0;
  const accusing = shot.pose === 'acusa';
  const denying = shot.pose === 'niega';
  const pressing = shot.pose === 'presiona';
  const anticipation = shot.pose === 'espera' ? .09 * progress : .09;
  const plant = accusing ? phase(.10, .74) : denying || pressing ? 1 : 0;
  const emphasis = pressing ? phase(.46, .84) * (1 - phase(2.70, 3.44)) : 0;
  const lean = .12 + anticipation + .10 * plant + .025 * emphasis;
  const recoil = denying ? phase(.08, .57) : pressing ? 1 - .12 * phase(.2, 2.6) : 0;
  const shake = denying ? Math.sin((voiceTime - .04) * 10) * .14 * phase(.25, .54) * (1 - phase(1.10, 1.67)) : 0;
  const gaze = pressing ? .20 * phase(1.1, 2.45) + .056 * phase(2.9, 3.7) : 0;
  const breath = Math.sin(current / accusationFps * 2.05);
  const camera = shot.camera.map((value, i) =>
    value + (shot.target[i] - value) * shot.push * progress) as Point;

  return {
    time: current / accusationFps,
    camera,
    target: shot.target,
    caption: speaking ? shot.beat.text : '',
    interrogator: [lean + .006 * breath, .014 * breath, -.87 * lean + .025 * emphasis, shot.beat.speaker === 'interrogador' ? syllable : 0] as const,
    protagonist: [-.035 - .175 * recoil + .009 * breath, shake + .014 * breath, .035 + gaze - .06 * recoil, shot.beat.speaker === 'protagonista' ? syllable : 0] as const,
    hands: [.20 + .60 * plant + .10 * emphasis, .22 + .74 * recoil] as const,
  };
}
