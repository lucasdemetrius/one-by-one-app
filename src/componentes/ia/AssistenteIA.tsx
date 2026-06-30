// Arquivo: src/componentes/ia/AssistenteIA.tsx
// Descrição: Assistente de IA flutuante (canto inferior DIREITO) do gestor.
//            • Sem IA conectada: o botão aparece DESABILITADO e convida a configurar.
//            • Com IA conectada: abre um chat em painel sobre a tela atual, com
//              opção de EXPANDIR (tela cheia) e várias CONVERSAS salvas no navegador
//              (histórico tipo claude.ai). Usa POST /ia/chat com o histórico recente
//              embutido para dar contexto à resposta.

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { extrairMensagemErro } from '@/lib/api'
import { useChatIA, useConfigIA } from '@/recursos/ia/iaApi'
import { useConversasIA } from '@/recursos/ia/conversas'
import type { MsgIA } from '@/recursos/ia/conversas'

const SUGESTOES = [
  'O que perguntar num 1:1 com alguém desmotivado?',
  'Como dar um feedback difícil com gentileza?',
  'Monte uma pauta de 1:1 para um liderado novo.',
  'Ideias para reconhecer uma boa entrega.',
]

// Monta o prompt enviado ao backend embutindo o histórico recente (contexto).
function montarPrompt(historico: MsgIA[], pergunta: string): string {
  if (historico.length === 0) return pergunta
  const transcrito = historico
    .map((m) => (m.papel === 'voce' ? 'Gestor' : 'Assistente') + ': ' + m.texto)
    .join('\n')
  return `Contexto da conversa até aqui:\n${transcrito}\n\nNova mensagem do gestor: ${pergunta}`
}

export function AssistenteIA() {
  const [aberto, setAberto] = useState(false)
  const [expandido, setExpandido] = useState(false)
  const [mostrarLista, setMostrarLista] = useState(false) // lista de conversas (modo canto)
  const [mostrarDica, setMostrarDica] = useState(false) // dica quando IA não configurada
  const [conversaId, setConversaId] = useState<string | null>(null)
  const [pendenteEm, setPendenteEm] = useState<string | null>(null) // conversa aguardando resposta
  const [texto, setTexto] = useState('')
  const fimRef = useRef<HTMLDivElement>(null)

  const configQ = useConfigIA()
  const chat = useChatIA()
  const { conversas, criar, adicionarMensagem, remover } = useConversasIA()
  const temIA = configQ.data?.tem_chave ?? false

  const conversa = useMemo(() => conversas.find((c) => c.id === conversaId) ?? null, [conversas, conversaId])
  const mensagens = conversa?.mensagens ?? []

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens.length, chat.isPending, aberto, expandido])

  function abrir() {
    if (!temIA) {
      setMostrarDica((v) => !v)
      return
    }
    setAberto(true)
    // Ao abrir, retoma a conversa mais recente (se houver).
    if (!conversaId && conversas.length > 0) setConversaId(conversas[0].id)
  }

  function novaConversa() {
    const id = criar()
    setConversaId(id)
    setMostrarLista(false)
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    const pergunta = texto.trim()
    if (!pergunta || chat.isPending) return

    let id = conversaId
    if (!id) {
      id = criar()
      setConversaId(id)
    }
    // Histórico ANTES de acrescentar a nova fala (para o contexto).
    const historico = (conversas.find((c) => c.id === id)?.mensagens ?? []).slice(-10)
    adicionarMensagem(id, { papel: 'voce', texto: pergunta })
    setTexto('')
    setPendenteEm(id)
    try {
      const resposta = await chat.mutateAsync(montarPrompt(historico, pergunta))
      adicionarMensagem(id, { papel: 'ia', texto: resposta })
    } catch (err) {
      adicionarMensagem(id, { papel: 'ia', texto: `⚠️ ${extrairMensagemErro(err)}` })
    } finally {
      setPendenteEm(null)
    }
  }

  // ── Sub-render: lista de conversas (sidebar no expandido, painel no canto) ──
  const listaConversas = (
    <div className="flex h-full flex-col">
      <button
        type="button"
        onClick={novaConversa}
        className="gradiente-marca m-3 flex items-center justify-center gap-2 rounded-full py-2 text-sm font-bold text-white"
      >
        ＋ Nova conversa
      </button>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {conversas.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-tinta-suave">Nenhuma conversa ainda.</p>
        ) : (
          conversas.map((c) => (
            <div
              key={c.id}
              className={[
                'group mb-1 flex items-center gap-2 rounded-[var(--radius-suave)] px-3 py-2 text-sm transition-colors',
                c.id === conversaId ? 'bg-juncao/10 font-bold text-tinta' : 'text-tinta-suave hover:bg-areia-escura',
              ].join(' ')}
            >
              <button
                type="button"
                onClick={() => {
                  setConversaId(c.id)
                  setMostrarLista(false)
                }}
                className="flex-1 truncate text-left"
              >
                {c.titulo}
              </button>
              <button
                type="button"
                onClick={() => {
                  remover(c.id)
                  if (conversaId === c.id) setConversaId(null)
                }}
                aria-label="Apagar conversa"
                className="shrink-0 text-tinta-suave/40 opacity-0 transition group-hover:opacity-100 hover:text-alerta"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )

  // ── Sub-render: corpo do chat (mensagens + input) ──
  const corpoChat = (
    <>
      <div className="flex-1 overflow-y-auto p-4">
        {mensagens.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="text-4xl">👋</span>
            <p className="mt-2 text-sm text-tinta-suave">Sou seu copiloto de 1:1. Comece por uma ideia:</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTexto(s)}
                  className="rounded-full border border-borda bg-creme px-3 py-1.5 text-xs font-medium text-tinta-suave transition hover:border-juncao hover:text-juncao"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {mensagens.map((m, i) => (
              <div
                key={i}
                className={[
                  'max-w-[85%] whitespace-pre-wrap rounded-[var(--radius-suave)] px-3.5 py-2.5 text-sm leading-relaxed',
                  m.papel === 'voce'
                    ? 'gradiente-marca self-end text-white'
                    : 'self-start border border-borda bg-creme text-tinta',
                ].join(' ')}
              >
                {m.texto}
              </div>
            ))}
            {chat.isPending && pendenteEm === conversaId && (
              <div className="self-start rounded-[var(--radius-suave)] border border-borda bg-creme px-3.5 py-2.5 text-sm text-tinta-suave">
                pensando…
              </div>
            )}
            <div ref={fimRef} />
          </div>
        )}
      </div>

      <form onSubmit={enviar} className="flex gap-2 border-t border-borda bg-creme p-3">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pergunte ao assistente…"
          className="flex-1 rounded-full border-2 border-borda bg-areia px-3.5 py-2 text-sm text-tinta outline-none focus:border-juncao"
        />
        <button
          type="submit"
          disabled={!texto.trim() || chat.isPending}
          className="gradiente-marca flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-50"
          aria-label="Enviar"
        >
          ➤
        </button>
      </form>
    </>
  )

  // Cabeçalho do painel (botões mudam conforme canto/expandido).
  const cabecalho = (
    <header className="gradiente-marca flex items-center gap-2 px-4 py-3 text-white">
      {!expandido && (
        <button type="button" onClick={() => setMostrarLista((v) => !v)} aria-label="Conversas" className="text-white/85 hover:text-white">
          ☰
        </button>
      )}
      <span className="fonte-display flex-1 truncate font-bold">{conversa?.titulo ?? '✨ Assistente'}</span>
      <button type="button" onClick={novaConversa} title="Nova conversa" aria-label="Nova conversa" className="text-white/85 hover:text-white">
        ＋
      </button>
      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        title={expandido ? 'Recolher' : 'Expandir'}
        aria-label={expandido ? 'Recolher chat' : 'Expandir chat'}
        className="text-white/85 hover:text-white"
      >
        {expandido ? '⤓' : '⤢'}
      </button>
      <button
        type="button"
        onClick={() => {
          setAberto(false)
          setExpandido(false)
          setMostrarLista(false)
        }}
        aria-label="Fechar"
        className="text-white/85 hover:text-white"
      >
        ✕
      </button>
    </header>
  )

  return (
    <>
      {/* Botão flutuante (canto inferior DIREITO), um pouco acima do chão para o
          botão de Feedback (bottom-5 right-5) caber LOGO ABAIXO dele, empilhados. */}
      <div className="fixed bottom-20 right-5 z-50 flex flex-col items-end gap-3">
        {/* Dica quando a IA não está configurada */}
        <AnimatePresence>
          {mostrarDica && !temIA && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="w-60 rounded-[var(--radius-cartao)] border-2 border-borda bg-areia p-4 text-center shadow-[var(--shadow-flutuante)]"
            >
              <span className="text-3xl">🔌</span>
              <p className="mt-1 text-sm text-tinta-suave">Conecte sua IA no perfil para conversar com o assistente.</p>
              <Link
                to="/perfil"
                onClick={() => setMostrarDica(false)}
                className="gradiente-marca mt-3 inline-block rounded-full px-4 py-2 text-sm font-bold text-white"
              >
                Conectar IA
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Painel de chat no CANTO (quando não expandido) */}
        <AnimatePresence>
          {aberto && !expandido && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="relative flex h-[34rem] max-h-[calc(100vh-7rem)] w-[24rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-[var(--radius-cartao)] border-2 border-borda bg-areia shadow-[var(--shadow-flutuante)]"
            >
              {cabecalho}
              {corpoChat}
              {/* Lista de conversas desliza por cima no modo canto */}
              <AnimatePresence>
                {mostrarLista && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'tween', duration: 0.2 }}
                    className="absolute inset-y-0 left-0 z-10 w-64 border-r border-borda bg-areia shadow-[var(--shadow-flutuante)]"
                  >
                    {listaConversas}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão flutuante */}
        <motion.button
          type="button"
          onClick={abrir}
          whileHover={{ scale: temIA ? 1.05 : 1 }}
          whileTap={{ scale: temIA ? 0.95 : 1 }}
          aria-label={temIA ? 'Assistente de IA' : 'Assistente de IA (desconectado)'}
          title={temIA ? 'Assistente de IA' : 'Conecte sua IA no perfil'}
          className={[
            'flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-[var(--shadow-flutuante)] transition',
            temIA ? 'gradiente-marca text-white' : 'cursor-not-allowed border-2 border-borda bg-areia text-tinta-suave/50 grayscale',
          ].join(' ')}
        >
          ✨
        </motion.button>
      </div>

      {/* Painel EXPANDIDO (tela cheia, com sidebar de conversas) */}
      <AnimatePresence>
        {aberto && expandido && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-tinta/30 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="flex h-[85vh] w-full max-w-5xl overflow-hidden rounded-[var(--radius-cartao)] border-2 border-borda bg-areia shadow-[var(--shadow-flutuante)]"
            >
              <aside className="hidden w-72 shrink-0 border-r border-borda bg-creme/40 sm:block">{listaConversas}</aside>
              <div className="flex min-w-0 flex-1 flex-col">
                {cabecalho}
                {corpoChat}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
