# PROGRESS — Experience

Fonte da verdade do andamento das tasks de `docs/tasks/experience/`.
Uma task por vez, na ordem do README. Nada é commitado automaticamente.

**Status possíveis:** `pendente` · `em andamento` · `aguardando decisão` · `aguardando revisão` · `concluída`

| # | Task | Tipo | Checkpoint | Status | Branch | Observações |
|---|------|------|------------|--------|--------|-------------|
| 00 | Discovery e baseline de performance | só leitura | não | **concluída** | — (sem branch, por spec) | `BASELINE.md` criado e commitado direto no master. Bundle medido; **Lighthouse pendente de execução manual** (pendência 1). 15 ajustes levantados para as próximas tasks. |
| 01 | Núcleo do Experience + fundo em shader no hero | feature | não | **aguardando revisão** | `feat/experience-core` | three@0.186 em chunk dinâmico (**240.672 B gzip**). JS inicial +601 B (+0,78%). **Hero virou escuro** e as cores do texto mudaram para passar AA — precisa de aval visual. |
| 02 | Pipeline de assets 3D (glTF + Draco + KTX2) | infra | não | **aguardando revisão** | `feat/experience-assets` (ramificada de `feat/experience-core`, **não** do master) | Pipeline 4 passos + loaders + página de debug + `ASSETS.md`. Cubo de teste: 3,1 kB → 2,4 kB (−22,7%). **`ktx` não instalado → saída em WebP.** Bundle inalterado. |
| 03 | Objeto-assinatura no hero | feature | **sim, antes de codar** | **aguardando revisão** | `feat/experience-signature-object` (de `feat/experience-assets`) | Conceito **C — Alinhamento (giroscópio)**, escolha delegada a mim. 7.760 tris `high` / 3.092 `low` (39,8%). JS inicial **−6 B**. **Posicionamento precisa de aval visual.** |
| 04 | Canvas global + cenas por seção | refactor | não | **aguardando revisão** | `refactor/experience-global-canvas` | Canvas único fixo no `PageTemplate`, recortado por seção via scissor. JS inicial +159 B. Bug de eixo Y invertido encontrado pelo Davy e corrigido (`97811fa`); **visual conferido por ele depois da correção.** |
| 05 | Cena de domínio: fluxo de transações | feature | **sim, antes de codar** | **aguardando revisão** | `feat/experience-transactions-scene` | Seção `services`, narrativa A (caos→fluxo). 7.000 instâncias `high` / 1.500 `low`. Primeira versão cobria 103% da área e lia como textura; corrigida em `b875f49` para ~10% de cobertura. **fps e CPU ainda precisam ser medidos.** |
| 06 | Waterfall de traces | feature | **sim, antes de codar** | **revertida** | `feat/experience-trace-scene` (código removido em `feat/physics-easter-egg`) | Feita em DOM (opção A) e depois **removida a pedido do Davy**: a seção `observability` não entrou no site. O commit `d0c524b` tem o código inteiro, caso volte a fazer sentido. |
| 07 | Easter egg com física | feature | não | **aguardando revisão** | `feat/physics-easter-egg` | Rapier 0.20 em chunk próprio de **796 KB gzip**, baixado só na ativação. Konami + botão no rodapé. 12 elementos com `data-physics`. JS inicial +673 B. |
| 08 | Auditoria final de performance e acessibilidade | qualidade | não | **aguardando revisão** | `chore/experience-audit` | `REPORT.md` criado. 6 correções pequenas (hierarquia de headings, 2 cards sem teclado, `font-regular`, LCP do hero, `tsbuildinfo`). **Lighthouse, heap, axe e matriz de ambientes não puderam rodar aqui.** |

---

## Fora da série: leitor de artigos

Pedido direto do Davy, não é uma das tasks. Branch `feat/articles-reader`.

Os 8 artigos de `Documents/artigos` agora vivem em `src/content/articles/*.md` e
são lidos no próprio site, em `#/artigos/<slug>`. Os 4 que estão no Medium
continuam linkando para lá, como referência secundária.

- Markdown vira HTML **no build**, por um plugin do Vite (`plugins/markdown.ts`).
  `marked` e `highlight.js` são devDependencies: nenhuma biblioteca de markdown
  vai para o site.
- Um chunk por artigo (86 kB gzip somados, mas só o aberto é baixado).
- Rota por hash, porque o deploy ainda é desconhecido (pendência 2) e hash
  dispensa rewrite no servidor.
- Custo no bundle inicial: **+428 B de JS e +512 B de CSS**.

### Pendências

| # | O que falta | Quem |
|---|---|---|
| 25 | Revisar título, resumo, tag e **data** de cada artigo em `src/content/articles/index.ts` — as datas eu inferi do arquivo | Davy |
| 26 | 4 artigos não têm thumb; hoje recebem uma capa tipográfica na paleta da marca | Davy |
| 27 | Decidir se os artigos devem ter versão em inglês (hoje são pt-BR, com `lang` marcado) | Davy |
| 28 | O tema não tem a escala `label-*` (`text-label-md/lg` não existe e falha em silêncio no JSX). Ela só vivia no objeto `typography`, que era código morto. Decidir se entra no `tailwind.config.js` | Davy |

## Pendências manuais abertas

| # | O que falta | Quem | Bloqueia |
|---|---|---|---|
| 1 | Rodar Lighthouse mobile 3× e preencher a tabela da seção 7.3 do `BASELINE.md` | Davy | Verificação do orçamento de LCP/TBT das tasks 01–08. O orçamento de **bundle** já está medido e vale. **Agora também bloqueia o aceite da task 01.** |
| 2 | Responder onde o site é publicado e se há preview por branch | Davy | Validação de performance em ambiente real. |
| 3 | ~~Otimização das imagens~~ — feita na sabatina: 8.634 kB → 501 kB (−94%). | — | Resolvido. **O `BASELINE.md` ficou desatualizado por causa disso.** |
| 4 | ~~`git rm --cached` nos `*.tsbuildinfo`~~ — feito na task 08. | — | Resolvido. |
| 5 | Alinhar CLAUDE.md × repositório quanto ao Prettier (citado na stack, não instalado) | Davy | Não bloqueia. |
| 6 | **Aval visual do hero escuro** (task 01) + checklist de browsers da spec 01 | Davy | Aceite da task 01. |
| 7 | Decidir se `prefers-reduced-motion` deve reagir em runtime (hoje é lido só na montagem) | Davy | Candidata à task 08. |
| 8 | **Os `.blend` ficam versionados (Git LFS) ou fora do repo?** (pergunta da task 02) | Davy | Não bloqueia; documentar no `ASSETS.md`. |
| 9 | Instalar o binário `ktx` (KTX-Software) e rodar `yarn assets:optimize` de novo | Davy | Sem ele as texturas saem em WebP em vez de KTX2 (perde economia de VRAM). Instruções no `ASSETS.md`. |
| 10 | Abrir `/debug-assets.html` no Chrome e no Firefox para confirmar Draco + textura decodificando | Davy | Aceite da task 02. |
| 11 | **Aval visual do posicionamento do objeto-assinatura** (halo em volta da foto, só em ≥1280px) | Davy | Aceite da task 03. Estimei sem browser. |
| 12 | Conferir `renderer.info` antes/depois de desmontar (vazamento de geometria) | Davy | Aceite da task 03. |
| 13 | ~~Tailwind fantasma~~ — medido: corrigir economiza 88 B e cria falha silenciosa. **Decidido não fazer.** | — | Encerrado, ver REPORT 7.3. |
| 14 | **Comparar hero antes/depois da task 04** (desktop e mobile) — refactor exige visual idêntico | Davy | Aceite da task 04. Não consigo tirar screenshot aqui. |
| 15 | Conferir no Performance do DevTools que não há frame renderizado com o hero fora da tela | Davy | Aceite da task 04. |
| 16 | ~~Escolher seção e narrativa da task 05~~ — delegado a mim: `services` + narrativa A | — | Resolvido. |
| 17 | **Medir fps por tier e o tempo de CPU do `update` no Performance** (task 05) | Davy | Aceite da task 05. |
| 18 | Conferir que a cena fica igual em WebGPU e em WebGL2 (`forceWebGL: true`) | Davy | Aceite da task 05. |
| 19 | ~~Task 06~~ — feita em DOM e depois removida a pedido do Davy. | — | Encerrada. |
| 22 | O i18n importa **todos** os locales estaticamente: cada texto novo entra no bundle inicial, mesmo em seção lazy | — | Candidata à task 08. |
| 23 | **Testar o easter egg no toque** (Galaxy A13 e iPhone): arrastar, arremessar e sair | Davy | Aceite da task 07. |
| 24 | Conferir na aba Network que o chunk do Rapier só baixa ao ativar | Davy | Aceite da task 07. |
| 20 | ~~Site abre em inglês vs CLAUDE.md pedindo pt-BR~~ — Davy confirmou: **inglês é intencional**. CLAUDE.md corrigido. | — | Resolvido. |
| 21 | ~~Hero e Self citam o empregador~~ — Davy autorizou citar o **nome** da empresa. CLAUDE.md corrigido; dados/endpoints/métricas seguem proibidos. | — | Resolvido. |

## Números de referência

Do `BASELINE.md`, commit `9ffa418`, 2026-09-20:

- **JS inicial:** 77.128 B gzip (75,3 kB)
- **JS + CSS inicial:** 82.794 B gzip (80,9 kB)
- **LCP / TBT / CLS:** não medidos ainda (ver pendência 1)

Depois da task 01 (branch `feat/experience-core`, ainda não mergeada):

- **JS inicial:** 77.729 B gzip (+601 B, +0,78%)
- **CSS inicial:** 5.940 B gzip (+274 B, +4,84%)
- **Total inicial:** 83.669 B gzip (+875 B, +1,06%)
- **Chunk `Experience` (dinâmico, fora do caminho inicial):** 240.672 B gzip / 885.117 B raw

Depois da task 03 (branch `feat/experience-signature-object`):

- **JS inicial:** 77.723 B gzip (−6 B vs task 01; +595 B / +0,77% vs baseline)
- **CSS inicial:** 5.954 B gzip (+14 B vs task 01 — utilitário fantasma `.ring`)
- **Chunk `Experience` (dinâmico):** 242.738 B gzip / 891.096 B raw (+2.066 B vs task 01)
- **Triângulos:** 7.760 `high` · 3.092 `low` (39,8% — spec exige ≤50%)

Depois da task 04 (branch `refactor/experience-global-canvas`):

- **JS inicial:** 77.882 B gzip (+159 B vs task 03; +754 B / +0,98% vs baseline)
- **CSS inicial:** 5.978 B gzip (+24 B vs task 03)
- **Chunk `Experience` (dinâmico):** 244.073 B gzip (+1.335 B vs task 03)

Depois da task 05 (branch `feat/experience-transactions-scene`):

- **JS inicial:** 77.889 B gzip (+7 B vs task 04; +761 B / +0,99% vs baseline)
- **CSS inicial:** 5.983 B gzip (+5 B vs task 04)
- **Chunk `Experience` (dinâmico):** 245.765 B gzip (+1.692 B vs task 04)
- **Instâncias:** 7.000 `high` · 1.500 `low` · congelado em `progress`=1 com `animate:false`

Depois da task 07 (branch `feat/physics-easter-egg`):

- **JS inicial:** 79.176 B gzip (+673 B vs task 06; +2.048 B / +2,66% vs baseline)
- **CSS inicial:** 6.347 B gzip (+182 B vs task 06)
- **Chunk `gravity-world` (só na ativação):** 796.206 B gzip / 2.119.236 B raw
- **Elementos com `data-physics`:** 4 no hero (título, descrição, botões, foto) + 8 cards de Stack

#### Contraste da cena sobre o texto de `services` (medido)

A cor das partículas é o **teto** do escurecimento (`#D1BFF3`), não um alpha:
com blend normal N partículas sobrepostas saturam na cor, então fixá-la garante
o limite independentemente da densidade.

| Texto | Contraste com a cena saturada |
|---|---:|
| título `primary-900` | 8,65 ✓ |
| descrição `gray-700` | 6,13 ✓ |
| tabela `gray-700` | 6,13 ✓ |
| tabela `primary-700` | 4,99 ✓ |
| **título `primary-500`** | **3,30 ✗** → resolvido pela máscara vertical |

O gradiente do título termina em `primary-500`, que sobre o fundo atual já está
em 5,06:1 — só 0,56 de folga. Por isso as partículas são apagadas na faixa do
topo (30%–55% da altura da seção), onde título e descrição vivem.

### Seções com fundo opaco (levantadas na task 04, **não alteradas**)

| Seção | Fundo | Esconde o canvas? |
|---|---|---|
| `hero` | transparente (+ fallback CSS que se apaga) | não |
| `self` | transparente | não |
| `services` | `bg-secondary-50` | **sim** |
| `skills` | transparente | não |
| `projects` | transparente | não |
| `articles` | transparente | não |
| `footer` | `bg-secondary-900` | **sim** |

`body` **não** tem background: o branco vem do padrão do navegador. Por isso o
canvas global precisa ser transparente e recortado por seção — senão apareceria
através de `self`, `skills`, `projects` e `articles`. Decidir o que fazer com
`services` e `footer` é assunto das tasks 05 e 06.

## Histórico

| Data | Evento |
|---|---|
| 2026-09-20 | Task 00 executada sobre o commit `9ffa418`. `BASELINE.md` e `PROGRESS.md` criados. Lighthouse não executável no ambiente (sem Chrome no WSL); instruções manuais registradas. |
| 2026-09-20 | Task 00 commitada direto no master (`cb3a30b`) e enviada ao origin. |
| 2026-09-20 | Task 01 executada na branch `feat/experience-core`. three@0.186 + @types/three instalados; núcleo, HeroBackground e ExperienceCanvas portados. Hero convertido para superfície escura por exigência de contraste AA. Typecheck, lint e build passando. |
| 2026-09-20 | Task 01 commitada em `feat/experience-core` (`ede6ee1`), sem push. |
| 2026-09-20 | Task 02 executada na branch `feat/experience-assets`, ramificada de `feat/experience-core` porque a 01 ainda não está no master. Pipeline glTF, loaders, cubo de teste, página de debug e `ASSETS.md`. |
| 2026-09-20 | Task 02 commitada em `feat/experience-assets` (`5721848`), sem push. |
| 2026-09-20 | Task 03 parada no checkpoint de conceito, conforme a spec. 3 conceitos propostos; nenhuma branch ou arquivo criado. |
| 2026-09-21 | Escolha do conceito delegada a mim pelo Davy: **C — Alinhamento (giroscópio)**. Task 03 executada em `feat/experience-signature-object`. |
| 2026-09-21 | Dois ajustes de espaçamento reportados pelo Davy e corrigidos na mesma branch: margem assimétrica do nav (`263f536`) e padding superior do hero no empilhado (`94cd396`). |
| 2026-09-21 | Task 04 executada em `refactor/experience-global-canvas`, ramificada de `feat/experience-signature-object`. |
| 2026-09-21 | Bug da task 04: viewport/scissor usavam origem bottom-left, mas a API do three usa top-left. Erro crescia com o scroll. Achado pelo Davy via screenshot, corrigido em `97811fa` e confirmado por ele. |
| 2026-09-21 | Task 05 parada no checkpoint de seção e narrativa, conforme a spec. |
| 2026-09-21 | Escolha delegada a mim pelo Davy: seção `services`, narrativa A, fundo claro preservado. Task 05 executada em `feat/experience-transactions-scene`. |
| 2026-09-21 | Davy reportou que a cena da 05 ficou ruim. Causa medida: 103% de cobertura — as partículas saturavam na própria cor. Tamanho passou a sair de conta de cobertura (`b875f49`). |
| 2026-09-21 | Task 06 parada no checkpoint, com recomendação de fazer em SVG/DOM em vez de WebGL. |
| 2026-09-21 | Davy decidiu: pode citar o nome da empresa, e o site abre em inglês mesmo. CLAUDE.md atualizado nas duas regras. |
| 2026-09-21 | Davy escolheu a opção A da task 06: waterfall em DOM, sem WebGL. Executada em `feat/experience-trace-scene`, com seção nova `observability`. |
| 2026-09-21 | Task 07 executada em `feat/physics-easter-egg`. Rapier isolado em chunk próprio, carregado só na ativação. |
| 2026-09-21 | Davy pediu para remover a seção "Lendo um trace". Task 06 revertida em cima da 07; o código fica preservado no commit `d0c524b`. |
| 2026-09-21 | Fora da série: leitor de artigos no próprio site, com os 8 textos de `Documents/artigos`. Branch `feat/articles-reader`. |
| 2026-09-21 | Task 08 executada em `chore/experience-audit`. `REPORT.md` com números finais, correções aplicadas e checklist de aparelhos. Série encerrada. |
