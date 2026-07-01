// Arquivo: src/lib/seo.tsx
// Descrição: Componente <SEO> que injeta o <head> por página (title, description,
//            canonical, Open Graph, Twitter Card e blocos JSON-LD) via react-helmet-async.
//            Usado pelas páginas públicas de conteúdo (SEO) e pela landing.
//
//            Observação importante: o app é uma SPA (Vite). O Googlebot renderiza
//            JavaScript e lê estas tags, mas para máxima confiabilidade de indexação
//            e para preview em redes sociais o próximo passo é o pré-render estático
//            (SSG) — ver docs/SEO.md.

import { Helmet } from 'react-helmet-async'

// URL pública do site (usada em canonical/og:url) e nome da marca.
export const SITE_URL = 'https://teambox.com.br'
export const SITE_NOME = 'TeamBOX'

interface SEOProps {
  titulo: string
  descricao: string
  caminho: string // ex.: '/conteudo/matriz-9-box' (relativo ao domínio)
  tipo?: 'website' | 'article'
  imagem?: string // URL absoluta da imagem de compartilhamento (Open Graph)
  publicadoEm?: string // ISO (só para artigos)
  atualizadoEm?: string // ISO (só para artigos)
  // jsonLd: um ou mais objetos de dados estruturados (schema.org).
  jsonLd?: object | object[]
}

export function SEO({
  titulo,
  descricao,
  caminho,
  tipo = 'website',
  imagem,
  publicadoEm,
  atualizadoEm,
  jsonLd,
}: SEOProps) {
  const url = SITE_URL + caminho
  const tituloCompleto = titulo.includes(SITE_NOME) ? titulo : `${titulo} · ${SITE_NOME}`
  const blocos = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Helmet>
      <title>{tituloCompleto}</title>
      <meta name="description" content={descricao} />
      <link rel="canonical" href={url} />

      {/* Open Graph (Facebook, LinkedIn, WhatsApp) */}
      <meta property="og:type" content={tipo} />
      <meta property="og:site_name" content={SITE_NOME} />
      <meta property="og:title" content={tituloCompleto} />
      <meta property="og:description" content={descricao} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="pt_BR" />
      {imagem && <meta property="og:image" content={imagem} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={imagem ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={tituloCompleto} />
      <meta name="twitter:description" content={descricao} />
      {imagem && <meta name="twitter:image" content={imagem} />}

      {tipo === 'article' && publicadoEm && (
        <meta property="article:published_time" content={publicadoEm} />
      )}
      {tipo === 'article' && atualizadoEm && (
        <meta property="article:modified_time" content={atualizadoEm} />
      )}

      {/* Dados estruturados (schema.org) — ajudam nos rich results do Google */}
      {blocos.map((bloco, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(bloco)}
        </script>
      ))}
    </Helmet>
  )
}
