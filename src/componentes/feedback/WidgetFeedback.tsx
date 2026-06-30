// Arquivo: src/componentes/feedback/WidgetFeedback.tsx
// Descrição: Widget flutuante de feedback rápido — um clique para dizer se curtiu, não
//            curtiu ou se irritou, com um comentário opcional. Abre um painel lateral
//            (Drawer, o padrão do projeto em vez de modal). Registra a tela atual como
//            contexto para o painel de admin saber ONDE a pessoa reagiu. Aparece em todas
//            as telas internas (montado no LayoutApp).

import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Drawer } from '@/componentes/ui/Drawer'
import { Botao } from '@/componentes/ui/Botao'
import { enviarFeedback } from '@/recursos/feedback/feedbackApi'
import type { Reacao } from '@/recursos/feedback/feedbackApi'
import { extrairMensagemErro } from '@/lib/api'

// As 3 opções, cada uma com seu emoji e cor (tokens do tema).
const OPCOES: { reacao: Reacao; emoji: string; rotulo: string; cor: string }[] = [
  { reacao: 'CURTI', emoji: '👍', rotulo: 'Curti', cor: 'var(--color-sucesso)' },
  { reacao: 'NAO_CURTI', emoji: '👎', rotulo: 'Não curti', cor: 'var(--color-juncao)' },
  { reacao: 'IRRITADO', emoji: '😠', rotulo: 'Irritado', cor: 'var(--color-alerta)' },
]

// contextoDaRota deriva um rótulo curto da tela atual (primeiro segmento da URL), para o
// painel de admin agrupar "onde" as pessoas reagem.
function contextoDaRota(pathname: string): string {
  const seg = pathname.split('/').filter(Boolean)[0] ?? 'inicio'
  const mapa: Record<string, string> = {
    painel: 'painel',
    onebyone: '1a1',
    agenda: 'agenda',
    ajuda: 'ajuda',
    rh: 'rh',
    admin: 'admin',
    perfil: 'perfil',
    'matrix9-box': '9box',
    liderado: 'liderado',
  }
  return mapa[seg] ?? seg
}

export function WidgetFeedback() {
  const { pathname } = useLocation()
  const [aberto, setAberto] = useState(false)
  const [reacao, setReacao] = useState<Reacao | null>(null)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  // Volta o painel ao estado inicial (para a próxima abertura começar limpo).
  function resetar() {
    setReacao(null)
    setComentario('')
    setEnviando(false)
    setEnviado(false)
    setErro('')
  }

  async function aoEnviar() {
    if (!reacao) return
    setEnviando(true)
    setErro('')
    try {
      await enviarFeedback({
        reacao,
        comentario: comentario.trim() || undefined,
        contexto: contextoDaRota(pathname),
        pagina: pathname,
      })
      setEnviado(true)
    } catch (e) {
      setErro(extrairMensagemErro(e))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      {/* Botão flutuante no canto inferior DIREITO, no rodapé. O assistente de IA (quando
          existe, só p/ gestor) fica logo ACIMA dele (bottom-20); aqui ficamos no chão do
          canto. Para quem não tem IA, é o único flutuante — limpo no canto. */}
      <motion.button
        type="button"
        onClick={() => setAberto(true)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Enviar feedback"
        title="Conte o que você achou"
        className="fixed bottom-5 right-5 z-[60] flex h-12 items-center gap-2 rounded-full border-2 border-borda bg-creme px-4 text-tinta shadow-[var(--shadow-flutuante)] hover:border-juncao"
      >
        <span className="text-lg">💬</span>
        <span className="hidden text-sm font-bold sm:inline">Feedback</span>
      </motion.button>

      {aberto && (
        <Drawer
          aoFechar={() => {
            setAberto(false)
            resetar()
          }}
        >
          {(fechar) => (
            <div className="flex h-full flex-col">
              {/* Cabeçalho */}
              <div className="flex items-center justify-between border-b border-borda px-5 py-4">
                <h2 className="fonte-display text-lg font-extrabold text-tinta">Conte o que você achou 💬</h2>
                <button
                  type="button"
                  onClick={fechar}
                  aria-label="Fechar"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-tinta-suave transition-colors hover:bg-areia-escura hover:text-tinta"
                >
                  ✕
                </button>
              </div>

              {/* Corpo */}
              <div className="flex-1 overflow-y-auto px-5 py-5">
                {enviado ? (
                  // Estado de agradecimento.
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                      className="text-5xl"
                    >
                      💜
                    </motion.span>
                    <h3 className="fonte-display text-xl font-extrabold text-tinta">Valeu pelo feedback!</h3>
                    <p className="max-w-xs text-sm text-tinta-suave">
                      Sua opinião ajuda a deixar o OneByOne cada vez melhor para você e seu time.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mb-3 text-sm font-semibold text-tinta">Como está sendo sua experiência aqui?</p>
                    {/* As 3 reações */}
                    <div className="mb-5 grid grid-cols-3 gap-2.5">
                      {OPCOES.map((o) => {
                        const ativo = reacao === o.reacao
                        return (
                          <motion.button
                            key={o.reacao}
                            type="button"
                            onClick={() => setReacao(o.reacao)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="flex flex-col items-center gap-1.5 rounded-[var(--radius-cartao)] border-2 px-2 py-4 transition-colors"
                            style={{
                              borderColor: ativo ? o.cor : 'var(--color-borda)',
                              backgroundColor: ativo ? `color-mix(in srgb, ${o.cor} 14%, transparent)` : 'var(--color-creme)',
                            }}
                          >
                            <span className="text-3xl">{o.emoji}</span>
                            <span className="text-xs font-bold text-tinta">{o.rotulo}</span>
                          </motion.button>
                        )
                      })}
                    </div>

                    {/* Comentário opcional */}
                    <label className="mb-1.5 block text-sm font-semibold text-tinta" htmlFor="feedback-comentario">
                      Quer contar mais? <span className="font-normal text-tinta-suave">(opcional)</span>
                    </label>
                    <textarea
                      id="feedback-comentario"
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="O que funcionou bem? O que te incomodou?"
                      className="w-full resize-none rounded-[var(--radius-suave)] border-2 border-borda bg-creme px-4 py-3 text-tinta outline-none transition-colors placeholder:text-tinta-suave/60 focus:border-juncao"
                    />
                    <div className="mt-1 text-right text-[0.7rem] text-tinta-suave">{comentario.length}/500</div>

                    {erro && <p className="mt-2 text-sm font-medium text-alerta">{erro}</p>}
                  </>
                )}
              </div>

              {/* Rodapé com a ação */}
              <div className="border-t border-borda px-5 py-4">
                {enviado ? (
                  <Botao variante="contorno" larguraTotal onClick={fechar}>
                    Fechar
                  </Botao>
                ) : (
                  <Botao
                    variante="marca"
                    larguraTotal
                    carregando={enviando}
                    desabilitado={!reacao}
                    onClick={aoEnviar}
                  >
                    {reacao ? 'Enviar feedback' : 'Escolha uma reação'}
                  </Botao>
                )}
              </div>
            </div>
          )}
        </Drawer>
      )}
    </>
  )
}
