// Arquivo: src/componentes/estrutura/ImportarLiderados.tsx
// Descrição: Drawer de importação de liderados em lote (CSV). O gestor escolhe a
//            equipe-alvo, cola/sobe um CSV (nome,email), vê uma PRÉVIA validada
//            (linha boa x linha com problema) e confirma. O backend valida de novo
//            linha a linha (POST /importar-liderados) e devolve criados + erros.
//            Sem alert/confirm nativo — tudo no drawer, com estados visuais.

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Drawer } from '@/componentes/ui/Drawer'
import { useEquipes } from '@/recursos/time/hooks'
import { importarLiderados, type ResultadoImport } from '@/recursos/time/timeApi'
import type { Organizacao } from '@/recursos/time/tipos'
import { extrairMensagemErro } from '@/lib/api'

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface LinhaPreview {
  nome: string
  email: string
  valido: boolean
}

// Quebra o texto CSV em linhas {nome, email, valido}. Robusto a:
// - BOM do Excel (﻿, que o trim() não remove);
// - vírgula no nome / ordem das colunas: acha a célula que PARECE e-mail e usa o
//   resto (juntado) como nome — funciona com "Sobrenome, Nome, email" e "email, nome";
// - vírgula ou ponto-e-vírgula como separador; aspas nas bordas das células.
// Descarta um cabeçalho (ex.: "nome,email") se a 1ª linha não tiver e-mail válido.
function parsearCsv(texto: string): LinhaPreview[] {
  const limpo = texto.replace(/^﻿/, '')
  const delim = (limpo.match(/;/g)?.length ?? 0) > (limpo.match(/,/g)?.length ?? 0) ? ';' : ','
  const linhas = limpo
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const celulas = l.split(delim).map((p) => p.trim().replace(/^"|"$/g, ''))
      const idxEmail = celulas.findIndex((c) => RE_EMAIL.test(c))
      const email = idxEmail >= 0 ? celulas[idxEmail] : (celulas[1] ?? '')
      const nome = (idxEmail >= 0 ? celulas.filter((_, i) => i !== idxEmail) : [celulas[0] ?? '']).join(' ').trim()
      return { nome, email }
    })
  // Descarta cabeçalho: primeira linha sem e-mail válido e com cara de título.
  if (linhas.length && !RE_EMAIL.test(linhas[0].email) && /nome|name|e-?mail/i.test(linhas[0].nome + linhas[0].email)) {
    linhas.shift()
  }
  return linhas.map((r) => ({ ...r, valido: r.nome.length >= 2 && RE_EMAIL.test(r.email) }))
}

export function ImportarLiderados({ org, aoFechar }: { org: Organizacao; aoFechar: () => void }) {
  const qc = useQueryClient()
  const equipesQ = useEquipes(org.id)
  const equipes = equipesQ.data ?? []

  const [equipeID, setEquipeID] = useState('')
  const [texto, setTexto] = useState('')
  const [preview, setPreview] = useState<LinhaPreview[] | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState<ResultadoImport | null>(null)

  const equipeAtual = equipeID || equipes[0]?.id || ''
  const validos = (preview ?? []).filter((l) => l.valido)
  const invalidos = (preview ?? []).filter((l) => !l.valido)

  async function aoArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setTexto(await arquivo.text())
    setPreview(null)
    setResultado(null)
  }

  function previsualizar() {
    setErro('')
    setResultado(null)
    setPreview(parsearCsv(texto))
  }

  async function importar() {
    if (!equipeAtual || validos.length === 0) return
    setEnviando(true)
    setErro('')
    try {
      const res = await importarLiderados({
        organizacao_id: org.id,
        equipe_id: equipeAtual,
        itens: validos.map((l) => ({ nome: l.nome, email: l.email })),
      })
      setResultado(res)
      qc.invalidateQueries({ queryKey: ['colaboradores', org.id] })
      qc.invalidateQueries({ queryKey: ['equipes', org.id] })
    } catch (e) {
      setErro(extrairMensagemErro(e))
    } finally {
      setEnviando(false)
    }
  }

  const campo = 'w-full rounded-[var(--radius-suave)] border-2 border-borda bg-creme px-3 py-2 text-sm text-tinta outline-none focus:border-juncao'

  return (
    <Drawer aoFechar={aoFechar} largura="max-w-lg">
      {(fechar) => (
        <>
          <header className="flex items-center justify-between border-b border-borda bg-creme px-5 py-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-juncao">📥 Importar</span>
              <h2 className="fonte-display text-xl font-extrabold text-tinta">Liderados em lote</h2>
            </div>
            <button type="button" onClick={fechar} aria-label="Fechar" className="flex h-9 w-9 items-center justify-center rounded-full text-tinta-suave hover:bg-areia-escura">✕</button>
          </header>

          <div className="flex-1 overflow-y-auto p-5">
            {/* Resultado do import */}
            {resultado ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-[var(--radius-cartao)] border-2 border-borda bg-creme p-5 text-center">
                  <span className="text-4xl">{resultado.criados.length > 0 ? '🎉' : '🤔'}</span>
                  <p className="fonte-display mt-2 text-2xl font-extrabold text-tinta">
                    {resultado.criados.length === 0
                      ? 'Nenhum liderado importado'
                      : `${resultado.criados.length} ${resultado.criados.length === 1 ? 'liderado importado' : 'liderados importados'}`}
                  </p>
                  {resultado.erros.length > 0 && (
                    <p className="mt-1 text-sm text-tinta-suave">
                      {resultado.criados.length === 0 ? 'Veja os motivos abaixo.' : `${resultado.erros.length} ${resultado.erros.length === 1 ? 'linha ignorada' : 'linhas ignoradas'}`}
                    </p>
                  )}
                </div>
                {resultado.erros.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-tinta-suave">Linhas não importadas</p>
                    <ul className="flex flex-col gap-1.5">
                      {resultado.erros.map((e) => (
                        <li key={e.linha} className="flex items-center gap-2 rounded-[var(--radius-suave)] bg-areia px-3 py-2 text-sm">
                          <span className="text-alerta">⚠️</span>
                          <span className="flex-1 text-tinta"><strong>{e.nome || e.email}</strong> — {e.motivo}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setResultado(null); setPreview(null); setTexto('') }} className="flex-1 rounded-[var(--radius-suave)] border-2 border-borda py-2.5 text-sm font-bold text-tinta hover:border-juncao">Importar mais</button>
                  <button type="button" onClick={fechar} className="flex-1 gradiente-marca rounded-[var(--radius-suave)] py-2.5 text-sm font-bold text-white">Concluir</button>
                </div>
              </div>
            ) : equipes.length === 0 ? (
              <div className="rounded-[var(--radius-cartao)] border-2 border-dashed border-borda bg-creme/50 p-8 text-center">
                <span className="text-4xl">🗂️</span>
                <p className="mt-2 text-sm text-tinta-suave">Crie uma equipe primeiro para importar liderados nela.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Equipe-alvo */}
                <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-tinta-suave">
                  Equipe de destino
                  <select value={equipeAtual} onChange={(e) => setEquipeID(e.target.value)} className={campo}>
                    {equipes.map((eq) => (
                      <option key={eq.id} value={eq.id}>{eq.nome}</option>
                    ))}
                  </select>
                </label>

                {/* CSV: colar ou subir arquivo */}
                <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-tinta-suave">
                  Cole o CSV (uma linha por liderado: <span className="normal-case text-tinta">nome, email</span>)
                  <textarea
                    value={texto}
                    onChange={(e) => { setTexto(e.target.value); setPreview(null) }}
                    rows={6}
                    placeholder={'Ana Silva, ana@empresa.com\nBruno Costa, bruno@empresa.com'}
                    className={`${campo} font-normal`}
                  />
                </label>
                <div className="flex items-center gap-2 text-sm">
                  <label className="cursor-pointer rounded-[var(--radius-suave)] border-2 border-borda px-3 py-1.5 font-bold text-tinta hover:border-juncao">
                    📄 Escolher arquivo .csv
                    <input type="file" accept=".csv,.txt" onChange={aoArquivo} className="hidden" />
                  </label>
                  <button type="button" onClick={previsualizar} disabled={!texto.trim()} className="rounded-[var(--radius-suave)] border-2 border-borda px-3 py-1.5 font-bold text-tinta hover:border-juncao disabled:opacity-40">
                    👁️ Pré-visualizar
                  </button>
                </div>

                {/* Prévia validada */}
                {preview && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-tinta">
                      <span className="text-sucesso">{validos.length} ok</span>
                      {invalidos.length > 0 && <span className="text-tinta-suave"> · {invalidos.length} com problema</span>}
                    </p>
                    <ul className="scroll-fino max-h-56 overflow-y-auto rounded-[var(--radius-suave)] border border-borda">
                      {preview.map((l, i) => (
                        <li key={i} className={['flex items-center gap-2 border-b border-borda/50 px-3 py-1.5 text-sm last:border-0', l.valido ? '' : 'bg-alerta/5'].join(' ')}>
                          <span>{l.valido ? '✅' : '⚠️'}</span>
                          <span className="flex-1 truncate text-tinta">{l.nome || <em className="text-tinta-suave">sem nome</em>}</span>
                          <span className="truncate text-xs text-tinta-suave">{l.email || '—'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {erro && <span className="text-sm font-medium text-alerta">{erro}</span>}

                <button
                  type="button"
                  onClick={importar}
                  disabled={enviando || validos.length === 0}
                  className="gradiente-marca rounded-[var(--radius-suave)] py-3 text-sm font-bold text-white disabled:opacity-40"
                >
                  {enviando ? 'Importando…' : validos.length > 0 ? `Importar ${validos.length} ${validos.length === 1 ? 'liderado' : 'liderados'}` : 'Pré-visualize para importar'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </Drawer>
  )
}
