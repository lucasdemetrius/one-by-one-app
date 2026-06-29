// Arquivo: src/componentes/pdi/PdiLiderado.tsx
// Descrição: PDI (Plano de Desenvolvimento Individual) de um liderado — agora num
//            PAINEL LATERAL (drawer) que desliza da direita, em vez de modal (mais
//            moderno, menos "cara de ERP"). Mostra progresso em anel, objetivos com
//            status de prazo (atrasado / faltam X dias / concluído), e um atalho de
//            IA para sugerir objetivos. O gestor adiciona, conclui, ajusta e remove.

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

import { usePdi, useCriarPdi, useAtualizarPdi, useDeletarPdi } from '@/recursos/pdi/pdiApi'
import type { ItemPDI } from '@/recursos/pdi/pdiApi'
import { useChatIA, useConfigIA } from '@/recursos/ia/iaApi'
import { extrairMensagemErro } from '@/lib/api'
import { GraficoPdi } from '@/componentes/painel/GraficoPdi'

interface Props {
  colaboradorId: string
  nome: string
  aoFechar: () => void
}

function prazoBR(iso: string): string {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

// Status do prazo (em relação a hoje) para um item ainda não concluído.
function statusPrazo(prazo: string | null): { texto: string; classe: string } | null {
  if (!prazo) return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const alvo = new Date(prazo + 'T00:00:00')
  const dias = Math.round((alvo.getTime() - hoje.getTime()) / 86400000)
  if (dias < 0) return { texto: `atrasado ${Math.abs(dias)}d`, classe: 'bg-alerta/15 text-alerta' }
  if (dias === 0) return { texto: 'vence hoje', classe: 'bg-juncao/15 text-juncao' }
  if (dias <= 7) return { texto: `faltam ${dias}d`, classe: 'bg-juncao/10 text-juncao' }
  return { texto: prazoBR(prazo), classe: 'bg-areia-escura text-tinta-suave' }
}

// Ordena: pendentes primeiro (prazo mais próximo antes), concluídos por último.
function ordenar(itens: ItemPDI[]): ItemPDI[] {
  return [...itens].sort((a, b) => {
    if (a.concluido !== b.concluido) return a.concluido ? 1 : -1
    if (a.prazo && b.prazo) return a.prazo < b.prazo ? -1 : 1
    if (a.prazo) return -1
    if (b.prazo) return 1
    return 0
  })
}

export function PdiLiderado({ colaboradorId, nome, aoFechar }: Props) {
  const [aberto, setAberto] = useState(true) // controla a animação de entrada/saída
  const pdiQ = usePdi(colaboradorId)
  const criar = useCriarPdi(colaboradorId)
  const atualizar = useAtualizarPdi(colaboradorId)
  const deletar = useDeletarPdi(colaboradorId)

  const chat = useChatIA()
  const configQ = useConfigIA()
  const temIA = configQ.data?.tem_chave ?? false

  const [titulo, setTitulo] = useState('')
  const [prazo, setPrazo] = useState('')
  const [sugestoes, setSugestoes] = useState<string[]>([])
  const [erroIA, setErroIA] = useState('')

  const primeiro = nome.split(' ')[0]
  const itens = ordenar(pdiQ.data ?? [])
  const total = itens.length
  const concluidos = itens.filter((i) => i.concluido).length
  const progresso = total ? Math.round((concluidos / total) * 100) : 0

  // Fecha com a tecla Esc.
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [])

  function adicionar(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    criar.mutate(
      { titulo: titulo.trim(), prazo: prazo || undefined },
      { onSuccess: () => { setTitulo(''); setPrazo('') } },
    )
  }

  async function sugerir() {
    setErroIA('')
    setSugestoes([])
    try {
      const r = await chat.mutateAsync(
        `Sugira de 3 a 5 objetivos de desenvolvimento (PDI) curtos e acionáveis para o liderado ${primeiro}. ` +
          `Responda APENAS com a lista — um objetivo por linha, sem numeração, sem títulos, sem comentários.`,
      )
      const linhas = r
        .split('\n')
        .map((l) => l.replace(/^[-*•\d.)\s]+/, '').trim())
        .filter((l) => l.length > 3)
        .slice(0, 6)
      setSugestoes(linhas)
    } catch (err) {
      setErroIA(extrairMensagemErro(err))
    }
  }

  function aceitarSugestao(s: string, idx: number) {
    criar.mutate({ titulo: s })
    setSugestoes((l) => l.filter((_, i) => i !== idx))
  }

  const campo =
    'rounded-[var(--radius-suave)] border-2 border-borda bg-creme px-3 py-2 text-sm text-tinta outline-none focus:border-juncao'

  // Anel de progresso (SVG) — visual moderno em vez de só barra.
  const R = 26
  const C = 2 * Math.PI * R
  const oferta = C - (progresso / 100) * C

  return createPortal(
    <AnimatePresence onExitComplete={aoFechar}>
      {aberto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex justify-end bg-tinta/30 backdrop-blur-sm"
          onClick={() => setAberto(false)}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col overflow-hidden border-l-2 border-borda bg-areia shadow-[var(--shadow-flutuante)]"
          >
            {/* Cabeçalho com anel de progresso */}
            <header className="flex items-start gap-4 border-b border-borda bg-creme px-5 py-5">
              <div className="relative h-16 w-16 shrink-0">
                <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
                  <circle cx="32" cy="32" r={R} fill="none" stroke="var(--color-areia-escura)" strokeWidth="6" />
                  <circle
                    cx="32" cy="32" r={R} fill="none" stroke="var(--color-juncao)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={C} strokeDashoffset={oferta} className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-tinta">
                  {progresso}%
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-juncao">🎯 PDI</span>
                <h2 className="fonte-display truncate text-xl font-extrabold text-tinta">{primeiro}</h2>
                <p className="text-xs font-semibold text-tinta-suave">
                  {total === 0 ? 'sem objetivos ainda' : `${concluidos} de ${total} concluídos`}
                  {progresso === 100 && total > 0 && ' · tudo feito! 🎉'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-tinta-suave hover:bg-areia-escura"
              >
                ✕
              </button>
            </header>

            {/* Lista de objetivos */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Evolução do PDI (burn-up) — aparece com histórico de conclusões */}
              {total > 0 && (
                <div className="mb-4">
                  <GraficoPdi itens={itens} />
                </div>
              )}
              {pdiQ.isLoading ? (
                <p className="text-center text-tinta-suave">Carregando…</p>
              ) : total === 0 ? (
                <div className="rounded-[var(--radius-cartao)] border-2 border-dashed border-borda bg-creme/50 p-8 text-center">
                  <span className="text-4xl">🌱</span>
                  <p className="mt-2 text-sm text-tinta-suave">
                    Nenhum objetivo ainda. Adicione o primeiro abaixo — ou peça sugestões à IA.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {itens.map((i) => {
                    const status = i.concluido ? null : statusPrazo(i.prazo)
                    return (
                      <li
                        key={i.id}
                        className={[
                          'group flex items-center gap-3 rounded-[var(--radius-suave)] border px-3 py-3 transition-colors',
                          i.concluido ? 'border-borda bg-creme/60' : 'border-borda bg-creme',
                        ].join(' ')}
                      >
                        <button
                          type="button"
                          onClick={() => atualizar.mutate({ id: i.id, dados: { concluido: !i.concluido } })}
                          aria-label={i.concluido ? 'Desmarcar' : 'Concluir'}
                          className={[
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs transition',
                            i.concluido ? 'border-sucesso bg-sucesso text-white' : 'border-borda text-transparent hover:border-sucesso',
                          ].join(' ')}
                        >
                          ✓
                        </button>
                        <div className="min-w-0 flex-1">
                          <span className={['block text-sm font-semibold', i.concluido ? 'text-tinta-suave line-through' : 'text-tinta'].join(' ')}>
                            {i.titulo}
                          </span>
                          {status && (
                            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[0.7rem] font-bold ${status.classe}`}>
                              {status.texto}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => deletar.mutate(i.id)}
                          aria-label="Remover"
                          className="shrink-0 text-tinta-suave/40 opacity-0 transition hover:text-alerta group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}

              {/* Sugestões da IA */}
              {temIA && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={sugerir}
                    disabled={chat.isPending}
                    className="flex items-center gap-2 rounded-full border-2 border-juncao/40 px-4 py-2 text-sm font-bold text-juncao transition hover:bg-juncao/10 disabled:opacity-50"
                  >
                    ✨ {chat.isPending ? 'Pensando…' : 'Sugerir objetivos com IA'}
                  </button>
                  {erroIA && <p className="mt-2 text-xs font-medium text-alerta">{erroIA}</p>}
                  {sugestoes.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-tinta-suave">Toque para adicionar</span>
                      {sugestoes.map((s, i) => (
                        <button
                          key={`${i}-${s}`}
                          type="button"
                          onClick={() => aceitarSugestao(s, i)}
                          className="flex items-center gap-2 rounded-[var(--radius-suave)] border border-dashed border-juncao/40 bg-juncao/5 px-3 py-2 text-left text-sm text-tinta transition hover:bg-juncao/10"
                        >
                          <span className="text-juncao">＋</span>
                          <span className="flex-1">{s}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Adicionar objetivo */}
            <form onSubmit={adicionar} className="flex flex-wrap gap-2 border-t border-borda bg-creme p-4">
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Novo objetivo / ação" className={`${campo} min-w-0 flex-1`} />
              <input value={prazo} onChange={(e) => setPrazo(e.target.value)} type="date" className={`${campo} font-normal`} title="Prazo (opcional)" />
              <button type="submit" disabled={!titulo.trim() || criar.isPending} className="gradiente-marca rounded-[var(--radius-suave)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                + Adicionar
              </button>
            </form>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
