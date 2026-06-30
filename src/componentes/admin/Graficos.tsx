// Arquivo: src/componentes/admin/Graficos.tsx
// Descrição: Blocos visuais reutilizáveis do painel de ADMIN — cartões de KPI, gráfico de
//            linhas (séries temporais), barras verticais (distribuições por hora/dia),
//            barras horizontais (rankings) e anel de percentual. Tudo em SVG/divs com os
//            tokens do tema (cores via var(--color-*)), então acompanham a troca de tema.

import type { ReactNode } from 'react'

import { diaCurto } from './formatos'

// Cartão de KPI: emoji + número grande + rótulo, com leve tinta da cor.
export function CartaoKPI({ emoji, valor, rotulo, cor = 'var(--color-juncao)' }: { emoji: string; valor: ReactNode; rotulo: string; cor?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-cartao)] border border-borda bg-creme p-4 shadow-[var(--shadow-cartao)]">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
        style={{ backgroundColor: `color-mix(in srgb, ${cor} 16%, transparent)` }}
      >
        {emoji}
      </span>
      <div className="min-w-0">
        <div className="fonte-display text-2xl font-extrabold leading-none text-tinta">{valor}</div>
        <div className="mt-0.5 text-xs font-semibold text-tinta-suave">{rotulo}</div>
      </div>
    </div>
  )
}

// Título de seção.
export function TituloSecao({ children }: { children: ReactNode }) {
  return <h2 className="fonte-display mb-3 text-lg font-bold text-tinta">{children}</h2>
}

// Cartão de conteúdo (moldura padrão das seções com gráfico).
export function Cartao({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-cartao)] border border-borda bg-creme p-4 shadow-[var(--shadow-cartao)] ${className}`}>
      {children}
    </div>
  )
}

// Esqueleto de carregamento.
export function Carregando({ altura = 'h-40' }: { altura?: string }) {
  return <div className={`${altura} animate-pulse rounded-[var(--radius-cartao)] border border-borda bg-creme/60`} />
}

// Estado vazio amigável.
export function Vazio({ emoji = '🌱', titulo, sub }: { emoji?: string; titulo: string; sub?: string }) {
  return (
    <div className="rounded-[var(--radius-cartao)] border border-dashed border-borda bg-creme/50 p-10 text-center">
      <div className="mb-2 text-4xl">{emoji}</div>
      <p className="text-sm font-semibold text-tinta">{titulo}</p>
      {sub && <p className="mt-1 text-sm text-tinta-suave">{sub}</p>}
    </div>
  )
}

// ── Gráfico de linhas (séries temporais) ─────────────────────────────────────
export interface SerieLinha {
  nome: string
  cor: string
  valores: number[]
}
export function GraficoLinhas({ labels, series, altura = 200 }: { labels: string[]; series: SerieLinha[]; altura?: number }) {
  const W = 640
  const H = altura
  const padT = 8
  const padB = 4
  const padL = 2
  const n = labels.length
  const max = Math.max(1, ...series.flatMap((s) => s.valores))
  const x = (i: number) => (n <= 1 ? padL : padL + (i / (n - 1)) * (W - padL * 2))
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB)
  const pontos = (vals: number[]) => vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const passo = Math.max(1, Math.ceil(n / 8))

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height: altura }}>
        {/* Linha de base */}
        <line x1={0} y1={H - padB} x2={W} y2={H - padB} stroke="var(--color-borda)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {series.map((s) => (
          <polyline
            key={s.nome}
            points={pontos(s.valores)}
            fill="none"
            stroke={s.cor}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {/* Eixo X (rótulos esparsos) */}
      <div className="mt-1.5 flex text-[0.6rem] text-tinta-suave">
        {labels.map((d, i) => (
          <div key={d} className="flex-1 text-center">
            {i % passo === 0 ? diaCurto(d) : ''}
          </div>
        ))}
      </div>
      {/* Legenda */}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {series.map((s) => (
          <span key={s.nome} className="flex items-center gap-1.5 text-xs font-semibold text-tinta-suave">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: s.cor }} />
            {s.nome}
          </span>
        ))}
        <span className="ml-auto text-[0.7rem] text-tinta-suave">máx/dia: {max}</span>
      </div>
    </div>
  )
}

// ── Barras verticais (distribuição: por hora, por dia da semana) ─────────────
export function GraficoBarras({ itens, cor = 'var(--color-gestor)', altura = 150 }: { itens: { rotulo: string; total: number }[]; cor?: string; altura?: number }) {
  const max = Math.max(1, ...itens.map((i) => i.total))
  const passo = Math.max(1, Math.ceil(itens.length / 12))
  return (
    <div>
      <div className="flex items-stretch gap-[3px]" style={{ height: altura }}>
        {itens.map((it) => (
          <div key={it.rotulo} className="flex flex-1 flex-col justify-end" title={`${it.rotulo}: ${it.total}`}>
            <div
              className="rounded-t-sm transition-all"
              style={{ height: `${(it.total / max) * 100}%`, backgroundColor: cor, minHeight: it.total > 0 ? 2 : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex text-[0.6rem] text-tinta-suave">
        {itens.map((it, i) => (
          <div key={it.rotulo} className="flex-1 text-center">
            {i % passo === 0 ? it.rotulo : ''}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Barras horizontais (ranking/distribuição) ────────────────────────────────
export function BarrasHorizontais({ itens, cor = 'var(--color-juncao)' }: { itens: { rotulo: string; total: number }[]; cor?: string }) {
  const max = Math.max(1, ...itens.map((i) => i.total))
  if (itens.length === 0) return <p className="text-sm text-tinta-suave">Sem dados no período.</p>
  return (
    <div className="flex flex-col gap-2">
      {itens.map((it) => (
        <div key={it.rotulo} className="flex items-center gap-3">
          <span className="w-36 shrink-0 truncate text-sm font-semibold text-tinta" title={it.rotulo}>
            {it.rotulo}
          </span>
          <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-areia-escura">
            <div className="h-full rounded-full" style={{ width: `${(it.total / max) * 100}%`, backgroundColor: cor }} />
          </div>
          <span className="w-10 shrink-0 text-right text-sm font-bold text-tinta-suave">{it.total}</span>
        </div>
      ))}
    </div>
  )
}

// ── Anel de percentual ───────────────────────────────────────────────────────
export function Anel({ pct, cor, titulo, sub }: { pct: number; cor: string; titulo: string; sub?: string }) {
  const R = 26
  const C = 2 * Math.PI * R
  const seguro = Math.max(0, Math.min(100, pct))
  const offset = C - (seguro / 100) * C
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <svg viewBox="0 0 64 64" className="h-24 w-24 -rotate-90">
          <circle cx="32" cy="32" r={R} fill="none" stroke="var(--color-areia-escura)" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={R}
            fill="none"
            stroke={cor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <span className={`fonte-display absolute font-extrabold leading-none text-tinta ${seguro >= 100 ? 'text-lg' : 'text-xl'}`}>{seguro}%</span>
      </div>
      <span className="text-sm font-bold text-tinta">{titulo}</span>
      {sub && <span className="text-[11px] font-semibold text-tinta-suave">{sub}</span>}
    </div>
  )
}
