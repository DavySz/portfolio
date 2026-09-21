# 08 — Auditoria final de performance e acessibilidade

**Branch:** `chore/experience-audit`
**Depende de:** todas as anteriores que foram feitas

## Objetivo

Medir o site inteiro contra o `BASELINE.md`, corrigir regressões pequenas e registrar o estado final.

## Checagens

1. **Performance:** Lighthouse mobile e desktop na home, mediana de 3 execuções, comparada ao baseline. Tamanho gzip de cada chunk do experience e do Rapier.
2. **Vazamentos:** navegar entre rotas 20 vezes e comparar heap e `renderer.info` (geometrias, texturas, programas) no início e no fim.
3. **GPU ociosa:** com a aba parada no hero por 1 minuto e com a aba em segundo plano, confirmar que o loop não renderiza à toa.
4. **Matriz de ambientes:**

| Ambiente | Esperado |
|---|---|
| Chrome desktop (WebGPU) | tudo |
| Firefox (WebGL2) | tudo, mesmo visual |
| Safari / iPhone | tudo |
| Galaxy A13 | tier `low`, fluido |
| `prefers-reduced-motion` | frames estáticos, sem easter egg |
| `saveData` (DevTools) | só fallbacks CSS, three.js não baixado |
| WebGL desativado | fallbacks CSS, nenhum erro visível |

5. **Acessibilidade:** axe (ou equivalente) sem violações novas; contraste AA de todo texto sobre cenas; navegação por teclado intacta; canvas `aria-hidden`.

## Saída

`docs/experience/REPORT.md` com números antes/depois, resultado da matriz, problemas encontrados e o que foi corrigido. Corrigir aqui só o que for pequeno; o que for grande vira item de **Próximos passos** no relatório, não código.

Os itens que dependem de aparelho físico (iPhone, Galaxy A13) ficam como checklist para o Davy.

---

## Prompt de execução

```
Leia docs/tasks/experience/README.md, docs/experience/BASELINE.md e docs/tasks/experience/08-final-audit.md.
Execute a task 08 na branch chore/experience-audit. Corrija só regressões pequenas; o resto vai para Próximos passos no REPORT.md.
Não commite. No final: resumo do REPORT, o que foi corrigido, o checklist de aparelhos para mim e a mensagem de commit sugerida.
```
