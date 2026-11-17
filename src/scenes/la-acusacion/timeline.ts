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
  pose: 'espera' | 'acusa' | 'niega' | 'duda';
};

export const shots: Shot[] = [
  {duration: 1.6, camera: [4.73, 1.86, .40], target: [0, 1.18, 0], push: .035,
    beat: {speaker: 'silencio', at: 0, duration: 0, text: ''}, pose: 'espera'},
  {duration: 2.25, camera: [.61, 1.57, .53], target: [0, 1.33, -.95], push: .09,
    beat: {speaker: 'interrogador', at: .32, duration: 1.72, text: 'Sabemos que fuiste tú.'}, pose: 'acusa'},
  {duration: 2.17, camera: [.58, 1.54, -.54], target: [0, 1.32, .99], push: .035,
    beat: {speaker: 'protagonista', at: .5, duration: 1.35, text: 'No. Yo no hice nada.'}, pose: 'niega'},
  {duration: 2.18, camera: [.37, 1.52, -.33], target: [0, 1.39, 1.02], push: .12,
    beat: {speaker: 'silencio', at: 0, duration: 0, text: ''}, pose: 'duda'},
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
  const speaking = t >= shot.beat.at && t < shot.beat.at + shot.beat.duration;
  const syllable = speaking ? Math.pow(Math.abs(Math.sin((t - shot.beat.at) * 15)), 1.4) : 0;
  const lean = shot.pose === 'espera' ? .03 * progress : shot.pose === 'acusa' ? .03 + .22 * phase(.08, .72) : .25;
  const recoil = shot.pose === 'niega' ? phase(.10, .54) : shot.pose === 'duda' ? 1 - .22 * progress : 0;
  const shake = shot.pose === 'niega'
    ? Math.sin((t - .4) * 12) * .19 * phase(.28, .5) * (1 - phase(1.03, 1.52))
    : 0;
  const gaze = shot.pose === 'duda' ? .28 * phase(.18, 1.47) : 0;
  const camera = shot.camera.map((value, i) =>
    value + (shot.target[i] - value) * shot.push * progress) as Point;

  return {
    time: current / accusationFps,
    camera,
    target: shot.target,
    caption: speaking ? shot.beat.text : '',
    interrogator: [lean, 0, -.75 * lean, shot.beat.speaker === 'interrogador' ? syllable : 0] as const,
    protagonist: [-.18 * recoil, shake, gaze - .09 * recoil, shot.beat.speaker === 'protagonista' ? syllable : 0] as const,
    hands: [
      shot.pose === 'espera' ? .12 * progress : shot.pose === 'acusa' ? .12 + .88 * phase(.14, .87) : 1,
      recoil * (1 - .13 * gaze),
    ] as const,
  };
}
