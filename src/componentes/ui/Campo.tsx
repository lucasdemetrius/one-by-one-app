// Arquivo: src/componentes/ui/Campo.tsx
// Descrição: Campo de formulário (rótulo + input) padronizado. Controla foco,
//            mensagens de erro e um ícone opcional à esquerda. Componente
//            "controlado": o valor e o onChange vêm de quem usa.

import { useId } from 'react'
import type { ReactNode } from 'react'

interface CampoProps {
  rotulo: string
  valor: string
  onChange: (valor: string) => void
  tipo?: 'text' | 'email' | 'password'
  placeholder?: string
  erro?: string
  icone?: ReactNode
  autoComplete?: string
  // 'grande' deixa o campo bem encorpado (login/onboarding).
  tamanho?: 'normal' | 'grande'
  // Campo apenas para leitura (ex.: e-mail já definido no convite).
  somenteLeitura?: boolean
}

export function Campo({
  rotulo,
  valor,
  onChange,
  tipo = 'text',
  placeholder,
  erro,
  icone,
  autoComplete,
  tamanho = 'normal',
  somenteLeitura = false,
}: CampoProps) {
  // useId gera um id único para ligar <label> e <input> (acessibilidade).
  const id = useId()
  const grande = tamanho === 'grande'

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={['font-semibold text-tinta', grande ? 'text-base' : 'text-sm'].join(' ')}
      >
        {rotulo}
      </label>

      <div className="relative">
        {icone && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta-suave">
            {icone}
          </span>
        )}
        <input
          id={id}
          type={tipo}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          readOnly={somenteLeitura}
          aria-readonly={somenteLeitura}
          className={[
            'w-full rounded-[var(--radius-suave)]',
            'border-2 text-tinta placeholder:text-tinta-suave/60',
            'outline-none transition-colors',
            somenteLeitura ? 'cursor-default bg-areia-escura/40 text-tinta-suave' : 'bg-creme focus:border-juncao',
            grande ? 'px-5 py-4 text-lg' : 'px-4 py-3',
            icone ? (grande ? 'pl-12' : 'pl-10') : '',
            erro ? 'border-alerta' : 'border-borda',
          ].join(' ')}
        />
      </div>

      {erro && <span className="text-sm font-medium text-alerta">{erro}</span>}
    </div>
  )
}
