// Arquivo: src/componentes/admin/SecaoUso.tsx
// Descrição: Aba "Uso" do painel de admin — COMO a plataforma é usada: funcionalidades
//            mais usadas, atividade por hora do dia e por dia da semana, e por papel.

import { useUso } from '@/recursos/admin/adminApi'
import { BarrasHorizontais, Cartao, Carregando, GraficoBarras, TituloSecao, Vazio } from './Graficos'
import { PAPEL_LABEL } from './formatos'

export function SecaoUso({ dias, ativo }: { dias: number; ativo: boolean }) {
  const { data, isLoading } = useUso(dias, ativo)

  if (isLoading && !data) return <Carregando altura="h-72" />
  if (!data) return null

  const totalUso = data.top_funcionalidades.reduce((a, f) => a + f.total, 0)
  if (totalUso === 0 && data.por_papel.length === 0) {
    return <Vazio emoji="🧭" titulo="Sem uso registrado no período." sub="As distribuições aparecem conforme as pessoas usam o app." />
  }

  const topFunc = data.top_funcionalidades.map((f) => ({ rotulo: `${f.entidade} · ${f.acao}`, total: f.total }))
  const porPapel = data.por_papel.map((p) => ({ rotulo: PAPEL_LABEL[p.rotulo] ?? p.rotulo, total: p.total }))

  return (
    <div className="flex flex-col gap-8">
      <section>
        <TituloSecao>Funcionalidades mais usadas</TituloSecao>
        <Cartao>
          <BarrasHorizontais itens={topFunc} cor="var(--color-juncao)" />
        </Cartao>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <TituloSecao>Por hora do dia</TituloSecao>
          <Cartao>
            <GraficoBarras itens={data.por_hora} cor="var(--color-gestor)" altura={150} />
          </Cartao>
        </section>
        <section>
          <TituloSecao>Por dia da semana</TituloSecao>
          <Cartao>
            <GraficoBarras itens={data.por_dia_semana} cor="var(--color-liderado)" altura={150} />
          </Cartao>
        </section>
      </div>

      <section>
        <TituloSecao>Atividade por papel</TituloSecao>
        <Cartao>
          <BarrasHorizontais itens={porPapel} cor="var(--color-gestor)" />
        </Cartao>
      </section>
    </div>
  )
}
