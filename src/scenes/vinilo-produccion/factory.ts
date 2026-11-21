import {
  CylinderGeometry, Group, MathUtils, Mesh, MeshBasicMaterial, RingGeometry, SphereGeometry, Vector3,
} from 'three';
import {platingTiming} from '../../timeline';
import {palette, type VinylMaterials} from '../vinilo-apertura/materials';
import {grooveSample, profileEye, profileFocus, profilePosition} from './groove';
import {contactShade, workRoom} from './sets';
import {ease, mix, pose, type Motion} from './shot';

function factory(room: Group, m: VinylMaterials) {
  workRoom(room, m, true);
  m.block(room, [1.34, 0.10, 1.65], [2.9, 0.18, -2.14], palette.slate);
  for (let i = 0; i < 10; i++) {
    m.model(room, new CylinderGeometry(0.59, 0.59, 0.032, 48), i % 3 ? '#353736' : '#83938F',
      [2.9, 0.25 + i * 0.035, -2.22 + 0.014 * (i % 3)]);
  }
  for (let i = 0; i < 5; i++) {
    m.model(room, new CylinderGeometry(0.255, 0.255, 0.023, 32), i % 2 ? '#C49A74' : '#D5B790',
      [3.13, 0.25 + i * 0.023, -1.50]);
  }
}

export function buildPlating(room: Group, m: VinylMaterials): Motion {
  factory(room, m);
  const tank = new Group();
  room.add(tank);
  m.block(tank, [4.42, 0.27, 3.59], [0, 0.26, -0.46], '#687A77', 0.047);
  for (const x of [-2.12, 2.12]) {
    m.block(tank, [0.18, 1.16, 3.61], [x, 0.97, -0.46], '#637976', 0.047);
  }
  for (const z of [-2.19, 1.26]) {
    m.block(tank, [4.42, 1.16, 0.18], [0, 0.97, z], '#647976', 0.047);
    m.block(tank, [4.49, 0.105, 0.19], [0, 1.58, z], palette.nickel, 0.027);
  }
  m.block(tank, [4.01, 0.075, 3.30], [0, 1.41, -0.46], '#577873', 0.035, false);
  contactShade(tank, m, 4.88, 4.04, [0, 0.127, -0.46]);
  m.block(tank, [0.13, 2.0, 0.14], [1.98, 2.48, -1.61], palette.slate, 0.031);
  m.block(tank, [3.93, 0.125, 0.14], [0.1, 3.39, -1.61], palette.nickel, 0.029);

  const group = new Group();
  room.add(group);
  const lacquer = grooveSample(group, m, 'laca').sample;
  lacquer.position.copy(profilePosition);
  // Pedestal is below the cut specimen so the exaggerated geometry is supported.
  m.block(group, [2.5, 1.20, 3.90], [0, 0.71, -0.32], '#637976', 0.06);
  const nickel = grooveSample(group, m, 'niquel').sample;
  nickel.position.copy(profilePosition);

  const copies = [-1.4, 0, 1.4].map((x, i) => {
    const plate = new Group();
    plate.position.set(x, 0.81, -1.59);
    tank.add(plate);
    const hanger = m.block(tank, [0.038, 1, 0.042], [x, 0, -1.61], palette.nickel, 0.01, false);
    const face = m.model(plate, new CylinderGeometry(0.58, 0.58, 0.071, 65),
      i === 1 ? '#BEAAA0' : palette.nickel, [0, 0, 0], true);
    face.rotation.x = Math.PI / 2;
    for (const r of [0.23, 0.30, 0.38, 0.47, 0.54]) {
      const ring = new Mesh(new RingGeometry(r, r + 0.012, 72),
        new MeshBasicMaterial({color: i === 1 ? '#A79183' : '#D8DDCF'}));
      ring.position.z = 0.041;
      plate.add(ring);
    }
    return {plate, hanger};
  });
  const stampRing = new Mesh(new RingGeometry(0.551, 0.574, 72), new MeshBasicMaterial({
    color: palette.warm, transparent: true, opacity: 0, depthWrite: false,
  }));
  stampRing.position.z = 0.047;
  copies[2].plate.add(stampRing);

  return (camera, p) => {
    const frame = p * (platingTiming.duration - 1);
    const bath = frame >= platingTiming.copies;
    group.visible = !bath;
    tank.visible = bath;
    const deposit = ease(6, platingTiming.separate, frame);
    nickel.visible = deposit > 0.001;
    nickel.scale.y = Math.max(0.001, deposit);
    const separation = ease(platingTiming.separate, 126, frame);
    nickel.position.copy(profilePosition);
    nickel.position.y += 1.14 * separation;
    nickel.rotation.x = -0.20 * separation;
    if (!bath) {
      camera.position.copy(profileEye);
      camera.near = 0.01;
      return {focus: profileFocus.clone().add(new Vector3(0, separation * 0.46, 0))};
    }

    copies.forEach(({plate, hanger}, index) => {
      const liftStart = platingTiming.copies + 5 + index * 25;
      const lift = ease(liftStart, liftStart + 40, frame);
      plate.position.y = mix(0.81, 2.40, lift);
      plate.rotation.y = 0.11 * (index - 1) * lift;
      const plateTop = plate.position.y + 0.56;
      hanger.scale.y = 3.34 - plateTop;
      hanger.position.y = (3.34 + plateTop) / 2;
    });
    const stamp = ease(platingTiming.stamp, platingTiming.stamp + 17, frame);
    stampRing.material.opacity = 0.88 * stamp;
    const move = ease(platingTiming.copies, platingTiming.stamp + 20, frame);
    const focus = pose(camera, [-7, 8.6, 17.2], [-3.9, 7.05, 14.8], [0, 2.06, -0.78], move);
    focus.x = 0.24 * stamp;
    return {focus};
  };
}

export function buildPress(room: Group, m: VinylMaterials): Motion {
  factory(room, m);
  const z = -0.44;
  m.block(room, [4.27, 0.22, 3.67], [0, 0.235, z], '#717E79', 0.06);
  for (const x of [-1.78, 1.78]) {
    for (const dz of [-1.20, 1.20]) {
      m.model(room, new CylinderGeometry(0.25, 0.27, 3.58, 22), palette.slate, [x, 2.09, z + dz], true);
    }
  }
  m.block(room, [4.32, 0.55, 3.11], [0, 4.08, z], '#687772', 0.073);
  m.model(room, new CylinderGeometry(0.53, 0.55, 0.61, 24), palette.slate, [0, 4.63, z], true);
  m.block(room, [3.85, 0.38, 2.82], [0, 0.70, z], palette.slate, 0.052);
  m.model(room, new CylinderGeometry(1.24, 1.24, 0.16, 80), palette.nickel, [0, 0.97, z], true);
  const ram = m.model(room, new CylinderGeometry(0.233, 0.233, 1, 28), palette.nickel, [0, 3.45, z], true);
  const upper = new Group();
  room.add(upper);
  m.block(upper, [3.56, 0.27, 2.66], [0, 0.10, z], '#71827A', 0.042);
  m.model(upper, new CylinderGeometry(1.24, 1.24, 0.18, 80), palette.nickel, [0, -0.12, z], false);

  const puck = m.model(room, new CylinderGeometry(1, 1, 1, 96), '#252726', [0, 1.34, z]);
  const label = m.model(room, new CylinderGeometry(0.36, 0.36, 0.012, 60), '#AD7459', [0, 1.35, z]);
  const hub = m.model(room, new CylinderGeometry(0.042, 0.042, 0.021, 18), '#DAC6A6', [0, 1.38, z]);
  const flash = new Mesh(new RingGeometry(1.16, 1.27, 96), new MeshBasicMaterial({color: '#333732'}));
  flash.rotation.x = -Math.PI / 2;
  room.add(flash);
  contactShade(room, m, 4.62, 3.88, [0, 0.127, z]);
  m.block(room, [0.44, 0.68, 0.38], [2.30, 1.16, -0.46], '#6A7E78', 0.035);
  for (let i = 0; i < 3; i++) {
    m.block(room, [0.062, 0.061, 0.019], [2.21 + i * 0.091, 1.36, -0.256], i === 0 ? palette.copper : palette.warm, 0.012, false);
  }

  const steamMaterial = new MeshBasicMaterial({color: '#E7DDC1', transparent: true, depthWrite: false});
  const steam = Array.from({length: 13}, () => {
    const puff = new Mesh(new SphereGeometry(0.16, 10, 8), steamMaterial);
    room.add(puff);
    return puff;
  });

  return (camera, p) => {
    const closed = ease(0.18, 0.39, p);
    const opened = ease(0.58, 0.79, p);
    const height = mix(3.07, 1.36, closed) + opened * 1.54;
    upper.position.y = height;
    ram.position.y = (height + 4.35) / 2;
    ram.scale.y = 4.35 - height;
    const radius = mix(0.53, 1.20, closed);
    const thickness = 0.42 * Math.pow(0.53 / radius, 2);
    puck.scale.set(radius, thickness, radius);
    puck.position.y = 1.053 + thickness / 2;
    label.position.y = 1.053 + thickness + 0.009;
    hub.position.y = label.position.y + 0.011;
    flash.position.set(0, 1.054 + thickness * 0.64, z);
    flash.visible = closed >= 0.97 && opened > 0.2;

    const vapor = ease(0.34, 0.54, p);
    steamMaterial.opacity = ease(0.34, 0.43, p) * (1 - ease(0.50, 0.7, p)) * 0.27;
    steam.forEach((puff, i) => {
      const side = i % 2 ? -1 : 1;
      puff.visible = steamMaterial.opacity > 0.001;
      puff.position.set(side * (0.84 + vapor * (0.45 + i * 0.023)),
        1.13 + vapor * (0.25 + 0.055 * i), z + 0.68 * Math.sin(i * 2.399));
      puff.scale.setScalar(MathUtils.lerp(0.45, 1.41 + (i % 3) * 0.28, vapor));
    });

    const focus = pose(camera, [7.85, 3.92, 18.4], [3.58, 3.14, 15.45], [0, 2.04, -0.53], ease(0.04, 0.94, p));
    return {focus};
  };
}
