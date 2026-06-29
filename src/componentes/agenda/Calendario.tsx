// Arquivo: src/componentes/agenda/Calendario.tsx
// Descrição: Calendário mensal estilo Google Calendar. Mostra os 1:1 como chips
//            nos dias; clicar num dia cria, clicar num chip abre, e arrastar um
//            chip para outro dia reagenda (mantendo o horário). Reutilizável na
//            Agenda e no Painel.

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

// Evento genérico do calendário (a Agenda mapeia o agendamento para isto).
export interface EventoCal {
  id: string
  // agendamentoId é o id do agendamento REAL por trás do evento. Na série recorrente, a
  // âncora tem id === agendamentoId; as projeções têm id próprio (para React/drag) mas
  // apontam para o mesmo agendamentoId — é ele que as ações (abrir/cancelar/reagendar) usam.
  agendamentoId?: string
  dataHora: string // "YYYY-MM-DDTHH:MM"
  titulo: string
  colaboradorId?: string
  recorrente?: boolean
  // projecao=true marca uma ocorrência FUTURA projetada (não arrasta; visual "fantasma").
  projecao?: boolean
}

interface CalendarioProps {
  eventos: EventoCal[]
  aoSelecionarDia?: (dataISO: string) => void // "YYYY-MM-DD"
  aoAbrirEvento?: (ev: EventoCal) => void
  aoReagendar?: (id: string, novaDataISO: string) => void // mantém o horário
}

const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// "YYYY-MM-DD" de uma Date (no horário local, sem pulo de fuso).
function iso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

// Parte da data ("YYYY-MM-DD") e hora ("HH:MM") de um dataHora.
function parteData(dataHora: string): string {
  return dataHora.slice(0, 10)
}
function parteHora(dataHora: string): string {
  return dataHora.slice(11, 16) || '09:00'
}

// Conteúdo visual do chip (reusado no chip real e no fantasma do DragOverlay).
function ConteudoEvento({ ev }: { ev: EventoCal }) {
  return (
    <>
      <span className="opacity-90">{parteHora(ev.dataHora)}</span>
      <span className="truncate">{ev.titulo}</span>
      {ev.recorrente && <span role="img" aria-label="Recorrente" title="Recorrente">🔁</span>}
    </>
  )
}

// Classe base do chip — a MESMA no chip e no fantasma (sensação consistente).
const CLASSE_CHIP =
  'gradiente-marca flex w-full items-center gap-1 truncate rounded-md px-1.5 py-1 text-left text-[0.68rem] font-bold text-white'

// Chip arrastável de um 1:1.
function ChipEvento({ ev, aoAbrir }: { ev: EventoCal; aoAbrir?: (e: EventoCal) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: ev.id })
  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      // NÃO sobrescrever onPointerDown (o dnd-kit usa ele para arrastar). O
      // clique sem mover (<6px) abre o detalhe; stopPropagation evita criar no dia.
      onClick={(e) => {
        e.stopPropagation()
        aoAbrir?.(ev)
      }}
      className={[CLASSE_CHIP, 'cursor-grab touch-none active:cursor-grabbing', isDragging ? 'opacity-30' : ''].join(' ')}
      title={`${parteHora(ev.dataHora)} · ${ev.titulo}`}
    >
      <ConteudoEvento ev={ev} />
    </button>
  )
}

// Chip de uma ocorrência PROJETADA (futura) de uma recorrência: não arrasta (só a âncora
// arrasta), visual mais leve/"fantasma", mas continua clicável para abrir o detalhe da série.
function ChipProjecao({ ev, aoAbrir }: { ev: EventoCal; aoAbrir?: (e: EventoCal) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        aoAbrir?.(ev)
      }}
      className={[CLASSE_CHIP, 'cursor-pointer opacity-45 ring-1 ring-inset ring-white/30'].join(' ')}
      title={`${parteHora(ev.dataHora)} · ${ev.titulo} · recorrente (projeção)`}
    >
      <ConteudoEvento ev={ev} />
    </button>
  )
}

// Célula de um dia (área de soltar).
function DiaCelula({
  data,
  doMes,
  hoje,
  passado,
  eventos,
  aoSelecionarDia,
  aoAbrirEvento,
}: {
  data: Date
  doMes: boolean
  hoje: boolean
  passado: boolean
  eventos: EventoCal[]
  aoSelecionarDia?: (dataISO: string) => void
  aoAbrirEvento?: (e: EventoCal) => void
}) {
  const dataISO = iso(data)
  // Dias passados não recebem soltar nem criação (só hoje/futuro).
  const { setNodeRef, isOver } = useDroppable({ id: dataISO, disabled: passado })
  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={passado ? -1 : 0}
      aria-disabled={passado}
      aria-label={passado ? `${data.getDate()} — data passada` : `Marcar 1:1 em ${dataISO}`}
      onClick={() => !passado && aoSelecionarDia?.(dataISO)}
      onKeyDown={(e) => {
        if (!passado && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          aoSelecionarDia?.(dataISO)
        }
      }}
      title={passado ? 'Data passada — não é possível agendar' : undefined}
      className={[
        'flex min-h-16 flex-col gap-1 rounded-[var(--radius-suave)] border p-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-juncao sm:min-h-24 sm:p-1.5',
        passado ? 'cursor-not-allowed bg-areia/30 opacity-50' : 'cursor-pointer',
        doMes && !passado ? 'bg-creme' : !passado ? 'bg-areia/40' : '',
        isOver ? 'border-juncao ring-2 ring-juncao' : 'border-borda',
      ].join(' ')}
    >
      <span
        className={[
          'mb-0.5 flex h-5 w-5 items-center justify-center self-end rounded-full text-xs font-bold sm:h-6 sm:w-6',
          hoje ? 'gradiente-marca text-white' : doMes ? 'text-tinta' : 'text-tinta-suave/50',
        ].join(' ')}
      >
        {data.getDate()}
      </span>
      <div className="flex flex-col gap-1">
        {eventos.map((ev) =>
          ev.projecao ? (
            <ChipProjecao key={ev.id} ev={ev} aoAbrir={aoAbrirEvento} />
          ) : (
            <ChipEvento key={ev.id} ev={ev} aoAbrir={aoAbrirEvento} />
          ),
        )}
      </div>
    </div>
  )
}

export function Calendario({ eventos, aoSelecionarDia, aoAbrirEvento, aoReagendar }: CalendarioProps) {
  // Primeiro dia do mês visível.
  const [mesVisivel, setMesVisivel] = useState(() => {
    const agora = new Date()
    return new Date(agora.getFullYear(), agora.getMonth(), 1)
  })
  const [arrastando, setArrastando] = useState<EventoCal | null>(null)

  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const hojeISO = iso(new Date())

  // Agrupa eventos por dia ("YYYY-MM-DD").
  const porDia = useMemo(() => {
    const m: Record<string, EventoCal[]> = {}
    for (const ev of eventos) {
      ;(m[parteData(ev.dataHora)] ??= []).push(ev)
    }
    for (const k of Object.keys(m)) m[k].sort((a, b) => a.dataHora.localeCompare(b.dataHora))
    return m
  }, [eventos])

  // Monta a grade: começa no domingo da semana do dia 1, 6 semanas (42 células).
  const dias = useMemo(() => {
    const inicio = new Date(mesVisivel)
    inicio.setDate(1 - mesVisivel.getDay()) // recua até domingo
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(inicio)
      d.setDate(inicio.getDate() + i)
      return d
    })
  }, [mesVisivel])

  function mudarMes(delta: number) {
    setMesVisivel((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))
  }

  function aoSoltar(e: DragEndEvent) {
    setArrastando(null)
    const over = e.over?.id
    if (!over) return
    const ev = eventos.find((x) => x.id === e.active.id)
    const novaData = String(over)
    // Só hoje ou futuro — não dá pra reagendar para o passado.
    if (novaData < hojeISO) return
    if (ev && parteData(ev.dataHora) !== novaData) {
      // Mantém o horário; troca só o dia. Usa o id do agendamento REAL (âncora da série).
      aoReagendar?.(ev.agendamentoId ?? ev.id, novaData)
    }
  }

  const rotuloMes = mesVisivel.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Cabeçalho do mês */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="fonte-display text-xl font-extrabold capitalize text-tinta">{rotuloMes}</h3>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => mudarMes(-1)} aria-label="Mês anterior" className="flex h-8 w-8 items-center justify-center rounded-full border border-borda text-tinta hover:border-juncao">‹</button>
          <button type="button" onClick={() => setMesVisivel(() => { const a = new Date(); return new Date(a.getFullYear(), a.getMonth(), 1) })} className="rounded-full border border-borda px-3 py-1 text-xs font-bold text-tinta hover:border-juncao">Hoje</button>
          <button type="button" onClick={() => mudarMes(1)} aria-label="Próximo mês" className="flex h-8 w-8 items-center justify-center rounded-full border border-borda text-tinta hover:border-juncao">›</button>
        </div>
      </div>

      {/* Cabeçalho dos dias da semana (inicial no celular, sigla no desktop) */}
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-wider text-tinta-suave sm:gap-1.5">
        {SEMANA.map((d) => (
          <span key={d}>
            <span className="sm:hidden">{d.charAt(0)}</span>
            <span className="hidden sm:inline">{d}</span>
          </span>
        ))}
      </div>

      <DndContext
        sensors={sensores}
        onDragStart={(e: DragStartEvent) => setArrastando(eventos.find((x) => x.id === e.active.id) ?? null)}
        onDragEnd={aoSoltar}
      >
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {dias.map((d) => (
            <DiaCelula
              key={iso(d)}
              data={d}
              doMes={d.getMonth() === mesVisivel.getMonth()}
              hoje={iso(d) === hojeISO}
              passado={iso(d) < hojeISO}
              eventos={porDia[iso(d)] ?? []}
              aoSelecionarDia={aoSelecionarDia}
              aoAbrirEvento={aoAbrirEvento}
            />
          ))}
        </div>

        {/* Fantasma do chip: o MESMO visual do chip real, com largura fixa e
            leve rotação — igual ao Tabuleiro/Estrutura (sensação de "levantar"). */}
        <DragOverlay>
          {arrastando ? (
            <div className="w-36">
              <div className={[CLASSE_CHIP, 'rotate-2 shadow-[var(--shadow-flutuante)]'].join(' ')}>
                <ConteudoEvento ev={arrastando} />
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
