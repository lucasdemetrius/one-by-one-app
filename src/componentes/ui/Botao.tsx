// Arquivo: src/componentes/ui/Botao.tsx
// Descrição: Botão reutilizável do sistema de design. Suporta variações de cor
//            por persona (gestor/liderado) e um estado de carregamento com
//            micro-animação. Usa Framer Motion para um toque tátil ao pressionar.

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

// Variações visuais do botão.
//   primario  → ação principal neutra (tinta escura)
//   gestor    → petróleo (persona Gestor)
//   liderado  → terracota (persona Liderado)
//   contorno  → apenas borda, fundo transparente
type Variante = 'marca' | 'primario' | 'gestor' | 'liderado' | 'contorno'

interface BotaoProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variante?: Variante
  carregando?: boolean
  desabilitado?: boolean
  larguraTotal?: boolean
}

// Classes de cada variação. Cada uma traz sua própria sombra/brilho:
// os botões coloridos ganham um glow na cor da persona (sensação premium).
const estilosVariante: Record<Variante, string> = {
  marca:
    'gradiente-marca text-white shadow-[0_14px_36px_-10px_var(--color-juncao)] hover:brightness-105',
  primario:
    'bg-tinta text-creme shadow-[var(--shadow-cartao)] hover:brightness-110',
  gestor:
    'bg-gestor text-white shadow-[0_10px_34px_-10px_var(--color-gestor)] hover:brightness-110',
  liderado:
    'bg-liderado text-white shadow-[0_10px_34px_-10px_var(--color-liderado)] hover:brightness-110',
  contorno:
    'bg-transparent text-tinta border-2 border-borda hover:border-tinta hover:bg-creme',
}

export function Botao({
  children,
  onClick,
  type = 'button',
  variante = 'primario',
  carregando = false,
  desabilitado = false,
  larguraTotal = false,
}: BotaoProps) {
  const inativo = desabilitado || carregando

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={inativo}
      // Pequena resposta tátil: cresce ao passar o mouse, afunda ao clicar.
      whileHover={inativo ? undefined : { scale: 1.03 }}
      whileTap={inativo ? undefined : { scale: 0.97 }}
      className={[
        'inline-flex items-center justify-center gap-2',
        'rounded-[var(--radius-suave)] px-8 py-4',
        'font-bold text-[1.02rem] tracking-tight',
        'transition-[filter,background-color,border-color,box-shadow]',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        larguraTotal ? 'w-full' : '',
        estilosVariante[variante],
      ].join(' ')}
    >
      {carregando && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </motion.button>
  )
}
