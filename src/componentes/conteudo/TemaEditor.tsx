// Arquivo: src/componentes/conteudo/TemaEditor.tsx
// Descrição: Editor de conteúdo de um tema (por liderado). Painel lateral (drawer)
//            que lista os blocos e permite adicionar texto, link/curso, imagem
//            (upload S3) e marco com datas — a "mini-apresentação" do tema.

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

import { extrairMensagemErro } from '@/lib/api'
import { useConfirmar } from '@/componentes/ui/Confirmacao'
import {
  criarBloco,
  criarBlocoImagem,
  deletarBloco,
  listarBlocos,
} from '@/recursos/conteudo/conteudoApi'
import type { Bloco } from '@/recursos/conteudo/conteudoApi'

interface TemaEditorProps {
  colaboradorId: string
  tema: string
  aoFechar: () => void
  // Avisa o pai (a página ao vivo) que o conteúdo deste tema mudou, para ele
  // retransmitir o sinal aos outros participantes via WebSocket.
  aoMudarConteudo?: (tema: string) => void
  // Sinal vindo de outro participante: quando muda e o tema bate com o aberto,
  // recarregamos os blocos. { tema: título alterado, n: contador que incrementa }.
  sinalExterno?: { tema: string; n: number }
  // Entra no modo apresentação (read-only, tela cheia) deste tema, ao vivo.
  aoApresentar?: (tema: string) => void
}

// Tipo de bloco que está sendo adicionado no momento (ou null).
type Adicionando = 'TEXTO' | 'LINK' | 'MARCO' | 'IMAGEM' | null

// Formata "YYYY-MM-DD" para "DD/MM/YYYY".
function dataBR(iso: string | null): string {
  if (!iso) return ''
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

export function TemaEditor({
  colaboradorId,
  tema,
  aoFechar,
  aoMudarConteudo,
  sinalExterno,
  aoApresentar,
}: TemaEditorProps) {
  const [blocos, setBlocos] = useState<Bloco[]>([])
  const [carregando, setCarregando] = useState(true)
  const [adicionando, setAdicionando] = useState<Adicionando>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Campos do formulário de adicionar.
  const [texto, setTexto] = useState('')
  const [url, setUrl] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const confirmar = useConfirmar()

  // Fecha o editor com a tecla Esc (consistente com os demais overlays).
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoFechar])

  // Guarda de sequência: como recarregar() pode ser chamado por dois caminhos
  // (troca de tema e sinal ao vivo), um fetch lento poderia resolver depois de
  // um mais novo e sobrescrever a lista. Só aplicamos a resposta da chamada mais
  // recente (a que tem o maior número de sequência).
  const seqRecarga = useRef(0)

  async function recarregar() {
    const seq = ++seqRecarga.current
    setCarregando(true)
    try {
      const lista = await listarBlocos(colaboradorId, tema)
      if (seq === seqRecarga.current) {
        setBlocos(lista)
      }
    } finally {
      if (seq === seqRecarga.current) {
        setCarregando(false)
      }
    }
  }

  useEffect(() => {
    recarregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colaboradorId, tema])

  // Recarrega quando OUTRO participante mexeu no conteúdo deste mesmo tema.
  // O contador `n` muda a cada aviso recebido; só recarregamos se o tema bate.
  useEffect(() => {
    if (sinalExterno && sinalExterno.n > 0 && sinalExterno.tema === tema) {
      recarregar()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sinalExterno?.n])

  function limparForm() {
    setTexto('')
    setUrl('')
    setDataInicio('')
    setDataFim('')
    setArquivo(null)
    setErro('')
    setAdicionando(null)
  }

  async function adicionar() {
    setErro('')
    setSalvando(true)
    try {
      if (adicionando === 'IMAGEM') {
        if (!arquivo) {
          setErro('Escolha uma imagem.')
          return
        }
        await criarBlocoImagem(colaboradorId, tema, texto, arquivo)
      } else if (adicionando) {
        await criarBloco(colaboradorId, {
          tema,
          tipo: adicionando,
          texto: texto || undefined,
          url: url || undefined,
          data_inicio: dataInicio || undefined,
          data_fim: dataFim || undefined,
        })
      }
      limparForm()
      await recarregar()
      // Avisa os outros participantes da sala que este tema mudou.
      aoMudarConteudo?.(tema)
    } catch (e) {
      setErro(extrairMensagemErro(e))
    } finally {
      setSalvando(false)
    }
  }

  async function remover(id: string) {
    const ok = await confirmar({
      emoji: '🗑️',
      perigoso: true,
      titulo: 'Remover este conteúdo?',
      mensagem: 'O item sai do tema. Esta ação não pode ser desfeita.',
      textoConfirmar: 'Remover',
    })
    if (!ok) return
    try {
      await deletarBloco(colaboradorId, id)
      await recarregar()
      // Avisa os outros participantes da sala que este tema mudou.
      aoMudarConteudo?.(tema)
    } catch (e) {
      setErro(extrairMensagemErro(e))
    }
  }

  const tipos: { id: Adicionando; rotulo: string }[] = [
    { id: 'TEXTO', rotulo: '📝 Texto' },
    { id: 'LINK', rotulo: '🔗 Link / curso' },
    { id: 'IMAGEM', rotulo: '🖼️ Imagem' },
    { id: 'MARCO', rotulo: '📅 Marco' },
  ]

  return createPortal(
    <div className="fixed inset-0 z-[70] flex justify-end">
      {/* Fundo escurecido */}
      <div className="absolute inset-0 bg-tinta/40 backdrop-blur-sm" onClick={aoFechar} />

      {/* Drawer lateral */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="relative flex h-full w-full max-w-xl flex-col bg-areia shadow-[var(--shadow-flutuante)]"
      >
        {/* Cabeçalho */}
        <header className="flex items-center justify-between border-b border-borda bg-creme px-6 py-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-juncao">
              Conteúdo do tema
            </span>
            <h2 className="fonte-display text-xl font-bold text-tinta">{tema}</h2>
          </div>
          <div className="flex items-center gap-2">
            {aoApresentar && (
              <button
                type="button"
                onClick={() => aoApresentar(tema)}
                title="Apresentar ao vivo (tela cheia)"
                className="gradiente-marca rounded-full px-3.5 py-1.5 text-sm font-bold text-white shadow-[0_6px_16px_-6px_var(--color-juncao)]"
              >
                ▶ Apresentar
              </button>
            )}
            <button
              type="button"
              onClick={aoFechar}
              aria-label="Fechar"
              className="flex h-9 w-9 items-center justify-center rounded-full text-tinta-suave hover:bg-areia-escura"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Lista de blocos */}
        <div className="flex-1 overflow-y-auto p-6">
          {carregando ? (
            <p className="text-tinta-suave">Carregando…</p>
          ) : blocos.length === 0 ? (
            <p className="rounded-[var(--radius-cartao)] border-2 border-dashed border-borda bg-creme/50 p-6 text-center text-sm text-tinta-suave">
              Ainda não há conteúdo neste tema. Adicione textos, links, imagens ou marcos abaixo.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {blocos.map((b) => (
                <article
                  key={b.id}
                  className="group relative rounded-[var(--radius-cartao)] border border-borda bg-creme p-4 shadow-[var(--shadow-cartao)]"
                >
                  <button
                    type="button"
                    onClick={() => remover(b.id)}
                    aria-label="Remover"
                    className="absolute right-3 top-3 text-tinta-suave/40 opacity-0 transition hover:text-alerta group-hover:opacity-100"
                  >
                    ✕
                  </button>

                  {b.tipo === 'TEXTO' && (
                    <p className="whitespace-pre-wrap pr-6 text-tinta">{b.texto}</p>
                  )}

                  {b.tipo === 'LINK' && (
                    <a
                      href={b.url ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 pr-6 font-semibold text-gestor hover:underline"
                    >
                      🔗 {b.texto || b.url}
                    </a>
                  )}

                  {b.tipo === 'IMAGEM' && (
                    <figure>
                      {b.imagem_url && (
                        <img
                          src={b.imagem_url}
                          alt={b.texto ?? 'imagem do tema'}
                          className="max-h-72 w-full rounded-[var(--radius-suave)] object-cover"
                        />
                      )}
                      {b.texto && (
                        <figcaption className="mt-2 text-sm text-tinta-suave">{b.texto}</figcaption>
                      )}
                    </figure>
                  )}

                  {b.tipo === 'MARCO' && (
                    <div className="pr-6">
                      <p className="font-semibold text-tinta">📌 {b.texto}</p>
                      {(b.data_inicio || b.data_fim) && (
                        <p className="mt-1 text-sm text-tinta-suave">
                          📅 {dataBR(b.data_inicio)}
                          {b.data_fim ? ` → ${dataBR(b.data_fim)}` : ''}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Adicionar bloco */}
        <footer className="border-t border-borda bg-creme p-4">
          {!adicionando ? (
            <div className="flex flex-wrap gap-2">
              {tipos.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAdicionando(t.id)}
                  className="rounded-full border border-borda px-3.5 py-1.5 text-sm font-bold text-tinta transition hover:border-tinta"
                >
                  + {t.rotulo}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {adicionando === 'TEXTO' && (
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Escreva o texto…"
                  rows={3}
                  className="w-full rounded-[var(--radius-suave)] border-2 border-borda bg-areia px-3 py-2 text-sm text-tinta outline-none focus:border-juncao"
                />
              )}

              {adicionando === 'LINK' && (
                <>
                  <input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Nome (ex.: Curso de Liderança)"
                    className="w-full rounded-[var(--radius-suave)] border-2 border-borda bg-areia px-3 py-2 text-sm text-tinta outline-none focus:border-juncao"
                  />
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://…"
                    className="w-full rounded-[var(--radius-suave)] border-2 border-borda bg-areia px-3 py-2 text-sm text-tinta outline-none focus:border-juncao"
                  />
                </>
              )}

              {adicionando === 'MARCO' && (
                <>
                  <input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Descrição do marco"
                    className="w-full rounded-[var(--radius-suave)] border-2 border-borda bg-areia px-3 py-2 text-sm text-tinta outline-none focus:border-juncao"
                  />
                  <div className="flex gap-2">
                    <label className="flex-1 text-xs font-bold uppercase tracking-wider text-tinta-suave">
                      Início
                      <input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="mt-1 w-full rounded-[var(--radius-suave)] border-2 border-borda bg-areia px-3 py-2 text-sm font-normal text-tinta outline-none focus:border-juncao"
                      />
                    </label>
                    <label className="flex-1 text-xs font-bold uppercase tracking-wider text-tinta-suave">
                      Fim
                      <input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="mt-1 w-full rounded-[var(--radius-suave)] border-2 border-borda bg-areia px-3 py-2 text-sm font-normal text-tinta outline-none focus:border-juncao"
                      />
                    </label>
                  </div>
                </>
              )}

              {adicionando === 'IMAGEM' && (
                <>
                  {/* Botão de escolher o arquivo: um <label> estilizado que
                      dispara o seletor nativo (escondido). Fica claro e visível,
                      diferente do <input type="file"> cru que passava batido. */}
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[var(--radius-suave)] border-2 border-dashed border-juncao/50 bg-juncao/5 px-4 py-5 text-center text-sm font-bold text-juncao transition hover:border-juncao hover:bg-juncao/10">
                    <span className="text-2xl">📎</span>
                    {arquivo ? 'Trocar imagem' : 'Escolher imagem do computador'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                  </label>
                  {arquivo && (
                    <p className="truncate text-xs text-tinta-suave">
                      Selecionado: <strong className="text-tinta">{arquivo.name}</strong>
                    </p>
                  )}
                  <input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Legenda (opcional)"
                    className="w-full rounded-[var(--radius-suave)] border-2 border-borda bg-areia px-3 py-2 text-sm text-tinta outline-none focus:border-juncao"
                  />
                </>
              )}

              {erro && <span className="text-sm font-medium text-alerta">{erro}</span>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={adicionar}
                  disabled={salvando}
                  className="gradiente-marca rounded-[var(--radius-suave)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {salvando
                    ? adicionando === 'IMAGEM'
                      ? 'Enviando…'
                      : 'Salvando…'
                    : adicionando === 'IMAGEM'
                      ? 'Enviar imagem'
                      : 'Adicionar'}
                </button>
                <button
                  type="button"
                  onClick={limparForm}
                  className="rounded-[var(--radius-suave)] border-2 border-borda px-4 py-2 text-sm font-bold text-tinta"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </footer>
      </motion.div>
    </div>,
    document.body,
  )
}
