// Arquivo: src/componentes/ui/CodigoSegmentado.tsx
// Descrição: Campo de código em caixas separadas (uma letra por caixa), estilo
//            "OTP". Avança o foco ao digitar, volta no backspace, aceita colar o
//            código inteiro e move com as setas. Mantém um estado POSICIONAL fixo
//            (cada caixa = um índice; nunca colapsa posições vazias), então o que
//            aparece na caixa é sempre o que está naquela posição. O valor é
//            espelhado ao pai (string maiúscula) via onChange.

import { useEffect, useRef, useState } from 'react'

interface Props {
  valor: string
  onChange: (v: string) => void
  tamanho?: number
}

// Converte a string do pai numa lista posicional de comprimento fixo.
function paraCaixas(valor: string, tamanho: number): string[] {
  return Array.from({ length: tamanho }, (_, i) => valor[i] ?? '')
}

export function CodigoSegmentado({ valor, onChange, tamanho = 6 }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  // Fonte de verdade do desenho: uma posição por caixa (vazias preservadas).
  const [caixas, setCaixas] = useState<string[]>(() => paraCaixas(valor, tamanho))

  // Ressincroniza se o pai alterar o valor por fora (ex.: limpar após erro).
  useEffect(() => {
    if (valor !== caixas.join('')) setCaixas(paraCaixas(valor, tamanho))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor, tamanho])

  function focar(i: number) {
    const alvo = Math.max(0, Math.min(tamanho - 1, i))
    const el = refs.current[alvo]
    el?.focus()
    el?.select()
  }

  // Aplica as caixas e espelha o valor (sem colapsar posições vazias).
  function aplicar(arr: string[]) {
    setCaixas(arr)
    onChange(arr.join(''))
  }

  // Escreve `texto` (1+ caracteres) a partir da posição i, posição a posição.
  function escrever(i: number, texto: string) {
    const limpo = texto.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    const arr = [...caixas]
    if (!limpo) {
      arr[i] = '' // apagou esta caixa — a posição continua existindo
      aplicar(arr)
      return
    }
    for (let k = 0; k < limpo.length && i + k < tamanho; k++) arr[i + k] = limpo[k]
    aplicar(arr)
    focar(i + limpo.length)
  }

  function aoTecla(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !caixas[i]) {
      e.preventDefault()
      if (i > 0) {
        const arr = [...caixas]
        arr[i - 1] = ''
        aplicar(arr)
        focar(i - 1)
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focar(i - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focar(i + 1)
    }
  }

  return (
    <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
      {caixas.map((ch, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={ch}
          onChange={(e) => escrever(i, e.target.value)}
          onKeyDown={(e) => aoTecla(i, e)}
          onPaste={(e) => {
            e.preventDefault()
            escrever(0, e.clipboardData.getData('text'))
          }}
          onFocus={(e) => e.target.select()}
          maxLength={1}
          inputMode="text"
          autoComplete="one-time-code"
          aria-label={`Dígito ${i + 1} do código`}
          className="h-14 w-full min-w-0 rounded-[var(--radius-suave)] border-2 border-borda bg-areia text-center text-2xl font-extrabold uppercase text-tinta outline-none transition focus:border-juncao focus:ring-2 focus:ring-juncao/30"
        />
      ))}
    </div>
  )
}
