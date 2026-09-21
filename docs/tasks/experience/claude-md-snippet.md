## Experience (camada 3D/WebGL)

- Código em `src/experience/` (ajustar ao alias do projeto). Núcleo imperativo em TypeScript, sem React.
- React só monta e desmonta o canvas; nenhum estado do three.js passa por estado do React.
- Renderer: `WebGPURenderer` de `three/webgpu` (fallback automático para WebGL2). Shaders em TSL (`three/tsl`), nunca GLSL cru.
- Cada efeito é uma `Feature` (`scene`, `camera`, `resize`, `update`, `dispose`) registrada no `Experience`.
- `detectQuality()` em `src/experience/quality.ts` é o único arquivo do experience importado estaticamente. Precisa continuar pequeno e sem dependências.
- Toda geometria, material e textura criada precisa ser liberada no `dispose()`.
- Specs e ordem de trabalho em `docs/tasks/experience/`.
