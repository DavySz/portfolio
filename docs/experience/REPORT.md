# REPORT — auditoria final

Fecha a série `docs/tasks/experience/`. Compara o estado atual contra o
`BASELINE.md`, registra o que foi corrigido aqui e o que ficou para depois.

- **Data:** 2026-09-21
- **Baseline:** commit `9ffa418`
- **Branch da auditoria:** `chore/experience-audit`
- **Ambiente:** WSL2, Node 22.23.2, Yarn 1.22.22 — **sem browser**

> ⚠️ **Metade desta auditoria não pôde ser executada aqui.** Lighthouse, heap,
> `renderer.info`, axe e a matriz de ambientes exigem navegador, e não há
> Chrome nem Chromium neste WSL. O que era mensurável estaticamente foi medido
> e está abaixo; o resto virou checklist no fim do documento. Nada foi dado
> como aprovado sem medição.

---

## 1. Performance

### 1.1 Caminho inicial (medido)

O que o navegador baixa antes do primeiro conteúdo.

| | Baseline | Agora | Δ |
|---|---:|---:|---:|
| JS inicial | 77.128 B | **79.430 B** | +2.302 B (**+2,98%**) |
| CSS inicial | 5.666 B | **7.142 B** | +1.476 B (+26,05%) |
| **Total** | 82.794 B | **86.572 B** | +3.778 B (+4,56%) |

O JS cresceu menos de 3% depois de sete tasks, um motor 3D, um motor de física
e um leitor de artigos. O que entra no caminho inicial é só o que **decide** se
algo será carregado: `detectQuality()`, o registro de seções, o estado do
easter egg e o catálogo de artigos.

O CSS cresceu proporcionalmente mais (+26%), e quase tudo é o tema dos blocos
de código dos artigos — que aparece no caminho inicial mesmo sendo usado só na
página de artigo. Ver *Próximos passos*.

### 1.2 O que NÃO está no caminho inicial (medido)

| Chunk | Gzip | Quando baixa |
|---|---:|---|
| `gravity-world` (Rapier) | 796.206 B | só ao ativar o easter egg |
| `Experience` (three + 3 cenas) | 245.761 B | em `requestIdleCallback`, fora do LCP |
| 8 artigos somados | 87.337 B | um por vez, ao abrir |
| seções lazy da home | ~13 kB | conforme entram em cena |

Verificado no build: nenhum destes aparece no `index.html`, e `WebGPURenderer`
e `RAPIER` não aparecem em nenhum chunk inicial.

### 1.3 Lighthouse — ⛔ NÃO EXECUTADO

**O baseline nunca teve números de Lighthouse** (seção 7.3 do `BASELINE.md`
segue vazia), então não há contra o que comparar LCP, TBT e CLS. Esta é a
lacuna mais séria da série: o orçamento de "±5% sobre o baseline" do README
**nunca pôde ser verificado em nenhuma task**.

O orçamento de **bundle** foi medido em todas.

---

## 2. Vazamentos — auditoria estática

Não foi possível rodar heap snapshot nem ler `renderer.info`. O que dá para
afirmar por leitura do código:

| Recurso | Criado em | Liberado em |
|---|---|---|
| Geometrias e materiais das 3 features | construtores | `dispose()` de cada feature |
| Renderer e canvas | `Experience.init` | `Experience.dispose` |
| `ResizeObserver` (viewport, body) | `Experience` | `cleanups` |
| `IntersectionObserver` | `TraceWaterfall`, removido | — |
| Listener de ponteiro | `observePointer` | `cleanups` |
| Mundo e corpos do Rapier | `startGravity` | `world.free()` no dispose |
| 4 listeners de ponteiro do easter egg | `startGravity` | removidos no dispose |
| Botões de copiar dos artigos | efeito da `ArticlePage` | limpeza do efeito |
| Estilos inline do easter egg | ativação | removidos, inclusive o atributo vazio |

`addEventListener` e `removeEventListener` estão **equilibrados** em
`Experience.ts` (1/1) e `gravity-world.ts` (4/4). As geometrias do
`SignatureObject` vão para um array liberado em loop.

Isso mostra que **não há vazamento estrutural**. Não substitui medir o heap.

---

## 3. GPU ociosa — auditoria estática

| Situação | Comportamento no código |
|---|---|
| Hero fora da viewport | `visibility <= 0` → a feature é pulada; sem nenhuma seção visível o canvas é limpo **uma vez** e o loop para de desenhar |
| Aba em segundo plano | `setAnimationLoop` usa `requestAnimationFrame`, que o navegador congela sozinho |
| `prefers-reduced-motion` | sem loop de animação; só repinta quando o `scrollY` muda, porque o canvas é fixo e a seção rola |

Falta confirmar no Performance do DevTools que não há frame desenhado à toa.

---

## 4. Matriz de ambientes

| Ambiente | Esperado | Situação |
|---|---|---|
| Chrome desktop (WebGPU) | tudo | ⬜ **só você pode** |
| Firefox (WebGL2) | mesmo visual | ⬜ **só você pode** |
| Safari / iPhone | tudo | ⬜ **só você pode** |
| Galaxy A13 | tier `low`, fluido | ⬜ **só você pode** |
| `prefers-reduced-motion` | frames estáticos, sem easter egg | ✅ verificado no código, ⬜ falta ver |
| `saveData` | só fallback CSS, three não baixa | ✅ verificado no código, ⬜ falta ver |
| WebGL desativado | fallback CSS, sem erro visível | ✅ `try/catch` cobre, ⬜ falta ver |

Os três "verificado no código" têm o caminho garantido por leitura: `saveData`
faz `detectQuality()` devolver `off` e o `ExperienceRoot` sair antes do
`import()`; reduced motion remove o botão do rodapé e ignora o Konami; e a
falha de renderer cai no `catch`, deixando o fallback CSS no lugar.

---

## 5. Acessibilidade

### 5.1 Contraste — medido, 15 de 15 passam AA

Calculado em espaço linear, contra o **pior caso** de cada cena (o ponto mais
claro do shader do hero, a cena de partículas 100% saturada).

| Contexto | Texto | Ratio |
|---|---|---:|
| hero / shader | eyebrow `primary-200` | 4,59 |
| hero / shader | h1 `white` → `primary-200` | 7,19 → 4,59 |
| hero / shader | descrição `white` | 7,19 |
| hero / shader | botão `primary-100` | 5,78 |
| services / cena | descrição `gray-700` | 6,11 |
| services / cena | tabela `primary-700` | 4,98 |
| artigo | corpo `gray-700` | 10,31 |
| artigo | h2 `gray-900` | 17,74 |
| artigo | link `primary-600` | 6,77 |
| código | texto sobre `#15102b` | 14,81 |
| código | comentário | 6,22 |
| código | rótulo da linguagem | 7,86 |

### 5.2 Problemas encontrados e corrigidos nesta task

**1. Seis `<h1>` na mesma página.** Hero, Self, Services, Skills, Projects e
Articles usavam todos `as="h1"`. Agora só o hero é `h1`; as seções são `h2` e
os cards `h3`. Como o tamanho vem do `variant`, nada mudou visualmente.

**2. `ProjectCard` e `SkillCard` eram `div` com `onClick`.** Não alcançáveis
por teclado, não anunciados como link e sem "abrir em nova aba". Viraram
âncoras de verdade — no `ProjectCard` com `::after` cobrindo o card, para a
área de clique continuar a mesma. A `alt` da imagem virou vazia, já que o
título agora é o nome acessível do link.

### 5.3 Não verificado

axe (ou equivalente) não foi executado — exige navegador. O `canvas` está
`aria-hidden` em todos os pontos de montagem.

---

## 6. Outras correções pequenas feitas aqui

**`font-regular` não existe no Tailwind.** Estava em 4 variantes do `Text`
(`heroSubtitle`, `sectionDescription`, `cardDescription`, `bodyText`) e gerava
zero CSS. Trocado por `font-normal`. Era classe morta escondida dentro de uma
string — o tipo que a limpeza de código morto não alcança.

**Imagem do hero sem dimensões.** Ganhou `width`/`height` (reservam a caixa e
evitam CLS), `fetchPriority="high"` e `decoding="async"`. É o elemento LCP.

**`*.tsbuildinfo` versionado.** Saiu do índice e entrou no `.gitignore`. Todo
build sujava o `git status`, e na task 03 isso chegou a prender trabalho num
`git stash` que não aplicava de volta.

---

## 7. Próximos passos

Levantados aqui, **não corrigidos** por não serem pequenos.

### 7.1 ✅ RESOLVIDO — a imagem do hero tinha 1,4 MB

`src/assets/user.png`: 1024×1024, exibida em no máximo 500×500 CSS px. É quase
certamente o elemento LCP. Os SVGs de projeto somam mais 6,2 MB.

Isso domina qualquer discussão de performance do site — os 2.302 B de JS que a
série inteira acrescentou somem no ruído dessa imagem. **Otimizar imagens tem
mais impacto do que tudo que foi feito nesta série.**

**Feito na sabatina** (`eaa4e83` e `b9e8aa9`): `scripts/images/optimize.js`
converte tudo para WebP e rasteriza os SVGs que embutiam bitmap. Total de
8.634 kB para 501 kB, −94%. A foto do hero caiu de 1.403 kB para 36 kB.

Continua em aberto: `srcset` por breakpoint (hoje é uma largura só) e o
`bff-thumb.svg`, que é vetor de verdade e precisa de SVGO, não de conversão.

### 7.2 O i18n carrega todos os locales no caminho inicial

`src/i18n/index.ts` importa os quatro JSON estaticamente. Texto de seção lazy
pesa no bundle inicial de qualquer forma — a seção de traces removida custava
614 B só de tradução. Carregar namespaces sob demanda resolveria.

### 7.3 ⏹️ ENCERRADO — Tailwind emite utilitários fantasma

`content` inclui `src/**/*.{js,ts,jsx,tsx}`, então palavras comuns viram
classe: `.filter` veio do método de array, `.container` de nome de variável,
`.ring` de `RingConfig`.

**Medi a correção** (restringir a `*.tsx` + `typography-tokens.ts`):
economiza **88 B gzip**. Reverti: o ganho não paga o risco de um `.ts` futuro
com classe falhar **em silêncio** — exatamente o que aconteceu com
`text-label-*` e `font-regular`. Se for corrigir, o certo é junto com um lint
de classes desconhecidas.

### 7.4 A escala `label-*` não existe no tema

`text-label-md/lg` não gera CSS. A escala só vivia no objeto `typography`, que
era código morto e foi removido; o `tailwind.config.js` nunca a teve. Em
`@apply` isso quebra o build, mas em `className` **falha calado**. Decidir se
entra no tema ou se sai do vocabulário.

### 7.5 `prefers-reduced-motion` é lido só na montagem

Alternar a preferência com a página aberta não muda nada até recarregar.
Reagir em runtime mexe no ciclo de vida do loop e das features.

### 7.6 Deploy continua desconhecido

Sem `vercel.json`, `netlify.toml` ou CI no repositório. Isso já influenciou
decisão técnica: a rota dos artigos é por **hash** justamente para funcionar em
qualquer hospedagem estática, sem rewrite.

---

## 8. Checklist para o Davy

Nada disto eu consigo fazer daqui.

### Performance
- [ ] **Lighthouse mobile na home, 3×, mediana** — preencher a seção 7.3 do `BASELINE.md`. Usar aba anônima ou "Clear storage": o service worker cacheia JS/CSS e distorce a comparação
- [ ] Lighthouse desktop, mesma receita
- [ ] Performance do DevTools: confirmar que não há frame desenhado com o hero fora da tela
- [ ] Aba parada no hero por 1 minuto: sem aquecer, sem subir consumo

### Vazamentos
- [ ] Abrir e fechar artigos 20×; comparar heap no início e no fim
- [ ] `renderer.info` (geometrias, texturas, programas) antes e depois de desmontar
- [ ] Confirmar que existe **um único** `<canvas>` no DOM

### Ambientes
- [ ] Chrome desktop (WebGPU)
- [ ] Firefox (WebGL2) — mesmo visual
- [ ] Safari / iPhone
- [ ] **Galaxy A13**: tier `low`, fluido, e o easter egg no toque
- [ ] DevTools → Rendering → `prefers-reduced-motion` (**recarregar** depois de ligar)
- [ ] DevTools → Network → `Save-Data: on`: o chunk `Experience` **não** pode ser baixado
- [ ] WebGL desativado: fallback CSS, nenhum erro visível

### Acessibilidade
- [ ] axe ou Lighthouse a11y na home e numa página de artigo
- [ ] Percorrer o site inteiro só de teclado, incluindo os cards de projeto e de stack que mudaram aqui
- [ ] Leitor de tela: conferir a nova hierarquia de headings

### Easter egg
- [ ] Toque no A13 e no iPhone: arrastar e arremessar
- [ ] Network: o chunk de 796 kB só baixa ao ativar
- [ ] Depois de sair: nenhum `style` inline residual no Elements
