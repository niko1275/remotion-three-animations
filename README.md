# Animaciones con Remotion y Three.js

Base en React y TypeScript para crear vídeos 3D. Incluye Orbit: 6 segundos, 1920 × 1080, 30 fps.

## Requisitos y uso

Node.js 22 o superior y npm.

```sh
npm ci
npm start
```

Abre Remotion Studio para previsualizar y editar.

```sh
npm run typecheck
npm run build
npm run render
```

El vídeo se guarda en `out/orbit.mp4`. El primer render puede descargar Chrome Headless Shell. Linux necesita las bibliotecas de Chromium y soporte de ANGLE para WebGL.

## Personalización

- `src/Orbit.tsx`: geometrías, materiales, luces y movimiento.
- `src/Root.tsx`: duración, resolución y fps.

Los movimientos usan `useCurrentFrame()` para reproducir cada fotograma de forma determinista. Evita animaciones basadas en el reloj o `useFrame()` al exportar.

Revisa los requisitos de licencia de Remotion antes del uso en producción: https://www.remotion.dev/docs/license

