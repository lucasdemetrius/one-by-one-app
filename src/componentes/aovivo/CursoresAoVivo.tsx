// Arquivo: src/componentes/aovivo/CursoresAoVivo.tsx
// Descrição: Desenha os cursores dos outros participantes do 1:1 ao vivo, cada um
//            na cor da pessoa e com o nome. Posição em frações do viewport.

import { createPortal } from 'react-dom'

import type { CursorVivo, ParticipanteVivo } from '@/recursos/aovivo/useSalaAoVivo'

interface CursoresAoVivoProps {
  cursores: Record<string, CursorVivo>
  participantesPorId: Record<string, ParticipanteVivo>
}

export function CursoresAoVivo({ cursores, participantesPorId }: CursoresAoVivoProps) {
  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[60]">
      {Object.values(cursores).map((c) => {
        const p = participantesPorId[c.id]
        const cor = p?.cor ?? '#7c5cff'
        const nome = p?.nome?.split(' ')[0] ?? ''
        return (
          <div
            key={c.id}
            className="absolute flex items-start"
            style={{
              left: `${c.x * 100}%`,
              top: `${c.y * 100}%`,
              transition: 'left 0.06s linear, top 0.06s linear',
            }}
          >
            {/* Seta do cursor */}
            <svg width="20" height="20" viewBox="0 0 16 16" className="drop-shadow">
              <path
                d="M0 0 L0 12 L3.4 8.8 L5.8 14 L7.8 13.1 L5.4 8 L10 8 Z"
                fill={cor}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            {/* Nome */}
            <span
              className="ml-1 mt-2 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold text-white shadow"
              style={{ backgroundColor: cor }}
            >
              {nome}
            </span>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}
