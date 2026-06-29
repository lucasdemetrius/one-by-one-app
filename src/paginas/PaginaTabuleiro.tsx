// Arquivo: src/paginas/PaginaTabuleiro.tsx
// Descrição: Hub do "OneByOne ❤️" — a porta de entrada dos 1:1. Em vez de um
//            tabuleiro genérico (que confundia quando não havia ninguém), aqui o
//            gestor ESCOLHE com qual liderado fazer o 1:1 (cada cartão leva ao 1:1
//            ao vivo em /liderado/:id). Sem time ainda? Mostra um empty state que
//            convida a montar a estrutura no painel.

import { Link, Navigate } from 'react-router-dom'

import { LayoutApp } from './LayoutApp'
import { AvatarUsuario } from '@/componentes/marca/AvatarUsuario'
import { useAuth } from '@/recursos/auth/AuthContext'
import { useColaboradores, useMeuColaborador, useOrganizacoes } from '@/recursos/time/hooks'

export function PaginaTabuleiro() {
  const { usuario } = useAuth()
  // Um LIDERADO não escolhe ninguém nem monta time — ele vai DIRETO para o próprio 1:1.
  const ehLiderado = usuario?.role === 'COLABORADOR'
  const meuColQ = useMeuColaborador(ehLiderado)

  const orgsQ = useOrganizacoes()
  const orgId = orgsQ.data?.[0]?.id
  const colabsQ = useColaboradores(orgId)

  const carregando = orgsQ.isLoading || colabsQ.isLoading
  const liderados = (colabsQ.data ?? []).filter((c) => c.ativo)

  // Liderado: abre o PRÓPRIO board (sem onboarding de "monte seu time").
  if (ehLiderado) {
    if (meuColQ.isLoading) {
      return (
        <LayoutApp>
          <p className="text-tinta-suave">Abrindo seu 1:1…</p>
        </LayoutApp>
      )
    }
    if (meuColQ.data?.id) {
      return <Navigate to={`/liderado/${meuColQ.data.id}`} replace />
    }
    return (
      <LayoutApp>
        <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-6 text-tinta-suave">
          Seu acesso ainda não está vinculado a um 1:1. Peça ao seu gestor para te adicionar à equipe.
        </div>
      </LayoutApp>
    )
  }

  return (
    <LayoutApp>
      <div className="mb-6">
        <span className="text-sm font-bold uppercase tracking-wider text-juncao">OneByOne ❤️</span>
        <h1 className="fonte-display text-2xl font-extrabold text-tinta sm:text-3xl">Com quem é o 1:1 de hoje?</h1>
        <p className="mt-1 max-w-2xl text-tinta-suave">
          Escolha um liderado para abrir o 1:1 ao vivo — pauta, conteúdo dos temas e tudo
          sincronizado entre vocês dois.
        </p>
      </div>

      {carregando ? (
        <p className="text-tinta-suave">Carregando seu time…</p>
      ) : liderados.length === 0 ? (
        // Empty state — nada de 1:1 fantasma quando ainda não há ninguém.
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-cartao)] border-2 border-dashed border-borda bg-creme/50 px-6 py-16 text-center">
          <span className="text-5xl">🌱</span>
          <h2 className="fonte-display mt-3 text-xl font-extrabold text-tinta">
            Seu time ainda está vazio
          </h2>
          <p className="mt-1 max-w-md text-sm text-tinta-suave">
            Para iniciar um 1:1 você precisa de pelo menos um liderado. Monte sua estrutura
            (organização → equipe → liderado) no painel e volte aqui.
          </p>
          <Link
            to="/painel"
            className="gradiente-marca mt-5 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-cartao)] transition hover:brightness-105"
          >
            Montar meu time →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {liderados.map((c) => (
            <Link
              key={c.id}
              to={`/liderado/${c.id}`}
              className="group flex items-center gap-3 rounded-[var(--radius-cartao)] border border-borda bg-creme p-4 shadow-[var(--shadow-cartao)] transition-all hover:-translate-y-0.5 hover:border-juncao hover:shadow-[var(--shadow-flutuante)]"
            >
              <AvatarUsuario fotoUrl={c.foto_url} nome={c.nome} tamanho={48} />
              <div className="min-w-0 flex-1">
                <span className="block truncate font-bold text-tinta">{c.nome}</span>
                <span className="block text-xs text-tinta-suave">Abrir 1:1 ao vivo</span>
              </div>
              <span className="gradiente-marca flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-transform group-hover:scale-110">
                ❤️
              </span>
            </Link>
          ))}
        </div>
      )}
    </LayoutApp>
  )
}
