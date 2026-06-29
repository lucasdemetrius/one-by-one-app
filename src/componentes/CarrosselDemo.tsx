// Arquivo: src/componentes/CarrosselDemo.tsx
// Descrição: Carrossel de demonstração usado nas telas de login/cadastro. Mostra,
//            em mockups animados, COMO o produto funciona: o OneByOne (tabuleiro
//            do 1:1 ao vivo) e a Matrix9-Box (arrastar e soltar). Dá ao visitante
//            uma noção concreta da aplicação antes mesmo de entrar. Auto-avança.

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// ── Mockup 1: tabuleiro do 1:1 ao vivo ───────────────────────────────────────
function MockTabuleiro() {
  const colunas = [
    { titulo: 'A falar', chips: [{ e: '🎯', t: 'Metas do mês' }] },
    { titulo: 'Conversando', chips: [{ e: '💬', t: 'Feedback', vivo: true }] },
    { titulo: 'Conversado', chips: [{ e: '📚', t: 'Estudos' }, { e: '🌱', t: 'PDI' }] },
  ]
  return (
    <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-4 text-left shadow-[var(--shadow-flutuante)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-juncao">
          <span className="h-2 w-2 animate-pulse rounded-full bg-sucesso" /> 1:1 ao vivo
        </span>
        <div className="flex -space-x-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-creme bg-gestor text-[0.6rem] font-bold text-white">G</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-creme bg-liderado text-[0.6rem] font-bold text-white">L</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {colunas.map((c) => (
          <div key={c.titulo} className="rounded-[var(--radius-suave)] bg-areia p-2">
            <span className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-wider text-tinta-suave">
              {c.titulo}
            </span>
            <div className="flex flex-col gap-1.5">
              {c.chips.map((chip) => (
                <div
                  key={chip.t}
                  className={[
                    'flex items-center gap-1 rounded-md border border-borda bg-creme px-1.5 py-1 text-[0.62rem] font-semibold text-tinta',
                    'vivo' in chip && chip.vivo ? 'ring-2 ring-juncao' : '',
                  ].join(' ')}
                >
                  <span>{chip.e}</span>
                  <span className="truncate">{chip.t}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Mockup 2: Matrix9-Box com uma ficha "arrastando" ─────────────────────────
function MockNineBox() {
  // 9 células com tonalidade por zona (verde bom → vermelho atenção).
  const cores = [
    'rgba(34,197,94,0.10)', 'rgba(34,197,94,0.16)', 'rgba(34,197,94,0.22)',
    'rgba(99,102,241,0.08)', 'rgba(99,102,241,0.10)', 'rgba(34,197,94,0.14)',
    'rgba(239,68,68,0.12)', 'rgba(245,158,11,0.12)', 'rgba(99,102,241,0.08)',
  ]
  return (
    <div className="relative rounded-[var(--radius-cartao)] border border-borda bg-creme p-4 text-left shadow-[var(--shadow-flutuante)]">
      <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-juncao">
        Matrix9-Box · arraste e solte
      </span>
      <div className="relative grid grid-cols-3 gap-1.5">
        {cores.map((cor, i) => (
          <div key={i} className="h-12 rounded-md" style={{ backgroundColor: cor }} />
        ))}

        {/* Ficha que "passeia" entre as células (da atenção → estrela) */}
        <motion.div
          className="absolute flex items-center gap-1 rounded-full border border-borda bg-creme py-0.5 pl-0.5 pr-2 shadow-[var(--shadow-cartao)]"
          initial={{ left: 4, top: 96 }}
          animate={{ left: [4, 4, 132, 132, 4], top: [96, 96, 4, 4, 96] }}
          transition={{ duration: 6, times: [0, 0.25, 0.5, 0.85, 1], repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-liderado text-[0.55rem] font-bold text-white">A</span>
          <span className="text-[0.58rem] font-bold text-tinta">Ana</span>
        </motion.div>
      </div>
      <div className="mt-1.5 flex justify-between text-[0.55rem] font-bold uppercase tracking-wider text-tinta-suave">
        <span>Atenção</span>
        <span>⭐ Estrela</span>
      </div>
    </div>
  )
}

// ── Mockup 3: visão do time (1 gestor : N liderados) ─────────────────────────
function MockTime() {
  const time = [
    { i: 'A', n: 'Ana', cor: 'var(--color-liderado)', h: '😄', pdi: 82 },
    { i: 'B', n: 'Bruno', cor: 'var(--color-gestor)', h: '🙂', pdi: 56 },
    { i: 'C', n: 'Carla', cor: 'var(--color-juncao)', h: '😟', pdi: 34 },
  ]
  return (
    <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-4 text-left shadow-[var(--shadow-flutuante)]">
      <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-juncao">
        Seu time · num lugar só
      </span>
      <ul className="flex flex-col gap-2">
        {time.map((p) => (
          <li key={p.n} className="flex items-center gap-2.5 rounded-[var(--radius-suave)] bg-areia px-2.5 py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: p.cor }}>
              {p.i}
            </span>
            <span className="flex-1 text-sm font-bold text-tinta">{p.n}</span>
            <span>{p.h}</span>
            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-areia-escura">
              <div className="gradiente-marca h-full" style={{ width: `${p.pdi}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const SLIDES = [
  {
    titulo: 'O 1:1 que vocês jogam juntos',
    descricao: 'Gestor e liderado no mesmo tabuleiro, ao vivo — temas, conversa e tudo que importa.',
    mock: <MockTabuleiro />,
  },
  {
    titulo: 'Enxergue o time numa matriz',
    descricao: 'Posicione cada pessoa por desempenho × potencial arrastando e soltando.',
    mock: <MockNineBox />,
  },
  {
    titulo: 'Tudo de cada liderado, junto',
    descricao: 'Sentimento, entregas, feedbacks, estudos e a evolução do PDI — num lugar só.',
    mock: <MockTime />,
  },
]

export function CarrosselDemo() {
  const [i, setI] = useState(0)

  // Auto-avança a cada 4,5s.
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 4500)
    return () => clearInterval(t)
  }, [])

  const slide = SLIDES[i]

  return (
    <div className="flex w-full max-w-xl flex-col items-center text-center">
      <div className="relative h-80 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-full scale-110">{slide.mock}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      <h2 className="fonte-display mt-8 text-3xl font-extrabold leading-tight text-tinta">
        {slide.titulo}
      </h2>
      <p className="mt-2 max-w-md text-lg text-tinta-suave">{slide.descricao}</p>

      {/* Bolinhas de navegação */}
      <div className="mt-5 flex gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={[
              'h-2.5 rounded-full transition-all',
              idx === i ? 'w-7 gradiente-marca' : 'w-2.5 bg-borda hover:bg-tinta-suave',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  )
}
