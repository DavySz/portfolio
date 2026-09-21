# Dark mode — plano

> **Fase 2 concluída.** Branch `feat/dark-mode`, a partir de `feat/path-routing`.
> Plano em `7a33615`, implementação em `ed90599..d920ccb`.
>
> As três decisões em aberto ao fim da Fase 1 foram aprovadas com "pode seguir
> como achar que fica melhor": densidade da nav, paleta derivada do bloco de
> código e três estados.

## Notas de escopo

**Duas das três skills pedidas não existem.** O marketplace oficial traz só
`frontend-design`; não há `design-system` nem `accessibility-review`. Usei a que
existe como lente de direção visual e fiz tokens e contraste com o mesmo método
da auditoria — fórmula WCAG 2.x em espaço linear, sobre os hex reais.

**A decisão de comportamento veio em branco** (`[seguir o sistema + botão de
três estados / só seguir o sistema, sem botão]`). O bullet seguinte do briefing
especifica o botão, o alvo de toque e o rótulo acessível, o que exclui a segunda
opção. Segui com **três estados — sistema / claro / escuro — padrão no sistema,
escolha persistida**. Se a intenção era outra, é aqui que muda.

---

## 1. Inventário

### 1.1 Tokens do tema (`tailwind.config.js`)

`primary-50..900`, `secondary-50..900` e `semantic-{success,warning,error,info}`.
**Os `semantic-*` não são usados em lugar nenhum** — nenhuma ocorrência no
código. Ficam fora do escopo do dark mode.

### 1.2 Classes de cor em uso

As 20 mais frequentes, de 45 distintas:

| classe | usos | classe | usos |
| --- | --- | --- | --- |
| `text-white` | 14 | `bg-white` | 5 |
| `text-primary-600` | 14 | `bg-transparent` | 5 |
| `text-primary-700` | 13 | `text-primary-800` | 4 |
| `ring-primary-500` | 13 | `text-gray-500` | 4 |
| `text-gray-900` | 10 | `border-primary-500` | 4 |
| `bg-primary-50` | 9 | `border-gray-100` | 4 |
| `border-gray-200` | 7 | `bg-secondary-50` | 4 |
| `text-gray-600` | 6 | `text-secondary-900` | 2 |
| `from-primary-500` / `to-primary-900` | 6 | `bg-secondary-900` | 2 |
| `text-gray-700` | 5 | `bg-gray-400` | 2 |

### 1.3 Cores escritas à mão

| hex | onde | destino |
| --- | --- | --- |
| `#653bbe` | comentário em `text/index.tsx` (ponto mais claro do shader) | referência, não muda |
| `#FFFFFF` `#E9E3FF` `#7041CF` | `button/styles.ts`, cor dos ícones | vira token |
| `#7947DF` | `HeroBackground.ts` (BRAND), `constants.ts` (log do console) | shader e console, não mudam |
| `#7947df55` `#2a176099` `#0e0a1a` | `.experience-fallback-hero` no CSS | não mudam (ver §4.4) |
| `#15102b` `#1d1640` `#2c2150` `#b8a6f0` `#9a8fc4` e 8 cores `hljs-*` | bloco de código dos artigos | **viram a base da paleta escura** (ver §2.1) |
| `#61DAFB` `#F7DF1E` `#007ACC` … | ícones de tecnologia em `skills/constants.tsx` | cores de marca de terceiros, não mudam |

### 1.4 O que quebra no escuro

Medido, não suposto:

| # | O que | Por quê | Razão medida |
| --- | --- | --- | --- |
| **Q1** | Títulos de seção (`Text color="gradient"`) | `from-primary-500 to-primary-900`: a ponta escura do gradiente encosta no fundo | **1,34:1** — ilegível |
| **Q2** | `LayeredStack` (cena 3D da seção "Sobre mim") | `SHADOW = #2A1454` fica a 1,23:1 do fundo escuro — o objeto perde o contorno | **1,23:1** |
| **Q3** | `bg-secondary-50` (fundo da seção Expertise) | lavanda claro, vira uma faixa branca no meio do escuro | — |
| **Q4** | `bg-white` em 5 pontos (cards, painel do menu, nav) | vira bloco branco | — |
| **Q5** | Rodapé `bg-secondary-900` | já é escuro: no modo escuro deixa de se distinguir do resto | Δ L* = −3,1 |
| **Q6** | Blocos de código dos artigos | já são escuros: no modo escuro somem dentro da página | ver §4.1 |
| **Q7** | `border-gray-100/200/300` | bordas claras sobre fundo escuro viram linhas brilhantes | — |
| **Q8** | Sombras (`shadow-lg`, `shadow-card`) | sombra preta sobre fundo escuro não existe | — |

---

## 2. Tokens semânticos

### 2.1 A direção visual

O escuro **não é inventado**: o site já tem um vocabulário escuro, hoje
espalhado em três lugares — o fundo do hero (`#0E0A1A`), os blocos de código dos
artigos (`#15102B`, `#1D1640`, `#2C2150`) e o rodapé (`#2A1454`).

A proposta é promover essa família a paleta do modo escuro. Isso tem três
vantagens sobre criar cinzas novos:

1. **É roxo, não cinza.** Os quatro valores já carregam o tom da marca —
   exatamente o que o briefing pede.
2. **Nenhuma cor nova.** O modo escuro passa a ser a mesma linguagem que o
   bloco de código já falava.
3. **O rodapé inverte de papel em vez de sumir.** No claro ele é a âncora
   escura; no escuro ele é a superfície **mais clara** da página (L* 13,4 contra
   3,5 do fundo). Resolve Q5 sem cor nova.

### 2.2 Tabela de tokens

Variáveis CSS em `:root` e `.dark`, expostas ao Tailwind via
`theme.extend.colors` com `rgb(var(--token) / <alpha-value>)`.

| token | papel | claro | escuro |
| --- | --- | --- | --- |
| `--bg` | fundo da página | `#FFFFFF` | `#0E0A1A` |
| `--surface` | seção alternada (Expertise) | `#F6F3FC` | `#15102B` |
| `--surface-raised` | card, painel do menu, nav | `#FFFFFF` | `#1D1640` |
| `--border` | divisória, contorno de card | `#E5E7EB` | `#2C2150` |
| `--text` | corpo, títulos | `#111827` | `#E9E3FF` |
| `--text-secondary` | descrição de seção | `#374151` | `#D4C7FF` |
| `--text-muted` | metadado, legenda | `#4B5563` | `#B197E8` |
| `--accent` | link, tag, rótulo de ação | `#6B3ACC` | `#B197E8` |
| `--accent-strong` | link em hover, texto de botão | `#5A2DB8` | `#D4C7FF` |
| `--focus` | anel de foco | `#7947DF` | `#B197E8` |
| `--footer-bg` | rodapé | `#2A1454` | `#2A1454` |
| `--footer-muted` | copyright, link da gravidade | `#9CA3AF` | `#B197E8` |

Degraus de superfície no escuro, em L\* (contraste é a métrica errada para
superfícies; o que importa é o degrau perceptual):

```
fundo            #0E0A1A   L* 3.5
seção alternada  #15102B   L* 6.4    Δ2.9
card / elevado   #1D1640   L* 10.6   Δ4.2
borda            #2C2150   L* 16.5   Δ5.9
rodapé           #2A1454   L* 13.4
```

Δ de 3 a 5 é o degrau típico de superfície num tema escuro: perceptível sem
virar listra.

### 2.3 Onde `dark:` continua sendo necessário

Token resolve a maioria. Estes quatro casos não têm token que resolva, e cada um
tem motivo:

| caso | por que o token não resolve |
| --- | --- |
| **Gradiente de título** (Q1) | Não é uma cor, é um par. No escuro o componente troca de variante (`gradient` → `gradientLight`), o que é lógica de componente, não valor de token. Fica no `Text`, num ponto só. |
| **Sombras** (Q8) | Sombra escura não funciona sobre fundo escuro. No escuro vira borda em vez de sombra: `dark:shadow-none dark:border`. |
| **`invert` de imagem** | Nenhuma imagem é invertida (ver §4.2), mas se algum ícone monocromático precisar, é filtro, não cor. |
| **`color-scheme`** | Propriedade CSS própria, não um token de cor (ver §4.5). |

---

## 3. Contraste — modo escuro

Fórmula WCAG 2.x, espaço linear, hex reais. Todos os pares calculados.

| par | frente | fundo | razão | exigido | |
| --- | --- | --- | --- | --- | --- |
| Corpo de texto | `#E9E3FF` | `#0E0A1A` | **15,69** | 4,5 | AA |
| Corpo de texto (seção alternada) | `#E9E3FF` | `#15102B` | **14,81** | 4,5 | AA |
| Corpo em card | `#E9E3FF` | `#1D1640` | **13,61** | 4,5 | AA |
| Texto secundário | `#D4C7FF` | `#0E0A1A` | **12,45** | 4,5 | AA |
| Texto secundário (seção alternada) | `#D4C7FF` | `#15102B` | **11,76** | 4,5 | AA |
| Texto atenuado | `#B197E8` | `#0E0A1A` | **7,86** | 4,5 | AA |
| Texto atenuado (card) | `#B197E8` | `#1D1640` | **6,82** | 4,5 | AA |
| Acento / link | `#B197E8` | `#0E0A1A` | **7,86** | 4,5 | AA |
| Acento / link (seção alternada) | `#B197E8` | `#15102B` | **7,42** | 4,5 | AA |
| Acento forte / hover | `#D4C7FF` | `#0E0A1A` | **12,45** | 4,5 | AA |
| **Anel de foco** | `#B197E8` | `#0E0A1A` | **7,86** | 3 | AA |
| **Anel de foco** (seção alternada) | `#B197E8` | `#15102B` | **7,42** | 3 | AA |
| Borda de botão `secondary` | `#B197E8` | `#0E0A1A` | **7,86** | 3 | AA |
| Rodapé: texto | `#FFFFFF` | `#2A1454` | **15,83** | 4,5 | AA |
| Rodapé: atenuado | `#B197E8` | `#2A1454` | **6,38** | 4,5 | AA |

**Texto sobre o shader 3D.** O `HeroBackground` é o mesmo nos dois modos (§4.4),
então o ponto mais claro continua sendo `#653BBE` e os valores da auditoria
valem sem recalcular — mas recalculei:

| par | razão | exigido | |
| --- | --- | --- | --- |
| eyebrow `primary-200` sobre `#653BBE` | **4,59** | 4,5 | AA |
| texto do botão `onDark` `primary-100` | **5,78** | 4,5 | AA |
| borda do botão `onDark` `primary-200` | **4,59** | 3 | AA |

**Nenhum par reprova.** A margem mais apertada é o eyebrow do hero, com 4,59:1 —
herdada do modo claro, não introduzida aqui.

**Correção de método.** Numa primeira passagem marquei `--border` como reprovado
(1,34:1). Está errado: **WCAG 1.4.11 exige 3:1 de componente de UI e de objeto
gráfico necessário para entender o conteúdo**, não de divisória decorativa. A
borda de card é decorativa; a borda que *é* o limite de um controle — o botão
`secondary` — está na tabela e passa com 7,86:1.

---

## 4. Casos especiais

### 4.1 Realce de código dos artigos (Q6)

O tema de código **já é escuro** e vive fora de `@layer` de propósito (o purge do
Tailwind come as classes `hljs-*`, que nunca aparecem nos arquivos varridos).

No modo escuro ele não muda de cor — muda de **relação**. Hoje o bloco é uma ilha
escura numa página branca; no escuro ele precisa continuar se destacando do
corpo do artigo:

- corpo do artigo sobre `--bg` (`#0E0A1A`, L\* 3,5)
- bloco de código em `#15102B` (L\* 6,4) → lê como **elevado**, Δ2,9
- borda `#2C2150` reforça o limite

Ou seja: **zero mudança no tema `hljs`**, que é o resultado mais barato possível.
As 8 cores de token (`#c4a7ff`, `#9ae6c4`, `#ffc98b`, `#8fd3ff`, `#ffb4d1`,
`#ffe08a`, `#ff9b9b`, `#9a8fc4`) já foram escolhidas contra `#15102B` e
continuam válidas.

### 4.2 Imagens, thumbs e a capa tipográfica

- **Foto do hero e thumbs de projeto/artigo:** sem filtro. Escurecer foto de
  pessoa ou de interface no dark mode é a tentação errada — a imagem passa a
  mentir sobre o que mostra. Ficam como estão.
- **Capa tipográfica** (card de artigo sem thumb): é um bloco preenchido com
  `from-primary-500 to-primary-900` e texto `white/90`. Funciona nos dois modos
  (branco sobre `primary-500` = 5,56:1; sobre `primary-900` = 14,6:1). Não muda.
- **`og:image` e favicon:** não mudam. São servidos, não renderizados.

### 4.3 Rodapé (Q5)

Inverte de papel, sem cor nova: no claro é a âncora escura da página; no escuro é
a superfície mais clara (L\* 13,4 contra 3,5 do fundo). O `--footer-muted` sobe de
`gray-400` para `primary-300` no escuro, para casar com o resto da paleta —
6,38:1, acima do mínimo.

### 4.4 Camada 3D e modo gravidade

- **`HeroBackground`:** não muda. Já é o ponto mais escuro do site, e é dele que a
  paleta escura sai. No modo claro o hero é uma faixa escura destacada; no escuro
  ele deixa de ser ilha e passa a ser o topo natural da página — que é uma
  melhora de graça.
- **`LayeredStack` (Q2):** **muda.** `SHADOW = #2A1454` fica a 1,23:1 do fundo
  escuro e o objeto perde o contorno. Proposta: a feature lê o tema e usa
  `#3B1F7A` como sombra no escuro, mantendo `BODY` e `SHEEN`. A faixa de valor
  medida em `724a75a` (0,604) precisa ser recalculada e continuar acima de 0,5.
- **`TransactionFlow` e `SignatureObject`:** desenham sobre o próprio fundo
  escuro do shader, não sobre a página. Não mudam.
- **Modo gravidade:** lê estilo computado dos blocos em runtime
  (`getComputedStyle`), então funciona em qualquer tema sem alteração. **Único
  cuidado:** o botão flutuante de voltar usa `focus:ring-offset-secondary-900`
  fixo; vira `--bg`.

### 4.5 `theme-color` e `color-scheme`

- **`theme-color`:** volta a ter duas declarações com `media`, revertendo **I12
  de propósito** — lá elas traziam a mesma cor, o que era só ruído; aqui passam
  a trazer cores diferentes, que é para o que a media query existe.
  Claro `#7947DF`, escuro `#0E0A1A`. **O AUDIT.md precisa registrar a reversão**,
  senão I12 parece ter voltado por descuido.
- **`color-scheme`:** `:root { color-scheme: light }` e `.dark { color-scheme:
  dark }`. É o que faz barra de rolagem, `<select>`, foco nativo e a tela de
  `autofill` seguirem o tema. Sem isso, a scrollbar fica branca no escuro.

---

## 5. Anti-flash

Script inline no `<head>`, **antes do CSS**, que resolve o tema e carimba a
classe no `<html>` antes do primeiro paint:

```html
<script>
  (function () {
    try {
      var s = localStorage.getItem("davysz:theme");
      var d = s === "dark" || (s !== "light" &&
        matchMedia("(prefers-color-scheme: dark)").matches);
      if (d) document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = d ? "dark" : "light";
    } catch (e) {}
  })();
</script>
```

Inline e síncrono de propósito: qualquer coisa adiada — módulo, `defer`, React —
chega depois do paint, e o flash é exatamente o que o script existe para evitar.
O `try/catch` cobre modo privado, onde `localStorage` lança.

### Como garantir que ele esteja em todas as páginas

O `prerender.js` de A29 monta cada página **a partir de `dist/index.html`**, que
por sua vez vem de `index.html`. Então basta pôr o script em `index.html` e ele
se propaga sozinho para os 8 artigos, para a home e para a 404.

"Se propaga sozinho" é exatamente o tipo de afirmação que envelhece mal, então
**entra um teste** que abre cada HTML gerado e exige a presença do marcador
(`davysz:theme`) dentro do `<head>` e **antes** do primeiro `<link
rel="stylesheet">`. Se alguém reordenar o `<head>`, o teste quebra.

---

## 6. Largura da nav — medido, não estimado

Medi os avanços reais da Poppins (`public/fonts/*.woff2`, via `fontkit`) em vez
de estimar. O resultado mudou o plano.

**A nav em português já estoura hoje, sem o botão de tema:**

| viewport | idioma | necessário | disponível | folga |
| --- | --- | --- | --- | --- |
| 1024 | EN | 966px | 976px | +10px |
| 1024 | **PT** | **1.099px** | 976px | **−123px** |
| 1280 | EN | 966px | 1.080px | +114px |
| 1280 | **PT** | **1.099px** | 1.080px | **−19px** |

Com o botão de tema (+44px de alvo, +32px de gap):

| viewport | EN | PT |
| --- | --- | --- |
| 1024 | −66px | −199px |
| 1152 | +62px | −71px |
| 1280 | +38px | −95px |
| 1366 | +124px | −9px |
| 1440 | +198px | +65px |

**Proposta.** O botão não cabe, e o problema é anterior a ele. Duas mudanças:

1. **Agrupar os dois controles.** Seletor de idioma e botão de tema viram um
   bloco único com `gap-1` em vez de `gap-8`, economizando 28px, e o grupo fica
   separado dos links de navegação — que é a relação correta: são controles da
   interface, não destinos.
2. **Subir o ponto de virada da nav completa de `lg` (1024px) para `xl`
   (1280px)**, e usar o menu lateral abaixo disso. Resolve PT a 1024 e 1152, que
   já está quebrado hoje.

Mesmo assim PT a 1280 fica apertado (−95px). Opções, em ordem de preferência:

- **(a)** reduzir `gap-8` para `gap-6` entre links a partir de `xl`: devolve
  ~30px. Ainda insuficiente sozinho.
- **(b)** links em `text-lg` (18px) em vez de `text-xl` a partir de `xl`:
  devolve ~54px em PT. Combinado com (a), fecha a conta.
- **(c)** encurtar "Cases de estudo" para "Cases": devolve ~77px, mas mexe em
  nome fixado em A10.

**Recomendo (a) + (b).** São ajustes de densidade da nav, não de conteúdo, e não
tocam nas decisões de A10. **Esta é a única parte do plano que muda o desenho de
algo que existe hoje** — vale sua confirmação antes da Fase 2.

---

## 7. Commits planejados

| # | commit | o que entra |
| --- | --- | --- |
| 1 | `feat(theme): add semantic color tokens for light and dark` | variáveis CSS, mapeamento no `tailwind.config.js`, `color-scheme`. Sem mudança visual. |
| 2 | `feat(theme): resolve and persist the color scheme` | `useTheme`, `localStorage`, reação ao sistema, script anti-flash no `index.html`, `theme-color` por media. Testes de resolução. |
| 3 | `refactor(ui): move components onto the semantic tokens` | os 45 usos de classe de cor viram token. O grosso do trabalho. Sem `dark:` ainda. |
| 4 | `fix(theme): handle what tokens cannot express` | gradiente de título (Q1), sombra→borda (Q8), `LayeredStack` (Q2). |
| 5 | `feat(theme): add the three-state theme control` | botão na nav desktop e mobile, agrupado com o seletor de idioma, rótulos nos dois locales. |
| 6 | `fix(navigation): fit the nav controls at xl` | densidade da nav (§6) e ponto de virada em `xl`. |
| 7 | `test(theme): cover resolution and the anti-flash script` | testes de tema e a asserção do script nas 10 páginas geradas. |
| 8 | `docs: record the dark mode decisions` | `DARK-MODE.md` atualizado, e no `AUDIT.md` a reversão consciente de I12. |

---

## Pontos que precisam da sua decisão antes da Fase 2

1. **§6 — densidade da nav.** É a única mudança de desenho em algo existente.
   Recomendo `gap-6` + `text-lg` a partir de `xl`, e nav completa só em `xl`.
2. **§2.1 — a paleta escura sai do bloco de código.** É uma escolha de direção,
   não a única possível. A alternativa seria uma família nova, mais neutra.
3. **Confirmar o comportamento de três estados**, já que o briefing veio com as
   opções em branco.

---

## Desvios do plano, registrados durante a Fase 2

### D1 — A nav já virava em `xl`; metade do §6 era desnecessária

O §6 propunha "subir o ponto de virada da nav completa de `lg` (1024px) para
`xl` (1280px)". Ao implementar, `useMobile` já usava `(min-width: 1280px)` — a
mudança tinha sido feita antes, num ajuste do hero, e está documentada no
próprio hook.

Efeito prático: **o caso de 1024px nunca existiu para a nav de desktop**, porque
abaixo de 1280 o que aparece é o menu de painel. A tabela do §6 media um estado
que não é alcançável. O problema real era só a partir de 1280, e é lá que ele
foi resolvido.

Sobraram os ajustes de densidade, que continuam necessários. Medição depois:

| viewport | EN | PT |
| --- | --- | --- |
| 1280 | +236px | **+107px** |
| 1440 | +396px | +267px |

Pior caso (português a 1280px) saiu de −95px para +107px.

### D2 — O teste do pré-render de A29 quebrou, e estava certo

Ao pôr `theme-color` de volta com duas declarações, o teste de "cada meta uma
vez por página" falhou nas 9 páginas. Ele não estava errado — a regra é que
estava grossa demais.

A regra fina: **uma meta pode repetir quando cada ocorrência responde a uma
media query diferente.** O `media` entrou na chave de identidade do teste, então
duplicata de verdade continua sendo pega. Verificado.

### D3 — `Feature.setTheme` é opcional de propósito

O plano dizia que o `LayeredStack` "lê o tema". A forma escolhida foi um gancho
opcional na interface `Feature`, com o `Experience` observando a classe do
`<html>` por `MutationObserver`.

Alternativa descartada: passar o tema pelo `FrameContext`, que obrigaria as 4
features a conhecer um dado que 3 delas ignoram. O opcional mantém a camada 3D
sem saber que o React existe, que é como ela foi construída.

### D5 — A seção Expertise ficou clara no escuro (dois bugs meus)

Reportado com screenshot depois da Fase 2. O §4.4 do plano listou as features
que mudam com o tema e **esqueceu a `TransactionFlow`** — que é justamente a que
**pinta o fundo** da seção Expertise, com `SURFACE = 0xf6f3fc` fixo. Resultado:
a seção continuava clara enquanto o resto da página virava, e o texto ficava
roxo-claro sobre lavanda.

O plano tinha a informação para prever isso: o §1.3 registra que o canvas pinta
o fundo dessa seção. Eu li a linha e não liguei os pontos.

Ao corrigir, apareceu um **segundo bug, no próprio commit 4**: `observeTheme()`
roda no construtor do `Experience`, mas as features entram depois, por `add()`.
O `setTheme` inicial percorria uma lista vazia — então abrir a página já no
escuro deixava as cenas com cor de tema claro, e só a primeira troca corrigia.
O tema virou estado da instância e `add()` carimba quem chega depois.

A cor escura das partículas saiu da mesma fórmula documentada no código para a
clara, `mix(surface, primary-500, 0.30)` — verifiquei que ela reproduz exatamente
o `#d1bff3` que já estava lá antes de derivar o `#332161`. Sobre ele o texto
passa AA com folga, **inclusive o título**, que no claro era a exceção que
obrigava a faixa sem partículas.

### D4 — A transição de tema não precisou de guarda própria

O briefing pedia "transição desativada sob `prefers-reduced-motion`". O bloco
global do `index.css` já zera `transition-duration` de tudo com `!important`,
então a transição do `body` é coberta sem regra nova. Não há código de guarda
porque ele seria redundante.

---

## Tabela de contraste final

Lida do **CSS construído**, não da proposta — os valores abaixo saem de
`dist/assets/*.css`.

### Modo claro

| par | frente / fundo | razão | mín |
| --- | --- | --- | --- |
| Corpo | `#111827` / `#ffffff` | 17,74 | 4,5 |
| Corpo (seção alternada) | `#111827` / `#f6f3fc` | 16,17 | 4,5 |
| Secundário | `#374151` / `#ffffff` | 10,31 | 4,5 |
| Atenuado | `#4b5563` / `#ffffff` | 7,56 | 4,5 |
| Acento | `#6b3acc` / `#ffffff` | 6,77 | 4,5 |
| Acento forte | `#5a2db8` / `#ffffff` | 8,39 | 4,5 |
| Anel de foco | `#7947df` / `#ffffff` | 5,56 | 3 |
| Rodapé: atenuado | `#9ca3af` / `#2a1454` | 6,24 | 4,5 |

### Modo escuro

| par | frente / fundo | razão | mín |
| --- | --- | --- | --- |
| Corpo | `#e9e3ff` / `#0e0a1a` | 15,69 | 4,5 |
| Corpo (seção alternada) | `#e9e3ff` / `#15102b` | 14,81 | 4,5 |
| Corpo em card | `#e9e3ff` / `#1d1640` | 13,61 | 4,5 |
| Secundário | `#d4c7ff` / `#0e0a1a` | 12,45 | 4,5 |
| Atenuado | `#b197e8` / `#0e0a1a` | 7,86 | 4,5 |
| Atenuado em card | `#b197e8` / `#1d1640` | 6,82 | 4,5 |
| Acento | `#b197e8` / `#0e0a1a` | 7,86 | 4,5 |
| Acento forte | `#d4c7ff` / `#0e0a1a` | 12,45 | 4,5 |
| Anel de foco | `#b197e8` / `#0e0a1a` | 7,86 | 3 |
| Rodapé: atenuado | `#b197e8` / `#2a1454` | 6,38 | 4,5 |

**26 pares, nenhuma reprovação nos dois modos.**
