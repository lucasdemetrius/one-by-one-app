// Arquivo: src/componentes/ui/Ajuda.tsx
// Descrição: Ícone de ajuda contextual ("?") reutilizável. Ao clicar, abre um
//            balão (popover) com uma explicação curta — pensado para o público
//            de RH, que nem sempre é técnico. Fecha ao clicar fora ou no Esc.

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface AjudaProps {
  // Título curto do balão (ex.: "Como usar a Matrix9-Box").
  titulo: string
  // Conteúdo explicativo (texto ou JSX com listas, etc.).
  children: ReactNode
  // Lado de abertura do balão (padrão: à esquerda do ícone, indo para baixo).
  alinhar?: 'esquerda' | 'direita'
  // compacto=true usa um "?" menor (h-5), para caber em cartões pequenos.
  compacto?: boolean
}

export function Ajuda({ titulo, children, alinhar = 'direita', compacto = false }: AjudaProps) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!aberto) return
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label={`Ajuda: ${titulo}`}
        aria-expanded={aberto}
        title="Ajuda"
        className={[
          'flex items-center justify-center rounded-full border border-borda font-bold transition-colors',
          compacto ? 'h-5 w-5 text-xs' : 'h-7 w-7 text-sm',
          aberto
            ? 'border-juncao bg-juncao/10 text-juncao'
            : compacto
              ? 'border-juncao/40 text-juncao/80 hover:border-juncao hover:bg-juncao/10 hover:text-juncao'
              : 'text-tinta-suave hover:border-juncao hover:text-juncao',
        ].join(' ')}
      >
        ?
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            className={[
              'absolute z-50 w-72 rounded-[var(--radius-cartao)] border border-borda',
              'bg-creme p-4 text-left shadow-[var(--shadow-flutuante)]',
              compacto ? 'top-7' : 'top-9',
              alinhar === 'direita' ? 'right-0' : 'left-0',
            ].join(' ')}
          >
            <p className="fonte-display mb-1 text-sm font-bold text-tinta">{titulo}</p>
            <div className="text-sm leading-relaxed text-tinta-suave">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
