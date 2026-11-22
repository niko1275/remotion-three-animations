import {
  CatmullRomCurve3, CylinderGeometry, Group, MathUtils, Mesh, MeshBasicMaterial, RingGeometry,
  SphereGeometry, Vector3,
} from 'three';
import {createVinylStage} from '../vinilo-apertura/render';
import {type Position, type VinylMaterials} from '../vinilo-apertura/materials';
import {contactShade, workRoom} from '../vinilo-produccion/sets';
import {buildAnt} from './ant';
import type {AntTakeId} from './timeline';

const floor = 0.157;
const alarmColor = '#CE762E';
const trailColor = '#16727D';
const smooth = (value: number, start: number, end: number) => MathUtils.smoothstep(value, start, end);

function makeSet(room: Group, m: VinylMaterials) {
  workRoom(room, m, false);
  const tileColors = ['#D1B990', '#D7BE97', '#CDB48C', '#D9C19C'];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      m.block(room, [1.167, 0.043, 1.032], [(col - 3) * 1.18, 0.1355, (row - 2.5) * 1.045 - 0.21],
        tileColors[(col * 3 + row * 7) % tileColors.length], 0.025, false);
    }
  }
  m.block(room, [2.18, 1.29, 0.75], [2.58, 0.807, -2.89], '#748E79', 0.058);
  m.block(room, [2.30, 0.13, 0.83], [2.58, 1.472, -2.89], '#AB9372', 0.048);
  for (const x of [2.11, 3.02]) {
    m.block(room, [0.82, 1.02, 0.035], [x, 0.85, -2.485], '#698276', 0.031);
    m.model(room, new SphereGeometry(0.054, 12, 8), '#E1C593', [x + 0.24, 0.91, -2.451]);
  }
  m.model(room, new CylinderGeometry(0.25, 0.18, 0.39, 12), '#A76B52', [2.90, 1.735, -3.05], true);
  const leaf = new SphereGeometry(1, 14, 10);
  for (const [x, y, z, tilt] of [[-0.04, 2.20, 0, 0.20], [0.15, 2.06, 0.09, -0.58], [-0.19, 2.01, -0.01, 0.68]]) {
    const sprig = m.model(room, leaf, '#819957', [2.90 + x, y, -3.05 + z]);
    sprig.scale.set(0.13, 0.29, 0.085);
    sprig.rotation.z = tilt;
  }
  contactShade(room, m, 2.2, 0.84, [2.58, floor + 0.003, -2.79]);
}

function makeShoe(room: Group, m: VinylMaterials) {
  const shoe = new Group();
  room.add(shoe);
  m.block(shoe, [1.46, 0.17, 2.32], [0, 0.085, 0], '#3B332C', 0.07);
  m.block(shoe, [1.45, 0.118, 2.28], [0, 0.202, 0], '#D4BA93', 0.05, false);
  const upper = m.model(shoe, new SphereGeometry(1, 24, 18), '#647C72', [0, 0.40, 0.02], true);
  upper.scale.set(0.695, 0.36, 1.08);
  m.block(shoe, [1.06, 0.69, 0.94], [0, 0.64, -0.51], '#5F756B', 0.22);
  m.block(shoe, [0.91, 2.3, 0.83], [0, 2.02, -0.56], '#4A5560', 0.18);
  m.block(shoe, [0.99, 0.19, 0.92], [0, 1.02, -0.56], '#54616C', 0.06);
  for (let i = 0; i < 4; i++) {
    const lace = m.block(shoe, [0.62 - i * 0.03, 0.043, 0.068], [0, 0.757 - i * 0.019, 0.04 + i * 0.16], '#EEE0C5', 0.017, false);
    lace.rotation.y = i % 2 === 0 ? 0.22 : -0.22;
  }
  shoe.traverse((part) => {part.castShadow = false;});
  return shoe;
}

function makeFood(room: Group, m: VinylMaterials) {
  const food = new Group();
  room.add(food);
  const pieces = [
    [0.04, 0.02, 0.63], [0.40, 0.24, 0.39], [-0.27, 0.14, 0.30], [0.27, -0.33, 0.32],
    [-0.18, -0.38, 0.22], [0.70, -0.06, 0.15],
  ];
  pieces.forEach(([x, z, size], index) => {
    const crumb = m.block(food, [size, size * 0.51, size * 0.77], [x, size * 0.24, z],
      index % 3 === 0 ? '#B27742' : '#C39157', size * 0.14);
    crumb.castShadow = false;
    crumb.rotation.y = index * 1.14;
    m.block(crumb, [size * 0.49, 0.018, size * 0.48], [0.007, size * 0.259, 0.022], '#E5BB77', 0.014, false);
  });
  return food;
}

const curve = (points: readonly Position[]) => new CatmullRomCurve3(points.map(([x, , z]) => new Vector3(x, floor, z)));
const trailPath = curve([
  [-1.37, 0, 2.91], [-1.37, 0, 1.64], [-0.83, 0, 0.54], [0.08, 0, -0.01],
  [0.89, 0, -0.49], [1.30, 0, -1.23], [1.53, 0, -1.94],
]);
const shortPath = curve([
  [-2.11, 0, 1.53], [-1.16, 0, 1.62], [-0.34, 0, 1.69], [0.58, 0, 1.61], [1.60, 0, 1.18],
]);
const alarmPaths = [
  curve([[-2.81, 0, 0.77], [-1.84, 0, 0.86], [-1.17, 0, 0.59], [-0.93, 0, 0.48]]),
  curve([[1.81, 0, 2.78], [1.68, 0, 1.82], [1.02, 0, 1.13], [0.72, 0, 0.91]]),
  curve([[2.62, 0, -1.12], [1.78, 0, -1.02], [1.16, 0, -0.70], [0.90, 0, -0.37]]),
  curve([[-1.10, 0, -2.71], [-0.81, 0, -1.84], [-0.46, 0, -1.13], [-0.23, 0, -0.75]]),
];

export function createAntStage(canvas: HTMLCanvasElement, width: number, height: number) {
  const stage = createVinylStage(canvas, width, height);
  const {room, materials: m, camera} = stage;
  makeSet(room, m);
  const shoe = makeShoe(room, m);
  const food = makeFood(room, m);
  const actors = [1, 0.85, 0.92, 0.81, 0.76, 0.73].map((scale) => buildAnt(room, m, scale));
  const focus = new Vector3();
  const point = new Vector3();
  const tangent = new Vector3();
  const shoeContact = new Mesh(new SphereGeometry(1, 20, 10), new MeshBasicMaterial({
    transparent: true, opacity: 0.23, color: '#6C5543', depthWrite: false,
  }));
  shoeContact.scale.set(0.75, 0.008, 1.01);
  room.add(shoeContact);

  const ringGeometry = new RingGeometry(0.956, 1, 84);
  const waves = Array.from({length: 3}, () => {
    const ring = new Mesh(ringGeometry, new MeshBasicMaterial({color: alarmColor, transparent: true, depthWrite: false}));
    ring.rotation.x = -Math.PI / 2;
    room.add(ring);
    return ring;
  });
  const moteGeometry = new SphereGeometry(0.042, 10, 8);
  const chemical = Array.from({length: 23}, () => {
    const mote = new Mesh(moteGeometry, new MeshBasicMaterial({color: '#E2A759', transparent: true, depthWrite: false}));
    room.add(mote);
    return mote;
  });
  const stitchGeometry = new CylinderGeometry(0.057, 0.052, 0.013, 12);
  const stitches = Array.from({length: 38}, () => {
    const stitch = new Mesh(stitchGeometry, new MeshBasicMaterial({color: trailColor, transparent: true, depthWrite: false}));
    room.add(stitch);
    return stitch;
  });

  function walking(i: number, path: CatmullRomCurve3, u: number, t: number, stride: number, shiftZ = 0) {
    const s = MathUtils.clamp(u, 0, 1);
    path.getPointAt(s, point);
    tangent.subVectors(path.getPointAt(Math.min(1, s + 0.009)), path.getPointAt(Math.max(0, s - 0.009)));
    actors[i].pose(point.x, floor, point.z + shiftZ, Math.atan2(tangent.x, tangent.z), t + i * 0.31, stride);
  }

  function mist(t: number, amount: number, x: number, z: number, spread: number) {
    chemical.forEach((mote, i) => {
      const phase = (t * (0.34 + (i % 3) * 0.06) + i * 0.237) % 1;
      const angle = i * 2.39996 + t * 0.14;
      const r = spread * (0.15 + 0.86 * phase);
      mote.position.set(x + Math.cos(angle) * r, floor + 0.17 + 0.27 * Math.sin(Math.PI * phase), z + Math.sin(angle) * r);
      mote.scale.setScalar(0.56 + 0.56 * ((i % 5) / 4));
      mote.material.opacity = amount * Math.sin(phase * Math.PI) * 0.84;
      mote.visible = amount > 0;
    });
  }

  function radiation(t: number, intensity: number, x: number, z: number, span: number) {
    mist(t, intensity, x, z, span * 0.62);
    waves.forEach((ring, i) => {
      const phase = (t * 0.53 + i / waves.length) % 1;
      const radius = span * (0.13 + 0.87 * phase);
      ring.position.set(x, floor + 0.006, z);
      ring.scale.setScalar(radius);
      ring.material.opacity = 0.63 * intensity * Math.sin(phase * Math.PI);
      ring.visible = intensity > 0;
    });
  }

  function layTrail(path: CatmullRomCurve3, t: number, amount: number) {
    stitches.forEach((stitch, i) => {
      const u = i / (stitches.length - 1);
      path.getPointAt(u, point);
      stitch.position.set(point.x, floor + 0.01, point.z);
      stitch.material.opacity = (0.76 + 0.12 * Math.sin(t * 4 - u * 19)) * amount;
      stitch.visible = amount > 0;
    });
  }

  function shoot(t: number, at: Position, distance: number, yaw: number, elevation: number, exposure = 1.11) {
    focus.set(...at);
    camera.position.set(Math.sin(yaw) * Math.cos(elevation), Math.sin(elevation), Math.cos(yaw) * Math.cos(elevation))
      .multiplyScalar(distance).add(focus);
    camera.near = 0.02;
    stage.render(t, focus, exposure, {beam: false, dust: false});
  }

  function draw(id: AntTakeId, p: number, t: number) {
    actors.forEach(({root}) => {root.visible = false;});
    waves.forEach((ring) => {ring.visible = false;});
    chemical.forEach((mote) => {mote.visible = false;});
    stitches.forEach((stitch) => {stitch.visible = false;});
    shoe.visible = false;
    shoeContact.visible = false;
    food.visible = false;

    if (id === 'gancho') {
      const descent = smooth(p, 0.09, 0.205);
      const clearance = 2.45 * (1 - descent);
      const lift = smooth(p, 0.244, 0.395);
      shoe.visible = p >= 0.08 && p < 0.395;
      shoe.position.set(-0.09 - 2.14 * lift, floor + clearance + 1.84 * lift, 0.19 - 0.66 * lift);
      shoe.rotation.set(-0.04 * (1 - descent) - 0.16 * lift, 0.28, 0.07 * lift);
      shoeContact.visible = shoe.visible;
      shoeContact.position.set(shoe.position.x, floor + 0.004, shoe.position.z);
      shoeContact.material.opacity = descent * (1 - lift) * 0.31;

      // Compare the closing sole to the standing ant's height. Lifting the shoe leaves the body flat.
      const squash = 1 - smooth(clearance, 0.052, 0.42);
      const stop = smooth(p, 0.145, 0.185);
      actors[0].pose(-0.27 + 0.30 * smooth(p, 0, 0.182), floor, 0.19, 1.03, t, 1 - stop, {squash});

      alarmPaths.slice(0, 3).forEach((path, i) => {
        const entrance = smooth(p, 0.66 + i * 0.039, 0.98);
        if (entrance > 0) walking(i + 1, path, 0.12 + 0.82 * entrance, t, 0.91 * (1 - smooth(entrance, 0.87, 1)));
      });
      const reveal = smooth(p, 0.32, 0.45);
      const pull = smooth(p, 0.63, 0.98);
      shoot(t, [-0.16 + 0.19 * reveal, 0.27 - 0.073 * reveal, 0.18], 6.25 - 0.55 * reveal + 4.70 * pull,
        0.16, 0.70 + 0.11 * reveal + 0.19 * pull, 1.15);
      return;
    }

    if (id === 'senales') {
      const near = smooth(p, 0.10, 0.66);
      actors[0].pose(-0.74, floor, 0.08, 1.42, t, 0.03);
      actors[1].pose(1.24 - 0.47 * near, floor, 0.20, -1.60, t, 0.66 * (1 - near));
      mist(t, smooth(p, 0.11, 0.28) * (1 - 0.17 * smooth(p, 0.86, 1)), 0.02, 0.20, 0.70);
      shoot(t, [0.20 - 0.18 * near, 0.36, 0.16], 9.9 - 1.06 * smooth(p, 0.07, 0.94), 0.04, 0.84, 1.16);
      return;
    }

    if (id === 'alarma') {
      actors[0].pose(0, floor, 0.19, 1.05, t, 0, {rest: 0.91});
      const show = smooth(p, 0.09, 0.29);
      radiation(t, show, 0.02, 0.20, 2.62);
      alarmPaths.forEach((path, i) => {
        const a = smooth(p, 0.15 + i * 0.055, 0.80 + i * 0.041);
        walking(i + 1, path, 0.12 + a * 0.86, t, 0.94 * (1 - smooth(a, 0.86, 1)));
      });
      const reveal = smooth(p, 0.12, 0.62);
      shoot(t, [0, 0.25, 0.18], 10.9 + 2.10 * reveal, 0.11, 1.13 + 0.04 * reveal, 1.13);
      return;
    }

    if (id === 'rastro') {
      food.visible = true;
      food.position.set(1.60, floor, -2.14);
      layTrail(trailPath, t, 0.95);
      for (let i = 0; i < 5; i++) {
        const u = 0.45 - i * 0.214 + p * 0.52;
        if (u >= 0) walking(i, trailPath, u, t, 0.79 * (1 - smooth(u, 0.86, 0.97)));
      }
      shoot(t, [0.29, 0.19, 0.42], 15.9 - 0.88 * smooth(p, 0.27, 0.96), 0.16, 1.18, 1.12);
      return;
    }

    const compare = smooth(p, 0, 0.18);
    actors[0].pose(-0.03, floor, -1.42, 0.86, t, 0, {rest: 0.91});
    walking(1, alarmPaths[0], 0.72 + 0.24 * compare, t, 0.42 * (1 - compare), -1.62);
    walking(2, alarmPaths[2], 0.72 + 0.24 * compare, t, 0.42 * (1 - compare), -1.62);
    radiation(t, 0.86, -0.04, -1.41, 1.52);
    food.visible = true;
    food.position.set(1.84, floor, 1.13);
    layTrail(shortPath, t, 0.89);
    for (let i = 0; i < 3; i++) walking(3 + i, shortPath, 0.03 + i * 0.31 + p * 0.25, t, 0.73);
    shoot(t, [0.16, 0.21, -0.13], 16.35 - 0.5 * smooth(p, 0.40, 1), 0.04, 1.16, 1.13);
  }

  return {draw, dispose: stage.dispose};
}
