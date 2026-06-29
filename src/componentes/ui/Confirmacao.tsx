// Arquivo: src/componentes/ui/Confirmacao.tsx
// Descrição: Confirmação temática (substitui o confirm() nativo, feio). Um Provider
//            expõe o hook useConfirmar() que abre um modal bonito e devolve uma
//            Promise<boolean>. Visual com pegada "Duolingo": card arredondado,
//            emoji grande, botões gordinhos com sombra-3D e entrada com bounce.

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface OpcoesConfirmacao {
  titulo: string
  mensagem?: ReactNode
  textoConfirmar?: string
  textoCancelar?: string
  emoji?: string
  // true → ação destrutiva (botão em tom de alerta).
  perigoso?: boolean
}

type FnConfirmar = (opcoes: OpcoesConfirmacao) => Promise<boolean>

const ContextoConfirmacao = createContext<FnConfirmar>(async () => false)

// Hook usado nas telas: const confirmar = useConfirmar(); if (await confirmar({...})) {...}
export function useConfirmar() {
  return useContext(ContextoConfirmacao)
}

export function ConfirmacaoProvider({ children }: { children: ReactNode }) {
  const [opcoes, setOpcoes] = useState<OpcoesConfirmacao | null>(null)
  const resolverRef = useRef<((valor: boolean) => void) | null>(null)

  const confirmar = useCallback<FnConfirmar>((op) => {
    setOpcoes(op)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  function responder(valor: boolean) {
    resolverRef.current?.(valor)
    resolverRef.current = null
    setOpcoes(null)
  }

  // Botão estilo Duolingo: borda inferior mais escura que some ao "afundar".
  const botaoBase =
    'flex-1 rounded-[var(--radius-suave)] px-4 py-3 text-sm font-extrabold transition-all active:translate-y-0.5'

  return (
    <ContextoConfirmacao.Provider value={confirmar}>
      {children}

      {createPortal(
      <AnimatePresence>
        {opcoes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-tinta/40 p-4 backdrop-blur-sm"
            onClick={() => responder(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              role="alertdialog"
              aria-modal="true"
              className="w-full max-w-sm rounded-[var(--radius-cartao)] border border-borda bg-creme p-7 text-center shadow-[var(--shadow-flutuante)]"
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.05 }}
                className="mx-auto mb-3 text-5xl"
              >
                {opcoes.emoji ?? (opcoes.perigoso ? '⚠️' : '🤔')}
              </motion.div>
              <h2 className="fonte-display text-xl font-extrabold text-tinta">{opcoes.titulo}</h2>
              {opcoes.mensagem && (
                <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{opcoes.mensagem}</p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => responder(false)}
                  autoFocus={opcoes.perigoso}
                  className={[
                    botaoBase,
                    'border-2 border-borda bg-creme text-tinta-suave shadow-[0_4px_0_var(--color-borda)] hover:bg-areia-escura',
                  ].join(' ')}
                >
                  {opcoes.textoCancelar ?? 'Cancelar'}
                </button>
                <button
                  type="button"
                  onClick={() => responder(true)}
                  autoFocus={!opcoes.perigoso}
                  className={[
                    botaoBase,
                    'text-white',
                    opcoes.perigoso
                      ? 'bg-alerta shadow-[0_4px_0_#b91c1c] hover:brightness-105'
                      : 'gradiente-marca shadow-[0_4px_0_var(--color-juncao)] hover:brightness-105',
                  ].join(' ')}
                >
                  {opcoes.textoConfirmar ?? 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </ContextoConfirmacao.Provider>
  )
}
