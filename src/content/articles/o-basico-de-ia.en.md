_How the same principles that feel "too basic to revisit" are exactly what separates people who use AI as a tool from people who get carried along by it_

## 🎯 The pain nobody wants to admit in 2026

Picture the scene: Tuesday, 2pm. A developer opens Cursor and types "build a checkout component that applies a coupon, calculates shipping and completes the order". Twelve seconds later, 180 lines of TSX appear. It works. The tests the AI generated for itself pass. PR opened, "LGTM", merged.

Three sprints later, product asks for the coupon to work in the cart too, not just at checkout. And the house comes down: the coupon logic is welded inside the checkout component, tangled with `fetch`, with UI state, with currency formatting and with the analytics call. To reuse it, somebody is going to copy and paste — and now there are two coupon validations that will diverge at the first bug fix.

The AI did not get it wrong. It did **exactly** what it was asked. The problem is that whoever asked had neither the vocabulary to ask better nor the criteria to reject what came back.

**AI became the new meta of software development. But it amplifies whoever uses it — upward or downward.** In the hands of someone who owns the fundamentals, it is an exoskeleton. In the hands of someone who only knows how to "make it work", it is a machine for producing technical debt at industrial speed.

And here comes the uncomfortable part: what separates those two developers is not some new, exotic "prompt engineering" skill. It is a set of foundations that were always there. SOLID is one of them. That is why we are going to talk about SOLID — yes, SOLID — not because it is new, but because it is the perfect example of something "too basic to review" that suddenly became the most valuable competence you can have.

## 🏛️ The origin: why a principle from the 2000s matters more now

The five SOLID principles were collected by Robert C. Martin (Uncle Bob) around 2000, and the acronym was popularized by Michael Feathers years later. The original intent was simple: give programmers a set of heuristics for writing object-oriented code that **survives change**.

For two decades, SOLID was treated in frontend as "a backend thing". "That's Java," people said. "React is just functions and props." And they had a point — applying classic OO to functional components sounds forced.

But SOLID was never about object orientation. **It was about managing coupling and dependency** — and that is universal. What changed in 2026 was not the principle. It was the context: now you do not write most of the code, you **review and direct** code that an AI writes. And to review with judgement, you need a ruler. SOLID is one of the sharpest rulers there is.

It is like being able to read sheet music. You can play by ear for years and do fine. But the day you need to conduct an orchestra of musicians who play faster than you do, without reading music, you do not conduct — you watch.

## 🧩 SOLID in the frontend, in practice

Let's go through all five, each translated into the world of components, hooks and state. Without dogma: the goal is judgement, not obedience.

### S — Single Responsibility Principle

> A module should have one, and only one, reason to change.

In the frontend, the cardinal sin is the component that does everything: fetches data, manages state, formats, validates, renders and fires analytics on top.

**❌ The Swiss-army component (probably what the AI handed you):**

```typescript
export function CheckoutForm() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then(setItems);
  }, []);

  function applyCoupon() {
    // raw business rule, inside the UI component
    if (coupon === "PROMO10") setDiscount(0.1);
    else if (coupon.startsWith("VIP")) setDiscount(0.2);
    else setDiscount(0);
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const finalTotal = total * (1 - discount);

  return (
    <form>
      {/* render + inline currency formatting + ... */}
      <span>$ {finalTotal.toFixed(2)}</span>
    </form>
  );
}
```

That component has at least four reasons to change: the endpoint changed, the coupon rule changed, the currency format changed, the layout changed. Each change risks breaking the other three.

**✅ Each responsibility in its place:**

```typescript
// business rules — pure, testable, no React
// domain/coupon.ts
export function calculateDiscount(coupon: string): number {
  if (coupon === "PROMO10") return 0.1;
  if (coupon.startsWith("VIP")) return 0.2;
  return 0;
}

// data access — isolated
// hooks/useCart.ts
export function useCart() {
  return useQuery({ queryKey: ["cart"], queryFn: fetchCart });
}

// the component only orchestrates and renders
// CheckoutForm.tsx
export function CheckoutForm() {
  const { data: items = [] } = useCart();
  const [coupon, setCoupon] = useState("");

  const discount = calculateDiscount(coupon);
  const finalTotal = applyDiscount(getCartTotal(items), discount);

  return (
    <form>
      <CouponInput value={coupon} onChange={setCoupon} />
      <PriceTag value={finalTotal} />
    </form>
  );
}
```

Now `calculateDiscount` is a pure function you test in three lines and reuse in the cart, in the summary, wherever you want. **The business rule stopped being a hostage of the UI.**

### O — Open/Closed Principle

> Open for extension, closed for modification.

You should be able to add behaviour without rewriting what already works. In the frontend this almost always becomes **composition** and **configuration maps** instead of `if/else` chains that grow forever.

**❌ Closed for extension (every new variation edits the same file):**

```typescript
function Notification({ type, message }: Props) {
  if (type === "success") return <div className="green">✅ {message}</div>;
  if (type === "error") return <div className="red">❌ {message}</div>;
  if (type === "warning") return <div className="yellow">⚠️ {message}</div>;
  // every new notification = edit this function and risk a regression
}
```

**✅ Open via a configuration map:**

```typescript
const VARIANTS = {
  success: { className: "green", icon: "✅" },
  error: { className: "red", icon: "❌" },
  warning: { className: "yellow", icon: "⚠️" },
} satisfies Record<string, NotificationVariant>;

function Notification({ type, message }: Props) {
  const { className, icon } = VARIANTS[type];
  return <div className={className}>{icon} {message}</div>;
}
// new variant = new entry in the map. The component does not change.
```

When you ask the AI to "add an info notification type", the first version rarely respects OCP — it will hand you one more `if`. Knowing that is what makes you answer "no, do it through configuration" instead of accepting the fifth `else`.

### L — Liskov Substitution Principle

> Subtypes must be substitutable for their base types without breaking the program.

In the frontend, this is about **respecting prop contracts**. If you create an `IconButton`, it needs to behave like a `Button` anywhere a `Button` is expected — including `disabled`, `onClick`, `type`, accessibility.

**❌ Violates the contract — the "button" that swallows props:**

```typescript
function IconButton({ icon }: { icon: ReactNode }) {
  return <div onClick={() => track("click")}>{icon}</div>;
  // not a <button>, ignores disabled, not focusable, breaks keyboard and a11y
}
```

Swap a `Button` for that `IconButton` and the screen breaks in subtle ways: `disabled` does nothing, `Enter` does not fire, the screen reader does not announce it. That is a Liskov violation.

**✅ Honours the base contract:**

```typescript
type IconButtonProps = ComponentProps<"button"> & { icon: ReactNode };

function IconButton({ icon, ...props }: IconButtonProps) {
  return (
    <button {...props}>
      {icon}
    </button>
  );
  // accepts disabled, onClick, type, aria-* — everything a button accepts
}
```

`ComponentProps<"button">` is Liskov in the shape of a type: it forces the component to be a legitimate substitute for the element it claims to represent.

### I — Interface Segregation Principle

> No client should be forced to depend on something it does not use.

In the frontend: **do not force a component to receive a giant object when it only uses three fields.** Bloated props couple the component to data that is none of its business.

**❌ Bloated interface:**

```typescript
// receives the WHOLE user just to show a name and an avatar
function UserBadge({ user }: { user: FullUserEntity }) {
  return <div>{user.name} <img src={user.avatarUrl} /></div>;
}
// now UserBadge "depends" on address, orders, permissions... which it never touches
```

**✅ Lean interface, only what is needed:**

```typescript
function UserBadge({ name, avatarUrl }: { name: string; avatarUrl: string }) {
  return <div>{name} <img src={avatarUrl} /></div>;
}
// depends only on what it uses. Testable with two fields. Reusable anywhere.
```

The payoff is direct: you can render `UserBadge` in a test or in Storybook without assembling a complete user entity — and changes to `FullUserEntity` stop haunting components that did not even know it existed.

### D — Dependency Inversion Principle

> Depend on abstractions, not on concrete implementations.

This is the most powerful one in the frontend and the one AI neglects most. Components should not `fetch` straight from a hardcoded endpoint. They should depend on an **abstraction** that can be swapped, mocked and evolved.

**❌ Component coupled to the concrete detail:**

```typescript
function ProductList() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    // tied to fetch, to this URL, to this format. Impossible to test without the network.
    fetch("https://api.prod.com/v1/products").then(/* ... */);
  }, []);
}
```

**✅ Depends on the abstraction, receives the implementation:**

```typescript
// the abstraction (contract)
interface ProductRepository {
  list(): Promise<Product[]>;
}

// the component depends on the abstraction, via hook/context
function ProductList() {
  const repo = useProductRepository(); // injected
  const { data } = useQuery({ queryKey: ["products"], queryFn: () => repo.list() });
  // ...
}

// production injects HTTP; tests inject a fake; nobody touches the component
<ProductRepositoryProvider value={httpProductRepository}>
  <ProductList />
</ProductRepositoryProvider>
```

Notice this is exactly the spirit of the [BFF](/artigos/bff-frontend-revolucao) and of the shared context in [Micro Frontends](/artigos/micro-frontends): you program against contracts, not against implementations. Dependency inversion is the principle that makes the rest of your architecture possible.

## 🤖 Now the part that matters: SOLID is only the example

If you are senior, nothing above was new. You may even have thought "this is basic, why am I reading it again?".

That reaction **is the point of this article.**

Because the question that defines the next few years of your career is not "do you know SOLID?". It is: **"when the AI hands you 180 lines, can you look at it and say, within seconds, that the business rule is coupled to the UI, that that `if` violates Open/Closed, and that the component depends on a concrete endpoint instead of an abstraction?"**

Whoever lacks those foundations is not orchestrating the AI. They are **outsourcing judgement** to it. And AI has no judgement — it has a statistical distribution of what is most likely to appear in the next token. It produces the internet's median code, with absolute confidence. It falls to you to be the filter.

### What AI does well — and what it does not

AI is extraordinary at **executing within a direction**. It types faster, remembers more APIs, generates boilerplate without complaining, translates between frameworks. That is real and it is enormous.

What it does not do is **decide what is worth building and how it should be structured to survive change.** That requires:

- **Algorithms and data structures** — to know that the `find` inside a `map` the AI generated is O(n²) and will melt with ten thousand items, and that a `Map` solves it in O(n).
- **Design patterns** — to recognize that the problem calls for a Strategy, not another `switch`, and to ask for that explicitly.
- **Architecture** — to know where the business rule lives, where state lives, and why the component should not know the endpoint.
- **SOLID and coupling** — to review the output and separate what will scale from what will become debt.
- **Platform fundamentals** (network, rendering, accessibility) — to notice that the AI's "it works" breaks in Safari, or blocks the main thread, or is not keyboard navigable.

These foundations are not what you **type**. They are what lets you **evaluate and direct**. They are the difference between a prompt and an architecture.

### The "it works" trap — now supercharged

We have talked about this here before. In [the exam effect in code](/artigos/efeito-enem-no-codigo), the addiction was delivering the minimum to clear the level without understanding why. AI did not create that problem — it **put it on steroids.**

Before, the dev who did not understand was at least forced to read Stack Overflow, assemble pieces, stumble and learn something along the way. The friction taught. Now the friction is gone: the code shows up finished, it works, and the chance to learn evaporated with it. "Tick the box and close the task" became "accept the diff and close the task".

And just like in [unit testing](/artigos/testes-unitarios-no-frontend) — where 100% coverage could mean 0% confidence — now we have something new: **100% apparent productivity with 0% comprehension.** You ship three times faster and understand three times less of what you ship.

The dev who knows SOLID reads the AI output and thinks "this is going to cost me dearly in two months". The dev who does not reads the same output and thinks "it worked, next". Both use the same tool. Only one of them is in control.

## ✅ When to apply it (and when to ease off)

SOLID and fundamentals are not a religion. Maturity is knowing the dose.

**Worth applying rigorously when:**

- The code is a business rule (validation, calculation, domain flow) — coupling is very expensive here.
- The component will be reused by several teams or MFEs.
- The AI generated something you are going to maintain for a long time.
- You are reviewing a large diff that "arrived finished" — that is where problems hide.

**You can ease off when:**

- It is a throwaway prototype, a spike, an experiment that dies tomorrow.
- The component is purely visual and trivial, with no logic.
- Applying the principle would add more abstraction than value — over-engineering is as bad as the opposite.

The question is not "is it SOLID?". It is **"will this code survive the next change without hurting me?"**. SOLID is a means to answer that, not an end.

## 🚨 Anti-patterns of the AI era

**Accepting the diff without reading it.** The most common and the most dangerous. If you could not have written that code, you cannot evaluate it — you are only gambling.

**Asking vaguely, accepting generic.** "Create a table component" produces the internet's median component. "Create a table that receives its columns via configuration (Open/Closed) and its data via a repository abstraction (DIP)" produces architecture. **The prompt reflects your technical vocabulary.**

**Letting the AI decide architecture.** Use AI to implement the structure *you* decided, not to decide the structure. The decision about where the business rule lives is yours.

**Mistaking speed for progress.** Shipping fast code that will cost you three sprints of maintenance is not productivity — it is debt with interest, paid forward.

**Stopping learning because "the AI knows".** The AI knows the average. Your competitive advantage is precisely knowing more than the average — and that is only built by studying the fundamentals that look dispensable.

## 🎯 The right mindset for the AI era

AI does not replace you. **What replaces you is another person who uses AI better than you do** — and using it better means having the foundations to steer, review and correct.

The principles to take with you:

1. **Fundamentals are leverage, not baggage.** The more you know, the more AI multiplies. The less you know, the more it amplifies your mistakes.
2. **You are the architect, the AI is the construction crew.** Decide the structure; delegate the typing.
3. **Reviewing is the new core competence.** Being able to generate code became a commodity. Being able to judge code became rare.
4. **A prompt is only as good as whoever writes it.** Technical vocabulary becomes direction; its absence becomes generic code.
5. **The friction AI removed was where you learned.** Reintroduce it on purpose: question the diff, refactor by hand now and then, understand the why.

## The final question

Before you accept the next block of code the AI hands you, ask yourself:

**"Am I orchestrating this tool, or just signing off on what it decided?"**

If you can look at 180 lines and point out where responsibility leaked, where coupling is going to hurt and where the abstraction is missing — you are the conductor. The AI plays faster than you ever would, but you are the one conducting.

If you cannot, the tool is not yours. **You are its tool.**

And the difference between the two is not in any "AI for devs" course. It is in what was always there, waiting for you to take it seriously: SOLID, design patterns, algorithms, architecture. The basics that were never basic.

---

_AI is the new meta of software development. But a meta favours whoever knows the game underneath the meta. The fundamentals did not become obsolete — they became decisive. Because for the first time, people who lack them can produce code that looks good enough to fool themselves. And that is the most expensive trap of our generation._

**Master the basics. It is the only way to make AI work for you — and not the other way around.**

## 📚 References and further reading

This article was built on consolidated engineering principles and on the reflection of how they become more relevant — not less — in the AI era:

- **Robert C. Martin (Uncle Bob)** — _Agile Software Development, Principles, Patterns, and Practices_ and _Clean Architecture_: the origin of the SOLID acronym and the case for architecture that survives change.

- **Michael Feathers** — popularized the SOLID acronym and wrote _Working Effectively with Legacy Code_: how to deal with code you do not understand — a central skill when reviewing AI output.

- **Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides (Gang of Four)** — _Design Patterns_: the vocabulary that turns vague intent into precise direction.

- **Martin Fowler** — [Refactoring](https://martinfowler.com/) and writings on evolutionary design: why structure matters more when change is constant.

- **Andrej Karpathy** — public reflections on "software 2.0/3.0" and the human role of steering and verification in AI-assisted development.

- **Kent Beck** — _Tidy First?_ and the idea that design is about the economics of change, not aesthetics.

- **Dan Abramov** — writings on composition and abstraction in React: when to abstract and, above all, when not to.

---

_If this article bothered you because it talked about something you "already know", it may be exactly what you needed to reread. The discomfort of revisiting the basics is what separates people who evolve from people who get left behind. Share it with your team and let's raise the level of everyone orchestrating AI in the frontend._

**👏 Enjoyed it? Leave a clap and tell me in the comments: are you conducting the AI, or playing on autopilot?**
