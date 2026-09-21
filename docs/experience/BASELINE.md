# BASELINE — davysz.com

Linha de base de performance e levantamento do projeto antes da camada Experience.
Todas as tasks seguintes usam estes números como orçamento.

- **Data:** 2026-09-20
- **Commit de referência:** `9ffa418` (`refactor: remove dead code`)
- **Branch:** `master`
- **Ambiente de medição:** WSL2 (Linux 6.6.114.1-microsoft-standard-WSL2), Node v22.23.2, Yarn 1.22.22 via corepack

---

## 1. Framework e build

| Item | Valor |
|---|---|
| Bundler | Vite 5.4.1 (`@vitejs/plugin-react` 4.3.1) |
| Framework | React 18.3.1 + react-dom 18.3.1 |
| TypeScript | 5.5.3, com project references (`tsconfig.app.json` + `tsconfig.node.json`) |
| Renderização | **SPA 100% client-side.** Não há SSR nem SSG |
| Entry | `index.html` → `src/main.tsx` → `src/entry.tsx` → `PageTemplate` → `Home` |
| Roteamento | Nenhum. Página única com âncoras (`#self`, `#services`, `#skills`, `#projects`, `#articles`) |

**Não é Next.** Não existe App Router, `'use client'`, `next/dynamic` nem qualquer API de servidor.

### Scripts (`package.json`)

| Script | Comando |
|---|---|
| `dev` | `vite` (porta 3000, abre o browser) |
| `build` | `tsc -b && vite build` |
| `build:analyze` | `tsc -b && vite build && open dist/bundle-analysis.html` |
| `lint` | `eslint .` |
| `preview` | `vite preview` (porta 3000, serve o `dist/`) |

**Observação importante sobre o typecheck:** o `build` **já roda `tsc -b`** antes do Vite, então `yarn build` cobre typecheck + build de produção num passo só. Não existe script `typecheck` isolado. O `build:analyze` usa `open`, comando de macOS — não funciona no WSL; o relatório fica em `dist/bundle-analysis.html` de qualquer forma (o plugin `rollup-plugin-visualizer` roda em todo build).

## 2. Gerenciador de pacotes

**Yarn 1** (`yarn.lock`, `# yarn lockfile v1`). Não há campo `packageManager` nem `engines` no `package.json`.

O binário `yarn` não está no PATH do shell; use **`corepack yarn <script>`** (corepack 0.34.6 vem com o Node do nvm). Instalação reproduzível verificada com `corepack yarn install --frozen-lockfile` — o `yarn.lock` não sofre alteração.

## 3. Convenções

### Estrutura de pastas

```
src/
  assets/                     imagens importadas pelo bundler
  components/<kebab-case>/    index.tsx + types.ts (props em arquivo separado)
  hooks/useCamelCase/         use-kebab.tsx + use-kebab.types.ts
  hooks/index.ts              barrel (re-exporta useMobile, useLog, usePdf, useSEO)
  i18n/index.ts               init do i18next
  pages/home/<secao>/         index.tsx + constants.ts|constants.tsx
  pages/home/locales/         en.json, pt.json (namespace "home")
  components/locales/         en.json, pt.json (namespace "component")
  shared/                     constants.ts, typography-tokens.ts
  index.css                   Tailwind + keyframes próprios
```

- Componentes: `export const Nome: React.FC<Props>`. **Não há default export** em componentes.
- Props sempre em `./types.ts` do mesmo diretório, exceto `Loading`, `SkeletonLoader` e `Text`, que declaram a interface inline.
- Listas de dados: `constants.ts` exportando `getAlgo(t)` quando depende de tradução, ou `CONSTANTE_MAIUSCULA` quando é estático.

### Aliases de import

Configurados **nos dois lugares** — `vite.config.ts` (`resolve.alias`) e `tsconfig.app.json` (`paths`):

`@/*` `@components/*` `@hooks/*` `@pages/*` `@shared/*` `@assets/*`

⚠️ **Nenhum arquivo do `src/` usa esses aliases hoje.** 100% dos imports são relativos (`../../components/...`). Ver seção "Ajustes".

### Estilo

- **Tailwind CSS 3.4.13** via PostCSS + autoprefixer. É o padrão dominante.
- `src/index.css` tem CSS próprio justificado: `@keyframes` (`float`, `pulse-soft`, `fadeInUp/Left/Right`, `gradient`, `shimmer`), utilitários `.sr-only`, padding de `td/th` e um bloco `@media (prefers-reduced-motion: reduce)` que zera `animation-duration`, `transition-duration` e `scroll-behavior` globalmente.
- Tema estendido no `tailwind.config.js`: escalas `display-*`, `heading-*`, `body-*`, `letterSpacing`, `boxShadow` (`primary`, `primary-hover`, `card`, `card-hover`) e as paletas `primary`, `secondary`, `semantic`.
- **A cor da marca `#7947DF` já é `primary-500`** no tema. Existe token — usar `primary-500`, não o hex.
- `src/shared/typography-tokens.ts` exporta `typographyClasses` (mapa de strings Tailwind) consumido pelo componente `Text` via prop `variant`.

### Lint e formatter

- ESLint 9 flat config (`eslint.config.js`): `js.configs.recommended` + `typescript-eslint` recommended + `react-hooks` + `react-refresh`. Ignora `dist` e `public/sw.js`.
- Regras que afetam o código do Experience: `no-console` (permite `warn`/`error`/`log`), `@typescript-eslint/no-unused-vars` como **error**, `prefer-const`, `no-var`, `object-shorthand`, `prefer-template`, `prefer-arrow-callback`, `@typescript-eslint/no-explicit-any` como warn, `consistent-type-imports` como warn (preferir `import type`).
- `tsconfig.app.json` tem `strict`, `noUnusedLocals` e `noUnusedParameters` ligados.
- ⚠️ **Prettier não está instalado nem configurado.** Não há `prettier` nas devDependencies, nem `.prettierrc`, nem script de format. Ver seção "Ajustes".

## 4. Hero

- **Arquivo:** `src/pages/home/hero/index.tsx` (componente `Hero`).
- **Montagem:** importado estaticamente por `src/pages/home/index.tsx` e renderizado **eager**, fora de `Suspense` — é a única seção não-lazy (todas as outras usam `lazy()` + `import()`).
- **Layout:** `<section className="flex flex-col-reverse xl:flex-row w-full gap-16 items-center justify-center py-12 md:py-16 px-6 xl:px-[100px]">`.
  - **Não tem `position: relative`, não tem `overflow` e não tem background.** Um canvas posicionado atrás vai exigir acrescentar um wrapper posicionado — hoje não existe nenhum ponto de ancoragem.
  - Não tem altura fixa: a altura é resultado do conteúdo (`py-12`/`md:py-16` + a coluna mais alta).
- **Conteúdo:** eyebrow (`hero.me`), `<h1>` com gradiente (`hero.role`), parágrafo (`hero.description`), botão de download de CV e 3 botões de social; à direita, a foto.
- **Imagem:** `src/assets/user.png` — **1.403 kB, 1024×1024**, renderizada em `h-[300px] xl:h-[500px] w-screen xl:w-[500px]`, com `object-cover` e `animate-float`. Sem `loading`, sem `fetchpriority`, sem `width`/`height`, sem `srcset`.
- **Animações existentes no hero:** `animate-fade-in-left` (coluna de texto), `animate-fade-in-right` (foto), `animate-fade-in-up` (blocos internos), `animate-gradient` (h1), `animate-float` (foto, loop infinito de 6s).

## 5. Dependências já presentes

**Nenhuma biblioteca de 3D ou animação.** Não existe `three`, `@react-three/*`, GSAP, Framer Motion, Lottie ou similar.

| Runtime | Versão |
|---|---|
| `react` / `react-dom` | 18.3.1 |
| `i18next` / `react-i18next` | 25.6.0 / 16.0.1 |
| `react-icons` | 5.3.0 |
| `clsx` | 2.1.1 |

Ou seja, three.js entra do zero — todo o peso é incremental sobre os números abaixo.

## 6. Deploy

⚠️ **Não há configuração de deploy versionada no repositório.** Nenhum `vercel.json`, `netlify.toml`, `.github/workflows/`, `Dockerfile`, `CNAME` ou arquivo equivalente.

- Remote: `git@github.com:DavySz/portfolio.git`
- O site está no ar em `https://davysz.com` (domínio usado em `index.html`, `sitemap.xml` e nos schemas de `StructuredData`).
- **Não é possível determinar pelo repositório** onde o deploy roda nem se existe preview por branch.

👉 **Pergunta para o Davy** (não bloqueia a task 00, mas é necessária antes de validar performance em produção): onde o site é publicado e existe preview por branch? Isso muda como as tasks 01–08 validam LCP/TBT em ambiente real.

### PWA / service worker

`public/sw.js` é registrado por `src/serviceWorkerRegistration.ts` **apenas em `import.meta.env.PROD`**. Ele faz cache-first de `/`, `/index.html`, `/manifest.json`, `/favicon.ico` e cacheia sob demanda `js|css|png|jpg|svg|woff2|...`.

⚠️ **Isso afeta a medição:** ao rodar Lighthouse contra o `yarn preview`, o SW ativa e passa a servir respostas do cache, o que distorce comparações entre execuções. **Medir sempre com "Clear storage" marcado no Lighthouse, ou em aba anônima.**

## 7. Baseline de performance

### 7.1 Bundle (medido — `yarn build` no commit `9ffa418`)

Gzip real de cada arquivo (`gzip -9`), não a estimativa do log do Vite.

**JS carregado no primeiro paint** (entry + os 4 chunks com `modulepreload` no `dist/index.html`):

| Arquivo | Raw | Gzip |
|---|---:|---:|
| `entries/index.CjsXD6mX.js` | 42.613 B | **15.689 B** |
| `chunks/vendor.cxkclgJA.js` (react, react-dom) | 140.855 B | **45.112 B** |
| `chunks/i18n.juG2kCwF.js` (i18next, react-i18next) | 46.219 B | **14.976 B** |
| `chunks/icons.WOO2K8Ql.js` (react-icons) | 2.490 B | **1.096 B** |
| `chunks/utils.B-dksMZM.js` (clsx) | 374 B | **255 B** |
| **Total JS inicial** | **232.551 B (227,1 kB)** | **77.128 B (75,3 kB)** |

| CSS | Raw | Gzip |
|---|---:|---:|
| `assets/index.D8Tifvub.css` | 29.875 B | **5.666 B** |

> ### 🎯 Orçamento herdado pelas próximas tasks
> **JS inicial: 77.128 B gzip (75,3 kB)**
> **JS + CSS inicial: 82.794 B gzip (80,9 kB)**
>
> Qualquer chunk do experience precisa ficar **fora** desta conta (`import()` dinâmico).
> O único arquivo do experience que pode ser importado estaticamente é `quality.ts`, e o
> aumento que ele causar neste número precisa ser reportado em toda task que mexer nele.

**Chunks lazy** (carregam por `import()` conforme as seções entram em cena) — 12.094 B gzip no total:

| Chunk | Gzip | Conteúdo |
|---|---:|---|
| `index.olX8niiE.js` | 5.450 B | seção Skills (arrasta os ícones de marca) |
| `index.EDxjWol8.js` | 1.371 B | seção Services |
| `index.DF2Dr0vD.js` | 1.147 B | seção Articles |
| `index.hhLHbent.js` | 1.100 B | Footer |
| `index.fU8nI9G5.js` | 1.047 B | ProjectCard (compartilhado) |
| `index.-tvOulux.js` | 910 B | seção Projects |
| `index.DBQLSM41.js` | 722 B | seção Self |
| `index.Dk6MSzw-.js` | 347 B | SkeletonLoader (compartilhado) |

### 7.2 Imagens (medido)

O JS **não é** o gargalo deste site. As imagens são.

| Arquivo | Peso | Dimensão | Carga |
|---|---:|---|---|
| `src/assets/user.png` | **1.403 kB** | 1024×1024 | **eager, no hero** |
| `src/assets/quezzy-thumb.svg` | 2.743 kB | viewBox 1920×960 | lazy (Projects) |
| `src/assets/rentx-thumb.svg` | 1.856 kB | viewBox 1920×1348 | lazy (Projects) |
| `src/assets/go-finances-thumb.svg` | 1.615 kB | viewBox 1920×1348 | lazy (Projects) |
| `src/assets/micro-thumb.png` | 338 kB | 3668×1848 | lazy (Articles) |
| `src/assets/bff-thumb.svg` | 245 kB | viewBox 576×360 | lazy (Articles) |
| `src/assets/enem-thumb.png` | 185 kB | 800×542 | lazy (Articles) |
| `src/assets/portfolio.png` | 120 kB | 1024×596 | lazy (Self) |
| `src/assets/testing-thumb.png` | 47 kB | 2400×1260 | lazy (Articles) |
| `public/images/user.jpeg` | 38 kB | 400×400 | só OG/schema, não é renderada |

🔴 **`user.png` é quase certamente o elemento LCP**: 1,4 MB, eager, sem `fetchpriority`, exibida em no máximo 500×500 CSS px. Os SVGs de projeto somam **6,2 MB** — são "SVGs" que provavelmente embutem bitmap em base64, dado o peso para a área que ocupam.

**Por que isso importa para o Experience:** o orçamento de LCP/TBT das tasks 01–08 é medido contra um hero que hoje baixa 1,4 MB de imagem. Se a imagem for otimizada no meio do caminho, **o baseline muda e este arquivo precisa ser refeito**, senão as comparações de ±5% ficam sem sentido.

### 7.3 Lighthouse — ⚠️ NÃO EXECUTADO

**Não foi possível rodar no ambiente.** Não há Chrome nem Chromium instalados no WSL (`chrome`, `google-chrome`, `chromium`, `chromium-browser` ausentes) e o Lighthouse não está no projeto. Instalá-lo seria alterar dependências, o que está **fora de escopo** desta task.

Existe um `chrome.exe` no lado Windows, mas dirigir o CDP dele a partir do WSL2 não é confiável o bastante para gerar número de baseline.

O `yarn preview` **foi verificado e funciona**: serve o build de produção em `http://localhost:3000/` (HTTP 200).

#### 📋 Instruções para o Davy rodar manualmente

Rode no **Windows**, contra o build de produção servido pelo WSL.

1. No WSL, na raiz do projeto:
   ```bash
   corepack yarn install --frozen-lockfile
   corepack yarn build
   corepack yarn preview --host     # --host expõe para o Windows
   ```
   Anote a URL "Network" que o Vite imprime (ex.: `http://172.x.x.x:3000/`). Se `http://localhost:3000` já abrir no Chrome do Windows, pode usar localhost mesmo.

2. No Chrome, **aba anônima** (evita o service worker cacheado de sessões anteriores).

3. DevTools → aba **Lighthouse**:
   - Mode: **Navigation**
   - Device: **Mobile**
   - Categories: **Performance** (as outras são opcionais)
   - ✅ **Clear storage** marcado — obrigatório, por causa do `sw.js`
4. Rode **3 vezes**, fechando e reabrindo a aba anônima entre elas.

5. Preencha a mediana (o valor do meio, não a média):

   | Métrica | Run 1 | Run 2 | Run 3 | **Mediana** |
   |---|---|---|---|---|
   | Performance score | | | | |
   | LCP (s) | | | | |
   | TBT (ms) | | | | |
   | CLS | | | | |

   Anote também qual elemento o Lighthouse aponta como LCP (esperado: a imagem do hero).

6. Cole os números de volta aqui e me avise — as tasks 01–08 precisam da mediana de **LCP** e **TBT** para calcular o teto de +5%.

> ⛔ **Enquanto esta tabela estiver vazia, o orçamento de LCP/TBT das tasks seguintes não pode ser verificado.** O orçamento de **bundle** (seção 7.1) está medido e já é válido.

---

## Ajustes necessários nas próximas tasks

Coisas que este projeto faz diferente do que as specs do Experience assumem.

1. **Não é Next, é Vite SPA.** Ignorar `'use client'`, `next/dynamic`, `next/script` e qualquer distinção server/client. `import()` dinâmico puro + `React.lazy` é o mecanismo de code splitting, e já é o padrão usado em `src/pages/home/index.tsx`. Não existe SSR: o canvas nunca corre risco de rodar no servidor, então não é preciso guardar acesso a `window`/`document` por isso (só por `prefers-reduced-motion`/capabilities).

2. **Estilo é Tailwind.** O CSS de fallback e de layout que as specs descreverem como arquivo `.css` deve virar classes Tailwind. A exceção prevista pelo CLAUDE.md (CSS próprio para canvas/keyframes) se aplica ao `experience-canvas.css` de referência — mas ele deve ser reduzido ao que Tailwind realmente não resolve, e o resto vira classe.

3. **A marca já tem token: use `primary-500`.** `#7947DF` é `theme.colors.primary.500` no `tailwind.config.js`. Não espalhar o hex no TS/TSX do experience — quando o shader precisar do valor numérico, centralizar numa constante única do experience e comentar que ela espelha `primary-500`.

4. **Aliases existem mas ninguém usa.** `@/`, `@components/`, `@hooks/`, `@shared/` etc. estão configurados no Vite e no tsconfig, porém **todos** os imports do `src/` são relativos. Para "seguir o padrão dos arquivos vizinhos" (CLAUDE.md), o código novo de `src/experience/` deve usar **imports relativos**. Se o Davy preferir adotar os aliases, isso é uma decisão à parte, aplicada ao projeto inteiro — não uma escolha da task do experience.

5. **Prettier não existe no projeto**, apesar do CLAUDE.md citá-lo na stack. Não há `prettier` nas devDependencies, `.prettierrc` nem script de format. As tasks não devem rodar `yarn format` nem pressupor formatação automática; basta casar com o estilo dos arquivos vizinhos e passar no `eslint`. **Vale corrigir essa linha do CLAUDE.md ou adicionar o Prettier de fato** — hoje a documentação e o repositório discordam.

6. **`yarn build` já inclui o typecheck** (`tsc -b && vite build`). Não existe script `typecheck` isolado. Para o passo 1 da verificação do CLAUDE.md, `corepack yarn build` cobre typecheck e build juntos; para checar tipos sem buildar, `corepack yarn tsc -b`.

7. **`yarn` não está no PATH — use `corepack yarn`.** O corepack vem com o Node do nvm (`~/.nvm/versions/node/v22.23.2/bin`), que também não está no PATH por padrão neste shell. Continua valendo a regra do CLAUDE.md: **só yarn, nunca npm/pnpm, nunca um segundo lockfile.**

8. **🔴 `tsc -b` suja um arquivo versionado.** `tsconfig.app.tsbuildinfo` e `tsconfig.node.tsbuildinfo` estão **commitados** e fora do `.gitignore`. Toda build altera o `tsconfig.app.tsbuildinfo`, então `git status` fica sujo depois de qualquer verificação, e o diff de toda task vem poluído com um artefato binário-ish. **Recomendo `git rm --cached` nos dois + entrada no `.gitignore`**, como mudança isolada antes da task 01. Enquanto isso não acontece, cada task precisa reverter o arquivo (`git checkout -- tsconfig.app.tsbuildinfo`) antes de mostrar o diff.

9. **O hero não tem ponto de ancoragem para o canvas.** O `<section>` do hero não é `position: relative`, não tem altura própria e não tem background. A task 01 vai precisar introduzir o wrapper posicionado — e isso é mudança de layout num componente existente, não só adição de canvas. Cuidar para não alterar o fluxo atual: a seção é `flex-col-reverse` no mobile e `xl:flex-row` no desktop.

10. **O hero já é animado.** Já existem `animate-float` (loop infinito na foto), `animate-gradient` (loop infinito no h1) e três animações de entrada. O fundo em shader vai **somar** a isso — avaliar se o conjunto não fica ruidoso, e considerar que `animate-float` e `animate-gradient` já consomem main thread/compositor continuamente.

11. **`prefers-reduced-motion` já é tratado globalmente** em `src/index.css`, zerando `animation-duration` e `transition-duration` de tudo. Isso **não alcança o canvas** — animação em `requestAnimationFrame` ignora CSS. O tier `animate: false` do experience precisa ler a media query em JS (`matchMedia('(prefers-reduced-motion: reduce)')`) e reagir à mudança dela, sem depender do CSS existente.

12. **O service worker cacheia JS/CSS agressivamente em produção.** Qualquer medição comparativa (antes/depois) precisa ser feita com "Clear storage" ou em aba anônima, senão o chunk do experience vem do cache e os números mentem.

13. **O gargalo real de LCP é a imagem do hero (1,4 MB), não o JS.** Duas consequências: (a) um ganho ou perda de alguns kB no JS vai ficar escondido no ruído da imagem; (b) se essa imagem for otimizada durante as tasks, **este baseline precisa ser regerado**, senão a régua de ±5% perde o sentido. Sugiro decidir logo se a otimização de imagens entra antes ou depois da série do Experience.

14. **Deploy é desconhecido** (item 6). Precisa da resposta do Davy antes de qualquer validação de performance em ambiente real ou de preview por branch.

15. **Onde o canvas global vai morar (task 04):** a árvore hoje é `main.tsx` → `entry.tsx` → `PageTemplate` (`NavigationBar` + `<main id="main-content">`) → `Home`. `PageTemplate` é o ponto natural para um canvas global, e ele já é `memo`. Vale notar que o `<a>` de "pular para o conteúdo principal" é o primeiro filho e precisa continuar sendo o primeiro elemento focável — o canvas não pode ser inserido antes dele.
