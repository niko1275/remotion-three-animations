import {Vector3} from 'three';
import {smooth} from '../../components/characters/CharacterAnimations';
import {alt} from '../el-experimento/keyboard';
import {studentZ, typingFrame} from '../el-experimento/timeline';
import {memoryFrame, shots as memoryShots} from '../el-falso-recuerdo/timeline';
import {resultsScript} from './script';
import {signature, signaturePoint} from './signature';

type Point = [number,number,number];
type Shot = {id: string; frames: number; camera: Point; target: Point; push: number};
export const resultsFps = 30;
export const shots: Shot[] = [
  {id: 'confesion', frames: 150, camera: [.97,1.66,1.40], target: [.40,1.03,.67], push: .19},
  {id: 'culpa', frames: 150, camera: [-.76,1.60,.52], target: [0,1.32,1.055], push: .09},
  {id: 'fragmentos', frames: 120, camera: [0,0,0], target: [0,0,0], push: 0},
  {id: 'verdad', frames: 120, camera: [-.30,1.28,.66], target: [alt.x+.005,1.00,alt.z], push: .30},
];

let cut = 0;
const edit = shots.map(shot => {
  const start = cut;
  cut += shot.frames;
  return {...shot, start, end: cut};
});
export const resultsFrames = cut;
export const narration = [
  {start: edit[0].start+5, frames: 48, text: resultsScript[0]},
  {start: edit[0].start+58, frames: 89, text: resultsScript[1]},
  {start: edit[1].start+28, frames: 105, text: resultsScript[2]},
  {start: edit[2].start+5, frames: 110, text: resultsScript[3]},
  {start: edit[3].start+16, frames: 87, text: resultsScript[4]},
];
const fragments = memoryShots.map((shot,i) => ({
  ...shot,
  start: memoryShots.slice(0,i).reduce((sum,s)=>sum+s.frames,0),
})).filter(shot => shot.fragment);
const idle = typingFrame(0);
const gripDistance = .088;

export function resultsFrame(frame: number) {
  const shot = edit.find(shot=>frame<shot.end) ?? edit[edit.length-1];
  const local = frame-shot.start;
  const progress = local/Math.max(1,shot.frames-1);
  const phase = (a:number,b:number) => smooth((progress-a)/(b-a));
  const motion = idle;
  const camera = shot.camera.map((p,i) => p+(shot.target[i]-p)*shot.push*phase(0,1)) as Point;
  const time = frame/resultsFps;
  const common = {shot: shot.id, motion, time, leftHover: undefined, rightWrist: undefined as Vector3 | undefined,
    camera, target: shot.target, withdrawal: .96, imagining: false, paper: false,
    signature: 0, pen: [0,0,0] as Point, penAxis: new Vector3(-.38,.54,.75).normalize(), black: 0, isolate: 0, graphicOpacity: phase(.14,.26),
    pose: [.035,0,.14,0] as const,
  };
  if (shot.id === 'confesion') {
    const signatureProgress = phase(.28,.82)*(signature.length-1);
    const [x,z] = signaturePoint(signatureProgress);
    const lift = .040*(1-phase(.1,.28)) + .040*phase(.82,.98);
    const pen = new Vector3(x,.965+lift,z);
    const penAxis = new Vector3(-.44+.065*Math.sin(signatureProgress*.22),.56,.70).normalize();
    const across = new Vector3(penAxis.z,0,-penAxis.x).normalize();
    const up = penAxis.clone().cross(across);
    const rightWrist = pen.clone().addScaledVector(penAxis,gripDistance+.031)
      .addScaledVector(across,.074).addScaledVector(up,-.011);
    rightWrist.z -= studentZ;
    return {
      ...common, paper: true, signature: signatureProgress,
      pen: pen.toArray(), penAxis, rightWrist,
      pose: [.066, -.19, .37, 0] as const,
      graphicOpacity: phase(.38,.5),
    };
  }
  if (shot.id === 'culpa') {
    const doubt = phase(.12,.82);
    return {...common, withdrawal: .90+.09*doubt, isolate: .28+.48*doubt,
      pose: [-.018-.022*doubt,.12-.05*doubt,.12+.32*doubt,0] as const};
  }
  if (shot.id === 'fragmentos') {
    const reel = Math.min(2,Math.floor(progress*3));
    const slice = fragments[reel];
    const playback = Math.round(slice.frames*(.28+.62*(progress*3-reel)));
    const recalled = memoryFrame(slice.start+playback);
    return {...common, ...recalled, imagining: true, isolate: .31, graphicOpacity: phase(0,.10)};
  }
  return {...common, black: phase(.90,1), graphicOpacity: phase(.13,.24)};
}
