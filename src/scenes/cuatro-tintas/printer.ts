import {CylinderGeometry, Group, MathUtils} from 'three';
import {palette, type VinylMaterials} from '../vinilo-apertura/materials';

const paperSlope = 0.11;
const outputLip = 1.17;
const inkColors = ['#149CB1', '#C94079', '#E2BC4B', '#303033'];
const paperHeightAt = (z: number) => 0.47 - (z - outputLip) * Math.tan(paperSlope);

export function buildInkjetPrinter(room: Group, m: VinylMaterials) {
  const printer = new Group();
  printer.position.set(0, 1.33, -0.38);
  room.add(printer);

  m.block(printer, [4.46, 0.32, 2.94], [0, 0.16, -0.24], '#4A5658', 0.087);
  m.block(printer, [4.23, 1.18, 0.18], [0, 0.88, -1.64], '#637375', 0.055);
  for (const side of [-1, 1]) {
    m.block(printer, [0.35, 1.27, 2.82], [side * 2.035, 0.83, -0.24], '#687876', 0.078);
  }

  const tray = m.block(printer, [2.84, 0.070, 3.06], [0, paperHeightAt(2.52) - 0.071, 2.52], '#657175', 0.041);
  tray.rotation.x = paperSlope;
  for (const side of [-1, 1]) {
    const edge = m.block(printer, [0.095, 0.064, 2.84], [side * 1.35, paperHeightAt(2.52), 2.52], '#556164', 0.027);
    edge.rotation.x = paperSlope;
  }
  m.block(printer, [3.72, 0.10, 1.65], [0, 0.39, 0.14], '#333F44', 0.065);

  function crossBar(radius: number, length: number, color: string, x: number, y: number, z: number) {
    const bar = m.model(printer, new CylinderGeometry(radius, radius, length, 18), color, [x, y, z], true);
    bar.rotation.z = Math.PI / 2;
  }
  crossBar(0.070, 3.78, palette.nickel, 0, 1.035, -0.47);
  crossBar(0.058, 3.58, '#929E99', 0, 0.57, 0.86);
  for (const x of [-1.36, -0.69, 0, 0.69, 1.36]) crossBar(0.10, 0.28, '#3B4545', x, 0.57, 0.86);
  m.block(printer, [3.76, 0.083, 0.115], [0, 1.16, -0.65], '#333D42', 0.018);

  const carriage = new Group();
  carriage.position.set(1.17, 0.93, -0.23);
  printer.add(carriage);
  m.block(carriage, [1.04, 0.54, 0.66], [0, 0, 0], '#4F5A60', 0.056);
  m.block(carriage, [0.82, 0.08, 0.35], [0, -0.30, 0.034], palette.nickel, 0.025);
  inkColors.forEach((color, i) => {
    m.block(carriage, [0.19, 0.29, 0.43], [(i - 1.5) * 0.225, 0.20, 0.075], color, 0.027, false);
  });

  const shell = [-1.56, -0.52, 0.52, 1.56].map((x, i) => {
    const panel = new Group();
    printer.add(panel);
    m.block(panel, [1.04, 0.19, 3.03], [0, 1.53, -0.22], '#81928C', 0.064);
    m.block(panel, [1.035, 0.64, 0.21], [0, 1.12, 1.151], '#798A84', 0.048);
    if (i === 3) m.block(panel, [0.13, 0.047, 0.013], [0.18, 1.22, 1.262], palette.warm, 0.012, false);
    return {x, panel};
  });

  const photo = new Group();
  photo.rotation.x = -Math.PI / 2 + paperSlope;
  printer.add(photo);

  function pose(feed: number, cover: number) {
    const z = MathUtils.lerp(1.985, 2.59, feed);
    photo.position.set(0, paperHeightAt(z) + 0.024, z);
    carriage.position.x = MathUtils.lerp(1.17, 0.07, MathUtils.smoothstep(cover, 0.44, 1));
    shell.forEach(({x, panel}, i) => {
      const offset = MathUtils.smoothstep(cover, 0.045 * i, 0.79 + 0.067 * i);
      panel.position.set(x * (1 + 0.22 * offset), 0.89 * offset, -1.98 * offset);
      panel.rotation.x = -0.17 * offset;
    });
  }

  return {printer, photo, pose};
}
