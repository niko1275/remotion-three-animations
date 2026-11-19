import * as THREE from "three";

type Voxel = {x: number; y: number; z: number; c: string; k?: number};
type PhotoVoxel = Voxel & {rz: number; photo: number; k: number};

export const FPS = 30;
export const TOTAL = 360;
// ---------- utilidades estilo Remotion ----------
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function spring(
  frame: number,
  { damping = 10, stiffness = 100, mass = 1 } = {},
) {
  if (frame <= 0) return 0;
  const t = frame / FPS,
    w0 = Math.sqrt(stiffness / mass),
    z = damping / (2 * Math.sqrt(stiffness * mass));
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return (
      1 -
      Math.exp(-z * w0 * t) *
        (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t))
    );
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function interp(f: number, inp: number[], out: number[], ease = easeInOut) {
  if (f <= inp[0]) return out[0];
  for (let i = 0; i < inp.length - 1; i++)
    if (f <= inp[i + 1]) {
      const t = (f - inp[i]) / (inp[i + 1] - inp[i]);
      return out[i] + (out[i + 1] - out[i]) * ease(t);
    }
  return out[out.length - 1];
}

// The original Three.js scene used hex channels directly as linear values.
const voxelColor = (hex: string) =>
  new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace);

export function createScene(canvas: HTMLCanvasElement, width: number, height: number) {
  const rnd = mulberry32(11);
  // ---------- modelo: 6 polaroids ----------
  const PALETTES = [
    {
      sky: "#ff9e5e",
      sky2: "#ffc27a",
      ground: "#3d6fa8",
      acc: "#fff1a8",
      kind: "sun",
    }, // atardecer en el mar
    {
      sky: "#8fd3ff",
      sky2: "#b9e6ff",
      ground: "#5aa65a",
      acc: "#7b5a46",
      kind: "tree",
    }, // árbol
    {
      sky: "#2b2f5e",
      sky2: "#3c3f7a",
      ground: "#1c1d33",
      acc: "#ffe66b",
      kind: "city",
    }, // ciudad de noche
    {
      sky: "#c9b6ff",
      sky2: "#e0d4ff",
      ground: "#8a7bd1",
      acc: "#ffffff",
      kind: "mount",
    }, // montaña
    {
      sky: "#ffd4e0",
      sky2: "#ffe6ee",
      ground: "#6dbb76",
      acc: "#ff5c8a",
      kind: "flower",
    }, // flor
    {
      sky: "#7fd1c7",
      sky2: "#a8e3db",
      ground: "#e9c98f",
      acc: "#ff7a45",
      kind: "sun",
    }, // playa
  ];
  function photoPixel(p: number, u: number, v: number) {
    // u: 1..5, v: 2..6 (área de imagen)
    const P = PALETTES[p];
    const iu = u - 1,
      iv = v - 2;
    let c = iv <= 1 ? P.ground : iv === 4 ? P.sky2 : P.sky;
    if (
      P.kind === "sun" &&
      ((iu === 3 && iv === 3) ||
        (iu === 3 && iv === 4) ||
        (iu === 4 && iv === 3))
    )
      c = P.acc;
    if (
      P.kind === "tree" &&
      ((iu === 1 && iv === 2) ||
        (iu >= 0 && iu <= 2 && iv === 3) ||
        (iu === 1 && iv === 4))
    )
      c = iv === 2 ? P.acc : "#2f8a45";
    if (
      P.kind === "city" &&
      ((iv === 2 && iu !== 2) || (iv === 3 && (iu === 1 || iu === 3)))
    )
      c = (iu + iv) % 2 ? P.acc : "#4a4d80";
    if (
      P.kind === "mount" &&
      (iv === 2 || (iv === 3 && iu >= 1 && iu <= 3) || (iv === 4 && iu === 2))
    )
      c = iv === 4 ? P.acc : P.ground;
    if (
      P.kind === "flower" &&
      ((iu === 2 && iv === 2) ||
        (iu === 2 && iv === 4) ||
        (iu === 1 && iv === 3) ||
        (iu === 3 && iv === 3))
    )
      c = iv === 2 ? "#2f8a45" : P.acc;
    if (P.kind === "flower" && iu === 2 && iv === 3) c = "#ffd34d";
    return c;
  }
  const photos: PhotoVoxel[] = [];
  const cols = [-4.5, 4.5],
    rows = [4.5, 13.5, 22.5];
  let pi = 0;
  for (const ry of rows)
    for (const cx of cols) {
      const ang = (rnd() - 0.5) * 0.22,
        zoff = (rnd() - 0.5) * 0.8,
        p = pi % PALETTES.length;
      for (let u = 0; u <= 6; u++)
        for (let v = 0; v <= 7; v++) {
          const frame = u === 0 || u === 6 || v <= 1 || v === 7;
          const c = frame
            ? v <= 1 && rnd() < 0.15
              ? "#ece6da"
              : "#f7f4ec"
            : photoPixel(p, u, v);
          const lx = u - 3,
            ly = v - 3.5;
          photos.push({
            x: cx + lx * Math.cos(ang) - ly * Math.sin(ang),
            y: ry + lx * Math.sin(ang) + ly * Math.cos(ang),
            z: zoff,
            rz: ang,
            c,
            photo: pi,
            k: 0,
          });
        }
      pi++;
    }

  // ---------- modelo: taxi londinense ----------
  const tmap = new Map<string, Voxel>();
  const glowItems: Voxel[] = [];
  const put = (x: number, y: number, z: number, c: string) => tmap.set(x + "," + y + "," + z, { x, y, z, c, k: 0 });
  const BLACK = ["#17171d", "#1f1f27", "#25252e"];
  const blk = () => BLACK[Math.floor(rnd() * 3)];
  for (let x = -7; x <= 7; x++)
    for (let y = 1; y <= 3; y++)
      for (let z = -3; z <= 3; z++) put(x, y, z, blk());
  for (let x = -6; x <= 3; x++)
    for (let y = 4; y <= 6; y++)
      for (let z = -3; z <= 3; z++) put(x, y, z, blk());
  for (let x = -6; x <= 3; x++)
    for (let z = -2; z <= 2; z++) put(x, 7, z, blk());
  // ventanas
  for (let x = -5; x <= 2; x++)
    for (let y = 5; y <= 6; y++)
      for (const z of [-3, 3])
        if (x !== -1) put(x, y, z, y === 6 ? "#a9d6f0" : "#8ec5e8");
  for (let y = 5; y <= 6; y++)
    for (let z = -2; z <= 2; z++) {
      put(3, y, z, "#9fd0ee");
      put(-6, y, z, "#8ec5e8");
    }
  // parachoques, parrilla, luces traseras
  for (let z = -3; z <= 3; z++) {
    put(7, 1, z, "#cfd2dc");
    put(-7, 1, z, "#cfd2dc");
  }
  for (let y = 2; y <= 3; y++)
    for (let z = -1; z <= 1; z++)
      put(7, y, z, (y + z) % 2 ? "#b9bcc8" : "#dfe2ea");
  for (const z of [-3, 3])
    for (let y = 2; y <= 3; y++) put(-7, y, z, "#ff3b3b");
  // ruedas
  for (const wx of [-5, 4])
    for (const wz of [-4, 4])
      for (let dx = 0; dx < 2; dx++)
        for (let dy = 0; dy < 2; dy++)
          put(wx + dx, dy, wz, dx === 1 && dy === 1 ? "#9a9aa6" : "#0e0e12");
  // elementos que brillan (aparecen al final)
  for (const z of [-2, 2]) glowItems.push({ x: 7, y: 2, z, c: "#fff4c2" });
  for (let x = -1; x <= 0; x++)
    for (let z = -1; z <= 1; z++) glowItems.push({ x, y: 8, z, c: "#ffcf33" });

  const tsolid = (k: string) => tmap.has(k);
  const taxi = [...tmap.values()].filter((v) => {
    const { x, y, z } = v;
    return [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ].some(([a, b, c]) => !tsolid(x + a + "," + (y + b) + "," + (z + c)));
  });

  // ---------- emparejar cubos de fotos con cubos del taxi ----------
  photos.forEach((p) => (p.k = p.y + rnd() * 0.8));
  taxi.forEach((t) => (t.k = t.y + rnd() * 0.8));
  photos.sort((a, b) => (a.k ?? 0) - (b.k ?? 0));
  taxi.sort((a, b) => (a.k ?? 0) - (b.k ?? 0));
  // los cubos del taxi que sobran (los de arriba: techo) aparecen con un pop al final
  const P = photos.length,
    Tn = taxi.length;
  const morph: Array<{
    s: PhotoVoxel | undefined;
    e: Voxel | undefined;
    r1: number;
    axis: THREE.Vector3;
    cs: THREE.Color;
    ce: THREE.Color;
    ctrl: THREE.Vector3;
  }> = [];
  const tmpV = new THREE.Vector3();
  for (let i = 0; i < Math.max(P, Tn); i++) {
    const s = i < P ? photos[i] : undefined,
      e = i < Tn ? taxi[i] : undefined;
    const r1 = rnd();
    rnd(); // Keep the random sequence from the original scene.
    const m = {
      ctrl: new THREE.Vector3(),
      s,
      e,
      r1,
      axis: new THREE.Vector3(
        rnd() - 0.5,
        rnd() - 0.5,
        rnd() - 0.5,
      ).normalize(),
      cs: voxelColor(s ? s.c : "#000"),
      ce: voxelColor(e ? e.c : "#000"),
    };
    if (s && e) {
      const mid = new THREE.Vector3(
        (s.x + e.x) / 2,
        (s.y + e.y) / 2,
        (s.z + e.z) / 2,
      );
      tmpV
        .set(rnd() - 0.5, rnd() * 0.6, rnd() - 0.5)
        .normalize()
        .multiplyScalar(9 + rnd() * 10);
      m.ctrl = mid.add(tmpV);
    }
    morph.push(m);
  }

  // ---------- Three.js ----------
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(voxelColor("#e7c6cf"), 45, 95);
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 300);

  const sky = new THREE.HemisphereLight(voxelColor("#fff3e6"), voxelColor("#6b5a8e"), 0.85 * Math.PI);
  scene.add(sky);
  const sun = new THREE.DirectionalLight(0xffffff, 1.1 * Math.PI);
  sun.position.set(14, 26, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -25,
    right: 25,
    top: 25,
    bottom: -25,
    near: 1,
    far: 90,
  });
  sun.shadow.bias = -0.0008;
  scene.add(sun);

  const world = new THREE.Group();
  scene.add(world);
  const geo = new THREE.BoxGeometry(0.94, 0.94, 0.94);
  const col = new THREE.Color();

  const mMat = new THREE.MeshStandardMaterial({ roughness: 0.6 });
  const mMesh = new THREE.InstancedMesh(geo, mMat, morph.length);
  mMesh.castShadow = true;
  mMesh.receiveShadow = true;
  morph.forEach((m, i) => mMesh.setColorAt(i, m.cs));

  const gMat = new THREE.MeshStandardMaterial({
    roughness: 0.4,
    emissive: voxelColor("#ffcf33"),
    emissiveIntensity: 0.9,
  });
  const gMesh = new THREE.InstancedMesh(geo, gMat, glowItems.length);
  glowItems.forEach((g, i) => gMesh.setColorAt(i, col.setStyle(g.c, THREE.LinearSRGBColorSpace)));

  // Carretera
  const road: Array<{x: number; z: number; c: string; r: number}> = [];
  for (let x = -40; x < 40; x++)
    for (let z = -7; z <= 7; z++) {
      let c = (x + z) % 3 === 0 ? "#3a3a44" : "#34343d";
      if (Math.abs(z) === 7) c = "#d6cfc0";
      if (z === 0 && ((x % 6) + 6) % 6 < 3) c = "#f4f1e8";
      road.push({ x, z, c, r: rnd() });
    }
  const rMat = new THREE.MeshStandardMaterial({ roughness: 0.9 });
  const rMesh = new THREE.InstancedMesh(geo, rMat, road.length);
  rMesh.receiveShadow = true;
  road.forEach((r, i) => rMesh.setColorAt(i, col.setStyle(r.c, THREE.LinearSRGBColorSpace)));

  // Líneas de velocidad
  const streaks = [...Array(16)].map(() => ({
    y: 1 + rnd() * 9,
    z: (rnd() - 0.5) * 20,
    off: rnd() * 60,
    sp: 1.2 + rnd() * 0.8,
  }));
  const sMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.75,
  });
  const sMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 0.12, 0.12),
    sMat,
    streaks.length,
  );

  const taxiGroup = new THREE.Group();
  for (const mesh of [mMesh, gMesh, rMesh, sMesh]) mesh.frustumCulled = false;
  taxiGroup.add(mMesh, gMesh);
  world.add(taxiGroup, rMesh, sMesh);

  const dummy = new THREE.Object3D(),
    q = new THREE.Quaternion(),
    qz = new THREE.Quaternion(),
    Z = new THREE.Vector3(0, 0, 1);
  const cTmp = new THREE.Color();

  // ---------- render de un frame ----------
  function renderFrame(f: number) {
    // A) Fotos entran (0–40), tiemblan (70–100), y se transforman en taxi (100–220)
    for (let i = 0; i < morph.length; i++) {
      const m = morph[i],
        s0 = m.s,
        e = m.e;
      if (s0 && e) {
        const inS = spring(f - (s0.photo * 5 + m.r1 * 4), {
          damping: 12,
          stiffness: 150,
          mass: 0.7,
        }); // entrada de la foto
        const shake =
          f > 68 && f < 104
            ? Math.sin(f * 2.3 + i) * 0.12 * clamp((f - 68) / 20, 0, 1)
            : 0; // anticipación
        const s = spring(f - (100 + m.r1 * 28 + (s0.photo % 2) * 6), {
          damping: 14,
          stiffness: 55,
          mass: 1,
        });
        const p = s,
          ip = 1 - p;
        // Curva de Bézier: inicio → punto de control disperso → posición en el taxi
        const x = ip * ip * s0.x + 2 * ip * p * m.ctrl.x + p * p * e.x;
        const y =
          ip * ip * (s0.y + (1 - inS) * 14) +
          2 * ip * p * m.ctrl.y +
          p * p * e.y;
        const z = ip * ip * s0.z + 2 * ip * p * m.ctrl.z + p * p * e.z;
        dummy.position.set(x + shake, y + shake * 0.6, z);
        const spin = Math.sin(Math.PI * clamp(p, 0, 1)) * 5;
        qz.setFromAxisAngle(Z, s0.rz * ip);
        dummy.quaternion.copy(q.setFromAxisAngle(m.axis, spin).multiply(qz));
        const pulse = 1 + Math.sin(Math.PI * clamp(p, 0, 1)) * -0.35; // los cubos se achican en vuelo
        dummy.scale.setScalar(Math.max(0.0001, Math.min(1, inS * 1.4)) * pulse);
        mMesh.setColorAt(
          i,
          cTmp.copy(m.cs).lerp(m.ce, clamp((p - 0.35) / 0.4, 0, 1)),
        );
      } else if (e) {
        // cubos extra del taxi (techo): pop al final
        const s = spring(f - (200 + (e.y - 5) * 5 + m.r1 * 12), {
          damping: 9,
          stiffness: 170,
          mass: 0.6,
        });
        dummy.position.set(e.x, e.y + (1 - Math.min(1, s)) * 3, e.z);
        dummy.quaternion.identity();
        dummy.scale.setScalar(Math.max(0.0001, s));
        mMesh.setColorAt(i, m.ce);
      } else if (s0) {
        // cubos de foto que sobran: vuelan y desaparecen
        const s = spring(f - (100 + m.r1 * 28), { damping: 14, stiffness: 55 });
        dummy.position.set(
          s0.x + m.axis.x * s * 14,
          s0.y + m.axis.y * s * 14,
          s0.z + m.axis.z * s * 14,
        );
        dummy.quaternion.setFromAxisAngle(m.axis, s * 6);
        dummy.scale.setScalar(Math.max(0.0001, 1 - clamp(s, 0, 1)));
        mMesh.setColorAt(i, m.cs);
      }
      dummy.updateMatrix();
      mMesh.setMatrixAt(i, dummy.matrix);
    }
    mMesh.instanceMatrix.needsUpdate = true;
    if (mMesh.instanceColor) mMesh.instanceColor.needsUpdate = true;

    // B) Luces y letrero TAXI se encienden
    glowItems.forEach((g, i) => {
      const s = spring(f - (228 + i * 3), {
        damping: 8,
        stiffness: 200,
        mass: 0.5,
      });
      dummy.position.set(g.x, g.y, g.z);
      dummy.quaternion.identity();
      dummy.scale.setScalar(Math.max(0.0001, s));
      dummy.updateMatrix();
      gMesh.setMatrixAt(i, dummy.matrix);
    });
    gMesh.instanceMatrix.needsUpdate = true;
    gMat.emissiveIntensity = interp(f, [228, 250], [0, 1.1]);

    // C) Calle aparece y empieza a correr
    const travel = f < 250 ? 0 : (f - 250) * (f - 250) * 0.004 + 0; // acelera
    const speed = Math.min(travel, 9999);
    road.forEach((r, i) => {
      const s = spring(f - (208 + Math.abs(r.x) * 0.6 + r.r * 6), {
        damping: 12,
        stiffness: 150,
      });
      const xx = ((((r.x - speed) % 80) + 80) % 80) - 40;
      dummy.position.set(xx, -1, r.z);
      dummy.quaternion.identity();
      dummy.scale.setScalar(Math.max(0.0001, Math.min(1, s)));
      dummy.updateMatrix();
      rMesh.setMatrixAt(i, dummy.matrix);
    });
    rMesh.instanceMatrix.needsUpdate = true;

    // D) Taxi en marcha: vibración y leve inclinación al acelerar
    const driving = clamp((f - 250) / 30, 0, 1);
    taxiGroup.position.y = Math.abs(Math.sin(f * 0.55)) * 0.12 * driving;
    taxiGroup.rotation.z =
      0.035 * driving * Math.exp(-Math.max(0, f - 265) / 25);

    // E) Líneas de velocidad
    streaks.forEach((st, i) => {
      const vis = clamp((f - 262) / 10, 0, 1);
      const x = 40 - (((f - 262) * st.sp * 1.6 + st.off) % 80);
      dummy.position.set(x, st.y, st.z);
      dummy.quaternion.identity();
      dummy.scale.set(4 * vis + 0.0001, 1, 1);
      dummy.updateMatrix();
      sMesh.setMatrixAt(i, dummy.matrix);
    });
    sMesh.instanceMatrix.needsUpdate = true;
    sMat.opacity = 0.7 * clamp((f - 262) / 10, 0, 1);

    // Cámara: frontal a la galería → 3/4 del taxi → leve órbita
    const yaw = interp(
      f,
      [0, 95, 215, 360],
      [Math.PI / 2, Math.PI / 2, Math.PI / 2 - 0.95, Math.PI / 2 - 1.25],
    );
    const pitch = interp(f, [0, 95, 215, 360], [0.04, 0.06, 0.38, 0.3]);
    const R = interp(f, [0, 95, 215, 360], [47, 49, 43, 42]);
    const ty = interp(f, [0, 95, 215], [9, 9, 0.5]);
    camera.position.set(
      Math.cos(yaw) * Math.cos(pitch) * R,
      ty + Math.sin(pitch) * R,
      Math.sin(yaw) * Math.cos(pitch) * R,
    );
    camera.lookAt(0, ty, 0);

    renderer.render(scene, camera);
  }

  function dispose() {
    geo.dispose();
    sMesh.geometry.dispose();
    for (const material of [mMat, gMat, rMat, sMat]) material.dispose();
    sun.shadow.map?.dispose();
    renderer.dispose();
  }

  return { renderFrame, dispose };
}
