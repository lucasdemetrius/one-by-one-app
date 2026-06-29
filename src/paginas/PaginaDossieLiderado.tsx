// Arquivo: src/paginas/PaginaDossieLiderado.tsx
// Descrição: Página INTEIRA com o "dossiê comportamental" de um liderado. No topo,
//            indicadores gerados a partir dos dados que registramos dele — humor ao
//            longo do tempo, engajamento (entregas/feedbacks/estudos), posição no
//            9-box e progresso do PDI. Embaixo, a LINHA DO TEMPO vertical com tudo
//            que aconteceu. É uma ferramenta do GESTOR/RH (substitui o antigo drawer).

import type { ReactNode } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { LayoutApp } from './LayoutApp'
import { AvatarUsuario } from '@/componentes/marca/AvatarUsuario'
import { GraficoHumor } from '@/componentes/painel/GraficoHumor'
import { useAuth } from '@/recursos/auth/AuthContext'
import { useColaborador } from '@/recursos/time/hooks'
import { useAcompanhamento } from '@/recursos/acompanhamento/acompanhamentoApi'
import { usePdi } from '@/recursos/pdi/pdiApi'
import { useClassificacoes } from '@/recursos/classificacao/classificacaoApi'
import type { Nivel } from '@/recursos/classificacao/classificacaoApi'
import { listarTimeline } from '@/recursos/auditoria/auditoriaApi'
import type { EventoAuditoria } from '@/recursos/auditoria/auditoriaApi'

// ── Helpers de apresentação ──────────────────────────────────────────────────

// Traduz (acao, entidade) da auditoria num rótulo amigável + emoji + cor.
function rotular(ev: EventoAuditoria): { emoji: string; texto: string; cor: string } {
  const mapa: Record<string, { emoji: string; texto: string; cor: string }> = {
    'CRIAR:tema_bloco': { emoji: '📌', texto: 'Adicionou conteúdo a um tema', cor: 'var(--color-juncao)' },
    'DELETAR:tema_bloco': { emoji: '🗑️', texto: 'Removeu conteúdo de um tema', cor: 'var(--color-alerta)' },
    'CRIAR:classificacao': { emoji: '📊', texto: 'Posição no 9-box definida', cor: 'var(--color-gestor)' },
    'ATUALIZAR:classificacao': { emoji: '📊', texto: '9-box atualizado', cor: 'var(--color-gestor)' },
    'CRIAR:convite': { emoji: '✉️', texto: 'Convite enviado', cor: 'var(--color-juncao)' },
    'UPLOAD_FOTO:colaborador': { emoji: '🖼️', texto: 'Foto atualizada', cor: 'var(--color-liderado)' },
    'ATUALIZAR:colaborador': { emoji: '✏️', texto: 'Dados atualizados', cor: 'var(--color-gestor)' },
    'CRIAR:colaborador': { emoji: '🌱', texto: 'Entrou no time', cor: 'var(--color-sucesso)' },
    'DESLIGAR:colaborador': { emoji: '👋', texto: 'Foi desligado(a)', cor: 'var(--color-alerta)' },
    'REATIVAR:colaborador': { emoji: '🔄', texto: 'Foi reativado(a)', cor: 'var(--color-sucesso)' },
  }
  return mapa[`${ev.acao}:${ev.entidade}`] ?? { emoji: '•', texto: `${ev.acao.toLowerCase()} ${ev.entidade}`, cor: 'var(--color-borda)' }
}

function dataHora(iso: string): { data: string; hora: string } {
  const d = new Date(iso)
  return {
    data: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  }
}

// 9-box: índice de cada nível (eixo 0..2) e rótulo amigável.
const NIVEL_IDX: Record<Nivel, number> = { BAIXO: 0, MEDIO: 1, ALTO: 2 }
const NIVEL_ROTULO: Record<Nivel, string> = { BAIXO: 'Baixo', MEDIO: 'Médio', ALTO: 'Alto' }

// Moldura de um cartão de indicador (título + conteúdo).
function Cartao({ titulo, dica, children }: { titulo: string; dica?: string; children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-4 shadow-[var(--shadow-cartao)]">
      <div className="mb-3">
        <h3 className="fonte-display text-sm font-extrabold text-tinta">{titulo}</h3>
        {dica && <p className="text-xs text-tinta-suave">{dica}</p>}
      </div>
      {children}
    </div>
  )
}

const VAZIO = 'rounded-[var(--radius-suave)] border border-dashed border-borda bg-creme/50 px-3 py-6 text-center text-xs text-tinta-suave'

// ── Página ───────────────────────────────────────────────────────────────────

export function PaginaDossieLiderado() {
  const { id = '' } = useParams()
  const { usuario } = useAuth()

  const colQ = useColaborador(id)
  const acompQ = useAcompanhamento(id) // todos os tipos de uma vez
  const pdiQ = usePdi(id)
  const classQ = useClassificacoes(colQ.data?.organizacao_id)
  const timelineQ = useQuery({
    queryKey: ['timeline', id],
    queryFn: () => listarTimeline(id),
    enabled: Boolean(id),
  })

  // O dossiê é ferramenta de gestão (humor, 9-box e timeline são do gestor). Liderado
  // volta para o próprio painel — evita cair numa página meia-vazia sem permissão.
  if (usuario?.role === 'COLABORADOR') return <Navigate to="/painel" replace />

  const col = colQ.data

  // Carregando o liderado.
  if (colQ.isLoading) {
    return (
      <LayoutApp>
        <p className="py-16 text-center text-sm text-tinta-suave">Carregando o dossiê…</p>
      </LayoutApp>
    )
  }

  // Erro ou liderado inexistente / de outro líder (o backend devolve 404 por posse).
  if (colQ.isError || !col) {
    return (
      <LayoutApp>
        <Link to="/painel" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-tinta-suave transition hover:text-tinta">
          ← Voltar
        </Link>
        <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-10 text-center">
          <p className="text-2xl">🔍</p>
          <p className="mt-2 font-bold text-tinta">Não foi possível abrir este liderado.</p>
          <p className="mt-1 text-sm text-tinta-suave">Ele pode ter sido removido ou não pertence ao seu time.</p>
        </div>
      </LayoutApp>
    )
  }

  // ── A partir daqui, `col` existe. ──
  const acomp = acompQ.data ?? []

  // Humor (sentimento 1–5) ao longo do tempo.
  const humorPts = acomp
    .filter((a) => a.tipo === 'SENTIMENTO' && a.valor != null)
    .map((a) => ({ valor: a.valor as number, data: a.data_ref }))

  // Engajamento: contagem por tipo de registro.
  const entregas = acomp.filter((a) => a.tipo === 'ENTREGA').length
  const feedbacks = acomp.filter((a) => a.tipo === 'FEEDBACK').length
  const estudos = acomp.filter((a) => a.tipo === 'ESTUDO').length
  const totalAtiv = entregas + feedbacks + estudos
  const maxAtiv = Math.max(entregas, feedbacks, estudos, 1)

  // PDI: progresso.
  const pdi = pdiQ.data ?? []
  const pdiConcluidos = pdi.filter((p) => p.concluido).length
  const pdiPct = pdi.length ? Math.round((pdiConcluidos / pdi.length) * 100) : 0

  // 9-box do liderado (entre as classificações da organização).
  const minhaClass = (classQ.data ?? []).find((c) => c.colaborador_id === id)

  // Linha do tempo (a API devolve do mais recente para o mais antigo).
  const eventos = timelineQ.data ?? []

  const primeiroNome = col.nome.split(' ')[0]

  return (
    <LayoutApp>
      <Link to="/painel" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-tinta-suave transition hover:text-tinta">
        ← Voltar
      </Link>

      <header className="mb-8 flex items-center gap-4">
        <AvatarUsuario fotoUrl={col.foto_url} nome={col.nome} tamanho={64} />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-juncao">Dossiê comportamental</span>
          <h1 className="fonte-display text-2xl font-extrabold text-tinta">{col.nome}</h1>
          {!col.ativo && <span className="text-xs font-bold text-alerta">Desligado(a)</span>}
        </div>
      </header>

      {/* ── Indicadores comportamentais ── */}
      <section className="mb-10">
        <h2 className="fonte-display mb-3 text-lg font-bold text-tinta">📈 Indicadores</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Humor ao longo do tempo — o GraficoHumor já é um cartão completo (com média
              e tendência), então renderizamos direto; só o estado vazio usa o Cartao. */}
          {humorPts.length >= 2 ? (
            <GraficoHumor dados={humorPts} />
          ) : (
            <Cartao titulo="Evolução do humor">
              <p className={VAZIO}>Registre o humor por 2+ semanas (no 📊 do liderado) para ver a evolução. 📈</p>
            </Cartao>
          )}

          {/* Engajamento */}
          <Cartao titulo="Engajamento" dica={totalAtiv ? `${totalAtiv} registros no acompanhamento` : undefined}>
            {acompQ.isLoading ? (
              <p className={VAZIO}>Carregando…</p>
            ) : totalAtiv === 0 ? (
              <p className={VAZIO}>Sem entregas, feedbacks ou estudos registrados ainda.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {[
                  { rotulo: 'Entregas', emoji: '✅', n: entregas, cor: 'var(--color-sucesso)' },
                  { rotulo: 'Feedbacks', emoji: '💬', n: feedbacks, cor: 'var(--color-juncao)' },
                  { rotulo: 'Estudos', emoji: '📚', n: estudos, cor: 'var(--color-gestor)' },
                ].map((it) => (
                  <div key={it.rotulo} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm font-semibold text-tinta">
                      {it.emoji} {it.rotulo}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-areia-escura/40">
                      <div className="h-full rounded-full" style={{ width: `${(it.n / maxAtiv) * 100}%`, backgroundColor: it.cor }} />
                    </div>
                    <span className="w-6 text-right text-sm font-bold text-tinta">{it.n}</span>
                  </div>
                ))}
              </div>
            )}
          </Cartao>

          {/* 9-box */}
          <Cartao titulo="Posição no 9-box" dica={minhaClass ? `Desempenho ${NIVEL_ROTULO[minhaClass.desempenho]} · Potencial ${NIVEL_ROTULO[minhaClass.potencial]}` : undefined}>
            {classQ.isLoading ? (
              <p className={VAZIO}>Carregando…</p>
            ) : !minhaClass ? (
              <p className={VAZIO}>Ainda não classificado no 9-box.</p>
            ) : (
              <div className="flex items-center gap-4">
                {/* Grid decorativo: a leitura textual fica na "dica" do cartão acima. */}
                <div className="grid grid-cols-3 gap-1" aria-hidden="true">
                  {[2, 1, 0].map((pot) =>
                    [0, 1, 2].map((des) => {
                      const ativo = NIVEL_IDX[minhaClass.potencial] === pot && NIVEL_IDX[minhaClass.desempenho] === des
                      return (
                        <div
                          key={`${pot}-${des}`}
                          className={[
                            'h-9 w-9 rounded-md transition',
                            ativo ? 'gradiente-marca scale-110 shadow-[var(--shadow-cartao)]' : 'bg-areia-escura/40',
                          ].join(' ')}
                        />
                      )
                    }),
                  )}
                </div>
                <div className="text-xs text-tinta-suave">
                  <p>↑ Potencial</p>
                  <p>→ Desempenho</p>
                </div>
              </div>
            )}
          </Cartao>

          {/* PDI */}
          <Cartao titulo="Plano de desenvolvimento (PDI)" dica={pdi.length ? `${pdiConcluidos} de ${pdi.length} concluídos` : undefined}>
            {pdiQ.isLoading ? (
              <p className={VAZIO}>Carregando…</p>
            ) : pdi.length === 0 ? (
              <p className={VAZIO}>Nenhum item de PDI ainda (crie no 🎯 do liderado).</p>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="fonte-display text-3xl font-extrabold text-tinta">{pdiPct}%</span>
                  <span className="text-xs text-tinta-suave">concluído</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-areia-escura/40">
                  <div className="gradiente-marca h-full rounded-full transition-all" style={{ width: `${pdiPct}%` }} />
                </div>
              </div>
            )}
          </Cartao>
        </div>
      </section>

      {/* ── Linha do tempo (vertical, página inteira) ── */}
      <section>
        <h2 className="fonte-display mb-4 text-lg font-bold text-tinta">📜 Linha do tempo</h2>
        {timelineQ.isLoading ? (
          <p className="text-sm text-tinta-suave">Carregando…</p>
        ) : eventos.length === 0 ? (
          <div className="rounded-[var(--radius-cartao)] border-2 border-dashed border-borda bg-creme/50 p-10 text-center text-sm text-tinta-suave">
            Nada por aqui ainda. As atividades aparecem conforme vocês usam o 1:1. ✨
          </div>
        ) : (
          <ol className="relative ml-4 border-l-2 border-borda">
            {eventos.map((ev) => {
              const { emoji, texto, cor } = rotular(ev)
              const { data, hora } = dataHora(ev.criado_em)
              return (
                <li key={ev.id} className="relative mb-5 pl-8">
                  {/* Nó sobre a linha da esquerda */}
                  <span
                    className="absolute -left-[1.05rem] top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-creme text-base shadow-[var(--shadow-cartao)]"
                    style={{ borderColor: cor }}
                  >
                    {emoji}
                  </span>
                  <div
                    className="rounded-[var(--radius-cartao)] border border-borda border-l-4 bg-creme px-4 py-3 shadow-[var(--shadow-cartao)]"
                    style={{ borderLeftColor: cor }}
                  >
                    <p className="font-bold text-tinta">{texto}</p>
                    <p className="text-xs text-tinta-suave">
                      {data} · {hora}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
        {eventos.length > 0 && (
          <p className="mt-4 text-center text-xs text-tinta-suave">
            {eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'} na história de {primeiroNome}.
          </p>
        )}
      </section>
    </LayoutApp>
  )
}
