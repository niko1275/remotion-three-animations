import {Group, MathUtils, SphereGeometry} from 'three';
import {palette, type VinylMaterials} from '../vinilo-apertura/materials';

export function buildNozzleCutaway(room: Group, m: VinylMaterials) {
  const cutaway = new Group();
  room.add(cutaway);
  m.block(cutaway, [3.70, 0.18, 1.65], [0, 0.48, 0.22], '#68747B', 0.058);
  m.block(cutaway, [3.39, 0.036, 1.48], [0, 0.60, 0.22], '#F3F0DD', 0.013, false);

  m.block(cutaway, [2.83, 1.76, 0.17], [0, 2.74, -0.46], '#607C85', 0.046);
  m.block(cutaway, [2.31, 1.28, 0.12], [0, 2.77, -0.32], '#348C9F', 0.054, false);
  m.block(cutaway, [2.83, 0.24, 1.13], [0, 3.58, -0.013], '#B6C5C7', 0.046);
  for (const side of [-1, 1]) {
    m.block(cutaway, [0.26, 1.72, 1.13], [side * 1.29, 2.75, -0.013], '#9CAFB3', 0.053);
    m.block(cutaway, [1.16, 0.22, 1.13], [side * 0.80, 1.91, -0.013], '#B6C5C7', 0.045);
    m.block(cutaway, [0.30, 1.17, 0.38], [side * 1.19, 1.19, -0.46], palette.slate, 0.045);
  }

  const heater = m.block(cutaway, [0.82, 0.078, 0.44], [0, 3.405, 0.217], '#C77951', 0.014, false);
  heater.material = heater.material.clone();
  heater.material.emissive.set('#FF904D');

  const bubble = m.model(cutaway, new SphereGeometry(0.47, 32, 24), '#D8F2F1', [0, 3.25, 0.30]);
  bubble.castShadow = false;
  const drop = m.model(cutaway, new SphereGeometry(0.173, 28, 18), '#108DA9', [0, 1.80, 0.33]);
  const spot = m.model(cutaway, new SphereGeometry(0.192, 26, 16), '#138CA3', [0, 0.627, 0.33]);
  spot.scale.set(1, 0.11, 0.78);

  function pose(progress: number) {
    const growing = MathUtils.smoothstep(progress, 0.22, 0.51);
    const collapsing = 1 - MathUtils.smoothstep(progress, 0.54, 0.68);
    const size = Math.max(0.001, growing * collapsing);
    heater.material.emissiveIntensity = MathUtils.smoothstep(progress, 0.07, 0.22) * (1 - MathUtils.smoothstep(progress, 0.37, 0.59));
    bubble.visible = size > 0.01;
    bubble.scale.set(size, size * 1.22, size * 0.65);
    bubble.position.y = 3.369 - size * 0.55;
    const falling = MathUtils.smoothstep(progress, 0.43, 0.80);
    drop.visible = progress > 0.435 && progress < 0.80;
    drop.position.y = MathUtils.lerp(1.84, 0.635, falling);
    drop.scale.set(0.75 + 0.25 * falling, 0.60 + 0.65 * falling, 0.82);
    spot.visible = progress >= 0.80;
  }

  return {cutaway, pose};
}
