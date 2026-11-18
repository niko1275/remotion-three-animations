import {Vector3} from 'three';
import {keyboardZ} from './keyboard';
import {studentZ, typingFrame} from './timeline';

export const upperArmLength = .275;
export const forearmLength = .329;

export function armPose(left: boolean, motion: ReturnType<typeof typingFrame>, time: number, withdrawal: number, lean: number) {
  const side = left ? -1 : 1;
  const wrist = new Vector3(
    side * (.134 + .026 * withdrawal),
    1.053 + .002 * Math.sin(time * 2.4 + side),
    keyboardZ + .232 + .065 * withdrawal - studentZ,
  );
  const {stroke, travel} = motion;
  const reach = stroke?.left === left ? motion.reach : 0;
  if (stroke && reach > 0) {
    wrist.lerp(new Vector3(stroke.key.x + side * .026,
      1.041 - .010 * travel, stroke.key.z + .135 - studentZ), reach);
  }

  const yaw = side * (.18 - .065 * reach);
  // Rotate about the index tip to keep the same point of contact in keyboard space.
  const indexX = -side * .026;
  const indexZ = -.116 - .019 * reach;
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  wrist.x += indexX - (cos * indexX + sin * indexZ);
  wrist.z += indexZ - (-sin * indexX + cos * indexZ);

  // Rotate the shoulder about the same seated hip pivot as the torso shader.
  const shoulder = new Vector3(side * .167,
    .66 + Math.cos(lean) * .435 - Math.sin(lean) * .18,
    .05 - Math.sin(lean) * .435 - Math.cos(lean) * .18);
  const axis = wrist.clone().sub(shoulder);
  const distance = axis.length();
  axis.divideScalar(distance);

  // The upper arm and forearm meet on a circle perpendicular to the reach.
  const along = (upperArmLength ** 2 - forearmLength ** 2 + distance ** 2) / (2 * distance);
  const bend = Math.sqrt(Math.max(0, upperArmLength ** 2 - along ** 2));
  const pole = new Vector3(side, -.18, 0);
  pole.addScaledVector(axis, -pole.dot(axis)).normalize();
  const elbow = shoulder.clone().addScaledVector(axis, along).addScaledVector(pole, bend);
  return {shoulder, elbow, wrist, yaw, reach};
}
