import {Vector3} from 'three';
import {keyboardZ} from './keyboard';
import {studentZ, typingFrame} from './timeline';

export const upperArmLength = .284;
export const forearmLength = .424;

export type HandHover = {x: number; z: number; reach: number; lift: number};

export function armPose(left: boolean, motion: ReturnType<typeof typingFrame>, time: number, withdrawal: number, lean: number, hover?: HandHover, wristTarget?: Vector3) {
  const side = left ? -1 : 1;
  const wrist = new Vector3(
    side * (.134 + .026 * withdrawal),
    1.053 + .002 * Math.sin(time * 2.4 + side),
    keyboardZ + .232 + .065 * withdrawal - studentZ,
  );
  const {stroke, travel} = motion;
  const reach = hover?.reach ?? (stroke?.left === left ? motion.reach : 0);
  if (hover) {
    wrist.lerp(new Vector3(hover.x + side * .026,
      1.041 + hover.lift, hover.z + .135 - studentZ), reach);
  } else if (stroke && reach > 0) {
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

  if (wristTarget) wrist.copy(wristTarget);

  // The shoulder socket sits high on the side of the shirt, above the elbow.
  const shoulder = new Vector3(side * .152,
    .66 + Math.cos(lean) * .479 - Math.sin(lean) * .142,
    .05 - Math.sin(lean) * .479 - Math.cos(lean) * .142);

  const axis = wrist.clone().sub(shoulder);
  const distance = axis.length();
  axis.divideScalar(distance);

  const along = (upperArmLength ** 2 - forearmLength ** 2 + distance ** 2) / (2 * distance);
  const bend = Math.sqrt(Math.max(0, upperArmLength ** 2 - along ** 2));
  const center = shoulder.clone().addScaledVector(axis, along);
  const elbowAt = (lift: number) => {
    const pole = new Vector3(side * (.39 + .61 * lift), -.92 * (1 - lift), 0);
    pole.addScaledVector(axis, -pole.dot(axis)).normalize();
    return center.clone().addScaledVector(pole, bend);
  };

  // Keep the natural downward bend whenever its sleeve clears the desktop.
  // Swing out gradually, without moving the wrist, when a longer reach needs room.
  let elbow = elbowAt(0);
  if (!clearsDesktop(shoulder, elbow, wrist)) {
    let low = 0;
    let high = 1;
    for (let i = 0; i < 12; i++) {
      const mid = (low + high) / 2;
      if (clearsDesktop(shoulder, elbowAt(mid), wrist)) high = mid;
      else low = mid;
    }
    elbow = elbowAt(high);
  }
  return {shoulder, elbow, wrist, yaw, reach};
}

export const sleeve = {
  shoulder: .070,
  elbow: .046,
  cuff: .033,
  cuffPosition: .91,
};

// Conservatively bound the desktop by the two planes at its top and near edge.
// A tapered segment is clear if its lower edge stays above the top wherever
// its forward edge reaches the tabletop. Both edges are linear along the sleeve.
function clearsDesktop(shoulder: Vector3, elbow: Vector3, wrist: Vector3) {
  const cutoff = .92 - studentZ;
  const surface = .958;
  const clear = (a: Vector3, b: Vector3, ra: number, rb: number) => {
    const frontA = a.z - ra - cutoff;
    const frontB = b.z - rb - cutoff;
    if (frontA > 0 && frontB > 0) return true;
    const belowA = a.y - ra - surface;
    const belowB = b.y - rb - surface;
    if ((frontA <= 0 && belowA < 0) || (frontB <= 0 && belowB < 0)) return false;
    if ((frontA > 0) === (frontB > 0)) return true;
    const crossing = frontA / (frontA - frontB);
    return belowA + (belowB - belowA) * crossing >= 0;
  };
  const cuff = elbow.clone().lerp(wrist, sleeve.cuffPosition);
  return clear(shoulder, elbow, sleeve.shoulder, sleeve.elbow)
    && clear(elbow, cuff, sleeve.elbow, sleeve.cuff)
    && clear(cuff, wrist, .027, .027);
}
