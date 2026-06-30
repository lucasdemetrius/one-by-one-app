// Arquivo: src/componentes/ajuda/ChatAjuda.tsx
// Descrição: Chat do assistente de IA da Central de Ajuda. Responde dúvidas sobre como usar
//            o OneByOne (o backend conhece o produto). Funciona para qualquer papel: usa a
//            chave de IA da plataforma e, se não houver, a BYOK do gestor; sem nenhuma,
//            mostra uma resposta amigável apontando para os guias. Mantém a conversa em
//            memória e embute o histórico recente para dar contexto às respostas.

import { useEffect, useRef, useState } from 'react'

import { usePerguntarAjuda, useStatusIAAjuda } from '@/recursos/ajuda/ajudaApi'
import { extrairMensagemErro } from '@/lib/api'

interface Msg {
  papel: 'voce' | 'ia'
  texto: string
}

const SUGESTOES = [
  'Como convido um liderado?',
  'Como funciona a pauta do 1:1?',
  'O que é a matriz 9-box?',
  'Como agendar 1:1 recorrentes?',
]

// Embute o histórico recente para dar contexto à resposta.
function montarPrompt(historico: Msg[], pergunta: string): string {
  if (historico.length === 0) return pergunta
  const transcrito = historico
    .slice(-8)
    .map((m) => (m.papel === 'voce' ? 'Usuário' : 'Assistente') + ': ' + m.texto)
    .join('\n')
  return `Contexto da conversa até aqui:\n${transcrito}\n\nNova pergunta: ${pergunta}`
}

export function ChatAjuda() {
  const status = useStatusIAAjuda()
  const perguntar = usePerguntarAjuda()
  const [mensagens, setMensagens] = useState<Msg[]>([])
  const [texto, setTexto] = useState('')
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens.length, perguntar.isPending])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    const pergunta = texto.trim()
    if (!pergunta || perguntar.isPending) return

    const historico = mensagens
    setMensagens((m) => [...m, { papel: 'voce', texto: pergunta }])
    setTexto('')
    try {
      const r = await perguntar.mutateAsync(montarPrompt(historico, pergunta))
      setMensagens((m) => [...m, { papel: 'ia', texto: r.resposta }])
    } catch (err) {
      setMensagens((m) => [...m, { papel: 'ia', texto: `⚠️ ${extrairMensagemErro(err)}` }])
    }
  }

  const indisponivel = status.data?.ia_disponivel === false

  return (
    <div className="overflow-hidden rounded-[var(--radius-cartao)] border border-borda bg-creme shadow-[var(--shadow-cartao)]">
      {/* Cabeçalho */}
      <div className="gradiente-marca flex items-center gap-2 px-5 py-3 text-white">
        <span className="text-lg">✨</span>
        <span className="fonte-display font-bold">Pergunte à IA</span>
        <span className="ml-auto text-xs text-white/80">tire dúvidas sobre o OneByOne</span>
      </div>

      {/* Mensagens */}
      <div className="max-h-80 min-h-[7rem] overflow-y-auto p-4">
        {mensagens.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-3 text-center">
            <p className="text-sm text-tinta-suave">
              {indisponivel
                ? 'Você pode perguntar — e também explorar os guias abaixo. 💜'
                : 'Pergunte com suas palavras como fazer algo no OneByOne.'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTexto(s)}
                  className="rounded-full border border-borda bg-areia px-3 py-1.5 text-xs font-medium text-tinta-suave transition hover:border-juncao hover:text-juncao"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mensagens.map((m, i) => (
              <div
                key={i}
                className={[
                  'max-w-[85%] whitespace-pre-wrap rounded-[var(--radius-suave)] px-3.5 py-2.5 text-sm leading-relaxed',
                  m.papel === 'voce' ? 'gradiente-marca self-end text-white' : 'self-start border border-borda bg-areia text-tinta',
                ].join(' ')}
              >
                {m.texto}
              </div>
            ))}
            {perguntar.isPending && (
              <div className="self-start rounded-[var(--radius-suave)] border border-borda bg-areia px-3.5 py-2.5 text-sm text-tinta-suave">
                pensando…
              </div>
            )}
            <div ref={fimRef} />
          </div>
        )}
      </div>

      {/* Entrada */}
      <form onSubmit={enviar} className="flex gap-2 border-t border-borda p-3">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={1000}
          placeholder="Escreva sua dúvida…"
          className="flex-1 rounded-full border-2 border-borda bg-areia px-4 py-2 text-sm text-tinta outline-none transition-colors placeholder:text-tinta-suave/60 focus:border-juncao"
        />
        <button
          type="submit"
          disabled={!texto.trim() || perguntar.isPending}
          aria-label="Enviar pergunta"
          className="gradiente-marca flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-50"
        >
          ➤
        </button>
      </form>
    </div>
  )
}
