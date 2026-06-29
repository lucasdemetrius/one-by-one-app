// Arquivo: src/componentes/painel/PulsoTime.tsx
// Descrição: "Pulso do time" no painel — um resumo do time num relance: humor médio
//            (dos check-ins de sentimento), atividade recente (entregas/feedbacks/
//            estudos dos últimos 30 dias), progresso de PDI agregado e quantos
//            liderados ainda faltam convidar. Agrega no front os dados por liderado
//            (reusa os endpoints de acompanhamento e PDI; cache compartilhado).

import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useQueries } from '@tanstack/react-query'

import { Ajuda } from '@/componentes/ui/Ajuda'
import { useColaboradores } from '@/recursos/time/hooks'
import type { Organizacao } from '@/recursos/time/tipos'
import { listarAcompanhamento } from '@/recursos/acompanhamento/acompanhamentoApi'
import type { Acompanhamento } from '@/recursos/acompanhamento/acompanhamentoApi'
import { listarPdi } from '@/recursos/pdi/pdiApi'
import type { ItemPDI } from '@/recursos/pdi/pdiApi'

const HUMOR_EMOJI = ['😴', '😞', '😕', '😐', '🙂', '😄'] // índice 1..5 (0 não usado)
const HUMOR_LABEL = ['', 'Difícil', 'Abaixo', 'Neutro', 'Bem', 'Ótimo']

function diasAtras(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)
}

// Cartão de estatística do pulso. `dica` adiciona um "?" no canto que abre a explicação.
function Cartao({
  emoji,
  valor,
  rotulo,
  cor,
  alerta,
  dica,
  alinharDica = 'direita',
}: {
  emoji: string
  valor: string
  rotulo: string
  cor: string
  alerta?: boolean
  dica?: { titulo: string; texto: ReactNode }
  alinharDica?: 'esquerda' | 'direita'
}) {
  return (
    <div
      className={['relative flex items-center gap-3 rounded-[var(--radius-cartao)] border bg-creme px-4 py-3 shadow-[var(--shadow-cartao)]', alerta ? 'piscar-alerta border-borda' : 'border-borda'].join(' ')}
    >
      {dica && (
        <span className="absolute right-2 top-2">
          <Ajuda titulo={dica.titulo} alinhar={alinharDica} compacto>
            {dica.texto}
          </Ajuda>
        </span>
      )}
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
        style={{ backgroundColor: `color-mix(in srgb, ${cor} 16%, transparent)` }}
      >
        {emoji}
      </span>
      <div className="min-w-0 pr-5">
        <span className="fonte-display block text-xl font-extrabold leading-none text-tinta">{valor}</span>
        <span className="block truncate text-xs font-semibold text-tinta-suave">{rotulo}</span>
      </div>
    </div>
  )
}

export function PulsoTime({ org }: { org: Organizacao }) {
  const colaboradoresQ = useColaboradores(org.id)
  const ativos = useMemo(() => (colaboradoresQ.data ?? []).filter((c) => c.ativo), [colaboradoresQ.data])

  // Uma query por liderado ativo (cache compartilhado com os drawers de cada um).
  const acompQ = useQueries({
    queries: ativos.map((c) => ({
      queryKey: ['acompanhamento', c.id, 'todos'],
      queryFn: () => listarAcompanhamento(c.id),
    })),
  })
  const pdiQ = useQueries({
    queries: ativos.map((c) => ({ queryKey: ['pdi', c.id], queryFn: () => listarPdi(c.id) })),
  })

  const resumo = useMemo(() => {
    const limite = diasAtras(30)
    const humores: number[] = []
    let entregas = 0
    let feedbacks = 0
    let estudos = 0
    for (const q of acompQ) {
      const lista = (q.data as Acompanhamento[] | undefined) ?? []
      // primeiro SENTIMENTO da lista (ordenada por data desc) = humor mais recente
      const sent = lista.find((a) => a.tipo === 'SENTIMENTO' && a.valor != null)
      if (sent?.valor != null) humores.push(sent.valor)
      for (const a of lista) {
        if (a.data_ref < limite) continue
        if (a.tipo === 'ENTREGA') entregas++
        else if (a.tipo === 'FEEDBACK') feedbacks++
        else if (a.tipo === 'ESTUDO') estudos++
      }
    }
    let pdiTotal = 0
    let pdiFeito = 0
    for (const q of pdiQ) {
      for (const i of ((q.data as ItemPDI[] | undefined) ?? [])) {
        pdiTotal++
        if (i.concluido) pdiFeito++
      }
    }
    const humorMedio = humores.length ? Math.round(humores.reduce((a, b) => a + b, 0) / humores.length) : null
    return { humorMedio, humorN: humores.length, entregas, feedbacks, estudos, pdiTotal, pdiFeito }
  }, [acompQ, pdiQ])

  const aConvidar = ativos.filter((c) => !c.usuario_id).length
  const carregando = acompQ.some((q) => q.isLoading) || pdiQ.some((q) => q.isLoading)

  if (ativos.length === 0) return null

  const pdiPct = resumo.pdiTotal ? Math.round((resumo.pdiFeito / resumo.pdiTotal) * 100) : 0

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="fonte-display text-xl font-bold text-tinta">Pulso do time</h2>
        {carregando && <span className="text-xs text-tinta-suave">atualizando…</span>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Cartao
          emoji={resumo.humorMedio ? HUMOR_EMOJI[resumo.humorMedio] : '🫥'}
          valor={resumo.humorMedio ? HUMOR_LABEL[resumo.humorMedio] : '—'}
          rotulo={resumo.humorN > 0 ? `humor médio (${resumo.humorN})` : 'sem check-ins'}
          cor="var(--color-liderado)"
          alinharDica="esquerda"
          dica={{
            titulo: 'Humor do time',
            texto: (
              <>
                A <strong className="text-tinta">média do humor</strong> dos liderados, pelo último
                check-in de sentimento de cada um (de 😞 Difícil a 😄 Ótimo). “Sem check-ins” = ninguém
                registrou ainda; o número entre parênteses é <strong className="text-tinta">quantos</strong> registraram.
              </>
            ),
          }}
        />
        <Cartao
          emoji="📦"
          valor={`${resumo.entregas + resumo.feedbacks + resumo.estudos}`}
          rotulo={`entregas/feedbacks/estudos · 30d`}
          cor="var(--color-juncao)"
          alinharDica="esquerda"
          dica={{
            titulo: 'Atividade · últimos 30 dias',
            texto: (
              <>
                Quantas <strong className="text-tinta">entregas, feedbacks e estudos</strong> foram
                registrados no acompanhamento dos liderados nos últimos 30 dias (somados). 0 = nada
                lançado no período ainda.
              </>
            ),
          }}
        />
        <Cartao
          emoji="🎯"
          valor={resumo.pdiTotal ? `${pdiPct}%` : '—'}
          rotulo={resumo.pdiTotal ? `PDI · ${resumo.pdiFeito}/${resumo.pdiTotal} objetivos` : 'sem PDI ainda'}
          cor="var(--color-gestor)"
          dica={{
            titulo: 'PDI do time',
            texto: (
              <>
                Progresso do <strong className="text-tinta">Plano de Desenvolvimento Individual</strong>:
                % de objetivos concluídos somando todos os liderados. “Sem PDI ainda” = ninguém tem
                objetivo cadastrado.
              </>
            ),
          }}
        />
        <Cartao
          emoji="🔔"
          valor={`${aConvidar}`}
          rotulo="a convidar"
          cor="#f59e0b"
          alerta={aConvidar > 0}
          dica={{
            titulo: 'A convidar',
            texto: (
              <>
                Quantos liderados ativos ainda <strong className="text-tinta">não têm conta</strong> no
                app. Convide-os (na estrutura abaixo) para que acessem e participem dos 1:1.
              </>
            ),
          }}
        />
      </div>
    </section>
  )
}
