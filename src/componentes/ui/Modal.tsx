// Arquivo: src/componentes/ui/Modal.tsx
// Descrição: Janela modal simples e reutilizável (overlay escurecido + cartão
//            central). Usada pelos formulários de criar equipe e adicionar
//            liderado. Fecha ao clicar fora ou no botão de fechar.

import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  children: ReactNode
}

export function Modal({ aberto, aoFechar, titulo, children }: ModalProps) {
  // Portal no body: escapa do contexto de empilhamento do <main> (evita que o
  // header fixo corte o topo do modal).
  return createPortal(
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="fixed inset-0 z-[65] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Fundo escurecido — clicar aqui fecha o modal */}
          <div
            className="absolute inset-0 bg-tinta/40 backdrop-blur-sm"
            onClick={aoFechar}
          />

          {/* Cartão do modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            className="relative w-full max-w-md rounded-[var(--radius-cartao)] border border-borda bg-creme p-6 shadow-[var(--shadow-flutuante)]"
            initial={{ scale: 0.95, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="fonte-display text-xl font-bold text-tinta">{titulo}</h2>
              <button
                type="button"
                onClick={aoFechar}
                aria-label="Fechar"
                className="flex h-8 w-8 items-center justify-center rounded-full text-tinta-suave transition-colors hover:bg-areia-escura"
              >
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
