// Arquivo: src/componentes/admin/SecaoAcessos.tsx
// Descrição: Aba "Acessos" do painel de admin — o gráfico estilo Google Analytics:
//            logins, usuários ativos (distintos) e eventos por dia, no período escolhido.

import { useAcessos } from '@/recursos/admin/adminApi'
import { Cartao, CartaoKPI, Carregando, GraficoLinhas, TituloSecao, Vazio } from './Graficos'
import type { SerieLinha } from './Graficos'

export function SecaoAcessos({ dias, ativo }: { dias: number; ativo: boolean }) {
  const { data, isLoading } = useAcessos(dias, ativo)

  if (isLoading && !data) return <Carregando altura="h-72" />
  if (!data) return null

  const totalEventos = data.eventos.reduce((a, b) => a + b, 0)
  const picoAtivos = Math.max(0, ...data.ativos)

  const series: SerieLinha[] = [
    { nome: 'Logins', cor: 'var(--color-juncao)', valores: data.logins },
    { nome: 'Usuários ativos', cor: 'var(--color-gestor)', valores: data.ativos },
    { nome: 'Eventos', cor: 'var(--color-liderado)', valores: data.eventos },
  ]

  const vazio = data.total_logs === 0 && totalEventos === 0

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        <CartaoKPI emoji="🔑" valor={data.total_logs} rotulo={`Logins · ${dias}d`} cor="var(--color-juncao)" />
        <CartaoKPI emoji="⚡" valor={totalEventos} rotulo={`Eventos · ${dias}d`} cor="var(--color-liderado)" />
        <CartaoKPI emoji="📈" valor={picoAtivos} rotulo="Pico de ativos/dia" cor="var(--color-gestor)" />
      </div>

      <section>
        <TituloSecao>Acessos por dia</TituloSecao>
        {vazio ? (
          <Vazio emoji="📉" titulo="Ainda não há acessos registrados no período." sub="Logins e atividade aparecem aqui conforme o uso." />
        ) : (
          <Cartao>
            <GraficoLinhas labels={data.dias} series={series} altura={220} />
          </Cartao>
        )}
      </section>
    </div>
  )
}
