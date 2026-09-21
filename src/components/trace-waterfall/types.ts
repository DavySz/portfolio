export type SpanKind = "server" | "client" | "internal" | "producer";

/** Subconjunto do modelo de span do OpenTelemetry que a visualização usa. */
export interface TraceSpan {
  spanId: string;
  parentSpanId: string | null;
  name: string;
  kind: SpanKind;
  service: string;
  startOffsetMs: number;
  durationMs: number;
}

export interface Trace {
  traceId: string;
  spans: TraceSpan[];
}

export interface TraceWaterfallProps {
  trace: Trace;
  /** Descrição lida por leitor de tela antes da lista de spans. */
  summary: string;
  labels: {
    duration: string;
  };
}
