_How to drop the coverage illusion and learn to write tests that actually protect your code_

## 🎭 The 100% coverage charade

Picture this: it's Friday, 5:45 pm. The PR has been open for three days. CI is green. Tests pass. Coverage is at 94%. All good, right?

Monday, a critical bug in production. A user cannot log in when their email has special characters. You open the code and see it: there is a test for the login form. There is coverage. The test passes.

But the test only checks that the component renders. It does not validate behaviour. It does not simulate real interaction. It does not test the logic that actually matters.

**You have 94% coverage and 0% confidence.**

That is the biggest problem with testing in modern frontend: it is not that people don't test — it is that they test the wrong things, for the wrong reasons, in the wrong way.

It is like locking every window in the house and leaving the front door wide open. Technically you "did your part." Practically, you are exposed.

## 🎯 The problem is not technical, it is cultural

Before we talk about Jest, React Testing Library or coverage thresholds, we need to understand why so many teams write useless tests.

The answer shares a root with [the exam effect in code](#/artigos/efeito-enem-no-codigo): do the minimum required to pass.

### The metric became the goal

When we set "minimum 80% coverage," we create a perverse incentive:

- Developers write tests that raise the number, not the confidence
- Code review approves because "it has tests"
- CI passes, the deploy happens
- Production bugs show up anyway

Kent C. Dodds, who created React Testing Library, coined a line that should be printed on every engineering room wall:

> "The more your tests resemble the way your software is used, the more confidence they can give you."

In other words: test the way a user uses it, not the way the code happens to be structured.

## 🧪 What actually deserves a test?

The right question is not "how do I get to 100% coverage?" but "what needs to be protected by tests?".

### 1. Critical business behaviour

**Don't test implementation. Test behaviour.**

❌ **A useless test:**

```typescript
// LoginForm.test.tsx
it("should have an email input", () => {
  render(<LoginForm />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
});
```

This test breaks if you change the label, and it never notices whether login actually works.

✅ **A useful test:**

```typescript
// LoginForm.test.tsx
it("should authenticate user with valid credentials", async () => {
  const mockLogin = jest.fn().mockResolvedValue({ token: "abc123" });
  render(<LoginForm onLogin={mockLogin} />);

  await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
  await userEvent.type(screen.getByLabelText(/password/i), "secret123");
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

  expect(mockLogin).toHaveBeenCalledWith({
    email: "user@example.com",
    password: "secret123",
  });
});
```

This one validates the whole flow: user interaction → validation → submission.

### 2. Error handling

Errors are where bugs live. If you do not test failure paths, you are not testing.

```typescript
// LoginForm.test.tsx
it("should display error message when login fails", async () => {
  const mockLogin = jest
    .fn()
    .mockRejectedValue(new Error("Invalid credentials"));
  render(<LoginForm onLogin={mockLogin} />);

  await userEvent.type(screen.getByLabelText(/email/i), "wrong@example.com");
  await userEvent.type(screen.getByLabelText(/password/i), "wrongpass");
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    /invalid credentials/i
  );
  expect(mockLogin).toHaveBeenCalledTimes(1);
});
```

### 3. Data transformation logic

Pure functions that transform data are ideal test candidates.

```typescript
// utils/formatters.ts
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function parseFilters(searchParams: URLSearchParams) {
  return {
    category: searchParams.get("category") || "all",
    minPrice: Number(searchParams.get("minPrice")) || 0,
    maxPrice: Number(searchParams.get("maxPrice")) || Infinity,
  };
}
```

```typescript
// utils/formatters.test.ts
describe("formatCurrency", () => {
  it("should format positive numbers correctly", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("should handle zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("should format negative numbers", () => {
    expect(formatCurrency(-500)).toBe("-$500.00");
  });
});

describe("parseFilters", () => {
  it("should parse all filters from URL params", () => {
    const params = new URLSearchParams(
      "category=electronics&minPrice=100&maxPrice=500"
    );
    expect(parseFilters(params)).toEqual({
      category: "electronics",
      minPrice: 100,
      maxPrice: 500,
    });
  });

  it("should use defaults when params are missing", () => {
    const params = new URLSearchParams("");
    expect(parseFilters(params)).toEqual({
      category: "all",
      minPrice: 0,
      maxPrice: Infinity,
    });
  });
});
```

### 4. Conditional UI states

When the interface changes based on state, test every variation.

```typescript
// ProductCard.tsx
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
  };
  onAddToCart: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <div role="article" aria-label={product.name}>
      <h3>{product.name}</h3>
      <p>{formatCurrency(product.price)}</p>
      <p>{product.stock} in stock</p>

      {isOutOfStock ? (
        <span role="status">Out of stock</span>
      ) : (
        <button onClick={() => onAddToCart(product.id)}>
          Add to cart
        </button>
      )}
    </div>
  );
}
```

```typescript
// ProductCard.test.tsx
describe("ProductCard", () => {
  const mockProduct = {
    id: "1",
    name: "Mechanical Keyboard",
    price: 299.9,
    stock: 5,
  };

  it("should show add to cart button when product is in stock", () => {
    const handleAdd = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={handleAdd} />);

    const button = screen.getByRole("button", { name: /add to cart/i });
    expect(button).toBeInTheDocument();
  });

  it("should show unavailable message when out of stock", () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStockProduct} onAddToCart={jest.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent(/out of stock/i);
    expect(
      screen.queryByRole("button", { name: /add to cart/i })
    ).not.toBeInTheDocument();
  });

  it("should call onAddToCart with product id when button is clicked", async () => {
    const handleAdd = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={handleAdd} />);

    await userEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(handleAdd).toHaveBeenCalledWith("1");
  });
});
```

## 🎪 What does NOT need a test

Knowing what to ignore matters as much as knowing what to cover.

### ❌ Third-party library internals

```typescript
// ❌ Don't do this
it("should render a button", () => {
  render(<button>Click me</button>);
  expect(screen.getByRole("button")).toBeInTheDocument();
});
```

You are testing React, not your code.

### ❌ Visual styling

```typescript
// ❌ Don't do this
it("should have blue background", () => {
  render(<Button />);
  expect(screen.getByRole("button")).toHaveClass("bg-blue-500");
});
```

CSS classes do not guarantee behaviour. Use visual testing (Storybook + Chromatic) for that.

### ❌ Implementation details

```typescript
// ❌ Don't do this
it("should call useState with initial value", () => {
  const spy = jest.spyOn(React, "useState");
  render(<Counter />);
  expect(spy).toHaveBeenCalledWith(0);
});
```

Refactor to `useReducer` and the test breaks, even though the behaviour is identical.

## 🔧 A solid test setup

### The basics (Jest + React Testing Library)

```typescript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.tsx",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],
  coverageThresholds: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
};
```

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock global APIs
global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };
  };
```

### Reusable helpers

```typescript
// src/test/utils.tsx
import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface CustomRenderOptions extends RenderOptions {
  initialRoute?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { initialRoute = "/", ...renderOptions }: CustomRenderOptions = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  window.history.pushState({}, "Test page", initialRoute);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything
export * from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";
```

Usage:

```typescript
import { renderWithProviders, screen, userEvent } from "@/test/utils";

it("should navigate to product page", async () => {
  renderWithProviders(<App />, { initialRoute: "/products" });
  // your tests here
});
```

## 🎭 Mocks: the art of faking reality

Mocks are the stunt doubles of software: they stand in for the real thing in a controlled scene.

### Mocking external modules

```typescript
// src/services/api.ts
export async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
}
```

```typescript
// src/components/UserProfile.test.tsx
import { fetchUser } from "@/services/api";

jest.mock("@/services/api");
const mockFetchUser = fetchUser as jest.MockedFunction<typeof fetchUser>;

describe("UserProfile", () => {
  it("should display user data when loaded", async () => {
    mockFetchUser.mockResolvedValue({
      id: "1",
      name: "Jane Doe",
      email: "jane@example.com",
    });

    renderWithProviders(<UserProfile userId="1" />);

    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("should show error message when fetch fails", async () => {
    mockFetchUser.mockRejectedValue(new Error("Network error"));

    renderWithProviders(<UserProfile userId="1" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /failed to load/i
    );
  });
});
```

### Mocking custom hooks

```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // authentication logic
  }, []);

  return { user, loading, logout, login };
}
```

```typescript
// src/components/Dashboard.test.tsx
import { useAuth } from "@/hooks/useAuth";

jest.mock("@/hooks/useAuth");
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("Dashboard", () => {
  it("should show loading state", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      logout: jest.fn(),
      login: jest.fn(),
    });

    render(<Dashboard />);
    expect(screen.getByRole("status")).toHaveTextContent(/loading/i);
  });

  it("should show user data when authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "Mary", email: "mary@example.com" },
      loading: false,
      logout: jest.fn(),
      login: jest.fn(),
    });

    render(<Dashboard />);
    expect(screen.getByText("Welcome, Mary")).toBeInTheDocument();
  });
});
```

### When NOT to mock

Not everything should be mocked. Over-mocking produces brittle tests that do not reflect reality.

**✅ Mock these:**

- Network requests (fetch, axios)
- External services (analytics, tracking)
- Timers and dates
- LocalStorage / SessionStorage

**❌ Don't mock these:**

- Internal components (an integration test is better)
- Simple business logic
- Pure utilities (formatters, validators)

## 📊 Coverage: the metric that lies

Coverage measures how many lines ran during your tests. But running ≠ validating.

```typescript
// This code has 100% coverage...
export function divide(a: number, b: number) {
  return a / b;
}

it("should divide numbers", () => {
  divide(10, 2);
});
```

The test runs the function and validates nothing. It does not catch division by zero. It does not check the result. It is useless — and it counts as "covered."

### Coverage with intent

```typescript
describe("divide", () => {
  it("should divide two positive numbers", () => {
    expect(divide(10, 2)).toBe(5);
  });

  it("should handle negative numbers", () => {
    expect(divide(-10, 2)).toBe(-5);
  });

  it("should throw error when dividing by zero", () => {
    expect(() => divide(10, 0)).toThrow("Cannot divide by zero");
  });

  it("should handle decimal results", () => {
    expect(divide(5, 2)).toBe(2.5);
  });
});
```

### What belongs in your coverage targets

Set thresholds per kind of file:

```javascript
// jest.config.js
coverageThresholds: {
  global: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
  },
  './src/utils/': {
    statements: 95,
    branches: 90,
    functions: 95,
    lines: 95,
  },
  './src/components/ui/': {
    statements: 60, // simple UI components don't need as much
    branches: 50,
  },
}
```

**Push coverage up in:**

- `utils/` and `helpers/` → 90–95%
- custom `hooks/` → 85–90%
- business logic → 85–90%
- components with logic → 75–85%

**Let it go in:**

- purely visual components → 50–60%
- TypeScript types → 0% (they don't run)
- config files → leave them out

## 🎯 Patterns and antipatterns

### ✅ Pattern: AAA (Arrange, Act, Assert)

```typescript
it("should add item to cart", async () => {
  // Arrange - set the scene
  const mockAddToCart = jest.fn();
  render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);

  // Act - do the thing
  await userEvent.click(screen.getByRole("button", { name: /add to cart/i }));

  // Assert - check the result
  expect(mockAddToCart).toHaveBeenCalledWith(mockProduct.id);
});
```

### ✅ Pattern: test factories

```typescript
// src/test/factories.ts
export function createUser(overrides?: Partial<User>): User {
  return {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    role: "user",
    ...overrides,
  };
}

export function createProduct(overrides?: Partial<Product>): Product {
  return {
    id: "1",
    name: "Test Product",
    price: 99.9,
    stock: 10,
    ...overrides,
  };
}
```

Usage:

```typescript
it("should show admin controls for admin users", () => {
  const adminUser = createUser({ role: "admin" });
  render(<Dashboard user={adminUser} />);

  expect(screen.getByRole("button", { name: /manage/i })).toBeInTheDocument();
});
```

### ❌ Antipattern: the duplicated test

```typescript
// ❌ Don't do this
it("should render email input", () => {
  render(<LoginForm />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
});

it("should render password input", () => {
  render(<LoginForm />);
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});

it("should render submit button", () => {
  render(<LoginForm />);
  expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
});
```

```typescript
// ✅ Do this
it("should render login form with all fields", () => {
  render(<LoginForm />);

  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
});
```

### ❌ Antipattern: the brittle test

```typescript
// ❌ Brittle - breaks on any DOM change
it("should show error", async () => {
  render(<Form />);
  const button = container.querySelector(".submit-btn");
  fireEvent.click(button!);

  await waitFor(() => {
    expect(container.querySelector(".error-msg")).toHaveTextContent("Error");
  });
});
```

```typescript
// ✅ Robust - uses semantic queries
it("should show error message when form is invalid", async () => {
  render(<Form />);

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(/error/i);
});
```

## 🏗️ Testing complex components

### A component with several responsibilities

```typescript
// src/components/CheckoutForm.tsx
interface CheckoutFormProps {
  items: CartItem[];
  onSubmit: (data: CheckoutData) => Promise<void>;
}

export function CheckoutForm({ items, onSubmit }: CheckoutFormProps) {
  const [step, setStep] = useState<"address" | "payment" | "review">("address");
  const [formData, setFormData] = useState<Partial<CheckoutData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function handleSubmit() {
    const validationErrors = validateCheckoutData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(formData as CheckoutData);
    } catch (error) {
      setErrors({ submit: "Could not process payment" });
    }
  }

  // ... rest of the implementation
}
```

```typescript
// src/components/CheckoutForm.test.tsx
describe("CheckoutForm", () => {
  const mockItems = [
    createProduct({ id: "1", name: "Product 1", price: 100, quantity: 2 }),
    createProduct({ id: "2", name: "Product 2", price: 50, quantity: 1 }),
  ];

  it("should display cart summary with correct total", () => {
    render(<CheckoutForm items={mockItems} onSubmit={jest.fn()} />);

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
    expect(screen.getByText(/total: \$250\.00/i)).toBeInTheDocument();
  });

  it("should complete checkout flow successfully", async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    render(<CheckoutForm items={mockItems} onSubmit={handleSubmit} />);

    // Step 1: Address
    await userEvent.type(screen.getByLabelText(/address/i), "123 Test Street");
    await userEvent.type(screen.getByLabelText(/city/i), "Springfield");
    await userEvent.click(screen.getByRole("button", { name: /next/i }));

    // Step 2: Payment
    await userEvent.type(
      screen.getByLabelText(/card number/i),
      "4111111111111111"
    );
    await userEvent.type(screen.getByLabelText(/cvv/i), "123");
    await userEvent.click(screen.getByRole("button", { name: /next/i }));

    // Step 3: Review & Submit
    await userEvent.click(
      screen.getByRole("button", { name: /place order/i })
    );

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        address: "123 Test Street",
        city: "Springfield",
        cardNumber: "4111111111111111",
      })
    );
  });

  it("should show validation errors for incomplete fields", async () => {
    render(<CheckoutForm items={mockItems} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(await screen.findByText(/address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/city is required/i)).toBeInTheDocument();
  });

  it("should display error message when payment fails", async () => {
    const handleSubmit = jest
      .fn()
      .mockRejectedValue(new Error("Payment failed"));
    render(<CheckoutForm items={mockItems} onSubmit={handleSubmit} />);

    // fill the whole form...
    // (omitted for brevity)

    await userEvent.click(screen.getByRole("button", { name: /place order/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not process payment/i
    );
  });
});
```

## 🎓 Practices worth keeping

### 1. Descriptive names

```typescript
// ❌ Vague
it('should work', () => { ... });
it('test login', () => { ... });

// ✅ Specific
it('should authenticate user with valid credentials', () => { ... });
it('should display error message when email is invalid', () => { ... });
```

### 2. One concept per test

```typescript
// ❌ Too much in one place
it("should handle form submission", async () => {
  render(<Form />);
  await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
  expect(screen.getByLabelText(/email/i)).toHaveValue("test@example.com");
  await userEvent.click(screen.getByRole("button"));
  expect(mockSubmit).toHaveBeenCalled();
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// ✅ Separate and focused
it("should update email field value when user types", async () => {
  render(<Form />);
  await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
  expect(screen.getByLabelText(/email/i)).toHaveValue("test@example.com");
});

it("should call onSubmit when form is submitted", async () => {
  const mockSubmit = jest.fn();
  render(<Form onSubmit={mockSubmit} />);
  await fillForm(); // helper function
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));
  expect(mockSubmit).toHaveBeenCalled();
});

it("should display success message after submission", async () => {
  render(<Form onSubmit={jest.fn().mockResolvedValue(undefined)} />);
  await fillForm();
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));
  expect(await screen.findByText(/success/i)).toBeInTheDocument();
});
```

### 3. Use accessible queries

Query priority, according to React Testing Library:

1. `getByRole` → best for accessibility
2. `getByLabelText` → great for forms
3. `getByPlaceholderText` → fine for inputs
4. `getByText` → use for visible content
5. `getByTestId` → last resort

```typescript
// ✅ Prefer semantic queries
screen.getByRole("button", { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByText(/welcome/i);

// ❌ Avoid brittle queries
screen.getByTestId("submit-btn");
container.querySelector(".btn-primary");
```

### 4. Get async right

```typescript
// ❌ No await - fails silently
it("should show success message", () => {
  render(<AsyncComponent />);
  userEvent.click(screen.getByRole("button"));
  expect(screen.getByText(/success/i)).toBeInTheDocument(); // may not exist yet
});

// ✅ async/await with findBy
it("should show success message after async operation", async () => {
  render(<AsyncComponent />);
  await userEvent.click(screen.getByRole("button"));
  expect(await screen.findByText(/success/i)).toBeInTheDocument();
});
```

### 5. Isolate your tests

```typescript
// ❌ Tests share state
let user: User;

beforeAll(() => {
  user = createUser(); // created once for every test
});

it("should update user name", () => {
  user.name = "New Name"; // mutates shared state
  expect(user.name).toBe("New Name");
});

it("should have original name", () => {
  expect(user.name).toBe("Test User"); // ❌ fails! state was mutated
});

// ✅ Each test gets its own state
describe("User operations", () => {
  let user: User;

  beforeEach(() => {
    user = createUser(); // fresh for every test
  });

  it("should update user name", () => {
    user.name = "New Name";
    expect(user.name).toBe("New Name");
  });

  it("should have original name", () => {
    expect(user.name).toBe("Test User"); // ✅ passes
  });
});
```

## 🚨 Red flags: when your test is wrong

### 1. A test that never fails

If you comment out the production code and the test still passes, the test is useless.

### 2. A test that tests the mock

```typescript
// ❌ Only checks that the mock was called, not the real behaviour
it("should call fetchUser", async () => {
  const mockFetch = jest.fn();
  render(<Component fetchUser={mockFetch} />);
  await waitFor(() => expect(mockFetch).toHaveBeenCalled());
});
```

### 3. A test that depends on execution order

```typescript
// ❌ Change the order and it breaks
describe("Counter", () => {
  it("should start at 0", () => {
    render(<Counter />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should increment to 1", async () => {
    // ❌ assumes the previous test ran
    await userEvent.click(screen.getByRole("button", { name: /increment/i }));
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
```

### 4. A test with arbitrary sleeps

```typescript
// ❌ Flaky and slow
it("should update after delay", async () => {
  render(<Component />);
  await userEvent.click(screen.getByRole("button"));
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 😱
  expect(screen.getByText(/updated/i)).toBeInTheDocument();
});

// ✅ Use waitFor or findBy
it("should update after async operation", async () => {
  render(<Component />);
  await userEvent.click(screen.getByRole("button"));
  expect(await screen.findByText(/updated/i)).toBeInTheDocument();
});
```

## 🎯 The right mindset for testing

Unit tests on the frontend are not about hitting a metric. They are about confidence.

The question to ask is not "how much code is covered?" but:

**"If I deploy right now, will I sleep well?"**

When you write a test thinking "this has to work every time, no matter what," you are on the right track.

When you write a test thinking "I need to reach 80% coverage," you are producing technical debt dressed up as quality.

## 🎭 Conclusion: test with purpose, not with a metric

The software industry built an unhealthy obsession with code coverage. Teams celebrate "100% coverage" like a trophy, and in practice it can mean absolutely nothing.

**The problem is not testing. The problem is testing without thinking.**

Just like in [the exam effect in code](#/artigos/efeito-enem-no-codigo), where we learned to clear the level without understanding it, many developers learned to write tests that pass CI without protecting anything.

The real skill is not making tests pass — it is making tests that mean something.

### The principles worth keeping

1. **Test behaviour, not implementation** → tests should survive refactors
2. **Test the way a user uses it** → if your test does not simulate real use, it is not doing its job
3. **Coverage is a consequence, not a goal** → good tests produce good coverage on their own
4. **Mock the minimum** → the more you mock, the less confidence the test gives
5. **Every test should have a clear reason to exist** → if you do not know why you are writing it, do not write it

### The final question

Before writing any test, ask yourself:

**"Will this test give me the confidence to deploy on a Friday afternoon?"**

If the answer is no, you are writing the wrong test.

If the answer is yes, you understood the point.

---

_Tests are not about proving the code compiles. They are about proving the product works. And working code is not the code that passes CI — it is the code that solves the user's problem._

**Write fewer tests, but better ones.**

**Test what matters. Ignore the rest.**

## 📚 References and further reading

This article was built on established practice and on voices the community trusts:

- **Kent C. Dodds** — [Testing Library](https://testing-library.com/) and [Testing JavaScript](https://testingjavascript.com/): the philosophy of testing the way users use, not the way code is structured.

- **Martin Fowler** — [Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html): the test pyramid and when each kind of test earns its place.

- **Kent Beck** — _Test-Driven Development: By Example_: the fundamentals of TDD and how tests can guide design.

- **Vladimir Khorikov** — _Unit Testing Principles, Practices, and Patterns_: separating useful tests from useless ones, and when mocks are warranted.

- **React Testing Library Docs** — [Guiding Principles](https://testing-library.com/docs/guiding-principles/): the core principles for testing React components.

- **Jest Documentation** — [Best Practices](https://jestjs.io/docs/getting-started): setup and configuration in the JavaScript ecosystem.

- **Robert C. Martin (Uncle Bob)** — _Clean Code_ and _The Clean Coder_: responsibility for code quality and discipline in testing.

---

_If this made you rethink how you test, it did its job. Share it with your team._

**👏 Enjoyed it? Leave a clap and share your experience in the comments.**
