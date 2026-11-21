import {
  BufferGeometry, CatmullRomCurve3, CylinderGeometry, Float32BufferAttribute, Group, Mesh,
  MeshBasicMaterial, RingGeometry, TubeGeometry, Uint32BufferAttribute, Vector3,
} from 'three';
import {palette, vector, type Position, type VinylMaterials} from './materials';

export const TAU = Math.PI * 2;
export const DISC_Y = 1.98;
export const DISC_Z = -0.32;
export const TURN_COUNT = 39;
const PITCH = 0.025;
const OUTER = 1.475;
const HALF_WIDTH = 0.008;
const STEPS = 576;

export function grooveRadius(turn: number) {
  const bass = 0.00302 * Math.sin(turn * TAU * 17 + 0.9);
  const treble = 0.00052 * Math.sin(turn * TAU * 104);
  return OUTER - turn * PITCH + bass + treble;
}

// Four contiguous strips cover the land and both 45° walls of each turn.
function createGrooveStrip(band: number) {
  const vertexCount = (STEPS + 1) * TURN_COUNT * 2;
  const vertices = new Float32Array(vertexCount * 3);
  const indices = new Uint32Array(STEPS * TURN_COUNT * 6);
  let vertexIndex = 0;
  let index = 0;
  for (let turn = 0; turn < TURN_COUNT; turn++) {
    for (let step = 0; step <= STEPS; step++) {
      const fraction = step / STEPS;
      const path = turn + fraction;
      const theta = fraction * TAU;
      const center = grooveRadius(path);
      const nominal = OUTER - path * PITCH;
      const radii = [nominal + PITCH / 2, center + HALF_WIDTH, center, center - HALF_WIDTH, nominal - PITCH / 2];
      for (let edge = band; edge <= band + 1; edge++) {
        vertices[vertexIndex * 3] = Math.cos(theta) * radii[edge];
        vertices[vertexIndex * 3 + 1] = edge === 2 ? -HALF_WIDTH : 0;
        vertices[vertexIndex * 3 + 2] = Math.sin(theta) * radii[edge];
        vertexIndex++;
      }
      if (step === STEPS) continue;
      const a = vertexIndex - 2;
      indices.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], index);
      index += 6;
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.setIndex(new Uint32BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  return geometry;
}

function createDiscEdge(outer: boolean) {
  const positions: number[] = [];
  const indices: number[] = [];
  for (let step = 0; step <= STEPS; step++) {
    const fraction = step / STEPS;
    const theta = fraction * TAU;
    const radii = outer
      ? [1.5, OUTER - fraction * PITCH + PITCH / 2]
      : [OUTER - (TURN_COUNT - 1 + fraction) * PITCH - PITCH / 2, 0.481];
    radii.forEach((r) => positions.push(Math.cos(theta) * r, 0, Math.sin(theta) * r));
    if (step < STEPS) {
      const a = step * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function buildPlayer(parent: Group, {model, block}: VinylMaterials) {
  block(parent, [4.4, 0.42, 3.65], [0, 1.61, DISC_Z - 0.08], '#373E42', 0.075);
  block(parent, [4.29, 0.048, 3.53], [0, 1.834, DISC_Z - 0.08], '#687174', 0.02, false);
  for (const x of [-1.71, 1.71]) {
    for (const z of [-1.43, 1.33]) {
      model(parent, new CylinderGeometry(0.16, 0.16, 0.10, 14), '#313335', [x, 1.365, DISC_Z + z]);
    }
  }
  model(parent, new CylinderGeometry(1.56, 1.56, 0.13, 96), '#606A69', [0, 1.893, DISC_Z], true);

  const disc = new Group();
  disc.position.set(0, DISC_Y, DISC_Z);
  parent.add(disc);
  // The body is recessed below the V. Its upper face cannot occlude the cut.
  model(disc, new CylinderGeometry(1.5, 1.5, 0.027, 144), palette.vinyl, [0, -0.026, 0]);
  for (const outer of [false, true]) {
    model(disc, createDiscEdge(outer), palette.vinyl, [0, 0, 0]).castShadow = false;
  }
  [palette.vinyl, '#313031', '#252625', palette.vinyl].forEach((color, band) => {
    const mesh = model(disc, createGrooveStrip(band), color, [0, 0, 0]);
    mesh.castShadow = false;
  });
  const labelRadius = 0.481;
  const label = model(disc, new CylinderGeometry(labelRadius, labelRadius, 0.008, 96), '#9C654F', [0, -0.004, 0]);
  label.castShadow = false;
  const mark = new Mesh(new RingGeometry(0.337, 0.35, 80), new MeshBasicMaterial({color: '#D5AF7A'}));
  mark.rotation.x = -Math.PI / 2;
  mark.position.y = 0.0015;
  disc.add(mark);
  for (let i = 0; i < 5; i++) {
    block(disc, [0.2 - i * 0.016, 0.002, 0.018], [0, 0.0018, -0.15 - 0.026 * i], '#E3BB93', 0.001, false);
  }
  model(disc, new CylinderGeometry(0.036, 0.036, 0.08, 24), palette.nickel, [0, 0.04, 0]);

  const sheen = new Mesh(
    new RingGeometry(1.21, 1.37, 96, 1, 0.23, Math.PI / 3),
    new MeshBasicMaterial({color: '#575B60', opacity: 0.45, transparent: true, depthWrite: false}),
  );
  sheen.rotation.x = -Math.PI / 2;
  sheen.position.y = 0.001;
  disc.add(sheen);

  model(parent, new CylinderGeometry(0.21, 0.24, 0.16, 24), '#AEB8B6', [1.78, 1.94, -1.54], true);
  const armStart: Position = [1.78, 2.16, -1.54];
  const armEnd: Position = [1.0, 2.102, 0.51];
  const arm = [
    [1.65, 2.16, -1.96], armStart, [1.68, 2.15, -0.82], [1.26, 2.13, -0.02], armEnd,
  ] as Position[];
  const tonearm = new Group();
  tonearm.position.set(...armStart);
  parent.add(tonearm);
  const local = (p: Position): Position => [p[0] - armStart[0], p[1] - armStart[1], p[2] - armStart[2]];
  model(tonearm, new TubeGeometry(new CatmullRomCurve3(arm.map((p) => vector(local(p)))), 52, 0.045, 10, false), palette.nickel, [0, 0, 0], true);
  const counterweight = model(tonearm, new CylinderGeometry(0.125, 0.125, 0.23, 18), '#495251', local([1.69, 2.16, -1.91]), true);
  counterweight.rotation.x = Math.PI / 2;
  const cartridge = block(tonearm, [0.21, 0.14, 0.32], local(armEnd), '#383D41', 0.027);
  cartridge.rotation.y = -0.36;
  const needle = model(tonearm, new CylinderGeometry(0.011, 0.002, 0.045, 6), '#DFC9A1', local([1.0, 2.008, 0.594]));
  needle.rotation.x = -0.33;
  model(parent, new CylinderGeometry(0.125, 0.125, 0.036, 20), '#929891', [-1.84, 1.869, 1.06]);
  block(parent, [0.096, 0.011, 0.038], [-1.63, 1.866, 1.076], palette.warm, 0.004, false);

  return {disc, tonearm, cartridge, needle};
}

export function groovePoint(turn: number, phase: number, out: Vector3) {
  const radius = grooveRadius(turn);
  return out.set(Math.cos(phase) * radius, DISC_Y, DISC_Z + Math.sin(phase) * radius);
}
