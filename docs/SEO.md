# SEO — Central de conteúdo

Base de SEO do TeamBOX: páginas públicas de conteúdo para ranquear no Google em
termos como "1:1", "one on one", "matriz 9-box / nine box", "PDI" e "feedback".

## O que já existe

- **`react-helmet-async`** — `<head>` dinâmico por página (title, description,
  canonical, Open Graph, Twitter Card e JSON-LD). Provider em `src/main.tsx`.
- **Componente `<SEO>`** (`src/lib/seo.tsx`) — usado por cada página pública.
- **Central de conteúdo** — rotas públicas (antes dos guards de auth):
  - `/conteudo` → `src/paginas/PaginaConteudo.tsx` (índice)
  - `/conteudo/:slug` → `src/paginas/PaginaConteudoArtigo.tsx` (artigo)
  - Casca visual: `src/paginas/LayoutPublico.tsx`
- **Conteúdo** — `src/recursos/conteudo/artigos.ts` (dados puros, tipados). Para
  novas páginas, basta adicionar objetos a `ARTIGOS`.
- **Dados estruturados (schema.org)** — `Article` + `FAQPage` em cada artigo e
  `ItemList` no índice (candidatos a rich results no Google).
- **`sitemap.xml` + `robots.txt`** — gerados no build por
  `scripts/gerar-sitemap.mjs` (roda no `prebuild`, sempre em sincronia com os
  artigos). Domínio via `SITE_URL` (padrão `https://teambox.com.br`).

## Como adicionar uma página nova

1. Adicione um objeto ao array `ARTIGOS` em `src/recursos/conteudo/artigos.ts`
   (slug único, título, resumo, palavras-chave, seções e FAQ).
2. Pronto: a página aparece no índice `/conteudo`, ganha rota `/conteudo/<slug>`
   e entra no `sitemap.xml` no próximo build.

## ⚠️ Próximo passo recomendado: pré-render (SSG)

O app é uma **SPA (Vite)**. O Googlebot executa JavaScript e lê as tags do
`<SEO>`, mas para **máxima confiabilidade de indexação** e para **preview em
redes sociais** (WhatsApp/LinkedIn não executam JS), o ideal é gerar HTML
estático das páginas públicas no build.

Opção recomendada: **`vite-react-ssg`** (compatível com o React Router 7 já usado).
Ele pré-renderiza as rotas listadas para HTML real, sem trocar de framework.
É uma mudança que mexe no entrypoint do app, então foi deixada como passo
seguinte, separada desta fundação, para não desestabilizar o build atual.

Quando fizer o SSG, gere `og:image` (imagem de compartilhamento) e liste as
rotas de `/conteudo/:slug` a partir de `ARTIGOS`.

## Escala de conteúdo

A meta é 30+ páginas. Com a fundação pronta, dá para gerar os próximos artigos
em lote (inclusive com um workflow, um tema por agente) e só colar os objetos em
`ARTIGOS`.
