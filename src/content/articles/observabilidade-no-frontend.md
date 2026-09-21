_Como parar de descobrir bugs pelo Twitter e começar a enxergar o que realmente acontece com seus usuários_

## 🎯 A dor invisível do frontend

Imagine a seguinte cena: segunda-feira, 9h da manhã. O backend está perfeito. Grafana mostrando 99.9% de uptime, logs centralizados no ELK, traces distribuídos no Jaeger, alertas configurados no PagerDuty.

Seu tech lead celebra: "Temos observabilidade completa!"

Às 10h, começa a chover mensagem no suporte: "Não consigo fazer login", "O botão de comprar não funciona", "A página fica em branco".

Você abre o navegador. Funciona perfeitamente. "No meu funciona."

Pede pro usuário mandar print. Ele manda uma tela branca. Você pede pra abrir o console. Ele não sabe o que é console. Você pede pra limpar o cache. Ele não sabe como.

Três horas depois, você descobre: era um erro de JavaScript que só acontece no Safari 15, quando o usuário tem AdBlock ativo, e estava acessando pela VPN da empresa.

**Você tem observabilidade completa no backend. E zero visibilidade no frontend.**

Esse é o maior problema do frontend moderno: tratamos a aplicação como se terminasse na API. Esquecemos que o código mais crítico — aquele que o usuário realmente interage — roda num ambiente que você não controla.

É como ter câmeras de segurança em todo o banco, exceto no caixa onde as transações acontecem.

## 🔍 O que é observabilidade no frontend?

Observabilidade não é sobre ter logs. É sobre conseguir responder **rapidamente** à pergunta: "O que está acontecendo com minha aplicação agora?"

No backend, essa prática é madura há anos. No frontend? A maioria dos times ainda depende de "me manda um print" e "limpa o cache".

**Observabilidade no frontend significa:**

- Saber quando, onde e por que o usuário teve problemas
- Detectar erros de JavaScript antes do usuário reclamar
- Medir performance real, não só Lighthouse no dev local
- Entender padrões de uso e fluxos problemáticos
- Correlacionar eventos do frontend com o backend

Não é sobre coletar dados. É sobre ter **visibilidade acionável** do que acontece no browser dos seus usuários.

## 🏛️ A origem: quando o frontend cresceu demais para ser ignorado

Por muito tempo, frontend foi tratado como "só HTML e CSS". Se quebrar, é só dar F5. Não tinha estado, não tinha lógica complexa, não tinha impacto real no negócio.

Empresas como Google, Facebook e Netflix mudaram isso. Quando você tem bilhões de interações no frontend, cada erro custa dinheiro real.

Em 2011, o Etsy implementou uma das primeiras soluções robustas de observabilidade frontend. Eles perceberam que bugs no JavaScript custavam milhões em vendas perdidas — mas só descobriam quando já era tarde.

A partir daí, surgiram ferramentas especializadas: Sentry, LogRocket, Datadog RUM, New Relic Browser. O conceito era simples: **tratar o frontend com a mesma seriedade que o backend**.

## 🧩 Os três pilares da observabilidade (no frontend)

Assim como no backend, observabilidade no frontend se apoia em três pilares. Mas com diferenças cruciais.

### 1. Logs (Events)

**Backend:** Logs de requisições, queries SQL, processamento de jobs.

**Frontend:** Ações do usuário, navegação, interações, eventos de negócio.

```typescript
// src/observability/logger.ts
export enum LogLevel {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

interface LogContext {
  userId?: string;
  sessionId: string;
  route: string;
  userAgent: string;
  timestamp: number;
}

class Logger {
  private context: LogContext;

  constructor() {
    this.context = {
      sessionId: this.generateSessionId(),
      route: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  log(level: LogLevel, message: string, data?: Record<string, any>) {
    const logEntry = {
      level,
      message,
      ...this.context,
      ...data,
      timestamp: Date.now(),
    };

    // Envia para seu backend/serviço de logs
    this.sendToBackend(logEntry);

    // Em dev, mostra no console
    if (process.env.NODE_ENV === "development") {
      console.log(`[${level}]`, message, data);
    }
  }

  private async sendToBackend(entry: any) {
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
        // Não bloqueia a thread principal
        keepalive: true,
      });
    } catch (error) {
      // Falhou silenciosamente - não queremos quebrar a app por causa de log
      console.warn("Failed to send log", error);
    }
  }

  info(message: string, data?: Record<string, any>) {
    this.log(LogLevel.INFO, message, data);
  }

  warning(message: string, data?: Record<string, any>) {
    this.log(LogLevel.WARNING, message, data);
  }

  error(message: string, error?: Error, data?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, {
      ...data,
      error: error?.message,
      stack: error?.stack,
    });
  }
}

export const logger = new Logger();
```

**Uso prático:**

```typescript
// src/components/CheckoutButton.tsx
import { logger } from "@/observability/logger";

export function CheckoutButton({ cart }: Props) {
  const handleCheckout = async () => {
    logger.info("checkout_started", {
      itemCount: cart.items.length,
      totalValue: cart.total,
    });

    try {
      await processCheckout(cart);

      logger.info("checkout_completed", {
        orderId: result.id,
        totalValue: cart.total,
      });
    } catch (error) {
      logger.error("checkout_failed", error as Error, {
        itemCount: cart.items.length,
        totalValue: cart.total,
      });
    }
  };

  return <button onClick={handleCheckout}>Finalizar Compra</button>;
}
```

### 2. Métricas (Performance)

**Backend:** Tempo de resposta, throughput, uso de CPU/memória.

**Frontend:** Core Web Vitals, tempo de carregamento, interatividade, estabilidade visual.

```typescript
// src/observability/metrics.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from "web-vitals";

interface Metric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
}

class MetricsCollector {
  private metrics: Metric[] = [];

  constructor() {
    this.setupWebVitals();
    this.setupCustomMetrics();
  }

  private setupWebVitals() {
    // Largest Contentful Paint
    onLCP((metric) => {
      this.recordMetric({
        name: "LCP",
        value: metric.value,
        rating: metric.rating,
      });
    });

    // First Input Delay
    onFID((metric) => {
      this.recordMetric({
        name: "FID",
        value: metric.value,
        rating: metric.rating,
      });
    });

    // Cumulative Layout Shift
    onCLS((metric) => {
      this.recordMetric({
        name: "CLS",
        value: metric.value,
        rating: metric.rating,
      });
    });

    // First Contentful Paint
    onFCP((metric) => {
      this.recordMetric({
        name: "FCP",
        value: metric.value,
        rating: metric.rating,
      });
    });

    // Time to First Byte
    onTTFB((metric) => {
      this.recordMetric({
        name: "TTFB",
        value: metric.value,
        rating: metric.rating,
      });
    });
  }

  private setupCustomMetrics() {
    // Tempo de renderização de componentes críticos
    if (window.performance && window.performance.measure) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: entry.name,
            value: entry.duration,
            rating: entry.duration < 100 ? "good" : "needs-improvement",
          });
        }
      });

      observer.observe({ entryTypes: ["measure"] });
    }
  }

  recordMetric(metric: Metric) {
    this.metrics.push(metric);
    this.sendToBackend(metric);
  }

  // Hook para componentes React
  measureRender(componentName: string) {
    return {
      start: () => performance.mark(`${componentName}-start`),
      end: () => {
        performance.mark(`${componentName}-end`);
        performance.measure(
          `${componentName}-render`,
          `${componentName}-start`,
          `${componentName}-end`
        );
      },
    };
  }

  private async sendToBackend(metric: Metric) {
    try {
      await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...metric,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
        keepalive: true,
      });
    } catch (error) {
      console.warn("Failed to send metric", error);
    }
  }
}

export const metrics = new MetricsCollector();
```

**Uso em componentes:**

```typescript
// src/components/ProductList.tsx
import { useEffect } from "react";
import { metrics } from "@/observability/metrics";

export function ProductList() {
  useEffect(() => {
    const measurement = metrics.measureRender("ProductList");
    measurement.start();

    return () => {
      measurement.end();
    };
  }, []);

  return <div>{/* Sua lista de produtos */}</div>;
}
```

### 3. Traces (Rastreamento distribuído)

**Backend:** Trace de uma request através de múltiplos serviços.

**Frontend:** Trace de uma ação do usuário através do frontend → BFF → microsserviços.

```typescript
// src/observability/tracer.ts
export class Tracer {
  private traceId: string | null = null;
  private spanId: string | null = null;

  startTrace(operationName: string): string {
    this.traceId = this.generateId();
    this.spanId = this.generateId();

    this.recordSpan({
      traceId: this.traceId,
      spanId: this.spanId,
      operationName,
      startTime: Date.now(),
    });

    return this.traceId;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  getTraceHeaders(): Record<string, string> {
    if (!this.traceId || !this.spanId) {
      return {};
    }

    return {
      "X-Trace-Id": this.traceId,
      "X-Span-Id": this.spanId,
      "X-Parent-Span-Id": this.spanId,
    };
  }

  endTrace() {
    if (this.traceId && this.spanId) {
      this.recordSpan({
        traceId: this.traceId,
        spanId: this.spanId,
        endTime: Date.now(),
      });
    }

    this.traceId = null;
    this.spanId = null;
  }

  private recordSpan(span: any) {
    // Envia para backend/APM
    fetch("/api/traces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(span),
      keepalive: true,
    }).catch(console.warn);
  }
}

export const tracer = new Tracer();
```

**Integração com chamadas de API:**

```typescript
// src/services/api.ts
import { tracer } from "@/observability/tracer";
import { logger } from "@/observability/logger";

export async function fetchProducts(filters: ProductFilters) {
  const traceId = tracer.startTrace("fetch_products");

  try {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...tracer.getTraceHeaders(), // ✅ Propaga trace pro backend
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    logger.info("products_fetched", {
      traceId,
      count: data.length,
      filters,
    });

    return data;
  } catch (error) {
    logger.error("products_fetch_failed", error as Error, {
      traceId,
      filters,
    });
    throw error;
  } finally {
    tracer.endTrace();
  }
}
```

**No BFF (Node.js/Express):**

```typescript
// bff/src/middleware/tracing.ts
export function tracingMiddleware(req, res, next) {
  const traceId = req.headers["x-trace-id"];
  const parentSpanId = req.headers["x-parent-span-id"];

  // Anexa ao contexto da request
  req.traceContext = {
    traceId,
    parentSpanId,
    spanId: generateSpanId(),
  };

  // Loga início da request
  logger.info("request_received", {
    traceId,
    method: req.method,
    path: req.path,
  });

  next();
}
```

Agora você tem **rastreamento ponta a ponta**: do clique do usuário até o banco de dados.

## 🚨 Captura de erros: além do try/catch

A maioria dos erros no frontend acontece **fora do seu controle direto**:

- Erros assíncronos não tratados
- Erros em event handlers
- Erros em componentes React
- Erros de network
- Erros de third-party scripts

### Error Boundary (React)

```typescript
// src/observability/ErrorBoundary.tsx
import React, { Component, ReactNode } from "react";
import { logger } from "./logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Loga o erro
    logger.error("react_error_boundary", error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Callback customizado
    this.props.onError?.(error, errorInfo);

    // Envia para Sentry, Datadog, etc
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div>
            <h1>Algo deu errado</h1>
            <p>Nosso time foi notificado e já está trabalhando nisso.</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

**Uso estratégico:**

```typescript
// src/App.tsx
import { ErrorBoundary } from "@/observability/ErrorBoundary";

export function App() {
  return (
    <ErrorBoundary fallback={<GlobalErrorFallback />}>
      <Router>
        {/* Error boundary por rota */}
        <ErrorBoundary fallback={<ProductsErrorFallback />}>
          <Route path="/products/*" element={<ProductsApp />} />
        </ErrorBoundary>

        <ErrorBoundary fallback={<CheckoutErrorFallback />}>
          <Route path="/checkout/*" element={<CheckoutApp />} />
        </ErrorBoundary>
      </Router>
    </ErrorBoundary>
  );
}
```

**✅ Benefício:** Se o módulo de produtos quebrar, o checkout continua funcionando. Erro isolado.

### Global Error Handler

```typescript
// src/observability/globalErrorHandler.ts
import { logger } from "./logger";

export function setupGlobalErrorHandlers() {
  // Erros não capturados
  window.addEventListener("error", (event) => {
    logger.error("uncaught_error", event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      message: event.message,
    });
  });

  // Promises rejeitadas não tratadas
  window.addEventListener("unhandledrejection", (event) => {
    logger.error("unhandled_promise_rejection", event.reason, {
      promise: event.promise,
    });
  });

  // Erros de network (scripts, imagens, etc)
  window.addEventListener(
    "error",
    (event) => {
      const target = event.target as HTMLElement;

      if (target.tagName === "SCRIPT" || target.tagName === "LINK") {
        logger.error(
          "resource_load_failed",
          new Error("Resource failed to load"),
          {
            tagName: target.tagName,
            src: (target as any).src || (target as any).href,
          }
        );
      }
    },
    true // Capture phase
  );
}

// src/index.tsx
setupGlobalErrorHandlers();
```

## 🎨 Patterns essenciais

### 1. User Session Replay

Reproduzir a sessão do usuário é **game changer** para debugar bugs que você não consegue reproduzir.

```typescript
// src/observability/sessionRecorder.ts
import rrweb from "rrweb";

class SessionRecorder {
  private events: any[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startRecording();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  private startRecording() {
    rrweb.record({
      emit: (event) => {
        this.events.push(event);

        // Envia em batches a cada 10 segundos
        if (this.events.length >= 50) {
          this.flush();
        }
      },
    });

    // Flush ao sair da página
    window.addEventListener("beforeunload", () => {
      this.flush();
    });
  }

  private flush() {
    if (this.events.length === 0) return;

    fetch("/api/session-replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: this.sessionId,
        events: this.events,
        url: window.location.href,
        timestamp: Date.now(),
      }),
      keepalive: true,
    }).catch(console.warn);

    this.events = [];
  }
}

export const sessionRecorder = new SessionRecorder();
```

**⚠️ Atenção:** Session replay captura **tudo** que o usuário faz. Cuidado com dados sensíveis (senhas, cartão de crédito).

```typescript
// Configuração com mascaramento
rrweb.record({
  emit: (event) => {
    /* ... */
  },
  maskAllInputs: true, // Mascara todos os inputs
  maskInputOptions: {
    password: true,
    email: false,
    color: false,
  },
  blockClass: "rr-block", // Elementos com essa classe são bloqueados
  ignoreClass: "rr-ignore", // Elementos ignorados
});
```

### 2. Performance Monitoring Pattern

```typescript
// src/observability/performanceMonitor.ts
class PerformanceMonitor {
  measureAsyncOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();

    return operation()
      .then((result) => {
        const duration = performance.now() - startTime;

        metrics.recordMetric({
          name: `${operationName}_duration`,
          value: duration,
          rating: duration < 1000 ? "good" : "needs-improvement",
        });

        logger.info(`${operationName}_completed`, { duration });

        return result;
      })
      .catch((error) => {
        const duration = performance.now() - startTime;

        logger.error(`${operationName}_failed`, error, { duration });

        throw error;
      });
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

**Uso:**

```typescript
// src/services/api.ts
export async function fetchProducts() {
  return performanceMonitor.measureAsyncOperation(
    "fetch_products",
    async () => {
      const response = await fetch("/api/products");
      return response.json();
    }
  );
}
```

### 3. Feature Flag Observability

```typescript
// src/observability/featureFlags.ts
interface FeatureFlag {
  name: string;
  enabled: boolean;
  variant?: string;
}

class FeatureFlagTracker {
  trackFlag(flag: FeatureFlag) {
    logger.info("feature_flag_evaluated", {
      flagName: flag.name,
      enabled: flag.enabled,
      variant: flag.variant,
    });
  }

  trackFlagImpact(
    flagName: string,
    action: string,
    outcome: "success" | "failure"
  ) {
    logger.info("feature_flag_impact", {
      flagName,
      action,
      outcome,
    });
  }
}

export const featureFlagTracker = new FeatureFlagTracker();
```

**Uso:**

```typescript
// src/components/CheckoutButton.tsx
export function CheckoutButton() {
  const expressCheckoutEnabled = useFeatureFlag("express-checkout");

  useEffect(() => {
    featureFlagTracker.trackFlag({
      name: "express-checkout",
      enabled: expressCheckoutEnabled,
    });
  }, [expressCheckoutEnabled]);

  const handleCheckout = async () => {
    try {
      await processCheckout();

      featureFlagTracker.trackFlagImpact(
        "express-checkout",
        "checkout",
        "success"
      );
    } catch (error) {
      featureFlagTracker.trackFlagImpact(
        "express-checkout",
        "checkout",
        "failure"
      );
    }
  };

  return <button onClick={handleCheckout}>Finalizar</button>;
}
```

Agora você consegue responder: "A feature X aumentou ou diminuiu conversão?"

## 🎪 Observabilidade em Micro Frontends + BFF

Quando você tem micro frontends, observabilidade fica **ainda mais crítica** — porque cada MFE pode quebrar independentemente.

### Estratégia de observabilidade por MFE

```typescript
// products-mfe/src/observability/index.ts
import { logger } from "shell/observability/logger";
import { metrics } from "shell/observability/metrics";

// Cada MFE reporta com contexto próprio
export const productsMFELogger = {
  info: (message: string, data?: any) => {
    logger.info(message, { ...data, mfe: "products" });
  },
  error: (message: string, error?: Error, data?: any) => {
    logger.error(message, error, { ...data, mfe: "products" });
  },
};

export const productsMFEMetrics = {
  record: (metric: Metric) => {
    metrics.recordMetric({ ...metric, mfe: "products" });
  },
};
```

**Shell centraliza e agrega:**

```typescript
// shell/src/observability/dashboard.tsx
export function ObservabilityDashboard() {
  const mfeHealth = useMFEHealth(); // Hook que consulta métricas

  return (
    <div>
      <h2>Status dos Micro Frontends</h2>
      <MFEStatus name="Products" health={mfeHealth.products} />
      <MFEStatus name="Checkout" health={mfeHealth.checkout} />
      <MFEStatus name="Profile" health={mfeHealth.profile} />
    </div>
  );
}
```

### Correlação frontend → BFF → backend

```typescript
// products-mfe/src/services/api.ts
export async function fetchProducts() {
  const traceId = tracer.startTrace("products:fetch");

  const response = await fetch(`${BFF_URL}/products`, {
    headers: {
      "X-Trace-Id": traceId,
      "X-MFE-Name": "products",
      "X-MFE-Version": process.env.MFE_VERSION,
    },
  });

  // BFF propaga trace pros microsserviços
  return response.json();
}
```

**No BFF:**

```typescript
// products-bff/src/routes/products.ts
app.get("/products", async (req, res) => {
  const traceId = req.headers["x-trace-id"];
  const mfeName = req.headers["x-mfe-name"];

  logger.info("bff:products:fetch", { traceId, mfeName });

  // Chama microsserviços propagando trace
  const [products, inventory] = await Promise.all([
    productsService.fetch({ traceId }),
    inventoryService.fetch({ traceId }),
  ]);

  res.json(products);
});
```

Agora você tem **trace completo**: clique do usuário → products-mfe → products-bff → microsserviços.

## ✅ Quando implementar observabilidade no frontend?

### Sinais de que você PRECISA:

**1. Você descobre bugs pelos usuários**

Se o suporte reporta erros antes de você, falta observabilidade.

**2. "No meu funciona" é sua resposta padrão**

Se você não consegue reproduzir bugs reportados, precisa de session replay.

**3. Performance é crítica para o negócio**

E-commerce, dashboards, apps financeiros — cada milissegundo importa.

**4. Múltiplos times, micro frontends, BFF**

Arquitetura distribuída exige observabilidade distribuída.

**5. Você tem SLA/SLO para o frontend**

Se prometeu 99.9% de uptime, precisa medir.

### ✅ Checklist: você está pronto?

- [ ] Tem budget para ferramentas (Sentry, Datadog RUM, LogRocket)
- [ ] Tem backend para receber logs/métricas/traces
- [ ] Time disposto a olhar dashboards e agir sobre alertas
- [ ] Política clara sobre privacidade/LGPD (session replay captura dados sensíveis)
- [ ] Performance não é degradada pela observabilidade (instrumentação tem custo)

## ❌ Quando NÃO faz sentido?

### Sinais de que você vai desperdiçar tempo:

**1. Projeto pequeno, sem usuários reais**

MVP, protótipo, projeto interno de 10 usuários — `console.log` resolve.

**2. Time não age sobre os dados**

Se ninguém vai olhar as métricas ou resolver os problemas, não adianta coletar.

**3. Falta de infraestrutura backend**

Observabilidade frontend sem backend pra receber os dados não funciona.

**4. Preocupações com privacidade/performance**

Session replay e instrumentação pesada impactam performance e privacidade. Se isso é crítico, reavalie.

## 🚨 Armadilhas comuns

### ❌ 1. Coletar dados demais

```typescript
// ❌ Não faça isso
window.addEventListener("mousemove", (e) => {
  logger.info("mouse_moved", { x: e.clientX, y: e.clientY });
});
// Milhões de eventos por segundo = backend quebrado + conta absurda
```

**✅ Corrija: Foque em eventos de negócio**

```typescript
// ✅ Isso sim
function handleCheckout() {
  logger.info("checkout_started", { items: cart.length });
}
```

### ❌ 2. Logar informações sensíveis

```typescript
// ❌ NUNCA faça isso
logger.info("user_logged_in", {
  email: user.email,
  password: form.password, // ❌❌❌
  cpf: user.cpf,
});
```

**✅ Corrija: Sanitize dados**

```typescript
// ✅ Isso sim
logger.info("user_logged_in", {
  userId: user.id, // ID, não dados pessoais
  loginMethod: "email",
});
```

### ❌ 3. Bloquear thread principal

```typescript
// ❌ Não faça isso
function logEvent(event: string) {
  fetch("/api/logs", {
    method: "POST",
    body: JSON.stringify({ event }),
  }); // ❌ Síncrono, bloqueia UI
}
```

**✅ Corrija: Async + keepalive**

```typescript
// ✅ Isso sim
function logEvent(event: string) {
  fetch("/api/logs", {
    method: "POST",
    body: JSON.stringify({ event }),
    keepalive: true, // ✅ Não bloqueia, funciona até depois de fechar a página
  }).catch(() => {}); // Falha silenciosa
}
```

### ❌ 4. Observabilidade só em produção

```typescript
// ❌ Não faça isso
if (process.env.NODE_ENV === "production") {
  setupObservability(); // ❌ Só em prod
}
```

**✅ Corrija: Teste em desenvolvimento também**

```typescript
// ✅ Isso sim
setupObservability({
  sendToBackend: process.env.NODE_ENV === "production",
  logToConsole: process.env.NODE_ENV === "development",
});
```

## 🎯 Melhores práticas consolidadas

### 1. Contexto é tudo

Logs sem contexto são inúteis.

```typescript
// ❌ Vago
logger.error("Failed to fetch");

// ✅ Específico
logger.error("products_fetch_failed", error, {
  userId: user?.id,
  filters: JSON.stringify(filters),
  endpoint: "/api/products",
  statusCode: response.status,
  traceId,
});
```

### 2. Priorize Core Web Vitals

Google usa como fator de ranking. Usuário sente a diferença.

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### 3. Alerte sobre o que importa

```typescript
// ❌ Alerta inútil
if (errorCount > 0) {
  alert('Tem erro!'); // Sempre vai ter erro
}

// ✅ Alerta acionável
if (errorRate > 5%) {
  alert('Taxa de erro acima de 5% nos últimos 10 minutos');
}
```

### 4. Dashboard != observabilidade

Dashboard bonito que ninguém olha não resolve nada.

**✅ Boas práticas:**

- Alertas automáticos no Slack/PagerDuty
- Revisão semanal de métricas com o time
- SLO (Service Level Objective) definido e medido

### 5. Privacidade FIRST

- Máscara campos sensíveis (senha, cartão de crédito)
- Respeite LGPD/GDPR
- Tenha política clara de retenção de dados
- Permita opt-out de session replay

## 🎓 O mindset certo para observabilidade

Observabilidade não é sobre ter dashboards bonitos. É sobre **reduzir o tempo entre erro acontecer e erro ser corrigido**.

A pergunta não é "temos logs?", mas sim:

**"Se um bug acontecer agora, quanto tempo até eu saber o que é, onde é, e por quê?"**

Quando você implementa observabilidade pensando "preciso saber antes do usuário reclamar", você está no caminho certo.

Quando você implementa pensando "vou logar tudo e ver o que acontece", você está criando ruído sem valor.

### Os princípios para levar:

1. **Observabilidade é sobre resposta rápida, não sobre quantidade de dados**
2. **Frontend merece a mesma atenção que backend**
3. **Contexto > volume de logs**
4. **Privacidade não é opcional**
5. **Dashboard que ninguém olha é desperdício**

## 🎭 Conclusão: pare de voar às cegas

A indústria de software investiu bilhões em observabilidade backend. APM, distributed tracing, logs centralizados, métricas em tempo real.

Mas o frontend — onde o usuário realmente está — continuou sendo tratado como caixa preta.

**O problema não é falta de ferramentas. O problema é mentalidade.**

Assim como no [efeito ENEM no código](O%20efeito%20ENEM%20no%20código%20como%20estudar%20para%20passar%20criou%20uma%20geração%20de%20devs%20inseguros.md), onde aprendemos a entregar sem entender, muitos times aprenderam a "fazer funcionar no dev" sem saber se funciona pro usuário.

E assim como em [testes unitários](Testes%20Unitários%20no%20Frontend%20a%20arte%20de%20testar%20o%20que%20importa.md), onde cobertura 100% não significa confiança, logar tudo não significa visibilidade.

A verdadeira habilidade não está em ter dashboard — está em **agir sobre o que os dados mostram**.

### A pergunta final

Antes de implementar observabilidade, pergunte-se:

**"Se minha aplicação quebrar para 10% dos usuários agora, quanto tempo até eu descobrir?"**

Se a resposta for "quando o suporte avisar", você precisa de observabilidade.

Se a resposta for "em menos de 5 minutos", você entendeu o propósito.

---

_Observabilidade não é sobre saber tudo que acontece. É sobre saber **quando algo dá errado, onde deu errado, e por que deu errado** — antes do usuário precisar reclamar._

**Pare de descobrir bugs pelo Twitter. Comece a descobrir pelos seus próprios sistemas.**

## 📚 Referências e aprofundamento

Este artigo foi construído com base em práticas consolidadas da indústria:

- **Charity Majors** — [Observability Engineering](https://www.honeycomb.io/observability): pioneira em observability-driven development.

- **Google Web Vitals** — [web.dev/vitals](https://web.dev/vitals/): métricas essenciais de UX.

- **Sentry Documentation** — [docs.sentry.io](https://docs.sentry.io/): error tracking e performance monitoring.

- **OpenTelemetry** — [opentelemetry.io](https://opentelemetry.io/): padrão open-source para observabilidade.

- **Datadog RUM** — [Real User Monitoring](https://www.datadoghq.com/product/real-user-monitoring/): observabilidade frontend em produção.

- **LogRocket** — [logrocket.com](https://logrocket.com/): session replay e error tracking.

- **Honeycomb** — [honeycomb.io](https://www.honeycomb.io/): observability para sistemas complexos.

- **Martin Fowler** — [Observability](https://martinfowler.com/bliki/Observability.html): conceitos fundamentais.

---

_Se este artigo te fez repensar como você monitora seu frontend, ele cumpriu seu papel. Compartilhe com seu time e vamos elevar o nível da observabilidade no frontend brasileiro._

**👏 Gostou? Deixe um clap e compartilhe suas experiências com observabilidade nos comentários!**
