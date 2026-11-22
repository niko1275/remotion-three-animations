import {CylinderGeometry, Group, Mesh, PlaneGeometry, SphereGeometry, Vector2, Vector3} from 'three';
import type {VinylMaterials} from '../vinilo-apertura/materials';

const up = new Vector3(0, 1, 0);
const axis = new Vector3();

export function buildAnt(parent: Group, m: VinylMaterials, scale: number) {
  const root = new Group();
  parent.add(root);
  const ant = new Group();
  ant.scale.setScalar(scale);
  root.add(ant);

  const contact = m.contact.clone();
  contact.uniforms.span.value = new Vector2(0.9 * scale, 1.36 * scale);
  contact.uniforms.maxOpacity.value = 0.20;
  const shadow = new Mesh(new PlaneGeometry(0.9 * scale, 1.36 * scale), contact);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.002, -0.13 * scale);
  root.add(shadow);

  const oval = new SphereGeometry(1, 22, 15);
  const body = new Group();
  ant.add(body);

  function mass(color: string, dims: [number, number, number], at: [number, number, number], outline = true) {
    const mesh = m.model(body, oval, color, at, outline);
    mesh.scale.set(...dims);
    return mesh;
  }

  mass('#6B382E', [0.25, 0.22, 0.346], [0, 0.327, -0.397]);
  mass('#A46243', [0.158, 0.154, 0.218], [0, 0.315, -0.019]);
  mass('#8B4B37', [0.218, 0.185, 0.230], [0, 0.351, 0.268]);
  for (const side of [-1, 1]) {
    mass('#251E1D', [0.048, 0.046, 0.054], [side * 0.164, 0.394, 0.356], false);
    mass('#DED3AB', [0.012, 0.013, 0.015], [side * 0.181, 0.409, 0.381], false);
  }

  const legGeometry = new CylinderGeometry(0.039, 0.052, 1, 7);
  const antennaGeometry = new CylinderGeometry(0.023, 0.032, 1, 7);
  const makeJoint = (geometry: CylinderGeometry, color: string) => [
    m.model(ant, geometry, color, [0, 0, 0]),
    m.model(ant, geometry, color, [0, 0, 0]),
  ];

  const legs = [-1, 1].flatMap((side) => [-1, 0, 1].map((row) => ({
    side, row, joints: makeJoint(legGeometry, '#624038'),
  })));
  const antennae = [-1, 1].map((side) => ({
    side, joints: makeJoint(antennaGeometry, '#744835'),
    tip: m.model(ant, oval, '#B77C50', [0, 0, 0]),
  }));
  ant.traverse((part) => {
    part.castShadow = false;
    part.receiveShadow = false;
  });

  const start = new Vector3();
  const bend = new Vector3();
  const end = new Vector3();

  function span(mesh: Mesh, a: Vector3, b: Vector3) {
    mesh.position.lerpVectors(a, b, 0.5);
    axis.subVectors(b, a);
    mesh.scale.y = axis.length();
    mesh.quaternion.setFromUnitVectors(up, axis.normalize());
  }

  function pose(x: number, y: number, z: number, heading: number, t: number, stride: number, rest = 0) {
    root.visible = true;
    root.position.set(x, y, z);
    root.rotation.y = heading;
    ant.position.y = scale * (0.01 + rest * 0.10);
    ant.rotation.z = -0.91 * rest;
    const sway = 0.017 * stride * Math.sin(t * 17);
    body.position.y = sway;

    legs.forEach(({side, row, joints}) => {
      const phase = t * 21 + (row + side * 0.5) * Math.PI;
      const reach = Math.sin(phase) * 0.16 * stride;
      const lift = Math.max(0, Math.cos(phase)) * 0.104 * stride;
      start.set(side * 0.11, 0.28 + sway, row * 0.128);
      bend.set(side * (0.34 - 0.09 * rest), 0.21, row * 0.196 + reach * 0.48);
      end.set(side * (0.52 - 0.14 * rest), 0.02 + lift + 0.11 * rest, row * 0.31 + reach);
      span(joints[0], start, bend);
      span(joints[1], bend, end);
    });

    antennae.forEach(({side, joints, tip}) => {
      const scan = Math.sin(t * 6.8 + side * 0.96) * 0.044 * (1 - rest);
      start.set(side * 0.100, 0.397 + sway, 0.417);
      bend.set(side * (0.228 + scan), 0.490 - 0.10 * rest, 0.523);
      end.set(side * (0.345 + scan), 0.423 - 0.20 * rest, 0.710 + 0.63 * scan);
      span(joints[0], start, bend);
      span(joints[1], bend, end);
      tip.position.copy(end);
      tip.scale.setScalar(0.032);
    });
  }

  return {root, pose};
}
