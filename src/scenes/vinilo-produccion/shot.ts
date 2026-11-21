import {MathUtils, Vector3} from 'three';
import type {PerspectiveCamera} from 'three';
import type {Position} from '../vinilo-apertura/materials';

export const ease = (start: number, end: number, progress: number) =>
  MathUtils.smoothstep(progress, start, end);
export const mix = MathUtils.lerp;

export type Shot = {focus: Vector3; exposure?: number; atmosphere?: {beam: boolean; dust: boolean}};
export type Motion = (camera: PerspectiveCamera, progress: number, t: number, frame: number, durationInFrames: number) => Shot;

export function pose(camera: PerspectiveCamera, from: Position, to: Position, focus: Position, progress: number) {
  camera.position.set(...from).lerp(new Vector3(...to), progress);
  camera.near = 0.01;
  return new Vector3(...focus);
}
