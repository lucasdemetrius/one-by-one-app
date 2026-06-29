// Arquivo: src/componentes/estrutura/MonitorEquipes.tsx
// Descrição: Monitor do time em TELA CHEIA — um quadro Kanban onde cada equipe é
//            uma coluna e cada liderado é um cartão arrastável entre colunas (muda
//            de equipe na hora). Dá ao gestor o máximo de espaço para reorganizar.
//            Renderizado via portal (escapa do header fixo) e fecha no Esc/✕.

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

import { AvatarUsuario } from '@/componentes/marca/AvatarUsuario'
import { useColaboradores, useEquipes, useAtualizarColaborador } from '@/recursos/time/hooks'
import type { Colaborador, Organizacao } from '@/recursos/time/tipos'
import { MoverEquipe } from '@/componentes/estrutura/MoverEquipe'

const ACENTOS = ['var(--color-gestor)', 'var(--color-liderado)', 'var(--color-juncao)', 'var(--color-sucesso)']

// Conteúdo visual de um cartão de liderado (reusado no cartão e no fantasma).
function ConteudoCartao({ c, org }: { c: Colaborador; org?: Organizacao }) {
  return (
    <div
      className={[
        'rounded-[var(--radius-suave)] border border-borda bg-creme p-3 shadow-[var(--shadow-cartao)]',
        // Pisca âmbar enquanto o liderado ativo ainda não foi convidado.
        c.ativo && !c.usuario_id ? 'piscar-alerta' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-2.5">
        <AvatarUsuario fotoUrl={c.foto_url} nome={c.nome} tamanho={38} />
        <div className="min-w-0 flex-1">
          <span className="block truncate font-bold text-tinta">
            {c.nome}
            {!c.ativo && <span className="ml-2 text-xs font-bold uppercase text-alerta">inativo</span>}
          </span>
          <span className="block truncate text-xs text-tinta-suave">{c.email}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Link
          to={`/liderado/${c.id}`}
          onPointerDown={(e) => e.stopPropagation()}
          className="gradiente-marca flex-1 rounded-full py-1 text-center text-xs font-bold text-white"
        >
          Abrir 1:1
        </Link>
        {/* No celular: mover de equipe por seletor (no desktop é arrasto) */}
        {org && <MoverEquipe colaborador={c} org={org} />}
      </div>
    </div>
  )
}

// Cartão arrastável.
function CartaoMonitor({ c, org }: { c: Colaborador; org: Organizacao }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: c.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...attributes}
      {...listeners}
      className={['cursor-grab touch-none select-none active:cursor-grabbing', isDragging ? 'opacity-30' : '', !c.ativo ? 'opacity-60 grayscale' : ''].join(' ')}
    >
      <ConteudoCartao c={c} org={org} />
    </div>
  )
}

// Coluna (equipe) — área de soltar.
function ColunaMonitor({ equipe, indice, liderados, org }: { equipe: { id: string; nome: string; foto_url: string | null }; indice: number; liderados: Colaborador[]; org: Organizacao }) {
  const { setNodeRef, isOver } = useDroppable({ id: equipe.id })
  const acento = ACENTOS[indice % ACENTOS.length]
  const ativos = liderados.filter((c) => c.ativo).length
  return (
    <div
      ref={setNodeRef}
      style={{ borderTopColor: acento, borderTopWidth: 5 }}
      className={[
        'flex w-80 shrink-0 flex-col rounded-[var(--radius-cartao)] border-2 transition-colors',
        isOver ? 'border-juncao bg-juncao/5' : 'border-borda bg-creme/40',
      ].join(' ')}
    >
      <header className="flex items-center gap-3 border-b border-borda p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-suave)]" style={equipe.foto_url ? undefined : { backgroundColor: acento }}>
          {equipe.foto_url ? (
            <img src={equipe.foto_url} alt={equipe.nome} className="h-full w-full object-cover" />
          ) : (
            <span className="fonte-display text-base font-extrabold text-white">{equipe.nome.charAt(0).toUpperCase()}</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="fonte-display truncate text-base font-extrabold text-tinta">{equipe.nome}</h3>
          <span className="text-xs font-semibold text-tinta-suave">
            {liderados.length} {liderados.length === 1 ? 'liderado' : 'liderados'}
            {ativos !== liderados.length && ` · ${ativos} ${ativos === 1 ? 'ativo' : 'ativos'}`}
          </span>
        </div>
      </header>
      <div className="scroll-fino flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {liderados.length === 0 ? (
          <p className="rounded-[var(--radius-suave)] border border-dashed border-borda px-3 py-6 text-center text-xs text-tinta-suave">
            Arraste alguém para esta equipe.
          </p>
        ) : (
          liderados.map((c) => <CartaoMonitor key={c.id} c={c} org={org} />)
        )}
      </div>
    </div>
  )
}

export function MonitorEquipes({ org, aoFechar }: { org: Organizacao; aoFechar: () => void }) {
  const [aberto, setAberto] = useState(true)
  const equipesQ = useEquipes(org.id)
  const colaboradoresQ = useColaboradores(org.id)
  const mover = useAtualizarColaborador(org.id)

  const equipes = equipesQ.data ?? []
  const colaboradores = useMemo(() => colaboradoresQ.data ?? [], [colaboradoresQ.data])
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const [arrastando, setArrastando] = useState<Colaborador | null>(null)

  const porEquipe = useMemo(() => {
    const m: Record<string, Colaborador[]> = {}
    for (const c of colaboradores) (m[c.equipe_id] ??= []).push(c)
    return m
  }, [colaboradores])

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [])

  function aoIniciar(e: DragStartEvent) {
    setArrastando(colaboradores.find((c) => c.id === e.active.id) ?? null)
  }
  function aoSoltar(e: DragEndEvent) {
    setArrastando(null)
    const over = e.over?.id
    if (!over) return
    const c = colaboradores.find((x) => x.id === e.active.id)
    if (c && c.equipe_id !== String(over)) {
      mover.mutate({ id: c.id, dados: { equipe_id: String(over) } })
    }
  }

  const ativos = colaboradores.filter((c) => c.ativo).length

  return createPortal(
    <AnimatePresence onExitComplete={aoFechar}>
      {aberto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="textura-papel fixed inset-0 z-[70] flex flex-col bg-areia"
        >
          {/* Barra superior do monitor */}
          <header className="flex items-center justify-between gap-2 border-b border-borda bg-creme/80 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-2xl">🖥️</span>
              <div className="min-w-0">
                <h2 className="fonte-display text-xl font-extrabold text-tinta">Monitor do time</h2>
                <span className="block truncate text-xs font-semibold text-tinta-suave">
                  {org.nome} · {equipes.length} {equipes.length === 1 ? 'equipe' : 'equipes'} · {ativos}{' '}
                  {ativos === 1 ? 'ativo' : 'ativos'} · arraste para trocar de equipe
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Sair do monitor"
              className="shrink-0 rounded-full border-2 border-borda px-4 py-1.5 text-sm font-bold text-tinta transition hover:border-tinta"
            >
              ✕<span className="hidden sm:inline"> Sair do monitor</span>
            </button>
          </header>

          {/* Quadro Kanban */}
          <DndContext sensors={sensores} onDragStart={aoIniciar} onDragEnd={aoSoltar}>
            <div className="scroll-fino flex flex-1 gap-3 overflow-x-auto p-4 sm:gap-4 sm:p-6">
              {equipesQ.isLoading ? (
                <p className="m-auto text-tinta-suave">Carregando o time…</p>
              ) : equipes.length === 0 ? (
                <p className="m-auto text-tinta-suave">Crie equipes no painel para usar o monitor.</p>
              ) : (
                equipes.map((equipe, i) => (
                  <ColunaMonitor key={equipe.id} equipe={equipe} indice={i} liderados={porEquipe[equipe.id] ?? []} org={org} />
                ))
              )}
            </div>
            <DragOverlay>
              {arrastando ? (
                <div className="w-72 rotate-2">
                  <ConteudoCartao c={arrastando} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
