import {BufferGeometry, Float32BufferAttribute, Group, MeshToonMaterial, Vector3} from 'three';
import {palette, type VinylMaterials} from '../vinilo-apertura/materials';

const length = 4.05;
const halfSpan = 1.13;
const halfV = 0.46;
const samples = 260;
export const leftWall = '#F4D58A';
export const rightWall = '#89A9BB';

export function grooveWave(z: number, cycles = 3.1) {
  return 0.18 * Math.sin(z * Math.PI * 2 * cycles / length + 0.44) +
    0.010 * Math.sin(z * Math.PI * 22 / length);
}

function profile(z: number, form: 'laca' | 'niquel') {
  const x = grooveWave(z);
  const points = [
    [-halfSpan, 0, z], [x - halfV, 0, z], [x, -halfV, z], [x + halfV, 0, z], [halfSpan, 0, z],
  ];
  return form === 'laca'
    ? [[-halfSpan,-0.75,z], ...points, [halfSpan,-0.75,z]]
    : [[-halfSpan,0.31,z], ...points, [halfSpan,0.31,z]];
}

export function grooveSample(parent: Group, m: VinylMaterials, form: 'laca' | 'niquel') {
  const sample = new Group();
  parent.add(sample);
  const walls: MeshToonMaterial[] = [];
  const pale = form === 'niquel' ? palette.nickel : '#67504A';
  for (let band = 0; band < 6; band++) {
    const geometry = new BufferGeometry();
    const pos: number[] = [];
    const ids: number[] = [];
    for (let row = 0; row <= samples; row++) {
      const z = row / samples * length - length / 2;
      pos.push(...profile(z, form)[band], ...profile(z, form)[band + 1]);
      if (row === samples) continue;
      const a = row * 2;
      ids.push(...(form === 'laca' ? [a, a + 2, a + 1, a + 1, a + 2, a + 3] : [a, a + 1, a + 2, a + 1, a + 3, a + 2]));
    }
    geometry.setAttribute('position', new Float32BufferAttribute(pos, 3));
    geometry.setIndex(ids);
    geometry.computeVertexNormals();
    const mesh = m.model(sample, geometry, pale, [0, 0, 0]);
    if (band === 2 || band === 3) {
      const material = mesh.material.clone();
      mesh.material = material;
      walls.push(material);
    }
  }
  // Cap the front slice with an actual cut profile.
  for (const z of [-length / 2, length / 2]) {
    const y = form === 'niquel' ? 0.31 : -0.75;
    const edge = profile(z, form).slice(1, -1);
    for (let band = 0; band < edge.length - 1; band++) {
      const [a, b] = [edge[band], edge[band + 1]];
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute([a[0], y, z, b[0], y, z, ...b, ...a], 3));
      geometry.setIndex((z > 0) === (form === 'laca') ? [0,1,2,0,2,3] : [0,2,1,0,3,2]);
      geometry.computeVertexNormals();
      m.model(sample, geometry, form === 'niquel' ? '#ADB8B7' : '#A5826D', [0, 0, 0]);
    }
  }
  if (form === 'niquel') {
    m.block(sample, [halfSpan * 2, 0.03, length], [0, 0.318, 0], palette.nickel, 0.012, false);
  }
  return {sample, walls};
}

export const profilePosition = new Vector3(0, 2.04, -0.32);
export const profileEye = new Vector3(0, 4.78, 14.80);
export const profileFocus = new Vector3(0, 1.87, 0.55);
