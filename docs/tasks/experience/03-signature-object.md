# 03 — Objeto-assinatura no hero

**Branch:** `feat/experience-signature-object`
**Depende de:** 01, 02

## ⛔ Checkpoint antes de codar

Não escreva código ainda. Primeiro proponha **3 conceitos** de objeto para o Davy escolher. Para cada um: o que é, por que tem a ver com ele (engenheiro frontend sênior, fintech, arquitetura de micro-frontends, observabilidade), como reage ao ponteiro/scroll, e o custo estimado em triângulos.

Evitar o óbvio de fintech (cartão de crédito, moeda, cifrão, gráfico subindo): se um conceito cabe em qualquer portfólio de fintech, ele não serve. Pelo menos um conceito deve ser abstrato (forma geométrica/material) e pelo menos um deve ser uma metáfora de arquitetura.

**Espere a escolha antes de seguir.**

## Objetivo

Adicionar uma segunda `Feature` no mesmo canvas da task 01, renderizada por cima do fundo, com o objeto escolhido.

## Passos (depois do checkpoint)

1. Criar `src/experience/features/SignatureObject.ts` com `PerspectiveCamera` própria.
2. Enquanto o modelo do Blender não existe, construir uma **versão procedural** da forma escolhida em código (geometria do three), com a mesma silhueta e escala esperadas. A troca pelo `.glb` depois deve ser só trocar a fonte da geometria dentro da feature, via `loadModel` da task 02.
3. **Camadas:** o `HeroBackground` precisa de `depthWrite = false` e `depthTest = false` no material, senão o quad do fundo oculta o objeto. Conferir a ordem de render no `Experience`.
4. **Material** em TSL (node material). Iluminação barata: preferir matcap ou iluminação falsa em shader a luzes reais + sombras.
5. **Interação:** rotação/inclinação seguindo o ponteiro com amortecimento independente de framerate (mesmo padrão `1 - exp(-delta * k)` do fundo). No toque, reagir a scroll ou giroscópio só se for trivial; caso contrário, animação ociosa lenta.
6. **Layout:** o objeto não pode ficar atrás do texto do hero no mobile. Definir posição por breakpoint (lendo `FrameContext.width`) e, se precisar, esconder no tier `low` em telas estreitas.

## Comportamento por tier

| Situação | Resultado |
|---|---|
| `high` | geometria completa, interação com ponteiro |
| `low` | geometria reduzida (≤50% dos triângulos), animação ociosa |
| `animate: false` | objeto estático numa pose bonita, sem rotação |

## Critérios de aceite

- Fundo e objeto no mesmo canvas, um único loop.
- Nenhum crescimento do bundle inicial; chunk do experience reportado.
- `dispose` libera geometria e material (conferir `renderer.info` antes e depois de desmontar).
- Typecheck, lint e build passando.

## Checagem manual (para o Davy)

- [ ] Objeto não disputa atenção com o nome/título do hero
- [ ] Galaxy A13: fluido e posicionado sem cobrir texto
- [ ] Reduced motion: pose estática

---

## Prompt de execução

```
Leia docs/tasks/experience/README.md e docs/tasks/experience/03-signature-object.md.
Comece SÓ pelo checkpoint: me proponha os 3 conceitos e pare. Não crie branch nem arquivos ainda.
```

Depois da escolha:

```
Vou com o conceito <X>. Execute o restante da task 03 na branch feat/experience-signature-object.
Não commite. No final: resumo, contagem de triângulos por tier, tamanho do chunk, checklist manual e a mensagem de commit sugerida.
```
