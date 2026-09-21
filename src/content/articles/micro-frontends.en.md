_How to turn your giant frontend into independent, scalable applications maintained by autonomous teams_

## 🎯 The pain no tutorial tells you about

Picture the scene: Monday, 9am. Frontend team standup.

**Dev 1:** "I won't get my PR up today because João hasn't merged his yet and it'll be a huge conflict in `App.tsx`."

**Dev 2:** "I'm blocked because I need a feature from the payments module, but the team that owns it is on another sprint."

**Dev 3:** "I refactored the routing system and broke three features from other teams. I'm going to have to revert everything."

**Tech Lead:** "Folks, let's stop deploying for today. The build is taking 23 minutes and we don't know which commit broke the app."

That is not fiction. It is the daily reality of thousands of teams that built a **frontend monolith**.

While the backend split into microservices years ago, the frontend kept being treated as a single, indivisible and ever-growing block. It is like trying to throw a party for 500 people in a 500-square-foot apartment — technically possible, but absolutely unsustainable.

And then comes the question that changes everything: **what if each team could have its own frontend?**

## 🏛️ The origin: when Spotify said "enough dependencies"

In 2016, Spotify's engineers were facing a classic scale problem: hundreds of developers working in the same frontend repository. Every deploy was a traumatic event. Every refactor, a political negotiation between teams.

The solution they found was revolutionary in its simplicity: **split the frontend into independent pieces**, each one owned by a specific team.

Spotify did not invent the concept — companies like Ikea, Zalando and ThoughtWorks were already experimenting with similar ideas — but they were the ones who popularized the term **Micro Frontend** and showed it was possible to apply the same microservice principles in the frontend.

The promise was simple and powerful:

"Each team develops, tests and deploys its piece of the frontend completely independently."

## 🧩 What is a Micro Frontend in practice?

A Micro Frontend is an architecture where you split your frontend application into **small independent pieces**, each one:

- Developed and maintained by a specific team
- With its own repository and deploy pipeline
- Potentially using different technologies
- Integrated at runtime into a larger application

It is like turning that small apartment into a building with independent flats. Each resident (team) has their own door, their own keys, their own autonomy. But they are all part of the same building (application).

### The difference between modularization and Micro Frontends

**❌ This is NOT a Micro Frontend:**

```
my-app/
├── src/
│   ├── modules/
│   │   ├── products/     # Products folder
│   │   ├── checkout/     # Checkout folder
│   │   └── profile/      # Profile folder
│   └── App.tsx           # Everything compiled together
```

That is only folder organization. Everything still compiles together, deploys together, breaks together.

**✅ THIS is a Micro Frontend:**

```
# Separate repositories
products-mfe/        # Team A - Independent deploy
checkout-mfe/        # Team B - Independent deploy
profile-mfe/         # Team C - Independent deploy
shell-app/           # Container that orchestrates everything
```

Each micro frontend is a complete application living its own life.

## 🎭 The types of Micro Frontend

There are three main approaches to implementing micro frontends, each with its trade-offs:

### 1. Build-Time Integration (Compile Time)

Micro frontends are integrated **during the build** through npm dependencies.

```json
// the shell's package.json
{
  "dependencies": {
    "@mycompany/mfe-products": "^2.1.0",
    "@mycompany/mfe-checkout": "^1.5.3",
    "@mycompany/mfe-profile": "^3.0.1"
  }
}
```

```typescript
// App.tsx
import { ProductsApp } from "@mycompany/mfe-products";
import { CheckoutApp } from "@mycompany/mfe-checkout";
import { ProfileApp } from "@mycompany/mfe-profile";

export function App() {
  return (
    <Router>
      <Route path="/products/*" element={<ProductsApp />} />
      <Route path="/checkout/*" element={<CheckoutApp />} />
      <Route path="/profile/*" element={<ProfileApp />} />
    </Router>
  );
}
```

**✅ Advantages:**

- Simple to implement
- No complex infrastructure needed
- Complete type safety (TypeScript)
- Optimized bundling

**❌ Disadvantages:**

- Coupled deploy (you have to rebuild everything)
- Not truly independent
- Versions fixed at build time

**When to use it:** small teams that want modularization without runtime complexity.

### 2. Server-Side Integration (SSR/SSI)

Micro frontends are **composed on the server** before reaching the browser.

```nginx
# nginx.conf
location /products {
  proxy_pass http://products-mfe:3001;
}

location /checkout {
  proxy_pass http://checkout-mfe:3002;
}

location /profile {
  proxy_pass http://profile-mfe:3003;
}
```

Each route points to a different server delivering complete HTML.

**✅ Advantages:**

- Excellent SEO
- Fast first paint
- Real physical separation

**❌ Disadvantages:**

- Hard to share state
- Navigating between MFEs reloads the page
- Infrastructure complexity

**When to use it:** e-commerce, blogs, sites where SEO is critical.

### 3. Runtime Integration (Client-Side)

Micro frontends are loaded **dynamically in the browser** at runtime. This is the most powerful and most complex approach.

```typescript
// shell/src/App.tsx
import { lazy, Suspense } from "react";

const ProductsApp = lazy(() => import("products_mfe/App"));
const CheckoutApp = lazy(() => import("checkout_mfe/App"));
const ProfileApp = lazy(() => import("profile_mfe/App"));

export function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Route path="/products/*" element={<ProductsApp />} />
        <Route path="/checkout/*" element={<CheckoutApp />} />
        <Route path="/profile/*" element={<ProfileApp />} />
      </Suspense>
    </Router>
  );
}
```

That `import('products_mfe/App')` does not come from npm — it comes from a remote server at **runtime**.

**✅ Advantages:**

- 100% independent deploy
- Can use different library versions
- Instant updates without a rebuild
- True autonomy

**❌ Disadvantages:**

- High technical complexity
- Possible code duplication
- Type safety is harder

**When to use it:** large applications with multiple independent teams.

## 🔧 Practical implementation: Module Federation

The most modern and powerful way to implement runtime integration is using **Module Federation** (Webpack 5 / Rspack / Vite).

### Setting up the Micro Frontend (Products)

```typescript
// products-mfe/webpack.config.js
const ModuleFederationPlugin =
  require("webpack").container.ModuleFederationPlugin;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "products_mfe",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App",
        "./ProductList": "./src/components/ProductList",
        "./ProductDetail": "./src/components/ProductDetail",
      },
      shared: {
        react: { singleton: true, requiredVersion: "^18.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
        "react-router-dom": { singleton: true },
      },
    }),
  ],
};
```

**What is happening here:**

- `exposes`: components this MFE makes available to others
- `shared`: dependencies shared between MFEs (avoids duplication)
- `singleton`: guarantees there is only ONE version of React on the page

### Setting up the Shell (orchestrator)

```typescript
// shell/webpack.config.js
const ModuleFederationPlugin =
  require("webpack").container.ModuleFederationPlugin;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "shell",
      remotes: {
        products_mfe: "products_mfe@http://localhost:3001/remoteEntry.js",
        checkout_mfe: "checkout_mfe@http://localhost:3002/remoteEntry.js",
        profile_mfe: "profile_mfe@http://localhost:3003/remoteEntry.js",
      },
      shared: {
        react: { singleton: true, requiredVersion: "^18.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
        "react-router-dom": { singleton: true },
      },
    }),
  ],
};
```

### Consuming the Micro Frontend

```typescript
// shell/src/App.tsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Dynamic import of remote MFEs
const ProductsApp = lazy(() => import("products_mfe/App"));
const CheckoutApp = lazy(() => import("checkout_mfe/App"));
const ProfileApp = lazy(() => import("profile_mfe/App"));

export function App() {
  return (
    <BrowserRouter>
      <header>
        <nav>
          <a href="/products">Products</a>
          <a href="/checkout">Cart</a>
          <a href="/profile">Profile</a>
        </nav>
      </header>

      <main>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/products/*" element={<ProductsApp />} />
            <Route path="/checkout/*" element={<CheckoutApp />} />
            <Route path="/profile/*" element={<ProfileApp />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
}
```

**The magic happening:**

1. The shell does not have `ProductsApp`'s code at build time
2. When the user visits `/products`, the browser **downloads the code dynamically** from `http://localhost:3001`
3. React renders the component as if it were local
4. If the products team deploys, the next request already gets the new version — **without rebuilding the shell**

## 🎨 Essential design patterns

### 1. Shell Application Pattern

The shell is the container application responsible for:

```typescript
// shell/src/App.tsx
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Layout>
            <Navigation />
            <Suspense fallback={<Loading />}>
              <MicroFrontendRoutes />
            </Suspense>
          </Layout>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

**The shell's responsibilities:**

- Main routing
- Authentication and authorization
- Global themes and styles
- Shared navigation/header/footer
- Error boundaries
- Analytics and monitoring

**❌ What the shell should NOT do:**

- Business logic
- Specific API calls
- Complex domain components

### 2. Shared State Pattern

How do you share state between independent micro frontends?

**Option 1: a Context Provider in the shell**

```typescript
// shell/src/contexts/CartContext.tsx
export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems((prev) => [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}
```

```typescript
// products-mfe/src/components/ProductCard.tsx
import { useContext } from "react";
import { CartContext } from "shell/contexts/CartContext";

export function ProductCard({ product }: Props) {
  // The MFE consumes the shell's context
  const cart = useContext(CartContext);

  const handleAddToCart = () => {
    cart?.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
    });
  };

  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={handleAddToCart}>Add to cart</button>
    </div>
  );
}
```

**Option 2: an Event Bus (Pub/Sub)**

When you want **total decoupling** between MFEs:

```typescript
// shell/src/utils/eventBus.ts
type EventCallback = (payload: any) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  subscribe(event: string, callback: EventCallback) {
    const handlers = this.events.get(event) || [];
    this.events.set(event, [...handlers, callback]);

    // Returns a cleanup function
    return () => {
      const handlers = this.events.get(event) || [];
      this.events.set(
        event,
        handlers.filter((h) => h !== callback)
      );
    };
  }

  publish(event: string, payload?: any) {
    const handlers = this.events.get(event) || [];
    handlers.forEach((handler) => handler(payload));
  }
}

export const eventBus = new EventBus();

// Exposes it globally to every MFE
(window as any).__EVENT_BUS__ = eventBus;
```

```typescript
// products-mfe: publishes the event
import { eventBus } from "shell/utils/eventBus";

function ProductCard({ product }: Props) {
  const handleAddToCart = () => {
    eventBus.publish("cart:item-added", {
      id: product.id,
      name: product.name,
      price: product.price,
    });
  };

  return <button onClick={handleAddToCart}>Add</button>;
}
```

```typescript
// checkout-mfe: listens for the event
import { useEffect, useState } from "react";
import { eventBus } from "shell/utils/eventBus";

export function CartCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe("cart:item-added", () => {
      setCount((prev) => prev + 1);
    });

    return unsubscribe;
  }, []);

  return <span>Cart ({count})</span>;
}
```

**✅ Advantage:** MFEs do not know about each other. Completely decoupled.

**❌ Disadvantage:** harder to debug. No type safety.

**Option 3: Global state management (Zustand/Redux)**

```typescript
// shell/src/store/cartStore.ts
import create from "zustand";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
}));

// Exposes it to every MFE
(window as any).__CART_STORE__ = useCartStore;
```

```typescript
// Any MFE can use it
const { items, addItem } = (window as any).__CART_STORE__();
```

### 3. Styling Isolation Pattern

How do you avoid style conflicts between MFEs?

**❌ Do not do this:**

```css
/* products-mfe */
.button {
  background: blue;
}

/* checkout-mfe */
.button {
  background: red; /* ❌ Conflict! */
}
```

**✅ Option 1: CSS Modules**

```typescript
// products-mfe/ProductCard.module.css
.button {
  background: blue;
}
```

```typescript
// ProductCard.tsx
import styles from "./ProductCard.module.css";

export function ProductCard() {
  return <button className={styles.button}>Buy</button>;
  // Produces: <button class="ProductCard_button__a1b2c">
}
```

**✅ Option 2: CSS-in-JS with a prefix**

```typescript
// products-mfe
import styled from "@emotion/styled";

const Button = styled.button`
  background: blue;
  // CSS scoped automatically
`;
```

**✅ Option 3: Shadow DOM**

```typescript
// Isolates the CSS completely
class ProductWidget extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        .button { background: blue; }
      </style>
      <button class="button">Buy</button>
    `;
  }
}

customElements.define("product-widget", ProductWidget);
```

### 4. Versioning Strategy Pattern

How do you manage MFE versions?

```typescript
// shell/webpack.config.js - Dev environment
remotes: {
  products_mfe: 'products_mfe@http://localhost:3001/remoteEntry.js',
}

// shell/webpack.config.js - Production
remotes: {
  products_mfe: 'products_mfe@https://cdn.myapp.com/products-mfe/v2.3.1/remoteEntry.js',
}
```

**Versioning strategy:**

```typescript
// Dynamic runtime configuration
const MFE_REGISTRY = {
  products: {
    url: process.env.REACT_APP_PRODUCTS_MFE_URL,
    version: "2.3.1",
    fallback: "/fallback-products",
  },
  checkout: {
    url: process.env.REACT_APP_CHECKOUT_MFE_URL,
    version: "1.5.0",
    fallback: "/fallback-checkout",
  },
};

function loadMicroFrontend(name: string) {
  const config = MFE_REGISTRY[name];

  return import(/* webpackIgnore: true */ config.url).catch(() => {
    console.error(`Failed to load ${name}, using fallback`);
    return import(config.fallback);
  });
}
```

## ✅ When to use Micro Frontends

### Signs that you NEED micro frontends:

**1. Multiple teams working on the same frontend**

If you have more than 2-3 teams touching the same repo, merge conflicts and dependencies start hurting more than helping.

**2. An application with well-separated domains**

```
E-commerce:
├── Product catalog (Team A)
├── Cart and Checkout (Team B)
├── Profile and orders (Team C)
└── Admin/Back office (Team D)
```

Each domain is almost a separate application. It makes sense to split them.

**3. Frequent and independent deploys**

If the products team needs to deploy 5 times a day, but the checkout team only deploys once a week, they should not be in the same build.

**4. Heterogeneous technology**

Legacy in AngularJS + new in React? Micro frontends allow gradual migration:

```typescript
// The shell can load both
<Route path="/legacy/*" element={<AngularMFE />} />
<Route path="/new/*" element={<ReactMFE />} />
```

**5. Organizational scale**

Companies with 50+ frontend developers generally benefit from the autonomy micro frontends bring.

### ✅ Checklist: are you ready?

- [ ] At least 3 independent teams working on the frontend
- [ ] Well-defined and separated business domains
- [ ] A need for independent deploys
- [ ] Infrastructure to serve multiple applications
- [ ] A team with technical knowledge of distributed architecture

## ❌ When NOT to use Micro Frontends

### Signs that you will regret it:

**1. A small application or a small team**

If you have 2-5 developers, the complexity of micro frontends will hurt more than help.

```
❌ Do not do this:
startup-app/
├── products-mfe/      # 1 dev
├── checkout-mfe/      # 1 dev
├── profile-mfe/       # 1 dev
└── shell/             # Absurd overhead
```

**2. Heavily coupled domains**

If your "features" talk to each other constantly and share a lot of logic, splitting them will create more problems:

```typescript
// ❌ Bad separation
user-profile-mfe   → needs data from orders-mfe
orders-mfe         → needs data from products-mfe
products-mfe       → needs data from user-profile-mfe
// That is not separation, it is distributed mess
```

**3. Performance is critical**

Micro frontends add overhead:

- Multiple bundles being downloaded
- Possible dependency duplication
- An orchestration runtime

If you are building a real-time trading dashboard where every millisecond matters, a well-optimized monolith may be better.

**4. Lack of DevOps maturity**

Micro frontends require:

- Separate CI/CD for each MFE
- A CDN or servers to host each bundle
- Distributed monitoring
- A versioning strategy

If your infrastructure is still "FTP to production", you are not ready.

**5. An application with a highly integrated UX**

If your application is like Figma, Notion or VS Code — where everything is one fluid, integrated experience — micro frontends can break that cohesion.

### ❌ Red flags of a bad implementation:

```typescript
// ❌ An MFE communicating directly with another MFE
import { getUserData } from 'profile-mfe/utils';

// ❌ Business logic in the shell
function Shell() {
  const products = await fetchProducts(); // ❌ no!
  return <ProductsMFE products={products} />;
}

// ❌ Misaligned dependencies
products-mfe: React 17
checkout-mfe: React 18
profile-mfe: React 16
// = singleton chaos

// ❌ Each MFE with its own design system
// The UI looks like Frankenstein
```

## 🎪 The perfect combination: Micro Frontends + BFF

Remember the [article about BFF](/artigos/bff-frontend-revolucao)? Micro Frontends and BFF were made for each other.

### The complete architecture

```
┌─────────────────────────────────────────────┐
│              SHELL APP                      │
│    (routing, auth, shared layout)           │
└─────────────────────────────────────────────┘
         │              │              │
    ┌────▼───┐     ┌────▼───┐     ┌────▼───┐
    │Products│     │Checkout│     │Profile │
    │  MFE   │     │  MFE   │     │  MFE   │
    └────┬───┘     └────┬───┘     └────┬───┘
         │              │              │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │Products │    │Checkout │    │Profile  │
    │  BFF    │    │  BFF    │    │  BFF    │
    └────┬────┘    └────┬────┘    └────┬────┘
         │              │              │
    ┌────▼─────────────▼──────────────▼────┐
    │            MICROSERVICES              │
    │   (orders, users, products, etc)      │
    └───────────────────────────────────────┘
```

### Practical implementation

```typescript
// products-mfe/src/services/api.ts
const PRODUCTS_BFF_URL = process.env.REACT_APP_PRODUCTS_BFF;

export async function getProducts(filters: ProductFilters) {
  // Calls the BFF specific to this MFE
  const response = await fetch(`${PRODUCTS_BFF_URL}/products`, {
    method: "POST",
    body: JSON.stringify(filters),
  });

  return response.json();
}
```

```typescript
// products-bff/src/routes/products.ts
app.post("/products", async (req, res) => {
  // The BFF aggregates data from multiple microservices
  const [products, inventory, reviews] = await Promise.all([
    productsService.search(req.body.filters),
    inventoryService.getStock(productIds),
    reviewsService.getRatings(productIds),
  ]);

  // Returns exactly what products-mfe needs
  res.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: inventory[p.id].quantity,
      rating: reviews[p.id].average,
      // Data optimized for this MFE
    })),
  });
});
```

### The benefits of the combination

**Total autonomy:**

- The team owns the MFE + BFF + tests + deploy
- Does not depend on other teams to evolve
- Can choose specific technologies

**Optimized performance:**

- The MFE loads only its own code
- The BFF returns only the necessary data
- No over-fetching or under-fetching

**Clear contracts:**

```typescript
// products-mfe/types/api.ts
export interface ProductListResponse {
  products: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
    rating: number;
  }>;
  total: number;
  page: number;
}
```

The BFF guarantees that contract. The MFE trusts the contract. The backend can change internally without breaking anything.

## 🚨 Common traps (and how to avoid them)

### 1. Giant "micro" frontends

```typescript
// ❌ This is not micro
products-mfe/
├── src/
│   ├── catalog/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── reviews/
│   └── recommendations/
```

If your "micro" frontend does 6 different things, it is not micro.

**✅ Fix it:**

```
catalog-mfe/        → Catalog only
cart-mfe/           → Cart only
checkout-mfe/       → Checkout only
orders-mfe/         → Orders only
```

### 2. Excessive code duplication

```typescript
// ❌ Each MFE reimplementing the same button
products - mfe / src / Button.tsx;
checkout - mfe / src / Button.tsx;
profile - mfe / src / Button.tsx;
```

**✅ Fix it: create a shared library**

```typescript
// @mycompany/design-system (npm package)
export { Button, Input, Modal } from './components';

// products-mfe/package.json
{
  "dependencies": {
    "@mycompany/design-system": "^2.1.0"
  }
}
```

Configure it as `shared` in Module Federation:

```typescript
shared: {
  '@mycompany/design-system': {
    singleton: true,
    requiredVersion: '^2.0.0',
  },
}
```

### 3. Chaotic communication between MFEs

```typescript
// ❌ products-mfe calling checkout-mfe directly
import { addToCart } from "checkout-mfe/actions";

addToCart(product); // ❌ Coupling!
```

**✅ Fix it: use an event bus or a shared context**

```typescript
// ✅ Decoupled via events
eventBus.publish("product:add-to-cart", { productId: product.id });
```

### 4. Missing error handling

```typescript
// ❌ If the MFE fails, everything breaks
<Suspense fallback={<Loading />}>
  <ProductsMFE />
</Suspense>
```

**✅ Fix it: error boundaries + fallback**

```typescript
// ✅ Degrades gracefully
<ErrorBoundary
  fallback={<ErrorFallback message="Products unavailable" />}
  onError={(error) => logToMonitoring(error)}
>
  <Suspense fallback={<Loading />}>
    <ProductsMFE />
  </Suspense>
</ErrorBoundary>
```

### 5. Misaligned dependencies

```typescript
// ❌ Different React versions
products-mfe:  react@18.2.0
checkout-mfe:  react@18.0.0
profile-mfe:   react@17.0.2
```

The result: **three copies of React in the bundle**. A performance nightmare.

**✅ Fix it: enforce singleton**

```typescript
// Every MFE must have:
shared: {
  react: {
    singleton: true,
    requiredVersion: '^18.2.0',
    strictVersion: true, // ❌ Fails if the version is incompatible
  },
}
```

## 🎯 Consolidated best practices

### 1. Define clear contracts

```typescript
// shared-types/src/contracts.ts
export interface MicroFrontendContract {
  name: string;
  version: string;
  exposes: string[];
  requires: {
    react: string;
    "react-router-dom": string;
  };
  events: {
    emits: string[];
    listens: string[];
  };
}

// products-mfe/contract.ts
export const contract: MicroFrontendContract = {
  name: "products-mfe",
  version: "2.1.0",
  exposes: ["./App", "./ProductList"],
  requires: {
    react: "^18.2.0",
    "react-router-dom": "^6.0.0",
  },
  events: {
    emits: ["product:added-to-cart", "product:viewed"],
    listens: ["cart:cleared"],
  },
};
```

### 2. Test the contracts (Contract Testing)

```typescript
// products-mfe/tests/contract.test.ts
import { Pact } from "@pact-foundation/pact";

describe("Products MFE Contract", () => {
  it("should provide ProductList component", async () => {
    const { ProductList } = await import("products-mfe/ProductList");
    expect(ProductList).toBeDefined();
    expect(typeof ProductList).toBe("function");
  });

  it("should emit correct events", () => {
    const eventSpy = jest.fn();
    eventBus.subscribe("product:added-to-cart", eventSpy);

    // Simulates the action
    addProductToCart("123");

    expect(eventSpy).toHaveBeenCalledWith({
      productId: "123",
      timestamp: expect.any(Number),
    });
  });
});
```

### 3. Monitor each MFE separately

```typescript
// shell/src/monitoring.ts
import * as Sentry from "@sentry/react";

export function setupMFEMonitoring(mfeName: string) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tags: {
      microFrontend: mfeName,
    },
  });
}

// products-mfe/src/index.tsx
import { setupMFEMonitoring } from "shell/monitoring";

setupMFEMonitoring("products-mfe");

// Now errors are tagged per MFE
```

### 4. Rigorous semantic versioning

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes (the contract changes)
MINOR: New features (keeps compatibility)
PATCH: Bug fixes
```

```typescript
// products-mfe v2.0.0 → v3.0.0 (breaking change)
// BEFORE:
export function ProductList() { ... }

// AFTER:
export function ProductList({ config }: { config: Config }) { ... }
// ❌ Breaks whoever uses it

// The shell has to update:
- <ProductList />
+ <ProductList config={defaultConfig} />
```

### 5. Feature flags per MFE

```typescript
// feature-flags.ts
export const FEATURES = {
  "products-mfe": {
    newProductCard: true,
    aiRecommendations: false,
  },
  "checkout-mfe": {
    expressCheckout: true,
    instantPayment: true,
  },
};

// products-mfe/src/ProductList.tsx
import { FEATURES } from "shell/feature-flags";

export function ProductList() {
  const showNewCard = FEATURES["products-mfe"].newProductCard;

  return (
    <>
      {products.map((p) =>
        showNewCard ? (
          <NewProductCard product={p} />
        ) : (
          <OldProductCard product={p} />
        )
      )}
    </>
  );
}
```

## 🎓 The right mindset for Micro Frontends

Micro frontends are not about technology. They are about **organization and autonomy**.

The question we should be asking is not "how do I implement Module Federation?", but rather:

**"How do we structure the teams so they can evolve independently?"**

When you write a micro frontend thinking "this has to work without depending on other teams", you are on the right track.

When you write it thinking "I'll just split it into folders and call it a micro frontend", you are creating unnecessary complexity.

### The principles to take with you:

1. **Autonomy > reuse** → prefer duplicating code over creating dependencies between MFEs
2. **Contracts > implementation** → guarantee compatibility through contracts, not through shared code
3. **Asynchronous communication** → MFEs should talk via events, not via direct calls
4. **Isolated failures** → if one MFE breaks, the others keep working
5. **Independent deploy** → if you need to coordinate the deploy of multiple MFEs, something is wrong

## 🎭 Conclusion: divide and conquer

The software industry learned years ago that backend monoliths do not scale. Microservices revolutionized the backend not because they are technically superior, but because they solve a problem of **human organization**.

Micro frontends bring the same revolution to the frontend.

**The problem is not technical. The problem is letting teams grow without running each other over.**

Just as in [the exam effect in code](/artigos/efeito-enem-no-codigo), where we learned that memorizing patterns is not the same as understanding them, micro frontends teach us that modularizing folders is not the same as creating autonomy.

The real skill is not in configuring webpack — it is in structuring teams and code so that both can evolve.

### The final question

Before implementing micro frontends, ask yourself:

**"Do my teams really need total autonomy, or am I just following a trend?"**

If the answer is "we need autonomy", micro frontends are the solution.

If the answer is "we just want to modularize", build a better folder architecture.

---

_Micro frontends are not about separating code. They are about separating responsibilities. And well-organized code is not the code that compiles — it is the code that lets teams work without blocking each other._

**Divide and conquer. But divide with purpose.**

## 📚 References and further reading

This article was built on consolidated practices and real implementations:

- **Cam Jackson** — [Micro Frontends (martinfowler.com)](https://martinfowler.com/articles/micro-frontends.html): the seminal article that popularized the concept.

- **Luca Mezzalira** — _Building Micro-Frontends_: the definitive book on micro frontend architecture.

- **Michael Geers** — [Micro Frontends in Action](https://micro-frontends.org/): a practical guide with real examples.

- **Webpack Module Federation** — [Official documentation](https://webpack.js.org/concepts/module-federation/): the technology that made modern runtime integration possible.

- **Single-SPA** — [A framework for micro frontends](https://single-spa.js.org/): an alternative to Module Federation, framework-agnostic.

- **Zack Jackson** — creator of Module Federation: talks and articles about the architecture.

- **ThoughtWorks Technology Radar** — assessments and recommendations on micro frontend adoption.

---

_If this article made you rethink how to structure your frontend, it did its job. Share it with your team and let's raise the level of frontend architecture._

**👏 Enjoyed it? Leave a clap and share your micro frontend experiences in the comments!**
