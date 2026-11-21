import {
  CatmullRomCurve3, Color, DirectionalLight, Group, MathUtils, Mesh, MeshBasicMaterial, PlaneGeometry,
  RingGeometry, ShaderMaterial, SphereGeometry, TubeGeometry, Vector3, type Texture,
} from 'three';
import {createVinylStage} from '../vinilo-apertura/render';
import {bench, workRoom} from '../vinilo-produccion/sets';
import {paintInkProof} from './ink-proof';
import {buildNozzleCutaway} from './nozzle';
import {buildInkjetPrinter, inkColors, nozzleZ} from './printer';
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
const firstBand = 0.15;
const repeatPasses = 8;
const repeatBand = (1 - firstBand) / repeatPasses;
const paperUnderHead = (bandCenter: number) => nozzleZ + imageSize * (bandCenter - 0.5);

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

  const {printer, photo, carriage, pose, revealChannels} = buildInkjetPrinter(room, m);
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
  const lightInk = new Color('#E4F6FF');
  const reservoirPaths = inkColors.map((color, index) => {
    const x = (index - 1.5) * 0.225;
    const path = new CatmullRomCurve3([
      new Vector3(x, 0.125, 0.155), new Vector3(x, -0.095, 0.168),
      new Vector3(x * 0.69, -0.237, 0.12), new Vector3(x * 0.69, -0.335, 0.050),
    ]);
    const material = new MeshBasicMaterial({color});
    channels.add(new Mesh(new TubeGeometry(path, 18, 0.020, 6, false), material));
    const bead = new Mesh(beadGeometry, new MeshBasicMaterial({color: new Color(color).lerp(lightInk, 0.52)}));
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
    const feed = 1 - ease(p, 0.86, 1);
    pose(MathUtils.lerp(paperStart, paperEnd, feed), cover);
    inkOnSheet(1, 0, 0, false, cover);
    onPaper(ease(p, 0.72, 1));
    focus.copy(mechanism).lerp(center, ease(p, 0.01, test ? 0.47 : 0.36)).lerp(leafFocus, ease(p, 0.39, 0.99));
    shoot(t, openDistance * Math.pow(macroDistance / openDistance, approach),
      openYaw * (1 - approach), MathUtils.lerp(openElevation, macroElevation, approach));
  }

  function printing(t: number, p: number, accelerated: boolean) {
    const count = accelerated ? repeatPasses : 1;
    const overall = accelerated
      ? 2 * ease(p, 0.03, 0.37) + (count - 2) * ease(p, 0.37, 0.83)
      : ease(p, 0.13, 0.88);
    const index = Math.min(count - 1, Math.floor(overall));
    const stroke = overall - index;
    const sweep = ease(stroke, 0.04, 0.79);
    const reversed = (index + Number(accelerated)) % 2 === 1;
    const carriageX = MathUtils.lerp(-imageSize / 2, imageSize / 2, reversed ? 1 - sweep : sweep);
    const printed = accelerated ? firstBand + repeatBand * index : 0;
    const band = accelerated ? repeatBand : firstBand;
    const advance = (band + repeatBand) / 2 * ease(stroke, 0.83, 1);
    const printZ = paperUnderHead(printed + band / 2 + advance);
    const eject = accelerated ? ease(p, 0.83, 0.98) : 0;
    const z = MathUtils.lerp(printZ, paperEnd, eject);
    pose(z, 1, MathUtils.lerp(carriageX, 0.02, eject));
    // At the end of a stroke, keep the completed rows and clear the partial row.
    if (stroke >= 0.79) inkOnSheet(printed + band);
    else inkOnSheet(printed, band, sweep, reversed);
    spray.visible = stroke > 0.07 && stroke < 0.80;
    spray.position.set(carriageX, 0.503, nozzleZ);
    drops.forEach((drop, i) => {
      const fall = (t * 5.7 + i * 0.22) % 1;
      drop.visible = Math.abs(carriageX + drop.position.x) < imageSize / 2;
      drop.position.y = 0.132 * (1 - fall);
    });
    aim(0, 0.72, accelerated ? MathUtils.lerp(0.32, 1.19, ease(p, 0.48, 0.96)) : 0.11);
    shoot(t, accelerated ? 14.1 : 9.6, accelerated ? 0.14 : -0.08, accelerated ? 0.87 : 1.04);
  }

  function draw(frame: number, fps: number, full: boolean) {
    const last = full ? printFullFrames - 1 : printLoopFrames - 1;
    printer.visible = true;
    nozzle.cutaway.visible = false;
    marker.visible = false;
    channels.visible = false;
    spray.visible = false;
    revealChannels(0);
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
        pose(MathUtils.lerp(-2.41, paperUnderHead(firstBand / 2), ease(p, 0.16, 0.78)), 1, 1.22);
        inkOnSheet(0);
        aim(-0.23, 0.59, MathUtils.lerp(-1.16, -0.94, ease(p, 0.50, 0.93)));
        shoot(t, MathUtils.lerp(11.5, 7.1, ease(p, 0.04, 0.83)), 0.17, 1.08);
        return;
      case 'cabezal':
        pose(paperUnderHead(firstBand / 2), 1, -0.15);
        inkOnSheet(0);
        const cutaway = ease(p, 0.06, 0.27);
        revealChannels(cutaway);
        channels.visible = cutaway > 0.20;
        reservoirPaths.forEach(({path, bead}, i) => path.getPointAt((p * 1.65 + i * 0.19) % 1, bead.position));
        aim(-0.15, 0.92, -0.09);
        shoot(t, MathUtils.lerp(8.8, 5.55, ease(p, 0.05, 0.91)), 0.14, 0.58);
        return;
      case 'gota':
        printer.visible = false;
        nozzle.cutaway.visible = true;
        laboratoryLight.intensity = 1.52;
        nozzle.pose(p);
        const landing = ease(p, 0.68, 0.96);
        focus.set(0, nozzle.cutaway.position.y + MathUtils.lerp(2.06, 1.44, landing), 0.22);
        shoot(t, MathUtils.lerp(13.7, 11.1, ease(p, 0.05, 0.95)), 0.11, MathUtils.lerp(0.19, 0.36, landing));
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
