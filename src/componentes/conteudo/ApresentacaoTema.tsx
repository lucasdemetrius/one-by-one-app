// Arquivo: src/componentes/conteudo/ApresentacaoTema.tsx
// Descrição: Modo APRESENTAÇÃO de um tema — visão limpa, tela cheia e bonita do
//            conteúdo que o liderado montou (textos, links/cursos, imagens e
//            marcos). É read-only: serve para o liderado "apresentar" ao gestor.
//            Sincroniza ao vivo (a abertura/fechamento é espelhada na sala).

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

import { listarBlocos } from '@/recursos/conteudo/conteudoApi'
import type { Bloco } from '@/recursos/conteudo/conteudoApi'

interface ApresentacaoProps {
  colaboradorId: string
  tema: string
  aoFechar: () => void
}

function dataBR(iso: string | null): string {
  if (!iso) return ''
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

export function ApresentacaoTema({ colaboradorId, tema, aoFechar }: ApresentacaoProps) {
  const [blocos, setBlocos] = useState<Bloco[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let vivo = true
    listarBlocos(colaboradorId, tema)
      .then((b) => vivo && setBlocos(b))
      .finally(() => vivo && setCarregando(false))
    return () => {
      vivo = false
    }
  }, [colaboradorId, tema])

  // Fecha no Esc.
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoFechar])

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col bg-areia">
      {/* Cabeçalho fixo */}
      <header className="flex items-center justify-between border-b border-borda bg-creme/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-liderado/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-liderado">
            <span className="h-2 w-2 animate-pulse rounded-full bg-liderado" />
            Apresentando ao vivo
          </span>
          <h2 className="fonte-display text-xl font-extrabold text-tinta">{tema}</h2>
        </div>
        <button
          type="button"
          onClick={aoFechar}
          className="rounded-full border-2 border-borda px-4 py-1.5 text-sm font-bold text-tinta transition hover:border-tinta"
        >
          Encerrar apresentação ✕
        </button>
      </header>

      {/* Conteúdo rolável, centralizado e arejado */}
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          {carregando ? (
            <p className="text-center text-tinta-suave">Carregando apresentação…</p>
          ) : blocos.length === 0 ? (
            <div className="rounded-[var(--radius-cartao)] border-2 border-dashed border-borda bg-creme/50 p-12 text-center">
              <span className="text-4xl">🌱</span>
              <p className="mt-3 text-tinta-suave">
                Este tema ainda não tem conteúdo para apresentar.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {blocos.map((b, i) => (
                <motion.article
                  key={b.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.08, 0.6), type: 'spring', stiffness: 260, damping: 26 }}
                >
                  {b.tipo === 'TEXTO' && (
                    <p className="whitespace-pre-wrap text-xl leading-relaxed text-tinta">{b.texto}</p>
                  )}

                  {b.tipo === 'LINK' && (
                    <a
                      href={b.url ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-[var(--radius-cartao)] border-2 border-borda bg-creme p-5 shadow-[var(--shadow-cartao)] transition hover:border-gestor"
                    >
                      <span className="text-2xl">🔗</span>
                      <span className="min-w-0">
                        <span className="block truncate text-lg font-bold text-gestor">
                          {b.texto || b.url}
                        </span>
                        {b.texto && b.url && (
                          <span className="block truncate text-sm text-tinta-suave">{b.url}</span>
                        )}
                      </span>
                    </a>
                  )}

                  {b.tipo === 'IMAGEM' && (
                    <figure className="overflow-hidden rounded-[var(--radius-cartao)] border border-borda shadow-[var(--shadow-cartao)]">
                      {b.imagem_url && (
                        <img src={b.imagem_url} alt={b.texto ?? 'imagem do tema'} className="w-full" />
                      )}
                      {b.texto && (
                        <figcaption className="bg-creme px-4 py-3 text-center text-sm text-tinta-suave">
                          {b.texto}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {b.tipo === 'MARCO' && (
                    <div className="flex items-start gap-4 rounded-[var(--radius-cartao)] border-2 border-juncao/30 bg-juncao/5 p-5">
                      <span className="text-3xl">📌</span>
                      <div>
                        <p className="text-lg font-bold text-tinta">{b.texto}</p>
                        {(b.data_inicio || b.data_fim) && (
                          <p className="mt-1 text-sm font-semibold text-juncao">
                            📅 {dataBR(b.data_inicio)}
                            {b.data_fim ? ` → ${dataBR(b.data_fim)}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.article>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
