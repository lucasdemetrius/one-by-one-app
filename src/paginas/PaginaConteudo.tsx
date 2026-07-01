// Arquivo: src/paginas/PaginaConteudo.tsx
// Descrição: Índice público da Central de Conteúdo (SEO) — lista todos os artigos
//            com título, resumo e categoria. Cada card leva para /conteudo/:slug.

import { Link } from 'react-router-dom'

import { LayoutPublico } from './LayoutPublico'
import { SEO, SITE_URL, SITE_NOME } from '@/lib/seo'
import { ARTIGOS } from '@/recursos/conteudo/artigos'

export function PaginaConteudo() {
  // Dados estruturados: uma lista (ItemList) apontando para cada artigo.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Central de conteúdo do TeamBOX',
    itemListElement: ARTIGOS.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/conteudo/${a.slug}`,
      name: a.titulo,
    })),
  }

  return (
    <LayoutPublico>
      <SEO
        titulo={`Central de conteúdo — ${SITE_NOME}`}
        descricao="Guias práticos sobre reuniões 1:1, matriz 9-box, PDI e feedback para líderes e RH. Aprenda a desenvolver seu time de perto."
        caminho="/conteudo"
        jsonLd={jsonLd}
      />

      <header className="mb-8">
        <h1 className="fonte-display text-4xl font-extrabold text-tinta">Central de conteúdo</h1>
        <p className="mt-3 text-lg text-tinta-suave">
          Guias práticos sobre 1:1, matriz 9-box, PDI e feedback — para liderar seu time de perto.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {ARTIGOS.map((a) => (
          <Link
            key={a.slug}
            to={`/conteudo/${a.slug}`}
            className="group flex gap-4 overflow-hidden rounded-[var(--radius-cartao)] border-2 border-borda bg-creme transition hover:border-juncao hover:shadow-[var(--shadow-cartao)]"
          >
            {/* Capa (imagem real ou gradiente com ícone) — escondida no celular */}
            {a.imagem ? (
              <img src={a.imagem} alt={a.titulo} loading="lazy" className="hidden w-40 shrink-0 self-stretch object-cover sm:block" />
            ) : (
              <div className="gradiente-marca hidden w-40 shrink-0 items-center justify-center self-stretch text-4xl sm:flex">
                {a.emoji}
              </div>
            )}
            <div className="flex-1 p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-juncao">{a.categoria}</span>
              <h2 className="fonte-display mt-1 text-xl font-extrabold text-tinta group-hover:text-juncao">
                {a.titulo}
              </h2>
              <p className="mt-2 text-tinta-suave">{a.resumo}</p>
              <span className="mt-3 inline-block text-sm font-bold text-tinta-suave">
                {a.leituraMin} min de leitura →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </LayoutPublico>
  )
}
