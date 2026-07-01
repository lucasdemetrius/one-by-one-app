// Arquivo: src/componentes/matrix/MatrixNineBox.tsx
// Descrição: A Matrix9-Box (desempenho × potencial) como componente reutilizável —
//            usada na página dedicada (/matrix9-box) e embutida no painel inicial.
//            Arraste com destaque do alvo + desfoque dos demais, reposicionamento
//            otimista (sem snap-back) com transição, filtro por equipe e export PDF.

import { useMemo, useState } from 'react'
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
import { LayoutGroup, motion } from 'framer-motion'

import { AvatarUsuario } from '@/componentes/marca/AvatarUsuario'
import { useColaboradores, useEquipes } from '@/recursos/time/hooks'
import { useClassificacoes, useDefinirClassificacao, useRemoverClassificacao } from '@/recursos/classificacao/classificacaoApi'
import type { Nivel } from '@/recursos/classificacao/classificacaoApi'
import type { Colaborador, Organizacao } from '@/recursos/time/tipos'

const NIVEIS: Nivel[] = ['BAIXO', 'MEDIO', 'ALTO']
const POTENCIAIS: Nivel[] = ['ALTO', 'MEDIO', 'BAIXO']
const idxNivel: Record<Nivel, number> = { BAIXO: 0, MEDIO: 1, ALTO: 2 }

const ROTULOS: Record<string, string> = {
  'ALTO-ALTO': '⭐ Estrela',
  'MEDIO-ALTO': 'Forte potencial',
  'BAIXO-ALTO': 'Enigma',
  'ALTO-MEDIO': 'Alto desempenho',
  'MEDIO-MEDIO': 'Mantenedor',
  'BAIXO-MEDIO': 'Em desenvolvimento',
  'ALTO-BAIXO': 'Especialista',
  'MEDIO-BAIXO': 'Eficaz',
  'BAIXO-BAIXO': '⚠️ Atenção',
}

// Cor da zona derivada dos TOKENS do tema (acompanha claro/escuro/etc.): de
// sucesso (canto destaque) passando por juncao (neutro) até alerta (atenção).
function corZona(desempenho: Nivel, potencial: Nivel): string {
  const score = idxNivel[desempenho] + idxNivel[potencial] // 0..4
  if (score >= 4) return 'color-mix(in srgb, var(--color-sucesso) 18%, transparent)'
  if (score === 3) return 'color-mix(in srgb, var(--color-sucesso) 10%, transparent)'
  if (score === 2) return 'color-mix(in srgb, var(--color-juncao) 8%, transparent)'
  if (score === 1) return 'color-mix(in srgb, var(--color-alerta) 9%, transparent)'
  return 'color-mix(in srgb, var(--color-alerta) 16%, transparent)'
}

const nomeNivel: Record<Nivel, string> = { BAIXO: 'Baixo', MEDIO: 'Médio', ALTO: 'Alto' }

function FichaVisual({ colaborador, fantasma = false }: { colaborador: Colaborador; fantasma?: boolean }) {
  return (
    <div
      className={[
        'flex items-center gap-2 rounded-full border border-borda bg-creme py-1 pl-1 pr-3 shadow-[var(--shadow-cartao)]',
        fantasma ? 'rotate-3 scale-105 shadow-[var(--shadow-flutuante)]' : '',
      ].join(' ')}
    >
      <AvatarUsuario fotoUrl={colaborador.foto_url} nome={colaborador.nome} tamanho={26} />
      <span className="max-w-16 truncate text-xs font-bold text-tinta sm:max-w-28">{colaborador.nome.split(' ')[0]}</span>
    </div>
  )
}

// No celular: botão 📍 que abre um seletor 3×3 (espelha a matriz) para posicionar
// o liderado tocando o quadrante — no desktop é arrasto. sm:hidden.
function MoverNoveBox({
  colaboradorId,
  aoPosicionar,
  aoRemover,
  desempenho,
  potencial,
}: {
  colaboradorId: string
  aoPosicionar: (id: string, desempenho: Nivel, potencial: Nivel) => void
  aoRemover?: (id: string) => void
  desempenho?: Nivel
  potencial?: Nivel
}) {
  const [aberto, setAberto] = useState(false)
  return (
    <span className="relative sm:hidden">
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setAberto((v) => !v)}
        aria-label="Posicionar no 9-box"
        title="Posicionar no 9-box"
        className="flex h-6 w-6 items-center justify-center rounded-full border border-borda bg-creme text-xs text-tinta-suave"
      >
        📍
      </button>
      {aberto && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute bottom-full right-0 z-20 mb-1 rounded-[var(--radius-suave)] border-2 border-borda bg-creme p-1.5 shadow-[var(--shadow-flutuante)]"
        >
          <div className="grid grid-cols-3 gap-1">
            {POTENCIAIS.map((pot) =>
              NIVEIS.map((des) => {
                const sel = des === desempenho && pot === potencial
                return (
                  <button
                    key={`${des}-${pot}`}
                    type="button"
                    onClick={() => {
                      aoPosicionar(colaboradorId, des, pot)
                      setAberto(false)
                    }}
                    title={ROTULOS[`${des}-${pot}`]}
                    style={{ backgroundColor: corZona(des, pot) }}
                    className={['h-8 w-8 rounded text-[0.6rem]', sel ? 'ring-2 ring-juncao' : 'border border-borda'].join(' ')}
                  >
                    {sel ? '●' : ''}
                  </button>
                )
              }),
            )}
          </div>
          <p className="mt-1 text-center text-[0.6rem] font-bold uppercase tracking-wider text-tinta-suave">desempenho →</p>
          {aoRemover && (
            <button
              type="button"
              onClick={() => {
                aoRemover(colaboradorId)
                setAberto(false)
              }}
              className="mt-1.5 w-full rounded border border-borda py-1 text-[0.6rem] font-bold uppercase tracking-wider text-tinta-suave hover:border-alerta hover:text-alerta"
            >
              Tirar da matriz
            </button>
          )}
        </div>
      )}
    </span>
  )
}

function Ficha({
  colaborador,
  aoPosicionar,
  aoRemover,
  desempenho,
  potencial,
}: {
  colaborador: Colaborador
  aoPosicionar: (id: string, desempenho: Nivel, potencial: Nivel) => void
  aoRemover?: (id: string) => void
  desempenho?: Nivel
  potencial?: Nivel
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: colaborador.id })
  return (
    <span className="group relative inline-flex items-center gap-1">
      <motion.div
        ref={setNodeRef}
        layout
        layoutId={colaborador.id}
        transition={{ type: 'spring', stiffness: 500, damping: 34 }}
        {...attributes}
        {...listeners}
        className={['cursor-grab touch-none select-none active:cursor-grabbing', isDragging ? 'opacity-30' : ''].join(' ')}
      >
        <FichaVisual colaborador={colaborador} />
      </motion.div>
      {/* Remover (desktop): ✕ no canto, aparece ao passar o mouse. No mobile fica
          escondido (não há hover) — lá o "Tirar da matriz" vive no seletor 📍. */}
      {aoRemover && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => aoRemover(colaborador.id)}
          aria-label="Tirar da matriz"
          title="Tirar da matriz"
          className="absolute -right-1 -top-1 z-10 hidden h-5 w-5 items-center justify-center rounded-full border border-borda bg-creme text-[0.6rem] text-tinta-suave shadow-[var(--shadow-cartao)] hover:border-alerta hover:text-alerta group-hover:flex"
        >
          ✕
        </button>
      )}
      <MoverNoveBox colaboradorId={colaborador.id} aoPosicionar={aoPosicionar} aoRemover={aoRemover} desempenho={desempenho} potencial={potencial} />
    </span>
  )
}

function Celula({
  desempenho,
  potencial,
  fichas,
  arrastando,
  aoPosicionar,
  aoRemover,
}: {
  desempenho: Nivel
  potencial: Nivel
  fichas: Colaborador[]
  arrastando: boolean
  aoPosicionar: (id: string, desempenho: Nivel, potencial: Nivel) => void
  aoRemover: (id: string) => void
}) {
  const id = `${desempenho}-${potencial}`
  const { setNodeRef, isOver } = useDroppable({ id })
  const alvo = arrastando && isOver
  const apagado = arrastando && !isOver
  return (
    <div
      ref={setNodeRef}
      style={{ backgroundColor: corZona(desempenho, potencial) }}
      className={[
        'relative flex min-h-24 flex-col gap-2 overflow-hidden rounded-[var(--radius-cartao)] border-2 p-1.5 transition-all duration-150 sm:min-h-32 sm:p-3',
        // FORA do arraste: o quadrante CRESCE e se destaca ao passar o mouse por cima
        // (sem precisar arrastar ninguém). É o efeito que o usuário pediu.
        !arrastando ? 'hover:z-10 hover:scale-[1.04] hover:border-juncao' : '',
        // DURANTE o arraste: o alvo ganha só um destaque ESTÁTICO (borda + anel) — NÃO
        // cresce nem "mexe"; os demais quadrantes ficam desfocados para o foco ir pro alvo.
        alvo ? 'z-10 border-juncao ring-2 ring-juncao' : 'border-transparent',
        apagado ? 'opacity-30 blur-[3px]' : 'opacity-100',
      ].join(' ')}
    >
      {alvo && <div aria-hidden className="quadriculado pointer-events-none absolute inset-0" />}
      <span className="relative text-xs font-bold uppercase tracking-wider text-tinta-suave">{ROTULOS[id]}</span>
      <div className="relative flex flex-wrap content-start gap-1.5">
        {fichas.map((c) => (
          <Ficha key={c.id} colaborador={c} aoPosicionar={aoPosicionar} aoRemover={aoRemover} desempenho={desempenho} potencial={potencial} />
        ))}
      </div>
    </div>
  )
}

function Bandeja({
  fichas,
  arrastando,
  aoPosicionar,
}: {
  fichas: Colaborador[]
  arrastando: boolean
  aoPosicionar: (id: string, desempenho: Nivel, potencial: Nivel) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'bandeja' })
  const alvo = arrastando && isOver
  return (
    <div
      ref={setNodeRef}
      className={[
        'nao-imprimir relative mb-6 overflow-hidden rounded-[var(--radius-cartao)] border-2 border-dashed p-4 transition-colors',
        alvo ? 'border-juncao bg-creme/60' : 'border-borda bg-creme/40',
      ].join(' ')}
    >
      {alvo && <div aria-hidden className="quadriculado pointer-events-none absolute inset-0" />}
      <span className="relative mb-2 block text-xs font-bold uppercase tracking-wider text-tinta-suave">
        A classificar — arraste para a matriz {arrastando ? '· ou solte aqui para tirar' : ''}
      </span>
      {fichas.length === 0 ? (
        <p className="relative text-sm text-tinta-suave">Todos os liderados já estão posicionados. 🎉</p>
      ) : (
        <div className="relative flex flex-wrap gap-2">
          {fichas.map((c) => (
            <Ficha key={c.id} colaborador={c} aoPosicionar={aoPosicionar} />
          ))}
        </div>
      )}
    </div>
  )
}

// Matriz completa (toolbar + bandeja + grade), parametrizada pela organização.
export function MatrixNineBox({ org }: { org: Organizacao }) {
  const equipesQ = useEquipes(org.id)
  const colaboradoresQ = useColaboradores(org.id)
  const classificacoesQ = useClassificacoes(org.id)
  const definir = useDefinirClassificacao(org.id)
  const remover = useRemoverClassificacao(org.id)

  const [arrastando, setArrastando] = useState<Colaborador | null>(null)
  const [posicaoLocal, setPosicaoLocal] = useState<Record<string, { desempenho: Nivel; potencial: Nivel }>>({})
  // Ids removidos localmente: enquanto o servidor não confirma, sobrepõem o
  // mapaClass (senão a ficha voltaria a aparecer no quadrante até o refetch).
  const [removidoLocal, setRemovidoLocal] = useState<Set<string>>(new Set())
  const [equipeFiltro, setEquipeFiltro] = useState('')

  const equipes = equipesQ.data ?? []
  const colaboradores = useMemo(() => {
    const todos = colaboradoresQ.data ?? []
    return equipeFiltro ? todos.filter((c) => c.equipe_id === equipeFiltro) : todos
  }, [colaboradoresQ.data, equipeFiltro])
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const mapaClass = useMemo(() => {
    const m: Record<string, { desempenho: Nivel; potencial: Nivel }> = {}
    for (const c of classificacoesQ.data ?? []) m[c.colaborador_id] = { desempenho: c.desempenho, potencial: c.potencial }
    return m
  }, [classificacoesQ.data])

  const { porCelula, naoClassificados } = useMemo(() => {
    const porCelula: Record<string, Colaborador[]> = {}
    const naoClassificados: Colaborador[] = []
    for (const c of colaboradores) {
      const cl = removidoLocal.has(c.id) ? undefined : (posicaoLocal[c.id] ?? mapaClass[c.id])
      if (cl) (porCelula[`${cl.desempenho}-${cl.potencial}`] ??= []).push(c)
      else naoClassificados.push(c)
    }
    return { porCelula, naoClassificados }
  }, [colaboradores, mapaClass, posicaoLocal, removidoLocal])

  // Posiciona o liderado no 9-box de forma OTIMISTA (move já) e persiste. Usado
  // tanto pelo arraste (desktop) quanto pelo seletor 📍 (mobile).
  function posicionar(id: string, desempenho: Nivel, potencial: Nivel) {
    // Se o liderado tinha sido tirado da matriz, desfaz a remoção local.
    setRemovidoLocal((s) => {
      if (!s.has(id)) return s
      const n = new Set(s)
      n.delete(id)
      return n
    })
    setPosicaoLocal((p) => ({ ...p, [id]: { desempenho, potencial } }))
    definir.mutate({ colaboradorId: id, desempenho, potencial })
  }

  // Tira o liderado da matriz (volta para "A classificar"), também OTIMISTA.
  function removerDaMatriz(id: string) {
    setPosicaoLocal((p) => {
      if (!(id in p)) return p
      const { [id]: _descartado, ...resto } = p
      return resto
    })
    setRemovidoLocal((s) => new Set(s).add(id))
    remover.mutate(id)
  }

  function aoIniciar(e: DragStartEvent) {
    setArrastando(colaboradores.find((c) => c.id === e.active.id) ?? null)
  }
  function aoFinalizar(e: DragEndEvent) {
    setArrastando(null)
    const over = e.over?.id
    if (!over) return
    const id = String(e.active.id)
    // Soltar de volta na bandeja "A classificar" = tirar da matriz.
    if (over === 'bandeja') {
      removerDaMatriz(id)
      return
    }
    const [desempenho, potencial] = String(over).split('-') as [Nivel, Nivel]
    posicionar(id, desempenho, potencial)
  }

  const destaques = (porCelula['ALTO-ALTO'] ?? []).length
  const riscos = (porCelula['BAIXO-BAIXO'] ?? []).length
  const arrastandoAtivo = arrastando != null

  if (colaboradoresQ.isLoading || classificacoesQ.isLoading) {
    return <p className="text-tinta-suave">Carregando o time…</p>
  }

  return (
    <div>
      {/* Toolbar: badges + filtro de equipe + export */}
      <div className="nao-imprimir mb-4 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-sucesso/15 px-3 py-1 text-sm font-bold text-sucesso">⭐ {destaques} destaque(s)</span>
        <span className="rounded-full bg-alerta/10 px-3 py-1 text-sm font-bold text-alerta">⚠️ {riscos} em atenção</span>
        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
          {equipes.length > 0 && (
            <select
              value={equipeFiltro}
              onChange={(e) => setEquipeFiltro(e.target.value)}
              className="flex-1 rounded-full border-2 border-borda bg-creme px-4 py-2 text-sm font-bold text-tinta outline-none focus:border-juncao sm:flex-none sm:py-1.5"
              title="Filtrar por equipe"
            >
              <option value="">Todas as equipes</option>
              {equipes.map((e) => (
                <option key={e.id} value={e.id}>{e.nome}</option>
              ))}
            </select>
          )}
          <button type="button" onClick={() => window.print()} className="rounded-full border-2 border-borda px-4 py-1.5 text-sm font-bold text-tinta transition hover:border-juncao hover:text-juncao">
            ⬇ Exportar PDF
          </button>
        </div>
      </div>

      <DndContext sensors={sensores} onDragStart={aoIniciar} onDragEnd={aoFinalizar}>
        <LayoutGroup>
          <Bandeja fichas={naoClassificados} arrastando={arrastandoAtivo} aoPosicionar={posicionar} />

          <div className="area-impressao">
            <div className="titulo-impressao">
              <h2 className="fonte-display text-2xl font-extrabold text-tinta">Matrix9-Box — {org.nome}</h2>
            </div>
            <div className="flex gap-1.5 sm:gap-3">
              <div className="flex w-6 flex-col items-center justify-around">
                <span className="rotate-180 text-xs font-bold uppercase tracking-wider text-tinta-suave [writing-mode:vertical-rl]">Potencial →</span>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                  {POTENCIAIS.map((pot) =>
                    NIVEIS.map((des) => (
                      <Celula key={`${des}-${pot}`} desempenho={des} potencial={pot} fichas={porCelula[`${des}-${pot}`] ?? []} arrastando={arrastandoAtivo} aoPosicionar={posicionar} aoRemover={removerDaMatriz} />
                    )),
                  )}
                </div>
                <div className="mt-2 grid grid-cols-3 text-center text-xs font-bold uppercase tracking-wider text-tinta-suave">
                  {NIVEIS.map((n) => (
                    <span key={n}>{nomeNivel[n]}</span>
                  ))}
                </div>
                <p className="mt-1 text-center text-xs font-bold uppercase tracking-wider text-tinta-suave">Desempenho →</p>
              </div>
            </div>
          </div>

          <DragOverlay>{arrastando ? <FichaVisual colaborador={arrastando} fantasma /> : null}</DragOverlay>
        </LayoutGroup>
      </DndContext>
    </div>
  )
}
