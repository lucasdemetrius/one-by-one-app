// Arquivo: src/componentes/ui/BotaoDuo.tsx
// Descrição: Botão "gordinho" estilo Duolingo — borda inferior 3D que afunda no
//            clique. Usado nas ações principais (entrar, criar conta, próximo
//            passo do onboarding…). Dá a sensação tátil e lúdica que o RH adora.

import type { ReactNode } from 'react'

type VarianteDuo = 'marca' | 'gestor' | 'liderado' | 'sucesso' | 'neutro'

interface BotaoDuoProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variante?: VarianteDuo
  carregando?: boolean
  desabilitado?: boolean
  larguraTotal?: boolean
  // 'grande' deixa o botão bem encorpado (telas de login/onboarding).
  tamanho?: 'normal' | 'grande'
}

// Cada variação traz a cor de fundo e a cor (mais escura) da "base 3D".
const estilos: Record<VarianteDuo, string> = {
  marca: 'gradiente-marca text-white shadow-[0_5px_0_var(--color-juncao)]',
  gestor: 'bg-gestor text-white shadow-[0_5px_0_#4338ca]',
  liderado: 'bg-liderado text-white shadow-[0_5px_0_#be123c]',
  sucesso: 'bg-sucesso text-white shadow-[0_5px_0_#15803d]',
  neutro: 'bg-creme text-tinta border-2 border-borda shadow-[0_5px_0_var(--color-borda)]',
}

export function BotaoDuo({
  children,
  onClick,
  type = 'button',
  variante = 'marca',
  carregando = false,
  desabilitado = false,
  larguraTotal = false,
  tamanho = 'normal',
}: BotaoDuoProps) {
  const inativo = desabilitado || carregando

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={inativo}
      className={[
        'rounded-[var(--radius-suave)] font-extrabold uppercase tracking-wide',
        'transition-all duration-100',
        // O "afundar": desce e reduz a base 3D ao pressionar.
        'active:translate-y-[3px] active:shadow-[0_2px_0_rgba(0,0,0,0.15)]',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0',
        tamanho === 'grande' ? 'px-6 py-4 text-base' : 'px-5 py-3 text-sm',
        larguraTotal ? 'w-full' : '',
        estilos[variante],
      ].join(' ')}
    >
      {carregando ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Só um instante…
        </span>
      ) : (
        children
      )}
    </button>
  )
}
