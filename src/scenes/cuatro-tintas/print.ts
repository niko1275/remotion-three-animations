import {
  CatmullRomCurve3, DirectionalLight, Group, MathUtils, Mesh, MeshBasicMaterial, PlaneGeometry,
  RingGeometry, ShaderMaterial, SphereGeometry, TubeGeometry, Vector3, type Texture,
} from 'three';
import {createVinylStage} from '../vinilo-apertura/render';
import {bench, workRoom} from '../vinilo-produccion/sets';
import {paintInkProof} from './ink-proof';
import {buildNozzleCutaway} from './nozzle';
import {buildInkjetPrinter, inkColors} from './printer';
import {printFullFrames, printLoopFrames, printOpeningFrames, printScenes} from './timeline';

export const landscapeFile = 'cuatro-tintas/paisaje.png';
export const hill = {u: 0.73, v: 0.37};
export const greenDetail = (progress: number) => ease(progress, 0.08, 0.28) * (1 - ease(progress, 0.80, 0.98));
const leaf = {u: 0.445, v: 0.644};
const imageSize = 2.24;
const paperHeight = 2.8;
const paperStart = 1.985;
const paperEnd = 2.59;
const ease = (progress: number, start: number, end: number) => MathUtils.smoothstep(progress, start, end);

function printedLandscape(landscape: Texture) {
  return new Mesh(new PlaneGeometry(imageSize, imageSize), new ShaderMaterial({
    uniforms: {
      landscape: {value: landscape}, printed: {value: 1}, band: {value: 0},
      sweep: {value: 0}, reversed: {value: 0}, cool: {value: 0},
    },
    vertexShader: `
      varying vec2 paperUV;
      void main() {
        paperUV = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D landscape;
      uniform float printed;
      uniform float band;
      uniform float sweep;
      uniform float reversed;
      uniform float cool;
      varying vec2 paperUV;
      const vec2 lines = vec2(142.0);

      // Approximate CMYK coverage for display at the scale of individual dots.
      vec4 density(vec3 rgb, vec2 uv) {
        float hillPatch = 1.0 - smoothstep(0.12, 0.22, distance(uv, vec2(0.73, 0.37)));
        float green = smoothstep(0.06, 0.22, rgb.g - max(rgb.r, rgb.b));
        float twoInk = hillPatch * green;
        float black = 0.84 * (1.0 - max(rgb.r, max(rgb.g, rgb.b))) * (1.0 - twoInk);
        vec3 ink = clamp((1.0 - rgb - black) / (1.0 - black), 0.0, 1.0);
        ink.g *= 1.0 - twoInk;
        return vec4(ink, black);
      }

      float dotMask(vec2 point, vec2 offset, int channel) {
        vec2 grid = point + offset;
        vec2 cell = floor(grid);
        vec2 center = cell + 0.5;
        vec2 sampleUV = (center - offset) / lines + 0.5;
        float cover = density(texture2D(landscape, sampleUV).rgb, sampleUV)[channel];
        float threshold = fract(sin(dot(cell, vec2(12.9898, 78.233)) + float(channel) * 37.71) * 43758.5453);
        float radius = mix(0.36, 0.58, cover);
        float edge = max(0.002, 0.64 * length(fwidth(grid)));
        return step(max(0.001, threshold), cover) * (1.0 - smoothstep(radius - edge, radius + edge, length(grid - center)));
      }

      void main() {
        vec2 point = (paperUV - 0.5) * lines;
        float c = dotMask(point, vec2(0.13, 0.56), 0);
        float m = dotMask(point, vec2(0.56, 0.09), 1);
        float y = dotMask(point, vec2(0.77, 0.50), 2);
        float k = dotMask(point, vec2(0.39, 0.86), 3);
        vec3 ink = mix(vec3(1.0), vec3(0.09, 0.70, 0.84), c)
          * mix(vec3(1.0), vec3(0.88, 0.15, 0.55), m)
          * mix(vec3(1.0), vec3(0.99, 0.86, 0.11), y)
          * mix(vec3(1.0), vec3(0.09, 0.082, 0.080), k);
        float footprint = max(length(dFdx(point)), length(dFdy(point)));
        vec3 visibleInk = mix(ink, texture2D(landscape, paperUV).rgb, smoothstep(0.10, 0.31, footprint));
        float column = mix(paperUV.x, 1.0 - paperUV.x, reversed);
        float complete = step(paperUV.y, printed);
        float current = step(paperUV.y, printed + band) * step(column, sweep);
        float deposited = max(complete, current);
        float grain = fract(sin(dot(floor(paperUV * 1840.0), vec2(12.9898, 78.233))) * 43758.5453);
        vec3 paper = mix(vec3(0.984, 0.955, 0.900), vec3(0.989, 0.983, 0.981), cool);
        paper *= mix(0.965, 1.0, grain);
        gl_FragColor = vec4(pow(mix(vec3(1.0), visibleInk, deposited) * paper, vec3(2.2)), 1.0);
        #include <colorspace_fragment>
      }
    `,
  }));
}

export function createPrintOpening(canvas: HTMLCanvasElement, width: number, height: number, texture: Texture, proof: HTMLCanvasElement) {
  const stage = createVinylStage(canvas, width, height);
  const proofContext = proof.getContext('2d')!;
  const {room, materials: m, camera} = stage;
  workRoom(room, m, true);
  bench(room, m, 0, 0.11, 6.05, 4.04);

  const {printer, photo, carriage, pose} = buildInkjetPrinter(room, m);
  m.block(photo, [imageSize + 0.13, paperHeight + 0.14, 0.018], [0, 0, 0], '#EAE5D4', 0.008, false);
  const sheet = printedLandscape(texture);
  sheet.position.z = 0.010;
  photo.add(sheet);

  const marker = new Mesh(new RingGeometry(0.092, 0.102, 52), new MeshBasicMaterial({color: '#E5F7FF'}));
  marker.position.set((hill.u - 0.5) * imageSize, (hill.v - 0.5) * imageSize, 0.013);
  photo.add(marker);

  const channels = new Group();
  carriage.add(channels);
  const beadGeometry = new SphereGeometry(0.038, 14, 10);
  const reservoirPaths = inkColors.map((color, index) => {
    const x = (index - 1.5) * 0.225;
    const path = new CatmullRomCurve3([
      new Vector3(x, 0.16, 0.332), new Vector3(x, -0.12, 0.355),
      new Vector3(x * 0.69, -0.26, 0.316), new Vector3(x * 0.69, -0.35, 0.205),
    ]);
    const material = new MeshBasicMaterial({color});
    channels.add(new Mesh(new TubeGeometry(path, 18, 0.020, 6, false), material));
    const bead = new Mesh(beadGeometry, material);
    channels.add(bead);
    return {path, bead};
  });
  const spray = new Group();
  printer.add(spray);
  const drops = inkColors.map((color, index) => {
    const drop = new Mesh(beadGeometry, new MeshBasicMaterial({color}));
    drop.position.x = (index - 1.5) * 0.12;
    drop.scale.set(0.78, 1.35, 0.78);
    spray.add(drop);
    return drop;
  });

  const nozzle = buildNozzleCutaway(room, m);
  const laboratoryLight = new DirectionalLight('#E9F4FF', 0);
  laboratoryLight.position.set(3.1, 5.1, 4.5);
  room.add(laboratoryLight);

  const machine = printer.localToWorld(new Vector3(0, 0.86, 0.96));
  const mechanism = printer.localToWorld(new Vector3(0.02, 0.95, -0.17));
  const leafFocus = new Vector3();
  const center = new Vector3();
  const focus = new Vector3();
  const point = new Vector3();
  const macroDistance = 0.83;
  const macroElevation = 1.26;
  const openDistance = 12.55;
  const openElevation = 0.74;
  const openYaw = 0.16;

  function onPaper(scan: number) {
    photo.localToWorld(leafFocus.set((leaf.u - 0.5) * imageSize + 0.027 * scan,
      (leaf.v - 0.5) * imageSize - 0.019 * scan, sheet.position.z));
    photo.localToWorld(center.set(0, 0, sheet.position.z));
  }

  function aim(x: number, y: number, z: number) {
    focus.copy(printer.localToWorld(point.set(x, y, z)));
  }

  function shoot(t: number, distance: number, yaw: number, elevation: number) {
    camera.position.set(Math.sin(yaw) * Math.cos(elevation), Math.sin(elevation), Math.cos(yaw) * Math.cos(elevation));
    camera.position.multiplyScalar(distance).add(focus);
    camera.near = 0.015;
    stage.render(t, focus, 1.05, {beam: distance > 14, dust: distance > 14}, true);
  }

  function inkOnSheet(printed: number, band = 0, sweep = 0, reversed = false, cool = 1) {
    const uniforms = sheet.material.uniforms;
    uniforms.printed.value = printed;
    uniforms.band.value = band;
    uniforms.sweep.value = sweep;
    uniforms.reversed.value = Number(reversed);
    uniforms.cool.value = cool;
  }

  function opening(frame: number, fps: number) {
    const p = frame / (printOpeningFrames - 1);
    const cover = ease(p, 0.57, 0.86);
    const reveal = ease(p, 0.045, 0.66);
    const inside = ease(p, 0.64, 0.93);
    pose(MathUtils.lerp(paperStart, paperEnd, ease(p, 0.23, 0.53)), cover);
    inkOnSheet(1, 0, 0, false, cover);
    onPaper(1 - ease(p, 0, 0.19));
    focus.copy(leafFocus).lerp(center, ease(p, 0.16, 0.39)).lerp(machine, ease(p, 0.36, 0.65)).lerp(mechanism, inside);
    const wide = macroDistance * Math.pow(16.1 / macroDistance, reveal);
    shoot(frame / fps, MathUtils.lerp(wide, openDistance, inside), openYaw * reveal,
      MathUtils.lerp(macroElevation, openElevation, reveal));
  }

  function returnToLeaf(t: number, p: number, test: boolean) {
    const approach = ease(p, test ? 0.16 : 0.47, 0.99);
    const cover = 1 - ease(p, 0.83, 1);
    const exit = test ? 1 : ease(p, 0, 0.31);
    const feed = exit * (1 - ease(p, 0.86, 1));
    pose(MathUtils.lerp(paperStart, paperEnd, feed), cover);
    inkOnSheet(1, 0, 0, false, cover);
    onPaper(ease(p, 0.72, 1));
    focus.copy(mechanism).lerp(center, ease(p, 0.01, test ? 0.47 : 0.36)).lerp(leafFocus, ease(p, 0.39, 0.99));
    shoot(t, openDistance * Math.pow(macroDistance / openDistance, approach),
      openYaw * (1 - approach), MathUtils.lerp(openElevation, macroElevation, approach));
  }

  function printing(t: number, p: number, accelerated: boolean) {
    const count = accelerated ? 8 : 1;
    const overall = count * (accelerated ? ease(p, 0.04, 0.88) : ease(p, 0.15, 0.78));
    const index = Math.min(count - 1, Math.floor(overall));
    const stroke = overall - index;
    const sweep = ease(stroke, 0.04, 0.79);
    const reversed = (index + Number(accelerated)) % 2 === 1;
    const carriageX = MathUtils.lerp(-1.09, 1.09, reversed ? 1 - sweep : sweep);
    const advance = (index + ease(stroke, 0.83, 1)) / count;
    const z = accelerated ? MathUtils.lerp(-0.59, paperStart, advance) : MathUtils.lerp(-0.91, -0.59, advance);
    pose(z, 1, carriageX);
    const printed = accelerated ? 0.15 + 0.85 * index / count : 0;
    const band = accelerated ? 0.85 / count : 0.15;
    inkOnSheet(overall >= count ? printed + band : printed, band, sweep, reversed);
    spray.visible = stroke > 0.07 && stroke < 0.80;
    spray.position.set(carriageX, 0.49, -0.17);
    drops.forEach((drop, i) => {
      const fall = (t * 5.7 + i * 0.22) % 1;
      drop.position.y = 0.26 * (1 - fall);
    });
    aim(0, 0.72, accelerated ? MathUtils.lerp(0.32, 1.27, ease(p, 0.28, 0.94)) : 0.16);
    shoot(t, accelerated ? 13.7 : 10.0, accelerated ? 0.14 : -0.08, accelerated ? 0.87 : 1.01);
  }

  function draw(frame: number, fps: number, full: boolean) {
    const last = full ? printFullFrames - 1 : printLoopFrames - 1;
    printer.visible = true;
    nozzle.cutaway.visible = false;
    marker.visible = false;
    channels.visible = false;
    spray.visible = false;
    laboratoryLight.intensity = 0;
    if (frame < printOpeningFrames || frame === last) {
      opening(frame === last ? 0 : frame, fps);
      return;
    }
    if (!full) {
      returnToLeaf(frame / fps, (frame - printOpeningFrames + 1) / (printLoopFrames - printOpeningFrames), true);
      return;
    }

    const scene = printScenes.find(({end}) => frame < end)!;
    const p = (frame - scene.from) / (scene.duration - 1);
    const t = frame / fps;
    switch (scene.id) {
      case 'rodillos':
        pose(MathUtils.lerp(-1.47, -0.91, ease(p, 0.11, 0.84)), 1, 1.22);
        inkOnSheet(0);
        aim(-0.13, 0.64, -0.96);
        shoot(t, MathUtils.lerp(12.5, 9.4, ease(p, 0.04, 0.93)), 0.17, 1.08);
        return;
      case 'cabezal':
        pose(-0.91, 1, -0.15);
        inkOnSheet(0);
        channels.visible = true;
        reservoirPaths.forEach(({path, bead}, i) => path.getPointAt((p * 1.65 + i * 0.19) % 1, bead.position));
        aim(-0.15, 0.92, -0.09);
        shoot(t, MathUtils.lerp(8.8, 5.55, ease(p, 0.05, 0.91)), 0.14, 0.58);
        return;
      case 'gota':
        printer.visible = false;
        nozzle.cutaway.visible = true;
        laboratoryLight.intensity = 1.52;
        nozzle.pose(p);
        focus.set(0, 2.06, 0.22);
        shoot(t, MathUtils.lerp(14.4, 12.8, ease(p, 0.05, 0.82)), 0.11, 0.19);
        return;
      case 'pasada':
      case 'franjas':
        printing(t, p, scene.id === 'franjas');
        return;
      case 'verde': {
        const detail = greenDetail(p);
        pose(paperEnd, 1, 0.02, detail);
        inkOnSheet(1);
        marker.visible = detail > 0.20;
        aim(0, 1.43, MathUtils.lerp(0.72, 0.99, ease(p, 0.68, 1)));
        shoot(t, MathUtils.lerp(14.4, 13.1, ease(p, 0.66, 1)), 0.085, 0.78);
        if (detail > 0) paintInkProof(proofContext, texture.image as HTMLImageElement, hill, p);
        return;
      }
      case 'salida':
        returnToLeaf(t, p, false);
        return;
    }
  }

  return {draw, dispose: stage.dispose};
}
