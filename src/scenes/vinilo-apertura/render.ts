import {
  BufferGeometry, Color, DepthTexture, DirectionalLight, Float32BufferAttribute, Group, HemisphereLight,
  LinearFilter, MathUtils, Mesh, MeshBasicMaterial, OrthographicCamera, PCFShadowMap, PerspectiveCamera,
  PlaneGeometry, Points, PointsMaterial, Scene, ShaderMaterial, SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
  WebGLRenderTarget, type Material,
} from 'three';
import {buildLiving} from './living';
import {buildMaterials, palette} from './materials';
import {buildPlayer, DISC_Y, DISC_Z, groovePoint, TAU} from './vinyl';

const eased = (start: number, end: number, progress: number) => MathUtils.smoothstep(progress, start, end);

export function createVinylOpening(canvas: HTMLCanvasElement, width: number, height: number) {
  const renderer = new WebGLRenderer({canvas, antialias: true, alpha: false});
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  const materials = buildMaterials();
  const scene = new Scene();
  scene.background = new Color('#929D8B');
  const room = new Group();
  scene.add(room);
  buildLiving(room, materials);
  const disc = buildPlayer(room, materials);

  const key = new DirectionalLight(palette.warm, 2.15);
  key.position.set(-4.5, 6.5, -2.5);
  key.target.position.set(0, 1.50, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 2.5;
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.012;
  Object.assign(key.shadow.camera, {left: -6.4, right: 6.4, top: 6.4, bottom: -6.4, near: 0.25, far: 22});
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.autoUpdate = false;
  key.shadow.needsUpdate = true;
  scene.add(key, key.target);
  const fill = new DirectionalLight('#AFC3D4', 0.58);
  fill.position.set(4.5, 3.5, 3.5);
  scene.add(fill);
  const rim = new DirectionalLight('#FFE4AF', 0.85);
  rim.position.set(2, 4, -5);
  scene.add(rim);
  scene.add(new HemisphereLight('#D8E1DB', '#A29780', 0.32));

  const beamGeometry = new BufferGeometry();
  beamGeometry.setAttribute('position', new Float32BufferAttribute([
    -4.06, 5.9, -2.49,  -4.06, 4.2, -0.80,  0.62, 0.32, 1.35,
    -4.06, 5.9, -2.49,   0.62, 0.32, 1.35,  1.75, 0.26, 0.93,
  ], 3));
  beamGeometry.setAttribute('uv', new Float32BufferAttribute([0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0], 2));
  const beamMaterial = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: 2,
    uniforms: {tint: {value: new Color(palette.warm)}, strength: {value: 0.08}},
    vertexShader: `
      varying vec2 beamUv;
      void main() {
        beamUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec2 beamUv;
      uniform vec3 tint;
      uniform float strength;
      void main() {
        float fade = sin(beamUv.y * 3.14159265) * (1.0 - beamUv.x);
        gl_FragColor = vec4(tint, strength * fade);
        #include <colorspace_fragment>
      }`,
  });
  const beam = new Mesh(beamGeometry, beamMaterial);
  scene.add(beam);

  let seed = 1147;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const drift = Array.from({length: 40}, () => ({
    progress: random(),
    spread: random() - 0.5,
    lift: random() - 0.5,
    offset: random() * TAU,
  }));
  const dustPositions = new Float32BufferAttribute(new Float32Array(drift.length * 3), 3);
  const dustGeo = new BufferGeometry();
  dustGeo.setAttribute('position', dustPositions);
  const dust = new Points(dustGeo, new PointsMaterial({
    color: '#F4D58A', size: 0.023, transparent: true, depthWrite: false, opacity: 0.57,
  }));
  dust.frustumCulled = false;
  scene.add(dust);

  const camera = new PerspectiveCamera(30, width / height, 0.001, 90);
  const target = new WebGLRenderTarget(width, height, {minFilter: LinearFilter, magFilter: LinearFilter});
  target.depthTexture = new DepthTexture(width, height);
  const quadCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const post = new Scene();
  const postMaterial = new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      screen: {value: target.texture},
      depthScreen: {value: target.depthTexture},
      resolution: {value: new Vector2(width, height)},
      focusDistance: {value: 1},
      cameraNear: {value: camera.near},
      cameraFar: {value: camera.far},
      exposure: {value: 1},
    },
    vertexShader: `
      varying vec2 screenUv;
      void main() {
        screenUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }`,
    fragmentShader: `
      #include <packing>
      varying vec2 screenUv;
      uniform sampler2D screen;
      uniform sampler2D depthScreen;
      uniform vec2 resolution;
      uniform float focusDistance;
      uniform float cameraNear;
      uniform float cameraFar;
      uniform float exposure;
      void main() {
        float z = -perspectiveDepthToViewZ(texture2D(depthScreen, screenUv).r, cameraNear, cameraFar);
        float normalized = (z - focusDistance) / focusDistance;
        float maxBlur = normalized < 0.0 ? 10.0 : 5.0;
        float blur = smoothstep(0.018, 0.21, abs(normalized)) * maxBlur;
        vec2 pitch = vec2(blur) / resolution;
        vec4 rgba = texture2D(screen, screenUv) * 3.0;
        for (int n = 0; n < 12; n++) {
          float angle = float(n) * 2.399963;
          float radial = sqrt((float(n) + 0.5) / 12.0);
          rgba += texture2D(screen, screenUv + vec2(cos(angle), sin(angle)) * radial * pitch);
        }
        vec2 pixel = screenUv * resolution;
        float diagonal = pixel.x * -0.309017 + pixel.y * 0.951057;
        float line = 1.0 - smoothstep(0.0, 0.17, fract(diagonal / 19.0));
        float fleck = fract(sin(dot(floor(pixel * 0.71), vec2(12.9898, 78.233))) * 43758.5453);
        rgba /= 15.0;
        rgba.rgb *= exposure * (1.0 - 0.06 * (0.52 * line + 0.47 * fleck));
        gl_FragColor = vec4(rgba.rgb, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const quad = new Mesh(new PlaneGeometry(2, 2), postMaterial);
  quad.frustumCulled = false;
  post.add(quad);

  const cross = new Vector3();
  const center = new Vector3(0, DISC_Y, DISC_Z);
  const roomFocus = new Vector3(0.09, 2.69, -0.52);
  const focus = new Vector3();
  const behind = new Vector3();

  function draw(frame: number, durationInFrames: number, fps: number) {
    const t = frame / fps;
    const p = frame / Math.max(1, durationInFrames - 1);
    const spin = frame * TAU / 54;
    disc.rotation.y = -spin;
    drift.forEach(({progress, spread, lift, offset}, i) => {
      const u = progress + Math.sin(t * 0.38 + offset) * 0.057;
      dustPositions.setXYZ(i,
        MathUtils.lerp(-3.98, 1.10, u),
        MathUtils.lerp(5.38, 0.58, u) + lift * 0.81 + Math.cos(t * 0.61 + offset) * 0.10,
        MathUtils.lerp(-1.78, 0.95, u) + spread * 1.45);
    });
    dustPositions.needsUpdate = true;
    const reveal = eased(0.09, 0.63, p);
    const wider = eased(0.46, 0.96, p);
    beam.visible = p > 0.45;
    dust.visible = p > 0.36;
    const angle = 2.19 + 0.018 * Math.sin(t * 1.39);
    groovePoint(14 + (angle - spin) / TAU, angle, cross);
    cross.y -= 0.0044;
    focus.copy(cross).lerp(center, reveal).lerp(roomFocus, wider);
    const yaw = MathUtils.lerp(0.94, 0.40, eased(0.10, 0.79, p));
    const elevation = MathUtils.lerp(0.315, 0.68, eased(0.07, 0.51, p)) - 0.31 * wider;
    const distance = 0.075 + 6.5 * reveal * reveal + 22.5 * wider;
    behind.set(Math.sin(yaw) * Math.cos(elevation), Math.sin(elevation), Math.cos(yaw) * Math.cos(elevation));
    camera.position.copy(focus).addScaledVector(behind, distance);
    camera.near = MathUtils.lerp(0.001, 0.065, wider);
    camera.updateProjectionMatrix();
    camera.lookAt(focus);
    postMaterial.uniforms.focusDistance.value = distance;
    postMaterial.uniforms.cameraNear.value = camera.near;
    postMaterial.uniforms.exposure.value = 1 + 0.72 * (1 - eased(0.09, 0.52, p));

    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(post, quadCamera);
  }

  function dispose() {
    const geometries = new Set<BufferGeometry>();
    const collected = new Set<Material>();
    for (const world of [scene, post]) {
      world.traverse((object) => {
        if (!(object instanceof Mesh || object instanceof Points)) return;
        geometries.add(object.geometry);
        const material = object.material;
        if (Array.isArray(material)) material.forEach((item) => collected.add(item));
        else collected.add(material);
      });
    }
    geometries.forEach((g) => g.dispose());
    collected.forEach((m) => m.dispose());
    materials.dispose();
    key.shadow.map?.dispose();
    target.dispose();
    renderer.dispose();
  }

  return {draw, dispose};
}
