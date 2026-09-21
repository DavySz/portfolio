# 04 — Canvas global + cenas por seção

**Branch:** `refactor/experience-global-canvas`
**Depende de:** 01 (e 03, se já estiver feita)

## Objetivo

Hoje o canvas vive dentro do hero. Para as cenas de domínio (tasks 05 e 06), ele precisa virar **uma camada fixa atrás da página inteira**, com cada seção dizendo qual cena quer mostrar. Esta task é refactor puro: **o site deve ficar visualmente idêntico ao final dela.**

## Arquitetura

```
App/layout raiz
└── <ExperienceRoot/>           ← um único canvas fixo (inset 0, z-index -1, pointer-events none)
    └── páginas
        └── <section ref={useExperienceSection('hero')}>
```

1. **Registro de seções** em `src/experience/sections.ts`: módulo pequeno, **sem importar three**, com `registerSection(id, element)` / `unregisterSection(id)`. As seções se registram mesmo antes do three carregar; o núcleo lê o registro quando estiver pronto.
2. **Hook** `useExperienceSection(id)` que devolve um ref callback e cuida do registro/desregistro.
3. **Estado por seção** calculado dentro do loop (sem listener de `scroll`): `progress` (0 quando a seção entra por baixo, 1 quando sai por cima) e `visibility` (0–1, fração visível). Rects medidos no resize e combinados com `window.scrollY` a cada frame, para não chamar `getBoundingClientRect` em toda seção todo frame.
4. **Contrato `Feature` estendido** com `section: string`. O `FrameContext` passa `progress` e `visibility` da seção da feature. O `Experience` só chama `update`/`render` de features com `visibility > 0`; se nenhuma estiver visível, não renderiza nada.
5. `HeroBackground` (e `SignatureObject`, se existir) passam a pertencer à seção `hero`. O `IntersectionObserver` do hero sai, substituído pela visibilidade da seção.
6. **Persistência entre rotas:** o `ExperienceRoot` fica no layout e não remonta ao navegar; as seções entram e saem do registro.
7. **Fallback CSS** continua no elemento do hero, não no canvas global.

## Atenção

Seções com fundo opaco escondem o canvas. Listar no resumo quais seções têm fundo opaco hoje; **não mudar** nenhuma nesta task (isso é decidido nas tasks 05 e 06).

## Critérios de aceite

- Comparação visual antes/depois do hero (screenshot em desktop e mobile) sem diferença perceptível.
- Um único `<canvas>` no DOM em qualquer rota, mesmo após navegar várias vezes.
- Nenhum frame renderizado com o hero fora da tela e sem outras cenas (conferir no Performance do DevTools).
- `sections.ts` e o hook não puxam three para o bundle inicial.
- Typecheck, lint e build passando; métricas dentro do orçamento.

---

## Prompt de execução

```
Leia docs/tasks/experience/README.md e docs/tasks/experience/04-global-canvas-sections.md.
Execute a task 04 na branch refactor/experience-global-canvas. É refactor: o visual precisa ficar idêntico.
Tire screenshots do hero antes de começar para comparar no final.
Não commite. No final: resumo, lista de seções com fundo opaco, evidência da comparação visual e a mensagem de commit sugerida.
```
