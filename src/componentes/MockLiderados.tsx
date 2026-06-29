// Arquivo: src/componentes/MockLiderados.tsx
// Descrição: Visual ilustrativo do "olhar do gestor" — a lista do time com o
//            sentimento e a evolução do PDI de cada liderado. Comunica o conceito
//            1:N (um gestor, vários liderados) de forma concreta e acolhedora.
//            É decorativo (dados de exemplo), usado na landing.

interface LideradoExemplo {
  inicial: string
  nome: string
  cargo: string
  cor: string
  humor: string // emoji do sentimento da semana
  pdi: number // evolução do PDI em %
}

const TIME: LideradoExemplo[] = [
  { inicial: 'A', nome: 'Ana Souza', cargo: 'Designer', cor: 'var(--color-liderado)', humor: '😄', pdi: 82 },
  { inicial: 'B', nome: 'Bruno Lima', cargo: 'Desenvolvedor', cor: 'var(--color-gestor)', humor: '🙂', pdi: 56 },
  { inicial: 'C', nome: 'Carla Dias', cargo: 'Produto', cor: 'var(--color-juncao)', humor: '😟', pdi: 34 },
  { inicial: 'D', nome: 'Diego Reis', cargo: 'Dados', cor: 'var(--color-liderado)', humor: '😄', pdi: 71 },
]

function LinhaLiderado({ pessoa }: { pessoa: LideradoExemplo }) {
  return (
    <li className="flex items-center gap-3 rounded-[var(--radius-suave)] border border-borda bg-areia px-3 py-2.5">
      {/* Avatar da pessoa */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: pessoa.cor }}
      >
        {pessoa.inicial}
      </div>

      {/* Nome e cargo */}
      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-tinta">{pessoa.nome}</span>
        <span className="block truncate text-xs text-tinta-suave">{pessoa.cargo}</span>
      </div>

      {/* Sentimento da semana */}
      <span className="text-lg" title="Sentimento da semana">
        {pessoa.humor}
      </span>

      {/* Evolução do PDI */}
      <div className="w-16 shrink-0">
        <span className="mb-1 block text-right text-[0.65rem] font-bold uppercase tracking-wider text-tinta-suave">
          PDI {pessoa.pdi}%
        </span>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-areia-escura">
          <div
            className="gradiente-marca h-full rounded-full"
            style={{ width: `${pessoa.pdi}%` }}
          />
        </div>
      </div>
    </li>
  )
}

export function MockLiderados() {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-grande)] border border-borda bg-creme p-6 shadow-[var(--shadow-flutuante)]">
      {/* Brilho suave de fundo */}
      <div
        aria-hidden
        className="gradiente-marca pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-[0.12] blur-3xl"
      />

      <header className="relative mb-4 flex items-center justify-between">
        <div>
          <h3 className="fonte-display text-lg font-bold text-tinta">Seu time</h3>
          <span className="text-xs text-tinta-suave">4 pessoas · acompanhadas de perto</span>
        </div>
        <span className="rounded-full bg-juncao-claro px-3 py-1 text-xs font-bold text-juncao">
          Tudo num lugar só
        </span>
      </header>

      <ul className="relative flex flex-col gap-2.5">
        {TIME.map((pessoa) => (
          <LinhaLiderado key={pessoa.nome} pessoa={pessoa} />
        ))}
      </ul>
    </div>
  )
}
