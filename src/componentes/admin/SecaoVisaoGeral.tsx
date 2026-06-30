// Arquivo: src/componentes/admin/SecaoVisaoGeral.tsx
// Descrição: Aba "Visão geral" do painel de admin — os cartões de KPI da plataforma:
//            contas por papel, atividade (DAU/WAU/logins) e estrutura.

import { useVisaoGeral } from '@/recursos/admin/adminApi'
import { CartaoKPI, Carregando, TituloSecao } from './Graficos'

export function SecaoVisaoGeral({ ativo }: { ativo: boolean }) {
  const { data, isLoading } = useVisaoGeral(ativo)

  if (isLoading && !data) return <Carregando altura="h-64" />
  if (!data) return null

  const { contas, estrutura, atividade } = data

  // Plataforma recém-criada (só a conta admin): explica o que esperar, para o admin não
  // achar que algo quebrou ao ver tudo zerado.
  const comecando = contas.total <= 1

  return (
    <div className="flex flex-col gap-8">
      {comecando && (
        <div className="flex items-start gap-3 rounded-[var(--radius-cartao)] border border-juncao/25 bg-juncao/5 p-4">
          <span className="text-2xl">🌱</span>
          <div>
            <p className="text-sm font-bold text-tinta">Sua plataforma está começando.</p>
            <p className="mt-0.5 text-sm text-tinta-suave">
              Por enquanto só existe a conta de administrador. Assim que contas de RH, gestores e liderados
              forem criadas e o app começar a ser usado, os indicadores, gráficos e acessos aparecem aqui
              automaticamente — não precisa configurar nada.
            </p>
          </div>
        </div>
      )}

      {/* Contas */}
      <section>
        <TituloSecao>Contas</TituloSecao>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <CartaoKPI emoji="👥" valor={contas.total} rotulo="Ativas" cor="var(--color-juncao)" />
          <CartaoKPI emoji="🏢" valor={contas.rh} rotulo="RH" cor="var(--color-juncao)" />
          <CartaoKPI emoji="🧑‍💼" valor={contas.gestores} rotulo="Gestores" cor="var(--color-gestor)" />
          <CartaoKPI emoji="🌱" valor={contas.liderados} rotulo="Liderados" cor="var(--color-liderado)" />
          <CartaoKPI emoji="✨" valor={contas.novas_30d} rotulo="Novas · 30d" cor="var(--color-sucesso)" />
          <CartaoKPI emoji="💤" valor={contas.inativas} rotulo="Inativas" cor="var(--color-tinta-suave)" />
        </div>
      </section>

      {/* Atividade */}
      <section>
        <TituloSecao>Atividade</TituloSecao>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <CartaoKPI emoji="🟢" valor={atividade.ativos_hoje} rotulo="Ativos hoje (DAU)" cor="var(--color-sucesso)" />
          <CartaoKPI emoji="📅" valor={atividade.ativos_7d} rotulo="Ativos · 7d (WAU)" cor="var(--color-gestor)" />
          <CartaoKPI emoji="🗓️" valor={atividade.ativos_30d} rotulo="Ativos · 30d (MAU)" cor="var(--color-juncao)" />
          <CartaoKPI emoji="🔑" valor={atividade.logins_7d} rotulo="Logins · 7d" cor="var(--color-juncao)" />
          <CartaoKPI emoji="🤝" valor={atividade.realizados_total} rotulo="1:1 realizados" cor="var(--color-liderado)" />
          <CartaoKPI emoji="⚡" valor={atividade.eventos_hoje} rotulo="Eventos hoje" cor="var(--color-tinta-suave)" />
        </div>
      </section>

      {/* Estrutura */}
      <section>
        <TituloSecao>Estrutura</TituloSecao>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <CartaoKPI emoji="🏛️" valor={estrutura.organizacoes} rotulo="Organizações" cor="var(--color-gestor)" />
          <CartaoKPI emoji="👨‍👩‍👧" valor={estrutura.equipes} rotulo="Equipes" cor="var(--color-gestor)" />
          <CartaoKPI emoji="🧑‍🤝‍🧑" valor={estrutura.colaboradores} rotulo="Colaboradores" cor="var(--color-liderado)" />
          <CartaoKPI emoji="✅" valor={estrutura.colaboradores_com_conta} rotulo="Com conta aceita" cor="var(--color-sucesso)" />
        </div>
      </section>
    </div>
  )
}
