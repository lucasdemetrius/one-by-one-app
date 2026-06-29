// Arquivo: src/componentes/acompanhamento/PainelLiderado.tsx
// Descrição: Painel do liderado num só lugar (drawer lateral, à direita): humor da
//            semana (sentimento), entregas, feedbacks recebidos e estudos — em abas
//            — mais um resumo da evolução do PDI no topo. Substitui o antigo card
//            "Em breve". Visual moderno, sem cara de ERP.

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

import {
  useAcompanhamento,
  useCriarAcompanhamento,
  useDeletarAcompanhamento,
} from '@/recursos/acompanhamento/acompanhamentoApi'
import type { TipoAcomp } from '@/recursos/acompanhamento/acompanhamentoApi'
import type { Organizacao } from '@/recursos/time/tipos'
import { usePdi } from '@/recursos/pdi/pdiApi'
import { GraficoHumor } from '@/componentes/painel/GraficoHumor'
import { RelatorioLiderado } from '@/componentes/acompanhamento/RelatorioLiderado'
import { Retrospectiva } from '@/componentes/acompanhamento/Retrospectiva'

interface Props {
  colaboradorId: string
  nome: string
  org: Organizacao
  aoFechar: () => void
}

const ABAS: { tipo: TipoAcomp; rotulo: string; emoji: string }[] = [
  { tipo: 'SENTIMENTO', rotulo: 'Sentimento', emoji: '💜' },
  { tipo: 'ENTREGA', rotulo: 'Entregas', emoji: '📦' },
  { tipo: 'FEEDBACK', rotulo: 'Feedbacks', emoji: '💬' },
  { tipo: 'ESTUDO', rotulo: 'Estudos', emoji: '📚' },
]

const HUMORES = [
  { v: 1, e: '😞', l: 'Difícil' },
  { v: 2, e: '😕', l: 'Abaixo' },
  { v: 3, e: '😐', l: 'Neutro' },
  { v: 4, e: '🙂', l: 'Bem' },
  { v: 5, e: '😄', l: 'Ótimo' },
]

function dataBR(iso: string): string {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a.slice(2)}`
}

const campo =
  'rounded-[var(--radius-suave)] border-2 border-borda bg-creme px-3 py-2 text-sm text-tinta outline-none focus:border-juncao'

// ── Resumo da evolução do PDI (read-only) ─────────────────────────────────────
function ResumoPdi({ colaboradorId }: { colaboradorId: string }) {
  const pdiQ = usePdi(colaboradorId)
  const itens = pdiQ.data ?? []
  if (itens.length === 0) return null
  const concluidos = itens.filter((i) => i.concluido).length
  const progresso = Math.round((concluidos / itens.length) * 100)
  return (
    <div className="mx-5 mt-4 flex items-center gap-3 rounded-[var(--radius-suave)] border border-borda bg-creme px-3 py-2.5">
      <span className="text-lg">🎯</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-xs font-bold text-tinta-suave">
          <span>PDI · {concluidos}/{itens.length} objetivos</span>
          <span>{progresso}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-areia-escura">
          <div className="gradiente-marca h-full transition-all" style={{ width: `${progresso}%` }} />
        </div>
      </div>
    </div>
  )
}

// ── Sentimento (humor) ────────────────────────────────────────────────────────
function SecaoSentimento({ colaboradorId }: { colaboradorId: string }) {
  const lista = useAcompanhamento(colaboradorId, 'SENTIMENTO')
  const criar = useCriarAcompanhamento(colaboradorId)
  const deletar = useDeletarAcompanhamento(colaboradorId)
  const [humor, setHumor] = useState<number | null>(null)
  const [nota, setNota] = useState('')

  function registrar(e: React.FormEvent) {
    e.preventDefault()
    if (humor == null) return
    criar.mutate(
      { tipo: 'SENTIMENTO', valor: humor, titulo: nota.trim() || undefined },
      { onSuccess: () => { setHumor(null); setNota('') } },
    )
  }

  const itens = lista.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={registrar} className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-4">
        <span className="text-xs font-bold uppercase tracking-wider text-tinta-suave">Como foi a semana?</span>
        <div className="mt-2 flex justify-between">
          {HUMORES.map((h) => (
            <button
              key={h.v}
              type="button"
              onClick={() => setHumor(h.v)}
              title={h.l}
              className={[
                'flex h-12 w-12 items-center justify-center rounded-full text-2xl transition',
                humor === h.v ? 'scale-110 bg-juncao/15 ring-2 ring-juncao' : 'hover:bg-areia-escura',
              ].join(' ')}
            >
              {h.e}
            </button>
          ))}
        </div>
        <input
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Nota (opcional): o que pesou nessa semana?"
          className={`${campo} mt-3 w-full font-normal`}
        />
        <button
          type="submit"
          disabled={humor == null || criar.isPending}
          className="gradiente-marca mt-3 w-full rounded-[var(--radius-suave)] py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Registrar humor
        </button>
      </form>

      {/* Gráfico de evolução do humor (aparece com 2+ registros) */}
      <GraficoHumor dados={itens.filter((i) => i.valor != null).map((i) => ({ valor: i.valor as number, data: i.data_ref }))} />

      {itens.length === 0 ? (
        <p className="text-center text-sm text-tinta-suave">Nenhum registro de humor ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {itens.map((i) => (
            <li key={i.id} className="group flex items-center gap-3 rounded-[var(--radius-suave)] border border-borda bg-creme px-3 py-2.5">
              <span className="text-2xl">{HUMORES.find((h) => h.v === i.valor)?.e ?? '•'}</span>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm text-tinta">{i.titulo || HUMORES.find((h) => h.v === i.valor)?.l}</span>
                <span className="text-xs text-tinta-suave">{dataBR(i.data_ref)}</span>
              </div>
              <button type="button" onClick={() => deletar.mutate(i.id)} aria-label="Remover" className="text-tinta-suave/40 opacity-0 transition hover:text-alerta group-hover:opacity-100">✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Entregas / Feedbacks / Estudos (registro com título + detalhe + data) ─────
function SecaoRegistro({
  colaboradorId,
  tipo,
  placeholderTitulo,
  placeholderDetalhe,
}: {
  colaboradorId: string
  tipo: TipoAcomp
  placeholderTitulo: string
  placeholderDetalhe: string
}) {
  const lista = useAcompanhamento(colaboradorId, tipo)
  const criar = useCriarAcompanhamento(colaboradorId)
  const deletar = useDeletarAcompanhamento(colaboradorId)
  const [titulo, setTitulo] = useState('')
  const [detalhe, setDetalhe] = useState('')
  const [data, setData] = useState('')

  function adicionar(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    criar.mutate(
      { tipo, titulo: titulo.trim(), detalhe: detalhe.trim() || undefined, data_ref: data || undefined },
      { onSuccess: () => { setTitulo(''); setDetalhe(''); setData('') } },
    )
  }

  const itens = lista.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={adicionar} className="flex flex-col gap-2 rounded-[var(--radius-cartao)] border border-borda bg-creme p-4">
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={placeholderTitulo} className={`${campo} w-full`} />
        <textarea value={detalhe} onChange={(e) => setDetalhe(e.target.value)} placeholder={placeholderDetalhe} rows={2} className={`${campo} w-full font-normal`} />
        <div className="flex items-center gap-2">
          <input value={data} onChange={(e) => setData(e.target.value)} type="date" title="Data (opcional)" className={`${campo} font-normal`} />
          <button type="submit" disabled={!titulo.trim() || criar.isPending} className="gradiente-marca ml-auto rounded-[var(--radius-suave)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            + Adicionar
          </button>
        </div>
      </form>

      {itens.length === 0 ? (
        <p className="text-center text-sm text-tinta-suave">Nada registrado ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {itens.map((i) => (
            <li key={i.id} className="group rounded-[var(--radius-suave)] border border-borda bg-creme px-3 py-2.5">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-tinta">{i.titulo}</span>
                  {i.detalhe && <span className="mt-0.5 block whitespace-pre-wrap text-xs text-tinta-suave">{i.detalhe}</span>}
                  <span className="mt-1 block text-xs font-semibold text-tinta-suave/80">{dataBR(i.data_ref)}</span>
                </div>
                <button type="button" onClick={() => deletar.mutate(i.id)} aria-label="Remover" className="shrink-0 text-tinta-suave/40 opacity-0 transition hover:text-alerta group-hover:opacity-100">✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function PainelLiderado({ colaboradorId, nome, org, aoFechar }: Props) {
  const [aberto, setAberto] = useState(true)
  const [mostrarRelatorio, setMostrarRelatorio] = useState(false)
  const [mostrarRetro, setMostrarRetro] = useState(false)
  const [aba, setAba] = useState<TipoAcomp>('SENTIMENTO')
  const primeiro = nome.split(' ')[0]

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [])

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
            <header className="flex items-center justify-between gap-2 border-b border-borda bg-creme px-5 py-4">
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-juncao">📊 Acompanhamento</span>
                <h2 className="fonte-display truncate text-xl font-extrabold text-tinta">{primeiro}</h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarRetro(true)}
                  title="Ver a retrospectiva (jornada do liderado)"
                  className="rounded-full border-2 border-borda px-3 py-1.5 text-sm font-bold text-tinta transition hover:border-juncao hover:text-juncao"
                >
                  ✨ Retrô
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarRelatorio(true)}
                  title="Exportar relatório em PDF"
                  className="rounded-full border-2 border-borda px-3 py-1.5 text-sm font-bold text-tinta transition hover:border-juncao hover:text-juncao"
                >
                  📄 PDF
                </button>
                <button type="button" onClick={() => setAberto(false)} aria-label="Fechar" className="flex h-9 w-9 items-center justify-center rounded-full text-tinta-suave hover:bg-areia-escura">✕</button>
              </div>
            </header>

            {/* Resumo da evolução do PDI */}
            <ResumoPdi colaboradorId={colaboradorId} />

            {/* Abas */}
            <div className="flex gap-1 px-5 pt-4">
              {ABAS.map((a) => (
                <button
                  key={a.tipo}
                  type="button"
                  onClick={() => setAba(a.tipo)}
                  className={[
                    'flex-1 rounded-t-[var(--radius-suave)] px-2 py-2 text-xs font-bold transition',
                    aba === a.tipo ? 'bg-creme text-tinta shadow-[var(--shadow-cartao)]' : 'text-tinta-suave hover:text-tinta',
                  ].join(' ')}
                >
                  <span className="block text-base">{a.emoji}</span>
                  {a.rotulo}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-creme/40 p-5">
              {aba === 'SENTIMENTO' && <SecaoSentimento colaboradorId={colaboradorId} />}
              {aba === 'ENTREGA' && (
                <SecaoRegistro colaboradorId={colaboradorId} tipo="ENTREGA" placeholderTitulo="O que foi entregue?" placeholderDetalhe="Detalhes / impacto (opcional)" />
              )}
              {aba === 'FEEDBACK' && (
                <SecaoRegistro colaboradorId={colaboradorId} tipo="FEEDBACK" placeholderTitulo="Feedback recebido" placeholderDetalhe="De quem veio / contexto (opcional)" />
              )}
              {aba === 'ESTUDO' && (
                <SecaoRegistro colaboradorId={colaboradorId} tipo="ESTUDO" placeholderTitulo="Curso, livro, certificação…" placeholderDetalhe="Link ou anotações (opcional)" />
              )}
            </div>
          </motion.aside>

          {/* Relatório imprimível (Exportar PDF) */}
          {mostrarRelatorio && (
            <RelatorioLiderado colaboradorId={colaboradorId} nome={nome} org={org} aoFechar={() => setMostrarRelatorio(false)} />
          )}

          {/* Retrospectiva (jornada do liderado, estilo year-in-review) */}
          {mostrarRetro && (
            <Retrospectiva colaboradorId={colaboradorId} nome={nome} org={org} aoFechar={() => setMostrarRetro(false)} />
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
