// Arquivo: src/componentes/agenda/ocorrencias.ts
// Descrição: Projeta as próximas ocorrências de um 1:1 recorrente para o calendário.
//            O backend guarda UMA linha por liderado (a próxima ocorrência + a
//            recorrência); aqui, no front, "abrimos" essa recorrência em várias datas
//            futuras para que "toda semana/quinzena/mês" apareça de verdade no
//            calendário. A 1ª ocorrência (âncora) é a real (arrastável); as demais são
//            projeções (visuais, clicáveis, abrem a série) — todas apontam para o mesmo
//            agendamento por trás (agendamentoId).

import { MESES_RECORRENCIA } from '@/recursos/agenda/agendaApi'
import type { Agendamento } from '@/recursos/agenda/agendaApi'
import type { EventoCal } from './Calendario'

// Formata uma Date local como "YYYY-MM-DDTHH:MM" (sem pulo de fuso).
function fmtLocalISO(d: Date): string {
  const p = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

// expandirAgendamentos transforma a lista de agendamentos em eventos do calendário,
// projetando as recorrências até `dias` à frente (no máx. `max` ocorrências por 1:1).
export function expandirAgendamentos(agendamentos: Agendamento[], dias = 180, max = 60): EventoCal[] {
  const saida: EventoCal[] = []
  const limite = new Date()
  limite.setDate(limite.getDate() + dias)

  for (const a of agendamentos) {
    const recorrente = a.recorrencia !== 'NENHUMA'
    const ancora = new Date(a.data_hora)

    // Ocorrência âncora (a real do backend).
    saida.push({
      id: a.id,
      agendamentoId: a.id,
      dataHora: a.data_hora,
      titulo: a.liderado_nome,
      colaboradorId: a.colaborador_id,
      recorrente,
    })

    if (!recorrente || isNaN(ancora.getTime())) continue

    // Fim da recorrência: respeita "repete até" (senão usa a janela padrão de `dias`).
    const fim = a.repete_ate ? new Date(`${a.repete_ate}T23:59`) : limite

    // Projeções das próximas ocorrências.
    for (let n = 1; n < max; n++) {
      let prox: Date
      const meses = MESES_RECORRENCIA[a.recorrencia]
      if (meses) {
        prox = new Date(
          ancora.getFullYear(),
          ancora.getMonth() + meses * n,
          ancora.getDate(),
          ancora.getHours(),
          ancora.getMinutes(),
        )
      } else {
        const passoDias = a.recorrencia === 'QUINZENAL' ? 14 : 7
        prox = new Date(ancora.getTime())
        prox.setDate(prox.getDate() + passoDias * n)
      }
      if (prox > fim) break
      saida.push({
        id: `${a.id}__${n}`,
        agendamentoId: a.id,
        dataHora: fmtLocalISO(prox),
        titulo: a.liderado_nome,
        colaboradorId: a.colaborador_id,
        recorrente: true,
        projecao: true,
      })
    }
  }
  return saida
}
