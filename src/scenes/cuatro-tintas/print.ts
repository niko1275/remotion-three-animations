import {MathUtils, Mesh, PlaneGeometry, ShaderMaterial, Vector3, type Texture} from 'three';
import {createVinylStage} from '../vinilo-apertura/render';
import {bench, workRoom} from '../vinilo-produccion/sets';
import {buildInkjetPrinter} from './printer';

export const printOpeningFrames = 360;
export const printLoopFrames = 504;
const photoWidth = 2.24;
const photoHeight = 2.8;
const ease = (progress: number, start: number, end: number) => MathUtils.smoothstep(progress, start, end);

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
      const vec2 lines = vec2(142.0, 177.5);

      // A display simulation of CMYK separation with partial gray replacement.
      vec4 density(vec3 rgb) {
        float black = 0.84 * (1.0 - max(rgb.r, max(rgb.g, rgb.b)));
        vec3 ink = (1.0 - rgb - black) / (1.0 - black);
        return vec4(clamp(ink, 0.0, 1.0), black);
      }

      // A repeatable raster of potential drop positions for each ink channel.
      float dotMask(vec2 point, vec2 offset, int channel) {
        vec2 grid = point + offset;
        vec2 cell = floor(grid);
        vec2 center = cell + 0.5;
        vec2 sampleUV = (center - offset) / lines + 0.5;
        float cover = density(texture2D(portrait, sampleUV).rgb)[channel];
        float threshold = fract(sin(dot(cell, vec2(12.9898, 78.233)) + float(channel) * 37.71) * 43758.5453);
        float radius = mix(0.36, 0.58, cover);
        float edge = max(0.002, 0.64 * length(fwidth(grid)));
        return step(threshold, cover) * (1.0 - smoothstep(radius - edge, radius + edge, length(grid - center)));
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
  bench(room, stage.materials, 0, 0.11, 6.05, 4.04);

  const {printer, photo, pose} = buildInkjetPrinter(room, stage.materials);
  block(photo, [photoWidth + 0.13, photoHeight + 0.14, 0.018], [0, 0, 0], '#E6DBBA', 0.008, false);
  const sheet = printedPhoto(portrait);
  sheet.position.z = 0.010;
  photo.add(sheet);

  const machine = printer.localToWorld(new Vector3(0, 0.86, 0.96));
  const mechanism = printer.localToWorld(new Vector3(0.02, 0.95, -0.17));
  const eye = new Vector3();
  const center = new Vector3();
  const focus = new Vector3();
  const macroDistance = 0.92;
  const macroElevation = 1.26;
  const openDistance = 13.1;
  const openElevation = 0.74;
  const openYaw = 0.18;

  function paperFocus(scan: number) {
    photo.localToWorld(eye.set(-0.176 + 0.028 * scan, 0.43 - 0.016 * scan, sheet.position.z));
    photo.localToWorld(center.set(0, 0, sheet.position.z));
  }

  function shoot(t: number, distance: number, yaw: number, elevation: number) {
    camera.position.set(Math.sin(yaw) * Math.cos(elevation), Math.sin(elevation), Math.cos(yaw) * Math.cos(elevation));
    camera.position.multiplyScalar(distance).add(focus);
    camera.near = 0.015;
    const wider = distance > 6;
    stage.render(t, focus, 1.08, {beam: wider, dust: wider}, true);
  }

  function opening(frame: number, fps: number) {
    const p = frame / (printOpeningFrames - 1);
    const cover = ease(p, 0.57, 0.86);
    const reveal = ease(p, 0.045, 0.66);
    const inside = ease(p, 0.64, 0.93);
    pose(ease(p, 0.23, 0.53), cover);
    paperFocus(1 - ease(p, 0, 0.19));
    focus.copy(eye).lerp(center, ease(p, 0.16, 0.39)).lerp(machine, ease(p, 0.36, 0.65)).lerp(mechanism, inside);
    const wide = macroDistance * Math.pow(16.1 / macroDistance, reveal);
    const distance = MathUtils.lerp(wide, openDistance, inside);
    shoot(frame / fps, distance, openYaw * reveal, MathUtils.lerp(macroElevation, openElevation, reveal));
  }

  function draw(frame: number, fps: number) {
    if (frame < printOpeningFrames || frame === printLoopFrames - 1) {
      opening(frame < printOpeningFrames ? frame : 0, fps);
      return;
    }

    // Move from the exposed mechanism to the same eye once the paper has cleared.
    const p = (frame - printOpeningFrames + 1) / (printLoopFrames - printOpeningFrames);
    const approach = ease(p, 0.16, 1);
    pose(1 - ease(p, 0.84, 1), 1 - ease(p, 0.83, 1));
    paperFocus(ease(p, 0.72, 1));
    focus.copy(mechanism).lerp(center, ease(p, 0.015, 0.47)).lerp(eye, ease(p, 0.40, 1));
    const distance = openDistance * Math.pow(macroDistance / openDistance, approach);
    shoot(frame / fps, distance, openYaw * (1 - approach), MathUtils.lerp(openElevation, macroElevation, approach));
  }

  return {draw, dispose: stage.dispose};
}
