// Arquivo: src/componentes/painel/GraficoHumor.tsx
// Descrição: Gráfico de evolução do HUMOR (sentimento) de um liderado ao longo do
//            tempo. Desenhado em SVG puro (sem dependência) — área + linha + pontos,
//            com os emojis de humor (1–5) no eixo. Cores do tema (gradiente da marca).

interface Ponto {
  valor: number // 1..5
  data: string // "YYYY-MM-DD"
}

const HUMOR_EMOJI = ['', '😞', '😕', '😐', '🙂', '😄'] // índice 1..5

function dataCurta(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function GraficoHumor({ dados }: { dados: Ponto[] }) {
  // Ordena por data ascendente e pega no máximo os 12 mais recentes.
  const pts = [...dados].sort((a, b) => (a.data < b.data ? -1 : 1)).slice(-12)

  if (pts.length < 2) {
    return (
      <p className="rounded-[var(--radius-suave)] border border-dashed border-borda bg-creme/50 px-3 py-4 text-center text-xs text-tinta-suave">
        Registre o humor por pelo menos 2 semanas para ver a evolução. 📈
      </p>
    )
  }

  const W = 300
  const H = 110
  const padX = 14
  const padY = 14
  const larguraUtil = W - padX * 2
  const alturaUtil = H - padY * 2

  const x = (i: number) => padX + (pts.length === 1 ? larguraUtil / 2 : (i / (pts.length - 1)) * larguraUtil)
  const y = (v: number) => padY + ((5 - v) / 4) * alturaUtil // 5 no topo, 1 embaixo

  const linha = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.valor).toFixed(1)}`).join(' ')
  const area = `${linha} L ${x(pts.length - 1).toFixed(1)} ${H - padY} L ${x(0).toFixed(1)} ${H - padY} Z`

  const media = pts.reduce((s, p) => s + p.valor, 0) / pts.length
  const tendencia = pts[pts.length - 1].valor - pts[0].valor

  return (
    <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-tinta-suave">Evolução do humor</span>
        <span className="text-xs font-semibold text-tinta-suave">
          {tendencia > 0 ? '↗ subindo' : tendencia < 0 ? '↘ caindo' : '→ estável'} · média {media.toFixed(1)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full" preserveAspectRatio="none" role="img" aria-label="Gráfico de evolução do humor">
        {/* linhas de grade nos níveis 1..5 */}
        {[1, 2, 3, 4, 5].map((v) => (
          <line key={v} x1={padX} y1={y(v)} x2={W - padX} y2={y(v)} stroke="var(--color-borda)" strokeWidth="0.5" />
        ))}
        <defs>
          <linearGradient id="grad-humor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-juncao)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-juncao)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#grad-humor)" />
        <path d={linha} fill="none" stroke="var(--color-juncao)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.valor)} r="3" fill="var(--color-juncao)" stroke="var(--color-creme)" strokeWidth="1.5" />
        ))}
      </svg>
      {/* rótulos das datas (primeira e última) */}
      <div className="flex justify-between px-1 text-[0.65rem] text-tinta-suave/80">
        <span>
          {HUMOR_EMOJI[pts[0].valor]} {dataCurta(pts[0].data)}
        </span>
        <span>
          {HUMOR_EMOJI[pts[pts.length - 1].valor]} {dataCurta(pts[pts.length - 1].data)}
        </span>
      </div>
    </div>
  )
}
