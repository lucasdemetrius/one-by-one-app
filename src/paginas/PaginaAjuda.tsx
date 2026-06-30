// Arquivo: src/paginas/PaginaAjuda.tsx
// Descrição: Central de Ajuda — um help visual, curto e direto. Mostra o manual do
//            papel do usuário (RH / Gestor / Liderado) por padrão, com abas para
//            espiar os outros. Estrutura: promessa → comece em minutos (passos) →
//            recursos → legenda de ícones (gestor) → perguntas frequentes. Sem textão:
//            cada item é um cartão escaneável, com emoji como "imagem".

import { useState } from 'react'
import { motion } from 'framer-motion'

import { LayoutApp } from './LayoutApp'
import { useAuth } from '@/recursos/auth/AuthContext'
import { MANUAIS, LEGENDA } from '@/recursos/ajuda/dadosAjuda'
import type { PapelAjuda, Manual } from '@/recursos/ajuda/dadosAjuda'
import { ChatAjuda } from '@/componentes/ajuda/ChatAjuda'

const ORDEM_ABAS: PapelAjuda[] = ['RH', 'LIDER', 'COLABORADOR']

// Mockup ilustrativo: a "fileira de botões" que aparece em cada liderado na Estrutura.
// Serve de imagem temática (sem print que envelhece) para o manual do gestor.
function MockupLiderado() {
  const botoes = [
    { r: '1:1', cls: 'gradiente-marca text-white' },
    { r: '✨', cls: 'border border-borda text-juncao' },
    { r: '📊', cls: 'border border-borda text-tinta' },
    { r: '🎯', cls: 'border border-borda text-tinta' },
    { r: '📜', cls: 'border border-borda text-tinta' },
    { r: 'Convidar', cls: 'border border-borda text-juncao' },
  ]
  return (
    <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-3 shadow-[var(--shadow-cartao)]">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-liderado/15 text-sm font-bold text-liderado">A</span>
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-tinta">Ana Souza</span>
          <span className="block text-[0.7rem] text-tinta-suave">Designer · Produto</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {botoes.map((b) => (
            <span key={b.r} className={`rounded-full px-2 py-1 text-[0.7rem] font-bold ${b.cls}`}>
              {b.r}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-2 text-center text-[0.7rem] text-tinta-suave">↑ é assim que cada liderado aparece na sua Estrutura</p>
    </div>
  )
}

function PassoCard({ n, emoji, titulo, descricao }: { n: number; emoji: string; titulo: string; descricao: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: n * 0.05 }}
      className="relative flex-1 rounded-[var(--radius-cartao)] border border-borda bg-creme p-4 shadow-[var(--shadow-cartao)]"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="gradiente-marca flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white">{n}</span>
        <span className="text-2xl">{emoji}</span>
      </div>
      <h4 className="fonte-display text-sm font-extrabold text-tinta">{titulo}</h4>
      <p className="mt-1 text-xs leading-relaxed text-tinta-suave">{descricao}</p>
    </motion.div>
  )
}

function RecursoCard({ icone, titulo, descricao, onde }: { icone: string; titulo: string; descricao: string; onde: string }) {
  return (
    <div className="flex gap-3 rounded-[var(--radius-cartao)] border border-borda bg-creme p-4 shadow-[var(--shadow-cartao)] transition hover:border-juncao/40">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-juncao/10 text-2xl">{icone}</span>
      <div className="min-w-0">
        <h4 className="fonte-display text-sm font-extrabold text-tinta">{titulo}</h4>
        <p className="mt-0.5 text-xs leading-relaxed text-tinta-suave">{descricao}</p>
        <span className="mt-2 inline-block rounded-full bg-areia-escura/50 px-2 py-0.5 text-[0.68rem] font-semibold text-tinta-suave">📍 {onde}</span>
      </div>
    </div>
  )
}

function FaqItem({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [aberto, setAberto] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setAberto((v) => !v)}
      className="w-full rounded-[var(--radius-cartao)] border border-borda bg-creme px-4 py-3 text-left shadow-[var(--shadow-cartao)] transition hover:border-juncao/40"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-tinta">{pergunta}</span>
        <span className={`shrink-0 text-tinta-suave transition-transform ${aberto ? 'rotate-180' : ''}`}>⌄</span>
      </div>
      {aberto && <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{resposta}</p>}
    </button>
  )
}

function ConteudoManual({ manual }: { manual: Manual }) {
  return (
    <div>
      {/* Promessa do papel */}
      <div className="mb-8 flex items-start gap-3 rounded-[var(--radius-cartao)] border border-juncao/20 bg-juncao/5 p-4">
        <span className="text-3xl">{manual.emoji}</span>
        <p className="text-sm font-semibold leading-relaxed text-tinta sm:text-base">{manual.promessa}</p>
      </div>

      {/* Comece em minutos */}
      <h3 className="fonte-display mb-3 text-lg font-bold text-tinta">⚡ Comece em minutos</h3>
      <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {manual.inicio_rapido.map((p, i) => (
          <PassoCard key={p.titulo} n={i + 1} emoji={p.emoji} titulo={p.titulo} descricao={p.descricao} />
        ))}
      </div>

      {/* Recursos */}
      <h3 className="fonte-display mb-3 text-lg font-bold text-tinta">🧰 Tudo que você pode fazer</h3>
      <div className="mb-9 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {manual.recursos.map((r) => (
          <RecursoCard key={r.titulo} {...r} />
        ))}
      </div>

      {/* Legenda de ícones — só faz sentido para o gestor (botões da Estrutura) */}
      {manual.papel === 'LIDER' && (
        <>
          <h3 className="fonte-display mb-3 text-lg font-bold text-tinta">🧭 Legenda dos botões</h3>
          <div className="mb-4">
            <MockupLiderado />
          </div>
          <div className="mb-9 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {LEGENDA.map((l) => (
              <div key={l.nome} className="flex items-center gap-3 rounded-[var(--radius-suave)] border border-borda bg-creme px-3 py-2">
                <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-areia-escura/50 px-1.5 text-base font-bold text-tinta">{l.icone}</span>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-tinta">{l.nome}</span>
                  <span className="ml-1.5 text-xs text-tinta-suave">{l.oquefaz}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* FAQ */}
      <h3 className="fonte-display mb-3 text-lg font-bold text-tinta">❓ Perguntas frequentes</h3>
      <div className="flex flex-col gap-2">
        {manual.faq.map((f) => (
          <FaqItem key={f.pergunta} {...f} />
        ))}
      </div>
    </div>
  )
}

export function PaginaAjuda() {
  const { usuario } = useAuth()
  const papelInicial: PapelAjuda =
    usuario?.role === 'RH' ? 'RH' : usuario?.role === 'COLABORADOR' ? 'COLABORADOR' : 'LIDER'
  const [aba, setAba] = useState<PapelAjuda>(papelInicial)
  const manual = MANUAIS[aba]

  return (
    <LayoutApp>
      {/* Herói */}
      <div className="gradiente-marca relative mb-6 overflow-hidden rounded-[var(--radius-cartao)] px-6 py-7 text-white shadow-[var(--shadow-cartao)]">
        <span className="text-xs font-bold uppercase tracking-widest text-white/80">Central de Ajuda</span>
        <h1 className="fonte-display text-2xl font-extrabold sm:text-3xl">Guias rápidos, sem enrolação 💜</h1>
        <p className="mt-1 max-w-xl text-sm text-white/90">Escolha seu papel e veja, em cartões curtos, como tirar o melhor do OneByOne.</p>
      </div>

      {/* Assistente de IA da ajuda — pergunte com suas palavras (funciona p/ todos os papéis). */}
      <div className="mb-8">
        <ChatAjuda />
      </div>

      {/* Abas por papel */}
      <div className="mb-7 inline-flex flex-wrap gap-1 rounded-full border border-borda bg-creme p-1 shadow-[var(--shadow-cartao)]">
        {ORDEM_ABAS.map((p) => {
          const m = MANUAIS[p]
          const ativo = aba === p
          return (
            <button
              key={p}
              type="button"
              onClick={() => setAba(p)}
              className={[
                'rounded-full px-4 py-1.5 text-sm font-bold transition',
                ativo ? 'gradiente-marca text-white shadow-[var(--shadow-cartao)]' : 'text-tinta-suave hover:text-tinta',
              ].join(' ')}
            >
              {m.emoji} {m.rotulo}
              {p === papelInicial && <span className="ml-1 text-[0.65rem] opacity-80">(você)</span>}
            </button>
          )
        })}
      </div>

      <ConteudoManual manual={manual} />

      <p className="mt-10 rounded-[var(--radius-cartao)] border border-dashed border-borda bg-creme/50 p-4 text-center text-sm text-tinta-suave">
        Ficou com dúvida que não está aqui? Fale com quem te convidou — RH ou gestor. 💬
      </p>
    </LayoutApp>
  )
}
