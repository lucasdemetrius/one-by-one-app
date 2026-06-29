// Arquivo: src/componentes/estrutura/FundoVivo.tsx
// Descrição: Fundo "vivo" do site — BOLHAS de sabão subindo devagar (de baixo pra
//            cima): umas só sobem e somem no topo, outras estouram no caminho com
//            um "pop" tipo bolha de sabão. Concentradas nas LATERAIS e no CENTRO
//            (emoldurando o conteúdo, que fica no miolo) e em baixa intensidade,
//            para não atrapalhar a leitura. Atrás de tudo (z-0, pointer-events-none).
//            Respeita prefers-reduced-motion (some).

import { useMemo } from 'react'

const CORES = ['var(--color-juncao)', 'var(--color-liderado)', 'var(--color-gestor)', 'var(--color-sucesso)']

// Posição horizontal enviesada: ~40% à esquerda, ~40% à direita, ~20% no centro —
// assim as bolhas aparecem nas margens e no miolo, pouco na zona de leitura.
function posicaoLateral(): number {
  const r = Math.random()
  if (r < 0.4) return Math.random() * 16 // esquerda 0–16%
  if (r < 0.8) return 84 + Math.random() * 16 // direita 84–100%
  return 42 + Math.random() * 16 // centro 42–58%
}

export function FundoVivo() {
  // Gera as bolhas uma vez (posição, tamanho, ritmo e se estoura — tudo variado).
  const bolhas = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const tamanho = 14 + Math.random() * 56 // 14–70px
        const dur = 12 + Math.random() * 12 // 12–24s (sobe devagar)
        return {
          id: i,
          left: posicaoLateral(),
          tamanho,
          dur,
          delay: -Math.random() * dur, // negativo: já começam no meio do trajeto
          sway: Math.random() * 36 - 18, // -18..18px de deriva lateral
          op: 0.16 + Math.random() * 0.26, // 0.16–0.42 (sutil)
          cor: CORES[i % CORES.length],
          estoura: Math.random() < 0.45, // ~45% estouram
        }
      }),
    [],
  )

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Lavagens de cor suaves (profundidade) */}
      <div className="absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-juncao opacity-[0.08] blur-3xl" />
      <div className="absolute -bottom-32 right-[8%] h-[24rem] w-[24rem] rounded-full bg-liderado opacity-[0.08] blur-3xl" />

      {/* Bolhas de sabão subindo */}
      {bolhas.map((b) => (
        <span
          key={b.id}
          className={['bolha', b.estoura ? 'bolha-sobe-pop' : 'bolha-sobe'].join(' ')}
          style={
            {
              left: `${b.left}%`,
              width: b.tamanho,
              height: b.tamanho,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              ['--op']: b.op,
              ['--sway']: `${b.sway}px`,
              ['--cor']: b.cor,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
