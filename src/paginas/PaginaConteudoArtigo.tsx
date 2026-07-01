// Arquivo: src/paginas/PaginaConteudoArtigo.tsx
// Descrição: Página pública de um artigo da Central de Conteúdo (SEO). Lê o :slug da
//            URL, renderiza o conteúdo e injeta os dados estruturados (Article + FAQ).
//            Slug inexistente → volta para o índice /conteudo.

import { Link, Navigate, useParams } from 'react-router-dom'

import { LayoutPublico } from './LayoutPublico'
import { SEO, SITE_URL, SITE_NOME } from '@/lib/seo'
import { acharArtigo } from '@/recursos/conteudo/artigos'

export function PaginaConteudoArtigo() {
  const { slug } = useParams<{ slug: string }>()
  const artigo = slug ? acharArtigo(slug) : undefined

  // Slug desconhecido → manda para o índice (evita página vazia e mantém SEO limpo).
  if (!artigo) return <Navigate to="/conteudo" replace />

  const url = `${SITE_URL}/conteudo/${artigo.slug}`

  // JSON-LD: o artigo (Article) + o bloco de perguntas frequentes (FAQPage).
  const jsonLdArtigo = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: artigo.titulo,
    description: artigo.resumo,
    inLanguage: 'pt-BR',
    dateModified: artigo.atualizadoEm,
    datePublished: artigo.atualizadoEm,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: SITE_NOME },
    publisher: { '@type': 'Organization', name: SITE_NOME },
    keywords: artigo.palavrasChave.join(', '),
  }
  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: artigo.faq.map((f) => ({
      '@type': 'Question',
      name: f.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: f.resposta },
    })),
  }

  return (
    <LayoutPublico>
      <SEO
        titulo={artigo.titulo}
        descricao={artigo.resumo}
        caminho={`/conteudo/${artigo.slug}`}
        tipo="article"
        atualizadoEm={artigo.atualizadoEm}
        publicadoEm={artigo.atualizadoEm}
        jsonLd={[jsonLdArtigo, jsonLdFaq]}
      />

      <nav className="mb-6 text-sm font-bold text-tinta-suave">
        <Link to="/conteudo" className="hover:text-tinta">
          ← Central de conteúdo
        </Link>
      </nav>

      <article>
        <span className="text-xs font-bold uppercase tracking-wider text-juncao">{artigo.categoria}</span>
        <h1 className="fonte-display mt-1 text-4xl font-extrabold leading-tight text-tinta">
          {artigo.titulo}
        </h1>
        <p className="mt-3 text-lg text-tinta-suave">{artigo.resumo}</p>
        <p className="mt-2 text-sm text-tinta-suave">{artigo.leituraMin} min de leitura</p>

        <div className="mt-8 flex flex-col gap-8">
          {artigo.secoes.map((s) => (
            <section key={s.titulo}>
              <h2 className="fonte-display text-2xl font-extrabold text-tinta">{s.titulo}</h2>
              <div className="mt-3 flex flex-col gap-3">
                {s.paragrafos.map((p, i) => (
                  <p key={i} className="text-[1.05rem] leading-relaxed text-tinta">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Perguntas frequentes (também vira rich result via JSON-LD FAQPage) */}
        {artigo.faq.length > 0 && (
          <section className="mt-10">
            <h2 className="fonte-display text-2xl font-extrabold text-tinta">Perguntas frequentes</h2>
            <div className="mt-4 flex flex-col gap-4">
              {artigo.faq.map((f) => (
                <div key={f.pergunta} className="rounded-[var(--radius-cartao)] border-2 border-borda bg-creme p-4">
                  <p className="font-bold text-tinta">{f.pergunta}</p>
                  <p className="mt-1 text-tinta-suave">{f.resposta}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Chamada para ação — converte o leitor de conteúdo em usuário */}
      <div className="mt-12 rounded-[var(--radius-cartao)] gradiente-marca p-6 text-center text-white">
        <p className="fonte-display text-2xl font-extrabold">Coloque isso em prática no TeamBOX</p>
        <p className="mt-2 text-white/90">
          Organize seus 1:1, a matriz 9-box, o PDI e o feedback do time — de graça para começar.
        </p>
        <Link
          to="/criar-conta"
          className="mt-4 inline-block rounded-full bg-white px-6 py-3 font-bold text-tinta shadow-[var(--shadow-cartao)]"
        >
          Criar conta grátis →
        </Link>
      </div>
    </LayoutPublico>
  )
}
