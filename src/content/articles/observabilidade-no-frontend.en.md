_How to stop finding out about bugs on Twitter and start seeing what actually happens to your users_

## 🎯 The frontend's invisible pain

Picture the scene: Monday, 9am. The backend is perfect. Grafana showing 99.9% uptime, logs centralized in ELK, distributed traces in Jaeger, alerts configured in PagerDuty.

Your tech lead celebrates: "We have full observability!"

At 10am, support starts filling up with messages: "I can't log in", "The buy button doesn't work", "The page goes blank".

You open the browser. It works perfectly. "Works on my machine."

You ask the user for a screenshot. They send a white screen. You ask them to open the console. They do not know what a console is. You ask them to clear the cache. They do not know how.

Three hours later, you find out: it was a JavaScript error that only happens on Safari 15, when the user has AdBlock enabled, and was connecting through the company VPN.

**You have full observability in the backend. And zero visibility in the frontend.**

That is the biggest problem in modern frontend: we treat the application as if it ended at the API. We forget that the most critical code — the one the user actually interacts with — runs in an environment you do not control.

It is like having security cameras all over the bank, except at the teller where the transactions happen.

## 🔍 What is frontend observability?

Observability is not about having logs. It is about being able to answer **quickly** the question: "what is happening to my application right now?"

In the backend, that practice has been mature for years. In the frontend? Most teams still depend on "send me a screenshot" and "clear your cache".

**Frontend observability means:**

- Knowing when, where and why the user had problems
- Detecting JavaScript errors before the user complains
- Measuring real performance, not just Lighthouse on your local dev machine
- Understanding usage patterns and problematic flows
- Correlating frontend events with the backend

It is not about collecting data. It is about having **actionable visibility** into what happens in your users' browsers.

## 🏛️ The origin: when the frontend grew too big to ignore

For a long time, frontend was treated as "just HTML and CSS". If it breaks, just hit F5. It had no state, no complex logic, no real business impact.

Companies like Google, Facebook and Netflix changed that. When you have billions of frontend interactions, every error costs real money.

In 2011, Etsy implemented one of the first robust frontend observability solutions. They realized that JavaScript bugs cost millions in lost sales — but they only found out when it was already too late.

From there, specialized tools appeared: Sentry, LogRocket, Datadog RUM, New Relic Browser. The concept was simple: **treat the frontend with the same seriousness as the backend**.

## 🧩 The three pillars of observability (in the frontend)

Just like in the backend, frontend observability rests on three pillars. But with crucial differences.

### 1. Logs (Events)

**Backend:** request logs, SQL queries, job processing.

**Frontend:** user actions, navigation, interactions, business events.

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

    // Sends to your backend/log service
    this.sendToBackend(logEntry);

    // In dev, show it in the console
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
        // Does not block the main thread
        keepalive: true,
      });
    } catch (error) {
      // Failed silently - we do not want to break the app because of a log
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

**In practice:**

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

  return <button onClick={handleCheckout}>Complete purchase</button>;
}
```

### 2. Metrics (Performance)

**Backend:** response time, throughput, CPU/memory usage.

**Frontend:** Core Web Vitals, load time, interactivity, visual stability.

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
    // Render time of critical components
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

  // Hook for React components
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

**Use in components:**

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

  return <div>{/* Your product list */}</div>;
}
```

### 3. Traces (Distributed tracing)

**Backend:** the trace of a request across multiple services.

**Frontend:** the trace of a user action across frontend → BFF → microservices.

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
    // Sends to the backend/APM
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

**Integration with API calls:**

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
        ...tracer.getTraceHeaders(), // ✅ Propagates the trace to the backend
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

**In the BFF (Node.js/Express):**

```typescript
// bff/src/middleware/tracing.ts
export function tracingMiddleware(req, res, next) {
  const traceId = req.headers["x-trace-id"];
  const parentSpanId = req.headers["x-parent-span-id"];

  // Attaches it to the request context
  req.traceContext = {
    traceId,
    parentSpanId,
    spanId: generateSpanId(),
  };

  // Logs the start of the request
  logger.info("request_received", {
    traceId,
    method: req.method,
    path: req.path,
  });

  next();
}
```

Now you have **end-to-end tracing**: from the user's click all the way to the database.

## 🚨 Error capture: beyond try/catch

Most frontend errors happen **outside your direct control**:

- Unhandled asynchronous errors
- Errors in event handlers
- Errors in React components
- Network errors
- Errors from third-party scripts

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
    // Logs the error
    logger.error("react_error_boundary", error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Custom callback
    this.props.onError?.(error, errorInfo);

    // Sends to Sentry, Datadog, etc
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
            <h1>Something went wrong</h1>
            <p>Our team has been notified and is already working on it.</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

**Strategic use:**

```typescript
// src/App.tsx
import { ErrorBoundary } from "@/observability/ErrorBoundary";

export function App() {
  return (
    <ErrorBoundary fallback={<GlobalErrorFallback />}>
      <Router>
        {/* Error boundary per route */}
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

**✅ The benefit:** if the products module breaks, checkout keeps working. The error is isolated.

### Global Error Handler

```typescript
// src/observability/globalErrorHandler.ts
import { logger } from "./logger";

export function setupGlobalErrorHandlers() {
  // Uncaught errors
  window.addEventListener("error", (event) => {
    logger.error("uncaught_error", event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      message: event.message,
    });
  });

  // Unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    logger.error("unhandled_promise_rejection", event.reason, {
      promise: event.promise,
    });
  });

  // Network errors (scripts, images, etc)
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

## 🎨 Essential patterns

### 1. User Session Replay

Replaying the user's session is a **game changer** for debugging bugs you cannot reproduce.

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

        // Sends in batches every 10 seconds
        if (this.events.length >= 50) {
          this.flush();
        }
      },
    });

    // Flush when leaving the page
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

**⚠️ Careful:** session replay captures **everything** the user does. Watch out for sensitive data (passwords, credit cards).

```typescript
// Configuration with masking
rrweb.record({
  emit: (event) => {
    /* ... */
  },
  maskAllInputs: true, // Masks every input
  maskInputOptions: {
    password: true,
    email: false,
    color: false,
  },
  blockClass: "rr-block", // Elements with this class are blocked
  ignoreClass: "rr-ignore", // Elements that are ignored
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

**Use:**

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

**Use:**

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

  return <button onClick={handleCheckout}>Complete</button>;
}
```

Now you can answer: "did feature X increase or decrease conversion?"

## 🎪 Observability in Micro Frontends + BFF

When you have micro frontends, observability becomes **even more critical** — because each MFE can break independently.

### An observability strategy per MFE

```typescript
// products-mfe/src/observability/index.ts
import { logger } from "shell/observability/logger";
import { metrics } from "shell/observability/metrics";

// Each MFE reports with its own context
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

**The shell centralizes and aggregates:**

```typescript
// shell/src/observability/dashboard.tsx
export function ObservabilityDashboard() {
  const mfeHealth = useMFEHealth(); // Hook that queries the metrics

  return (
    <div>
      <h2>Micro Frontend status</h2>
      <MFEStatus name="Products" health={mfeHealth.products} />
      <MFEStatus name="Checkout" health={mfeHealth.checkout} />
      <MFEStatus name="Profile" health={mfeHealth.profile} />
    </div>
  );
}
```

### Correlating frontend → BFF → backend

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

  // The BFF propagates the trace to the microservices
  return response.json();
}
```

**In the BFF:**

```typescript
// products-bff/src/routes/products.ts
app.get("/products", async (req, res) => {
  const traceId = req.headers["x-trace-id"];
  const mfeName = req.headers["x-mfe-name"];

  logger.info("bff:products:fetch", { traceId, mfeName });

  // Calls the microservices propagating the trace
  const [products, inventory] = await Promise.all([
    productsService.fetch({ traceId }),
    inventoryService.fetch({ traceId }),
  ]);

  res.json(products);
});
```

Now you have a **complete trace**: user click → products-mfe → products-bff → microservices.

## ✅ When should you implement frontend observability?

### Signs that you NEED it:

**1. You find out about bugs from your users**

If support reports errors before you do, observability is missing.

**2. "Works on my machine" is your default answer**

If you cannot reproduce reported bugs, you need session replay.

**3. Performance is critical to the business**

E-commerce, dashboards, financial apps — every millisecond matters.

**4. Multiple teams, micro frontends, BFF**

Distributed architecture demands distributed observability.

**5. You have an SLA/SLO for the frontend**

If you promised 99.9% uptime, you need to measure it.

### ✅ Checklist: are you ready?

- [ ] You have budget for tools (Sentry, Datadog RUM, LogRocket)
- [ ] You have a backend to receive the logs/metrics/traces
- [ ] A team willing to look at dashboards and act on alerts
- [ ] A clear privacy/data protection policy (session replay captures sensitive data)
- [ ] Performance is not degraded by the observability itself (instrumentation has a cost)

## ❌ When does it NOT make sense?

### Signs that you are going to waste your time:

**1. Small project, no real users**

An MVP, a prototype, an internal project with 10 users — `console.log` does the job.

**2. The team does not act on the data**

If nobody is going to look at the metrics or fix the problems, collecting them is pointless.

**3. No backend infrastructure**

Frontend observability without a backend to receive the data does not work.

**4. Privacy/performance concerns**

Session replay and heavy instrumentation impact performance and privacy. If that is critical, reassess.

## 🚨 Common traps

### ❌ 1. Collecting too much data

```typescript
// ❌ Do not do this
window.addEventListener("mousemove", (e) => {
  logger.info("mouse_moved", { x: e.clientX, y: e.clientY });
});
// Millions of events per second = broken backend + an absurd bill
```

**✅ Fix it: focus on business events**

```typescript
// ✅ This instead
function handleCheckout() {
  logger.info("checkout_started", { items: cart.length });
}
```

### ❌ 2. Logging sensitive information

```typescript
// ❌ NEVER do this
logger.info("user_logged_in", {
  email: user.email,
  password: form.password, // ❌❌❌
  taxId: user.taxId,
});
```

**✅ Fix it: sanitize the data**

```typescript
// ✅ This instead
logger.info("user_logged_in", {
  userId: user.id, // an ID, not personal data
  loginMethod: "email",
});
```

### ❌ 3. Blocking the main thread

```typescript
// ❌ Do not do this
function logEvent(event: string) {
  fetch("/api/logs", {
    method: "POST",
    body: JSON.stringify({ event }),
  }); // ❌ Synchronous, blocks the UI
}
```

**✅ Fix it: async + keepalive**

```typescript
// ✅ This instead
function logEvent(event: string) {
  fetch("/api/logs", {
    method: "POST",
    body: JSON.stringify({ event }),
    keepalive: true, // ✅ Does not block, works even after the page closes
  }).catch(() => {}); // Silent failure
}
```

### ❌ 4. Observability only in production

```typescript
// ❌ Do not do this
if (process.env.NODE_ENV === "production") {
  setupObservability(); // ❌ Only in prod
}
```

**✅ Fix it: test it in development too**

```typescript
// ✅ This instead
setupObservability({
  sendToBackend: process.env.NODE_ENV === "production",
  logToConsole: process.env.NODE_ENV === "development",
});
```

## 🎯 Consolidated best practices

### 1. Context is everything

Logs without context are useless.

```typescript
// ❌ Vague
logger.error("Failed to fetch");

// ✅ Specific
logger.error("products_fetch_failed", error, {
  userId: user?.id,
  filters: JSON.stringify(filters),
  endpoint: "/api/products",
  statusCode: response.status,
  traceId,
});
```

### 2. Prioritize Core Web Vitals

Google uses them as a ranking factor. The user feels the difference.

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### 3. Alert on what matters

```typescript
// ❌ Useless alert
if (errorCount > 0) {
  alert('There is an error!'); // There will always be an error
}

// ✅ Actionable alert
if (errorRate > 5%) {
  alert('Error rate above 5% in the last 10 minutes');
}
```

### 4. A dashboard is not observability

A beautiful dashboard nobody looks at solves nothing.

**✅ Good practices:**

- Automatic alerts in Slack/PagerDuty
- Weekly metric review with the team
- An SLO (Service Level Objective) defined and measured

### 5. Privacy FIRST

- Mask sensitive fields (password, credit card)
- Respect LGPD/GDPR
- Have a clear data retention policy
- Allow opting out of session replay

## 🎓 The right mindset for observability

Observability is not about having beautiful dashboards. It is about **reducing the time between an error happening and an error being fixed**.

The question is not "do we have logs?", but rather:

**"If a bug happens right now, how long until I know what it is, where it is, and why?"**

When you implement observability thinking "I need to know before the user complains", you are on the right track.

When you implement it thinking "I will log everything and see what happens", you are creating noise without value.

### The principles to take with you:

1. **Observability is about fast response, not about the amount of data**
2. **The frontend deserves the same attention as the backend**
3. **Context > log volume**
4. **Privacy is not optional**
5. **A dashboard nobody looks at is waste**

## 🎭 Conclusion: stop flying blind

The software industry invested billions in backend observability. APM, distributed tracing, centralized logs, real-time metrics.

But the frontend — where the user actually is — kept being treated as a black box.

**The problem is not a lack of tools. The problem is mindset.**

Just as in [the exam effect in code](/artigos/efeito-enem-no-codigo), where we learned to deliver without understanding, many teams learned to "make it work in dev" without knowing whether it works for the user.

And just as in [unit testing](/artigos/testes-unitarios-no-frontend), where 100% coverage does not mean confidence, logging everything does not mean visibility.

The real skill is not in having a dashboard — it is in **acting on what the data shows**.

### The final question

Before implementing observability, ask yourself:

**"If my application breaks for 10% of users right now, how long until I find out?"**

If the answer is "when support tells me", you need observability.

If the answer is "in less than 5 minutes", you understood the purpose.

---

_Observability is not about knowing everything that happens. It is about knowing **when something goes wrong, where it went wrong, and why** — before the user has to complain._

**Stop finding out about bugs on Twitter. Start finding out from your own systems.**

## 📚 References and further reading

This article was built on consolidated industry practices:

- **Charity Majors** — [Observability Engineering](https://www.honeycomb.io/observability): a pioneer of observability-driven development.

- **Google Web Vitals** — [web.dev/vitals](https://web.dev/vitals/): the essential UX metrics.

- **Sentry Documentation** — [docs.sentry.io](https://docs.sentry.io/): error tracking and performance monitoring.

- **OpenTelemetry** — [opentelemetry.io](https://opentelemetry.io/): the open-source standard for observability.

- **Datadog RUM** — [Real User Monitoring](https://www.datadoghq.com/product/real-user-monitoring/): frontend observability in production.

- **LogRocket** — [logrocket.com](https://logrocket.com/): session replay and error tracking.

- **Honeycomb** — [honeycomb.io](https://www.honeycomb.io/): observability for complex systems.

- **Martin Fowler** — [Observability](https://martinfowler.com/bliki/Observability.html): the fundamental concepts.

---

_If this article made you rethink how you monitor your frontend, it did its job. Share it with your team and let's raise the level of frontend observability._

**👏 Enjoyed it? Leave a clap and share your observability experiences in the comments!**
