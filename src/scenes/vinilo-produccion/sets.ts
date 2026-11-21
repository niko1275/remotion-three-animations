import {Group, Mesh, MeshBasicMaterial, PlaneGeometry, Vector2} from 'three';
import {palette, type Position, type VinylMaterials} from '../vinilo-apertura/materials';

export function contactShade(room: Group, materials: VinylMaterials, width: number, depth: number, position: Position) {
  const material = materials.contact.clone();
  material.uniforms.span.value = new Vector2(width, depth);
  const shade = new Mesh(new PlaneGeometry(width, depth), material);
  shade.rotation.x = -Math.PI / 2;
  shade.position.set(...position);
  room.add(shade);
}

export function workRoom(room: Group, materials: VinylMaterials, factory: boolean) {
  const {block} = materials;
  const floorColor = factory ? '#909894' : palette.wood;
  const wallColor = factory ? '#BEC8BC' : palette.wall;
  block(room, [8.48, 0.26, 6.61], [0, -0.14, -0.22], '#747D75', 0.07);
  block(room, [8.38, 0.13, 6.49], [0, 0.052, -0.22], floorColor, 0.05);
  block(room, [8.38, 6.44, 0.16], [0, 3.33, -3.48], wallColor);
  const left = -4.15;
  const windowMin = -2.64;
  const windowMax = -0.69;
  const sill = 3.84;
  const lintel = 6.21;
  const sideWall = (y0: number, y1: number, z0: number, z1: number) =>
    block(room, [0.16, y1 - y0, z1 - z0], [left, (y0 + y1) / 2, (z0 + z1) / 2], '#AFBCAF', 0.025);
  sideWall(0.11, 6.55, -3.48, windowMin);
  sideWall(0.11, 6.55, windowMax, 3.03);
  sideWall(0.11, sill, windowMin, windowMax);
  sideWall(lintel, 6.55, windowMin, windowMax);
  for (const z of [windowMin, (windowMin + windowMax) / 2, windowMax]) {
    block(room, [0.19, lintel - sill + 0.15, 0.087], [left, (sill + lintel) / 2, z], '#DDD2B5', 0.016);
  }
  for (const y of [sill, (sill + lintel) / 2, lintel]) {
    block(room, [0.23, 0.082, windowMax - windowMin + 0.10], [left + 0.02, y, -1.665], '#DDD2B5', 0.016);
  }
  const sky = new Mesh(new PlaneGeometry(windowMax - windowMin, lintel - sill), new MeshBasicMaterial({color: '#E8DCC0'}));
  sky.rotation.y = Math.PI / 2;
  sky.position.set(left - 0.11, (sill + lintel) / 2, -1.665);
  room.add(sky);
  block(room, [8.22, 0.14, 0.058], [0, 0.192, -3.39], '#818D80', 0.02);
  contactShade(room, materials, 7.96, 0.49, [0, 0.119, -3.2]);
  contactShade(room, materials, 0.49, 6.27, [-3.87, 0.12, -0.13]);

  if (factory) {
    for (let i = 0; i < 5; i++) {
      block(room, [8.1, 0.004, 0.022], [0, 0.12, -2.83 + i * 1.22], '#77827D', 0.002, false);
    }
    block(room, [4.1, 0.43, 0.048], [0.30, 3.54, -3.382], '#91A199', 0.04, false);
    for (const x of [-1.56, 2.17]) {
      block(room, [0.096, 2.32, 0.14], [x, 2.38, -3.27], palette.slate, 0.021, false);
    }
  } else {
    for (let column = 0; column < 3; column++) {
      const x = -2.34 + column * 1.01;
      block(room, [0.84, 1.91, 0.10], [x, 3.59, -3.34], palette.slate, 0.051);
      for (let slat = 0; slat < 5; slat++) {
        block(room, [0.076, 1.68, 0.064], [x - 0.28 + slat * 0.14, 3.59, -3.25], '#677571', 0.017, false);
      }
    }
  }
}

export function bench(room: Group, m: VinylMaterials, x: number, z: number, width: number, depth: number, y = 1.25) {
  for (const side of [-1, 1]) {
    for (const end of [-1, 1]) {
      m.block(room, [0.22, y - 0.2, 0.22], [x + side * (width / 2 - 0.18), (y + 0.05) / 2, z + end * (depth / 2 - 0.16)], '#81725D');
    }
  }
  m.block(room, [width, 0.16, depth], [x, y, z], palette.wood, 0.055);
  contactShade(room, m, width + 0.26, depth + 0.26, [x, 0.127, z]);
}
