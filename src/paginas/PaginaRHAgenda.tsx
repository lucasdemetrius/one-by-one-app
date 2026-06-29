// Arquivo: src/paginas/PaginaRHAgenda.tsx
// Descrição: Agenda CONSOLIDADA do RH — o calendário com os 1:1 de TODOS os gestores
//            do tenant, com filtro por gestor e por equipe, e um detalhe bonito ao
//            clicar (gestor, equipe, liderado, recorrência). Só leitura: o RH acompanha,
//            quem marca/remarca é cada gestor. Reusa o Calendario e a projeção de
//            recorrências (mesma do gestor).

import { useEffect, useMemo, useState } from 'react'

import { LayoutApp } from './LayoutApp'
import { Modal } from '@/componentes/ui/Modal'
import { Calendario } from '@/componentes/agenda/Calendario'
import type { EventoCal } from '@/componentes/agenda/Calendario'
import { expandirAgendamentos } from '@/componentes/agenda/ocorrencias'
import { extrairMensagemErro } from '@/lib/api'
import { agendaDoRH, type AgendaItemRH } from '@/recursos/rh/rhApi'

const ROTULO_REC: Record<string, string> = {
  NENHUMA: 'Único',
  SEMANAL: 'Semanal',
  QUINZENAL: 'Quinzenal',
  MENSAL: 'Mensal',
  BIMESTRAL: 'A cada 2 meses',
  TRIMESTRAL: 'A cada 3 meses',
  SEMESTRAL: 'A cada 6 meses',
}

const selectCls =
  'rounded-full border-2 border-borda bg-creme px-4 py-2 text-sm font-bold text-tinta outline-none focus:border-juncao'

// "YYYY-MM-DD" → "DD/MM/YYYY"
function dataBR(iso: string): string {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

// Seção reutilizável (sem LayoutApp) — embutida no painel do RH e na rota /rh/agenda.
export function SecaoAgendaRH() {
  const [itens, setItens] = useState<AgendaItemRH[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [fGestor, setFGestor] = useState('')
  const [fEquipe, setFEquipe] = useState('')
  const [detalhe, setDetalhe] = useState<AgendaItemRH | null>(null)

  useEffect(() => {
    agendaDoRH()
      .then(setItens)
      .catch((e) => setErro(extrairMensagemErro(e)))
      .finally(() => setCarregando(false))
  }, [])

  // Listas únicas para os filtros (equipes acompanham o gestor selecionado).
  const gestores = useMemo(() => {
    const m = new Map<string, string>()
    itens.forEach((i) => m.set(i.gestor_id, i.gestor_nome))
    return [...m.entries()].map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome))
  }, [itens])
  const equipes = useMemo(() => {
    const m = new Map<string, string>()
    itens
      .filter((i) => !fGestor || i.gestor_id === fGestor)
      .forEach((i) => { if (i.equipe_id) m.set(i.equipe_id, i.equipe_nome) })
    return [...m.entries()].map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome))
  }, [itens, fGestor])

  const filtrados = useMemo(
    () => itens.filter((i) => (!fGestor || i.gestor_id === fGestor) && (!fEquipe || i.equipe_id === fEquipe)),
    [itens, fGestor, fEquipe],
  )
  // AgendaItemRH tem os campos de Agendamento → reaproveita a projeção de recorrências.
  const eventos: EventoCal[] = useMemo(() => expandirAgendamentos(filtrados), [filtrados])

  function abrir(ev: EventoCal) {
    setDetalhe(itens.find((i) => i.id === (ev.agendamentoId ?? ev.id)) ?? null)
  }

  return (
    <section className="mb-12">
      <div className="mb-4">
        <h2 className="fonte-display text-xl font-extrabold text-tinta sm:text-2xl">📅 Agenda da empresa</h2>
        <p className="mt-1 text-tinta-suave">Todos os 1:1 dos seus gestores num calendário só. Clique num 1:1 para ver os detalhes.</p>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select value={fGestor} onChange={(e) => { setFGestor(e.target.value); setFEquipe('') }} className={selectCls} title="Filtrar por gestor">
          <option value="">Todos os gestores</option>
          {gestores.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
        </select>
        <select value={fEquipe} onChange={(e) => setFEquipe(e.target.value)} className={selectCls} title="Filtrar por equipe">
          <option value="">Todas as equipes</option>
          {equipes.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        {(fGestor || fEquipe) && (
          <button type="button" onClick={() => { setFGestor(''); setFEquipe('') }} className="text-sm font-bold text-juncao hover:underline">Limpar</button>
        )}
        <span className="ml-auto text-sm text-tinta-suave">{filtrados.length} 1:1</span>
      </div>

      {carregando && <p className="text-tinta-suave">Carregando a agenda…</p>}
      {erro && <p className="font-medium text-alerta">{erro}</p>}

      {!carregando && !erro && (
        <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme/40 p-2 shadow-[var(--shadow-cartao)] sm:p-4">
          <Calendario eventos={eventos} aoAbrirEvento={abrir} />
        </div>
      )}

      {/* Detalhe do 1:1 (bonito) */}
      <Modal aberto={detalhe != null} aoFechar={() => setDetalhe(null)} titulo={detalhe ? `1:1 com ${detalhe.liderado_nome}` : '1:1'}>
        {detalhe && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-[var(--radius-suave)] bg-areia px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gestor text-base font-bold text-white">{detalhe.gestor_nome.charAt(0).toUpperCase()}</span>
              <div className="min-w-0">
                <span className="block text-xs uppercase tracking-wider text-tinta-suave">Gestor</span>
                <span className="block truncate font-bold text-tinta">{detalhe.gestor_nome}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-[var(--radius-suave)] bg-areia px-3 py-2">
                <span className="block text-xs uppercase tracking-wider text-tinta-suave">Equipe</span>
                <span className="font-bold text-tinta">{detalhe.equipe_nome || '—'}</span>
              </div>
              <div className="rounded-[var(--radius-suave)] bg-areia px-3 py-2">
                <span className="block text-xs uppercase tracking-wider text-tinta-suave">Recorrência</span>
                <span className="font-bold text-tinta">{ROTULO_REC[detalhe.recorrencia] ?? detalhe.recorrencia}</span>
              </div>
            </div>
            <div className="rounded-[var(--radius-suave)] bg-areia px-3 py-2 text-sm">
              <span className="block text-xs uppercase tracking-wider text-tinta-suave">Quando</span>
              <span className="font-bold text-tinta">📅 {dataBR(detalhe.data_hora.slice(0, 10))} às {detalhe.data_hora.slice(11, 16)}</span>
              {detalhe.repete_ate && <span className="ml-2 text-tinta-suave">· repete até {dataBR(detalhe.repete_ate)}</span>}
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}

// Página standalone (rota /rh/agenda) — a mesma seção dentro do layout.
export function PaginaRHAgenda() {
  return (
    <LayoutApp>
      <SecaoAgendaRH />
    </LayoutApp>
  )
}
