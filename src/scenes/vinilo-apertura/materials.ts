import {
  BackSide, BufferGeometry, Color, DataTexture, Mesh, MeshToonMaterial, NearestFilter,
  Object3D, RedFormat, ShaderMaterial, Vector2, Vector3,
} from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export type Position = [number, number, number];
export const palette = {
  wall: '#C9D2BE',
  wood: '#B9A27E',
  slate: '#4A5560',
  warm: '#F4D58A',
  ink: '#1B1714',
  vinyl: '#141414',
  copper: '#AD7459',
  nickel: '#AEB8B6',
};

export function buildMaterials() {
  const gradient = new DataTexture(new Uint8Array([71, 148, 255]), 3, 1, RedFormat);
  gradient.minFilter = NearestFilter;
  gradient.magFilter = NearestFilter;
  gradient.needsUpdate = true;
  const materials = new Map<string, MeshToonMaterial>();
  const outline = new ShaderMaterial({
    side: BackSide,
    vertexShader: `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * 0.012, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 ink;
      void main() {
        gl_FragColor = vec4(ink, 1.0);
        #include <colorspace_fragment>
      }`,
    uniforms: {ink: {value: new Color(palette.ink)}},
  });

  const toon = (color: string) => {
    const cached = materials.get(color);
    if (cached) return cached;
    const material = new MeshToonMaterial({color, gradientMap: gradient});
    materials.set(color, material);
    return material;
  };

  function model(parent: Object3D, geometry: BufferGeometry, color: string, position: Position, ink = false) {
    const mesh = new Mesh(geometry, toon(color));
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    if (ink) mesh.add(new Mesh(geometry, outline));
    return mesh;
  }

  function block(parent: Object3D, size: Position, position: Position, color: string, bevel = 0.035, ink = true) {
    return model(parent, new RoundedBoxGeometry(...size, 1, bevel), color, position, ink);
  }

  const contact = new ShaderMaterial({
    uniforms: {maxOpacity: {value: 0.24}, span: {value: new Vector2(1, 1)}},
    transparent: true,
    depthWrite: false,
    vertexShader: `
      varying vec2 pointUv;
      void main() {
        pointUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec2 pointUv;
      uniform float maxOpacity;
      uniform vec2 span;
      void main() {
        vec2 toEdge = abs(pointUv - 0.5) * span - (span * 0.5 - 0.22);
        float shade = 1.0 - smoothstep(0.0, 0.22, length(max(toEdge, 0.0)));
        gl_FragColor = vec4(0.05, 0.04, 0.03, shade * maxOpacity);
      }`,
  });

  function dispose() {
    gradient.dispose();
    outline.dispose();
    contact.dispose();
    materials.forEach((m) => m.dispose());
  }

  return {block, model, toon, contact, dispose};
}

export type VinylMaterials = ReturnType<typeof buildMaterials>;

export function vector(point: Position) {
  return new Vector3(...point);
}
