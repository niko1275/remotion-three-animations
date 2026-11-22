import {CylinderGeometry, ExtrudeGeometry, Group, Mesh, PlaneGeometry, Shape, SphereGeometry, Vector2, Vector3} from 'three';
import type {Position, VinylMaterials} from '../vinilo-apertura/materials';

const up = new Vector3(0, 1, 0);
const shell = '#50352D';
const headColor = '#4B3028';
const gasterColor = '#3B2824';
const legsColor = '#5E3A2B';

function taperedOval(taper: number) {
  const geometry = new SphereGeometry(1, 28, 20);
  const vertices = geometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const z = vertices.getZ(i);
    vertices.setXY(i, vertices.getX(i) * (1 - taper * z), vertices.getY(i) * (1 - 0.5 * taper * z));
  }
  geometry.computeVertexNormals();
  return geometry;
}

function mandibleGeometry() {
  const jaw = new Shape();
  jaw.moveTo(0.045, 0.435);
  jaw.quadraticCurveTo(0.137, 0.423, 0.141, 0.491);
  jaw.quadraticCurveTo(0.142, 0.555, 0.027, 0.590);
  jaw.quadraticCurveTo(0.069, 0.550, 0.081, 0.520);
  jaw.lineTo(0.051, 0.518);
  jaw.quadraticCurveTo(0.069, 0.490, 0.045, 0.435);
  return new ExtrudeGeometry(jaw, {
    depth: 0.022, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.007, bevelSegments: 2, curveSegments: 6,
  });
}

export function buildAnt(parent: Group, m: VinylMaterials, scale: number) {
  const root = new Group();
  parent.add(root);
  const ant = new Group();
  root.add(ant);
  ant.scale.setScalar(scale);

  const contact = m.contact.clone();
  contact.uniforms.span.value = new Vector2(0.66 * scale, 1.52 * scale);
  contact.uniforms.maxOpacity.value = 0.29;
  const shadow = new Mesh(new PlaneGeometry(0.66 * scale, 1.52 * scale), contact);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.002, -0.13 * scale);
  root.add(shadow);

  const oval = new SphereGeometry(1, 24, 16);
  const body = new Group();
  ant.add(body);

  function mass(geometry: SphereGeometry, color: string, dims: Position, at: Position, outline = true) {
    const mesh = m.model(body, geometry, color, at, outline);
    mesh.scale.set(...dims);
    return mesh;
  }

  mass(taperedOval(0.38), gasterColor, [0.248, 0.169, 0.276], [0, 0.268, -0.503]);
  mass(oval, shell, [0.057, 0.073, 0.090], [0, 0.274, -0.207]);
  mass(taperedOval(-0.12), shell, [0.103, 0.111, 0.190], [0, 0.293, 0.016]);
  mass(oval, shell, [0.068, 0.070, 0.075], [0, 0.290, 0.205]);
  mass(taperedOval(0.24), headColor, [0.159, 0.125, 0.173], [0, 0.302, 0.330]);
  const jawShape = mandibleGeometry();
  for (const side of [-1, 1]) {
    const eye = mass(oval, '#191415', [0.034, 0.038, 0.049], [side * 0.123, 0.355, 0.355], false);
    eye.rotation.z = -side * 0.41;
    mass(oval, '#AD9074', [0.007, 0.006, 0.009], [side * 0.140, 0.383, 0.375], false);
    const jaw = m.model(body, jawShape, '#633C2A', [0, 0.285, 0]);
    jaw.rotation.x = Math.PI / 2;
    jaw.scale.x = side;
  }

  const femur = new CylinderGeometry(0.023, 0.032, 1, 9);
  const tibia = new CylinderGeometry(0.014, 0.024, 1, 9);
  const foot = new CylinderGeometry(0.006, 0.015, 1, 8);
  const scape = new CylinderGeometry(0.015, 0.021, 1, 9);
  const antennaTip = new CylinderGeometry(0.008, 0.016, 1, 9);

  const legs = [-1, 1].flatMap((side) => [-1, 0, 1].map((row) => ({
    side, row,
    upper: m.model(ant, femur, legsColor, [0, 0, 0]),
    lower: m.model(ant, tibia, legsColor, [0, 0, 0]),
    tip: m.model(ant, foot, legsColor, [0, 0, 0]),
  })));
  const antennae = [-1, 1].map((side) => ({
    side,
    base: m.model(body, scape, '#694431', [0, 0, 0]),
    tip: m.model(body, antennaTip, '#75523A', [0, 0, 0]),
  }));
  ant.traverse((part) => {
    part.castShadow = false;
    part.receiveShadow = false;
  });

  const start = new Vector3();
  const bend = new Vector3();
  const ankle = new Vector3();
  const end = new Vector3();
  const axis = new Vector3();
  function span(mesh: Mesh, a: Vector3, b: Vector3) {
    mesh.position.lerpVectors(a, b, 0.5);
    axis.subVectors(b, a);
    mesh.scale.y = axis.length() + 0.008;
    mesh.quaternion.setFromUnitVectors(up, axis.normalize());
  }

  function pose(x: number, y: number, z: number, heading: number, t: number, stride: number, rest = 0) {
    root.visible = true;
    root.position.set(x, y, z);
    root.rotation.y = heading;
    const sway = Math.sin(t * 17) * 0.012 * stride;
    body.position.y = sway - rest * 0.075;
    body.rotation.z = -rest * 0.27;

    legs.forEach(({side, row, upper, lower, tip}) => {
      const phase = t * 19 + (row + side * 0.5) * Math.PI;
      const reach = Math.sin(phase) * 0.146 * stride;
      const lift = Math.max(0, Math.cos(phase)) * 0.09 * stride;
      const spread = 1 - 0.20 * rest - 0.13 * Math.abs(row);
      start.set(side * 0.068, 0.267, 0.028 + row * 0.102).applyQuaternion(body.quaternion).add(body.position);
      bend.set(side * 0.32 * spread, 0.348 - 0.109 * rest + lift * 0.28, row * 0.264 + reach * 0.52);
      ankle.set(side * 0.55 * spread, 0.074 + lift, row * 0.464 + reach);
      end.set(side * 0.64 * spread, 0.013 + lift, row * 0.500 + reach + 0.033);
      span(upper, start, bend);
      span(lower, bend, ankle);
      span(tip, ankle, end);
    });

    antennae.forEach(({side, base, tip}) => {
      const scan = Math.sin(t * 6.1 + side * 0.96) * 0.051 * (1 - rest);
      start.set(side * 0.067, 0.372, 0.438);
      bend.set(side * (0.344 + scan - 0.051 * rest), 0.410, 0.561 + scan * 0.39);
      end.set(side * (0.265 + scan * 1.32 - 0.066 * rest), 0.443 - rest * 0.108, 0.846 - 0.095 * rest);
      span(base, start, bend);
      span(tip, bend, end);
    });
  }

  return {root, pose};
}
