# Sabatina — bugs, UX, UI, padronização e benchmark

Revisão do site inteiro, não só da camada Experience. Tudo aqui foi **verificado
no código ou no build** — nada é palpite. Cada item tem onde dói e como corrigir.

- **Data:** 2026-09-21
- **Escopo:** 79 arquivos, 4.767 linhas em `src/`
- **Limite:** sem navegador neste ambiente, então nada foi verificado visualmente
  nem com leitor de tela real. Achados de comportamento vêm de leitura de código.

**Placar:** 4 bugs · 9 de acessibilidade · 7 de UX · 6 de padronização ·
4 de performance · 10 de benchmark

---

## ✅ Situação — todos resolvidos

Executados em seis commits, nesta ordem.

| Bloco | Itens | Commit |
|---|---|---|
| Acessibilidade e bugs | A1 A2 A3 A4 A8 · B1 B2 B3 · U1 · F1 | `08ce750` |
| Imagens | F2 U7 A5 A6 | `eaa4e83` |
| Navegação | U2 U3 | `0f7cda9` |
| Artigos | U4 U5 A7 | `6ff2091` |
| Conteúdo e SEO | benchmark 6, 7 | `df9606d` |
| Manutenção | P1 P2 P3 P4 P6 · B4 · F4 | `a98bc69` |

**Resultado medido:**

| | Antes | Depois |
|---|---:|---:|
| Imagens | 8.634 kB | **553 kB (−94%)** |
| Fonte | 18 variantes | 5 |
| JS inicial | 79.430 B | 80.291 B |
| CSS inicial | 7.142 B | 7.431 B |

O JS e o CSS subiram pouco: o JS é quase todo tradução nova (o i18n carrega
todos os locales no caminho inicial — item 7.2 do `REPORT.md`, ainda aberto) e o
CSS é o sumário, as âncoras e o estado ativo do menu. Contra isso, **8 MB de
imagem saíram do caminho**.

### O que ficou de fora, e por quê

| Item | Motivo |
|---|---|
| P5 `key={index}` | corrigido onde havia chave natural (sociais, links de menu, projetos, skills). Onde a lista é estática e não tem id, trocar por índice mascarado não ganharia nada |
| Benchmark 8 — modo escuro | decisão de design, não de código |
| Benchmark 9 — transição de página | depende de View Transitions, que muda o roteamento |
| `bff-thumb.svg` (245 kB) | é vetor de verdade; precisa de SVGO, não de conversão |
| 7.2 do REPORT — i18n | refatorar para namespaces sob demanda é maior que "pequeno" |


---

## 🐞 Bugs

### B1 — Todo `Button` é `type="submit"` 🔴
`src/components/button/index.tsx:92` tem `type="submit"` fixo.

Hoje não há formulário no site, então não aparece. No dia em que houver — um
formulário de contato, uma busca — **qualquer botão dentro dele vai submeter**,
inclusive o de trocar idioma e os de rede social.

**Correção:** `type={rest.type ?? "button"}`, que é o padrão seguro.

### B2 — `<html lang="pt-BR">` mas o site abre em inglês 🔴
`index.html:2` declara `pt-BR`; `src/i18n/index.ts:13` tem `lng: "en"`.

E o `lang` **nunca é atualizado** ao trocar de idioma — não há nenhum
`documentElement.lang` no projeto. Ou seja, está errado nos dois idiomas.

Consequência real: leitor de tela lê o inglês com fonética portuguesa, e o
Google indexa a página com o idioma errado.

**Correção:** `lang="en"` no HTML e um efeito que sincroniza
`document.documentElement.lang` com `i18n.language`.

### B3 — A escolha de idioma não persiste 🟡
Não há `localStorage` nem detector no i18n. Trocar para português e recarregar
volta para inglês. Um visitante brasileiro precisa trocar toda visita.

**Correção:** `i18next-browser-languagedetector`, ou salvar em `localStorage` no
`toggleLanguage` e ler no `init`.

### B4 — Service worker cache-first no `index.html` 🟡
`public/sw.js` guarda `/` e `/index.html` e responde cache-first. Depois de um
deploy, o HTML velho pode ser servido apontando para chunks com hash que não
existem mais — tela branca até um hard refresh.

**Correção:** network-first (ou stale-while-revalidate) para navegação, mantendo
cache-first só para assets com hash no nome.

---

## ♿ Acessibilidade

### A1 — Os links do menu e do rodapé não têm foco visível 🔴
`src/components/link/index.tsx` **não tem uma única regra de foco**. O sublinhado
animado e o fundo respondem só a `group-hover`, sem `group-focus-visible`.

Navegando por `Tab`, a navegação principal fica invisível. É o achado mais grave
da lista: a navegação primária é inutilizável no teclado.

**Correção:** acrescentar `focus-visible:` ao `<a>` e trocar
`group-hover:` por `group-hover:… group-focus-visible:…` nos dois efeitos.

### A2 — Nove botões só-com-ícone sem nome acessível 🔴
Nenhum passa `aria-label`:

| Onde | Quantos |
|---|---|
| Hero — GitHub, LinkedIn, Medium | 3 |
| Rodapé — GitHub, Medium, LinkedIn, Instagram | 4 |
| Menu mobile — abrir e fechar | 2 |

O leitor de tela anuncia "botão" e mais nada. O `Button` já repassa `...rest`,
então é só passar a prop — o componente não precisa mudar.

### A3 — O menu mobile não é um diálogo 🔴
`src/components/navigation-bar/mobile.tsx` não tem `aria-expanded`,
`aria-controls`, `role="dialog"`, foco preso, fechar com `Esc` nem devolução de
foco. Zero ocorrências dos quatro.

Com o menu aberto, o `Tab` continua percorrendo a página atrás do backdrop.

### A4 — Texto visível hardcoded em português 🟡
O CLAUDE.md pede que todo texto visível venha dos locales. Escaparam:

| Arquivo | Texto |
|---|---|
| `page-template/index.tsx:16` | "Pular para o conteúdo principal" |
| `navigation-bar/mobile.tsx:97` | "Menu" |
| `navigation-bar/web.tsx:19` | `aria-label="Navegação principal"` |
| `navigation-bar/web.tsx:27` | `aria-label="Contratar no LinkedIn"` |
| `toogle/index.tsx:24,27` | `aria-label`/`title` "Mudar idioma para…" |

Como o site abre em inglês, **o skip link — primeira coisa que um usuário de
teclado encontra — está em português**.

### A5 — Três imagens sem `width`/`height` 🟡
`project-card`, `article-card` e `self` não reservam a caixa antes de a imagem
chegar. Causa CLS. O hero já foi corrigido na task 08.

### A6 — A imagem do `self` não é lazy 🟢
120 kB abaixo da dobra sem `loading="lazy"`.

### A7 — Os IDs de heading dos artigos não levam a nada 🟢
O plugin gera `id` slugificado em todo heading, mas nada usa: sem sumário, sem
link de âncora, sem "copiar link da seção". Um artigo com 14 `h2` e 24 `h3` fica
sem navegação interna.

### A8 — O rótulo do easter egg não muda de estado 🟢
O botão do rodapé diz sempre "Desligar a gravidade", mesmo com o modo ativo.
Sem `aria-pressed`.

### A9 — `alt` do `self` descreve o que não se vê 🟢
"Davy de Souza Assunção - Portfolio workspace" para uma imagem de mockup. Ou
descreve o conteúdo real, ou vira `alt=""` por ser decorativa.

---

## 🧭 UX

### U1 — Esqueletos falsos atrasam conteúdo que já existe 🔴
`projects/index.tsx` e `skills/index.tsx` têm `setTimeout` de **800 ms e 600 ms**
mostrando esqueleto antes de renderizar dados **que já estão em memória** — são
constantes importadas, não chamadas de rede.

Isso é atraso artificial puro. A seção Articles já não faz mais isso; as outras
duas ficaram.

**Correção:** apagar o `useState`/`useEffect` e renderizar direto.

### U2 — A navegação some ao rolar 🟡
A `<nav>` não é sticky. Numa página com 7 seções e artigos longos, quem chega ao
rodapé precisa rolar tudo de volta para navegar. Todas as LPs de referência
(Linear, Stripe, Vercel, Raycast) têm header fixo ou que reaparece ao subir.

### U3 — O menu não indica onde você está 🟡
Não há scroll-spy: o desktop não tem estado ativo nenhum, e o `activeLink` do
mobile só é setado no clique — rolar não atualiza.

### U4 — Nada indica progresso de leitura no artigo 🟡
Artigos de 12 a 15 minutos sem barra de progresso e sem sumário. O tempo de
leitura aparece só no topo.

### U5 — O artigo acaba e não oferece nada 🟡
Sem "próximo artigo", sem voltar à lista no fim, sem CTA. O único caminho é o
botão "Voltar" lá no topo.

### U6 — Sem "voltar ao topo" 🟢
Página longa, sem atalho.

### U7 — Quatro imagens de projeto somam 6,2 MB 🔴
`quezzy` 2,7 MB · `rentx` 1,8 MB · `go-finances` 1,6 MB. São "SVGs" que quase
certamente embutem bitmap em base64 — 2,7 MB para um viewBox de 1920×960 não se
explica de outro jeito.

Somados à foto do hero (1,4 MB), são **7,6 MB de imagem** num portfólio cujo
argumento de venda é performance.

---

## 🎨 UI e padronização

### P1 — A pasta `toogle` está com o nome errado 🟢
`src/components/toogle/` — o certo é `toggle`. Aparece em imports de dois
arquivos.

### P2 — Props ora em `types.ts`, ora inline 🟡
11 componentes usam `types.ts`; 8 declaram a interface inline (`loading`,
`skeleton-loader`, `text`, `gravity-mode`, `navigation-bar`, os dois skeletons).
O CLAUDE.md pede seguir o padrão dos vizinhos, e o padrão dominante é `types.ts`.

### P3 — Quatro hooks são `.tsx` sem nenhum JSX 🟢
`use-log.tsx`, `use-mobile.tsx`, `use-pdf.tsx`, `use-seo.tsx`. Os mais novos
(`use-locales`, `use-experience-section`, `use-gravity-mode`, `use-hash-route`)
são `.ts`. Duas convenções convivendo.

### P4 — O breakpoint de JS diverge do de CSS 🟡
`useMobile(769)` troca a navegação em 769 px, mas o hero só vira linha em
`xl` (1280). **Entre 769 e 1279 px o site mostra a navegação de desktop com o
hero empilhado** — um estado que ninguém desenhou.

Além disso, o hook escuta `resize` sem throttle: re-render a cada pixel enquanto
a janela é arrastada.

**Correção:** `matchMedia` com o mesmo breakpoint do Tailwind, ou resolver a
navegação em CSS e apagar o hook.

### P5 — `key={index}` em 9 listas 🟢
Funciona porque as listas são estáticas, mas é o padrão que quebra no dia em que
alguma for filtrada ou reordenada. Os artigos já usam `key={article.slug}`.

### P6 — Larguras máximas ad-hoc 🟢
`maxWidth="764px"`, `xl:w-[610px]`, `xl:w-[518px]`, `max-w-7xl`, `max-w-3xl`,
`max-w-5xl`. Seis medidas diferentes, nenhuma no tema. Duas ou três no
`tailwind.config.js` cobririam tudo.

---

## ⚡ Performance

### F1 — A fonte pede 18 variantes e o site usa 4 🔴
`index.html:33` pede `wght@0,100…0,900;1,100…1,900` — 9 pesos e 9 itálicos.

O CSS gerado usa **400, 500, 600 e 700**, e as classes no código são só
`font-normal`, `font-medium`, `font-semibold` e `font-bold`.

O `<link rel="stylesheet">` do Google Fonts **bloqueia a renderização**. Os
arquivos de fonte de pesos não usados não chegam a ser baixados, mas o CSS
bloqueante fica inflado por 18 blocos `@font-face` com vários `unicode-range`, e
ele está no caminho crítico. Os `preconnect` e o `display=swap` estão certos — o
problema é só o excesso de variantes.

**Correção:** pedir `wght@400;500;600;700` e `ital,wght@1,400` (o itálico é usado
nos artigos). Ou self-hostar a variable font e tirar o terceiro domínio do
caminho crítico.

### F2 — 7,6 MB de imagem (ver U7) 🔴
Já é o item 7.1 do `REPORT.md`. É, de longe, o maior ganho disponível.

### F3 — O i18n carrega todos os locales no bundle inicial 🟡
`src/i18n/index.ts` importa os quatro JSON estaticamente. Texto de seção lazy
pesa no caminho inicial de qualquer jeito.

### F4 — `console.log` do service worker em produção 🟢
`serviceWorkerRegistration.ts` loga registro e atualização. O `useLog` do console
é intencional e bem-vindo; estes não.

---

## 📐 Benchmark — o que LPs de referência têm e este site não

Comparado com Linear, Stripe, Vercel, Raycast, Resend e portfólios de referência
(Brittany Chiang, Josh Comeau, Rauno Freiberg).

| # | O que falta | Quem faz bem | Esforço |
|---|---|---|---|
| 1 | **Header sticky** com fundo que condensa ao rolar | todos | baixo |
| 2 | **Scroll-spy** marcando a seção atual | Linear, Stripe docs | baixo |
| 3 | **Sumário do artigo** com heading ativo (os IDs já existem) | Josh Comeau, Stripe | médio |
| 4 | **Barra de progresso de leitura** | Josh Comeau | baixo |
| 5 | **Próximo/anterior** no fim do artigo | todo blog técnico | baixo |
| 6 | **OG image por artigo** — hoje todo link compartilhado mostra a mesma imagem | Vercel, Resend | médio |
| 7 | **RSS** — blog técnico sem feed perde leitor recorrente | Josh Comeau, Rauno | baixo |
| 8 | **Modo escuro** — esperado em portfólio de dev; o site é claro com hero escuro | todos | alto |
| 9 | **Transição de página** ao abrir artigo (hoje é troca seca) | Linear, Raycast | médio |
| 10 | **Âncora copiável no heading** | Stripe docs, MDN | baixo |

Três observações de conjunto, que valem mais que a lista:

**O site vende performance e é pesado.** O texto diz "aplicações financeiras de
alta criticidade" e "foco em performance", e a home carrega 7,6 MB de imagem. É
a incoerência mais cara do projeto — não tecnicamente, mas para o argumento.

**Os artigos são o ativo mais forte e estão no fim da página.** São 8 textos
longos e técnicos, o tipo de conteúdo que faz alguém voltar. Estão na penúltima
seção, sem feed, sem OG próprio e sem sumário. Nas referências, o conteúdo é a
porta de entrada, não o rodapé.

**A camada 3D está acima da média; o básico está abaixo.** O site tem shader em
TSL, física com Rapier e canvas global por seção — e ao mesmo tempo links de menu
sem foco visível, nove botões sem nome e `lang` errado. Um recrutador técnico
com leitor de tela ou só o `Tab` esbarra no segundo grupo antes de ver o
primeiro.

---

## Ordem que eu seguiria

**Primeiro — barato e de alto impacto** (algumas horas)
1. A1 foco nos links · A2 `aria-label` nos 9 botões · A4 strings hardcoded
2. B1 `type` do Button · B2 `lang` · B3 persistir idioma
3. U1 apagar os esqueletos falsos
4. F1 reduzir os pesos da fonte

**Segundo — o que muda os números** (um dia)
5. F2/U7 otimizar as imagens: sozinho vale mais que toda a série Experience
6. A3 menu mobile como diálogo
7. U2 header sticky · U3 scroll-spy

**Terceiro — o que diferencia** (a decidir)
8. Sumário, progresso, próximo/anterior e OG por artigo
9. RSS
10. Modo escuro

**Manutenção**
11. P2/P3/P4/P6 padronização · B4 estratégia do service worker
