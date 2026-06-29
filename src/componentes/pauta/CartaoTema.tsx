// Arquivo: src/componentes/pauta/CartaoTema.tsx
// Descrição: Cartão de um tema da pauta. É arrastável (drag-and-drop via dnd-kit)
//            e mostra o emoji, o título e um selo da persona que propôs o tema.

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { Tema } from '@/recursos/pauta/tipos'

interface CartaoTemaProps {
  tema: Tema
  // true quando o cartão é o "fantasma" exibido no DragOverlay (enquanto arrasta).
  sobreposicao?: boolean
  // Quando informado, mostra o botão de abrir o conteúdo do tema (editor).
  aoAbrir?: (tema: Tema) => void
}

export function CartaoTema({ tema, sobreposicao = false, aoAbrir }: CartaoTemaProps) {
  // useSortable conecta este cartão ao motor de drag-and-drop do dnd-kit.
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tema.id })

  // Aplica a posição/transição calculadas pelo dnd-kit.
  const estilo = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Cor da persona que propôs o tema (gestor = petróleo, liderado = terracota).
  const corAutor =
    tema.autor === 'gestor' ? 'var(--color-gestor)' : 'var(--color-liderado)'

  return (
    <div
      ref={setNodeRef}
      style={estilo}
      {...attributes}
      {...listeners}
      className={[
        'group flex cursor-grab items-center gap-3 rounded-[var(--radius-suave)]',
        'border-2 border-borda bg-creme px-3.5 py-3 shadow-[var(--shadow-cartao)]',
        'active:cursor-grabbing touch-none select-none',
        // Enquanto arrasta, o cartão original some (o fantasma aparece no overlay).
        isDragging ? 'opacity-30' : 'opacity-100',
        // O fantasma no overlay ganha um leve giro e mais sombra.
        sobreposicao ? 'rotate-2 shadow-[var(--shadow-flutuante)]' : '',
      ].join(' ')}
    >
      {/* Alça de arraste (afinidade visual; o cartão inteiro também arrasta) */}
      <span className="text-tinta-suave/40 group-hover:text-tinta-suave">⠿</span>

      <span className="text-xl leading-none">{tema.emoji}</span>

      {/* O título: clicável para abrir o conteúdo quando aoAbrir é informado.
          stopPropagation no pointerdown para o clique não virar arraste
          (o dnd-kit só arrasta após mover 6px, mas garantimos mesmo assim). */}
      {aoAbrir ? (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => aoAbrir(tema)}
          title="Abrir conteúdo do tema"
          className="flex-1 text-left text-sm font-semibold leading-snug text-tinta transition hover:text-juncao"
        >
          {tema.titulo}
        </button>
      ) : (
        <span className="flex-1 text-sm font-semibold leading-snug text-tinta">
          {tema.titulo}
        </span>
      )}

      {/* Selo da persona que propôs o tema */}
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold text-white"
        style={{ backgroundColor: corAutor }}
        title={tema.autor === 'gestor' ? 'Proposto pelo gestor' : 'Proposto pelo liderado'}
      >
        {tema.autor === 'gestor' ? 'G' : 'L'}
      </span>

      {/* Botão de abrir o conteúdo do tema (só no 1:1 de um liderado).
          Rótulo "Abrir" + chevron para ficar óbvio que o tema tem conteúdo.
          stopPropagation no pointerdown para não iniciar o arraste ao clicar. */}
      {aoAbrir && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => aoAbrir(tema)}
          aria-label="Abrir conteúdo do tema"
          title="Abrir conteúdo do tema"
          className="flex shrink-0 items-center gap-1 rounded-full border border-borda bg-areia px-2.5 py-1 text-xs font-bold text-tinta-suave transition hover:border-juncao hover:bg-juncao/10 hover:text-juncao"
        >
          Abrir <span className="text-sm leading-none">›</span>
        </button>
      )}
    </div>
  )
}
