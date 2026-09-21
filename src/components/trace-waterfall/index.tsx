import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import type { TraceSpan, TraceWaterfallProps } from "./types";

/**
 * Waterfall de trace em DOM puro.
 *
 * Não usa WebGL de propósito: o conteúdo aqui é informação para ler, não
 * decoração. Em DOM os rótulos são texto de verdade — nítido, selecionável,
 * traduzível e anunciado por leitor de tela — e a lista continua legível sem
 * JavaScript de layout, em qualquer largura.
 *
 * As barras são `aria-hidden` (são a forma visual do dado, não o dado).
 * Cada linha traz nome e serviço como texto visível e a duração em `sr-only`,
 * sem repetição — e a seção abre com um resumo do trace inteiro em `sr-only`.
 */

/** Tons derivados de primary-500; o índice vem da ordem de aparição do serviço. */
const SERVICE_TONES = [
  "bg-primary-500",
  "bg-primary-700",
  "bg-primary-400",
  "bg-primary-800",
  "bg-primary-300",
  "bg-secondary-600",
];

const depthOf = (span: TraceSpan, byId: Map<string, TraceSpan>): number => {
  let depth = 0;
  let current = span.parentSpanId;
  while (current) {
    depth += 1;
    current = byId.get(current)?.parentSpanId ?? null;
  }
  return depth;
};

export const TraceWaterfall: React.FC<TraceWaterfallProps> = ({
  trace,
  summary,
  labels,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  const { rows, totalMs, tones } = useMemo(() => {
    const byId = new Map(trace.spans.map((span) => [span.spanId, span]));

    const services = [...new Set(trace.spans.map((span) => span.service))];
    const toneByService = new Map(
      services.map((service, index) => [
        service,
        SERVICE_TONES[index % SERVICE_TONES.length],
      ])
    );

    const total = trace.spans.reduce(
      (max, span) => Math.max(max, span.startOffsetMs + span.durationMs),
      0
    );

    // ordem temporal: é assim que um trace chega de verdade
    const ordered = [...trace.spans].sort(
      (a, b) => a.startOffsetMs - b.startOffsetMs
    );

    return {
      rows: ordered.map((span) => ({ span, depth: depthOf(span, byId) })),
      totalMs: total || 1,
      tones: toneByService,
    };
  }, [trace]);

  // Os spans só começam a chegar quando a seção entra em cena.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-5xl">
      <p className="sr-only">{summary}</p>

      <ol className="flex flex-col gap-1.5">
        {rows.map(({ span, depth }, index) => (
          <li
            key={span.spanId}
            className="grid grid-cols-[minmax(0,11rem)_1fr] items-center gap-3 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-6"
          >
            <div
              className="min-w-0"
              style={{ paddingInlineStart: `${depth * 0.75}rem` }}
            >
              <p className="truncate font-poppins text-body-xs md:text-body-sm text-gray-900">
                {span.name}
              </p>
              <p className="truncate font-poppins text-label-md text-gray-600">
                {span.service}
              </p>
            </div>

            <div className="relative h-5 rounded bg-secondary-50" aria-hidden="true">
              <div
                className={clsx(
                  "absolute inset-y-0 rounded",
                  "origin-left transition-transform duration-500 ease-out",
                  tones.get(span.service),
                  revealed ? "scale-x-100" : "scale-x-0"
                )}
                style={{
                  left: `${(span.startOffsetMs / totalMs) * 100}%`,
                  // mínimo de 0.6% para spans muito curtos não sumirem
                  width: `${Math.max((span.durationMs / totalMs) * 100, 0.6)}%`,
                  transitionDelay: revealed ? `${index * 45}ms` : "0ms",
                }}
              />
            </div>

            {/* Complementa o texto visível em vez de repeti-lo: nome e serviço
                já são lidos acima, então aqui vai só o que a barra comunica. */}
            <span className="sr-only">
              {labels.duration}: {span.durationMs}ms
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};
