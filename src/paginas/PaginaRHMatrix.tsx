// Arquivo: src/paginas/PaginaRHMatrix.tsx
// Descrição: Matrix9-Box CONSOLIDADA do RH — todos os liderados do tenant no 9-box
//            (desempenho × potencial), com filtro por gestor e por equipe. Só leitura
//            (quem classifica é cada gestor no painel dele). Reaproveita o visual do
//            9-box do gestor (zonas, rótulos, eixos).

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { LayoutApp } from './LayoutApp'
import { extrairMensagemErro } from '@/lib/api'
import { matrixDoRH, type MatrixItemRH } from '@/recursos/rh/rhApi'

type Nivel = 'BAIXO' | 'MEDIO' | 'ALTO'
const NIVEIS: Nivel[] = ['BAIXO', 'MEDIO', 'ALTO']
const POTENCIAIS: Nivel[] = ['ALTO', 'MEDIO', 'BAIXO']
const idxNivel: Record<Nivel, number> = { BAIXO: 0, MEDIO: 1, ALTO: 2 }
const nomeNivel: Record<Nivel, string> = { BAIXO: 'Baixo', MEDIO: 'Médio', ALTO: 'Alto' }
const ROTULOS: Record<string, string> = {
  'ALTO-ALTO': '⭐ Estrela',
  'MEDIO-ALTO': 'Forte potencial',
  'BAIXO-ALTO': 'Enigma',
  'ALTO-MEDIO': 'Alto desempenho',
  'MEDIO-MEDIO': 'Mantenedor',
  'BAIXO-MEDIO': 'Em desenvolvimento',
  'ALTO-BAIXO': 'Especialista',
  'MEDIO-BAIXO': 'Eficaz',
  'BAIXO-BAIXO': '⚠️ Atenção',
}

// Cor da zona (mesma lógica do 9-box do gestor): de sucesso (destaque) a alerta (atenção).
function corZona(d: Nivel, p: Nivel): string {
  const s = idxNivel[d] + idxNivel[p]
  if (s >= 4) return 'color-mix(in srgb, var(--color-sucesso) 18%, transparent)'
  if (s === 3) return 'color-mix(in srgb, var(--color-sucesso) 10%, transparent)'
  if (s === 2) return 'color-mix(in srgb, var(--color-juncao) 8%, transparent)'
  if (s === 1) return 'color-mix(in srgb, var(--color-alerta) 9%, transparent)'
  return 'color-mix(in srgb, var(--color-alerta) 16%, transparent)'
}

const selectCls =
  'rounded-full border-2 border-borda bg-creme px-4 py-2 text-sm font-bold text-tinta outline-none focus:border-juncao'

// Ficha do liderado (com o gestor embaixo). Clicável: abre o dossiê do liderado (visão
// total do RH — só leitura). A posse no backend libera o RH do tenant.
function Ficha({ id, nome, gestor }: { id: string; nome: string; gestor: string }) {
  return (
    <Link
      to={`/liderado/${id}/dossie`}
      className="flex items-center gap-2 rounded-full border border-borda bg-creme py-1 pl-1 pr-3 shadow-[var(--shadow-cartao)] transition hover:border-juncao"
      title={`Abrir o dossiê de ${nome} · gestor: ${gestor}`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-liderado/20 text-[0.65rem] font-bold text-liderado">
        {nome.charAt(0).toUpperCase()}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="max-w-28 truncate text-xs font-bold text-tinta">{nome.split(' ')[0]}</span>
        <span className="max-w-28 truncate text-[0.6rem] text-tinta-suave">{gestor.split(' ')[0]}</span>
      </span>
    </Link>
  )
}

// Seção reutilizável (sem LayoutApp) — embutida no painel do RH e na rota /rh/matrix.
export function SecaoMatrixRH() {
  const [itens, setItens] = useState<MatrixItemRH[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [fGestor, setFGestor] = useState('')
  const [fEquipe, setFEquipe] = useState('')

  useEffect(() => {
    matrixDoRH()
      .then(setItens)
      .catch((e) => setErro(extrairMensagemErro(e)))
      .finally(() => setCarregando(false))
  }, [])

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

  const { porCelula, naoClassificados } = useMemo(() => {
    const porCelula: Record<string, MatrixItemRH[]> = {}
    const naoClassificados: MatrixItemRH[] = []
    for (const i of filtrados) {
      if (i.desempenho && i.potencial) (porCelula[`${i.desempenho}-${i.potencial}`] ??= []).push(i)
      else naoClassificados.push(i)
    }
    return { porCelula, naoClassificados }
  }, [filtrados])

  const destaques = (porCelula['ALTO-ALTO'] ?? []).length
  const riscos = (porCelula['BAIXO-BAIXO'] ?? []).length

  return (
    <section className="mb-12">
      <div className="mb-4">
        <h2 className="fonte-display text-xl font-extrabold text-tinta sm:text-2xl">🎯 Matrix9-Box da empresa</h2>
        <p className="mt-1 text-tinta-suave">Todos os liderados no 9-box (desempenho × potencial). Visão consolidada — a classificação é feita por cada gestor.</p>
      </div>

      {/* Badges + filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sucesso/15 px-3 py-1 text-sm font-bold text-sucesso">⭐ {destaques} destaque(s)</span>
        <span className="rounded-full bg-alerta/10 px-3 py-1 text-sm font-bold text-alerta">⚠️ {riscos} em atenção</span>
        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
          <select value={fGestor} onChange={(e) => { setFGestor(e.target.value); setFEquipe('') }} className={selectCls} title="Filtrar por gestor">
            <option value="">Todos os gestores</option>
            {gestores.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
          </select>
          <select value={fEquipe} onChange={(e) => setFEquipe(e.target.value)} className={selectCls} title="Filtrar por equipe">
            <option value="">Todas as equipes</option>
            {equipes.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>
      </div>

      {carregando && <p className="text-tinta-suave">Carregando…</p>}
      {erro && <p className="font-medium text-alerta">{erro}</p>}

      {!carregando && !erro && (
        <>
          {/* A classificar */}
          {naoClassificados.length > 0 && (
            <div className="mb-6 rounded-[var(--radius-cartao)] border-2 border-dashed border-borda bg-creme/40 p-4">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-tinta-suave">
                A classificar ({naoClassificados.length}) — cada gestor classifica no 9-box dele
              </span>
              <div className="flex flex-wrap gap-2">
                {naoClassificados.map((i) => <Ficha key={i.colaborador_id} id={i.colaborador_id} nome={i.liderado_nome} gestor={i.gestor_nome} />)}
              </div>
            </div>
          )}

          {/* Grade 3×3 */}
          <div className="flex gap-1.5 sm:gap-3">
            <div className="flex w-6 flex-col items-center justify-around">
              <span className="rotate-180 text-xs font-bold uppercase tracking-wider text-tinta-suave [writing-mode:vertical-rl]">Potencial →</span>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                {POTENCIAIS.map((pot) =>
                  NIVEIS.map((des) => {
                    const fichas = porCelula[`${des}-${pot}`] ?? []
                    return (
                      <div
                        key={`${des}-${pot}`}
                        style={{ backgroundColor: corZona(des, pot) }}
                        className="flex min-h-24 flex-col gap-2 rounded-[var(--radius-cartao)] border-2 border-transparent p-1.5 sm:min-h-32 sm:p-3"
                      >
                        <span className="text-xs font-bold uppercase tracking-wider text-tinta-suave">{ROTULOS[`${des}-${pot}`]} · {fichas.length}</span>
                        <div className="flex flex-wrap content-start gap-1.5">
                          {fichas.map((i) => <Ficha key={i.colaborador_id} id={i.colaborador_id} nome={i.liderado_nome} gestor={i.gestor_nome} />)}
                        </div>
                      </div>
                    )
                  }),
                )}
              </div>
              <div className="mt-2 grid grid-cols-3 text-center text-xs font-bold uppercase tracking-wider text-tinta-suave">
                {NIVEIS.map((n) => <span key={n}>{nomeNivel[n]}</span>)}
              </div>
              <p className="mt-1 text-center text-xs font-bold uppercase tracking-wider text-tinta-suave">Desempenho →</p>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

// Página standalone (rota /rh/matrix) — a mesma seção dentro do layout.
export function PaginaRHMatrix() {
  return (
    <LayoutApp>
      <SecaoMatrixRH />
    </LayoutApp>
  )
}
