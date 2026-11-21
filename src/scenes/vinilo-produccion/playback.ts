import {
  CatmullRomCurve3, CylinderGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, RingGeometry,
  SphereGeometry, TorusGeometry, TubeGeometry, Vector3,
} from 'three';
import {buildLiving} from '../vinilo-apertura/living';
import {palette, vector, type Position, type VinylMaterials} from '../vinilo-apertura/materials';
import {setOpeningCamera} from '../vinilo-apertura/render';
import {buildPlayer, DISC_Y, DISC_Z, grooveRadius, TAU, TURN_COUNT} from '../vinilo-apertura/vinyl';
import {VINYL_FPS, vinylTimeline} from '../../timeline';
import {buildFigure} from './figure';
import {contactShade} from './sets';
import {ease, mix, pose, type Motion} from './shot';

function system(room: Group, m: VinylMaterials) {
  return {...buildLiving(room, m), ...buildPlayer(room, m)};
}

function signalDot(room: Group, radius: number) {
  const dot = new Mesh(new SphereGeometry(radius, 14, 10), new MeshBasicMaterial({color: palette.warm}));
  room.add(dot);
  return dot;
}

function buildGrooveTrace(room: Group) {
  const segments = 48;
  const geometry = new PlaneGeometry(1, 1, 1, segments);
  const material = new MeshBasicMaterial({color: palette.warm, transparent: true, depthWrite: false, side: DoubleSide});
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  room.add(mesh);

  return (tip: Vector3, spin: number, opacity: number) => {
    mesh.visible = opacity > 0;
    if (!mesh.visible) return;
    const z = tip.z - DISC_Z;
    const center = Math.atan2(z, tip.x);
    const radius = Math.hypot(tip.x, z);
    const revolutions = (center - spin) / TAU;
    const fraction = revolutions - Math.floor(revolutions);
    let closest = fraction;
    for (let turn = 1; turn < TURN_COUNT; turn++) {
      const candidate = turn + fraction;
      if (Math.abs(grooveRadius(candidate) - radius) < Math.abs(grooveRadius(closest) - radius)) closest = candidate;
    }

    const vertices = geometry.getAttribute('position');
    for (let index = 0; index <= segments; index++) {
      const progress = index / segments;
      const arc = (progress - 0.5) * 0.62;
      const angle = center + arc;
      const outer = grooveRadius(closest + arc / TAU);
      const width = 0.0032 * Math.sin(progress * Math.PI);
      for (const side of [0, 1]) {
        const r = outer + (2 * side - 1) * width;
        vertices.setXYZ(index * 2 + side, r * Math.cos(angle), DISC_Y + 0.0015, DISC_Z + r * Math.sin(angle));
      }
    }
    vertices.needsUpdate = true;
    material.opacity = opacity;
  };
}

export function buildPickup(room: Group, m: VinylMaterials): Motion {
  const {disc, tonearm, cartridge, needle} = system(room, m);
  const traceGroove = buildGrooveTrace(room);
  const needleTip = new Vector3();
  const model = new Group();
  room.add(model);
  const housingY = 2.15;
  // Leave the front and the cantilever slot open in the cutaway.
  m.block(model, [0.56, 0.033, 0.16], [0, -0.12, -0.13], '#667579', 0.011);
  m.block(model, [0.56, 0.29, 0.038], [0, 0.012, -0.196], '#56666A', 0.015);
  m.block(model, [0.55, 0.033, 0.20], [0, 0.16, -0.096], '#57686A', 0.009);
  for (const side of [-1, 1]) {
    m.block(model, [0.17, 0.033, 0.15], [side * 0.195, -0.12, 0.026], '#667579', 0.011);
    m.block(model, [0.032, 0.29, 0.27], [side * 0.267, 0.014, -0.075], '#4A585C', 0.011);
  }

  // The magnet and stylus rock together about the suspension. The coils stay fixed.
  const cantilever = new Group();
  cantilever.position.set(0, -0.069, 0.105);
  model.add(cantilever);
  const magnet: Position = [0, 0.048, -0.051];
  const stylusBottom = DISC_Y - housingY - cantilever.position.y - 0.002;
  const stylusZ = 0.211 - cantilever.position.z;
  m.block(cantilever, [0.108, 0.087, 0.104], magnet, '#76878B', 0.011);
  const shaft = new CatmullRomCurve3([
    vector(magnet), new Vector3(), new Vector3(0, stylusBottom + 0.022, stylusZ),
  ]);
  m.model(cantilever, new TubeGeometry(shaft, 18, 0.014, 8, false), palette.nickel, [0, 0, 0]);
  m.model(cantilever, new CylinderGeometry(0.018, 0.0035, 0.029, 6), '#E9CA96',
    [0, stylusBottom + 0.0145, stylusZ]);

  for (const x of [-0.129, 0.129]) {
    const winding = new Group();
    winding.position.set(x, 0.036, 0.024);
    model.add(winding);
    const core = m.model(winding, new CylinderGeometry(0.048, 0.048, 0.092, 18), '#777C74', [0, 0, 0]);
    core.rotation.x = Math.PI / 2;
    for (let index = 0; index < 6; index++) {
      m.model(winding, new TorusGeometry(0.056, 0.0066, 6, 23), '#B67C61',
        [0, 0, -0.04 + index * 0.016]);
    }
  }

  const signal = signalDot(room, 0.035);
  const line = new CatmullRomCurve3([
    new Vector3(1.06, 2.19, 0.505), new Vector3(1.26, 2.17, -0.021),
    new Vector3(1.67, 2.19, -0.82), new Vector3(1.77, 2.18, -1.54),
    new Vector3(2.23, 1.52, -1.92), new Vector3(2.45, 1.09, -1.85),
  ]);
  return (camera, p, t) => {
    const reveal = p >= 0.415;
    const lower = ease(0.02, 0.22, p);
    const spin = t * TAU / 1.8;
    disc.rotation.y = -spin;
    tonearm.rotation.x = mix(-0.068, 0.0025, lower) + 0.00043 * Math.sin(t * 62);
    tonearm.rotation.y = -0.018 * ease(0.20, 0.95, p);
    cartridge.visible = !reveal;
    needle.visible = !reveal;
    model.visible = reveal;
    model.position.set(1.035, housingY, 0.52);
    model.rotation.y = -0.30;
    cantilever.rotation.y = 0.14 * Math.sin(t * 37) + 0.055 * Math.sin(t * 71);
    signal.visible = p > 0.798;
    line.getPointAt(ease(0.798, 0.98, p), signal.position);
    needle.localToWorld(needleTip.set(0, -0.0225, 0));
    traceGroove(needleTip, spin, reveal ? 0 : 0.75 * ease(0.22, 0.28, p));
    if (!reveal) {
      const focus = pose(camera, [2.37, 2.56, 2.43], [1.78, 2.32, 1.90], [1.08, 2.10, 0.70], ease(0, 0.415, p));
      focus.y -= 0.045 * ease(0.22, 0.41, p);
      return {focus, exposure: 1.25, atmosphere: {beam: false, dust: false}};
    }
    const progress = ease(0.798, 0.98, p);
    const focus = pose(camera, [1.43, 2.56, 2.77], [3.56, 3.07, 3.87], [1.03, 2.12, 0.57], progress);
    focus.lerp(new Vector3(1.87, 1.88, -0.70), progress);
    return {focus, exposure: 1.15, atmosphere: {beam: false, dust: false}};
  };
}

export function buildAmplification(room: Group, m: VinylMaterials): Motion {
  const {disc, signalCables} = system(room, m);
  // A pair of readouts on the phono stage represent the two frequency bands.
  const readout = new Group();
  room.add(readout);
  m.block(readout, [0.724, 0.252, 0.024], [-0.26, 0.694, 1.344], '#242C2D', 0.013);
  const bass = m.block(readout, [0.137, 0.168, 0.016], [-0.43, 0.692, 1.362], '#F4D58A', 0.007, false);
  const treble = m.block(readout, [0.137, 0.168, 0.016], [-0.13, 0.692, 1.362], '#89A9BB', 0.007, false);
  const signal = signalDot(room, 0.052);
  const [input, , right] = signalCables;

  return (camera, p, t) => {
    disc.rotation.y = -t * TAU / 1.8;
    const correction = ease(0.24, 0.59, p);
    bass.scale.y = mix(0.41, 0.83, correction) * (1 + Math.sin(t * 8) * 0.052);
    treble.scale.y = mix(1, 0.60, correction) * (1 + Math.sin(t * 11) * 0.064);
    bass.position.y = 0.608 + bass.scale.y * 0.084;
    treble.position.y = 0.608 + treble.scale.y * 0.084;

    if (p < 0.31) input.getPointAt(ease(0, 0.31, p), signal.position);
    else right.getPointAt(ease(0.45, 0.88, p), signal.position);
    signal.visible = p < 0.31 || (p >= 0.45 && p <= 0.89);
    const pan = ease(0.55, 0.89, p);
    const focus = pose(camera, [1.30, 1.77, 5.40], [6.02, 3.02, 11.18], [-0.04, 0.76, 1.22], pan);
    focus.lerp(new Vector3(2.4, 1.32, 0.0), pan);
    return {focus, exposure: mix(1.25, 1.0, pan)};
  };
}

export function buildClosing(room: Group, m: VinylMaterials): Motion {
  const {disc, cones} = system(room, m);
  const listenerPosition: Position = [-3.37, 0.133, 2.50];
  const {person, head} = buildFigure(room, m, listenerPosition);
  person.rotation.y = 0.57;
  contactShade(room, m, 1.17, 0.99, [listenerPosition[0], 0.145, listenerPosition[2]]);
  const coneOrigins = cones.map((cone) => cone.position.z);
  const waveRing = new RingGeometry(0.316, 0.33, 56);
  const airWaves = [cones[0], cones[2]].map((woofer) => {
    const origin = room.worldToLocal(woofer.getWorldPosition(new Vector3()));
    const rings = Array.from({length: 3}, () => {
      const ring = new Mesh(waveRing, new MeshBasicMaterial({color: palette.warm, transparent: true, depthWrite: false}));
      room.add(ring);
      return ring;
    });
    return {origin, rings};
  });
  const openingFrames = vinylTimeline.scenes[0].durationInFrames;
  const listeningEye = new Vector3(12, 9.7, 28.75);
  const listeningFocus = new Vector3(-0.80, 2.4, 0.55);

  return (camera, p, t, frame, durationInFrames) => {
    const remaining = durationInFrames - 1 - frame;
    const spin = -remaining * TAU / 54;
    disc.rotation.y = -spin;
    const playing = 1 - ease(0.48, 0.60, p);
    cones.forEach((cone, index) => {
      cone.position.z = coneOrigins[index] + Math.sin(t * 22 + index * 0.4) * 0.033 * playing;
    });
    for (const {origin, rings} of airWaves) {
      rings.forEach((ring, index) => {
        const travel = (t * 1.25 + index / rings.length) % 1;
        ring.visible = playing > 0;
        ring.position.copy(origin);
        ring.position.z += 0.05 + travel * 0.55;
        ring.scale.setScalar(0.98 + travel * 0.66);
        ring.material.opacity = 0.58 * playing * Math.sin(Math.PI * travel);
      });
    }
    head.rotation.z = 0.105 + Math.sin(t * 2.3) * 0.022;
    head.rotation.x = 0.065;
    person.visible = p < 0.76;
    const rewind = 1 - ease(0.55, 1, p);
    const opening = setOpeningCamera(camera, rewind * (openingFrames - 1), openingFrames, VINYL_FPS, spin);
    const onListener = 1 - ease(0.51, 0.74, p);
    camera.position.lerp(listeningEye, onListener);
    return {
      focus: opening.focus.lerp(listeningFocus, onListener),
      exposure: opening.exposure,
      atmosphere: {beam: opening.p > 0.45, dust: opening.p > 0.36},
    };
  };
}
