# 06 — Cena de domínio: waterfall de traces

**Branch:** `feat/experience-trace-scene`
**Depende de:** 04 (05 recomendada antes)

## ⛔ Checkpoint antes de codar

Um waterfall de traces é naturalmente 2D; em SVG/DOM ele ficaria mais simples e acessível. A cena só justifica WebGL se houver uma **virada espacial**. Proponha ao Davy:

1. **Em qual seção** entra (a que fala de observabilidade/arquitetura).
2. **2 ideias de virada 3D**. Ex.: o waterfall plano se inclina com o scroll e revela profundidade, cada camada de serviço num plano diferente; ou os spans "caem" do waterfall e se empilham formando a topologia de serviços.
3. Se nenhuma ideia convencer, **recomende fazer em SVG** e diga isso claramente. Esta task pode virar uma task sem WebGL.

**Espere a escolha antes de seguir.**

## Dados

Criar `src/experience/data/sample-trace.ts` com um trace **inventado**, no formato de spans do OpenTelemetry (`traceId`, `spanId`, `parentSpanId`, `name`, `kind`, `startOffsetMs`, `durationMs`, `service`). Uns 15–25 spans, com paralelismo e profundidade realistas. Nomes genéricos (`GET /checkout`, `auth.verify`, `ledger.reserve`, `notify.send`). **Nenhum nome de serviço, rota ou métrica real da Fretebras.**

## Requisitos técnicos

- Barras dos spans com `InstancedMesh`; atributos por instância (início, duração, profundidade, serviço) em `InstancedBufferAttribute`, animação no shader.
- Os spans "chegam" em ordem temporal conforme o `progress`, como um trace sendo recebido ao vivo.
- **Rótulos em DOM**, não em WebGL: texto nítido, selecionável e acessível. Posicionados sobre a cena apenas enquanto o waterfall está plano; somem na virada 3D.
- Alternativa textual: descrição curta do trace em `sr-only` na seção.

## Comportamento por tier

| Situação | Resultado |
|---|---|
| `high` | virada 3D completa |
| `low` | waterfall animado, virada 3D simplificada ou ausente |
| `animate: false` | waterfall completo e plano, estático, com rótulos |

## Critérios de aceite

- Leitor de tela anuncia a descrição do trace; canvas continua `aria-hidden`.
- Rótulos alinhados às barras em qualquer largura de tela.
- Typecheck, lint e build passando; métricas dentro do orçamento.

---

## Prompt de execução

```
Leia docs/tasks/experience/README.md e docs/tasks/experience/06-scene-trace-waterfall.md.
Comece SÓ pelo checkpoint: me proponha a seção e as 2 viradas 3D (ou recomende SVG, se for o caso) e pare.
```

Depois da escolha:

```
Seção <X>, ideia <Y>. Execute o restante da task 06 na branch feat/experience-trace-scene.
Não commite. No final: resumo, fps por tier e a mensagem de commit sugerida.
```
