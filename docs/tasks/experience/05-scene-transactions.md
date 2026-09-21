# 05 — Cena de domínio: fluxo de transações

**Branch:** `feat/experience-transactions-scene`
**Depende de:** 04

## ⛔ Checkpoint antes de codar

Proponha ao Davy:

1. **Em qual seção** a cena entra (ler as seções existentes do site e sugerir a que conta a história de fintech).
2. **2 narrativas** de como o scroll conduz a cena. Ex.: partículas caóticas que se organizam em fluxos ordenados conforme o `progress`; ou fluxos que convergem para um ponto e se redistribuem. Cada narrativa deve dizer o que o visitante entende sem ler nada.
3. O que muda no fundo da seção (hoje opaco?) para o canvas aparecer.

**Espere a escolha antes de seguir.**

## Objetivo

Uma cena de milhares de partículas representando transações, dirigida pelo scroll, com custo de CPU praticamente zero.

## Requisitos técnicos

- `InstancedMesh` com geometria mínima (quad ou triângulo).
- **Toda animação na GPU**, calculada no `positionNode` em TSL a partir de `instanceIndex`, `time` e um uniform de `progress`. Nenhuma atualização de matriz por instância na CPU por frame.
- Não usar compute shaders: precisam funcionar igual no fallback WebGL2.
- Trajetórias definidas por funções no shader (curvas paramétricas + noise), não por buffers atualizados.
- Paleta derivada do #7947DF; fade de entrada/saída pela `visibility` da seção.
- Nada de valores monetários, nomes de bancos ou qualquer coisa que pareça dado real.

## Comportamento por tier

| Situação | Resultado |
|---|---|
| `high` | ~6–8 mil instâncias |
| `low` | ~1,5 mil instâncias, sem efeitos extras |
| `animate: false` | cena congelada no estado de `progress` = 1 (organizado), sem movimento |

Ajustar as contagens medindo; o alvo é 60 fps no desktop e fluido no Galaxy A13.

## Critérios de aceite

- CPU por frame da feature desprezível no Performance do DevTools (reportar o tempo de `update`).
- Mesmo visual em WebGPU e WebGL2 (`forceWebGL: true`).
- Texto da seção continua legível (contraste AA) sobre a cena.
- Typecheck, lint e build passando; métricas dentro do orçamento.

---

## Prompt de execução

```
Leia docs/tasks/experience/README.md e docs/tasks/experience/05-scene-transactions.md.
Comece SÓ pelo checkpoint: leia as seções do site, me proponha a seção, as 2 narrativas e a mudança de fundo, e pare.
```

Depois da escolha:

```
Seção <X>, narrativa <Y>. Execute o restante da task 05 na branch feat/experience-transactions-scene.
Não commite. No final: resumo, instâncias e fps medidos por tier, tempo de CPU do update e a mensagem de commit sugerida.
```
