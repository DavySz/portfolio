# ASSETS — pipeline 3D (Blender → site)

Como um modelo sai do Blender e chega otimizado ao davysz.com.

## Estrutura

| Pasta | Papel | Versionado? |
|---|---|---|
| `assets-src/models/` | `.glb` exportado do Blender (entrada) | ✅ sim |
| `public/models/` | `.glb` otimizado (saída, servido estático) | ✅ sim |
| `public/decoders/draco/` | decoder Draco copiado do three | ❌ gerado |
| `public/decoders/basis/` | transcoder Basis/KTX2 copiado do three | ❌ gerado |
| `scripts/assets/` | os scripts | ✅ sim |

`public/` é servido na raiz pelo Vite, então `public/models/x.glb` vira `/models/x.glb` em runtime.

O cubo de teste (`_test-cube.glb`) é gerado por comando e está no `.gitignore` nas duas pontas — não versionar nem publicar.

## Comandos

| Script | O que faz |
|---|---|
| `yarn assets:decoders` | Copia Draco e Basis de `node_modules/three` para `public/decoders/`. Roda sozinho no `postinstall`. |
| `yarn assets:test-cube` | Gera `assets-src/models/_test-cube.glb` (cubo com textura xadrez) para validar o pipeline sem Blender. |
| `yarn assets:optimize` | Otimiza **todo** `.glb` de `assets-src/models/` para `public/models/`, imprimindo tamanho antes/depois. |

Os decoders vêm do `postinstall` de propósito: eles são baixados em runtime pelo `GLTFLoader`/`KTX2Loader`, não passam pelo bundler, e um decoder de versão diferente do `three` instalado quebra de formas difíceis de diagnosticar.

## O pipeline de otimização

`yarn assets:optimize` roda quatro passos por modelo:

1. **`optimize`** — `dedup`, `prune`, `join`, `flatten`, `weld`. Sem tocar em geometria nem textura.
2. **`uastc`** — KTX2/UASTC nos **normal maps**. UASTC preserva direção; ETC1S borraria as normais e o relevo ficaria sujo.
3. **`etc1s`** — KTX2/ETC1S nas demais texturas (cor, emissive, occlusion, metallic-roughness).
4. **`draco`** — quantiza e comprime a geometria (posição 14 bits, normal 10, texcoord 12).

### ⚠️ A ordem não é arbitrária

Cada invocação da CLI é um ciclo **ler → transformar → escrever**, e a leitura **descomprime** o Draco. Se o Draco rodasse antes das texturas, o passo seguinte o desfaria em silêncio: o `.glb` sairia sem `KHR_draco_mesh_compression` e ninguém perceberia, porque nada falha.

Por isso o Draco é sempre o **último** passo. Ao mexer no script, confira o resultado com:

```bash
npx gltf-transform inspect public/models/<modelo>.glb   # extensionsUsed precisa listar as duas
```

### `--simplify` está desligado de propósito

O `optimize` reduz malha por padrão. Desliguei: decimar geometria autorada é decisão de modelagem, não do pipeline. Se um modelo precisar de menos triângulos, reduza no Blender, onde dá para ver o resultado.

## KTX2 exige o binário `ktx`

O KTX2 precisa do **KTX-Software**, que não vem pelo npm. Sem ele o script **cai para WebP** e avisa em amarelo — o site continua funcionando, mas perde a economia de VRAM (WebP descomprime para RGBA na GPU; KTX2 continua comprimido na memória de vídeo).

**Ubuntu / WSL:**

1. Baixe o `.deb` em https://github.com/KhronosGroup/KTX-Software/releases (`KTX-Software-<versao>-Linux-x86_64.deb`)
2. `sudo apt install ./KTX-Software-*-Linux-x86_64.deb`
3. `ktx --version`

Ou, via Homebrew (Linux ou macOS): `brew install ktx`

> **Estado atual:** o `ktx` **não** está instalado neste ambiente, então a saída em `public/models/` hoje usa WebP. Depois de instalar, rode `yarn assets:optimize` de novo para gerar KTX2 de verdade.

## Exportando do Blender

**File → Export → glTF 2.0 (.glb/.gltf)**, salvando em `assets-src/models/`.

| Opção | Valor | Por quê |
|---|---|---|
| Format | **glTF Binary (.glb)** | arquivo único, sem `.bin` nem texturas soltas |
| Include | só **Selected Objects** | evita arrastar a cena inteira |
| Include → Cameras / Punctual Lights | **desmarcado** | câmera e luz são do código, não do asset |
| Transform → +Y Up | **marcado** | convenção do glTF; sem isso o modelo chega deitado |
| Data → Mesh → Apply Modifiers | **marcado** | o que você vê é o que é exportado |
| Data → Mesh → UVs, Normals | **marcado** | necessários para textura e iluminação |
| Data → Mesh → Tangents | desmarcado | o pipeline gera se precisar (`tangents`) |
| Compression | **desmarcado** | o Draco é aplicado pelo `assets:optimize`, com nossas configurações |

Antes de exportar: aplique escala e rotação (`Ctrl+A`), zere a origem do objeto e dê nomes descritivos aos materiais — eles viram os nomes dos slots no glTF.

## Orçamento por tier

O tier vem de `detectQuality()` (`src/experience/quality.ts`). O dispositivo de referência para `low` é um **Android de entrada (Galaxy A13)**.

| | `high` | `low` |
|---|---|---|
| Triângulos por objeto-assinatura | ≤ 60k | ≤ 20k |
| Triângulos por cena de domínio | ≤ 120k | ≤ 40k |
| Textura de cor | 2048² | 1024² |
| Normal map | 2048² | 1024² |
| Draw calls por cena | ≤ 30 | ≤ 15 |
| `.glb` transferido por cena | ≤ 1,5 MB | ≤ 600 kB |

O `optimize` já limita textura a 2048 px (`--texture-size`, padrão). Para uma variante `low` mais leve, exporte um `.glb` separado em vez de depender do transcode.

> Estes números são ponto de partida, não medição: nenhum modelo real passou pelo pipeline ainda. Reavaliar na task 03, com o primeiro objeto de verdade no Galaxy A13.

## Carregando no código

```ts
import { loadModel, disposeLoaders } from "../experience/loaders";

const gltf = await loadModel("/models/meu-modelo.glb", renderer);
scene.add(gltf.scene);

// no dispose do Experience:
disposeLoaders();
```

`loadModel` monta `GLTFLoader` + `DRACOLoader` + `KTX2Loader` **uma vez só** e reaproveita: cada loader sobe workers próprios, então instanciar por modelo desperdiçaria threads. O `detectSupport` precisa do renderer **já inicializado** (`await renderer.init()`), porque ele consulta os formatos de textura comprimida que a GPU aceita.

## Página de debug

Valida o pipeline ponta a ponta nos dois backends:

```bash
yarn assets:test-cube && yarn assets:optimize
yarn dev
# abrir http://localhost:3000/debug-assets.html
```

Ela carrega o `.glb` otimizado em WebGPU e em WebGL2 (`forceWebGL: true`) e mostra mesh, vértices e tipo de textura. **Não entra no build de produção**: o Vite só empacota `index.html`, e nada da aplicação importa esse arquivo.

## Pendente

- [ ] **Os `.blend` ficam versionados (Git LFS) ou fora do repositório?** Aguardando decisão do Davy. Documentar aqui depois de decidido.
- [ ] Instalar o `ktx` e regerar `public/models/` em KTX2.
- [ ] Revisar o orçamento por tier com um modelo real no Galaxy A13 (task 03).
