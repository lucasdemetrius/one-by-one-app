// Arquivo: src/componentes/ui/Drawer.tsx
// Descrição: Painel lateral (drawer) reutilizável que desliza da direita — o
//            padrão "moderno" que substitui os modais centrais. Cuida do fundo
//            escurecido, do clique-fora, do Esc e da animação de entrada/saída.
//            O conteúdo é uma render-prop que recebe `fechar` (para o botão ✕ do
//            cabeçalho disparar a animação de saída antes de desmontar).

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  aoFechar: () => void
  // Classe de largura máxima do painel (ex.: 'max-w-md', 'max-w-3xl').
  largura?: string
  children: (fechar: () => void) => ReactNode
}

export function Drawer({ aoFechar, largura = 'max-w-md', children }: Props) {
  const [aberto, setAberto] = useState(true)
  const fechar = () => setAberto(false)

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [])

  // Portal no body: escapa do contexto de empilhamento do <main> (que tem z-index
  // por causa do background), evitando que o header fixo corte o painel.
  return createPortal(
    <AnimatePresence onExitComplete={aoFechar}>
      {aberto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex justify-end bg-tinta/30 backdrop-blur-sm"
          onClick={fechar}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className={`flex h-full w-full ${largura} flex-col overflow-hidden border-l-2 border-borda bg-areia shadow-[var(--shadow-flutuante)]`}
          >
            {children(fechar)}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
