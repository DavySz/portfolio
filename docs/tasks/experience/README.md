# Experience — camada criativa do davysz.com

Tasks para o Claude Code executar, uma por vez, na ordem. Cada task é do tamanho de um PR.

| # | Task | Tipo | Checkpoint com o Davy |
|---|------|------|------------------------|
| 00 | Discovery e baseline de performance | só leitura | não |
| 01 | Núcleo do Experience + fundo em shader no hero | feature | não |
| 02 | Pipeline de assets 3D (glTF + Draco + KTX2) | infra | não |
| 03 | Objeto-assinatura no hero | feature | **sim, antes de codar** (conceito) |
| 04 | Canvas global + cenas por seção | refactor | não |
| 05 | Cena de domínio: fluxo de transações | feature | **sim, antes de codar** (seção e narrativa) |
| 06 | Cena de domínio: waterfall de traces | feature | **sim, antes de codar** (seção e narrativa) |
| 07 | Easter egg com física | feature | não |
| 08 | Auditoria final de performance e acessibilidade | qualidade | não |

A 07 é independente: pode ser feita a qualquer momento depois da 01.

## Como rodar

1. Copie a pasta `docs/tasks/experience/` para o repositório.
2. Acrescente o conteúdo de `claude-md-snippet.md` ao `CLAUDE.md` do projeto.
3. Abra a task, copie o bloco **Prompt de execução** do final e cole no Claude Code.

## Regras que valem para todas as tasks

- **Nunca piorar o conteúdo.** O site precisa continuar legível e navegável sem WebGL, com JS lento e com `prefers-reduced-motion`. O canvas é sempre decoração (`aria-hidden`).
- **three.js fora do bundle inicial.** Tudo que importa `three` entra por `import()` dinâmico. Verificar no output do build a cada task.
- **Orçamento de performance.** LCP e TBT mobile não podem piorar mais que 5% em relação ao `docs/experience/BASELINE.md` (criado na task 00). Reportar o tamanho gzip do chunk do experience em toda task que mexer nele.
- **Tiers de qualidade.** Toda feature nova precisa definir o comportamento em `high`, `low` e `animate: false`. O tier `off` nunca carrega three.js.
- **Sem dados internos.** Nenhum dado, nome de serviço, endpoint ou print de sistemas da Fretebras. Tudo que parecer dado real (traces, transações) é inventado e genérico.
- **Sem commit automático.** Trabalhar na branch indicada na task; ao final, mostrar o resumo e sugerir a mensagem em Conventional Commits. O Davy revisa e commita.
- **Parar quando houver dúvida de produto.** Decisão visual ou de conteúdo que não esteja na task vira pergunta, não suposição.
