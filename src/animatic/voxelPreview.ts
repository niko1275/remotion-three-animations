import {PerspectiveCamera, Vector3} from 'three';
import type {VinylSceneId} from '../timeline';

type Point = [number, number, number];
type DrawItem = {depth: number; draw: () => void};

const TAU = Math.PI * 2;
const ink = '#1B1714';
const charcoal = '#141414';
const slate = '#4A5560';
const wood = '#B9A27E';
const gold = '#F4D58A';
const brass = '#AC7644';
const nickel = '#A6AEAF';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const mix = (a: number, b: number, progress: number) => a + (b - a) * progress;
function ease(from: number, to: number, position: number) {
  const progress = clamp((position - from) / (to - from));
  return progress * progress * (3 - 2 * progress);
}

export function createVoxelPreview(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No se pudo iniciar la maqueta del animático.');
  const ctx = context;
  const {width, height} = canvas;
  const camera = new PerspectiveCamera(30, width / height, 0.1, 100);
  const vector = new Vector3();
  const items: DrawItem[] = [];

  const paper = document.createElement('canvas');
  paper.width = 144;
  paper.height = 144;
  const grain = paper.getContext('2d');
  if (grain) {
    let seed = 872311;
    function next() {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    grain.fillStyle = 'rgba(65,54,39,.13)';
    for (let n = 0; n < 1250; n++) grain.fillRect(next() * paper.width, next() * paper.height, 1, 1);
  }
  const paperPattern = ctx.createPattern(paper, 'repeat');

  function point([x, y, z]: Point): Point {
    vector.set(x, y, z).applyMatrix4(camera.matrixWorldInverse);
    const depth = -vector.z;
    vector.applyMatrix4(camera.projectionMatrix);
    return [(vector.x + 1) * width / 2, (1 - vector.y) * height / 2, depth];
  }

  function path(points: Point[]) {
    ctx.beginPath();
    points.forEach(([x, y], index) => index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
  }

  function polygon(points: Point[], fill: string, outline = 0) {
    path(points);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (outline) {
      ctx.lineWidth = outline;
      ctx.strokeStyle = ink;
      ctx.stroke();
    }
  }

  function stroke(points: Point[], color: string, weight: number) {
    path(points);
    ctx.lineWidth = weight;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  function addFace(points: Point[], color: string, outline = 1.4) {
    const flat = points.map(point);
    items.push({
      depth: flat.reduce((sum, p) => sum + p[2], 0) / flat.length,
      draw: () => polygon(flat, color, outline),
    });
  }

  function box([x, y, z]: Point, [w, h, d]: Point, colors: [string, string, string], outline = 1.35) {
    const left = x - w / 2;
    const right = x + w / 2;
    const low = y - h / 2;
    const high = y + h / 2;
    const far = z - d / 2;
    const near = z + d / 2;
    addFace([[left, high, far], [right, high, far], [right, high, near], [left, high, near]], colors[0], outline);
    addFace([[left, low, near], [right, low, near], [right, high, near], [left, high, near]], colors[1], outline);
    addFace([[right, low, far], [right, high, far], [right, high, near], [right, low, near]], colors[2], outline);
  }

  function circle([x, y, z]: Point, radius: number, sides = 48) {
    return Array.from({length: sides}, (_, index): Point => {
      const theta = index * TAU / sides;
      return [x + Math.cos(theta) * radius, y, z + Math.sin(theta) * radius];
    });
  }

  function plate([x, y, z]: Point, radius: number, base: string, edge: string, spin?: number) {
    const center: Point = [x, y, z];
    const top = circle(center, radius).map(point);
    const bottom = circle([x, y - 0.13, z], radius).map(point);
    items.push({
      depth: point(center)[2],
      draw: () => {
        polygon(bottom, edge, 1.4);
        polygon(top, base, 1.6);
        if (spin === undefined) return;
        for (const r of [radius * 0.51, radius * 0.68, radius * 0.86, radius * 0.95]) {
          const ring = circle(center, r).map(point);
          stroke([...ring, ring[0]], '#646366', 0.75);
        }
        polygon(circle(center, radius * 0.31).map(point), '#B8734E', 1.4);
        polygon(circle(center, radius * 0.07).map(point), gold, 0.8);
        const path = Array.from({length: 27}, (_, index): Point => {
          const angle = spin + index / 26 * 1.3;
          const r = mix(radius * 0.83, radius * 0.51, index / 26);
          return point([x + Math.cos(angle) * r, y, z + Math.sin(angle) * r]);
        });
        stroke(path, gold, 2.3);
        const mark = point([x + Math.cos(spin) * radius * 0.205, y, z + Math.sin(spin) * radius * 0.205]);
        ctx.fillStyle = gold;
        ctx.fillRect(mark[0] - 3, mark[1] - 3, 6, 6);
      },
    });
  }

  function segment(start: Point, end: Point, color: string, weight: number) {
    const a = point(start);
    const b = point(end);
    items.push({
      depth: (a[2] + b[2]) / 2,
      draw: () => {
        stroke([a, b], ink, weight + 2.6);
        stroke([a, b], color, weight);
      },
    });
  }

  const hornStart = new Vector3(-2.75, 4.47, -1.33);
  const hornAxis = new Vector3(0.51, 0.32, 0.8).normalize();
  const hornAcross = new Vector3(0, 1, 0).cross(hornAxis).normalize();
  const hornUp = hornAxis.clone().cross(hornAcross).normalize();
  const hornEnd = hornStart.clone().addScaledVector(hornAxis, 2.51);
  const hornRings = [0.16, 0.27, 0.49, 0.79, 1.19, 1.42];
  const hornLength = [0, 0.67, 1.16, 1.7, 2.15, 2.51];
  const hornSides = ['#C18A4B', '#D59D54', '#E4AC64', '#C38B51', '#DCAB62', '#F2C982'];
  function hornPoint(section: number, index: number, lip: number): Point {
    const theta = index / 16 * TAU;
    const petal = section === 5 && index % 2 === 1 ? 0.13 : 0;
    const radius = hornRings[section] * (section > 2 ? lip : 1) + petal;
    return hornStart.clone()
      .addScaledVector(hornAxis, hornLength[section] + petal * 0.22)
      .addScaledVector(hornAcross, Math.cos(theta) * radius)
      .addScaledVector(hornUp, Math.sin(theta) * radius)
      .toArray();
  }

  function horn(t: number, energy: number) {
    const lip = 1 + Math.sin(t * 16) * 0.017 * energy;
    for (let ring = 0; ring < hornRings.length - 1; ring++) {
      for (let i = 0; i < 16; i++) {
        addFace([hornPoint(ring, i, lip), hornPoint(ring, i + 1, lip),
          hornPoint(ring + 1, i + 1, lip), hornPoint(ring + 1, i, lip)],
        hornSides[(i + ring) % hornSides.length], ring === 4 ? 1.4 : 0.6);
      }
    }
    const rim = Array.from({length: 17}, (_, i) => hornPoint(5, i, lip));
    for (let i = 1; i < rim.length; i++) segment(rim[i - 1], rim[i], gold, 3.5);
  }

  function gramophone(t: number, lift: number, energy: number) {
    box([0, 0.24, 0], [7.35, 0.38, 5.27], [wood, '#82694B', '#644E39']);
    box([0, 1.34, 0], [6.93, 1.99, 4.89], [wood, '#A28762', '#796044']);
    box([0, 2.42, 0], [7.31, 0.24, 5.21], ['#D0B88F', '#967654', '#785D46']);
    box([0, 1.36, 2.455], [5.9, 1.47, 0.089], ['#C1A882', '#725740', '#6A503B']);
    box([0, 1.42, 2.52], [2.4, 0.84, 0.10], [gold, '#B9874A', '#9D683D']);
    for (const x of [-2.5, 2.5]) {
      for (let row = 0; row < 3; row++) {
        box([x, 1.04 + 0.32 * row, 2.51], [0.84 - row * 0.14, 0.12, 0.08], [gold, brass, '#8C6844']);
      }
    }
    for (const x of [-0.68, 0, 0.68]) {
      box([x, 1.39, 2.59], [0.29, 0.29, 0.16], [gold, x === 0 ? charcoal : '#9C6136', brass]);
    }
    const spin = t * TAU / 1.8;
    plate([0.12, 2.63, 0.3], 2.22, '#92795D', '#755F47');
    plate([0.12, 2.78, 0.3], 2.13, charcoal, '#282827', spin);
    const pivot: Point = [2.71, 2.75, -0.99];
    const head: Point = [1.18 + 0.11 * Math.sin(t * 2.15), 2.93 + lift, 0.88];
    const elbow: Point = [2.45, 3.03 + lift * 0.35, 0.28];
    box(pivot, [0.52, 0.48, 0.49], [gold, brass, '#775834']);
    segment([pivot[0], 3, pivot[2]], elbow, '#B28A56', 7);
    segment(elbow, head, gold, 6);
    box([head[0], head[1], head[2]], [0.43, 0.21, 0.36], [gold, brass, '#775834']);
    segment([head[0], head[1] - 0.08, head[2]], [head[0] - 0.08, 2.79 + lift, head[2]], '#FBE3AC', 2.5);
    box([-2.75, 2.78, -1.7], [0.54, 0.41, 0.54], [gold, brass, '#775834']);
    segment([-2.75, 2.95, -1.7], [-2.75, 3.52, -1.7], '#C79A5F', 15);
    segment([-2.75, 3.52, -1.7], hornStart.toArray(), gold, 15);
    horn(t, energy);

    for (let i = 0; i < 19 && energy > 0; i++) {
      const travel = (i / 19 + t * 0.57) % 1;
      const start = hornEnd.clone();
      start.x += travel * 3.55;
      start.y += 0.1 + travel * 1.25 + Math.sin(travel * 14 - t * 5) * 0.31;
      start.z += travel * 0.67;
      const side = (0.11 + (i % 3) * 0.045) * Math.sin(Math.PI * travel) * energy;
      box(start.toArray(), [side, side, side], [gold, '#D0955F', '#A7754B'], 0.55);
    }
  }

  function workbench(id: VinylSceneId, progress: number, t: number) {
    box([0, 0.12, 0], [7.1, 0.24, 4.6], ['#C7B28D', '#957E5C', '#7F6A4F']);
    if (id === 'prensa') {
      const squeeze = ease(0.21, 0.47, progress);
      const open = ease(0.68, 0.83, progress);
      const lid = 3.55 - squeeze * 2.23 + open * 2.11;
      box([-2.2, 1.99, -0.97], [0.5, 3.7, 0.52], ['#8E9BA1', slate, '#38454F']);
      box([2.2, 1.99, -0.97], [0.5, 3.7, 0.52], ['#8E9BA1', slate, '#38454F']);
      box([0, 3.75, -0.5], [4.98, 0.43, 1.33], ['#87949D', slate, '#36434D']);
      segment([0, 3.62, 0], [0, lid, 0], nickel, 11);
      plate([0, 0.88, 0.4], 1.82, nickel, slate);
      plate([0, lid, 0.4], 1.82, nickel, slate);
      const radius = mix(0.65, 1.68, squeeze);
      box([0, 0.9 + mix(0.29, 0.08, squeeze), 0.45], [radius * 1.66, mix(0.54, 0.14, squeeze), radius * 1.35],
        [squeeze > 0.8 ? '#29292A' : '#CC8250', '#553D32', '#50362B']);
      for (let i = 0; i < 11; i++) {
        const cloud = ease(0.39 + i * 0.009, 0.53 + i * 0.009, progress);
        const amount = cloud * (1 - ease(0.58, 0.8, progress));
        if (!amount) continue;
        const x = (i - 5) * 0.34 * cloud;
        box([x, 1.1 + cloud * 1.07, 0.77 + Math.sin(i * 3) * 0.45], [amount * 0.25, amount * 0.23, amount * 0.22],
          ['#F4E7CE', '#DBD7C7', '#BFC0AE'], 0.4);
      }
      return;
    }

    if (id === 'galvanoplastia') {
      const separate = ease(0.27, 0.77, progress);
      box([0, 0.59, 0], [4.85, 0.72, 3.43], ['#788F90', '#617677', '#4B5A60']);
      plate([0, 0.97, 0], 1.49, '#665347', '#42372E');
      for (let i = 0; i < 3; i++) {
        const drop = ease(0.09 + i * 0.22, 0.35 + i * 0.19, progress);
        if (!drop) continue;
        plate([(i - 1) * 1.43 * separate, 1.29 + separate * (i + 1) * 0.59, 0], 1.5,
          i % 2 ? '#D9BF95' : nickel, slate, t * 0.8);
      }
      return;
    }

    if (id === 'ecualizacion') {
      box([-1.52, 0.72, 0], [2.43, 0.77, 2.44], [nickel, slate, '#333E47']);
      box([1.55, 1.58, 0], [2.29, 2.55, 1.41], [wood, '#8F7657', '#63513D']);
      for (let i = 0; i < 3; i++) {
        const side = 1.45 - i * 0.34 + Math.sin(t * 16) * 0.038;
        box([1.55, 1.47, 0.745 + i * 0.055], [side, side, 0.095], [gold, i === 2 ? brass : slate, charcoal]);
      }
      segment([-0.41, 1.04, 0], [0.42, 1.04, 0], charcoal, 4);
      for (let i = 0; i < 15; i++) {
        const u = (t * 0.75 + i / 15) % 1;
        const x = mix(-2.7, 3.6, u);
        const y = 2.5 + Math.sin(u * 27 - t * 5) * mix(0.12, 0.48, ease(0.34, 0.76, progress));
        box([x, y, 0.8], [0.15, 0.15, 0.15], [gold, brass, '#927247'], 0.6);
      }
      return;
    }

    const rotation = t * TAU / 1.8;
    plate([0, 0.5, 0.5], 2.31, slate, '#324148');
    plate([0, 0.68, 0.5], 2.15, '#846249', '#453E38', rotation);
    box([2.45, 1.15, -1], [0.42, 1.92, 0.42], [nickel, slate, '#36434B']);
    const engraving = ease(0.12, 0.53, progress);
    const cutX = mix(1.57, 0.52, engraving);
    segment([2.45, 2.15, -1], [cutX, 1.96, 0.71], nickel, 9);
    box([cutX, 1.55, 0.71], [0.71, 0.63, 0.63], ['#D2B788', '#B2865E', '#8F6947']);
    segment([cutX, 1.24, 0.71], [cutX, mix(0.88, 0.67, engraving), 0.71], gold, 5);
    const winding = ease(0.15, 0.7, progress);
    for (let i = 0; i < 34; i++) {
      const u = i / 33;
      const angle = u * TAU * 2 + rotation;
      const radius = mix(2.05, 0.65, u);
      const p = ease(0, 0.87, winding - u * 0.07);
      const x = mix(mix(-3.04, 2.61, u), Math.cos(angle) * radius, p);
      const y = mix(2.34 + Math.sin(u * 37 - t * 7) * 0.28, 0.75, p) + Math.sin(p * Math.PI) * 0.36;
      const z = mix(0.3, 0.5 + Math.sin(angle) * radius, p);
      box([x, y, z], [0.13, 0.13, 0.13], [gold, '#CE9061', brass], 0.45);
    }
  }

  function macro(t: number, progress: number, stereo: boolean, opacity: number) {
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#37383C';
    ctx.fillRect(0, 0, width, height);
    const step = width / 37;
    const phase = t * (stereo ? 1.95 : 2.7);
    const density = stereo ? mix(1, 2.9, ease(0.18, 0.42, progress)) : 0.94;
    const offset = width * (stereo ? 0.012 : 0.029);
    for (let index = 0; index < 37; index++) {
      const x = index * step;
      const y = height * 0.5 + Math.sin(index * 0.20 * density - phase) * offset
        + Math.sin(index * 0.1 - phase * 0.39) * height * 0.074;
      const breadth = height * 0.147;
      const left = stereo && progress > 0.49 && progress < 0.78 ? '#D0AD6F' : '#70665D';
      const right = stereo && progress >= 0.78 ? '#8EA4A5' : '#54565A';
      const layer = index % 4;
      polygon([[x, y - breadth - 28 - layer * 4, 0], [x + step + 0.5, y - breadth - 28 - layer * 4, 0],
        [x + step + 0.5, y - breadth, 0], [x, y - breadth, 0]], '#626065', 0.65);
      polygon([[x, y - breadth, 0], [x + step + 0.5, y - breadth, 0],
        [x + step + 0.5, y - 7, 0], [x, y - 7, 0]], left, 0.65);
      polygon([[x, y - 7, 0], [x + step + 0.5, y - 7, 0], [x + step + 0.5, y + 9, 0], [x, y + 9, 0]], charcoal);
      polygon([[x, y + 9, 0], [x + step + 0.5, y + 9, 0],
        [x + step + 0.5, y + breadth, 0], [x, y + breadth, 0]], right, 0.65);
      polygon([[x, y + breadth, 0], [x + step + 0.5, y + breadth, 0],
        [x + step + 0.5, y + breadth + 28 + layer * 4, 0], [x, y + breadth + 28 + layer * 4, 0]], '#77767A', 0.65);
    }
    ctx.globalAlpha = 1;
  }

  function draw(id: VinylSceneId, progress: number, time: number) {
    items.length = 0;
    ctx.clearRect(0, 0, width, height);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const light = ctx.createRadialGradient(width * 0.49, height * 0.36, width * 0.01, width * 0.48, height * 0.42, width * 0.55);
    light.addColorStop(0, '#E6DCB6');
    light.addColorStop(1, '#C9D2BE');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, width, height);
    const player = id === 'apertura' || id === 'aguja' || id === 'bucle';
    const finalMacro = id === 'bucle' ? ease(0.65, 1, progress) : 0;
    const firstMacro = id === 'apertura' ? 1 - ease(0.09, 0.47, progress) : 0;
    const zoom = player ? ease(0.13, 0.62, progress) * (id === 'aguja' ? 1 : 0.24) : 0;
    camera.position.set(8.1 - 1.8 * Math.sin(time * 0.48), 7.5 + Math.cos(time * 0.6) * 0.57, (player ? 15.25 : 13.3) - zoom * 1.8);
    camera.lookAt(0, player ? 2.3 + zoom * 0.38 : 1.62, 0);
    camera.updateMatrixWorld();

    if (id !== 'estereo') {
      const origin = point([0, 0, 0.35]);
      ctx.fillStyle = 'rgba(40,36,27,.13)';
      ctx.beginPath();
      ctx.ellipse(origin[0], origin[1], width * 0.365, height * 0.065, -0.035, 0, TAU);
      ctx.fill();
      if (player) {
        const lift = id === 'aguja' ? 1 - ease(0, 0.29, progress) : 0.13;
        const pulse = 0.8 + 0.2 * Math.sin(time * 8);
        const energy = id === 'bucle' ? (1 - finalMacro) * pulse : ease(0.57, 0.83, progress) * pulse * (id === 'apertura' ? 0.6 : 0);
        gramophone(time, lift * 0.75, energy);
      } else {
        workbench(id, progress, time);
      }
      items.sort((a, b) => b.depth - a.depth).forEach((item) => item.draw());
    }
    if (id === 'estereo') macro(time, progress, true, 1);
    else if (firstMacro > 0) macro(time, 0, false, firstMacro);
    else if (finalMacro > 0) macro(time * (1 - finalMacro), 0, false, finalMacro);

    if (paperPattern) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = paperPattern;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  return {draw};
}
