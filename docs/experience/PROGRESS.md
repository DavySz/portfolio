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
| 05 | Cena de domínio: fluxo de transações | feature | **sim, antes de codar** | **aguardando decisão** | — (não criada, por spec) | Proposta: seção **Minha Expertise** (`services`) + 2 narrativas (**A** caos→fluxo, **B** convergência→redistribuição) + fundo opaco vira fallback que se apaga. |
| 06 | Cena de domínio: waterfall de traces | feature | **sim, antes de codar** | pendente | — | Checkpoint de seção e narrativa. |
| 07 | Easter egg com física | feature | não | pendente | — | Independente: pode rodar a qualquer momento depois da 01. |
| 08 | Auditoria final de performance e acessibilidade | qualidade | não | pendente | — | |

---

## Pendências manuais abertas

| # | O que falta | Quem | Bloqueia |
|---|---|---|---|
| 1 | Rodar Lighthouse mobile 3× e preencher a tabela da seção 7.3 do `BASELINE.md` | Davy | Verificação do orçamento de LCP/TBT das tasks 01–08. O orçamento de **bundle** já está medido e vale. **Agora também bloqueia o aceite da task 01.** |
| 2 | Responder onde o site é publicado e se há preview por branch | Davy | Validação de performance em ambiente real. |
| 3 | Decidir se a otimização das imagens (hero = 1,4 MB) entra antes ou depois da série Experience | Davy | Se entrar no meio, o `BASELINE.md` precisa ser regerado. |
| 4 | `git rm --cached` nos `*.tsbuildinfo` + entrada no `.gitignore` | Davy | Não bloqueia, mas suja o diff de toda task. |
| 5 | Alinhar CLAUDE.md × repositório quanto ao Prettier (citado na stack, não instalado) | Davy | Não bloqueia. |
| 6 | **Aval visual do hero escuro** (task 01) + checklist de browsers da spec 01 | Davy | Aceite da task 01. |
| 7 | Decidir se `prefers-reduced-motion` deve reagir em runtime (hoje é lido só na montagem) | Davy | Candidata à task 08. |
| 8 | **Os `.blend` ficam versionados (Git LFS) ou fora do repo?** (pergunta da task 02) | Davy | Não bloqueia; documentar no `ASSETS.md`. |
| 9 | Instalar o binário `ktx` (KTX-Software) e rodar `yarn assets:optimize` de novo | Davy | Sem ele as texturas saem em WebP em vez de KTX2 (perde economia de VRAM). Instruções no `ASSETS.md`. |
| 10 | Abrir `/debug-assets.html` no Chrome e no Firefox para confirmar Draco + textura decodificando | Davy | Aceite da task 02. |
| 11 | **Aval visual do posicionamento do objeto-assinatura** (halo em volta da foto, só em ≥1280px) | Davy | Aceite da task 03. Estimei sem browser. |
| 12 | Conferir `renderer.info` antes/depois de desmontar (vazamento de geometria) | Davy | Aceite da task 03. |
| 13 | Tailwind emite utilitários fantasma a partir de palavras no `src/**/*.ts` (ex.: `.ring` veio de `RingConfig`) | — | Candidata à task 08: hoje custa 14 B, mas cresce junto com `src/experience/`. |
| 14 | **Comparar hero antes/depois da task 04** (desktop e mobile) — refactor exige visual idêntico | Davy | Aceite da task 04. Não consigo tirar screenshot aqui. |
| 15 | Conferir no Performance do DevTools que não há frame renderizado com o hero fora da tela | Davy | Aceite da task 04. |
| 16 | **Escolher seção e narrativa da task 05** | Davy | Bloqueia a task 05. |

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
