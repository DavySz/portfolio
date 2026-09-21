# davysz.com

Site pessoal e portfólio do Davy de Souza Assunção, Frontend Engineer especializado em fintech. Publicado em https://davysz.com. É vitrine profissional: qualidade de código, performance e acessibilidade fazem parte do que o site demonstra.

## Stack

- React + TypeScript + Vite (SPA renderizada no cliente)
- Tailwind CSS v3 via PostCSS (`tailwind.config.js`, `postcss.config.js`)
- ESLint com flat config (`eslint.config.js`). **Não há Prettier** no projeto: casar com o estilo dos arquivos vizinhos e passar no lint é o suficiente.
- **Yarn** é o único gerenciador de pacotes. Nunca usar npm ou pnpm, nem gerar outro lockfile.

Os nomes dos scripts estão no `package.json`; consultar em vez de supor.

Há três pipelines de conteúdo, todos com script próprio e documentados no
código: `assets:*` (modelos 3D), `images:optimize` (imagens do site) e
`content:feeds` (sitemap e RSS, roda no `prebuild`).

## Verificação antes de concluir qualquer tarefa

1. Typecheck. O build do Vite **não** checa tipos, e o projeto usa project references (`tsconfig.app.json` + `tsconfig.node.json`), então o typecheck precisa rodar separado (`tsc -b` ou o script equivalente do `package.json`).
2. Lint sem erros novos.
3. Build de produção passando.

Se algum passo não puder ser executado no ambiente, dizer isso explicitamente no resumo em vez de omitir.

## Convenções

- Seguir o padrão dos arquivos vizinhos (nomes, exports, estrutura de pastas) em vez de introduzir um novo. Se o padrão existente parecer ruim, apontar no resumo, não mudar por conta própria.
- Estilo com Tailwind. CSS próprio só quando o Tailwind não resolve bem (keyframes complexos, estilos de canvas), e com justificativa.
- Cor da marca: `#7947DF`. Usar o token do tema do Tailwind se existir; se não existir, propor a criação em vez de espalhar o hex.
- O site é bilíngue via i18next (`en` e `pt`) e **abre em inglês**. Todo texto visível entra pelos dois locales (`src/pages/home/locales/`, `src/components/locales/`); nunca hardcodar string visível no componente.
- Acessibilidade é requisito, não extra: contraste WCAG AA, foco visível, navegação completa por teclado, `prefers-reduced-motion` respeitado em toda animação.
- Performance: nada pode atrasar o primeiro conteúdo. Dependência pesada entra por `import()` dinâmico, nunca no bundle inicial. Ao adicionar dependência, reportar o impacto no bundle.

## Fluxo de trabalho

- O trabalho é guiado por specs em `docs/tasks/`. Quando uma task for indicada, ler antes o `README.md` da pasta dela.
- Uma branch por task, com o nome definido na spec.
- **Nunca commitar.** Ao terminar: resumo do que mudou, o que ficou pendente de checagem manual e uma sugestão de mensagem em Conventional Commits.
- Dúvida de produto, conteúdo ou visual que a spec não resolve vira pergunta, não suposição.
- Citar o **nome** do empregador é permitido. Continua proibido: dados, endpoints, métricas, nomes de sistemas internos e prints de sistemas de empregadores, nem como exemplo. Dado de demonstração é sempre inventado e genérico.

## Experience (camada 3D/WebGL)

- Código em `src/experience/`. Núcleo imperativo em TypeScript, sem React.
- React só monta e desmonta o canvas; nenhum estado do three.js passa por estado do React.
- Renderer: `WebGPURenderer` de `three/webgpu` (fallback automático para WebGL2). Shaders em TSL (`three/tsl`), nunca GLSL cru.
- Cada efeito é uma `Feature` (`scene`, `camera`, `resize`, `update`, `dispose`) registrada no `Experience`.
- `src/experience/quality.ts` (`detectQuality()`) é o único arquivo do experience importado estaticamente. Precisa continuar pequeno e sem dependências.
- Toda feature define comportamento nos tiers `high`, `low` e com `animate: false`. O tier `off` nunca baixa three.js.
- O canvas é decoração (`aria-hidden`): o site precisa funcionar completo sem WebGL.
- Toda geometria, material e textura criada é liberada no `dispose()`.
- Dispositivo de referência para mobile: Android de entrada (Galaxy A13).
- Specs e ordem de trabalho em `docs/tasks/experience/`; relatórios gerados em `docs/experience/`.
