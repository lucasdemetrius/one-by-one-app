// Arquivo: src/componentes/pauta/ColunaTabuleiro.tsx
// Descrição: Uma coluna do Tabuleiro do 1:1. É uma área "soltável" (droppable)
//            que contém a lista ordenável de cartões de tema. A coluna "banco"
//            ainda exibe um campo para adicionar um novo tema.

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import type { ColunaId, Tema } from '@/recursos/pauta/tipos'
import { CartaoTema } from './CartaoTema'

interface ColunaTabuleiroProps {
  id: ColunaId
  titulo: string
  dica: string
  cor: 'borda' | 'gestor' | 'juncao'
  temas: Tema[]
  // Quando informado, mostra o campo de adicionar tema (usado só no banco).
  aoAdicionar?: (titulo: string) => void
  // Quando informado, cada tema ganha o botão de abrir o editor de conteúdo.
  aoAbrirTema?: (tema: Tema) => void
}

// Mapeia o token de cor da coluna para as classes de destaque do cabeçalho.
const corCabecalho: Record<ColunaTabuleiroProps['cor'], string> = {
  borda: 'text-tinta-suave',
  gestor: 'text-gestor',
  juncao: 'text-juncao',
}

export function ColunaTabuleiro({
  id,
  titulo,
  dica,
  cor,
  temas,
  aoAdicionar,
  aoAbrirTema,
}: ColunaTabuleiroProps) {
  // Torna a coluna um alvo de "soltar" — essencial para aceitar cartões mesmo
  // quando a coluna está vazia.
  const { setNodeRef, isOver } = useDroppable({ id })

  const [novoTitulo, setNovoTitulo] = useState('')

  function enviarNovo(evento: React.FormEvent) {
    evento.preventDefault()
    const limpo = novoTitulo.trim()
    if (!limpo || !aoAdicionar) return
    aoAdicionar(limpo)
    setNovoTitulo('')
  }

  return (
    <section className="flex min-h-0 flex-col rounded-[var(--radius-cartao)] bg-areia-escura p-3">
      {/* Cabeçalho da coluna: título, contador e dica */}
      <header className="mb-3 px-1">
        <div className="flex items-center justify-between">
          <h3
            className={[
              'fonte-display text-base font-semibold',
              corCabecalho[cor],
            ].join(' ')}
          >
            {titulo}
          </h3>
          <span className="rounded-full bg-creme px-2 py-0.5 text-xs font-bold text-tinta-suave">
            {temas.length}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-tinta-suave">{dica}</p>
      </header>

      {/* Lista ordenável de cartões. min-h garante área de "soltar" mesmo vazia. */}
      <div
        ref={setNodeRef}
        className={[
          'flex flex-1 flex-col gap-2 rounded-[var(--radius-suave)] p-1 transition-colors',
          'min-h-24',
          isOver ? 'bg-creme/60' : 'bg-transparent',
        ].join(' ')}
      >
        <SortableContext items={temas.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {temas.map((tema) => (
            <CartaoTema key={tema.id} tema={tema} aoAbrir={aoAbrirTema} />
          ))}
        </SortableContext>

        {/* Estado vazio: convida a arrastar um tema para cá */}
        {temas.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-[var(--radius-suave)] border-2 border-dashed border-borda py-6 text-center text-xs text-tinta-suave/70">
            Arraste um tema para cá
          </div>
        )}
      </div>

      {/* Campo de adicionar tema (apenas no banco) */}
      {aoAdicionar && (
        <form onSubmit={enviarNovo} className="mt-3 flex gap-2">
          <input
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
            placeholder="Novo tema…"
            className="min-w-0 flex-1 rounded-[var(--radius-suave)] border-2 border-borda bg-creme px-3 py-2 text-sm text-tinta outline-none placeholder:text-tinta-suave/60 focus:border-juncao"
          />
          <button
            type="submit"
            className="shrink-0 rounded-[var(--radius-suave)] bg-tinta px-3 py-2 text-sm font-bold text-creme transition-[filter] hover:brightness-125"
            aria-label="Adicionar tema"
          >
            +
          </button>
        </form>
      )}
    </section>
  )
}
