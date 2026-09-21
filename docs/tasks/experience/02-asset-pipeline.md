# 02 — Pipeline de assets 3D (glTF + Draco + KTX2)

**Branch:** `feat/experience-assets`
**Depende de:** 01

## Objetivo

Deixar pronto o caminho Blender → site antes de existir qualquer modelo real, para que a task 03 (e as futuras) só precisem soltar um `.glb` numa pasta.

## Estrutura

```
assets-src/models/      ← .glb exportado do Blender (entrada, não vai pro bundle)
public/models/          ← .glb otimizado (saída, servido estático)
public/decoders/draco/  ← decoder Draco copiado de three
public/decoders/basis/  ← transcoder Basis (KTX2) copiado de three
scripts/assets/         ← scripts de otimização
src/experience/loaders.ts
```

Ajustar `public/` ao equivalente do framework (conferir no `BASELINE.md`).

## Passos

1. **Otimização** com `@gltf-transform/cli` (devDependency), via script `assets:optimize` no `package.json`, processando tudo de `assets-src/models/` para `public/models/`:
   - geometria: Draco com quantização;
   - texturas: KTX2 — ETC1S para cor/albedo, UASTC para normal maps;
   - remover dados não usados (dedup, prune).
   Confirmar as flags atuais com `npx gltf-transform --help` em vez de supor. KTX2 exige o binário `ktx` (KTX-Software): se não estiver instalado, o script deve falhar com mensagem clara dizendo como instalar no Ubuntu/WSL, e oferecer fallback para WebP.
2. **Decoders:** script `assets:decoders` que copia os decoders Draco e Basis de `node_modules/three/examples/jsm/libs/` para `public/decoders/`. Rodar no `postinstall` para nunca ficarem dessincronizados da versão do three. Adicionar a pasta ao `.gitignore`.
3. **Loader** em `src/experience/loaders.ts`: função `loadModel(url, renderer)` que configura `GLTFLoader` + `DRACOLoader` + `KTX2Loader` uma única vez (lazy, reaproveitado) e chama `detectSupport` com o `WebGPURenderer`. Exportar também `disposeLoaders()`.
4. **Asset de teste:** um script que gera `assets-src/models/_test-cube.glb` programaticamente com `@gltf-transform/core` (um cubo com uma textura pequena), para validar o pipeline ponta a ponta sem depender do Blender.
5. **Guia curto** em `docs/experience/ASSETS.md`: como exportar do Blender (glTF binário, +Y up, aplicar modificadores, sem câmeras/luzes, orçamento de triângulos e tamanho de textura por tier) e como rodar os scripts.

## Pergunta para o Davy (não bloqueia)

Os `.blend` ficam versionados (Git LFS) ou fora do repositório? Perguntar no resumo final e documentar a resposta no `ASSETS.md` depois.

## Fora de escopo

Renderizar o modelo na página (isso é a task 03).

## Critérios de aceite

- `assets:optimize` transforma o cubo de teste e imprime tamanho antes/depois.
- Um teste temporário (ou página de debug fora da navegação) carrega o cubo otimizado via `loadModel` em WebGPU e em WebGL2 (`forceWebGL: true`). Remover antes de terminar ou deixar atrás de uma flag de dev documentada.
- Decoders fora do bundle JS e fora do git.
- Typecheck, lint e build passando.

---

## Prompt de execução

```
Leia docs/tasks/experience/README.md, docs/experience/BASELINE.md e docs/tasks/experience/02-asset-pipeline.md.
Execute a task 02 na branch feat/experience-assets.
Antes de escrever os scripts, confira as flags atuais do gltf-transform com --help. Se o binário ktx não existir no ambiente, implemente a mensagem de erro e o fallback, e me diga como instalar.
Não commite. No final: resumo, tamanhos antes/depois do cubo de teste, a pergunta sobre os .blend e a mensagem de commit sugerida.
```
