# 01 — Núcleo do Experience + fundo em shader no hero

**Branch:** `feat/experience-core`
**Depende de:** 00

## Objetivo

Colocar no ar a infraestrutura WebGL do site e o primeiro efeito: um gradiente vivo em TSL atrás do hero, na cor da marca (#7947DF), reagindo sutilmente ao cursor.

## Implementação de referência

`docs/tasks/experience/reference/` já tem uma versão funcional, validada com `tsc` contra `three@0.186`:

| Arquivo | Papel |
|---|---|
| `experience/quality.ts` | detecta o tier (`off`/`low`/`high`) antes de baixar three.js |
| `experience/types.ts` | contrato `Feature` e `FrameContext` |
| `experience/Experience.ts` | renderer, loop, resize, visibilidade, ponteiro, dispose |
| `experience/features/HeroBackground.ts` | shader do gradiente (domain warping + glow + dithering) |
| `components/ExperienceCanvas.tsx` | monta via `import()` em `requestIdleCallback` |
| `components/experience-canvas.css` | fallback CSS que aparece antes do fade-in e no tier `off` |

Use como base, **adaptando às convenções levantadas no `BASELINE.md`** (alias, estilo, lint, local das pastas). Não copiar cegamente.

## Passos

1. Instalar `three` e `@types/three` na versão estável mais recente. Se a API TSL da referência quebrar na versão instalada, corrigir e anotar a diferença no resumo final.
2. Portar os arquivos para `src/experience/` e o componente para a pasta de componentes do projeto.
3. Converter o fallback CSS para o sistema de estilo do projeto.
4. Montar o `ExperienceCanvas` dentro do hero, atrás do conteúdo (`position: relative` + `isolation: isolate` no hero, canvas com `z-index: -1`).
5. Garantir contraste do texto do hero sobre o fundo novo (WCAG AA). Se não passar, ajustar a cor do texto ou escurecer o shader, e reportar o que mudou.

## Comportamento esperado por tier

| Situação | Resultado |
|---|---|
| `high` | shader animado, `pixelRatio` até 2, glow seguindo o cursor |
| `low` (toque ou ≤4 GB) | shader animado, `pixelRatio` 1 |
| `animate: false` | um frame estático do shader, sem listener de ponteiro |
| `off` (`saveData`) | só o gradiente CSS; three.js não é baixado |
| sem WebGPU nem WebGL2 | erro capturado, gradiente CSS continua |
| hero fora da viewport | loop continua agendado mas não renderiza |

## Fora de escopo

Qualquer outro efeito, objeto 3D ou mudança de layout do hero.

## Critérios de aceite

- Typecheck, lint e build passando.
- No output do build, `three` aparece apenas em chunk carregado dinamicamente. Reportar o tamanho gzip desse chunk.
- Navegar para outra rota e voltar não vaza canvas nem listeners (o `dispose` roda; conferir que só existe um `<canvas>` no DOM).
- LCP e TBT mobile dentro do orçamento do README.

## Checagem manual (para o Davy)

- [ ] Chrome desktop (WebGPU): animação suave, glow acompanha o mouse
- [ ] Firefox (WebGL2): mesmo visual
- [ ] Safari / iPhone
- [ ] Galaxy A13 no stage: fluido, sem aquecer em 1 minuto parado no hero
- [ ] DevTools → Rendering → `prefers-reduced-motion: reduce`: frame estático
- [ ] Sem banding visível no gradiente escuro

---

## Prompt de execução

```
Leia docs/tasks/experience/README.md, docs/experience/BASELINE.md e docs/tasks/experience/01-core-hero-background.md.
Execute a task 01 na branch feat/experience-core, usando docs/tasks/experience/reference/ como base e adaptando às convenções do BASELINE.
Rode typecheck, lint e build; confirme que three.js está só em chunk dinâmico e reporte o tamanho gzip.
Não commite. No final: resumo das mudanças, diferenças em relação à referência, números de performance, checklist manual pendente e a mensagem de commit sugerida.
```
