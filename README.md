# 🚀 Portfolio - Davy de Souza Assunção

> Frontend Engineer especializado em Fintech | React • TypeScript • Next.js

Portfolio profissional desenvolvido com as melhores práticas de desenvolvimento frontend, otimizado para performance, SEO e acessibilidade.

## 🎯 Sobre o Projeto

Este portfolio serve como um **super currículo digital**, apresentando minha expertise como Frontend Engineer com especialização em aplicações Fintech. Desenvolvido com foco em:

- ⚡ **Performance otimizada** - Code splitting, lazy loading e Service Worker
- 🎨 **Design moderno** - Interface limpa e profissional com Tailwind CSS
- ♿ **Acessibilidade** - WCAG 2.1 compliant com ARIA labels e navegação por teclado
- 🔍 **SEO avançado** - Meta tags, Open Graph, Twitter Cards e Structured Data
- 🌍 **Internacionalização** - Português e Inglês
- 📱 **PWA ready** - Funcionalidades offline com Service Worker

### Seções

- **Hero**: Apresentação com CTA para conexão
- **Sobre**: Experiência real em Fintech na Fretepago
- **Expertise**: Áreas de especialização técnica
- **Stack**: Tecnologias e ferramentas que domino
- **Cases de Estudo**: Projetos pessoais para exploração técnica
- **Artigos**: Reflexões sobre frontend, arquitetura e desenvolvimento
- **Footer**: Contatos e redes sociais

## 🛠️ Stack Técnica

### Core

- **React** 18.3.1 - UI library
- **TypeScript** 5.5.3 - Type safety
- **Vite** 5.4.1 - Build tool & dev server
- **Tailwind CSS** 3.4.13 - Utility-first CSS

### Performance & SEO

- **Service Worker** - Cache estratégico e funcionalidades offline
- **Code Splitting** - Lazy loading de componentes
- **React.memo** - Otimização de re-renders
- **Structured Data** - JSON-LD para rich snippets

### Internacionalização

- **i18next** 25.6.0 - Sistema de i18n
- **react-i18next** 16.0.1 - React integration

### UI & Utilities

- **React Icons** 5.3.0 - Icon library
- **clsx** 2.1.1 - Conditional classnames

### Developer Experience

- **ESLint** 9.9.0 - Code linting
- **TypeScript ESLint** 8.0.1 - TS specific rules
- **PostCSS & Autoprefixer** - CSS processing
- **Rollup Visualizer** - Bundle analysis

## 📁 Estrutura do Projeto

```
portfolio/
├── public/
│   ├── sw.js                    # Service Worker para PWA
│   ├── images/                  # Assets estáticos
│   └── pdfs/                    # Currículos
├── src/
│   ├── components/              # Componentes reutilizáveis
│   │   ├── button/             # Componente de botão
│   │   ├── link/               # Componente de link
│   │   ├── loading/            # Loading states (memo)
│   │   ├── navigation-bar/     # Nav responsiva (web + mobile)
│   │   ├── optimized-image/    # Imagens otimizadas (memo)
│   │   ├── page-template/      # Template com semântica HTML (memo)
│   │   ├── project-card/       # Cards de projetos
│   │   ├── structured-data/    # JSON-LD para SEO
│   │   └── ...
│   ├── hooks/                   # Custom hooks
│   │   ├── useSEO/             # Hook de SEO otimizado
│   │   ├── useLocales/         # Gerenciamento de idiomas
│   │   ├── useMobile/          # Detecção de mobile
│   │   └── ...
│   ├── pages/
│   │   └── home/               # Página home (lazy loaded)
│   │       ├── hero/           # Seção hero
│   │       ├── self/           # Sobre mim
│   │       ├── services/       # Expertise
│   │       ├── skills/         # Stack
│   │       ├── projects/       # Cases de estudo
│   │       ├── articles/       # Artigos Medium
│   │       └── footer/         # Footer
│   ├── i18n/                    # Configuração i18next
│   ├── shared/                  # Constantes e utils
│   ├── serviceWorkerRegistration.ts
│   └── main.tsx
├── vite.config.ts               # Vite config com otimizações
├── tsconfig.json                # TypeScript config
└── tailwind.config.js           # Tailwind com design tokens
```

- Node.js 16+
- npm ou yarn

### Instalação e execução

```bash
# Clone o repositório
git clone https://github.com/davysz/portfolio.git

# Entre no diretório
cd portfolio

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📋 Scripts

```bash
npm run dev          # Servidor de desenvolvimento (porta 3000)
npm run build        # Build de produção otimizado
npm run preview      # Preview do build (com Service Worker)
npm run build:analyze # Análise do bundle size
npm run lint         # Lint do código
```

## 🏗️ Build de Produção

O build é otimizado com:

- ✅ **Code splitting** automático por rota
- ✅ **Tree shaking** para remover código não utilizado
- ✅ **Minificação** com esbuild
- ✅ **Chunks estratégicos** (vendor, i18n, icons, utils)
- ✅ **Asset optimization** com hashing para cache
- ✅ **Service Worker** para cache e offlineento
- `yarn build` - Compila TypeScript e gera build de produção
- `yarn lint` - Executa o linter ESLint
- `⚡ Otimizações Implementadas

### Performance

- **Lazy Loading**: Seções carregadas sob demanda
- **React.memo**: Componentes puros memorizados
- **Code Splitting**: Bundle dividido em chunks estratégicos
- **Service Worker**: Cache de assets e offline-first
- **Image Optimization**: Loading lazy e placeholders
- **CSS Optimization**: Purge de CSS não utilizado

### SEO

- **Meta Tags**: Open Graph, Twitter Cards completos
- **Structured Data**: JSON-LD para rich snippets
- **Sitemap**: XML sitemap para crawlers
- **Semantic HTML**: Landmarks e ARIA labels
- **Performance Tags**: Preconnect, DNS-prefetch

### Acessibilidade (WCAG 2.1)

- **Skip Navigation**: Link para pular para conteúdo
- **ARIA Labels**: Navegação acessível
- **Keyboard Navigation**: Totalmente navegável por teclado
- **Screen Reader**: Otimizado para leitores de tela
- **Contrast Ratios**: Conformidade com padrões

### Developer Experience

- **TypeScript Strict**: Type safety completo
- **Path Aliases**: Imports limpos (@components, @hooks, etc.)
- **ESLint**: Regras modernas de código
- **Component Architecture**: Modular e reutilizável
- **Console Message**: Mensagem criativa para devs curiosos

## 🌍 Internacionalização

Suporte completo para **Português** e **Inglês**:

- Sistema i18next configurado
- Traduções organizadas por contexto
- Fallback automático
- Mudança de idioma em tempo real

Arquitetura baseada em componentes reutilizáveis com tipagem TypeScript completa.

## 🎯 Highlights Técnicos

- **Frontend Engineering**: Arquitetura escalável com React + TypeScript
- **Performance**: Lighthouse Score 90+ em todas as métricas
- **Clean Code**: Código limpo, testável e manutenível
- **Best Practices**: Seguindo padrões da indústria
- **Modern Stack**: Ferramentas e frameworks atuais

## 📫 Contato

**Davy de Souza Assunção**  
Frontend Engineer & Fintech Specialist

- 🌐 Portfolio: [davysz.com](https://davysz.com)
- 💼 LinkedIn: [Davy de Souza Assunção](https://www.linkedin.com/in/davy-de-souza-assun%C3%A7%C3%A3o-0b7483180)
- 🐙 GitHub: [davysz](https://github.com/davysz)
- ✍️ Medium: [@davysz](https://medium.com/@davysz)
- 📧 Email: davydesouzabar@gmail.com

---

<p align="center">
  Desenvolvido com React, TypeScript e ☕<br>
  <strong>Janeiro 2026</strong>
</p>
