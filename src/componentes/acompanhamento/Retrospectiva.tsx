// Arquivo: src/componentes/acompanhamento/Retrospectiva.tsx
// Descrição: A "Retrospectiva" do liderado — uma página linda, rolável e animada
//            (estilo year-in-review), com a cara da aplicação (tema Encanto + vibe
//            Duolingo). Reúne a jornada de 1:1: encontros realizados, evolução do
//            humor, objetivos de PDI conquistados, 9-box, entregas/feedbacks/estudos.
//            Reaproveita os gráficos GraficoHumor/GraficoPdi e os endpoints já
//            existentes. Por ser HTML, também é IMPRIMÍVEL (📄 Salvar) — serve de
//            "dossiê" do ano sem virar um PDF sem graça.

import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'

import { GraficoHumor } from '@/componentes/painel/GraficoHumor'
import { GraficoPdi } from '@/componentes/painel/GraficoPdi'
import { usePdi } from '@/recursos/pdi/pdiApi'
import { useAcompanhamento } from '@/recursos/acompanhamento/acompanhamentoApi'
import { useClassificacoes } from '@/recursos/classificacao/classificacaoApi'
import type { Nivel } from '@/recursos/classificacao/classificacaoApi'
import { listarBlocos } from '@/recursos/conteudo/conteudoApi'
import { TEMA_HISTORICO } from '@/componentes/conteudo/EncerrarOneByOne'
import type { Organizacao } from '@/recursos/time/tipos'
import { fogos } from '@/lib/fogos'

const HUMOR_EMOJI = ['', '😞', '😕', '😐', '🙂', '😄']
const HUMOR_LABEL = ['', 'Difícil', 'Abaixo', 'Neutro', 'Bem', 'Ótimo']
const NIVEL_TXT: Record<Nivel, string> = { BAIXO: 'Baixo', MEDIO: 'Médio', ALTO: 'Alto' }

interface Props {
  colaboradorId: string
  nome: string
  org: Organizacao
  aoFechar: () => void
}

// Seção que surge ao rolar até ela.
function Secao({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`mx-auto w-full max-w-2xl px-5 py-10 ${className}`}
    >
      {children}
    </motion.section>
  )
}

function Numero({ emoji, valor, rotulo, cor }: { emoji: string; valor: string; rotulo: string; cor: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-[var(--radius-cartao)] border border-borda bg-creme/80 px-3 py-5 text-center shadow-[var(--shadow-cartao)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full text-2xl" style={{ backgroundColor: `color-mix(in srgb, ${cor} 16%, transparent)` }}>{emoji}</span>
      <span className="fonte-display text-3xl font-extrabold leading-none text-tinta">{valor}</span>
      <span className="text-xs font-semibold leading-tight text-tinta-suave">{rotulo}</span>
    </div>
  )
}

export function Retrospectiva({ colaboradorId, nome, org, aoFechar }: Props) {
  const primeiro = nome.split(' ')[0]
  const ano = new Date().getFullYear()

  const pdiQ = usePdi(colaboradorId)
  const acompQ = useAcompanhamento(colaboradorId)
  const classQ = useClassificacoes(org.id)
  const historicoQ = useQuery({
    queryKey: ['blocos', colaboradorId, TEMA_HISTORICO],
    queryFn: () => listarBlocos(colaboradorId, TEMA_HISTORICO),
  })

  // Confete de boas-vindas + trava o scroll do fundo enquanto aberta.
  useEffect(() => {
    fogos(2600)
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.body.style.overflow = antes
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aoFechar])

  const dados = useMemo(() => {
    const itensPdi = pdiQ.data ?? []
    const acomp = acompQ.data ?? []
    const sentimentos = acomp.filter((a) => a.tipo === 'SENTIMENTO' && a.valor != null)
    const humorMedio = sentimentos.length ? Math.round(sentimentos.reduce((s, a) => s + (a.valor as number), 0) / sentimentos.length) : 0
    const conquistados = itensPdi.filter((i) => i.concluido)
    const cl = (classQ.data ?? []).find((c) => c.colaborador_id === colaboradorId)
    return {
      reunioes: (historicoQ.data ?? []).length,
      pdiTotal: itensPdi.length,
      conquistados,
      humorMedio,
      humorN: sentimentos.length,
      humorDados: sentimentos.map((a) => ({ valor: a.valor as number, data: a.data_ref })),
      entregas: acomp.filter((a) => a.tipo === 'ENTREGA'),
      feedbacks: acomp.filter((a) => a.tipo === 'FEEDBACK'),
      estudos: acomp.filter((a) => a.tipo === 'ESTUDO'),
      itensPdi,
      cl,
    }
  }, [pdiQ.data, acompQ.data, classQ.data, historicoQ.data, colaboradorId])

  const carregando = pdiQ.isLoading || acompQ.isLoading || historicoQ.isLoading

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[80] overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, var(--color-areia) 0%, var(--color-creme) 40%, color-mix(in srgb, var(--color-juncao) 14%, var(--color-creme)) 100%)' }}
    >
      {/* Barra de ações (não imprime) */}
      <div className="nao-imprimir sticky top-0 z-10 flex items-center justify-between gap-2 bg-creme/70 px-5 py-3 backdrop-blur-md">
        <span className="text-sm font-bold text-tinta-suave">Retrospectiva</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className="rounded-full border-2 border-borda px-4 py-1.5 text-sm font-bold text-tinta hover:border-juncao">📄 Salvar</button>
          <button type="button" onClick={aoFechar} className="rounded-full border-2 border-borda px-4 py-1.5 text-sm font-bold text-tinta hover:border-tinta">Fechar</button>
        </div>
      </div>

      <div className="area-impressao pb-20">
        {/* Hero */}
        <Secao className="pt-16 text-center">
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} className="text-6xl">✨</motion.div>
          <h1 className="fonte-display mt-4 text-4xl font-extrabold text-tinta sm:text-5xl">Retrospectiva</h1>
          <p className="mt-2 text-lg text-tinta-suave">A jornada de <strong className="text-juncao">{primeiro}</strong> · {ano}</p>
          {!carregando && (
            <p className="mt-6 animate-bounce text-sm text-tinta-suave">role para baixo ↓</p>
          )}
        </Secao>

        {carregando ? (
          <p className="py-10 text-center text-tinta-suave">Montando a retrospectiva…</p>
        ) : (
          <>
            {/* Números da jornada */}
            <Secao>
              <h2 className="fonte-display mb-5 text-center text-2xl font-bold text-tinta">A jornada em números</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Numero emoji="🤝" valor={`${dados.reunioes}`} rotulo={dados.reunioes === 1 ? '1:1 realizado' : '1:1 realizados'} cor="var(--color-juncao)" />
                <Numero emoji="🎯" valor={`${dados.conquistados.length}`} rotulo="objetivos conquistados" cor="var(--color-sucesso)" />
                <Numero emoji="📦" valor={`${dados.entregas.length + dados.feedbacks.length + dados.estudos.length}`} rotulo="entregas, feedbacks e estudos" cor="var(--color-liderado)" />
                <Numero emoji={dados.humorMedio ? HUMOR_EMOJI[dados.humorMedio] : '🫥'} valor={dados.humorMedio ? HUMOR_LABEL[dados.humorMedio] : '—'} rotulo={dados.humorN ? `humor médio (${dados.humorN})` : 'sem check-ins'} cor="var(--color-juncao)" />
              </div>
            </Secao>

            {/* Humor ao longo do tempo */}
            {dados.humorN >= 2 && (
              <Secao>
                <h2 className="fonte-display mb-1 text-2xl font-bold text-tinta">Como você se sentiu 💜</h2>
                <p className="mb-4 text-sm text-tinta-suave">A evolução do seu humor ao longo dos check-ins.</p>
                <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme/80 p-4 shadow-[var(--shadow-cartao)]">
                  <GraficoHumor dados={dados.humorDados} />
                </div>
              </Secao>
            )}

            {/* PDI conquistado */}
            {dados.pdiTotal > 0 && (
              <Secao>
                <h2 className="fonte-display mb-1 text-2xl font-bold text-tinta">O que você conquistou 🎯</h2>
                <p className="mb-4 text-sm text-tinta-suave">{dados.conquistados.length} de {dados.pdiTotal} objetivos de desenvolvimento concluídos.</p>
                <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme/80 p-4 shadow-[var(--shadow-cartao)]">
                  <GraficoPdi itens={dados.itensPdi} />
                </div>
                {dados.conquistados.length > 0 && (
                  <ul className="mt-4 flex flex-col gap-2">
                    {dados.conquistados.slice(0, 6).map((i) => (
                      <li key={i.id} className="flex items-center gap-2 rounded-[var(--radius-suave)] bg-creme/80 px-3 py-2 text-sm text-tinta shadow-[var(--shadow-cartao)]">
                        <span className="text-sucesso">✓</span><span className="flex-1">{i.titulo}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Secao>
            )}

            {/* 9-box */}
            {dados.cl && (
              <Secao className="text-center">
                <h2 className="fonte-display mb-1 text-2xl font-bold text-tinta">Seu momento no time 🧭</h2>
                <p className="mb-5 text-sm text-tinta-suave">Posição na matriz 9-box (desempenho × potencial).</p>
                <div className="mx-auto grid w-40 grid-cols-3 gap-1.5">
                  {[2, 1, 0].map((linha) =>
                    [0, 1, 2].map((coluna) => {
                      const ativo = ['BAIXO', 'MEDIO', 'ALTO'][coluna] === dados.cl!.potencial && ['BAIXO', 'MEDIO', 'ALTO'][linha] === dados.cl!.desempenho
                      return (
                        <div key={`${linha}-${coluna}`} className={['aspect-square rounded-[var(--radius-suave)] transition', ativo ? 'gradiente-marca scale-110 shadow-[var(--shadow-flutuante)]' : 'bg-areia-escura/60'].join(' ')}>
                          {ativo && <span className="flex h-full w-full items-center justify-center text-xl">⭐</span>}
                        </div>
                      )
                    }),
                  )}
                </div>
                <p className="mt-4 text-sm font-bold text-tinta">Desempenho {NIVEL_TXT[dados.cl.desempenho]} · Potencial {NIVEL_TXT[dados.cl.potencial]}</p>
              </Secao>
            )}

            {/* Destaques: feedbacks */}
            {dados.feedbacks.length > 0 && (
              <Secao>
                <h2 className="fonte-display mb-4 text-2xl font-bold text-tinta">Feedbacks que marcaram 💬</h2>
                <div className="flex flex-col gap-3">
                  {dados.feedbacks.slice(0, 3).map((f) => (
                    <div key={f.id} className="rounded-[var(--radius-cartao)] border-l-4 border-juncao bg-creme/80 px-4 py-3 shadow-[var(--shadow-cartao)]">
                      <p className="text-sm font-bold text-tinta">{f.titulo}</p>
                      {f.detalhe && <p className="mt-0.5 text-sm text-tinta-suave">{f.detalhe}</p>}
                    </div>
                  ))}
                </div>
              </Secao>
            )}

            {/* Fecho */}
            <Secao className="text-center">
              <motion.div initial={{ scale: 0.6 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="text-6xl">🎉</motion.div>
              <h2 className="fonte-display mt-4 text-3xl font-extrabold text-tinta">Que jornada, {primeiro}!</h2>
              <p className="mx-auto mt-2 max-w-md text-tinta-suave">Cada conversa, cada objetivo e cada feedback construíram esse caminho. Que venham os próximos capítulos. 🚀</p>
              <button type="button" onClick={() => fogos(2600)} className="nao-imprimir mt-6 gradiente-marca rounded-full px-6 py-2.5 text-sm font-bold text-white">🎊 Comemorar de novo</button>
            </Secao>
          </>
        )}
      </div>
    </motion.div>,
    document.body,
  )
}
