import {CapsuleGeometry, Group, Mesh, SphereGeometry, TorusGeometry} from 'three';
import {palette, type Position, type VinylMaterials} from '../vinilo-apertura/materials';

export function buildFigure(room: Group, m: VinylMaterials, position: Position, headphones = false) {
  const person = new Group();
  room.add(person);
  person.position.set(...position);
  const skin = '#C49A7C';
  const clothes = headphones ? '#647B75' : '#A38064';
  const rounded = (parent: Group, diameter: number, height: number, color: string, p: Position) =>
    m.model(parent, new CapsuleGeometry(diameter / 2, height - diameter, 8, 14), color, p, true);
  rounded(person, 0.82, 1.32, clothes, [0, 1.46, 0]);
  for (const side of [-1, 1]) {
    rounded(person, 0.30, 0.62, '#535D5D', [0.21 * side, 0.49, 0]);
    m.block(person, [0.31, 0.18, 0.36], [0.21 * side, 0.09, 0.052], palette.slate, 0.062);
    const arm = rounded(person, 0.26, 0.94, clothes, [0.495 * side, 1.44, 0.035]);
    arm.rotation.z = side * 0.13;
    m.model(person, new SphereGeometry(0.102, 14, 10), skin, [0.545 * side, 0.94, 0.055]);
  }
  const head = new Group();
  head.position.set(0, 2.6, 0);
  person.add(head);
  m.model(head, new SphereGeometry(0.48, 34, 20), skin, [0, 0, 0], true);
  const brows: Mesh[] = [];
  for (const side of [-1, 1]) {
    m.model(head, new SphereGeometry(0.0275, 16, 10), palette.ink, [side * 0.19, 0.033, 0.441]);
    brows.push(m.block(head, [0.15, 0.018, 0.014], [side * 0.19, 0.151, 0.419], palette.ink, 0.005, false));
    if (headphones) m.block(head, [0.13, 0.31, 0.25], [side * 0.46, -0.072, 0.014], palette.slate, 0.04);
  }
  if (headphones) {
    m.model(head, new TorusGeometry(0.48, 0.046, 10, 42, Math.PI), palette.slate, [0, 0, 0], true);
  }
  return {person, head, brows};
}
