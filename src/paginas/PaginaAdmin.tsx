// Arquivo: src/paginas/PaginaAdmin.tsx
// Descrição: Painel de ADMINISTRAÇÃO da plataforma (só a conta ADMIN). Um dashboard estilo
//            Google Analytics em abas: Visão geral, Acessos, Uso, Crescimento, Contas, Saúde
//            e Feedback. Cada aba é uma seção própria (componentes/admin/*) que busca seus
//            dados quando fica visível. O seletor de período (dias) vale para as abas
//            temporais. Acesso protegido por RotaAdmin no App.tsx.

import { useState } from 'react'

import { LayoutApp } from './LayoutApp'
import { SecaoVisaoGeral } from '@/componentes/admin/SecaoVisaoGeral'
import { SecaoAcessos } from '@/componentes/admin/SecaoAcessos'
import { SecaoUso } from '@/componentes/admin/SecaoUso'
import { SecaoCrescimento } from '@/componentes/admin/SecaoCrescimento'
import { SecaoContas } from '@/componentes/admin/SecaoContas'
import { SecaoSaude } from '@/componentes/admin/SecaoSaude'
import { SecaoFeedback } from '@/componentes/admin/SecaoFeedback'

const ABAS = [
  { id: 'visao', rotulo: 'Visão geral', emoji: '📊', usaDias: false },
  { id: 'acessos', rotulo: 'Acessos', emoji: '📈', usaDias: true },
  { id: 'uso', rotulo: 'Uso', emoji: '🧭', usaDias: true },
  { id: 'crescimento', rotulo: 'Crescimento', emoji: '🌱', usaDias: true },
  { id: 'contas', rotulo: 'Contas', emoji: '👥', usaDias: false },
  { id: 'saude', rotulo: 'Saúde', emoji: '❤️', usaDias: false },
  { id: 'feedback', rotulo: 'Feedback', emoji: '💬', usaDias: true },
] as const

type AbaId = (typeof ABAS)[number]['id']

const PERIODOS = [7, 30, 90]

export function PaginaAdmin() {
  const [aba, setAba] = useState<AbaId>('visao')
  const [dias, setDias] = useState(30)

  const abaAtual = ABAS.find((a) => a.id === aba)!

  return (
    <LayoutApp>
      {/* Herói */}
      <div className="gradiente-marca relative mb-6 overflow-hidden rounded-[var(--radius-cartao)] px-6 py-7 text-white shadow-[var(--shadow-cartao)]">
        <span className="text-xs font-bold uppercase tracking-widest text-white/80">Administração</span>
        <h1 className="fonte-display text-2xl font-extrabold sm:text-3xl">Monitoração da plataforma 🛰️</h1>
        <p className="mt-1 max-w-xl text-sm text-white/90">
          Quem usa, quanto usa e como a base evolui — para você agir onde importa.
        </p>
      </div>

      {/* Abas */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {ABAS.map((a) => {
          const ativo = aba === a.id
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setAba(a.id)}
              className={[
                'rounded-full px-4 py-2 text-sm font-bold transition',
                ativo
                  ? 'gradiente-marca text-white shadow-[var(--shadow-cartao)]'
                  : 'border border-borda bg-creme text-tinta-suave hover:text-tinta',
              ].join(' ')}
            >
              <span className="mr-1">{a.emoji}</span>
              {a.rotulo}
            </button>
          )
        })}
      </div>

      {/* Seletor de período (só nas abas temporais) */}
      {abaAtual.usaDias && (
        <div className="mb-6 inline-flex gap-1 rounded-full border border-borda bg-creme p-1 shadow-[var(--shadow-cartao)]">
          {PERIODOS.map((p) => {
            const ativo = dias === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => setDias(p)}
                className={[
                  'rounded-full px-4 py-1.5 text-sm font-bold transition',
                  ativo ? 'gradiente-marca text-white shadow-[var(--shadow-cartao)]' : 'text-tinta-suave hover:text-tinta',
                ].join(' ')}
              >
                {p} dias
              </button>
            )
          })}
        </div>
      )}

      {/* Conteúdo da aba ativa (só a visível busca dados) */}
      {aba === 'visao' && <SecaoVisaoGeral ativo />}
      {aba === 'acessos' && <SecaoAcessos dias={dias} ativo />}
      {aba === 'uso' && <SecaoUso dias={dias} ativo />}
      {aba === 'crescimento' && <SecaoCrescimento dias={dias} ativo />}
      {aba === 'contas' && <SecaoContas ativo />}
      {aba === 'saude' && <SecaoSaude ativo />}
      {aba === 'feedback' && <SecaoFeedback dias={dias} ativo />}
    </LayoutApp>
  )
}
