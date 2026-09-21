import { useEffect, useState } from "react";

/**
 * Descobre qual seção está em cena, para o menu marcar onde a pessoa está.
 *
 * Usa `IntersectionObserver` com uma faixa que privilegia o miolo da tela
 * (`rootMargin` corta 45% de cima e 50% de baixo): sem isso, duas seções
 * visíveis ao mesmo tempo ficariam disputando o destaque a cada pixel de
 * scroll. Quando nenhuma está na faixa — topo da página — devolve `null`.
 */
export const useActiveSection = (ids: string[]): string | null => {
  const [active, setActive] = useState<string | null>(null);
  const [retryToken, setRetry] = useState(0);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    // As seções da home são lazy: se nenhuma existe ainda, tenta de novo
    // quando o corpo do documento mudar de tamanho.
    if (sections.length < ids.length) {
      const retry = new ResizeObserver(() => setRetry((value) => value + 1));
      retry.observe(document.body);
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
  }, [ids, retryToken]);

  return active;
};
