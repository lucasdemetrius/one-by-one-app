// Arquivo: src/componentes/admin/SecaoSaude.tsx
// Descrição: Aba "Saúde" do painel de admin — indicadores de engajamento/adoção da
//            plataforma + ranking dos gestores mais engajados. Consome GET /admin/saude.

import { useSaude } from '@/recursos/admin/adminApi'
import { Anel, Cartao, CartaoKPI, Carregando, TituloSecao, Vazio } from './Graficos'

export function SecaoSaude({ ativo }: { ativo: boolean }) {
  const { data, isLoading } = useSaude(ativo)

  if (isLoading && !data) return <Carregando altura="h-64" />
  if (!data) return null
  if (data.gestores === 0)
    return (
      <Vazio
        emoji="🌱"
        titulo="Ainda não há gestores na plataforma."
        sub="Quando gestores forem criados e começarem os 1:1, os indicadores de engajamento e adoção aparecem aqui."
      />
    )

  return (
    <div className="flex flex-col gap-8">
      {/* Anéis de adoção */}
      <section>
        <TituloSecao>Engajamento</TituloSecao>
        <Cartao>
          <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-4">
            <Anel
              pct={data.pct_gestores_engajados}
              cor="var(--color-sucesso)"
              titulo="Gestores ativos"
              sub={`${data.gestores_com_1a1} de ${data.gestores} já fizeram 1:1`}
            />
            <Anel
              pct={data.pct_liderados_vinculados}
              cor="var(--color-gestor)"
              titulo="Liderados com conta"
              sub={`${data.liderados_com_conta} de ${data.liderados_ativos} aceitaram`}
            />
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="fonte-display text-3xl font-extrabold text-tinta">{data.media_liderados_por_gestor}</span>
              <span className="text-sm font-bold text-tinta">Liderados / gestor</span>
              <span className="text-[11px] font-semibold text-tinta-suave">média na plataforma</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="fonte-display text-3xl font-extrabold text-tinta">{data.gestores_sem_1a1}</span>
              <span className="text-sm font-bold text-tinta">Gestores sem 1:1</span>
              <span className="text-[11px] font-semibold text-tinta-suave">ainda não começaram</span>
            </div>
          </div>
        </Cartao>
      </section>

      {/* Adoção de recursos */}
      <section>
        <TituloSecao>Adoção</TituloSecao>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <CartaoKPI emoji="🤖" valor={data.contas_com_ia} rotulo="Contas com IA" cor="var(--color-juncao)" />
          <CartaoKPI emoji="📷" valor={data.contas_com_foto} rotulo="Contas com foto" cor="var(--color-gestor)" />
          <CartaoKPI emoji="🤝" valor={data.realizados_30d} rotulo="1:1 realizados · 30d" cor="var(--color-liderado)" />
        </div>
      </section>

      {/* Ranking de gestores */}
      <section>
        <TituloSecao>Gestores mais engajados</TituloSecao>
        {data.top_gestores.length === 0 ? (
          <p className="rounded-[var(--radius-cartao)] border border-dashed border-borda bg-creme/50 p-6 text-center text-sm text-tinta-suave">
            Nenhum gestor com 1:1 ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.top_gestores.map((g, i) => (
              <div key={g.id} className="flex items-center gap-3 rounded-[var(--radius-cartao)] border border-borda bg-creme p-3 shadow-[var(--shadow-cartao)]">
                <span className="fonte-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-areia-escura text-sm font-extrabold text-tinta">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-tinta">{g.nome}</span>
                  <span className="block truncate text-xs text-tinta-suave">{g.email}</span>
                </div>
                <div className="flex items-center gap-4 text-center">
                  <span className="flex flex-col">
                    <span className="fonte-display text-sm font-bold text-liderado">{g.realizados}</span>
                    <span className="text-[0.6rem] text-tinta-suave">1:1</span>
                  </span>
                  <span className="flex flex-col">
                    <span className="fonte-display text-sm font-bold text-gestor">{g.liderados}</span>
                    <span className="text-[0.6rem] text-tinta-suave">liderados</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
