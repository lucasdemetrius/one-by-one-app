// Arquivo: src/componentes/CartaoValor.tsx
// Descrição: Cartão de um "valor"/recurso do produto, usado na grade de recursos
//            da landing. Ícone em um tile colorido + título + descrição curta.

import type { Valor } from '@/recursos/conteudo/valores'

// Cor de fundo do tile do ícone, conforme a persona/acento do valor.
const corTile: Record<Valor['cor'], string> = {
  gestor: 'bg-gestor-claro',
  liderado: 'bg-liderado-claro',
  juncao: 'bg-juncao-claro',
}

export function CartaoValor({ valor }: { valor: Valor }) {
  return (
    <article className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-6 shadow-[var(--shadow-cartao)] transition-transform duration-300 hover:-translate-y-1">
      <div
        className={[
          'mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-suave)] text-2xl',
          corTile[valor.cor],
        ].join(' ')}
      >
        {valor.emoji}
      </div>
      <h3 className="fonte-display mb-1.5 text-lg font-bold text-tinta">
        {valor.titulo}
      </h3>
      <p className="text-sm leading-relaxed text-tinta-suave">{valor.descricao}</p>
    </article>
  )
}
