# PROGRESS — Experience

Fonte da verdade do andamento das tasks de `docs/tasks/experience/`.
Uma task por vez, na ordem do README. Nada é commitado automaticamente.

**Status possíveis:** `pendente` · `em andamento` · `aguardando decisão` · `aguardando revisão` · `concluída`

| # | Task | Tipo | Checkpoint | Status | Branch | Observações |
|---|------|------|------------|--------|--------|-------------|
| 00 | Discovery e baseline de performance | só leitura | não | **concluída** | — (sem branch, por spec) | `BASELINE.md` criado e commitado direto no master. Bundle medido; **Lighthouse pendente de execução manual** (pendência 1). 15 ajustes levantados para as próximas tasks. |
| 01 | Núcleo do Experience + fundo em shader no hero | feature | não | **em andamento** | ver spec | — |
| 02 | Pipeline de assets 3D (glTF + Draco + KTX2) | infra | não | pendente | — | |
| 03 | Objeto-assinatura no hero | feature | **sim, antes de codar** | pendente | — | Checkpoint de conceito. |
| 04 | Canvas global + cenas por seção | refactor | não | pendente | — | Ponto de montagem provável: `PageTemplate`. |
| 05 | Cena de domínio: fluxo de transações | feature | **sim, antes de codar** | pendente | — | Checkpoint de seção e narrativa. |
| 06 | Cena de domínio: waterfall de traces | feature | **sim, antes de codar** | pendente | — | Checkpoint de seção e narrativa. |
| 07 | Easter egg com física | feature | não | pendente | — | Independente: pode rodar a qualquer momento depois da 01. |
| 08 | Auditoria final de performance e acessibilidade | qualidade | não | pendente | — | |

---

## Pendências manuais abertas

| # | O que falta | Quem | Bloqueia |
|---|---|---|---|
| 1 | Rodar Lighthouse mobile 3× e preencher a tabela da seção 7.3 do `BASELINE.md` | Davy | Verificação do orçamento de LCP/TBT das tasks 01–08. O orçamento de **bundle** já está medido e vale. |
| 2 | Responder onde o site é publicado e se há preview por branch | Davy | Validação de performance em ambiente real. |
| 3 | Decidir se a otimização das imagens (hero = 1,4 MB) entra antes ou depois da série Experience | Davy | Se entrar no meio, o `BASELINE.md` precisa ser regerado. |
| 4 | `git rm --cached` nos `*.tsbuildinfo` + entrada no `.gitignore` | Davy | Não bloqueia, mas suja o diff de toda task. |
| 5 | Alinhar CLAUDE.md × repositório quanto ao Prettier (citado na stack, não instalado) | Davy | Não bloqueia. |

## Números de referência

Do `BASELINE.md`, commit `9ffa418`, 2026-09-20:

- **JS inicial:** 77.128 B gzip (75,3 kB)
- **JS + CSS inicial:** 82.794 B gzip (80,9 kB)
- **LCP / TBT / CLS:** não medidos ainda (ver pendência 1)

## Histórico

| Data | Evento |
|---|---|
| 2026-09-20 | Task 00 executada sobre o commit `9ffa418`. `BASELINE.md` e `PROGRESS.md` criados. Lighthouse não executável no ambiente (sem Chrome no WSL); instruções manuais registradas. |
