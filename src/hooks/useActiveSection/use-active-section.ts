import { useEffect, useState } from "react";

/**
 * Descobre qual seção está em cena, para o menu marcar onde a pessoa está.
 *
 * Usa `IntersectionObserver` com uma faixa que privilegia o miolo da tela
 * (`rootMargin` corta 45% de cima e 50% de baixo): sem isso, duas seções
 * visíveis ao mesmo tempo ficariam disputando o destaque a cada pixel de
 * scroll. Quando nenhuma está na faixa — topo da página — devolve `null`.
 *
 * `enabled` existe porque o menu é o mesmo nas duas rotas: dentro de um artigo
 * nenhuma seção da home está montada, e procurar por elas ali é trabalho que
 * nunca termina.
 */
export const useActiveSection = (
  ids: string[],
  enabled = true
): string | null => {
  const [active, setActive] = useState<string | null>(null);
  const [retryToken, setRetry] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }

    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    /* As seções da home são `lazy`: se alguma ainda não existe, espera o DOM
       mudar e tenta de novo.

       Era um `ResizeObserver` no body, e ele nunca podia funcionar aqui: a
       observação dispara uma vez assim que começa, então o efeito se
       re-agendava sozinho a cada quadro. Na home isso parava quando as sete
       seções montavam; dentro de um artigo, onde nenhuma delas existe, o laço
       não tinha fim — a página ficava re-renderizando para sempre. Um
       `MutationObserver` só fala quando o DOM realmente muda. */
    if (sections.length < ids.length) {
      const retry = new MutationObserver(() => setRetry((value) => value + 1));
      retry.observe(document.body, { childList: true, subtree: true });
      return () => retry.disconnect();
    }

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // a primeira na ordem do documento vence, para não piscar entre duas
        setActive(ids.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [ids, retryToken, enabled]);

  return active;
};
