// Arquivo: src/componentes/admin/SecaoContas.tsx
// Descrição: Aba "Contas" do painel de admin — a lista das contas criadas (RH, gestores,
//            liderados, admin) com o resumo de uso de cada uma. Filtro por papel, busca por
//            nome/e-mail e paginação. Consome GET /admin/contas.

import { useEffect, useState } from 'react'

import { useContas } from '@/recursos/admin/adminApi'
import type { ContaItem } from '@/recursos/admin/adminApi'
import { Cartao, Carregando, Vazio } from './Graficos'
import { PAPEL_LABEL, quando } from './formatos'

const LIMITE = 20

const FILTROS: { valor: string; rotulo: string }[] = [
  { valor: '', rotulo: 'Todas' },
  { valor: 'RH', rotulo: 'RH' },
  { valor: 'LIDER', rotulo: 'Gestores' },
  { valor: 'COLABORADOR', rotulo: 'Liderados' },
  { valor: 'ADMIN', rotulo: 'Admin' },
]

// Cor do selo do papel.
const COR_PAPEL: Record<string, string> = {
  RH: 'var(--color-juncao)',
  LIDER: 'var(--color-gestor)',
  COLABORADOR: 'var(--color-liderado)',
  ADMIN: 'var(--color-tinta)',
}

function SeloPapel({ papel }: { papel: string }) {
  const cor = COR_PAPEL[papel] ?? 'var(--color-tinta-suave)'
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[0.65rem] font-bold"
      style={{ color: cor, backgroundColor: `color-mix(in srgb, ${cor} 14%, transparent)` }}
    >
      {PAPEL_LABEL[papel] ?? papel}
    </span>
  )
}

function MiniNum({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <span className="flex flex-col items-center">
      <span className="fonte-display text-sm font-bold text-tinta">{valor}</span>
      <span className="text-[0.6rem] text-tinta-suave">{rotulo}</span>
    </span>
  )
}

function LinhaConta({ c }: { c: ContaItem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[var(--radius-cartao)] border border-borda bg-creme p-4 shadow-[var(--shadow-cartao)]">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-bold text-tinta">{c.nome}</span>
          <SeloPapel papel={c.role} />
        </div>
        <span className="block truncate text-xs text-tinta-suave">{c.email}</span>
        <span className="mt-0.5 block text-[0.7rem] text-tinta-suave">Último acesso: {quando(c.ultimo_acesso)}</span>
      </div>
      {/* Mini-stats conforme o papel */}
      <div className="flex items-center gap-4">
        {c.role === 'LIDER' && (
          <>
            <MiniNum rotulo="equipes" valor={c.equipes} />
            <MiniNum rotulo="liderados" valor={c.colaboradores} />
            <MiniNum rotulo="1:1" valor={c.onebyones} />
          </>
        )}
        {c.role === 'RH' && <MiniNum rotulo="gestores" valor={c.gestores} />}
        <MiniNum rotulo="eventos" valor={c.total_eventos} />
      </div>
    </div>
  )
}

export function SecaoContas({ ativo }: { ativo: boolean }) {
  const [papel, setPapel] = useState('')
  const [buscaInput, setBuscaInput] = useState('')
  const [busca, setBusca] = useState('')
  const [offset, setOffset] = useState(0)

  // Debounce da busca (não dispara uma requisição por tecla).
  useEffect(() => {
    const t = setTimeout(() => {
      setBusca(buscaInput.trim())
      setOffset(0)
    }, 350)
    return () => clearTimeout(t)
  }, [buscaInput])

  const { data, isLoading } = useContas({ papel: papel || undefined, busca: busca || undefined, limite: LIMITE, offset }, ativo)

  const total = data?.total ?? 0
  const inicio = total === 0 ? 0 : offset + 1
  const fim = Math.min(offset + LIMITE, total)

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex flex-wrap gap-1 rounded-full border border-borda bg-creme p-1 shadow-[var(--shadow-cartao)]">
          {FILTROS.map((f) => {
            const sel = papel === f.valor
            return (
              <button
                key={f.valor || 'todas'}
                type="button"
                onClick={() => {
                  setPapel(f.valor)
                  setOffset(0)
                }}
                className={[
                  'rounded-full px-3.5 py-1.5 text-sm font-bold transition',
                  sel ? 'gradiente-marca text-white shadow-[var(--shadow-cartao)]' : 'text-tinta-suave hover:text-tinta',
                ].join(' ')}
              >
                {f.rotulo}
              </button>
            )
          })}
        </div>
        <input
          value={buscaInput}
          onChange={(e) => setBuscaInput(e.target.value)}
          placeholder="Buscar por nome ou e-mail…"
          className="min-w-[12rem] flex-1 rounded-full border-2 border-borda bg-creme px-4 py-2 text-sm text-tinta outline-none transition-colors placeholder:text-tinta-suave/60 focus:border-juncao"
        />
      </div>

      {isLoading && !data ? (
        <Carregando altura="h-64" />
      ) : !data || data.itens.length === 0 ? (
        <Vazio emoji="🔍" titulo="Nenhuma conta encontrada." sub="Ajuste o filtro ou a busca." />
      ) : (
        <>
          <Cartao className="!p-0 !border-0 !bg-transparent !shadow-none">
            <div className="flex flex-col gap-2.5">
              {data.itens.map((c) => (
                <LinhaConta key={c.id} c={c} />
              ))}
            </div>
          </Cartao>

          {/* Paginação */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-tinta-suave">
              {inicio}–{fim} de {total}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={offset === 0}
                onClick={() => setOffset((o) => Math.max(0, o - LIMITE))}
                className="rounded-[var(--radius-suave)] border-2 border-borda px-3 py-1.5 text-sm font-bold text-tinta transition-colors hover:border-tinta disabled:opacity-40"
              >
                ← Anterior
              </button>
              <button
                type="button"
                disabled={fim >= total}
                onClick={() => setOffset((o) => o + LIMITE)}
                className="rounded-[var(--radius-suave)] border-2 border-borda px-3 py-1.5 text-sm font-bold text-tinta transition-colors hover:border-tinta disabled:opacity-40"
              >
                Próxima →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
