// Arquivo: src/componentes/painel/Lembretes.tsx
// Descrição: Faixa de LEMBRETES/AVISOS no topo do painel — o que precisa de
//            atenção AGORA: 1:1 marcados para hoje, liderados aguardando convite e
//            objetivos de PDI com prazo vencido. Cada aviso é clicável e leva à
//            ação. Tudo calculado no front (reusa agendamentos, colaboradores e o
//            cache de PDI). Se não há nada pendente, mostra um "tudo em dia".

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'

import { useColaboradores } from '@/recursos/time/hooks'
import type { Organizacao } from '@/recursos/time/tipos'
import { useAgendamentos } from '@/recursos/agenda/agendaApi'
import { listarPdi } from '@/recursos/pdi/pdiApi'
import type { ItemPDI } from '@/recursos/pdi/pdiApi'

// Data de HOJE no fuso local (mesmo formato YYYY-MM-DD do resto do app).
function hojeLocal(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

interface Aviso {
  chave: string
  emoji: string
  texto: string
  sub: string
  cor: string
  para?: string // rota ao clicar (opcional)
}

export function Lembretes({ org }: { org: Organizacao }) {
  const agendamentosQ = useAgendamentos()
  const colaboradoresQ = useColaboradores(org.id)
  const ativos = useMemo(() => (colaboradoresQ.data ?? []).filter((c) => c.ativo), [colaboradoresQ.data])

  // Reusa o cache de PDI por liderado (mesma queryKey dos drawers/pulso).
  const pdiQ = useQueries({
    queries: ativos.map((c) => ({ queryKey: ['pdi', c.id], queryFn: () => listarPdi(c.id) })),
  })

  const avisos = useMemo<Aviso[]>(() => {
    const hoje = hojeLocal()
    const lista: Aviso[] = []

    const umAvisos1a1 = (agendamentosQ.data ?? []).filter((a) => a.data_hora.slice(0, 10) === hoje).length
    if (umAvisos1a1 > 0) {
      lista.push({
        chave: '1a1',
        emoji: '🗓️',
        texto: `${umAvisos1a1} 1:1 ${umAvisos1a1 === 1 ? 'marcado' : 'marcados'} para hoje`,
        sub: 'ver na agenda',
        cor: 'var(--color-gestor)',
        para: '/agenda',
      })
    }

    const aConvidar = ativos.filter((c) => !c.usuario_id).length
    if (aConvidar > 0) {
      lista.push({
        chave: 'convite',
        emoji: '🔔',
        texto: `${aConvidar} ${aConvidar === 1 ? 'liderado aguardando' : 'liderados aguardando'} convite`,
        sub: 'convide na estrutura abaixo',
        cor: '#f59e0b',
      })
    }

    let pdiAtrasados = 0
    for (const q of pdiQ) {
      for (const i of ((q.data as ItemPDI[] | undefined) ?? [])) {
        if (!i.concluido && i.prazo && i.prazo < hoje) pdiAtrasados++
      }
    }
    if (pdiAtrasados > 0) {
      lista.push({
        chave: 'pdi',
        emoji: '🎯',
        texto: `${pdiAtrasados} ${pdiAtrasados === 1 ? 'objetivo de PDI atrasado' : 'objetivos de PDI atrasados'}`,
        sub: 'abra o 🎯 do liderado',
        cor: 'var(--color-alerta)',
      })
    }
    return lista
  }, [agendamentosQ.data, ativos, pdiQ])

  if (ativos.length === 0) return null

  if (avisos.length === 0) {
    return (
      <section className="mb-6 flex items-center gap-3 rounded-[var(--radius-cartao)] border border-borda bg-creme px-5 py-3 shadow-[var(--shadow-cartao)]">
        <span className="text-xl">✨</span>
        <span className="text-sm font-semibold text-tinta-suave">Tudo em dia por aqui — nenhum lembrete pendente.</span>
      </section>
    )
  }

  return (
    <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {avisos.map((a) => {
        const conteudo = (
          <div
            className="flex h-full items-center gap-3 rounded-[var(--radius-cartao)] border bg-creme px-4 py-3 shadow-[var(--shadow-cartao)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-flutuante)]"
            style={{ borderColor: `color-mix(in srgb, ${a.cor} 45%, var(--color-borda))` }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
              style={{ backgroundColor: `color-mix(in srgb, ${a.cor} 16%, transparent)` }}
            >
              {a.emoji}
            </span>
            <div className="min-w-0">
              <span className="block text-sm font-bold leading-tight text-tinta">{a.texto}</span>
              <span className="block text-xs font-semibold" style={{ color: a.cor }}>
                {a.sub} {a.para && '→'}
              </span>
            </div>
          </div>
        )
        return a.para ? (
          <Link key={a.chave} to={a.para}>
            {conteudo}
          </Link>
        ) : (
          <div key={a.chave}>{conteudo}</div>
        )
      })}
    </section>
  )
}
