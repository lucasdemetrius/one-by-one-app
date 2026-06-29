// Arquivo: src/paginas/PaginaMonitor.tsx
// Descrição: Página dedicada da Matrix9-Box. Casca fina: cabeçalho + ajuda e o
//            componente reutilizável <MatrixNineBox> (também embutido no painel).

import { LayoutApp } from './LayoutApp'
import { Ajuda } from '@/componentes/ui/Ajuda'
import { MatrixNineBox } from '@/componentes/matrix/MatrixNineBox'
import { useOrganizacoes } from '@/recursos/time/hooks'

export function PaginaMonitor() {
  const orgsQ = useOrganizacoes()
  const org = orgsQ.data?.[0]

  return (
    <LayoutApp>
      <div className="mb-6">
        <span className="text-sm font-bold uppercase tracking-wider text-juncao">Visão do time</span>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="fonte-display text-2xl font-extrabold text-tinta sm:text-3xl">Matrix9-Box</h1>
          <Ajuda titulo="Como usar a Matrix9-Box" alinhar="esquerda">
            Arraste cada liderado para o quadrante que combina o{' '}
            <strong className="text-tinta">desempenho</strong> (eixo horizontal) com o{' '}
            <strong className="text-tinta">potencial</strong> (eixo vertical). O canto superior
            direito reúne os destaques; o inferior esquerdo, quem precisa de atenção. A posição é
            salva automaticamente.
          </Ajuda>
        </div>
        <p className="mt-1 max-w-2xl text-tinta-suave">
          Posicione cada liderado por <strong className="text-tinta">desempenho</strong> e{' '}
          <strong className="text-tinta">potencial</strong>. Acompanhe a evolução, destaque quem
          brilha e antecipe quem precisa de atenção.
        </p>
      </div>

      {!org ? (
        <p className="text-tinta-suave">Crie sua organização e adicione liderados primeiro.</p>
      ) : (
        <MatrixNineBox org={org} />
      )}
    </LayoutApp>
  )
}
