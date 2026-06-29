// Arquivo: src/componentes/pauta/TabuleiroPauta.tsx
// Descrição: O Tabuleiro do 1:1. Orquestra o drag-and-drop (dnd-kit) das três
//            colunas: mover um tema ENTRE colunas e reordenar DENTRO de uma
//            coluna. O estado do tabuleiro vem da página (para a gamificação
//            reagir junto).
//
//            Padrão "múltiplos contêineres" do dnd-kit:
//              onDragOver  → move o item entre colunas em tempo real
//              onDragEnd   → finaliza a posição (reordena dentro da coluna)

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

import type { ColunaId, Tabuleiro, Tema } from '@/recursos/pauta/tipos'
import { COLUNAS } from '@/recursos/pauta/tipos'
import { ColunaTabuleiro } from './ColunaTabuleiro'
import { CartaoTema } from './CartaoTema'

interface TabuleiroPautaProps {
  tabuleiro: Tabuleiro
  // Atualizador do estado do tabuleiro (mesma assinatura do setState da página).
  setTabuleiro: React.Dispatch<React.SetStateAction<Tabuleiro>>
  // Quando informado (1:1 de um liderado), cada tema abre o editor de conteúdo.
  aoAbrirTema?: (tema: Tema) => void
}

export function TabuleiroPauta({ tabuleiro, setTabuleiro, aoAbrirTema }: TabuleiroPautaProps) {
  // Tema atualmente sendo arrastado (mostrado "flutuando" no DragOverlay).
  const [temaAtivo, setTemaAtivo] = useState<Tema | null>(null)

  // Sensores: mouse/toque (com pequena distância para não confundir com clique)
  // e teclado (acessibilidade — arrastar com as setas).
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Descobre em qual coluna está um id — que pode ser o id de um tema OU o id
  // da própria coluna (quando se solta numa área vazia).
  function colunaDe(id: string): ColunaId | undefined {
    if (id === 'banco' || id === 'pauta' || id === 'conversado') {
      return id
    }
    return (Object.keys(tabuleiro) as ColunaId[]).find((coluna) =>
      tabuleiro[coluna].some((tema) => tema.id === id),
    )
  }

  function aoIniciar(evento: DragStartEvent) {
    const id = String(evento.active.id)
    const coluna = colunaDe(id)
    if (coluna) {
      setTemaAtivo(tabuleiro[coluna].find((t) => t.id === id) ?? null)
    }
  }

  // Move o tema entre colunas enquanto ainda está sendo arrastado (feedback vivo).
  function aoArrastarSobre(evento: DragOverEvent) {
    const { active, over } = evento
    if (!over) return

    const idAtivo = String(active.id)
    const idAlvo = String(over.id)

    const origem = colunaDe(idAtivo)
    const destino = colunaDe(idAlvo)
    if (!origem || !destino || origem === destino) return

    setTabuleiro((anterior) => {
      const itensOrigem = anterior[origem]
      const itensDestino = anterior[destino]
      const indice = itensOrigem.findIndex((t) => t.id === idAtivo)
      const tema = itensOrigem[indice]
      if (!tema) return anterior

      // Posição de inserção no destino: sobre o cartão alvo, ou no fim se for a coluna.
      const indiceAlvo = itensDestino.findIndex((t) => t.id === idAlvo)
      const posicao = indiceAlvo >= 0 ? indiceAlvo : itensDestino.length

      return {
        ...anterior,
        [origem]: itensOrigem.filter((t) => t.id !== idAtivo),
        [destino]: [
          ...itensDestino.slice(0, posicao),
          tema,
          ...itensDestino.slice(posicao),
        ],
      }
    })
  }

  // Finaliza o arraste: reordena dentro da coluna de destino.
  function aoFinalizar(evento: DragEndEvent) {
    const { active, over } = evento
    setTemaAtivo(null)
    if (!over) return

    const idAtivo = String(active.id)
    const idAlvo = String(over.id)

    const coluna = colunaDe(idAtivo)
    if (!coluna || colunaDe(idAlvo) !== coluna) return

    const itens = tabuleiro[coluna]
    const de = itens.findIndex((t) => t.id === idAtivo)
    const para = itens.findIndex((t) => t.id === idAlvo)
    if (de !== para && para >= 0) {
      setTabuleiro((anterior) => ({
        ...anterior,
        [coluna]: arrayMove(anterior[coluna], de, para),
      }))
    }
  }

  // Adiciona um novo tema ao banco (proposto pelo gestor por padrão).
  function adicionarAoBanco(titulo: string) {
    const novo: Tema = {
      id: crypto.randomUUID(),
      titulo,
      emoji: '✏️',
      autor: 'gestor',
    }
    setTabuleiro((anterior) => ({ ...anterior, banco: [...anterior.banco, novo] }))
  }

  return (
    <DndContext
      sensors={sensores}
      collisionDetection={closestCorners}
      onDragStart={aoIniciar}
      onDragOver={aoArrastarSobre}
      onDragEnd={aoFinalizar}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {COLUNAS.map((coluna) => (
          <ColunaTabuleiro
            key={coluna.id}
            id={coluna.id}
            titulo={coluna.titulo}
            dica={coluna.dica}
            cor={coluna.cor}
            temas={tabuleiro[coluna.id]}
            aoAdicionar={coluna.id === 'banco' ? adicionarAoBanco : undefined}
            aoAbrirTema={aoAbrirTema}
          />
        ))}
      </div>

      {/* "Fantasma" do cartão enquanto arrasta — segue o cursor com leve giro. */}
      <DragOverlay>
        {temaAtivo ? <CartaoTema tema={temaAtivo} sobreposicao /> : null}
      </DragOverlay>
    </DndContext>
  )
}
