import {
  CatmullRomCurve3, CylinderGeometry, Group, Mesh, MeshBasicMaterial, SphereGeometry, TorusGeometry,
  TubeGeometry, Vector3,
} from 'three';
import {buildLiving} from '../vinilo-apertura/living';
import {palette, vector, type Position, type VinylMaterials} from '../vinilo-apertura/materials';
import {setOpeningCamera} from '../vinilo-apertura/render';
import {buildPlayer, TAU} from '../vinilo-apertura/vinyl';
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

export function buildPickup(room: Group, m: VinylMaterials): Motion {
  const {disc, tonearm, cartridge, needle} = system(room, m);
  const model = new Group();
  room.add(model);
  // A didactic cut of the installed cartridge. The bottom supports the parts and the near shell is open.
  m.block(model, [0.56, 0.033, 0.42], [0, -0.12, 0], '#667579', 0.011);
  m.block(model, [0.56, 0.29, 0.038], [0, 0.012, -0.196], '#56666A', 0.015);
  m.block(model, [0.55, 0.033, 0.20], [0, 0.16, -0.096], '#57686A', 0.009);
  for (const x of [-0.267, 0.267]) {
    m.block(model, [0.032, 0.29, 0.42], [x, 0.014, 0], '#4A585C', 0.011);
  }
  const magnet = m.block(model, [0.108, 0.087, 0.104], [0, -0.021, 0.054], palette.copper, 0.011);
  const cantilever = new Group();
  model.add(cantilever);
  const origin: Position = [0, -0.018, 0.054];
  const tip: Position = [0, -0.171, 0.209];
  m.model(cantilever, new TubeGeometry(new CatmullRomCurve3([vector(origin), vector([0, -0.106, 0.15]), vector(tip)]),
    18, 0.014, 8, false), palette.nickel, [0, 0, 0]);
  m.model(cantilever, new CylinderGeometry(0.023, 0.004, 0.046, 6), '#E9CA96', [0, -0.179, 0.211]);

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
    const reveal = p >= 0.49;
    const lower = ease(0.02, 0.22, p);
    disc.rotation.y = -t * TAU / 1.8;
    tonearm.rotation.x = mix(-0.068, 0.0025, lower) + 0.00043 * Math.sin(t * 62);
    tonearm.rotation.y = -0.018 * ease(0.20, 0.95, p);
    cartridge.visible = !reveal;
    needle.visible = !reveal;
    model.visible = reveal;
    model.position.set(1.035, 2.15, 0.52);
    model.rotation.y = -0.30;
    const vibration = 0.017 * Math.sin(t * 37) + 0.007 * Math.sin(t * 71);
    magnet.position.x = vibration;
    cantilever.rotation.y = vibration * 4;
    signal.visible = p > 0.73;
    line.getPointAt(ease(0.73, 0.98, p), signal.position);
    if (!reveal) {
      const focus = pose(camera, [2.37, 2.56, 2.43], [1.78, 2.32, 1.90], [1.08, 2.10, 0.70], ease(0, 0.49, p));
      return {focus, exposure: 1.25, atmosphere: {beam: false, dust: false}};
    }
    const progress = ease(0.72, 0.98, p);
    const focus = pose(camera, [1.62, 2.65, 2.62], [3.56, 3.07, 3.87], [1.03, 2.13, 0.53], progress);
    focus.lerp(new Vector3(1.87, 1.88, -0.70), progress);
    return {focus, exposure: 1.15, atmosphere: {beam: false, dust: false}};
  };
}

export function buildAmplification(room: Group, m: VinylMaterials): Motion {
  const {disc, cones, signalCables} = system(room, m);
  // A pair of readouts on the phono stage represent the two frequency bands.
  const readout = new Group();
  room.add(readout);
  m.block(readout, [0.724, 0.252, 0.024], [-0.26, 0.694, 1.344], '#242C2D', 0.013);
  const bass = m.block(readout, [0.137, 0.168, 0.016], [-0.43, 0.692, 1.362], '#F4D58A', 0.007, false);
  const treble = m.block(readout, [0.137, 0.168, 0.016], [-0.13, 0.692, 1.362], '#89A9BB', 0.007, false);
  const signal = signalDot(room, 0.052);
  const [input, , right] = signalCables;
  const coneOrigins = cones.map((cone) => cone.position.z);

  return (camera, p, t) => {
    disc.rotation.y = -t * TAU / 1.8;
    const correction = ease(0.30, 0.64, p);
    bass.scale.y = mix(0.41, 0.83, correction) * (1 + Math.sin(t * 8) * 0.052);
    treble.scale.y = mix(1, 0.60, correction) * (1 + Math.sin(t * 11) * 0.064);
    bass.position.y = 0.608 + bass.scale.y * 0.084;
    treble.position.y = 0.608 + treble.scale.y * 0.084;

    if (p < 0.31) input.getPointAt(ease(0, 0.31, p), signal.position);
    else right.getPointAt(ease(0.45, 0.88, p), signal.position);
    signal.visible = p < 0.31 || (p >= 0.45 && p <= 0.89);
    const playback = ease(0.73, 0.91, p);
    cones.forEach((cone, index) => {
      cone.position.z = coneOrigins[index] + Math.sin(t * (index % 2 ? 17 : 22)) * 0.026 * playback;
    });
    const pan = ease(0.53, 0.99, p);
    const focus = pose(camera, [1.30, 1.77, 5.40], [6.02, 3.02, 11.18], [-0.04, 0.76, 1.22], pan);
    focus.lerp(new Vector3(2.4, 1.32, 0.0), pan);
    return {focus, exposure: mix(1.25, 1.0, pan)};
  };
}

export function buildClosing(room: Group, m: VinylMaterials): Motion {
  const {disc, cones} = system(room, m);
  const {person, head} = buildFigure(room, m, [-2.02, 0.133, 1.32]);
  person.rotation.y = 0.42;
  contactShade(room, m, 1.17, 0.99, [-2.02, 0.145, 1.32]);
  const coneOrigins = cones.map((cone) => cone.position.z);
  const openingFrames = vinylTimeline.scenes[0].durationInFrames;
  const endFocus = new Vector3();

  return (camera, p, t, frame, durationInFrames) => {
    const remaining = durationInFrames - 1 - frame;
    const spin = -remaining * TAU / 54;
    disc.rotation.y = -spin;
    const playing = 1 - ease(0.36, 0.55, p);
    cones.forEach((cone, index) => {
      cone.position.z = coneOrigins[index] + Math.sin(t * 22 + index * 0.4) * 0.033 * playing;
    });
    head.rotation.z = 0.105 + Math.sin(t * 2.3) * 0.022;
    head.rotation.x = 0.065;
    person.visible = p < 0.76;
    if (p < 0.42) {
      const movement = ease(0.02, 0.42, p);
      const overview = setOpeningCamera(camera, openingFrames - 1, openingFrames, VINYL_FPS, spin);
      camera.position.lerpVectors(new Vector3(-4.5, 4.7, 14.5), camera.position, movement);
      endFocus.set(-0.65, 1.71, 0.10).lerp(overview.focus, movement);
      return {focus: endFocus};
    }
    const rewind = 1 - ease(0.42, 1, p);
    const opening = setOpeningCamera(camera, rewind * (openingFrames - 1), openingFrames, VINYL_FPS, spin);
    return {
      focus: opening.focus,
      exposure: opening.exposure,
      atmosphere: {beam: opening.p > 0.45, dust: opening.p > 0.36},
    };
  };
}
