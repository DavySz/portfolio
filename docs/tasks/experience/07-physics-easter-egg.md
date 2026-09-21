# 07 — Easter egg com física

**Branch:** `feat/physics-easter-egg`
**Depende de:** 01 (só pelas convenções; não usa o canvas nem three.js)

## Objetivo

Um modo escondido em que elementos da página ganham física e desabam; o visitante pode arrastar e arremessar, e depois arrumar tudo de volta. Custo zero para quem nunca ativar.

## Ativação

- **Konami code** (↑ ↑ ↓ ↓ ← → ← → B A) em qualquer página.
- **Botão discreto** no rodapé, acessível por teclado, com texto claro do que faz (ex.: "Desligar a gravidade"). Discreto não é escondido de leitor de tela.
- Com `prefers-reduced-motion`, o modo não é oferecido: botão ausente e Konami ignorado.

## Implementação

1. **Motor:** `@dimforge/rapier2d-compat` (2D basta para DOM; a versão `compat` embute o WASM e evita configuração de bundler). Carregado por `import()` só na ativação.
2. **Corpos:** elementos marcados com `data-physics` na viewport no momento da ativação. Medir rects, criar um corpo retangular por elemento, paredes nas bordas da viewport.
3. **Render:** a cada frame, aplicar `transform: translate(...) rotate(...)` relativo à posição original. Nada de tirar os elementos do fluxo; usar `will-change: transform` só durante o modo.
4. **Interação:** arrastar com ponteiro (mouse e toque) e arremessar com a velocidade do gesto.
5. **Scroll** travado enquanto o modo está ativo, restaurado ao sair.
6. **Saída:** `Esc` ou botão flutuante "Arrumar a página", que anima os elementos de volta à posição original e depois remove transforms, estilos e o mundo de física.
7. Marcar com `data-physics` um conjunto pequeno e divertido de elementos (título, cards, avatar, links sociais). Sugerir a lista no resumo final.

## Fora de escopo

Qualquer física no canvas WebGL.

## Critérios de aceite

- Rapier não aparece em nenhum chunk carregado sem ativação (conferir no build e na aba Network).
- Depois de sair do modo, o DOM volta exatamente ao estado inicial: nenhum estilo inline residual, foco preservado, scroll restaurado.
- Funciona com toque no Galaxy A13 e no iPhone.
- Typecheck, lint e build passando.

---

## Prompt de execução

```
Leia docs/tasks/experience/README.md e docs/tasks/experience/07-physics-easter-egg.md.
Execute a task 07 na branch feat/physics-easter-egg.
Confirme que o Rapier só é baixado na ativação.
Não commite. No final: resumo, tamanho do chunk do Rapier, a lista de elementos com data-physics e a mensagem de commit sugerida.
```
