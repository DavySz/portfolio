_Como os mesmos princípios que parecem "básicos demais" são exatamente o que separa quem usa IA como ferramenta de quem é carregado por ela_

## 🎯 A dor que ninguém quer admitir em 2026

Imagine a seguinte cena: terça-feira, 14h. Um desenvolvedor abre o Cursor, digita "crie um componente de checkout que aplica cupom, calcula frete e finaliza o pedido". Em doze segundos, surgem 180 linhas de TSX. Funciona. Os testes que a própria IA gerou passam. PR aberto, "LGTM", merge.

Três sprints depois, o produto pede para o cupom também valer no carrinho, não só no checkout. E aí a casa cai: a lógica do cupom está soldada dentro do componente de checkout, misturada com `fetch`, com estado de UI, com formatação de moeda e com a chamada de analytics. Para reusar, alguém vai copiar e colar — e agora existem duas validações de cupom que vão divergir na primeira correção.

A IA não errou. Ela fez **exatamente** o que foi pedido. O problema é que quem pediu não tinha vocabulário para pedir melhor, nem critério para rejeitar o que veio.

**A IA virou o novo meta do desenvolvimento. Mas ela amplifica quem a usa — para cima ou para baixo.** Nas mãos de quem domina os fundamentos, ela é um exoesqueleto. Nas mãos de quem só sabe "fazer funcionar", ela é uma máquina de produzir débito técnico em velocidade industrial.

E aqui vem o ponto incômodo: o que separa esses dois desenvolvedores não é nenhuma habilidade nova e exótica de "prompt engineering". É um conjunto de bases que sempre estiveram ali. SOLID é uma delas. Por isso vamos falar de SOLID — sim, SOLID — não porque é novidade, mas porque ele é o exemplo perfeito de algo "básico demais para revisar" que virou, de repente, a competência mais valiosa que você pode ter.

## 🏛️ A origem: por que um princípio dos anos 2000 importa mais agora

Os cinco princípios SOLID foram reunidos por Robert C. Martin (Uncle Bob) por volta de 2000, e o acrônimo foi popularizado por Michael Feathers anos depois. A intenção original era simples: dar a programadores um conjunto de heurísticas para escrever código orientado a objetos que **resistisse à mudança**.

Por duas décadas, SOLID foi tratado no frontend como "coisa de backend". "Isso é Java", diziam. "React é só função e props." E em parte havia razão — aplicar OO clássico em componentes funcionais soa forçado.

Mas SOLID nunca foi sobre orientação a objetos. **Era sobre gerenciar acoplamento e dependência** — e isso é universal. O que mudou em 2026 não foi o princípio. Foi o contexto: agora você não escreve a maior parte do código, você **revisa e direciona** código que uma IA escreve. E para revisar com critério, você precisa de uma régua. SOLID é uma das réguas mais afiadas que existem.

É como saber ler partitura. Você pode tocar de ouvido por anos e se virar bem. Mas no dia em que precisar reger uma orquestra de músicos que tocam mais rápido que você, sem saber ler partitura, você não rege — você assiste.

## 🧩 SOLID no Frontend, na prática

Vamos passar pelos cinco, cada um traduzido para o mundo de componentes, hooks e estado. Sem dogmatismo: o objetivo é o critério, não a obediência.

### S — Single Responsibility Principle

> Um módulo deve ter uma, e apenas uma, razão para mudar.

No frontend, o pecado mortal é o componente que faz tudo: busca dados, gerencia estado, formata, valida, renderiza e ainda dispara analytics.

**❌ O componente-canivete-suíço (provavelmente o que a IA te deu):**

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
    // regra de negócio crua, dentro do componente de UI
    if (coupon === "PROMO10") setDiscount(0.1);
    else if (coupon.startsWith("VIP")) setDiscount(0.2);
    else setDiscount(0);
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const finalTotal = total * (1 - discount);

  return (
    <form>
      {/* render + formatação de moeda inline + ... */}
      <span>R$ {finalTotal.toFixed(2).replace(".", ",")}</span>
    </form>
  );
}
```

Esse componente tem pelo menos quatro razões para mudar: mudou o endpoint, mudou a regra do cupom, mudou o formato de moeda, mudou o layout. Cada mudança é um risco de quebrar as outras três.

**✅ Cada responsabilidade no seu lugar:**

```typescript
// regras de negócio — puras, testáveis, sem React
// domain/coupon.ts
export function calculateDiscount(coupon: string): number {
  if (coupon === "PROMO10") return 0.1;
  if (coupon.startsWith("VIP")) return 0.2;
  return 0;
}

// acesso a dados — isolado
// hooks/useCart.ts
export function useCart() {
  return useQuery({ queryKey: ["cart"], queryFn: fetchCart });
}

// o componente só orquestra e renderiza
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

Agora `calculateDiscount` é uma função pura que você testa em três linhas e reusa no carrinho, no resumo, onde quiser. **A regra de negócio deixou de ser refém da UI.**

### O — Open/Closed Principle

> Aberto para extensão, fechado para modificação.

Você deve conseguir adicionar comportamento sem reescrever o que já funciona. No frontend, isso quase sempre vira **composição** e **mapas de configuração** em vez de cadeias de `if/else` que crescem para sempre.

**❌ Fechado para extensão (toda nova variação edita o mesmo arquivo):**

```typescript
function Notification({ type, message }: Props) {
  if (type === "success") return <div className="green">✅ {message}</div>;
  if (type === "error") return <div className="red">❌ {message}</div>;
  if (type === "warning") return <div className="yellow">⚠️ {message}</div>;
  // toda notificação nova = editar essa função e arriscar regressão
}
```

**✅ Aberto via mapa de configuração:**

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
// nova variante = nova entrada no mapa. O componente não muda.
```

Quando você pede para a IA "adicionar um tipo de notificação info", a primeira versão raramente respeita OCP — ela vai te entregar mais um `if`. Saber disso é o que te faz responder "não, faça via configuração" em vez de aceitar o quinto `else`.

### L — Liskov Substitution Principle

> Subtipos devem ser substituíveis por seus tipos base sem quebrar o programa.

No frontend, isso é sobre **respeitar contratos de props**. Se você cria um `IconButton`, ele precisa se comportar como um `Button` onde quer que um `Button` seja esperado — incluindo `disabled`, `onClick`, `type`, acessibilidade.

**❌ Viola o contrato — o "botão" que engole props:**

```typescript
function IconButton({ icon }: { icon: ReactNode }) {
  return <div onClick={() => track("click")}>{icon}</div>;
  // não é <button>, ignora disabled, não é focável, quebra teclado e a11y
}
```

Troque um `Button` por esse `IconButton` e a tela quebra de formas sutis: o `disabled` não funciona, o `Enter` não dispara, o leitor de tela não anuncia. Isso é violação de Liskov.

**✅ Honra o contrato base:**

```typescript
type IconButtonProps = ComponentProps<"button"> & { icon: ReactNode };

function IconButton({ icon, ...props }: IconButtonProps) {
  return (
    <button {...props}>
      {icon}
    </button>
  );
  // aceita disabled, onClick, type, aria-* — tudo que um button aceita
}
```

`ComponentProps<"button">` é Liskov em forma de tipo: ele força o componente a ser um substituto legítimo do elemento que diz representar.

### I — Interface Segregation Principle

> Nenhum cliente deve ser forçado a depender de algo que não usa.

No frontend: **não force um componente a receber um objeto gigante quando ele só usa três campos.** Props infladas acoplam o componente a dados que não lhe dizem respeito.

**❌ Interface inchada:**

```typescript
// recebe o usuário INTEIRO só para mostrar nome e avatar
function UserBadge({ user }: { user: FullUserEntity }) {
  return <div>{user.name} <img src={user.avatarUrl} /></div>;
}
// agora UserBadge "depende" de endereço, pedidos, permissões... que nunca toca
```

**✅ Interface enxuta, só o necessário:**

```typescript
function UserBadge({ name, avatarUrl }: { name: string; avatarUrl: string }) {
  return <div>{name} <img src={avatarUrl} /></div>;
}
// só depende do que usa. Testável com dois campos. Reusável em qualquer contexto.
```

O ganho é direto: você consegue renderizar `UserBadge` num teste ou num Storybook sem montar uma entidade de usuário completa — e mudanças no `FullUserEntity` param de assombrar componentes que nem sabiam que ele existia.

### D — Dependency Inversion Principle

> Dependa de abstrações, não de implementações concretas.

Este é o mais poderoso no frontend e o mais negligenciado pela IA. Componentes não deveriam dar `fetch` direto num endpoint cravado. Eles deveriam depender de uma **abstração** que pode ser trocada, mockada e evoluída.

**❌ Componente acoplado ao detalhe concreto:**

```typescript
function ProductList() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    // amarrado a fetch, a essa URL, a esse formato. Impossível testar sem rede.
    fetch("https://api.prod.com/v1/products").then(/* ... */);
  }, []);
}
```

**✅ Depende da abstração, recebe a implementação:**

```typescript
// a abstração (contrato)
interface ProductRepository {
  list(): Promise<Product[]>;
}

// o componente depende da abstração, via hook/contexto
function ProductList() {
  const repo = useProductRepository(); // injetado
  const { data } = useQuery({ queryKey: ["products"], queryFn: () => repo.list() });
  // ...
}

// produção injeta HTTP; teste injeta um fake; ninguém toca no componente
<ProductRepositoryProvider value={httpProductRepository}>
  <ProductList />
</ProductRepositoryProvider>
```

Repare que esse é exatamente o espírito do [BFF](/artigos/bff-frontend-revolucao) e do contexto compartilhado dos [Micro Frontends](/artigos/micro-frontends): você programa contra contratos, não contra implementações. Inversão de dependência é o princípio que faz o resto da sua arquitetura ser possível.

## 🤖 Agora a parte que importa: SOLID é só o exemplo

Se você é sênior, nada acima foi novidade. Talvez você tenha até pensado "isso é básico, por que estou lendo de novo?".

Essa reação **é o ponto do artigo.**

Porque a pergunta que define os próximos anos da sua carreira não é "você sabe SOLID?". É: **"quando a IA te entregar 180 linhas, você consegue olhar e dizer, em segundos, que a regra de negócio está acoplada à UI, que aquele `if` viola Open/Closed, e que o componente depende de um endpoint concreto em vez de uma abstração?"**

Quem não tem essas bases não está orquestrando a IA. Está **terceirizando o julgamento** para ela. E IA não tem julgamento — tem distribuição estatística do que é mais provável aparecer no próximo token. Ela produz o código mediano da internet, com confiança absoluta. Cabe a você ser o filtro.

### O que a IA faz bem — e o que ela não faz

A IA é extraordinária em **executar dentro de uma direção**. Ela digita mais rápido, lembra de mais APIs, gera boilerplate sem reclamar, traduz entre frameworks. Isso é real e é enorme.

O que ela não faz é **decidir o que vale a pena construir e como ele deve ser estruturado para sobreviver à mudança.** Isso exige:

- **Algoritmos e estrutura de dados** — para saber que aquele `find` dentro de um `map` que a IA gerou é O(n²) e vai derreter com 10 mil itens, e que um `Map` resolve em O(n).
- **Design patterns** — para reconhecer que o problema pede um Strategy, não mais um `switch`, e pedir isso explicitamente.
- **Arquitetura** — para saber onde a regra de negócio mora, onde o estado vive, e por que o componente não deveria conhecer o endpoint.
- **SOLID e acoplamento** — para revisar a saída e separar o que vai escalar do que vai virar dívida.
- **Fundamentos da plataforma** (rede, rendering, acessibilidade) — para perceber que o "funciona" da IA quebra no Safari, ou bloqueia a thread principal, ou não é navegável por teclado.

Essas bases não são o que você **digita**. São o que te permite **avaliar e direcionar**. São a diferença entre prompt e arquitetura.

### A armadilha do "funciona" — agora turbinada

Já falamos disso aqui antes. No [efeito ENEM no código](/artigos/efeito-enem-no-codigo), o vício era entregar o mínimo para passar de fase sem entender o porquê. A IA não criou esse problema — ela **colocou esteroides nele.**

Antes, o dev que não entendia pelo menos era forçado a ler StackOverflow, juntar peças, tropeçar e aprender alguma coisa no caminho. A fricção ensinava. Agora a fricção sumiu: o código aparece pronto, funciona, e a oportunidade de aprender evaporou junto. O "marca o X e fecha a task" virou "aceita o diff e fecha a task".

E assim como em [testes unitários](/artigos/testes-unitarios-no-frontend) — onde 100% de cobertura podia significar 0% de confiança — agora temos algo novo: **100% de produtividade aparente com 0% de compreensão.** Você entrega três vezes mais rápido e entende três vezes menos do que entrega.

O dev que sabe SOLID lê o output da IA e pensa "isso vai me custar caro daqui a dois meses". O dev que não sabe lê o mesmo output e pensa "funcionou, próximo". Os dois usam a mesma ferramenta. Só um deles está no controle.

## ✅ Quando aplicar (e quando relaxar)

SOLID e fundamentos não são religião. A maturidade está em saber a dose.

**Vale aplicar com rigor quando:**

- O código é regra de negócio (validação, cálculo, fluxo de domínio) — aqui acoplamento custa caríssimo.
- O componente vai ser reusado por vários times ou MFEs.
- A IA gerou algo que você vai manter por muito tempo.
- Você está revisando um diff grande que "veio pronto" — é onde os problemas se escondem.

**Pode relaxar quando:**

- É um protótipo descartável, uma spike, um experimento que morre amanhã.
- O componente é puramente visual e trivial, sem lógica.
- Aplicar o princípio adicionaria mais abstração do que valor — over-engineering é tão ruim quanto o oposto.

A pergunta não é "está SOLID?". É **"este código vai sobreviver à próxima mudança sem me machucar?"**. SOLID é um meio para responder isso, não um fim.

## 🚨 Anti-patterns da era da IA

**Aceitar o diff sem ler.** O mais comum e o mais perigoso. Se você não conseguiria escrever aquele código, você não consegue avaliá-lo — você só está apostando.

**Pedir vago, aceitar genérico.** "Cria um componente de tabela" gera o componente mediano da internet. "Cria uma tabela que recebe as colunas via configuração (Open/Closed) e os dados via uma abstração de repositório (DIP)" gera arquitetura. **O prompt reflete o seu vocabulário técnico.**

**Deixar a IA decidir arquitetura.** Use a IA para implementar a estrutura que *você* decidiu, não para decidir a estrutura. A decisão de onde mora a regra de negócio é sua.

**Confundir velocidade com progresso.** Entregar rápido código que vai te custar três sprints de manutenção não é produtividade — é dívida com juros, antecipada.

**Parar de aprender porque "a IA sabe".** A IA sabe a média. Sua vantagem competitiva é justamente saber mais que a média — e isso só se constrói estudando os fundamentos que parecem dispensáveis.

## 🎯 O mindset certo para a era da IA

A IA não te substitui. **Quem te substitui é outra pessoa que usa IA melhor que você** — e usar melhor significa ter as bases para dirigir, revisar e corrigir.

Os princípios para levar:

1. **Fundamentos são alavanca, não bagagem.** Quanto mais você sabe, mais a IA multiplica. Quanto menos, mais ela amplifica seus erros.
2. **Você é o arquiteto, a IA é a obra.** Decida a estrutura; delegue a digitação.
3. **Revisar é a nova competência central.** Saber gerar código virou commodity. Saber julgar código virou raro.
4. **O prompt é tão bom quanto quem o escreve.** Vocabulário técnico vira direção; sua ausência vira código genérico.
5. **A fricção que a IA removeu era onde você aprendia.** Reintroduza-a de propósito: questione o diff, refatore à mão de vez em quando, entenda o porquê.

## A pergunta final

Antes de aceitar o próximo bloco de código que a IA te entregar, pergunte-se:

**"Eu estou orquestrando essa ferramenta, ou só assinando embaixo do que ela decidiu?"**

Se você consegue olhar 180 linhas e apontar onde a responsabilidade vazou, onde o acoplamento vai doer e onde a abstração está faltando — você é o maestro. A IA toca mais rápido do que você jamais tocaria, mas é você quem rege.

Se você não consegue, a ferramenta não é sua. **Você é a ferramenta dela.**

E a diferença entre os dois não está em nenhum curso de "IA para devs". Está naquilo que sempre esteve ali, esperando que você levasse a sério: SOLID, design patterns, algoritmos, arquitetura. O básico que nunca foi básico.

---

_A IA é o novo meta do desenvolvimento. Mas meta favorece quem conhece o jogo por baixo do meta. Os fundamentos não ficaram obsoletos — eles ficaram decisivos. Porque pela primeira vez, quem não os tem consegue produzir código que parece bom o suficiente para enganar a si mesmo. E essa é a armadilha mais cara da nossa geração._

**Domine o básico. É a única forma de a IA trabalhar para você — e não o contrário.**

## 📚 Referências e aprofundamento

Este artigo foi construído sobre princípios consolidados de engenharia e sobre a reflexão de como eles se tornam mais relevantes — não menos — na era da IA:

- **Robert C. Martin (Uncle Bob)** — _Agile Software Development, Principles, Patterns, and Practices_ e _Clean Architecture_: a origem do acrônimo SOLID e a defesa de arquitetura que resiste à mudança.

- **Michael Feathers** — popularizou o acrônimo SOLID e escreveu _Working Effectively with Legacy Code_: como lidar com código que você não entende — habilidade central ao revisar saída de IA.

- **Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides (Gang of Four)** — _Design Patterns_: o vocabulário que transforma intenção vaga em direção precisa.

- **Martin Fowler** — [Refactoring](https://martinfowler.com/) e escritos sobre design evolutivo: por que estrutura importa mais quando a mudança é constante.

- **Andrej Karpathy** — reflexões públicas sobre "software 2.0/3.0" e o papel humano de direção e verificação no desenvolvimento assistido por IA.

- **Kent Beck** — _Tidy First?_ e a ideia de que design é sobre economia de mudança, não estética.

- **Dan Abramov** — escritos sobre composição e abstração em React: quando abstrair e, principalmente, quando não.

---

_Se este artigo te incomodou por falar de algo que você "já sabe", talvez seja exatamente o que você precisava reler. O desconforto de revisitar o básico é o que separa quem evolui de quem é ultrapassado. Compartilhe com seu time e vamos elevar o nível de quem está orquestrando IA no frontend brasileiro._

**👏 Gostou? Deixe um clap e conte nos comentários: você está regendo a IA, ou tocando no automático?**
