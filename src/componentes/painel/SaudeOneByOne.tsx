// Arquivo: src/componentes/painel/SaudeOneByOne.tsx
// Descrição: Card "Saúde do 1:1" no painel — fecha o ciclo de engajamento do gestor.
//            Mostra, num relance: % da agenda em dia (anel), sequência de semanas com
//            1:1 (streak 🔥), realizados nos últimos 30 dias e atrasados. Copy SEMPRE
//            motivacional (nunca punitiva) — é o "mantenha o time aceso", não cobrança.
//            Dados via GET /saude-1a1 (useSaudeOneByOne).

import { Ajuda } from '@/componentes/ui/Ajuda'
import { useSaudeOneByOne } from '@/recursos/onebyone/onebyoneApi'

// Mini-estatística (emoji em círculo + número grande + rótulo) — mesmo vocabulário do Pulso.
function MiniStat({ emoji, valor, rotulo, cor }: { emoji: string; valor: string; rotulo: string; cor: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
        style={{ backgroundColor: `color-mix(in srgb, ${cor} 16%, transparent)` }}
      >
        {emoji}
      </span>
      <span className="fonte-display text-xl font-extrabold leading-none text-tinta">{valor}</span>
      <span className="text-[11px] font-semibold leading-tight text-tinta-suave">{rotulo}</span>
    </div>
  )
}

export function SaudeOneByOne() {
  const { data, isLoading } = useSaudeOneByOne()

  // Anel de progresso (mesmo padrão do PDI).
  const R = 26
  const C = 2 * Math.PI * R
  const pct = data?.percentual_em_dia ?? 0
  const offset = C - (pct / 100) * C

  // Cabeçalho da seção (estável mesmo durante o carregamento).
  const Cabecalho = (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="fonte-display text-xl font-bold text-tinta">Saúde do 1:1</h2>
      {isLoading && <span className="text-xs text-tinta-suave">atualizando…</span>}
    </div>
  )

  if (isLoading && !data) {
    return (
      <section className="mb-8">
        {Cabecalho}
        <div className="h-32 animate-pulse rounded-[var(--radius-cartao)] border border-borda bg-creme/60" />
      </section>
    )
  }
  if (!data) return null

  // Copy adaptativa — encorajadora, conforme o momento do gestor.
  let recado: string
  if (data.total_agendados === 0 && data.realizados_ult_30 === 0) {
    recado = 'Agende seu primeiro 1:1 para começar a acompanhar o time 🌱'
  } else if (data.streak_semanas > 0) {
    recado = `🔥 ${data.streak_semanas} ${data.streak_semanas === 1 ? 'semana' : 'semanas'} seguidas com 1:1 — mantenha o time aceso!`
  } else if (data.atrasados > 0) {
    recado = `Você tem ${data.atrasados} 1:1 esperando — que tal retomar a conversa? 💪`
  } else {
    recado = 'Tudo em dia por aqui! 👏'
  }

  return (
    <section className="mb-8">
      {Cabecalho}
      <div className="relative rounded-[var(--radius-cartao)] border border-borda bg-creme p-4 shadow-[var(--shadow-cartao)]">
        {/* Ajuda da seção: explica os 4 indicadores. */}
        <span className="absolute right-3 top-3 z-10">
          <Ajuda titulo="Saúde do 1:1" alinhar="direita" compacto>
            <ul className="flex flex-col gap-1.5">
              <li><strong className="text-tinta">% em dia</strong>: da sua agenda de 1:1, quanto não está vencido.</li>
              <li><strong className="text-tinta">🔥 semanas seguidas</strong>: sequência de semanas com pelo menos um 1:1.</li>
              <li><strong className="text-tinta">✅ feitos · 30d</strong>: 1:1 realizados nos últimos 30 dias.</li>
              <li><strong className="text-tinta">⏰ atrasados</strong>: 1:1 agendados cuja data já passou.</li>
            </ul>
          </Ajuda>
        </span>

        {/* 4 colunas iguais e centralizadas: anel + 3 métricas (2x2 no celular). */}
        <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-4">
          {/* Anel: % da agenda em dia */}
          <div className="flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg viewBox="0 0 64 64" className="h-24 w-24 -rotate-90">
                <circle cx="32" cy="32" r={R} fill="none" stroke="var(--color-areia-escura)" strokeWidth="6" />
                <circle
                  cx="32" cy="32" r={R} fill="none" stroke="var(--color-juncao)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={offset} className="transition-all duration-700"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                {/* "100%" tem 4 caracteres e estourava o anel — diminui a fonte só nesse caso. */}
                <span className={`fonte-display font-extrabold leading-none text-tinta ${pct >= 100 ? 'text-lg' : 'text-2xl'}`}>{pct}%</span>
                <span className="text-[10px] font-semibold text-tinta-suave">em dia</span>
              </div>
            </div>
          </div>

          <MiniStat emoji="🔥" valor={`${data.streak_semanas}`} rotulo={data.streak_semanas === 1 ? 'semana seguida' : 'semanas seguidas'} cor="var(--color-juncao)" />
          <MiniStat emoji="✅" valor={`${data.realizados_ult_30}`} rotulo="feitos · 30d" cor="var(--color-sucesso)" />
          <MiniStat emoji="⏰" valor={`${data.atrasados}`} rotulo="atrasados" cor="#f59e0b" />
        </div>

        <p className="mt-4 text-center text-sm font-medium text-tinta-suave">{recado}</p>
      </div>
    </section>
  )
}
