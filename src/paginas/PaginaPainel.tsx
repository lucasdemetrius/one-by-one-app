// Arquivo: src/paginas/PaginaPainel.tsx
// Descrição: Painel do gestor (pós-login). Conectado à API de verdade:
//            - Se o gestor ainda não tem organização, mostra o onboarding.
//            - Tendo organização, gerencia o time real: lista os liderados
//              (colaboradores), as equipes, e permite adicionar ambos.
//            Sentimento/PDI/feedbacks ainda não existem no backend — aparecem
//            como um cartão "em breve" para preview da visão.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/recursos/auth/AuthContext'
import { extrairMensagemErro } from '@/lib/api'
import { LayoutApp } from './LayoutApp'
import { Botao } from '@/componentes/ui/Botao'
import { Campo } from '@/componentes/ui/Campo'
import { Modal } from '@/componentes/ui/Modal'
import { ConstrutorEstrutura } from '@/componentes/estrutura/ConstrutorEstrutura'
import { PulsoTime } from '@/componentes/painel/PulsoTime'
import { SaudeOneByOne } from '@/componentes/painel/SaudeOneByOne'
import { Lembretes } from '@/componentes/painel/Lembretes'
import { AgendaPainel } from '@/componentes/agenda/AgendaPainel'
import { MatrixNineBox } from '@/componentes/matrix/MatrixNineBox'
import {
  useColaboradores,
  useCriarOrganizacao,
  useEquipes,
  useMeuColaborador,
  useOrganizacoes,
} from '@/recursos/time/hooks'
import { criarEquipe } from '@/recursos/time/timeApi'
import type { Organizacao } from '@/recursos/time/tipos'
import { gerarConvite } from '@/recursos/convite/conviteApi'
import type { ConviteGerado } from '@/recursos/convite/conviteApi'

// ── Modal que gera e mostra o convite do liderado (link + código) ───────────
function ModalConvite({
  colaborador,
  aoFechar,
}: {
  colaborador: { id: string; nome: string }
  aoFechar: () => void
}) {
  const [dados, setDados] = useState<ConviteGerado | null>(null)
  const [erro, setErro] = useState('')
  const [copiado, setCopiado] = useState('')

  // Gera o convite assim que o modal abre.
  useEffect(() => {
    gerarConvite(colaborador.id)
      .then(setDados)
      .catch((e) => setErro(extrairMensagemErro(e)))
  }, [colaborador.id])

  const linkCompleto = dados ? `${window.location.origin}${dados.link}` : ''
  const primeiroNome = colaborador.nome.split(' ')[0]

  async function copiar(texto: string, qual: string) {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(qual)
      setTimeout(() => setCopiado(''), 1500)
    } catch {
      /* sem clipboard — ignora */
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo={`Convidar ${primeiroNome}`}>
      {erro ? (
        <p className="text-sm text-alerta">{erro}</p>
      ) : !dados ? (
        <p className="text-tinta-suave">Gerando convite…</p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-tinta-suave">
            Envie o <strong className="text-tinta">link</strong> e o{' '}
            <strong className="text-tinta">código</strong> para {primeiroNome}. Ele
            acessa, informa o código e cria a própria senha.
          </p>

          {/* Link do convite */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-tinta-suave">
              Link do convite
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={linkCompleto}
                className="min-w-0 flex-1 rounded-[var(--radius-suave)] border-2 border-borda bg-areia px-3 py-2 text-sm text-tinta"
              />
              <button
                type="button"
                onClick={() => copiar(linkCompleto, 'link')}
                title="Copiar link"
                aria-label="Copiar link"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-suave)] bg-tinta text-creme transition hover:brightness-125"
              >
                {copiado === 'link' ? '✓' : '📋'}
              </button>
            </div>
          </div>

          {/* Código (contra-senha) — centralizado, copiar só com ícone */}
          <div className="text-center">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-tinta-suave">
              Código (contra-senha)
            </label>
            <div className="flex items-center justify-center gap-2">
              <span className="gradiente-marca rounded-[var(--radius-suave)] px-5 py-2 fonte-display text-2xl font-extrabold tracking-widest text-white">
                {dados.codigo}
              </span>
              <button
                type="button"
                onClick={() => copiar(dados.codigo, 'codigo')}
                title="Copiar código"
                aria-label="Copiar código"
                className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-suave)] border-2 border-borda text-lg text-tinta transition hover:border-tinta"
              >
                {copiado === 'codigo' ? '✓' : '📋'}
              </button>
            </div>
          </div>

          <p className="text-xs text-tinta-suave">
            O código não será mostrado de novo. O convite expira em 7 dias.
          </p>
        </div>
      )}
    </Modal>
  )
}

// ── Visão do liderado (quem entra com papel COLABORADOR) ────────────────────
function VistaLiderado({ nome }: { nome: string }) {
  // Descobre o próprio registro de colaborador. O id dele é o id da sala do
  // 1:1 ao vivo — a MESMA sala em que o gestor entra (rota /liderado/:id).
  // Assim, quando o gestor mexe nos cards, o liderado vê em tempo real.
  const meuColQ = useMeuColaborador(true)
  const colId = meuColQ.data?.id

  return (
    <div className="py-6">
      <p className="text-tinta-suave">Olá, {nome} 👋</p>
      <h1 className="fonte-display mt-1 text-3xl font-extrabold text-tinta">
        Seu espaço de 1:1
      </h1>
      <p className="mt-3 max-w-lg text-tinta-suave">
        Aqui é onde você acompanha seus 1:1 com seu gestor. Em breve: seu PDI,
        os feedbacks que recebeu e o que você está estudando.
      </p>
      <div className="mt-6">
        {colId ? (
          <Link to={`/liderado/${colId}`}>
            <Botao variante="marca">Entrar no meu 1:1 ao vivo</Botao>
          </Link>
        ) : meuColQ.isLoading ? (
          <Botao variante="marca" carregando>
            Carregando seu 1:1…
          </Botao>
        ) : (
          <p className="text-sm text-tinta-suave">
            Seu gestor ainda não vinculou você a um 1:1. Assim que ele fizer,
            seu tabuleiro aparece aqui. ✨
          </p>
        )}
      </div>
    </div>
  )
}

// ── Onboarding: criar a primeira organização ───────────────────────────────
function Onboarding() {
  const criar = useCriarOrganizacao()
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      // Cria a organização e já uma equipe padrão, para o gestor poder
      // adicionar liderados imediatamente (fluxo simples, sem passos extras).
      const org = await criar.mutateAsync({ nome })
      await criarEquipe({ organizacao_id: org.id, nome: 'Meu time' })
    } catch (err) {
      setErro(extrairMensagemErro(err))
    }
  }

  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <div className="gradiente-marca mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[var(--radius-cartao)] text-3xl">
        🎉
      </div>
      <h1 className="fonte-display text-3xl font-extrabold text-tinta">
        Vamos começar!
      </h1>
      <p className="mt-2 text-tinta-suave">
        Crie sua organização para montar seu time e começar os 1:1.
      </p>

      <form onSubmit={enviar} className="mt-8 flex flex-col gap-4 text-left">
        <Campo
          rotulo="Nome da organização"
          valor={nome}
          onChange={setNome}
          placeholder="Ex.: Minha Empresa"
        />
        {erro && (
          <div className="rounded-[var(--radius-suave)] border border-alerta/30 bg-alerta/10 px-4 py-3 text-sm font-medium text-alerta">
            {erro}
          </div>
        )}
        <Botao type="submit" variante="marca" larguraTotal carregando={criar.isPending}>
          Criar organização
        </Botao>
      </form>
    </div>
  )
}

// ── Formulário: nova equipe ─────────────────────────────────────────────────
// Pílula compacta de estatística (substitui os cartões gigantes do topo).
function PilulaStat({ emoji, valor, rotulo, cor }: { emoji: string; valor: number; rotulo: string; cor: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-borda bg-creme px-4 py-2 shadow-[var(--shadow-cartao)]">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full text-base"
        style={{ backgroundColor: `color-mix(in srgb, ${cor} 16%, transparent)` }}
      >
        {emoji}
      </span>
      <span className="fonte-display text-2xl font-extrabold leading-none text-tinta">{valor}</span>
      <span className="text-sm font-semibold text-tinta-suave">{rotulo}</span>
    </div>
  )
}

// ── Dashboard do gestor (já com organização) ───────────────────────────────
function Dashboard({ org, primeiroNome }: { org: Organizacao; primeiroNome: string }) {
  const equipesQ = useEquipes(org.id)
  const colaboradoresQ = useColaboradores(org.id)
  // Colaborador sendo convidado (abre o modal de convite).
  const [convidando, setConvidando] = useState<{ id: string; nome: string } | null>(null)

  const equipes = equipesQ.data ?? []
  const colaboradores = colaboradoresQ.data ?? []
  const ativos = colaboradores.filter((c) => c.ativo).length

  return (
    <div>
      {/* Hero compacto: saudação + nome do time + pílulas de resumo */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-tinta-suave">
            Olá, {primeiroNome} 👋 · <span className="font-bold uppercase tracking-wider text-juncao">{org.nome}</span>
          </p>
          <h1 className="fonte-display mt-0.5 text-2xl font-extrabold text-tinta sm:text-3xl">Seu time</h1>
        </div>
        <div className="flex gap-2.5">
          <PilulaStat emoji="👥" valor={ativos} rotulo={ativos === 1 ? 'ativo' : 'ativos'} cor="var(--color-liderado)" />
          <PilulaStat emoji="🗂️" valor={equipes.length} rotulo={equipes.length === 1 ? 'equipe' : 'equipes'} cor="var(--color-gestor)" />
        </div>
      </div>

      {/* Lembretes: o que precisa de atenção agora (1:1 de hoje, convites, PDI) */}
      <Lembretes org={org} />

      {/* Pulso do time: humor, atividade recente, PDI e quem falta convidar */}
      <PulsoTime org={org} />

      {/* Saúde do 1:1: cadência, atrasados e streak — fecha o ciclo de engajamento */}
      <SaudeOneByOne />

      {/* Construtor de estrutura: equipes em colunas + liderados arrastáveis */}
      <ConstrutorEstrutura org={org} aoConvidar={setConvidando} />

      {/* Agenda: calendário com os 1:1 — clicar abre o tabuleiro */}
      <AgendaPainel />

      {/* Matrix9-Box embutida no painel (mesma matriz interativa da página) */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="fonte-display text-xl font-bold text-tinta">📊 Matrix9-Box</h2>
          <Link to="/matrix9-box" className="ml-auto text-sm font-bold text-juncao hover:underline">
            Abrir completa →
          </Link>
        </div>
        <MatrixNineBox org={org} />
      </section>

      {/* De cada liderado, num lugar só — AGORA disponível (botão 📊 no liderado) */}
      <section className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-6 shadow-[var(--shadow-cartao)]">
        <span className="text-xs font-bold uppercase tracking-wider text-sucesso">✓ Disponível</span>
        <h3 className="fonte-display mt-1 text-lg font-bold text-tinta">De cada liderado, num lugar só</h3>
        <p className="mt-1 text-sm text-tinta-suave">
          Abra o <strong className="text-tinta">📊 Acompanhamento</strong> de cada liderado (na
          estrutura, acima) para registrar e acompanhar tudo num só painel:
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['💜 Sentimento', '📦 Entregas', '💬 Feedbacks', '📚 Estudos', '🎯 PDI'].map((t) => (
            <span key={t} className="rounded-full border border-borda bg-areia px-3 py-1 text-xs font-semibold text-tinta-suave">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Modal de convite (gera link + código para o liderado) */}
      {convidando && (
        <ModalConvite colaborador={convidando} aoFechar={() => setConvidando(null)} />
      )}
    </div>
  )
}

export function PaginaPainel() {
  const { usuario } = useAuth()
  const ehLiderado = usuario?.role === 'COLABORADOR'
  const orgsQ = useOrganizacoes()
  const org = orgsQ.data?.[0]
  const primeiroNome = usuario?.nome?.split(' ')[0] ?? 'Você'

  return (
    <LayoutApp>
      {ehLiderado ? (
        // Quem entra como liderado (COLABORADOR) vê o espaço dele, não o painel de gestão.
        <VistaLiderado nome={primeiroNome} />
      ) : orgsQ.isLoading ? (
        <p className="py-10 text-center text-tinta-suave">Carregando…</p>
      ) : !org ? (
        <Onboarding />
      ) : (
        <Dashboard org={org} primeiroNome={primeiroNome} />
      )}
    </LayoutApp>
  )
}
