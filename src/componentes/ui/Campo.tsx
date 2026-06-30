// Arquivo: src/componentes/ui/Campo.tsx
// Descrição: Campo de formulário (rótulo + input) padronizado. Controla foco,
//            mensagens de erro e um ícone opcional à esquerda. Componente
//            "controlado": o valor e o onChange vêm de quem usa.

import { useId, useState } from 'react'
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
  // revelavel mostra o "olho" para ver/ocultar a senha (só faz sentido em tipo=password).
  revelavel?: boolean
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
  revelavel = false,
}: CampoProps) {
  // useId gera um id único para ligar <label> e <input> (acessibilidade).
  const id = useId()
  const grande = tamanho === 'grande'

  // "Olho": só quando pedido e o campo é de senha. Alterna o type entre password e text.
  const [mostrar, setMostrar] = useState(false)
  const podeRevelar = revelavel && tipo === 'password'
  const tipoInput = podeRevelar && mostrar ? 'text' : tipo

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
          type={tipoInput}
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
            podeRevelar ? (grande ? 'pr-14' : 'pr-12') : '',
            erro ? 'border-alerta' : 'border-borda',
          ].join(' ')}
        />
        {podeRevelar && (
          <button
            type="button"
            onClick={() => setMostrar((v) => !v)}
            // tabIndex -1 para não atrapalhar o Tab e-mail → senha → entrar.
            tabIndex={-1}
            aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
            title={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-lg text-tinta-suave transition-colors hover:bg-areia-escura hover:text-tinta"
          >
            {mostrar ? '🙈' : '👁️'}
          </button>
        )}
      </div>

      {erro && <span className="text-sm font-medium text-alerta">{erro}</span>}
    </div>
  )
}
