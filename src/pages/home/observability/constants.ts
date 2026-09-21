import type { Trace } from "../../../components/trace-waterfall/types";

/**
 * Trace INVENTADO, só para ilustrar a leitura de um waterfall.
 * Nenhum nome de serviço, rota, métrica ou duração vem de sistema real.
 */
export const SAMPLE_TRACE: Trace = {
  traceId: "4f1c0a9b7e2d48c6a3f501b8d7e6c210",
  spans: [
    { spanId: "01", parentSpanId: null, name: "GET /checkout", kind: "server", service: "gateway", startOffsetMs: 0, durationMs: 418 },
    { spanId: "02", parentSpanId: "01", name: "gateway.ratelimit", kind: "internal", service: "gateway", startOffsetMs: 1, durationMs: 3 },
    { spanId: "03", parentSpanId: "01", name: "auth.verify", kind: "client", service: "auth", startOffsetMs: 5, durationMs: 41 },
    { spanId: "04", parentSpanId: "03", name: "session.load", kind: "client", service: "auth", startOffsetMs: 9, durationMs: 14 },
    { spanId: "05", parentSpanId: "01", name: "cart.fetch", kind: "client", service: "cart", startOffsetMs: 50, durationMs: 48 },
    { spanId: "06", parentSpanId: "05", name: "cart.cache.get", kind: "internal", service: "cart", startOffsetMs: 52, durationMs: 4 },
    { spanId: "07", parentSpanId: "05", name: "cart.db.query", kind: "client", service: "cart", startOffsetMs: 57, durationMs: 32 },
    { spanId: "08", parentSpanId: "01", name: "catalog.enrich", kind: "client", service: "catalog", startOffsetMs: 100, durationMs: 86 },
    { spanId: "09", parentSpanId: "08", name: "catalog.db.query", kind: "client", service: "catalog", startOffsetMs: 104, durationMs: 36 },
    { spanId: "10", parentSpanId: "08", name: "catalog.cache.get", kind: "internal", service: "catalog", startOffsetMs: 142, durationMs: 8 },
    { spanId: "11", parentSpanId: "01", name: "pricing.quote", kind: "client", service: "pricing", startOffsetMs: 188, durationMs: 58 },
    { spanId: "12", parentSpanId: "11", name: "pricing.rules.eval", kind: "internal", service: "pricing", startOffsetMs: 192, durationMs: 38 },
    { spanId: "13", parentSpanId: "01", name: "risk.score", kind: "client", service: "risk", startOffsetMs: 190, durationMs: 78 },
    { spanId: "14", parentSpanId: "13", name: "risk.features.load", kind: "client", service: "risk", startOffsetMs: 194, durationMs: 34 },
    { spanId: "15", parentSpanId: "01", name: "ledger.reserve", kind: "client", service: "ledger", startOffsetMs: 270, durationMs: 80 },
    { spanId: "16", parentSpanId: "15", name: "ledger.db.tx", kind: "client", service: "ledger", startOffsetMs: 276, durationMs: 68 },
    { spanId: "17", parentSpanId: "01", name: "payment.authorize", kind: "client", service: "payment", startOffsetMs: 352, durationMs: 48 },
    { spanId: "18", parentSpanId: "17", name: "payment.tokenize", kind: "internal", service: "payment", startOffsetMs: 354, durationMs: 12 },
    { spanId: "19", parentSpanId: "01", name: "notify.send", kind: "producer", service: "notify", startOffsetMs: 402, durationMs: 8 },
    { spanId: "20", parentSpanId: "01", name: "audit.append", kind: "internal", service: "audit", startOffsetMs: 404, durationMs: 12 },
  ],
};
