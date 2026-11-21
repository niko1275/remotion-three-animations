import {Group, MathUtils, Mesh, PlaneGeometry, ShaderMaterial, Vector3, type Texture} from 'three';
import {palette} from '../vinilo-apertura/materials';
import {createVinylStage} from '../vinilo-apertura/render';
import {bench, workRoom} from '../vinilo-produccion/sets';

const photoWidth = 2.4;
const photoHeight = 3;
const inkColors = ['#149CB1', '#C94079', '#E2BC4B', '#303033'];

function printedPhoto(portrait: Texture) {
  return new Mesh(new PlaneGeometry(photoWidth, photoHeight), new ShaderMaterial({
    uniforms: {portrait: {value: portrait}},
    vertexShader: `
      varying vec2 paperUV;
      void main() {
        paperUV = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D portrait;
      varying vec2 paperUV;
      const vec2 lines = vec2(112.0, 140.0);

      // A display simulation of CMYK separation with partial gray replacement.
      vec4 density(vec3 rgb) {
        float black = 0.84 * (1.0 - max(rgb.r, max(rgb.g, rgb.b)));
        vec3 ink = (1.0 - rgb - black) / (1.0 - black);
        return vec4(clamp(ink, 0.0, 1.0), black);
      }

      float dotMask(vec2 point, float angle, vec2 offset, int channel) {
        float c = cos(angle);
        float s = sin(angle);
        mat2 rotate = mat2(c, s, -s, c);
        vec2 grid = rotate * point + offset;
        vec2 center = floor(grid) + 0.5;
        vec2 sampleUV = transpose(rotate) * (center - offset) / lines + 0.5;
        float cover = density(texture2D(portrait, sampleUV).rgb)[channel];
        float radius = cover < 0.7854 ? sqrt(cover / 3.14159)
          : mix(0.5, 0.7071, (cover - 0.7854) / 0.2146);
        float edge = max(0.002, 0.72 * length(fwidth(grid)));
        return smoothstep(0.0, 0.022, cover) * (1.0 - smoothstep(radius - edge, radius + edge, length(grid - center)));
      }

      void main() {
        vec2 point = (paperUV - 0.5) * lines;
        float c = dotMask(point, 0.26180, vec2(0.11, 0.31), 0);
        float m = dotMask(point, 1.30900, vec2(0.29, 0.41), 1);
        float y = dotMask(point, 0.00000, vec2(0.46, 0.13), 2);
        float k = dotMask(point, 0.78540, vec2(0.09, 0.27), 3);

        vec3 ink = mix(vec3(1.0), vec3(0.09, 0.70, 0.84), c)
          * mix(vec3(1.0), vec3(0.88, 0.15, 0.55), m)
          * mix(vec3(1.0), vec3(0.99, 0.86, 0.11), y)
          * mix(vec3(1.0), vec3(0.09, 0.082, 0.080), k);

        // At viewing distance, approximate the average of subpixel dots to prevent moiré.
        float footprint = max(length(dFdx(point)), length(dFdy(point)));
        vec3 visibleInk = mix(ink, texture2D(portrait, paperUV).rgb, smoothstep(0.10, 0.31, footprint));
        float grain = fract(sin(dot(floor(paperUV * 1840.0), vec2(12.9898, 78.233))) * 43758.5453);
        vec3 paper = vec3(0.984, 0.955, 0.900) * mix(0.965, 1.0, grain);
        gl_FragColor = vec4(pow(visibleInk * paper, vec3(2.2)), 1.0);
        #include <colorspace_fragment>
      }
    `,
  }));
}

export function createPrintOpening(canvas: HTMLCanvasElement, width: number, height: number, portrait: Texture) {
  const stage = createVinylStage(canvas, width, height);
  const {room, materials: {block}, camera} = stage;
  workRoom(room, stage.materials, true);
  bench(room, stage.materials, 0, -0.22, 6.05, 3.08);

  const print = new Group();
  print.position.set(-0.43, 2.96, 0.64);
  print.rotation.set(-0.066, -0.09, 0);
  room.add(print);
  block(print, [2.71, 3.26, 0.106], [0, 0, 0], '#D8CBA9', 0.038);
  const sheet = printedPhoto(portrait);
  sheet.position.z = 0.057;
  print.add(sheet);
  block(room, [2.78, 0.105, 0.46], [-0.43, 1.38, 0.77], palette.wood, 0.033);

  const printer = new Group();
  printer.position.set(1.95, 1.33, -0.24);
  room.add(printer);
  block(printer, [2.03, 0.78, 1.42], [0, 0.43, 0], '#657172', 0.091);
  block(printer, [1.98, 0.25, 1.40], [0, 0.82, -0.04], '#83938E', 0.059);
  block(printer, [1.45, 0.155, 0.033], [-0.07, 0.42, 0.716], '#343D40', 0.035, false);
  block(printer, [1.41, 0.040, 0.49], [-0.07, 0.30, 0.88], palette.slate, 0.022);
  block(printer, [0.91, 0.018, 0.57], [-0.03, 0.329, 0.92], '#E8DEBD', 0.006, false);
  block(printer, [0.095, 0.048, 0.022], [0.75, 0.67, 0.703], palette.warm, 0.011, false);

  inkColors.forEach((color, index) => {
    const x = 1.37 + index * 0.36;
    block(room, [0.28, 0.37, 0.43], [x, 1.515, 1.08], '#344043', 0.04);
    block(room, [0.249, 0.10, 0.40], [x, 1.725, 1.08], color, 0.027, false);
  });

  // Follow the same piece of paper from one eye to the whole workbench.
  const eye = print.localToWorld(new Vector3(-0.189, 0.455, sheet.position.z));
  const printCenter = print.localToWorld(new Vector3(0, 0, sheet.position.z));
  const workshop = new Vector3(0.0, 2.85, -0.16);
  const focus = new Vector3();

  function draw(frame: number, duration: number, fps: number) {
    const p = frame / (duration - 1);
    const pull = MathUtils.smoothstep(p, 0.015, 0.96);
    const reveal = MathUtils.smoothstep(p, 0.43, 0.96);
    const distance = 0.98 * Math.pow(26.2 / 0.98, pull);
    const yaw = MathUtils.lerp(-0.092, 0.31, reveal);
    const elevation = MathUtils.lerp(0.016, 0.24, reveal);
    focus.copy(eye).lerp(printCenter, MathUtils.smoothstep(p, 0.20, 0.61)).lerp(workshop, reveal);
    const scan = 1 - MathUtils.smoothstep(p, 0, 0.18);
    focus.x += 0.034 * scan;
    focus.y -= 0.023 * scan;
    camera.position.set(Math.sin(yaw) * Math.cos(elevation), Math.sin(elevation), Math.cos(yaw) * Math.cos(elevation));
    camera.position.multiplyScalar(distance).add(focus);
    camera.near = 0.015;
    stage.render(frame / fps, focus, 1.08, {beam: reveal > 0.50, dust: reveal > 0.50});
  }

  return {draw, dispose: stage.dispose};
}
