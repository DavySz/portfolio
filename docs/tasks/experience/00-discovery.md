# 00 — Discovery e baseline de performance

**Branch:** nenhuma (task só de leitura, exceto o arquivo de saída)
**Depende de:** —

## Objetivo

Entender o projeto antes de mexer nele e registrar a linha de base de performance que todas as tasks seguintes vão usar como orçamento.

## O que levantar

1. **Framework e build:** Next (App Router ou Pages?) ou Vite? Versões de React, TypeScript e do bundler. Existe SSR/SSG ou é SPA?
2. **Gerenciador de pacotes:** pelo lockfile. Usar sempre o mesmo nas tasks seguintes.
3. **Convenções:** alias de import (`@/`?), estrutura de pastas, estilo (CSS Modules, Tailwind, styled-components…), lint e formatter configurados, scripts do `package.json`.
4. **Hero:** qual arquivo renderiza o hero, como ele é posicionado, se já tem background, animação ou imagem pesada.
5. **Dependências já presentes:** alguma lib de animação (GSAP, Framer Motion), `three`, `@react-three/*`? Anotar para não duplicar.
6. **Deploy:** onde o site é publicado (Vercel, Netlify, outro) e se existe ambiente de preview por branch.
7. **Baseline de performance:**
   - rodar o build de produção e registrar o tamanho gzip dos chunks JS iniciais;
   - rodar Lighthouse mobile na home (build local servido em modo produção) 3 vezes e registrar a mediana de LCP, TBT, CLS e Performance score.

## Saída

Criar `docs/experience/BASELINE.md` com as respostas acima, os números do baseline, a data e o commit de referência (`git rev-parse --short HEAD`).

Terminar com uma seção **Ajustes necessários nas próximas tasks**: tudo o que o projeto faz de diferente do que as specs assumem (ex.: "não é Next, então o `'use client'` é desnecessário", "estilo é Tailwind, então o CSS do fallback vira classes", "alias é `~/`").

## Fora de escopo

Qualquer alteração em código, dependências ou configuração.

## Critérios de aceite

- `BASELINE.md` existe, com todos os itens preenchidos ou marcados como "não se aplica" com motivo.
- Nenhum outro arquivo foi modificado (`git status` limpo exceto o `BASELINE.md`).

---

## Prompt de execução

```
Leia docs/tasks/experience/README.md e docs/tasks/experience/00-discovery.md.
Execute a task 00. Ela é só de leitura: o único arquivo que você pode criar é docs/experience/BASELINE.md.
Se não conseguir rodar o Lighthouse no ambiente, registre os números de bundle e deixe instruções para eu rodar o Lighthouse manualmente.
No final, mostre o resumo dos achados e a seção "Ajustes necessários nas próximas tasks".
```
