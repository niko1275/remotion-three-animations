import {
  CatmullRomCurve3, Color, Curve, CylinderGeometry, Group, Mesh, MeshBasicMaterial,
  TubeGeometry, Vector3,
} from 'three';
import {palette, vector, type VinylMaterials} from '../vinilo-apertura/materials';
import {TAU} from '../vinilo-apertura/vinyl';
import {buildFigure} from './figure';
import {grooveSample, leftWall, rightWall, profileEye, profileFocus, profilePosition} from './groove';
import {bench, contactShade, workRoom} from './sets';
import {ease, mix, pose, type Motion} from './shot';

const cuttingTurns = 8;
const cuttingSteps = 224;
const cuttingSides = 5;

function cuttingRadius(turn: number) {
  return 1.07 - 0.103 * turn + 0.023 * Math.sin(turn * TAU * 7.5) + 0.003 * Math.sin(turn * TAU * 17);
}

class CuttingSpiral extends Curve<Vector3> {
  constructor() {
    super();
  }

  getPoint(progress: number, target = new Vector3()) {
    const turn = progress * cuttingTurns;
    const angle = -turn * TAU;
    const r = cuttingRadius(turn);
    return target.set(r * Math.cos(angle), 0.001, r * Math.sin(angle));
  }

  // Use equal steps in disc rotation so the growing line ends at the cutter.
  getUtoTmapping(progress: number) {
    return progress;
  }
}

function studio(room: Group, m: VinylMaterials) {
  workRoom(room, m, false);
  m.block(room, [1.32, 2.13, 0.63], [2.75, 1.25, -2.67], palette.slate, 0.06);
  for (let row = 0; row < 5; row++) {
    const y = 0.52 + row * 0.35;
    m.block(room, [1.18, 0.255, 0.053], [2.75, y, -2.32], row % 2 ? '#82918A' : '#4B575B', 0.023);
    for (let i = 0; i < 3; i++) {
      const knob = m.model(room, new CylinderGeometry(0.064, 0.064, 0.05, 14), i === 2 ? palette.warm : palette.nickel,
        [2.36 + i * 0.27, y, -2.279]);
      knob.rotation.x = Math.PI / 2;
    }
  }
  contactShade(room, m, 1.68, 1.04, [2.75, 0.128, -2.67]);
}

export function buildCutting(room: Group, m: VinylMaterials): Motion {
  studio(room, m);
  bench(room, m, -0.31, -0.62, 4.48, 2.97);
  const centerX = -0.66;
  const centerZ = -0.46;
  m.block(room, [3.88, 0.31, 2.73], [-0.35, 1.48, -0.60], '#596966', 0.063);
  m.model(room, new CylinderGeometry(1.24, 1.24, 0.16, 75), '#626F70', [centerX, 1.69, centerZ], true);
  const disk = new Group();
  disk.position.set(centerX, 1.803, centerZ);
  room.add(disk);
  m.model(disk, new CylinderGeometry(1.15, 1.15, 0.075, 120), '#493D39', [0, -0.0375, 0], false);
  m.model(disk, new CylinderGeometry(0.061, 0.061, 0.14, 24), palette.nickel, [0, 0.02, 0]);

  const spiral = new Mesh(new TubeGeometry(new CuttingSpiral(), cuttingTurns * cuttingSteps, 0.007, cuttingSides, false),
    new MeshBasicMaterial({color: '#AD7459'}));
  disk.add(spiral);

  m.block(room, [0.26, 1.06, 0.27], [1.34, 2.11, -1.62], palette.slate, 0.035);
  m.block(room, [2.05, 0.19, 0.25], [0.45, 2.59, -1.62], palette.nickel, 0.024);
  const cutter = new Group();
  room.add(cutter);
  m.block(cutter, [0.22, 0.16, 1.57], [0, 0.80, -0.79], '#889693', 0.028);
  m.block(cutter, [0.51, 0.56, 0.44], [0, 0.39, 0], palette.slate, 0.027);
  m.block(cutter, [0.39, 0.115, 0.26], [0, 0.287, 0.239], '#94988A', 0.016);
  const needle = m.model(cutter, new CylinderGeometry(0.08, 0.012, 0.15, 6), '#8BA9BD', [0.007, 0.075, 0], true);
  needle.rotation.z = -0.09;
  const suction = new CatmullRomCurve3([[0.11, 0.151, 0.17], [0.34, 0.42, 0.24], [0.52, 0.58, -0.26]].map(p => vector(p as [number,number,number])));
  m.model(cutter, new TubeGeometry(suction, 28, 0.039, 10, false), '#343E42', [0, 0, 0]);
  const swarfPoints = Array.from({length: 130}, (_, i) => {
    const u = i / 129;
    const curl = u * TAU * 3.5;
    return new Vector3(u * 0.23 + Math.sin(curl) * u * 0.052, u * 0.18, u * 0.18 + Math.cos(curl) * u * 0.035);
  });
  const swarf = m.model(cutter, new TubeGeometry(new CatmullRomCurve3(swarfPoints), 129, 0.009, 6, false),
    '#D5A171', [0, 0.02, 0]);

  const {person, head, brows} = buildFigure(room, m, [2.20, 0.124, 0.14], true);
  person.rotation.y = -0.65;
  head.rotation.x = 0.22;
  brows[0].rotation.z = 0.09;
  brows[1].rotation.z = -0.09;
  contactShade(room, m, 1.18, 1.04, [2.20, 0.130, 0.14]);

  const focus = new Vector3();
  return (camera, p, t) => {
    const turn = Math.min(cuttingTurns, t / 1.8);
    disk.rotation.y = -turn * TAU;
    spiral.geometry.setDrawRange(0, Math.floor(turn * cuttingSteps) * cuttingSides * 6);
    cutter.position.set(centerX + cuttingRadius(turn), 1.802, centerZ);
    swarf.visible = p >= 0.15;
    swarf.rotation.x = Math.sin(t * 10) * 0.22;
    head.rotation.z = 0.09 + Math.sin(t * 1.21) * 0.026;
    const push = ease(0.14, 0.86, p);
    pose(camera, [8.4, 8.1, 18.0], [3.15, 4.37, 10.5], [0, 1.83, -0.55], push);
    focus.set(mix(0.10, -0.03, push), mix(2.25, 1.86, push), -0.53);
    return {focus, atmosphere: {beam: true, dust: true}};
  };
}

export function buildStereo(room: Group, m: VinylMaterials): Motion {
  studio(room, m);
  bench(room, m, 0, -0.32, 3.6, 4.35, 1.21);
  const {sample, walls} = grooveSample(room, m, 'laca');
  sample.position.copy(profilePosition);
  const samples = new Group();
  samples.position.set(0, 1.31, -0.32);
  room.add(samples);
  const guides = [leftWall, rightWall].map((color) => new Color(color));
  const traceColors = [2.2, 9.1].map((cycles, row) => {
    const z = row ? 0.59 : -0.59;
    m.block(samples, [2.92, 0.065, 0.81], [0, 0.0, z], '#4F4A44', 0.025);
    const points = Array.from({length: 200}, (_, index) => {
      const u = index / 199;
      return new Vector3((u - 0.5) * 2.68, 0.048, z + 0.205 * Math.sin(u * TAU * cycles));
    });
    const trace = m.model(samples, new TubeGeometry(new CatmullRomCurve3(points), 199, 0.018, 6, false),
      row ? rightWall : leftWall, [0, 0, 0]);
    trace.material = trace.material.clone();
    return trace.material.color;
  });
  const inactiveTrace = new Color('#757870');
  const neutral = m.toon('#67504A').color;
  const focus = new Vector3();
  return (camera, p) => {
    const profile = p >= 0.43;
    sample.visible = profile;
    samples.visible = !profile;
    walls[0].color.copy(neutral).lerp(guides[0], ease(0.52, 0.68, p));
    walls[1].color.copy(neutral).lerp(guides[1], ease(0.66, 0.83, p));
    if (!profile) {
      const high = ease(0.21, 0.235, p);
      traceColors[0].copy(guides[0]).lerp(inactiveTrace, 0.66 * high);
      traceColors[1].copy(guides[1]).lerp(inactiveTrace, 0.66 * (1 - high));
      pose(camera, [0.25, 11.8, 2.52], [0.12, 10.2, 3.37], [0, 1.33, -0.24], ease(0, 0.42, p));
      focus.set(0, 1.33, -0.24);
    } else {
      camera.position.set(-0.94, 5.55, 13.90).lerp(profileEye, ease(0.43, 0.95, p));
      camera.near = 0.01;
      focus.copy(profileFocus);
    }
    return {focus};
  };
}
