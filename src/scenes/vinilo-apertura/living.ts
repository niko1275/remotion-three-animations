import {
  CatmullRomCurve3, CylinderGeometry, Group, LatheGeometry, Mesh, MeshBasicMaterial,
  PlaneGeometry, TubeGeometry, Vector2,
} from 'three';
import {palette, vector, type Position, type VinylMaterials} from './materials';

export function buildLiving(scene: Group, materials: VinylMaterials) {
  const {block, model, contact} = materials;
  const woodShadow = '#8E795C';
  const cream = '#D8CFB5';
  const cloth = '#6E7E7A';
  const wallDepth = -3.48;
  const wallHeight = 6.44;
  const left = -4.15;

  block(scene, [8.48, 0.27, 6.61], [0, -0.15, -0.22], '#737D74', 0.08);
  block(scene, [8.35, 0.13, 6.48], [0, 0.047, -0.22], palette.wood, 0.045);
  for (let row = 0; row < 12; row++) {
    for (let column = 0; column < 2; column++) {
      const shift = row % 2 ? 0.52 : -0.52;
      const width = 4.15 + shift * (column === 0 ? 1 : -1);
      const x = column === 0 ? -4.15 + width / 2 : 4.15 - width / 2;
      const wood = [palette.wood, '#B4A080', '#BDA889', '#C3AD8A'][(row + column * 3) % 4];
      block(scene, [width - 0.014, 0.014, 0.526], [x, 0.119, -3.14 + row * 0.538], wood, 0.005, false);
    }
  }
  block(scene, [8.38, wallHeight, 0.16], [0, wallHeight / 2 + 0.11, wallDepth], palette.wall, 0.035);
  // A real opening in the left wall lets the window cast a grid of soft shadows.
  const jambMin = -2.64;
  const jambMax = -0.69;
  const sill = 3.84;
  const lintel = 6.21;
  const wallFront = 3.03;
  const sideWall = (bottom: number, top: number, start: number, end: number) =>
    block(scene, [0.16, top - bottom, end - start],
      [left, (bottom + top) / 2, (start + end) / 2], '#B6C3AE', 0.025);
  sideWall(0.11, wallHeight + 0.11, wallDepth, jambMin);
  sideWall(0.11, wallHeight + 0.11, jambMax, wallFront);
  sideWall(0.11, sill, jambMin, jambMax);
  sideWall(lintel, wallHeight + 0.11, jambMin, jambMax);
  for (const z of [jambMin, (jambMin + jambMax) / 2, jambMax]) {
    block(scene, [0.19, lintel - sill + 0.19, 0.087], [left + 0.012, (sill + lintel) / 2, z], cream, 0.014);
  }
  for (const y of [sill, (sill + lintel) / 2, lintel]) {
    block(scene, [0.23, 0.081, jambMax - jambMin + 0.10], [left + 0.021, y, (jambMin + jambMax) / 2], cream, 0.014);
  }
  block(scene, [0.41, 0.15, jambMax - jambMin + 0.25], [left + 0.10, sill - 0.071, (jambMin + jambMax) / 2], palette.wood);
  const sky = new Mesh(new PlaneGeometry(jambMax - jambMin + 0.22, lintel - sill + 0.17),
    new MeshBasicMaterial({color: '#E8DCC0'}));
  sky.rotation.y = Math.PI / 2;
  sky.position.set(left - 0.11, (sill + lintel) / 2, (jambMin + jambMax) / 2);
  scene.add(sky);
  block(scene, [8.2, 0.14, 0.058], [0, 0.215, wallDepth + 0.089], woodShadow, 0.02);
  block(scene, [0.058, 0.14, 6.3], [left + 0.09, 0.215, -0.13], woodShadow, 0.02);

  function shade(width: number, depth: number, position: Position) {
    const material = contact.clone();
    material.uniforms.span.value.set(width, depth);
    const mesh = new Mesh(new PlaneGeometry(width, depth), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(...position);
    scene.add(mesh);
  }
  shade(6.40, 4.41, [0, 0.134, -0.43]);
  shade(6.50, 0.55, [0, 0.133, wallDepth + 0.29]);
  shade(0.55, 5.1, [left + 0.27, 0.132, -0.29]);
  for (const x of [-3.03, 3.03]) shade(1.28, 1.10, [x, 0.132, -0.28]);

  // Low record cabinet with open bays and the amplifier below the deck.
  const cabinet = new Group();
  scene.add(cabinet);
  for (const x of [-2.26, 2.26]) {
    for (const z of [-1.77, 0.93]) {
      block(cabinet, [0.22, 0.31, 0.21], [x, 0.285, z], woodShadow, 0.025);
    }
  }
  block(cabinet, [4.77, 0.14, 3.13], [0, 0.454, -0.41], woodShadow);
  block(cabinet, [4.90, 0.18, 3.47], [0, 1.224, -0.41], palette.wood, 0.06);
  block(cabinet, [4.69, 0.68, 0.14], [0, 0.866, -1.99], '#85765E', 0.01, false);
  for (const x of [-2.31, -0.89, 0.89, 2.31]) {
    block(cabinet, [0.13, 0.68, 3.13], [x, 0.866, -0.41], palette.wood, 0.02);
  }

  const ampY = 0.69;
  const ampZ = 0.94;
  block(cabinet, [1.49, 0.337, 0.71], [0, ampY, ampZ], palette.slate, 0.037);
  block(cabinet, [1.36, 0.276, 0.055], [0, ampY, ampZ + 0.36], '#41494D', 0.017);
  block(cabinet, [0.46, 0.081, 0.012], [-0.30, ampY + 0.05, ampZ + 0.395], '#252D2F', 0.013, false);
  for (let led = 0; led < 5; led++) {
    block(cabinet, [0.026, 0.019 + led * 0.005, 0.012],
      [-0.45 + led * 0.058, ampY + 0.05, ampZ + 0.404], led > 2 ? palette.warm : '#B3C0A6', 0.004, false);
  }
  const dial = model(cabinet, new CylinderGeometry(0.096, 0.096, 0.05, 24), palette.nickel, [0.43, ampY, ampZ + 0.42], true);
  dial.rotation.x = Math.PI / 2;

  function records(centerX: number, bottom: number, frontZ: number, count: number) {
    const colors = ['#7D9188', '#8D826A', '#B88D72', '#A1A998', '#656E71', '#D0BE92'];
    for (let i = 0; i < count; i++) {
      const sleeve = block(cabinet, [0.065, 0.56 + 0.016 * (i % 3), 0.52],
        [centerX + i * 0.072, bottom + 0.28, frontZ + 0.004 * (i % 3)],
        colors[i % colors.length], 0.009, false);
      if (i === count - 1) sleeve.rotation.z = 0.035;
    }
  }
  records(-2.15, 0.533, 0.75, 14);
  records(1.02, 0.533, 0.77, 13);
  // A second shelf establishes the background plane.
  block(scene, [2.25, 0.15, 0.53], [2.28, 3.55, wallDepth + 0.34], palette.wood);
  for (let i = 0; i < 11; i++) {
    const color = ['#7A8A81', '#A58E77', '#C2B797', '#566665'][i % 4];
    block(scene, [0.066, 0.56, 0.46], [1.58 + 0.076 * i, 3.906, wallDepth + 0.32], color, 0.01, false);
  }
  block(scene, [0.62, 0.62, 0.075], [2.87, 3.942, wallDepth + 0.54], '#8A9D8C', 0.028);
  const sleeveArt = model(scene, new CylinderGeometry(0.18, 0.18, 0.013, 26),
    '#D2AD85', [2.87, 3.958, wallDepth + 0.585]);
  sleeveArt.rotation.x = Math.PI / 2;

  const cones: Mesh[] = [];
  function speaker(x: number) {
    const speaker = new Group();
    speaker.position.set(x, 0.18, -0.17);
    scene.add(speaker);
    block(speaker, [0.76, 0.12, 0.66], [0, 0.0, 0], palette.slate, 0.04);
    block(speaker, [0.23, 0.38, 0.24], [0, 0.23, -0.06], '#69716C', 0.025);
    block(speaker, [1.10, 1.63, 1.00], [0, 1.17, 0], woodShadow, 0.064);
    block(speaker, [1.003, 1.50, 0.062], [0, 1.17, 0.52], '#393D3B', 0.04);
    for (const [y, radius] of [[0.97, 0.355], [1.68, 0.133]]) {
      const basket = model(speaker, new CylinderGeometry(radius + 0.052, radius + 0.052, 0.041, 40),
        '#8C8E7E', [0, y, 0.566]);
      basket.rotation.x = Math.PI / 2;
      const coneProfile = [
        new Vector2(0, 0.03), new Vector2(radius * 0.18, 0.022),
        new Vector2(radius * 0.37, -0.02), new Vector2(radius * 0.81, -0.004),
        new Vector2(radius, 0.019),
      ];
      const cone = model(speaker, new LatheGeometry(coneProfile, 40), '#51575A', [0, y, 0.594]);
      cone.rotation.x = Math.PI / 2;
      cones.push(cone);
    }
  }
  speaker(-3.16);
  speaker(3.16);

  const signalCables: CatmullRomCurve3[] = [];
  function cable(points: Position[]) {
    const curve = new CatmullRomCurve3(points.map(vector));
    signalCables.push(curve);
    model(scene, new TubeGeometry(curve, 64, 0.020, 8, false), '#292A28', [0, 0, 0]);
  }
  cable([[2.03, 1.52, -1.91], [2.44, 1.36, -1.9], [2.49, 0.84, -1.77], [2.40, 0.59, -1.68], [0.63, 0.58, 0.54]]);
  for (const side of [-1, 1]) {
    cable([[side * 0.58, 0.58, 0.57], [side * 2.09, 0.56, -1.64],
      [side * 2.52, 0.14, -1.60], [side * 3.16, 0.15, -0.97], [side * 3.16, 1.15, -0.71]]);
  }

  // Quiet foreground and corner details provide near and far focus cues.
  block(scene, [4.25, 0.027, 1.67], [0.52, 0.143, 2.14], cloth, 0.014, false);
  for (const z of [1.37, 2.91]) {
    block(scene, [4.18, 0.010, 0.055], [0.52, 0.161, z], '#A8AC96', 0.006, false);
  }
  for (const x of [-1.53, 2.57]) {
    block(scene, [0.041, 0.010, 1.53], [x, 0.161, 2.14], '#A8AC96', 0.006, false);
  }
  const cover = new Group();
  cover.position.set(-2.42, 0.531, 1.52);
  cover.rotation.set(-0.25, 0.13, -0.11);
  scene.add(cover);
  block(cover, [0.84, 0.82, 0.054], [0, 0, 0], '#9A6E5A', 0.025);
  const discMark = model(cover, new CylinderGeometry(0.234, 0.234, 0.012, 32), '#D4AB82', [0, 0.02, 0.034]);
  discMark.rotation.x = Math.PI / 2;
  block(cover, [0.16, 0.035, 0.012], [0.14, -0.24, 0.039], cream, 0.002, false);

  const plant = new Group();
  plant.position.set(3.26, 0.133, -2.27);
  scene.add(plant);
  model(plant, new CylinderGeometry(0.31, 0.23, 0.48, 9), palette.copper, [0, 0.25, 0], true);
  model(plant, new CylinderGeometry(0.269, 0.269, 0.035, 9), '#5D5442', [0, 0.49, 0]);
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI * 0.78;
    const reach = 0.29 + (i % 3) * 0.12;
    const topX = Math.cos(angle) * reach;
    const topZ = Math.sin(angle) * reach;
    const topY = 0.93 + (i % 4) * 0.11;
    const stem = new CatmullRomCurve3([vector([0, 0.51, 0]), vector([topX * 0.5, topY * 0.81, topZ * 0.5]), vector([topX, topY, topZ])]);
    model(plant, new TubeGeometry(stem, 10, 0.017, 5, false), '#879477', [0, 0, 0]);
    const leaf = block(plant, [0.18, 0.39, 0.047], [topX * 1.1, topY, topZ], i % 2 ? '#7F906E' : '#657B61', 0.022, false);
    leaf.rotation.set(0.31, angle, i % 2 ? 0.58 : -0.41);
  }

  return {cones, signalCables};
}
