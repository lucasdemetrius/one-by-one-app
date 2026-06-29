// Arquivo: src/componentes/acompanhamento/RelatorioLiderado.tsx
// Descrição: Relatório imprimível do liderado (Exportar PDF via window.print). Junta
//            num documento limpo: posição no 9-box, PDI (objetivos + progresso) e o
//            acompanhamento (humor recente, entregas, feedbacks, estudos). Usa o CSS
//            de impressão do projeto (.area-impressao imprime; .nao-imprimir some).

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { usePdi } from '@/recursos/pdi/pdiApi'
import { useAcompanhamento } from '@/recursos/acompanhamento/acompanhamentoApi'
import { useClassificacoes } from '@/recursos/classificacao/classificacaoApi'
import type { Organizacao } from '@/recursos/time/tipos'

const HUMOR_EMOJI = ['', '😞', '😕', '😐', '🙂', '😄']
const NIVEL: Record<string, string> = { BAIXO: 'Baixo', MEDIO: 'Médio', ALTO: 'Alto' }

function dataBR(iso: string): string {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

interface Props {
  colaboradorId: string
  nome: string
  org: Organizacao
  aoFechar: () => void
}

export function RelatorioLiderado({ colaboradorId, nome, org, aoFechar }: Props) {
  const pdiQ = usePdi(colaboradorId)
  const acompQ = useAcompanhamento(colaboradorId)
  const classQ = useClassificacoes(org.id)

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoFechar])

  const itens = pdiQ.data ?? []
  const pdiTotal = itens.length
  const pdiFeito = itens.filter((i) => i.concluido).length
  const pdiPct = pdiTotal ? Math.round((pdiFeito / pdiTotal) * 100) : 0

  const acomp = acompQ.data ?? []
  const sentimentos = acomp.filter((a) => a.tipo === 'SENTIMENTO' && a.valor != null)
  const humorMedio = sentimentos.length ? Math.round(sentimentos.reduce((s, a) => s + (a.valor as number), 0) / sentimentos.length) : null
  const entregas = acomp.filter((a) => a.tipo === 'ENTREGA')
  const feedbacks = acomp.filter((a) => a.tipo === 'FEEDBACK')
  const estudos = acomp.filter((a) => a.tipo === 'ESTUDO')

  const cl = (classQ.data ?? []).find((c) => c.colaborador_id === colaboradorId)
  const hoje = new Date().toLocaleDateString('pt-BR')

  const tituloSecao = 'fonte-display mt-6 mb-2 text-base font-extrabold uppercase tracking-wider text-juncao'
  const linhaItem = 'border-b border-borda py-1.5 text-sm text-tinta'

  function Secao({ titulo, itensLista }: { titulo: string; itensLista: typeof acomp }) {
    return (
      <>
        <h3 className={tituloSecao}>{titulo}</h3>
        {itensLista.length === 0 ? (
          <p className="text-sm text-tinta-suave">— sem registros —</p>
        ) : (
          <ul>
            {itensLista.map((i) => (
              <li key={i.id} className={linhaItem}>
                <strong>{i.titulo}</strong>
                {i.detalhe ? ` — ${i.detalhe}` : ''} <span className="text-tinta-suave">({dataBR(i.data_ref)})</span>
              </li>
            ))}
          </ul>
        )}
      </>
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-[75] flex justify-center overflow-y-auto bg-tinta/30 p-4 backdrop-blur-sm" onClick={aoFechar}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="my-4 h-fit w-full max-w-3xl rounded-[var(--radius-cartao)] border-2 border-borda bg-creme shadow-[var(--shadow-flutuante)]"
      >
        {/* Barra de ações (não entra no PDF) */}
        <div className="nao-imprimir flex items-center justify-between gap-2 border-b border-borda px-5 py-3">
          <span className="text-sm font-bold text-tinta-suave">Pré-visualização do relatório</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => window.print()} className="gradiente-marca rounded-full px-4 py-1.5 text-sm font-bold text-white">
              📄 Salvar PDF / Imprimir
            </button>
            <button type="button" onClick={aoFechar} className="rounded-full border-2 border-borda px-4 py-1.5 text-sm font-bold text-tinta hover:border-tinta">
              Fechar
            </button>
          </div>
        </div>

        {/* Conteúdo imprimível */}
        <div className="area-impressao px-7 py-6">
          <div className="flex items-end justify-between border-b-2 border-borda pb-3">
            <div>
              <h1 className="fonte-display text-2xl font-extrabold text-tinta">Relatório de acompanhamento</h1>
              <p className="text-sm text-tinta-suave">{nome} · {org.nome}</p>
            </div>
            <p className="text-xs text-tinta-suave">Gerado em {hoje}</p>
          </div>

          <h3 className={tituloSecao}>Matriz 9-box</h3>
          <p className="text-sm text-tinta">
            {cl ? `Desempenho ${NIVEL[cl.desempenho]} · Potencial ${NIVEL[cl.potencial]}` : 'Ainda não classificado.'}
          </p>

          <h3 className={tituloSecao}>Humor (sentimento)</h3>
          <p className="text-sm text-tinta">
            {humorMedio ? `Média recente: ${HUMOR_EMOJI[humorMedio]} (${humorMedio}/5) · ${sentimentos.length} check-ins` : 'Sem check-ins de humor.'}
          </p>

          <h3 className={tituloSecao}>PDI — Plano de desenvolvimento</h3>
          <p className="mb-1 text-sm text-tinta">{pdiTotal ? `${pdiFeito} de ${pdiTotal} objetivos concluídos (${pdiPct}%)` : 'Sem objetivos cadastrados.'}</p>
          {itens.length > 0 && (
            <ul>
              {itens.map((i) => (
                <li key={i.id} className={linhaItem}>
                  {i.concluido ? '✓' : '○'} {i.titulo}
                  {i.prazo ? ` — prazo ${dataBR(i.prazo)}` : ''}
                </li>
              ))}
            </ul>
          )}

          <Secao titulo="Entregas" itensLista={entregas} />
          <Secao titulo="Feedbacks recebidos" itensLista={feedbacks} />
          <Secao titulo="Estudos" itensLista={estudos} />

          <p className="mt-8 text-center text-xs text-tinta-suave">OneByOne · relatório do liderado</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
