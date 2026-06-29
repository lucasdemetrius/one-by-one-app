// Arquivo: src/componentes/estrutura/MoverEquipe.tsx
// Descrição: Controle de "mover para equipe" que aparece SÓ no celular (sm:hidden).
//            No desktop o gestor arrasta o liderado entre colunas; no celular o
//            arraste é ruim, então oferecemos um <select> com as equipes (move na
//            hora, via a mesma mutação do arraste). Não inicia arraste (stopPropagation).

import { useEquipes, useAtualizarColaborador } from '@/recursos/time/hooks'
import type { Colaborador, Organizacao } from '@/recursos/time/tipos'

export function MoverEquipe({ colaborador, org }: { colaborador: Colaborador; org: Organizacao }) {
  const equipesQ = useEquipes(org.id)
  const mover = useAtualizarColaborador(org.id)
  const equipes = equipesQ.data ?? []

  // Sem outra equipe pra onde mover, não mostra nada.
  if (equipes.length <= 1) return null

  return (
    <select
      value={colaborador.equipe_id}
      onPointerDown={(e) => e.stopPropagation()}
      onChange={(e) => mover.mutate({ id: colaborador.id, dados: { equipe_id: e.target.value } })}
      title="Mover para outra equipe"
      aria-label="Mover para outra equipe"
      className="rounded-full border-2 border-borda bg-areia px-2 py-1 text-xs font-bold text-tinta outline-none focus:border-juncao sm:hidden"
    >
      {equipes.map((eq) => (
        <option key={eq.id} value={eq.id}>
          ⇄ {eq.nome}
        </option>
      ))}
    </select>
  )
}
