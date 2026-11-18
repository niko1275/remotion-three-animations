import {smooth} from '../../components/characters/CharacterAnimations';
import {accusationFrame, shots as accusationShots} from '../la-acusacion/timeline';
import {closingScript} from './script';

type Point = [number, number, number];
export const closingFps = 30;
export const shots = [
  {id: 'regreso', frames: 180},
  {id: 'primera-persona', frames: 210},
  {id: 'enlace', frames: 150},
];

let cursor = 0;
const edit = shots.map(shot => {
  const start = cursor;
  cursor += shot.frames;
  return {...shot, start, end: cursor};
});
export const closingFrames = cursor;

export const narration = [
  {start: edit[0].start+15, frames: 148, text: closingScript[0]},
  {start: edit[1].start+30, frames: 153, text: closingScript[1]},
  {start: edit[2].start+7, frames: edit[2].frames-7, text: closingScript[2]},
];

const opening = accusationFrame(0);

function headCenter(pitch: number, seat: number): Point {
  const c = Math.cos(pitch), s = Math.sin(pitch);
  return [0,.66+.76*c-.24*s,seat+.05-.76*s-.24*c];
}

export function closingFrame(frame: number) {
  const wide = frame < edit[1].start;
  const reconnecting = frame >= edit[2].start;
  const phase = (a:number,b:number) => smooth((frame-a)/(b-a));
  const overview = phase(edit[0].start,edit[0].end-1);
  const focus = phase(edit[1].start+24,edit[2].start);
  const lean = .054+.038*focus;
  const time = frame/closingFps;
  const breath = .0035*Math.sin(time*2.4);
  const studentLean = -.07+.020*overview+breath;
  const studentPitch = .19-.135*phase(edit[0].end-47,edit[0].end);
  const pupil = headCenter(studentLean,1.02);
  const studentYaw = .018*Math.sin(time*.9);
  // The origin is between the eyes, just in front of the face. The push follows
  // the same axis through both POV shots without resetting at the last cut.
  const eyeDistance = .214+.072*focus;
  const eyeY = -.011*Math.cos(studentPitch)-eyeDistance*Math.sin(studentPitch);
  const eyeZ = .011*Math.sin(studentPitch)-eyeDistance*Math.cos(studentPitch);
  const yawZ = eyeZ*Math.cos(studentYaw);
  const eye: Point = [
    eyeZ*Math.sin(studentYaw),
    pupil[1]+eyeY*Math.cos(studentLean)+yawZ*Math.sin(studentLean),
    pupil[2]-eyeY*Math.sin(studentLean)+yawZ*Math.cos(studentLean),
  ];
  const investigator = headCenter(lean+breath,1.02);
  const povTarget: Point = [0,investigator[1]-.018,-investigator[2]-.11];
  const [establish] = accusationShots;
  const camera: Point = wide
    ? [establish.camera[0]-.27*overview,establish.camera[1]-.057*overview,establish.camera[2]-.029*overview]
    : eye;
  const cue = narration.find(c=>frame>=c.start&&frame<c.start+c.frames);
  const base = {
    time, camera, target: wide ? establish.target : povTarget,
    interrogator: [lean+breath,0,-lean+.018,0] as const,
    protagonist: [studentLean,studentYaw,studentPitch,0] as const,
    hands: [0,0] as const,
    caption: cue?.text ?? '',
    captionOpacity: 1,
    closingArms: 1,
  };
  if (!reconnecting) return base;

  // Ease into the actual opening pose. Wind the procedural time forward
  // through zero to carry the same breathing and hand motion over the edit.
  const settle = phase(edit[2].start,closingFrames-1);
  const motionTime = (frame-(closingFrames-1))/closingFps;
  const breathAtJoin = Math.sin(motionTime*2.05);
  const matchPose = (a: readonly [number,number,number,number],
    b: readonly [number,number,number,number]) =>
    [a[0]+(b[0]-a[0])*settle,a[1]+(b[1]-a[1])*settle,
      a[2]+(b[2]-a[2])*settle,a[3]+(b[3]-a[3])*settle] as const;
  return {
    ...base,
    time: motionTime,
    camera: [
      opening.camera[0]-.27*(1-settle),
      opening.camera[1]-.057*(1-settle),
      opening.camera[2]-.029*(1-settle),
    ] as Point,
    target: opening.target,
    interrogator: matchPose(base.interrogator,[
      opening.interrogator[0]+.006*breathAtJoin,opening.interrogator[1]+.012*breathAtJoin,
      opening.interrogator[2],opening.interrogator[3],
    ]),
    protagonist: matchPose([studentLean,studentYaw,.19,0],[
      opening.protagonist[0]+.008*breathAtJoin,opening.protagonist[1]+.011*breathAtJoin,
      opening.protagonist[2],opening.protagonist[3],
    ]),
    hands: opening.hands,
    captionOpacity: 1-phase(closingFrames-7,closingFrames-1),
    closingArms: 1-settle,
  };
}
