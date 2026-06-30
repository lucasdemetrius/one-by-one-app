// Arquivo: src/componentes/admin/SecaoCrescimento.tsx
// Descrição: Aba "Crescimento" do painel de admin — novos cadastros por dia (por papel),
//            a curva acumulada de contas e os 1:1 realizados por dia, no período.

import { useCrescimento } from '@/recursos/admin/adminApi'
import { Cartao, CartaoKPI, Carregando, GraficoLinhas, TituloSecao, Vazio } from './Graficos'
import type { SerieLinha } from './Graficos'

export function SecaoCrescimento({ dias, ativo }: { dias: number; ativo: boolean }) {
  const { data, isLoading } = useCrescimento(dias, ativo)

  if (isLoading && !data) return <Carregando altura="h-72" />
  if (!data) return null

  const totalNovos = data.novos_total.reduce((a, b) => a + b, 0)
  const totalRealizados = data.realizados.reduce((a, b) => a + b, 0)

  const seriesNovos: SerieLinha[] = [
    { nome: 'Gestores', cor: 'var(--color-gestor)', valores: data.novos_gestores },
    { nome: 'Liderados', cor: 'var(--color-liderado)', valores: data.novos_liderados },
    { nome: 'RH', cor: 'var(--color-juncao)', valores: data.novos_rh },
  ]
  const seriesAcumulado: SerieLinha[] = [{ nome: 'Contas (acumulado)', cor: 'var(--color-sucesso)', valores: data.acumulado_total }]
  const seriesRealizados: SerieLinha[] = [{ nome: '1:1 realizados', cor: 'var(--color-liderado)', valores: data.realizados }]

  if (totalNovos === 0 && totalRealizados === 0) {
    return <Vazio emoji="📈" titulo="Sem novos cadastros nem 1:1 no período." sub="Aumente a janela ou aguarde mais atividade." />
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3">
        <CartaoKPI emoji="✨" valor={totalNovos} rotulo={`Novas contas · ${dias}d`} cor="var(--color-sucesso)" />
        <CartaoKPI emoji="🤝" valor={totalRealizados} rotulo={`1:1 realizados · ${dias}d`} cor="var(--color-liderado)" />
      </div>

      <section>
        <TituloSecao>Novos cadastros por dia</TituloSecao>
        <Cartao>
          <GraficoLinhas labels={data.dias} series={seriesNovos} altura={180} />
        </Cartao>
      </section>

      <section>
        <TituloSecao>Total acumulado de contas</TituloSecao>
        <Cartao>
          <GraficoLinhas labels={data.dias} series={seriesAcumulado} altura={180} />
        </Cartao>
      </section>

      <section>
        <TituloSecao>1:1 realizados por dia</TituloSecao>
        <Cartao>
          <GraficoLinhas labels={data.dias} series={seriesRealizados} altura={160} />
        </Cartao>
      </section>
    </div>
  )
}
