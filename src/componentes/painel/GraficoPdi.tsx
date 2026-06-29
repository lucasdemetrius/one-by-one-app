// Arquivo: src/componentes/painel/GraficoPdi.tsx
// Descrição: Gráfico de evolução do PDI (burn-up) — quantos objetivos foram sendo
//            CONCLUÍDOS ao longo do tempo (acumulado), por data de conclusão. SVG
//            puro, cores do tema. Itens concluídos antes de termos a data ficam de
//            fora da série (mostramos só quando há histórico suficiente).

import type { ItemPDI } from '@/recursos/pdi/pdiApi'

function dataCurta(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function GraficoPdi({ itens }: { itens: ItemPDI[] }) {
  const total = itens.length
  // Datas de conclusão (só as que têm carimbo), em ordem.
  const datas = itens
    .filter((i) => i.concluido && i.concluido_em)
    .map((i) => i.concluido_em as string)
    .sort()

  if (datas.length < 2) {
    return (
      <p className="rounded-[var(--radius-suave)] border border-dashed border-borda bg-creme/50 px-3 py-3 text-center text-xs text-tinta-suave">
        Conclua objetivos ao longo do tempo para ver a evolução do PDI aqui. 📈
      </p>
    )
  }

  // Pontos acumulados: (data, nº concluídos até ali).
  const pontos = datas.map((d, i) => ({ data: d, acum: i + 1 }))
  const teto = Math.max(total, pontos[pontos.length - 1].acum)

  const W = 300
  const H = 96
  const padX = 14
  const padY = 12
  const larguraUtil = W - padX * 2
  const alturaUtil = H - padY * 2
  const x = (i: number) => padX + (i / (pontos.length - 1)) * larguraUtil
  const y = (n: number) => padY + (1 - n / teto) * alturaUtil

  const linha = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.acum).toFixed(1)}`).join(' ')
  const area = `${linha} L ${x(pontos.length - 1).toFixed(1)} ${H - padY} L ${x(0).toFixed(1)} ${H - padY} Z`

  return (
    <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-tinta-suave">Evolução do PDI</span>
        <span className="text-xs font-semibold text-tinta-suave">
          {pontos[pontos.length - 1].acum} de {total} concluídos
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" preserveAspectRatio="none" role="img" aria-label="Gráfico de evolução do PDI">
        <line x1={padX} y1={y(teto)} x2={W - padX} y2={y(teto)} stroke="var(--color-borda)" strokeWidth="0.5" strokeDasharray="3 3" />
        <defs>
          <linearGradient id="grad-pdi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-sucesso)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-sucesso)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#grad-pdi)" />
        <path d={linha} fill="none" stroke="var(--color-sucesso)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pontos.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.acum)} r="3" fill="var(--color-sucesso)" stroke="var(--color-creme)" strokeWidth="1.5" />
        ))}
      </svg>
      <div className="flex justify-between px-1 text-[0.65rem] text-tinta-suave/80">
        <span>{dataCurta(pontos[0].data)}</span>
        <span>{dataCurta(pontos[pontos.length - 1].data)}</span>
      </div>
    </div>
  )
}
