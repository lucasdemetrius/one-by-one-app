// Arquivo: src/componentes/PainelCoop.tsx
// Descrição: Visualização "co-op" da marca — as duas personas (Gestor e Liderado)
//            lado a lado, com a pauta entre elas e o medidor de sincronia. Anéis
//            com gradiente, cartões vivos e um selo de sequência. Preenche todo o
//            espaço do contêiner.
//
//            IMPORTANTE: o conteúdo é VISÍVEL POR PADRÃO (sem depender de animação
//            de entrada), para nunca ficar invisível.

// Avatar de persona dentro de um anel com o gradiente da marca (toque premium).
function Persona({
  inicial,
  papel,
  cor,
}: {
  inicial: string
  papel: string
  cor: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="gradiente-marca rounded-full p-[3px] shadow-[var(--shadow-flutuante)]">
        <div className="rounded-full bg-creme p-[3px]">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-extrabold text-white"
            style={{ backgroundColor: cor }}
          >
            {inicial}
          </div>
        </div>
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-tinta-suave">
        {papel}
      </span>
    </div>
  )
}

export function PainelCoop() {
  const cartoes = [
    { texto: 'Como foi sua semana?', cor: 'var(--color-gestor)' },
    { texto: 'Quero falar de carreira', cor: 'var(--color-liderado)' },
    { texto: 'Meta do trimestre', cor: 'var(--color-juncao)' },
  ]

  return (
    <div className="relative flex h-full w-full flex-col justify-between gap-6 overflow-hidden rounded-[var(--radius-grande)] border border-borda bg-creme p-7 shadow-[var(--shadow-cartao)]">
      {/* Brilho suave do gradiente da marca ao fundo (dá vida e profundidade) */}
      <div
        aria-hidden
        className="gradiente-marca pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-[0.12] blur-3xl"
      />
      <div
        aria-hidden
        className="gradiente-marca pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full opacity-[0.1] blur-3xl"
      />

      {/* Topo: as duas personas BEM PRÓXIMAS, com o selo do 1:1 conectando os
          dois no meio (o "1:1" se sobrepõe levemente, reforçando a aproximação) */}
      <div className="relative flex items-start justify-center px-2">
        <Persona inicial="G" papel="Gestor" cor="var(--color-gestor)" />

        <div className="z-10 -mx-4 mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-creme fonte-display text-sm font-extrabold text-tinta shadow-[var(--shadow-flutuante)] ring-1 ring-borda">
          1:1
        </div>

        <Persona inicial="L" papel="Liderado" cor="var(--color-liderado)" />
      </div>

      {/* Meio: cartões de pauta com alça de arraste e ponto colorido */}
      <div className="relative flex flex-col gap-2.5">
        {cartoes.map((cartao) => (
          <div
            key={cartao.texto}
            className="flex items-center gap-3 rounded-[var(--radius-suave)] border border-borda bg-creme px-4 py-3 shadow-[var(--shadow-cartao)]"
          >
            <span className="text-tinta-suave/40">⠿</span>
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: cartao.cor }}
            />
            <span className="text-sm font-semibold text-tinta">{cartao.texto}</span>
          </div>
        ))}
      </div>

      {/* Base: medidor de sincronia + selo de sequência (gamificação sutil) */}
      <div className="relative flex items-center justify-between rounded-[var(--radius-suave)] bg-areia-escura px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-tinta-suave">
            Sincronia
          </span>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map((ponto) => (
              <span
                key={ponto}
                className={[
                  'h-2.5 w-2.5 rounded-full',
                  ponto < 4 ? 'gradiente-marca' : 'bg-borda',
                ].join(' ')}
              />
            ))}
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-creme px-2.5 py-1 text-xs font-bold text-tinta shadow-[var(--shadow-cartao)]">
          🔥 5 semanas
        </span>
      </div>
    </div>
  )
}
