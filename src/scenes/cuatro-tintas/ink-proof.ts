import {MathUtils} from 'three';

const inks = [
  {color: '#23AAC4', offset: 0.11, density: 0.80},
  {color: '#F5D840', offset: 0.57, density: 0.78},
];

export function paintInkProof(context: CanvasRenderingContext2D, image: HTMLImageElement, hill: {u: number; v: number}, p: number) {
  const {width, height} = context.canvas;
  const zoom = MathUtils.smoothstep(p, 0.51, 0.88);
  const mix = MathUtils.smoothstep(p, 0.61, 0.81);
  const spacing = width / MathUtils.lerp(15, 55, zoom);
  context.globalCompositeOperation = 'source-over';
  context.fillStyle = '#F7F4DF';
  context.fillRect(0, 0, width, height);

  context.globalCompositeOperation = 'multiply';
  inks.forEach(({color, offset, density}, index) => {
    context.fillStyle = color;
    for (let row = -1; row * spacing < height; row++) {
      for (let column = -1; column * spacing < width; column++) {
        const seed = Math.sin(column * 41.89 + row * 72.21 + index * 33.15) * 32981.145;
        const sample = seed - Math.floor(seed);
        if (sample > density) continue;
        const x = (column + offset + (row % 2) * 0.36) * spacing;
        const y = (row + 0.24 + offset * 0.62) * spacing;
        context.beginPath();
        context.arc(x, y, spacing * (0.344 + 0.11 * sample), 0, Math.PI * 2);
        context.fill();
      }
    }
  });

  if (mix > 0) {
    const sampleWidth = image.width * MathUtils.lerp(0.065, 0.28, zoom);
    const sampleHeight = sampleWidth * height / width;
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = mix;
    context.drawImage(image, image.width * hill.u - sampleWidth / 2, image.height * (1 - hill.v) - sampleHeight / 2,
      sampleWidth, sampleHeight, 0, 0, width, height);
    context.globalAlpha = 1;
  }
}
