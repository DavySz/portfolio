# Auditoria de UI/UX e Acessibilidade — davysz.com

> Auditoria estática, feita sobre o código em `724a75a` (branch `chore/experience-audit`).
> **Etapas 1 a 3 implementadas** em `b0e0742..9f0c3d2` — os itens concluídos
> estão marcados com ✅ e o hash na tabela. A16 está suspenso por A29; as
> etapas 4 e 5 seguem pendentes.

## Premissas usadas

O briefing veio com os placeholders em branco. Preenchi pelo que o próprio
projeto diz (`CLAUDE.md`, locales, `structured-data`). **Corrija aqui se eu
errei** — os achados de copy e de CTA dependem disto:

| Campo | Premissa adotada |
| --- | --- |
| Produto | davysz.com — portfólio pessoal e vitrine profissional |
| Público | Recrutadores técnicos, tech leads e engenheiros avaliando contratação |
| Objetivo da página | Credibilidade técnica → contato |
| CTA principal | "Let's talk" (nav) → abre o LinkedIn em nova aba |
| Stack | React 18 + TypeScript + Vite + Tailwind v3, SPA renderizada no cliente |

## Método e limites

- **Contraste**: razões calculadas a partir dos hex reais de `tailwind.config.js`
  e dos hardcodes encontrados, em espaço linear, pela fórmula WCAG 2.x. Nenhuma
  estimativa.
- **Renderização**: não consegui renderizar a página (ambiente sem navegador).
  Tudo aqui sai da leitura do código. Os achados marcados **[VISUAL]** têm a
  causa provada no código mas o *efeito* precisa de confirmação na tela.
- **Escopo**: home (7 seções), rota de artigo, navegação e o shell da página.
  A camada 3D (`src/experience/`) só entra onde afeta contraste ou semântica.

---

## Resumo executivo

A base de acessibilidade é boa (skip link, foco visível, `lang` sincronizado,
cards que são links de verdade), mas três coisas quebram o objetivo da página.
**(1)** E-mail e telefone no rodapé são texto morto — não são `mailto:`/`tel:` e
o `<head>` ainda desliga a autodetecção do iOS, então a página que existe para
gerar contato não tem um único caminho de contato clicável. **(2)** A seção
"My Expertise" é uma `<table>` sem cabeçalho usada como layout, com
`cursor-pointer` em linhas que não clicam — semântica errada para leitor de tela
e affordance falsa para todo mundo. **(3)** No mobile, abrir o menu joga a
página para o topo e fechar não devolve a posição.

---

## Tabela de achados

| ID | Seção | Categoria | Problema | Impacto | Esforço | Arquivo(s) | Commit |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ A01 | Rodapé / `<head>` | UX / Conversão | E-mail e telefone não são links; `format-detection: telephone=no` mata o autolink do iOS | Alto | P | `pages/home/footer/index.tsx`, `index.html` | `b0e0742` |
| ✅ A02 | Expertise | A11y (1.3.1) | `<table>` usada como layout, sem `<th>`/`<caption>`; leitor de tela entra em modo tabela | Alto | M | `components/service-table/index.tsx` | `f69135e` |
| ✅ A03 | Navegação mobile | UX / Bug | Abrir o menu aplica `position:fixed` no `body` sem salvar o scroll → página pula para o topo | Alto | P | `components/navigation-bar/mobile.tsx` | `bf1487a` |
| ✅ A04 | Rodapé | A11y (1.4.3) | `#5F5F5F` sobre `secondary-900` = **2,48:1** (mínimo 4,5:1) — copyright e link da gravidade | Alto | P | `pages/home/footer/index.tsx` | `caeee05` |
| ✅ A05 | Navegação mobile | A11y (2.4.3) | `role="dialog" aria-modal="true"` sem mover, prender nem devolver o foco | Alto | M | `components/navigation-bar/mobile.tsx` | `a84290d` |
| ✅ A06 | Expertise | A11y (1.3.1) | Mobile usa `<h2>` para cada serviço sob o `<h2>` da seção; desktop não usa título nenhum | Alto | P | `components/service-cards/index.tsx`, `service-table/index.tsx` | `2a3c119` |
| ✅ A07 | Expertise | UX | `cursor-pointer` + hover elaborado em linhas/cards que não são clicáveis | Médio | P | `service-table/index.tsx`, `service-cards/index.tsx` | `81f2481` |
| ✅ A08 | Global | A11y / UX | Navegação feita com `<button onClick={window.open}>` em vez de `<a>`: sem clique do meio, sem copiar link, anunciado como botão | Médio | M | `hero/`, `footer/`, `articles/`, `navigation-bar/` | `34fb76a` |
| ✅ A09 | Global | Segurança | `window.open(href, "_blank")` sem `noopener` → a aba aberta recebe `window.opener` | Médio | P | mesmos acima | `34fb76a` |
| ✅ A10 | Nav / Rodapé | Copy / Wayfinding | Três nomes para a mesma seção: nav "Expertise", título "My Expertise", rodapé "SERVICES"; nav "Projects" vs título "Case Studies" | Médio | P | `components/locales/*.json`, `pages/home/locales/*.json` | `dc27a78` |
| ✅ A11 | Navegação mobile | UX | Estado ativo nunca acompanha o scroll (o desktop acompanha) e inicia em `"/"`, que nenhum link casa | Médio | P | `navigation-bar/mobile.tsx` | `7ddd07b` |
| ✅ A12 | Expertise | Consistência | `text-4xl`, `text-[40px]`, `text-[32px]`, `text-xl` ignoram a escala `display-*`/`heading-*`/`body-*` do tema | Médio | P | `service-table/index.tsx`, `service-cards/index.tsx` | `f69135e` |
| ✅ A13 | Expertise | Bug | Títulos e descrições usam `hover:` onde precisam de `group-hover:` — não reagem ao hover do card | Médio | P | `components/service-cards/index.tsx` | `1b92c41` |
| ✅ A14 | Global (CSS) | Consistência | `td, th { px-[50px] py-[40px] }` — seletor de tipo global dentro de `@layer utilities` | Médio | M | `src/index.css` | `f69135e` |
| ✅ A15 | `<head>` | SEO | Metas estáticas em português + `og:locale pt_BR` num site que abre em inglês; `useSEO` **acrescenta** metas sem remover as estáticas → `description` duplicada | Médio | M | `index.html`, `hooks/useSEO/use-seo.ts` | `9067d32` |
| A16 | Artigos | SEO | `canonical` aponta para o Medium nos 4 publicados lá — **suspenso: depende de A29**, porque com rota de hash o canonical do próprio site equivale à home | Médio | P | `pages/article/index.tsx` |  |
| ✅ A17 | Artigos (home) | UX | O card não mostra data nem tempo de leitura, embora os dois existam no dado | Médio | P | `components/article-card/index.tsx` | `1e326d4` |
| ✅ A18 | Hero | UX / Conversão | Nenhum CTA de contato no hero; o único CTA de conversão está na nav e leva para fora do site | Médio | M | `pages/home/hero/index.tsx` | `9f0c3d2` |
| A19 | Hero | Responsivo | `w-screen` dentro de um pai com `px-6` e sem `overflow-x` global → provável rolagem horizontal de 48px no mobile **[VISUAL]** | Médio | P | `pages/home/hero/index.tsx` |  |
| A20 | Nav | UX / i18n | Bandeira 🇺🇸/🇧🇷 como única pista visível do seletor de idioma; alvo de 56×28px | Médio | P | `components/toggle/index.tsx` |  |
| A21 | Artigos | A11y (motion) | `scrollIntoView({behavior:"smooth"})` — a opção JS vence o `scroll-behavior:auto` do `prefers-reduced-motion` | Baixo | P | `pages/article/index.tsx` |  |
| A22 | Artigos | Copy | Botão "Back"/"Voltar" não volta no histórico: vai para a home | Baixo | P | `pages/article/index.tsx` |  |
| ✅ A23 | Artigos (home) | UI | Sem thumb, a tag aparece duas vezes empilhada (capa + linha de tag) | Baixo | P | `components/article-card/index.tsx` | `1e326d4` |
| A24 | Projetos / Stack | Bug | `animate-fade-in-up` no card **e** no wrapper — animação dobrada | Baixo | P | `project-card/`, `skill-card/`, `projects/`, `skills/` |  |
| A25 | Global | Consistência | `Button` usa `focus:`; `Link` e os cards usam `focus-visible:` — o anel aparece no clique de mouse | Baixo | P | `components/button/index.tsx` |  |
| A26 | Console | Bug | `WELCOME_LOG_MESSAGE` começa com `U+FFFD` (bytes `EF BF BD`) e é só em português | Baixo | P | `src/shared/constants.ts` |  |
| A27 | Global | Limpeza | Chaves `articles.items.*` mortas nos dois locales; `relative` duplicado; `mr-7` solto | Baixo | P | vários |  |
| A28 | `<head>` | Performance | Google Fonts como `<link rel=stylesheet>` de terceiro, bloqueando render | Médio | M | `index.html` |  |
| A29 | Global | SEO / Arquitetura | Rota por hash faz os 8 artigos serem a mesma URL que a home para o buscador; o sitemap declara 9 `<loc>` que colapsam em 1 | Alto | G | `useHashRoute/`, `scripts/content/build-feeds.js`, `vite.config.ts` |  |

---

## Detalhamento

### A01 — O site de contato não tem contato clicável · Alto · P

```tsx
<MdOutlineMailOutline size={20} color="#ffff" />
<Text as="span" ...>{CONTACTS.GMAIL}</Text>   // texto puro
<LuPhone size={20} color="#ffff" />
<Text as="span" ...>{CONTACTS.PHONE}</Text>   // "+5592992939794", sem formatação
```

E no `index.html`:

```html
<meta name="format-detection" content="telephone=no" />
```

**Por que prejudica:** o objetivo declarado da página é gerar contato. O e-mail
exige selecionar e copiar; o telefone aparece como `+5592992939794`, sem
formatação, e a meta tag impede que o iOS o transforme em link. Num celular —
onde está a maior parte do tráfego de um portfólio compartilhado por LinkedIn —
não há como tocar e ligar nem tocar e escrever. Para quem usa leitor de tela, um
telefone sem separadores é lido como um número gigante de 13 dígitos.

**Recomendação:** `<a href="mailto:…">` e `<a href="tel:+5592992939794">`,
exibindo o telefone formatado (`+55 92 99293-9794`), e remover
`format-detection: telephone=no` (ela só faz sentido quando números que *não*
são telefone estão virando link, que não é o caso).

---

### A02 — "My Expertise" é uma tabela que não é tabela · Alto · M

`ServiceTable` monta `<table><tbody><tr><td>` para quatro ofertas — número,
título, descrição e uma seta decorativa. Não há `<th>`, `<caption>`, nem linha
de cabeçalho.

**Por que prejudica:** um leitor de tela anuncia "tabela, 4 linhas, 4 colunas" e
entra em modo de navegação por células, onde as setas do teclado passam a andar
célula a célula. O usuário procura relações linha/coluna que não existem. É
falha de **WCAG 1.3.1 (Info and Relationships)**: a estrutura transmitida não
corresponde à estrutura real do conteúdo, que é uma lista.

**Recomendação:** `<ul>` com `<li>`, cada item com `<h3>` e `<p>`, e o número
como `aria-hidden` (ele é ornamento — ver A06 sobre a hierarquia de títulos).
O grid do CSS entrega o mesmo desenho sem a semântica errada, e ainda resolve
A14 e o aperto entre 768px e 1279px.

---

### A03 — Abrir o menu no mobile perde a posição de leitura · Alto · P

```ts
document.body.style.position = "fixed";
document.body.style.width = "100%";
document.body.style.height = "100%";
```

**Por que prejudica:** `position: fixed` sem `top: -${scrollY}px` tira o body do
fluxo e o reposiciona na origem. Quem estava lendo a seção de artigos, abriu o
menu e fechou sem escolher nada, volta para o topo da página. Em `gravity-world.ts`
o mesmo problema foi resolvido salvando o estado antes de travar — aqui não foi.

Dois efeitos menores no mesmo bloco: `enableScrollY` sempre devolve
`overflow: auto` em vez de restaurar o valor anterior, e `disableScrollY` roda na
montagem mesmo com o menu fechado, escrevendo estilo inline no `body` sem motivo.

**Recomendação:** guardar `window.scrollY` ao travar, aplicar
`top: -${scrollY}px`, e ao destravar restaurar os valores anteriores e chamar
`window.scrollTo(0, scrollY)`.

---

### A04 — Contraste reprovado no rodapé · Alto · P

Duas ocorrências, mesma origem: o hex `#5F5F5F` escrito à mão sobre
`bg-secondary-900` (`#2A1454`).

| Elemento | Frente | Fundo | Razão | Exigido | Resultado |
| --- | --- | --- | --- | --- | --- |
| Copyright | `#5F5F5F` | `#2A1454` | **2,48:1** | 4,5:1 | Reprova |
| Link "Turn off gravity" (repouso) | `#5F5F5F` | `#2A1454` | **2,48:1** | 4,5:1 | Reprova |
| Link da gravidade (hover) | `primary-300` | `#2A1454` | 6,38:1 | 4,5:1 | Passa |

**Por que prejudica:** 2,48:1 é quase o dobro de distância do mínimo. O texto
some para qualquer pessoa com baixa visão, em tela com brilho baixo ou sob sol.
O link da gravidade só fica legível **depois** do hover — ou seja, é invisível
justamente para quem precisaria descobri-lo, e inalcançável por hover em touch.

**Recomendação:** trocar o hardcode por um token. Medições sobre `#2A1454`:

```
#8A8A8A -> 4,59:1   (mínimo que passa)
#949494 -> 5,22:1
#9E9E9E -> 5,91:1   (folga confortável)
```

`gray-400` (`#9CA3AF`) do Tailwind dá 6,24:1 e já está no tema — usar ele evita
criar mais um cinza.

---

### A05 — Menu mobile é um diálogo modal sem gestão de foco · Alto · M

O painel declara `role="dialog"` e `aria-modal="true"`, tem Esc e usa `inert`
quando fechado — tudo correto. Falta o resto do contrato: ao abrir, o foco
continua no botão hambúrguer, que está **fora** do diálogo; não há trap; e ao
fechar o foco não volta para quem abriu.

**Por que prejudica:** com `aria-modal="true"` o leitor de tela esconde o resto
da página. O usuário fica com o foco num elemento que, para ele, não existe
mais. Tab navega por um conteúdo invisível. É falha de **WCAG 2.4.3 (Focus
Order)**.

**Recomendação:** ao abrir, focar o título ou o botão de fechar; prender o Tab
entre o primeiro e o último focável do painel; ao fechar, devolver o foco ao
hambúrguer.

---

### A06 — Hierarquia de títulos diferente entre mobile e desktop · Alto · P

Mesmo conteúdo, duas estruturas, ambas erradas:

| Viewport | Estrutura gerada |
| --- | --- |
| Desktop (`ServiceTable`) | `h2` da seção → células `<td>`, **sem título nenhum** para os 4 serviços |
| Mobile (`ServiceCards`) | `h2` da seção → `h2`, `h2`, `h2`, `h2` |

**Por que prejudica:** navegar por títulos é o atalho principal de quem usa
leitor de tela. No desktop os quatro serviços não aparecem nessa lista. No
mobile aparecem como irmãos da seção que os contém, achatando a hierarquia.
Além disso, o mesmo documento muda de estrutura conforme a largura da tela.

**Recomendação:** `<h3>` para o título de cada serviço nas duas
implementações — sai de graça junto com A02.

---

### A07 — Affordance falsa na seção de Expertise · Médio · P

As linhas da tabela e os cards têm `cursor-pointer`, gradiente no hover,
`hover:-translate-y-1` e `hover:shadow-lg`. Nenhum tem `onClick`, `href` ou
`tabIndex`.

**Por que prejudica:** todo o vocabulário visual de "isto é clicável" está
presente. O usuário clica e nada acontece. Quem navega por teclado nem chega
lá, porque não há nada focável — então o hover elaborado é um custo visual que
só serve para enganar.

**Recomendação:** ou o item leva a algum lugar (e aí vira link de verdade, com
foco visível), ou remove `cursor-pointer` e reduz o hover a uma mudança sutil de
fundo. Recomendo a segunda: não há destino óbvio para esses quatro itens.

---

### A08 / A09 — Navegação por `window.open` em vez de `<a>` · Médio · M+P

```tsx
const openLink = (href: string): void => { window.open(href, "_blank"); };
// hero (3 redes), rodapé (3 redes), artigos (Medium), nav desktop e mobile (LinkedIn)
```

**Por que prejudica (A08):** um `<button>` que navega perde clique do meio,
"abrir em nova aba", "copiar endereço do link" e o preview de destino na barra
de status. O leitor de tela anuncia "botão", não "link", então o usuário não
sabe que vai sair do site. Os cards de artigo e projeto já fazem isso certo com
`<a>` — a inconsistência é dentro do próprio projeto.

**Por que prejudica (A09):** `window.open(url, "_blank")` — ao contrário de
`<a target="_blank">`, que ganhou `noopener` implícito nos navegadores
modernos — **entrega `window.opener` para a página aberta**, que pode
reescrever a aba de origem via `window.opener.location`. São todos destinos
confiáveis hoje, mas é uma linha de defesa que não custa nada.

**Recomendação:** trocar por `<a href target="_blank" rel="noreferrer noopener">`
estilizado como botão — resolve A08 e A09 de uma vez. Onde o `<button>` tiver de
ficar, passar `"noopener,noreferrer"` como terceiro argumento.

---

### A10 — Três nomes para a mesma seção · Médio · P

| `id` | Nav | Título da seção | Link do rodapé |
| --- | --- | --- | --- |
| `self` | About | **Who I am** | **ABOUT ME** |
| `services` | **Expertise** | My Expertise | **SERVICES** |
| `skills` | Stack | Stack & Tools | **SKILLS** |
| `projects` | Projects | **Case Studies** | PROJECTS |
| `articles` | Articles | Articles & Insights | ARTICLES |

**Por que prejudica:** o nome de um destino é a sinalização de quem está se
localizando. Clicar em "Expertise" e chegar num título "My Expertise" funciona;
clicar em "Projects" e chegar em "Case Studies" faz a pessoa parar meio segundo
para confirmar que chegou no lugar certo. O rodapé, em CAIXA ALTA e com um
terceiro vocabulário ("SERVICES"), reforça a dúvida.

Há também uma ambiguidade de posicionamento: "Services" sugere freelance, e
"Expertise" sugere contratação CLT. A página inteira fala de contratação —
"SERVICES" no rodapé é o resíduo.

**Recomendação:** um nome por seção, repetido nos três lugares. Sugiro o do
título, que é o mais específico: About me / Expertise / Stack / Case studies /
Articles. E sentence case no rodapé, para casar com a nav.

---

### A11 — Estado ativo do menu mobile não acompanha o scroll · Médio · P

```tsx
const [activeLink, setActiveLink] = useState<string>("/");
```

O desktop usa `useActiveSection(SECTION_IDS)` e destaca a seção visível. O
mobile guarda o último clique. Inicia em `"/"`, que não corresponde a nenhuma
seção, e fica desatualizado assim que a pessoa rola.

**Recomendação:** usar o mesmo `useActiveSection` do desktop. O hook já existe.

---

### A12 / A14 — O design system existe e a seção de Expertise o ignora · Médio

O tema define uma escala completa (`display-2xl` … `body-xs`) com line-height e
letter-spacing por degrau. `ServiceTable` e `ServiceCards` usam `text-4xl`,
`text-[40px]`, `text-[32px]`, `text-xl`, `text-base` — nenhum deles do tema, e
portanto sem o tracking e o leading pensados.

Detalhe: `md:text-[32px] text-[40px]` está invertido em relação ao mobile-first
do Tailwind — a base 40px valeria no mobile e 32px a partir de `md`. Como a
tabela só aparece em `hidden md:flex`, o `text-[40px]` é código morto.

E em `index.css`:

```css
@layer utilities {
  td, th { @apply px-[50px] py-[40px]; }
}
```

**Por que prejudica:** um seletor de **tipo** dentro de `@layer utilities` vale
para toda `<table>` do site, presente e futura — incluindo tabelas que vierem do
markdown dos artigos (hoje nenhum artigo tem tabela, então o efeito está
latente). São 100px de padding horizontal por célula: entre 768px e 1279px, onde
a tabela aparece mas as colunas de número e ícone ainda estão escondidas, sobram
cerca de 520px para dois blocos de texto a 32px bold. Fica muito apertado.
**[VISUAL]**

**Recomendação:** trocar os tamanhos pelos tokens e mover o padding para uma
classe própria aplicada na tabela — ou eliminar o problema de origem trocando a
tabela por lista (A02).

---

### A13 — Hover que não responde ao hover · Médio · P

```tsx
<div className="... hover:bg-primary-50 cursor-pointer">
  <h2 className="... text-primary-700 hover:text-primary-800">
  <p  className="... text-gray-700 hover:text-gray-800">
```

`hover:` no filho só dispara quando o ponteiro está **sobre o texto**. Passar
pelo card muda o fundo mas não o título; atravessar o título muda o título mas
não o fundo. `ServiceTable` faz igual e usa `group-hover:` — a mesma feature,
implementada de dois jeitos.

**Recomendação:** `group` no card e `group-hover:` nos filhos.

---

### A15 — O que o crawler vê está em português; o que o usuário vê está em inglês · Médio · M

O site é SPA sem SSR nem pré-render. O HTML servido tem:

```html
<meta name="description" content="Frontend Engineer especializado em Fintech…" />
<meta property="og:locale" content="pt_BR" />
```

Enquanto a interface abre em inglês (decisão do projeto). Pior: `useSEO`
**acrescenta** metas marcadas com `data-dynamic="true"` e só remove as que têm
essa marca — as estáticas do `index.html` continuam lá. O documento fica com
duas `<meta name="description">` e dois `og:locale`.

**Por que prejudica:** crawler e scraper de rede social que não executam JS —
que é o caso de boa parte deles — leem a primeira ocorrência. O cartão
compartilhado sai em português para um site que abre em inglês.

**Recomendação:** ou o `useSEO` atualiza as tags existentes em vez de acrescentar
(fazendo `querySelector` por `name`/`property`), ou o `index.html` deixa de
declará-las. A primeira é mais segura: mantém um fallback sem JS. O idioma dos
valores estáticos deve casar com o idioma padrão do site — inglês.

---

### A16 — O canonical entrega os artigos para o Medium · Médio · P

```ts
canonicalUrl: meta.mediumUrl ?? `${SITE}/#/artigos/${meta.slug}`,
```

Quatro dos oito artigos apontam o canonical para o Medium.

**Por que prejudica:** canonical é a declaração de qual URL é a original. Ao
apontar para o Medium, o site diz ao buscador para indexar o Medium e ignorar a
própria página. O tráfego de busca por esses quatro artigos — os mais maduros —
vai para uma plataforma de terceiro, não para o portfólio.

Vale como decisão consciente se o objetivo for não competir com o Medium. Mas
como a página existe para trazer gente ao site, é provável que esteja invertido.

**Recomendação:** canonical sempre para `davysz.com`, e o link "Also on Medium"
continua como referência secundária (que é o que ele já faz, bem).

---

### A17 / A23 — Cartão de artigo: falta o que importa, sobra o que repete · Médio/Baixo · P

`ArticleMeta.date` existe e o comentário diz "usado para ordenar e para o
`<time>`" — mas o card não renderiza `<time>`. O tempo de leitura também é
calculado no build e só aparece dentro do artigo. Os artigos vão de dez/2025 a
set/2026 e nada disso é visível na listagem.

E quando não há thumb, a capa gerada mostra `text.tag` em letras grandes, e logo
abaixo vem a linha `<p>` com o mesmo `text.tag` — a mesma palavra duas vezes,
empilhada.

**Recomendação:** `<time dateTime={article.date}>` no card e a tag só uma vez
(quando a capa tipográfica aparece, esconder a linha de tag). O tempo de leitura
exigiria carregar o conteúdo — deixar para depois ou mover para o catálogo.

---

### A18 — O CTA principal leva para fora do site · Médio · M

O hero oferece "Download CV" e três ícones de rede. O único CTA de conversão é
"Let's talk" na nav, que abre o LinkedIn em nova aba.

**Por que prejudica:** a pessoa acabou de chegar, ainda não viu nada, e a ação
mais destacada a tira do site. Quem estava convencido no fim da página não tem
para onde ir: o rodapé mostra e-mail e telefone como texto morto (A01). A
página não tem formulário nem nenhum caminho de contato que permaneça no site.

**Recomendação:** o caminho mais barato é resolver A01 — e-mail e telefone
clicáveis dão à página um destino de conversão real, sem construir formulário.
Depois disso, avaliar repetir o CTA ao fim da seção "Who I am" e antes do
rodapé. Vale conferir se "Let's talk" deveria ser `mailto:` em vez de LinkedIn.

---

### A19 — Provável rolagem horizontal no mobile · Médio · P · [VISUAL]

```tsx
// <section> pai: "... px-6 xl:px-[100px]"
<div className="h-[300px] xl:h-[500px] w-screen xl:w-[500px] ...">
```

`w-screen` é `width: 100vw`. O pai tem `px-6` (24px de cada lado), então a caixa
de conteúdo mede `100vw - 48px`. Como o flex está em `flex-col-reverse`, a
largura é o eixo **cruzado** e `flex-shrink` não se aplica: o filho fica com
100vw dentro de um espaço de 100vw − 48px. Com `items-center`, transborda 24px
para cada lado. Não há `overflow-x: hidden` em lugar nenhum do projeto
(verificado em `index.css`, `index.html` e `tailwind.config.js`).

Pode ser full-bleed intencional — mas full-bleed sem clipe gera barra horizontal.

**Recomendação:** se o efeito é intencional, a técnica sem transbordo é
`w-[calc(100%+3rem)] -mx-6`. Confirmar na tela antes de mexer.

---

### A20 — Bandeira não é idioma · Médio · P

O seletor é um switch de 56×28px cujo único conteúdo visível é 🇺🇸 ou 🇧🇷 em
`text-xs` (12px) dentro de um círculo de 24px.

**Por que prejudica:** bandeira representa país, não língua — o inglês do site
não é "dos EUA", e português não é exclusivo do Brasil. Pior, o formato de
switch é o vocabulário de liga/desliga (o mesmo de um toggle de tema escuro):
quem chega não sabe que aquilo troca o idioma sem passar o mouse e ler o
`title`. O rótulo acessível está correto (`Switch language to Português`), então
o problema é só para quem enxerga.

A altura de 28px passa no WCAG 2.2 (24px), mas fica abaixo dos 44px confortáveis
para toque.

**Recomendação:** trocar por dois rótulos textuais — `EN | PT` — com o ativo
destacado e `aria-current`. Resolve a ambiguidade e o alvo de toque ao mesmo
tempo.

---

### A21 / A22 — Detalhes da rota de artigo · Baixo · P

**A21:** `target?.scrollIntoView({ behavior: "smooth" })`. A opção passada em JS
tem precedência sobre o `scroll-behavior` do CSS, então o
`@media (prefers-reduced-motion: reduce)` do `index.css` não alcança esta
chamada. Quem pediu menos movimento continua vendo a página deslizar.
Corrigir lendo a media query e passando `"auto"` — o projeto já tem
`observeReducedMotion()` em `src/experience/`.

**A22:** o botão diz "Back"/"Voltar" e executa `window.location.hash = ""`, que
vai para a home — não volta no histórico. Se a pessoa chegou de um link
compartilhado, ir para a home é o comportamento certo; o rótulo é que promete
outra coisa. Renomear para "All articles" (chave `article.allArticles` já existe
no locale) ou apontar para a seção de artigos.

---

### A24 a A27 — Limpeza · Baixo · P

- **A24:** `ProjectCard` e `SkillCard` já trazem `animate-fade-in-up`, e os
  wrappers em `projects/index.tsx` e `skills/index.tsx` aplicam de novo, com
  `animationDelay` inline. A animação roda duas vezes, em elementos aninhados.
- **A25:** `Button` usa `focus:ring-2`; `Link`, `ArticleCard`, `ProjectCard` e
  `SkillCard` usam `focus-visible:`. O anel do `Button` aparece em clique de
  mouse, os outros não.
- **A26:** `WELCOME_LOG_MESSAGE` começa com `EF BF BD` (U+FFFD, o caractere de
  substituição) onde deveria haver um emoji — corrupção de encoding gravada no
  source. A mensagem também é só em português, num site que abre em inglês, e
  diz "Stack: React + TypeScript + Next.js" num site feito em Vite.
- **A27:** chaves `articles.items.*` mortas nos dois locales (a seção lê o
  catálogo `ARTICLES`); `relative` declarado duas vezes no `className` de
  `ProjectCard`; `mr-7` solto no botão de `Self` sem vizinho à direita.

---

### A28 — Fonte de terceiro bloqueando o render · Médio · M

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:…&display=swap" rel="stylesheet" />
```

Há `preconnect` e `display=swap` — o básico está feito. Ainda assim é um
`<link rel="stylesheet">` para outro host no caminho crítico: DNS + TLS +
download do CSS antes do primeiro paint, e só então começa o download dos
`.woff2`. Num Android de entrada em 4G são centenas de milissegundos antes de
qualquer texto.

**Recomendação:** self-hospedar os cinco cortes de Poppins em `public/fonts/`
com `@font-face` e `font-display: swap`, e `<link rel="preload">` no corte usado
pelo `h1`. Elimina dois handshakes e tira um terceiro do caminho crítico. Dá
para medir antes e depois com o build que já existe.

---

## Ordem sugerida de implementação

**Etapa 1 — alto impacto, baixo esforço (resolve o essencial)** — ✅ concluída

1. **A01** — e-mail e telefone como links; remover `format-detection`
2. **A04** — trocar `#5F5F5F` por `gray-400` (6,24:1)
3. **A03** — preservar o scroll ao travar o body no menu mobile
4. **A06** — `<h3>` nos títulos de serviço
5. **A07** — remover `cursor-pointer` das linhas/cards não clicáveis
6. **A13** — `group-hover:` em `ServiceCards`
7. **A10** — um nome por seção nos três lugares
8. **A11** — `useActiveSection` no menu mobile

**Etapa 2 — alto impacto, esforço médio** — ✅ concluída

9. **A02 + A12 + A14** — `ServiceTable` vira lista semântica; junto saem os
   tokens de tipografia e o seletor global `td, th` (um PR só: mexem no mesmo
   arquivo e na mesma seção)
10. **A05** — foco no menu modal: mover, prender, devolver
11. **A08 + A09** — `<a>` no lugar de `window.open`, com `rel` correto

**Etapa 3 — SEO e conversão** — ✅ concluída (A16 suspenso por A29)

12. **A15** — `useSEO` atualiza em vez de acrescentar; estáticas em inglês
13. **A16** — canonical para o próprio site
14. **A17 + A23** — data no card; tag sem repetição
15. **A18** — reavaliar o CTA depois que A01 estiver de pé

**Etapa 4 — confirmar na tela primeiro**

16. **A19** — rolagem horizontal do hero **[VISUAL]**
17. **A20** — `EN | PT` no lugar da bandeira

**Etapa 5 — acabamento**

18. **A28** — self-hospedar Poppins (medir antes/depois)
19. **A21, A22, A24, A25, A26, A27**

---

## O que já está bom e deve ser preservado

Vale listar porque várias dessas decisões são mais difíceis de acertar do que os
problemas acima, e é fácil desfazê-las sem querer numa refatoração.

**Acessibilidade**

- Skip link como primeiro elemento focável, antes até do canvas do experience.
- `document.documentElement.lang` sincronizado de verdade com o i18next, inclusive
  na troca em runtime (`src/i18n/index.ts`) — com o porquê registrado no código.
- `lang` declarado no wrapper do artigo quando o texto está em português e a
  interface em inglês. É o detalhe que faz leitor de tela e tradutor acertarem.
- Aviso honesto de tradução pendente em vez de esconder o artigo.
- `inert` no painel do menu quando fechado, com a incompatibilidade de tipos do
  React 18 documentada.
- Cards são links de verdade com `::after` cobrindo a área — teclado, nova aba e
  leitor de tela funcionam, e o nome acessível é só o título.
- O canvas 3D é `aria-hidden` e o site funciona inteiro sem WebGL.
- `prefers-reduced-motion` tratado no CSS global e observado em runtime no
  experience.
- Toda a paleta sobre fundo claro passa AA com folga (nav 15,83:1, corpo 10,31:1,
  descrição de card 7,56:1), e os contrastes sobre a superfície escura foram
  calculados contra o ponto mais claro do shader, não contra a cor média.

**Arquitetura e performance**

- Seções em `lazy` + `Suspense`; artigos com um chunk por arquivo via
  `import.meta.glob` sem `eager`.
- Markdown convertido em build, não em runtime.
- `ResponsiveImage` com `srcset`, `sizes` e `priority` no LCP.
- Pesos de fonte reduzidos aos cinco realmente usados.
- Estilos de artigo deliberadamente fora de `@layer`, com o motivo (purge do
  Tailwind sobre as classes `hljs-*`) escrito no arquivo.

**Produto**

- A rota de artigo é completa: data, tempo de leitura, sumário com `aria-current`,
  progresso de leitura, anterior/próximo e SEO por artigo.
- Escala tipográfica com line-height e letter-spacing por degrau — o problema é
  que duas telas não a usam, não a escala em si.
- O modo gravidade é um botão real, alcançável por teclado, com `aria-pressed` e
  rótulo que muda com o estado.
- Os comentários do código explicam *por que*, não *o que* — inclusive erros
  passados e o raciocínio que levou à solução atual.

---

### A29 — Rota por hash apaga os artigos do buscador · Alto · G

Investigação pedida na Etapa 3. **Não implementado**; é a decisão que destrava
A16.

#### O diagnóstico se confirma, e é pior do que parecia

`ARTICLE_ROUTE = "#/artigos/"`, e não há router de path em lugar nenhum — as
ocorrências de `BrowserRouter` no `grep` são trechos de código **dentro dos
artigos**, não do site. O fragmento (`#...`) não é enviado ao servidor e não faz
parte da identidade de uma URL para o buscador, então as oito páginas de artigo
são, para ele, a mesma URL da home.

A confirmação está no próprio `public/sitemap.xml`:

```
<loc> declarados:                          9
URLs distintas ignorando o fragmento:      1  ->  https://davysz.com/
```

O sitemap declara nove endereços que colapsam em um. O `rss.xml` tem o mesmo
problema, e todo `og:url` de artigo (`${SITE}/#/artigos/${slug}`) aponta, na
prática, para a home — é por isso que o canonical do próprio site não resolveria
nada hoje, e A16 fica suspenso.

Efeito colateral: como todo link compartilhado resolve para a home, qualquer
scraper que não execute JS mostra o cartão da home para os oito artigos. O
`useSEO` corrige isso **depois** que o JS roda, o que serve ao usuário mas não a
quem só lê o HTML servido.

#### Hospedagem: indefinida

Não há nada no repositório que indique onde o site é publicado — sem
`vercel.json`, `netlify.toml`, `_redirects`, `firebase.json`, `Dockerfile`,
`wrangler.toml` nem workflow de CI. Consta como decisão em aberto desde a task
00 do experience.

Isso importa porque **rota de path exige rewrite**: sem `/artigos/* →
/index.html`, abrir um link direto devolve 404. Onde cada opção está:

| Hospedagem | Rewrite de SPA | Pré-render no build |
| --- | --- | --- |
| Vercel / Netlify / Cloudflare Pages | nativo, uma linha de config | sim |
| GitHub Pages | **não tem rewrite** (só o truque do `404.html`) | sim |
| S3 + CloudFront | via *custom error response* ou função de edge | sim |
| Qualquer VPS com nginx | `try_files $uri /index.html` | sim |

GitHub Pages é a única da lista que atrapalha de verdade — e é a mais provável
para um portfólio pessoal. Confirmar isto é o primeiro passo.

#### Proposta

Duas mudanças independentes, que só entregam valor juntas:

**1. Rota de path.** `#/artigos/<slug>` → `/artigos/<slug>`. `useArticleRoute`
passa a ler `location.pathname` e a navegar por `history.pushState`, ouvindo
`popstate` em vez de `hashchange`. O resto (View Transitions, âncora de seção,
vizinhos) continua igual. **Esforço: M.**

**2. Pré-render no build.** Três opções, da mais barata à mais completa:

| | O que faz | Esforço | Limite |
| --- | --- | --- | --- |
| **C1 — shells de metadado** | Um script pós-build copia o `index.html` por rota, trocando `title`, `description`, `canonical` e OG. Body continua vazio. | **P/M** | Crawler sem JS vê o cartão certo, mas não o texto |
| **C2 — SSG com `react-dom/server`** | Renderiza a home e cada artigo para HTML no build e hidrata com o mesmo bundle | **M/G** | Exige que nada no primeiro render toque `window` |
| **C3 — `vite-react-ssg` ou similar** | O mesmo que C2, mas por plugin | **M** | Dependência nova e acoplamento à convenção do plugin |

**C1 resolve o problema real desta auditoria** — identidade de URL, canonical e
cartão de compartilhamento — pelo menor custo, e aproveita que o HTML dos
artigos já é gerado no build pelo `plugins/markdown.ts`. C2 só se passar a
importar indexação do *corpo* do texto.

#### Riscos

- **Links antigos com hash.** Os quatro artigos publicados no Medium apontam
  para cá, e o que já foi compartilhado em LinkedIn tem `#/artigos/...`.
  Mitigação: no boot, se `location.hash` começar com `#/artigos/`, trocar por
  `history.replaceState` para o path equivalente. São poucas linhas e ficam para
  sempre — remover reabre o problema.
- **Hospedagem sem rewrite** transforma todo link direto em 404. É um bloqueio,
  não um detalhe: decidir a hospedagem vem antes de migrar.
- **`sitemap.xml` e `rss.xml`** precisam ser regerados com os endereços novos
  (`scripts/content/build-feeds.js`), e o RSS já foi consumido por leitores com
  os links antigos — os `<guid>` mudam.
- **Janela de reindexação.** Sair de uma URL para nove é ganho, mas leva semanas
  e passa por um período em que nada está consolidado.

#### O que muda em A15 e A16 depois disso

- **A15 continua correto e vira menos crítico.** Com shells pré-renderizadas, o
  HTML servido já chega com o metadado certo por rota; o `useSEO` deixa de ser a
  única fonte e passa a cuidar só da troca de idioma em runtime.
- **A16 vira implementável.** Só com URL real o canonical do próprio site
  significa alguma coisa. Aí a escolha entre apontar para `davysz.com` ou para o
  Medium volta a ser uma decisão de estratégia — hoje ela é decidida pela
  arquitetura, que não deixa alternativa.


## Achados durante a implementação

Registrados na Etapa 1, **não corrigidos**.

### I01 — Conflito entre A07 e A13, resolvido a favor de A07

A07 decidiu que o hover dos itens de Expertise vira "uma mudança sutil de
fundo". A13 recomendava converter os `hover:text-*` dos filhos em
`group-hover:`. As duas coisas não cabem juntas: uma troca de cor de texto no
hover é exatamente o realce que A07 mandou tirar.

Como A07 vem antes na ordem e carrega decisão explícita, tratei A07 como a
política e **removi** as regras em A13 em vez de convertê-las. O card passou a
ter um único retorno de hover, no elemento pai. Se a intenção era manter o
realce de texto, é A07 que precisa ser reaberto, não A13.

### I02 — Correção de um número desta auditoria

A recomendação original de A04 dizia que `gray-400` daria **5,79:1** sobre
`secondary-900`. O valor correto é **6,24:1** — 5,79 era a razão de
`primary-100` sobre o shader, de outra linha da tabela de contraste. A decisão
não muda (os dois passam de 4,5:1) e o texto de A04 já está corrigido, mas fica
o registro porque esta auditoria se propõe a calcular, não estimar.

### I03 — Numeração 01–04 na tabela de Expertise

`ServiceTable` renderiza `(index + 1).padStart(2, "0")` numa coluna própria a
partir de `xl`. Marcador numerado transmite "isto é uma sequência", e os quatro
serviços não são: não há ordem, etapa nem progressão entre "Mobile-First
Development" e "Backend Integration". A numeração está codificando uma relação
que o conteúdo não tem.

Cabe decidir junto com A02, que já vai reescrever o componente.

### I04 — As setas continuam sugerindo destino

A07 tirou o `cursor-pointer` e o hover elaborado, mas os ícones permaneceram:
`GoArrowUpRight` nos itens destacados e `GoArrowDownRight` nos demais. Uma seta
diagonal para fora é a convenção de "link externo" — é o mesmo ícone que o
`ProjectCard` usa no overlay de hover, ali num card que **é** clicável.

Sobrou, então, uma pista de destino num item que não leva a lugar nenhum. Não
mexi porque A07 falava de cursor e hover, e trocar ícone é decisão visual sua.

### I05 — `key={index}` nos links do rodapé

`pages/home/footer/index.tsx` usa `key={index}` ao mapear `getLinks(t)`,
enquanto `navigation-bar/mobile.tsx` usa `key={link.href}` na mesma lista. Sem
efeito hoje (a lista é estática), mas é a mesma lista com duas convenções.
Encaixa em A27.

### I06 — Consequência de A10 sobre o tom da página · ⏸️ adiado (Etapa 3)

Unificar os nomes trocou títulos de seção com alguma personalidade ("Who I am",
"Stack & Tools", "Articles & Insights") por rótulos neutros ("About me",
"Stack", "Articles"). Foi a decisão pedida e resolve o problema de
wayfinding — mas a home perde um pouco de voz no caminho.

Se quiser os dois, o caminho é manter o rótulo curto como nome do destino em
nav e rodapé e devolver um subtítulo com voz logo abaixo do `h2`, em vez de
carregar a voz no próprio nome da seção.

### I07 — `a11y.hireOnLinkedIn` ficou órfã

A08 trocou o `aria-label` do "Vamos conversar" por texto `sr-only`, e a chave
`a11y.hireOnLinkedIn` deixou de ter consumidor nos dois locales. Encaixa em
A27, que já junta as chaves mortas de `articles.items.*`.

### I08 — O nome acessível do CTA perdeu o destino

O `aria-label` antigo dizia "Get in touch on LinkedIn" / "Falar comigo no
LinkedIn". Agora o nome acessível do link é "Let's talk — opens in new tab":
avisa que sai do site, mas não diz mais para onde.

Não corrigi porque a decisão de A08 define o `sr-only` como o aviso de nova aba
e nada além disso; incluir o destino exigiria mudar o contrato do
`ExternalLink` para aceitar contexto extra em links que já têm texto visível.
Vale decidir se "Vamos conversar" deve anunciar o LinkedIn — os links só de
ícone continuam nomeando a rede ("Open GitHub profile — opens in new tab").

### I09 — Deltas visuais da reescrita da seção de Expertise

Três mudanças perceptíveis, todas dentro do que A02/A12 pediam, listadas para
a conferência visual:

1. **Título no desktop: 32px → 30px** (`display-sm`). A escala do tema não tem
   um degrau de 32px, e A12 proíbe `text-[Npx]`. O degrau acima é 36px
   (`display-md`), que ficaria maior que o original.
2. **Colunas proporcionais no lugar de uma fixa de 525px.** Entre 768px e
   1279px a largura fixa deixava o título espremido; agora as duas colunas
   dividem o espaço em 0,9fr / 1,1fr, o que a 1440px dá uma descrição de
   largura próxima à original.
3. **Padding de 50px/40px → 48px/40px** (`px-12 py-10`). O seletor global
   `td, th` usava valores arbitrários; a escala padrão do Tailwind não tem
   50px, e 2px de diferença não se lê.

O layout continua sendo faixas horizontais de duas colunas no desktop e cards
empilhados no mobile, sem numeração e sem setas.

### I10 — Data do artigo erra um dia a oeste de UTC

`new Date("2026-09-21")` é interpretado como meia-noite **UTC**, e
`Intl.DateTimeFormat` formata no fuso local. Em Manaus e em São Paulo o
resultado sai um dia atrás:

```
UTC               -> 21 de setembro de 2026
America/Manaus    -> 20 de setembro de 2026
America/Sao_Paulo -> 20 de setembro de 2026
```

Afeta `pages/article/index.tsx`, que mostra a data completa. O card novo
(A17) mostra só mês e ano, então só erraria em data de dia 01 — nenhuma das
oito atuais. A correção é ler a data como local (`new Date(y, m - 1, d)`) ou
formatar com `timeZone: "UTC"`.

### I11 — `twitter:url` não acompanha a rota

O `useSEO` atualiza `og:url` por página, mas `twitter:url` ficou só no
`index.html`, fixo em `https://davysz.com/`. Hoje isso não muda nada, porque
com rota de hash todas as URLs são a home (A29) — passa a importar quando A29
for resolvido.

### I12 — `theme-color` duplicado sem motivo

O `index.html` declara `theme-color` duas vezes, uma para
`prefers-color-scheme: light` e outra para `dark`, **com o mesmo `#7947DF`**.
Duas declarações que fazem a mesma coisa; uma sem `media` basta. É a única meta
duplicada que sobrou depois de A15, e é inofensiva.

---

## Decisões registradas

| Quando | Decisão | Motivo |
| --- | --- | --- |
| Etapa 3 | **Não** adicionar "Contact"/"Contato" à nav nem ao rodapé | O CTA já leva a `#contact`; um link a mais seriam dois destinos iguais na mesma nav, e a estimativa é que a nav desktop já passe de 1024px hoje |
| Etapa 3 | **I06 adiado** — sem subtítulos abaixo dos `h2` | Fica registrado para depois; as seções seguem com o rótulo puro definido em A10 |
| Etapa 3 | **A16 suspenso** até A29 | Com rota de hash, canonical para o próprio site equivale a canonical para a home |
