import { useEffect, useState } from "react";

/**
 * Barra de progresso de leitura no topo.
 *
 * Só aparece quando o artigo é mais alto que a viewport, e é `aria-hidden`:
 * é uma pista visual do quanto falta, não informação que precise ser lida.
 * A conta roda em `requestAnimationFrame` a partir de um listener passivo,
 * para o scroll não engasgar.
 */
export const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable <= 0 ? 0 : window.scrollY / scrollable);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-primary-500 to-primary-900"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
};
