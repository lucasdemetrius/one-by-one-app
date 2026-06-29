// Arquivo: src/paginas/PaginaAgenda.tsx
// Descrição: Agenda de 1:1 estilo Google Calendar. Calendário mensal com os 1:1
//            como chips; clicar num dia abre o modal de novo 1:1 (com recorrência),
//            clicar num chip abre o detalhe (abrir o 1:1 / cancelar), e arrastar um
//            chip para outro dia reagenda. Lembretes por e-mail (quando o SMTP ligar).

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { LayoutApp } from './LayoutApp'
import { Ajuda } from '@/componentes/ui/Ajuda'
import { BotaoDuo } from '@/componentes/ui/BotaoDuo'
import { Modal } from '@/componentes/ui/Modal'
import { useConfirmar } from '@/componentes/ui/Confirmacao'
import { Calendario } from '@/componentes/agenda/Calendario'
import type { EventoCal } from '@/componentes/agenda/Calendario'
import { extrairMensagemErro } from '@/lib/api'
import { useColaboradores, useOrganizacoes } from '@/recursos/time/hooks'
import {
  useAgendamentos,
  useCancelarTodosDoColaborador,
  useCriarAgendamento,
  useDeletarAgendamento,
  useReagendarAgendamento,
  MESES_RECORRENCIA,
} from '@/recursos/agenda/agendaApi'
import type { Agendamento, Recorrencia } from '@/recursos/agenda/agendaApi'
import { expandirAgendamentos } from '@/componentes/agenda/ocorrencias'

const RECORRENCIAS: { valor: Recorrencia; rotulo: string }[] = [
  { valor: 'NENHUMA', rotulo: 'Não repete (só uma vez)' },
  { valor: 'SEMANAL', rotulo: 'Toda semana' },
  { valor: 'QUINZENAL', rotulo: 'A cada 15 dias' },
  { valor: 'MENSAL', rotulo: 'Todo mês' },
  { valor: 'BIMESTRAL', rotulo: 'A cada 2 meses' },
  { valor: 'TRIMESTRAL', rotulo: 'A cada 3 meses' },
  { valor: 'SEMESTRAL', rotulo: 'A cada 6 meses' },
]

const rotuloRec: Record<Recorrencia, string> = {
  NENHUMA: 'Único',
  SEMANAL: 'Semanal',
  QUINZENAL: 'Quinzenal',
  MENSAL: 'Mensal',
  BIMESTRAL: 'A cada 2 meses',
  TRIMESTRAL: 'A cada 3 meses',
  SEMESTRAL: 'A cada 6 meses',
}

// "YYYY-MM-DD" → "DD/MM/YYYY"
function dataBR(iso: string): string {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

// Calcula a data ("YYYY-MM-DD") da N-ésima ocorrência a partir do dia de início — usado
// para converter "repetir N vezes" em "repete até [data]".
function dataAposVezes(inicioISO: string, rec: Recorrencia, vezes: number): string {
  const [y, m, d] = inicioISO.split('-').map(Number)
  const base = new Date(y, m - 1, d)
  const n = Math.max(1, vezes) - 1
  const meses = MESES_RECORRENCIA[rec]
  if (meses) base.setMonth(base.getMonth() + meses * n)
  else base.setDate(base.getDate() + (rec === 'QUINZENAL' ? 14 : 7) * n)
  const p = (x: number) => String(x).padStart(2, '0')
  return `${base.getFullYear()}-${p(base.getMonth() + 1)}-${p(base.getDate())}`
}

const campo =
  'w-full rounded-[var(--radius-suave)] border-2 border-borda bg-creme px-3.5 py-2.5 text-sm text-tinta outline-none focus:border-juncao'

export function PaginaAgenda() {
  const orgsQ = useOrganizacoes()
  const org = orgsQ.data?.[0]
  const colaboradoresQ = useColaboradores(org?.id)
  const agendamentosQ = useAgendamentos()
  const criar = useCriarAgendamento()
  const deletar = useDeletarAgendamento()
  const cancelarTodos = useCancelarTodosDoColaborador()
  const reagendar = useReagendarAgendamento()
  const confirmar = useConfirmar()
  const navegar = useNavigate()

  // Só liderados ativos podem ser agendados.
  const liderados = useMemo(
    () => (colaboradoresQ.data ?? []).filter((c) => c.ativo),
    [colaboradoresQ.data],
  )
  const agendamentos = agendamentosQ.data ?? []

  // Dia selecionado para criar (modal aberto quando != null) e evento em detalhe.
  const [criarEm, setCriarEm] = useState<string | null>(null)
  const [detalhe, setDetalhe] = useState<Agendamento | null>(null)

  // Campos do modal de criação.
  const [colaboradorId, setColaboradorId] = useState('')
  const [hora, setHora] = useState('09:00')
  const [recorrencia, setRecorrencia] = useState<Recorrencia>('MENSAL')
  // "Termina": fim da recorrência (estilo Google Agenda).
  const [fimTipo, setFimTipo] = useState<'NUNCA' | 'DATA' | 'VEZES'>('NUNCA')
  const [fimData, setFimData] = useState('')
  const [fimVezes, setFimVezes] = useState(12)
  const [erro, setErro] = useState('')

  // Mapeia agendamentos → eventos do calendário, JÁ PROJETANDO as recorrências (toda
  // semana/quinzena/mês aparecem nas próximas datas, não só uma vez).
  const eventos: EventoCal[] = useMemo(() => expandirAgendamentos(agendamentos), [agendamentos])

  function abrirCriacao(dataISO: string) {
    setErro('')
    setColaboradorId(liderados[0]?.id ?? '')
    setHora('09:00')
    setRecorrencia('MENSAL')
    setFimTipo('NUNCA')
    setFimData('')
    setFimVezes(12)
    setCriarEm(dataISO)
  }

  async function agendar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    const alvo = colaboradorId || liderados[0]?.id
    if (!alvo) {
      setErro('Adicione um liderado ativo primeiro.')
      return
    }
    try {
      // "Termina" → repete_ate ("YYYY-MM-DD"); só para recorrentes. "N vezes" vira data.
      let repete_ate: string | undefined
      if (recorrencia !== 'NENHUMA' && criarEm) {
        if (fimTipo === 'DATA' && fimData) repete_ate = fimData
        else if (fimTipo === 'VEZES') repete_ate = dataAposVezes(criarEm, recorrencia, fimVezes)
      }
      await criar.mutateAsync({
        colaborador_id: alvo,
        data_hora: `${criarEm}T${hora}`,
        recorrencia,
        repete_ate,
      })
      setCriarEm(null)
    } catch (err) {
      setErro(extrairMensagemErro(err))
    }
  }

  function aoReagendar(id: string, novaDataISO: string) {
    const a = agendamentos.find((x) => x.id === id)
    if (!a) return
    const horaAtual = a.data_hora.slice(11, 16) || '09:00'
    reagendar.mutate({ id, data_hora: `${novaDataISO}T${horaAtual}` })
  }

  return (
    <LayoutApp>
      <div className="mb-6">
        <span className="text-sm font-bold uppercase tracking-wider text-juncao">Agenda</span>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="fonte-display text-2xl font-extrabold text-tinta sm:text-3xl">Seus 1:1</h1>
          <Ajuda titulo="Como funciona a Agenda">
            Clique em um <strong className="text-tinta">dia</strong> para marcar um 1:1 (com
            recorrência), <strong className="text-tinta">arraste</strong> um 1:1 para outro dia para
            remarcar, e clique num 1:1 para abrir ou cancelar. O sistema avança as reuniões
            recorrentes e manda lembrete por e-mail 1 dia antes e no dia.
          </Ajuda>
        </div>
      </div>

      {!org ? (
        <p className="text-tinta-suave">Crie sua organização e adicione liderados primeiro.</p>
      ) : agendamentosQ.isLoading ? (
        <p className="text-tinta-suave">Carregando sua agenda…</p>
      ) : agendamentosQ.isError ? (
        <p className="font-medium text-alerta">Não foi possível carregar a agenda. Tente recarregar a página.</p>
      ) : (
        <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme/40 p-2 shadow-[var(--shadow-cartao)] sm:p-4">
          <Calendario
            eventos={eventos}
            aoSelecionarDia={abrirCriacao}
            aoAbrirEvento={(ev) => setDetalhe(agendamentos.find((a) => a.id === (ev.agendamentoId ?? ev.id)) ?? null)}
            aoReagendar={aoReagendar}
          />
        </div>
      )}

      {/* Lista dos 1:1 agendados — cards de linha inteira com borda lateral. */}
      {org && agendamentos.length > 0 && (
        <div className="mt-8">
          <h2 className="fonte-display mb-3 text-lg font-bold text-tinta">Seus 1:1 agendados ({agendamentos.length})</h2>
          <div className="flex flex-col gap-2.5">
            {agendamentos.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-[var(--radius-cartao)] border border-borda border-l-4 border-l-juncao bg-creme p-3.5 shadow-[var(--shadow-cartao)] sm:p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-liderado/15 text-sm font-bold text-liderado">
                  {a.liderado_nome.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-tinta">{a.liderado_nome}</span>
                  <span className="block text-xs text-tinta-suave">
                    📅 {dataBR(a.data_hora.slice(0, 10))} às {a.data_hora.slice(11, 16)}
                    {a.recorrencia !== 'NENHUMA' && ` · ${rotuloRec[a.recorrencia]}`}
                    {a.repete_ate && ` até ${dataBR(a.repete_ate)}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navegar(`/liderado/${a.colaborador_id}`)}
                  className="hidden rounded-full border-2 border-borda px-3 py-1.5 text-xs font-bold text-tinta transition hover:border-juncao hover:text-juncao sm:inline"
                >
                  Abrir 1:1
                </button>
                <button
                  type="button"
                  aria-label={`Cancelar 1:1 com ${a.liderado_nome}`}
                  onClick={async () => {
                    const ok = await confirmar({
                      emoji: '🗑️',
                      perigoso: true,
                      titulo: `Cancelar o 1:1 com ${a.liderado_nome.split(' ')[0]}?`,
                      mensagem:
                        a.recorrencia === 'NENHUMA'
                          ? 'O 1:1 sai da agenda e o liderado é avisado por e-mail.'
                          : 'Este e os próximos desta recorrência saem da agenda. O liderado é avisado por e-mail.',
                      textoConfirmar: 'Cancelar 1:1',
                    })
                    if (ok) deletar.mutate(a.id)
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-alerta/30 text-alerta transition hover:bg-alerta/10"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: novo 1:1 (estilo Google — clicou no dia) */}
      <Modal
        aberto={criarEm != null}
        aoFechar={() => setCriarEm(null)}
        titulo={criarEm ? `Novo 1:1 · ${dataBR(criarEm)}` : 'Novo 1:1'}
      >
        {liderados.length === 0 ? (
          <p className="text-tinta-suave">
            Adicione um liderado ativo no painel antes de agendar.
          </p>
        ) : (
          <form onSubmit={agendar} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-tinta-suave">
              Liderado
              <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)} className={campo}>
                {liderados.map((l) => (
                  <option key={l.id} value={l.id}>{l.nome}</option>
                ))}
              </select>
            </label>
            <div className="flex gap-3">
              <label className="flex flex-1 flex-col gap-1 text-xs font-bold uppercase tracking-wider text-tinta-suave">
                Horário
                <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className={`${campo} font-normal`} />
              </label>
              <label className="flex flex-1 flex-col gap-1 text-xs font-bold uppercase tracking-wider text-tinta-suave">
                Recorrência
                <select value={recorrencia} onChange={(e) => setRecorrencia(e.target.value as Recorrencia)} className={campo}>
                  {RECORRENCIAS.map((r) => (
                    <option key={r.valor} value={r.valor}>{r.rotulo}</option>
                  ))}
                </select>
              </label>
            </div>
            {recorrencia !== 'NENHUMA' && (
              <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-tinta-suave">
                Termina
                <select value={fimTipo} onChange={(e) => setFimTipo(e.target.value as 'NUNCA' | 'DATA' | 'VEZES')} className={campo}>
                  <option value="NUNCA">Nunca (para sempre)</option>
                  <option value="DATA">Em uma data</option>
                  <option value="VEZES">Após algumas ocorrências</option>
                </select>
                {fimTipo === 'DATA' && (
                  <input
                    type="date"
                    value={fimData}
                    min={criarEm ?? undefined}
                    onChange={(e) => setFimData(e.target.value)}
                    className={`${campo} mt-2 font-normal`}
                  />
                )}
                {fimTipo === 'VEZES' && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={104}
                      value={fimVezes}
                      onChange={(e) => setFimVezes(Math.max(1, Number(e.target.value) || 1))}
                      className={`${campo} w-24 font-normal`}
                    />
                    <span className="text-xs font-normal normal-case text-tinta-suave">
                      vezes{criarEm ? ` · até ${dataBR(dataAposVezes(criarEm, recorrencia, fimVezes))}` : ''}
                    </span>
                  </div>
                )}
              </label>
            )}
            {erro && <span className="text-sm font-medium text-alerta">{erro}</span>}
            <BotaoDuo type="submit" variante="marca" larguraTotal carregando={criar.isPending}>
              🗓️ Agendar 1:1
            </BotaoDuo>
          </form>
        )}
      </Modal>

      {/* Modal: detalhe de um 1:1 (clicou no chip) */}
      <Modal
        aberto={detalhe != null}
        aoFechar={() => setDetalhe(null)}
        titulo={detalhe ? `1:1 com ${detalhe.liderado_nome}` : '1:1'}
      >
        {detalhe && (
          <div className="flex flex-col gap-4">
            <div className="rounded-[var(--radius-suave)] bg-areia px-4 py-3 text-sm">
              <p className="font-bold text-tinta">📅 {dataBR(detalhe.data_hora.slice(0, 10))} às {detalhe.data_hora.slice(11, 16)}</p>
              <p className="mt-1 text-tinta-suave">Recorrência: {rotuloRec[detalhe.recorrencia]}</p>
            </div>
            <BotaoDuo variante="marca" larguraTotal onClick={() => navegar(`/liderado/${detalhe.colaborador_id}`)}>
              ▶ Abrir 1:1 ao vivo
            </BotaoDuo>
            <button
              type="button"
              onClick={async () => {
                const alvo = detalhe
                const ok = await confirmar({
                  emoji: '🗑️',
                  perigoso: true,
                  titulo: `Cancelar o 1:1 com ${alvo.liderado_nome.split(' ')[0]}?`,
                  mensagem:
                    alvo.recorrencia === 'NENHUMA'
                      ? 'Este agendamento será removido da agenda.'
                      : 'Este e os próximos desta recorrência saem da agenda.',
                  textoConfirmar: 'Cancelar 1:1',
                })
                if (ok) {
                  deletar.mutate(alvo.id)
                  setDetalhe(null)
                }
              }}
              className="flex items-center justify-center gap-2 rounded-[var(--radius-suave)] border-2 border-alerta/30 py-2.5 text-sm font-bold text-alerta transition hover:bg-alerta/10"
            >
              🗑️ Cancelar este 1:1
            </button>
            <button
              type="button"
              onClick={async () => {
                const alvo = detalhe
                const ok = await confirmar({
                  emoji: '🧹',
                  perigoso: true,
                  titulo: `Cancelar TODOS os 1:1 de ${alvo.liderado_nome.split(' ')[0]}?`,
                  mensagem:
                    'Remove de uma vez toda a agenda de 1:1 deste liderado — útil quando ele sai da empresa (em vez de cancelar um por um).',
                  textoConfirmar: 'Cancelar todos',
                })
                if (ok) {
                  cancelarTodos.mutate(alvo.colaborador_id)
                  setDetalhe(null)
                }
              }}
              className="flex items-center justify-center gap-2 rounded-[var(--radius-suave)] py-2 text-xs font-bold text-tinta-suave transition hover:text-alerta"
            >
              🧹 Cancelar todos os 1:1 deste liderado
            </button>
          </div>
        )}
      </Modal>
    </LayoutApp>
  )
}
