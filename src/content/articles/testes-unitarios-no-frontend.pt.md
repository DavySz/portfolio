_Como abandonar a ilusão de cobertura e aprender a escrever testes que realmente protegem seu código_

## 🎭 A farsa dos 100% de cobertura

Imagine a seguinte cena: é sexta-feira, 17h45. O PR está aberto há três dias. O CI/CD está verde. Os testes passam. A cobertura está em 94%. Tudo perfeito, certo?

Na segunda-feira, um bug crítico em produção. Um usuário não consegue fazer login quando o email tem caracteres especiais. Você abre o código e vê: existe um teste para o formulário de login. Existe cobertura. O teste passa.

Mas o teste só verifica se o componente renderiza. Não valida comportamento. Não simula interação real. Não testa a lógica que realmente importa.

**Você tem 94% de cobertura e 0% de confiança.**

Esse é o maior problema dos testes no frontend moderno: não é que as pessoas não testem — é que elas testam as coisas erradas, pelos motivos errados, da forma errada.

É como trancar todas as janelas da casa, mas deixar a porta da frente escancarada. Tecnicamente, você "fez sua parte". Praticamente, está vulnerável.

## 🎯 O problema não é técnico, é cultural

Antes de falar sobre Jest, React Testing Library ou coverage thresholds, precisamos entender por que tantos times escrevem testes inúteis.

A resposta está na mesma raiz do [efeito ENEM no código](/artigos/efeito-enem-no-codigo): fazer o mínimo para passar.

### A métrica virou o objetivo

Quando definimos "cobertura mínima de 80%", criamos um incentivo perverso:

- Devs escrevem testes que aumentam o número, não a confiança
- Code review aprova porque "tem testes"
- O CI passa, o deploy acontece
- Bugs em produção aparecem do mesmo jeito

Kent C. Dodds, criador da React Testing Library, cunhou uma frase que deveria estar estampada em toda sala de desenvolvimento:

> "The more your tests resemble the way your software is used, the more confidence they can give you."

Traduzindo: teste como o usuário usa, não como o código está estruturado.

## 🧪 O que realmente importa testar?

A pergunta certa não é "como chego em 100% de cobertura?", mas sim "o que precisa ser protegido por testes?".

### 1. Comportamento crítico de negócio

**Não teste implementação. Teste comportamento.**

❌ **Teste inútil:**

```typescript
// LoginForm.test.tsx
it("should have an email input", () => {
  render(<LoginForm />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
});
```

Este teste quebra se você mudar o label, mas não detecta se o login realmente funciona.

✅ **Teste útil:**

```typescript
// LoginForm.test.tsx
it("should authenticate user with valid credentials", async () => {
  const mockLogin = jest.fn().mockResolvedValue({ token: "abc123" });
  render(<LoginForm onLogin={mockLogin} />);

  await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
  await userEvent.type(screen.getByLabelText(/senha/i), "senha123");
  await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

  expect(mockLogin).toHaveBeenCalledWith({
    email: "user@example.com",
    password: "senha123",
  });
});
```

Este teste valida o fluxo completo: interação do usuário → validação → submissão.

### 2. Tratamento de erros

Erros são onde os bugs vivem. Se você não testa cenários de erro, não está testando.

```typescript
// LoginForm.test.tsx
it("should display error message when login fails", async () => {
  const mockLogin = jest
    .fn()
    .mockRejectedValue(new Error("Credenciais inválidas"));
  render(<LoginForm onLogin={mockLogin} />);

  await userEvent.type(screen.getByLabelText(/email/i), "wrong@example.com");
  await userEvent.type(screen.getByLabelText(/senha/i), "wrongpass");
  await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    /credenciais inválidas/i
  );
  expect(mockLogin).toHaveBeenCalledTimes(1);
});
```

### 3. Lógica de transformação de dados

Funções puras que transformam dados são candidatas ideais para testes.

```typescript
// utils/formatters.ts
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
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
    expect(formatCurrency(1234.56)).toBe("R$ 1.234,56");
  });

  it("should handle zero", () => {
    expect(formatCurrency(0)).toBe("R$ 0,00");
  });

  it("should format negative numbers", () => {
    expect(formatCurrency(-500)).toBe("-R$ 500,00");
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

### 4. Estados condicionais da UI

Quando a interface muda baseado em estado, teste cada variação.

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
      <p>{product.stock} em estoque</p>

      {isOutOfStock ? (
        <span role="status">Indisponível</span>
      ) : (
        <button onClick={() => onAddToCart(product.id)}>
          Adicionar ao carrinho
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
    name: "Teclado Mecânico",
    price: 299.9,
    stock: 5,
  };

  it("should show add to cart button when product is in stock", () => {
    const handleAdd = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={handleAdd} />);

    const button = screen.getByRole("button", {
      name: /adicionar ao carrinho/i,
    });
    expect(button).toBeInTheDocument();
  });

  it("should show unavailable message when out of stock", () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStockProduct} onAddToCart={jest.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent(/indisponível/i);
    expect(
      screen.queryByRole("button", { name: /adicionar/i })
    ).not.toBeInTheDocument();
  });

  it("should call onAddToCart with product id when button is clicked", async () => {
    const handleAdd = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={handleAdd} />);

    await userEvent.click(screen.getByRole("button", { name: /adicionar/i }));
    expect(handleAdd).toHaveBeenCalledWith("1");
  });
});
```

## 🎪 O que NÃO precisa ser testado

Tão importante quanto saber o que testar é saber o que ignorar.

### ❌ Implementação de bibliotecas externas

```typescript
// ❌ Não faça isso
it("should render a button", () => {
  render(<button>Click me</button>);
  expect(screen.getByRole("button")).toBeInTheDocument();
});
```

Você está testando o React, não seu código.

### ❌ Estilos visuais

```typescript
// ❌ Não faça isso
it("should have blue background", () => {
  render(<Button />);
  expect(screen.getByRole("button")).toHaveClass("bg-blue-500");
});
```

Classes CSS não garantem comportamento. Use testes visuais (Storybook + Chromatic) para isso.

### ❌ Detalhes de implementação

```typescript
// ❌ Não faça isso
it("should call useState with initial value", () => {
  const spy = jest.spyOn(React, "useState");
  render(<Counter />);
  expect(spy).toHaveBeenCalledWith(0);
});
```

Se você refatorar para usar `useReducer`, o teste quebra mesmo que o comportamento continue igual.

## 🔧 Configuração robusta de testes

### Setup básico (Jest + React Testing Library)

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

// Limpa após cada teste
afterEach(() => {
  cleanup();
});

// Mock de APIs globais
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

### Helpers reutilizáveis

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

// Re-exporta tudo
export * from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";
```

Uso:

```typescript
import { renderWithProviders, screen, userEvent } from "@/test/utils";

it("should navigate to product page", async () => {
  renderWithProviders(<App />, { initialRoute: "/products" });
  // Seus testes aqui
});
```

## 🎭 Mocks: a arte de simular realidade

Mocks são como stunt doubles no cinema: eles representam a coisa real em cenários controlados.

### Mock de módulos externos

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
      name: "João Silva",
      email: "joao@example.com",
    });

    renderWithProviders(<UserProfile userId="1" />);

    expect(await screen.findByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("joao@example.com")).toBeInTheDocument();
  });

  it("should show error message when fetch fails", async () => {
    mockFetchUser.mockRejectedValue(new Error("Network error"));

    renderWithProviders(<UserProfile userId="1" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /erro ao carregar/i
    );
  });
});
```

### Mock de hooks customizados

```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // lógica de autenticação
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
    expect(screen.getByRole("status")).toHaveTextContent(/carregando/i);
  });

  it("should show user data when authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "Maria", email: "maria@example.com" },
      loading: false,
      logout: jest.fn(),
      login: jest.fn(),
    });

    render(<Dashboard />);
    expect(screen.getByText("Bem-vinda, Maria")).toBeInTheDocument();
  });
});
```

### Quando NÃO mockar

Nem tudo deve ser mockado. Mockar demais cria testes frágeis que não refletem a realidade.

**✅ Mocke:**

- Requisições de rede (fetch, axios)
- Serviços externos (analytics, tracking)
- Timers e datas
- LocalStorage / SessionStorage

**❌ Não mocke:**

- Componentes internos (teste integrado é melhor)
- Lógica de negócio simples
- Utilidades puras (formatters, validators)

## 📊 Coverage: a métrica que mente

Coverage (cobertura) mede quantas linhas do código foram executadas durante os testes. Mas executar ≠ validar.

```typescript
// Este código tem 100% de cobertura...
export function divide(a: number, b: number) {
  return a / b;
}

it("should divide numbers", () => {
  divide(10, 2);
});
```

O teste executa a função, mas não valida nada. Não detecta divisão por zero. Não verifica o resultado. É inútil, mas conta como "coberto".

### Cobertura inteligente

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

### O que deve estar no coverage

Configure thresholds específicos por tipo de arquivo:

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
    statements: 60, // Componentes simples de UI não precisam de tanto
    branches: 50,
  },
}
```

**Priorize cobertura em:**

- `utils/` e `helpers/` → 90-95%
- `hooks/` customizados → 85-90%
- Lógica de negócio → 85-90%
- Componentes com lógica → 75-85%

**Relaxe cobertura em:**

- Componentes puramente visuais → 50-60%
- Tipos TypeScript → 0% (não são executáveis)
- Arquivos de configuração → não inclua

## 🎯 Patterns e antipatterns

### ✅ Pattern: AAA (Arrange, Act, Assert)

```typescript
it("should add item to cart", async () => {
  // Arrange - Prepara o cenário
  const mockAddToCart = jest.fn();
  render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);

  // Act - Executa a ação
  await userEvent.click(screen.getByRole("button", { name: /adicionar/i }));

  // Assert - Valida o resultado
  expect(mockAddToCart).toHaveBeenCalledWith(mockProduct.id);
});
```

### ✅ Pattern: Test factories

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

Uso:

```typescript
it("should show admin controls for admin users", () => {
  const adminUser = createUser({ role: "admin" });
  render(<Dashboard user={adminUser} />);

  expect(
    screen.getByRole("button", { name: /gerenciar/i })
  ).toBeInTheDocument();
});
```

### ❌ Antipattern: Teste duplicado

```typescript
// ❌ Não faça isso
it("should render email input", () => {
  render(<LoginForm />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
});

it("should render password input", () => {
  render(<LoginForm />);
  expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
});

it("should render submit button", () => {
  render(<LoginForm />);
  expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
});
```

```typescript
// ✅ Faça isso
it("should render login form with all fields", () => {
  render(<LoginForm />);

  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
});
```

### ❌ Antipattern: Teste frágil

```typescript
// ❌ Frágil - quebra com qualquer mudança no DOM
it("should show error", async () => {
  render(<Form />);
  const button = container.querySelector(".submit-btn");
  fireEvent.click(button!);

  await waitFor(() => {
    expect(container.querySelector(".error-msg")).toHaveTextContent("Erro");
  });
});
```

```typescript
// ✅ Robusto - usa queries semânticas
it("should show error message when form is invalid", async () => {
  render(<Form />);

  await userEvent.click(screen.getByRole("button", { name: /enviar/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(/erro/i);
});
```

## 🏗️ Testando componentes complexos

### Componente com múltiplas responsabilidades

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
      setErrors({ submit: "Erro ao processar pagamento" });
    }
  }

  // ... resto da implementação
}
```

```typescript
// src/components/CheckoutForm.test.tsx
describe("CheckoutForm", () => {
  const mockItems = [
    createProduct({ id: "1", name: "Produto 1", price: 100, quantity: 2 }),
    createProduct({ id: "2", name: "Produto 2", price: 50, quantity: 1 }),
  ];

  it("should display cart summary with correct total", () => {
    render(<CheckoutForm items={mockItems} onSubmit={jest.fn()} />);

    expect(screen.getByText("Produto 1")).toBeInTheDocument();
    expect(screen.getByText("Produto 2")).toBeInTheDocument();
    expect(screen.getByText(/total: r\$ 250,00/i)).toBeInTheDocument();
  });

  it("should complete checkout flow successfully", async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    render(<CheckoutForm items={mockItems} onSubmit={handleSubmit} />);

    // Step 1: Address
    await userEvent.type(screen.getByLabelText(/endereço/i), "Rua Teste, 123");
    await userEvent.type(screen.getByLabelText(/cidade/i), "São Paulo");
    await userEvent.click(screen.getByRole("button", { name: /próximo/i }));

    // Step 2: Payment
    await userEvent.type(
      screen.getByLabelText(/número do cartão/i),
      "4111111111111111"
    );
    await userEvent.type(screen.getByLabelText(/cvv/i), "123");
    await userEvent.click(screen.getByRole("button", { name: /próximo/i }));

    // Step 3: Review & Submit
    await userEvent.click(
      screen.getByRole("button", { name: /finalizar compra/i })
    );

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        address: "Rua Teste, 123",
        city: "São Paulo",
        cardNumber: "4111111111111111",
      })
    );
  });

  it("should show validation errors for incomplete fields", async () => {
    render(<CheckoutForm items={mockItems} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /próximo/i }));

    expect(
      await screen.findByText(/endereço é obrigatório/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/cidade é obrigatória/i)).toBeInTheDocument();
  });

  it("should display error message when payment fails", async () => {
    const handleSubmit = jest
      .fn()
      .mockRejectedValue(new Error("Payment failed"));
    render(<CheckoutForm items={mockItems} onSubmit={handleSubmit} />);

    // Preenche o formulário completo...
    // (código omitido por brevidade)

    await userEvent.click(screen.getByRole("button", { name: /finalizar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /erro ao processar pagamento/i
    );
  });
});
```

## 🎓 Melhores práticas consolidadas

### 1. Nomeação descritiva

```typescript
// ❌ Vago
it('should work', () => { ... });
it('test login', () => { ... });

// ✅ Específico
it('should authenticate user with valid credentials', () => { ... });
it('should display error message when email is invalid', () => { ... });
```

### 2. Um conceito por teste

```typescript
// ❌ Testa muita coisa junto
it("should handle form submission", async () => {
  render(<Form />);
  await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
  expect(screen.getByLabelText(/email/i)).toHaveValue("test@example.com");
  await userEvent.click(screen.getByRole("button"));
  expect(mockSubmit).toHaveBeenCalled();
  expect(screen.getByText(/sucesso/i)).toBeInTheDocument();
});

// ✅ Testes separados e focados
it("should update email field value when user types", async () => {
  render(<Form />);
  await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
  expect(screen.getByLabelText(/email/i)).toHaveValue("test@example.com");
});

it("should call onSubmit when form is submitted", async () => {
  const mockSubmit = jest.fn();
  render(<Form onSubmit={mockSubmit} />);
  await fillForm(); // helper function
  await userEvent.click(screen.getByRole("button", { name: /enviar/i }));
  expect(mockSubmit).toHaveBeenCalled();
});

it("should display success message after submission", async () => {
  render(<Form onSubmit={jest.fn().mockResolvedValue(undefined)} />);
  await fillForm();
  await userEvent.click(screen.getByRole("button", { name: /enviar/i }));
  expect(await screen.findByText(/sucesso/i)).toBeInTheDocument();
});
```

### 3. Use queries acessíveis

Prioridade de queries segundo a React Testing Library:

1. `getByRole` → Melhor para acessibilidade
2. `getByLabelText` → Ótimo para formulários
3. `getByPlaceholderText` → Bom para inputs
4. `getByText` → Use para conteúdo visível
5. `getByTestId` → Último recurso

```typescript
// ✅ Priorize queries semânticas
screen.getByRole("button", { name: /enviar/i });
screen.getByLabelText(/email/i);
screen.getByText(/bem-vindo/i);

// ❌ Evite queries frágeis
screen.getByTestId("submit-btn");
container.querySelector(".btn-primary");
```

### 4. Teste assíncrono corretamente

```typescript
// ❌ Não usa await - falha silenciosamente
it("should show success message", () => {
  render(<AsyncComponent />);
  userEvent.click(screen.getByRole("button"));
  expect(screen.getByText(/sucesso/i)).toBeInTheDocument(); // Pode não existir ainda
});

// ✅ Usa async/await e findBy
it("should show success message after async operation", async () => {
  render(<AsyncComponent />);
  await userEvent.click(screen.getByRole("button"));
  expect(await screen.findByText(/sucesso/i)).toBeInTheDocument();
});
```

### 5. Isole testes

```typescript
// ❌ Testes compartilham estado
let user: User;

beforeAll(() => {
  user = createUser(); // Criado uma vez para todos os testes
});

it("should update user name", () => {
  user.name = "New Name"; // Muda o estado compartilhado
  expect(user.name).toBe("New Name");
});

it("should have original name", () => {
  expect(user.name).toBe("Test User"); // ❌ Falha! Estado foi alterado
});

// ✅ Cada teste tem seu próprio estado
describe("User operations", () => {
  let user: User;

  beforeEach(() => {
    user = createUser(); // Novo para cada teste
  });

  it("should update user name", () => {
    user.name = "New Name";
    expect(user.name).toBe("New Name");
  });

  it("should have original name", () => {
    expect(user.name).toBe("Test User"); // ✅ Passa!
  });
});
```

## 🚨 Red flags: quando seu teste está errado

### 1. Teste que nunca falha

Se você comentar o código de produção e o teste continua passando, o teste é inútil.

### 2. Teste que testa o mock

```typescript
// ❌ Só testa se o mock foi chamado, não o comportamento real
it("should call fetchUser", async () => {
  const mockFetch = jest.fn();
  render(<Component fetchUser={mockFetch} />);
  await waitFor(() => expect(mockFetch).toHaveBeenCalled());
});
```

### 3. Teste que depende de ordem de execução

```typescript
// ❌ Se trocar a ordem, quebra
describe("Counter", () => {
  it("should start at 0", () => {
    render(<Counter />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should increment to 1", async () => {
    // ❌ Assume que o teste anterior rodou
    await userEvent.click(screen.getByRole("button", { name: /increment/i }));
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
```

### 4. Teste com sleeps e timeouts arbitrários

```typescript
// ❌ Flaky e lento
it("should update after delay", async () => {
  render(<Component />);
  await userEvent.click(screen.getByRole("button"));
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 😱
  expect(screen.getByText(/updated/i)).toBeInTheDocument();
});

// ✅ Use waitFor ou findBy
it("should update after async operation", async () => {
  render(<Component />);
  await userEvent.click(screen.getByRole("button"));
  expect(await screen.findByText(/updated/i)).toBeInTheDocument();
});
```

## 🎯 O mindset certo para testes

Testes unitários no frontend não são sobre atingir métricas. São sobre confiança.

A pergunta que devemos fazer não é "quanto código está coberto?", mas sim:

**"Se eu fizer deploy agora, vou dormir tranquilo?"**

Quando você escreve um teste pensando "isso precisa funcionar sempre, de qualquer jeito", você está no caminho certo.

Quando você escreve um teste pensando "preciso chegar em 80% de cobertura", você está criando débito técnico disfarçado de qualidade.

## 🎭 Conclusão: teste com propósito, não com métrica

A indústria de software criou uma obsessão doentia por cobertura de código. Times celebram "100% de cobertura" como se fosse um troféu, mas na prática isso pode significar absolutamente nada.

**O problema não é testar. O problema é testar sem pensar.**

Assim como no [efeito ENEM no código](/artigos/efeito-enem-no-codigo), onde aprendemos a passar de fase sem entender, muitos devs aprenderam a escrever testes que passam no CI sem proteger o código.

A verdadeira habilidade não está em fazer testes passarem — está em fazer testes que significam algo.

### Os princípios para levar

1. **Teste comportamento, não implementação** → Testes devem sobreviver a refatorações
2. **Teste como o usuário usa** → Se seu teste não simula uso real, não serve
3. **Cobertura é consequência, não objetivo** → Bons testes geram boa cobertura naturalmente
4. **Mock o mínimo necessário** → Quanto mais você mocka, menos confiança o teste dá
5. **Um teste deve ter uma razão clara de existir** → Se você não sabe por que está escrevendo, não escreva

### A pergunta final

Antes de escrever qualquer teste, pergunte-se:

**"Este teste vai me dar confiança para fazer deploy na sexta à tarde?"**

Se a resposta for não, você está escrevendo o teste errado.

Se a resposta for sim, você entendeu o propósito.

---

_Testes não são sobre garantir que o código compila. São sobre garantir que o produto funciona. E código que funciona não é aquele que passa no CI — é aquele que resolve o problema do usuário._

**Escreva menos testes, mas testes melhores.**

**Teste o que importa. Ignore o resto.**

## 📚 Referências e aprofundamento

Este artigo foi construído com base em práticas consolidadas e vozes respeitadas na comunidade:

- **Kent C. Dodds** — [Testing Library](https://testing-library.com/) e [Testing JavaScript](https://testingjavascript.com/): filosofia de testar como o usuário usa, não como o código está estruturado.

- **Martin Fowler** — [Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html): conceito de pirâmide de testes e quando usar cada tipo.

- **Kent Beck** — _Test-Driven Development: By Example_: fundamentos do TDD e como escrever testes que guiam o design.

- **Vladimir Khorikov** — _Unit Testing Principles, Practices, and Patterns_: distinção entre testes úteis e inúteis, quando usar mocks.

- **React Testing Library Docs** — [Guiding Principles](https://testing-library.com/docs/guiding-principles/): princípios fundamentais para testes de componentes React.

- **Jest Documentation** — [Best Practices](https://jestjs.io/docs/getting-started): setup e configuração de testes no ecossistema JavaScript.

- **Robert C. Martin (Uncle Bob)** — _Clean Code_ e _The Clean Coder_: responsabilidade na qualidade do código e disciplina em testes.

---

_Se este artigo te fez repensar sua abordagem de testes, ele cumpriu seu papel. Compartilhe com seu time e vamos elevar o nível dos testes no frontend brasileiro._

**👏 Gostou? Deixe um clap e compartilhe suas experiências nos comentários!**
