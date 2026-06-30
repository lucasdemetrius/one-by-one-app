// Arquivo: src/componentes/admin/SecaoFeedback.tsx
// Descrição: Aba "Feedback" do painel de admin — a voz dos usuários: índice de satisfação,
//            reações por dia (barras empilhadas), por tela (contexto) e comentários
//            recentes. Consome GET /admin/feedbacks (usePainelFeedback).

import { usePainelFeedback } from '@/recursos/feedback/feedbackApi'
import type { PainelFeedback, Reacao } from '@/recursos/feedback/feedbackApi'
import { Cartao, CartaoKPI, Carregando, TituloSecao, Vazio } from './Graficos'
import { diaCurto, quando } from './formatos'

const REACAO_INFO: Record<Reacao, { emoji: string; rotulo: string; cor: string }> = {
  CURTI: { emoji: '👍', rotulo: 'Curti', cor: 'var(--color-sucesso)' },
  NAO_CURTI: { emoji: '👎', rotulo: 'Não curti', cor: 'var(--color-juncao)' },
  IRRITADO: { emoji: '😠', rotulo: 'Irritado', cor: 'var(--color-alerta)' },
}

// Barras EMPILHADAS por dia (curti embaixo, não curti, irritado no topo).
function GraficoSerie({ painel }: { painel: PainelFeedback }) {
  const totais = painel.dias.map((_, i) => painel.serie_curti[i] + painel.serie_nao_curti[i] + painel.serie_irritado[i])
  const max = Math.max(1, ...totais)
  const passo = Math.max(1, Math.ceil(painel.dias.length / 12))
  return (
    <div>
      <div className="flex h-44 items-stretch gap-[3px]">
        {painel.dias.map((dia, i) => {
          const c = painel.serie_curti[i]
          const n = painel.serie_nao_curti[i]
          const r = painel.serie_irritado[i]
          return (
            <div key={dia} className="flex flex-1 flex-col-reverse" title={`${diaCurto(dia)} — 👍 ${c} · 👎 ${n} · 😠 ${r}`}>
              <div style={{ height: `${(c / max) * 100}%`, backgroundColor: 'var(--color-sucesso)' }} />
              <div style={{ height: `${(n / max) * 100}%`, backgroundColor: 'var(--color-juncao)' }} />
              <div style={{ height: `${(r / max) * 100}%`, backgroundColor: 'var(--color-alerta)' }} />
            </div>
          )
        })}
      </div>
      <div className="mt-1.5 flex text-[0.6rem] text-tinta-suave">
        {painel.dias.map((dia, i) => (
          <div key={dia} className="flex-1 text-center">
            {i % passo === 0 ? diaCurto(dia) : ''}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {(Object.keys(REACAO_INFO) as Reacao[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5 text-xs font-semibold text-tinta-suave">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: REACAO_INFO[k].cor }} />
            {REACAO_INFO[k].emoji} {REACAO_INFO[k].rotulo}
          </span>
        ))}
      </div>
    </div>
  )
}

function BarraContexto({ contexto }: { contexto: PainelFeedback['por_contexto'][number] }) {
  const { curti, nao_curti, irritado, total } = contexto
  const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0)
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-sm font-semibold text-tinta" title={contexto.contexto}>
        {contexto.contexto}
      </span>
      <div className="flex h-3.5 flex-1 overflow-hidden rounded-full bg-areia-escura">
        <div style={{ width: `${pct(curti)}%`, backgroundColor: 'var(--color-sucesso)' }} />
        <div style={{ width: `${pct(nao_curti)}%`, backgroundColor: 'var(--color-juncao)' }} />
        <div style={{ width: `${pct(irritado)}%`, backgroundColor: 'var(--color-alerta)' }} />
      </div>
      <span className="w-8 shrink-0 text-right text-sm font-bold text-tinta-suave">{total}</span>
    </div>
  )
}

export function SecaoFeedback({ dias, ativo }: { dias: number; ativo: boolean }) {
  const { data, isLoading } = usePainelFeedback(dias, ativo)

  if (isLoading && !data) return <Carregando altura="h-64" />
  if (!data) return null
  if (data.total === 0)
    return <Vazio titulo="Ainda não há feedback neste período." sub="Assim que os usuários reagirem, os indicadores aparecem aqui." />

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CartaoKPI emoji="😊" valor={`${data.indice_satisfacao}%`} rotulo="Índice de satisfação" cor="var(--color-sucesso)" />
        <CartaoKPI emoji="👍" valor={data.curti} rotulo="Curtidas" cor="var(--color-sucesso)" />
        <CartaoKPI emoji="👎" valor={data.nao_curti} rotulo="Não curtiram" cor="var(--color-juncao)" />
        <CartaoKPI emoji="😠" valor={data.irritado} rotulo="Irritados" cor="var(--color-alerta)" />
      </div>

      <section>
        <TituloSecao>Reações por dia</TituloSecao>
        <Cartao>
          <GraficoSerie painel={data} />
        </Cartao>
      </section>

      {data.por_contexto.length > 0 && (
        <section>
          <TituloSecao>Onde reagem (por tela)</TituloSecao>
          <Cartao>
            <div className="flex flex-col gap-3">
              {data.por_contexto.map((c) => (
                <BarraContexto key={c.contexto} contexto={c} />
              ))}
            </div>
          </Cartao>
        </section>
      )}

      <section>
        <TituloSecao>Comentários recentes</TituloSecao>
        {data.recentes.length === 0 ? (
          <p className="rounded-[var(--radius-cartao)] border border-dashed border-borda bg-creme/50 p-6 text-center text-sm text-tinta-suave">
            Sem comentários no período — só reações sem texto.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {data.recentes.map((c, i) => (
              <div key={i} className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-4 shadow-[var(--shadow-cartao)]">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-lg">{REACAO_INFO[c.reacao].emoji}</span>
                  <span className="text-sm font-bold text-tinta">{c.autor_nome}</span>
                  <span className="rounded-full bg-areia-escura/60 px-2 py-0.5 text-[0.65rem] font-semibold text-tinta-suave">{c.autor_papel}</span>
                  {c.contexto && (
                    <span className="rounded-full bg-juncao/10 px-2 py-0.5 text-[0.65rem] font-semibold text-juncao">{c.contexto}</span>
                  )}
                  <span className="ml-auto text-[0.7rem] text-tinta-suave">{quando(c.criado_em)}</span>
                </div>
                <p className="text-sm leading-relaxed text-tinta-suave">{c.comentario}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
