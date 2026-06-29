// Arquivo: src/componentes/agenda/AgendaPainel.tsx
// Descrição: Bloco de agenda do PAINEL inicial. Mostra o mesmo calendário da
//            Agenda, mas focado em "abrir rápido": clicar num 1:1 abre o tabuleiro
//            ao vivo direto; clicar num dia leva para a Agenda completa.

import { Link, useNavigate } from 'react-router-dom'

import { Ajuda } from '@/componentes/ui/Ajuda'
import { Calendario } from '@/componentes/agenda/Calendario'
import type { EventoCal } from '@/componentes/agenda/Calendario'
import { expandirAgendamentos } from '@/componentes/agenda/ocorrencias'
import { useAgendamentos, useReagendarAgendamento } from '@/recursos/agenda/agendaApi'

export function AgendaPainel() {
  const navegar = useNavigate()
  const agQ = useAgendamentos()
  const reagendar = useReagendarAgendamento()
  const agendamentos = agQ.data ?? []

  // Projeta as recorrências (toda semana/quinzena/mês) nas próximas datas do calendário.
  const eventos: EventoCal[] = expandirAgendamentos(agendamentos)

  function aoReagendar(id: string, novaDataISO: string) {
    const a = agendamentos.find((x) => x.id === id)
    if (!a) return
    const horaAtual = a.data_hora.slice(11, 16) || '09:00'
    reagendar.mutate({ id, data_hora: `${novaDataISO}T${horaAtual}` })
  }

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="fonte-display text-xl font-bold text-tinta">Sua agenda</h2>
        <Ajuda titulo="Agenda no painel">
          Clique num <strong className="text-tinta">1:1</strong> para abrir o tabuleiro ao vivo na
          hora. Clique num <strong className="text-tinta">dia</strong> (ou em "Agenda completa") para
          marcar e gerenciar com recorrência.
        </Ajuda>
        <Link to="/agenda" className="ml-auto text-sm font-bold text-juncao hover:underline">
          Agenda completa →
        </Link>
      </div>

      <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme/40 p-4 shadow-[var(--shadow-cartao)]">
        <Calendario
          eventos={eventos}
          aoSelecionarDia={() => navegar('/agenda')}
          aoAbrirEvento={(ev) => ev.colaboradorId && navegar(`/liderado/${ev.colaboradorId}`)}
          aoReagendar={aoReagendar}
        />
      </div>
    </section>
  )
}
