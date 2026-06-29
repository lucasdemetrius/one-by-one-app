// Arquivo: src/componentes/estrutura/ConstrutorEstrutura.tsx
// Descrição: Construtor de estrutura do time. Mostra as EQUIPES como colunas e os
//            LIDERADOS como chips arrastáveis entre elas (arrastar = mover de
//            equipe, grava na hora). Tem cadastro inline (sem modal) de equipe e
//            de liderado, e ações de desligar/reativar. Liderado inativo aparece
//            esmaecido. Pensado para o RH montar tudo numa tela só.

import { useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Link } from 'react-router-dom'

import { extrairMensagemErro } from '@/lib/api'
import { AvatarUsuario } from '@/componentes/marca/AvatarUsuario'
import { Ajuda } from '@/componentes/ui/Ajuda'
import { useConfirmar } from '@/componentes/ui/Confirmacao'
import { PainelIALiderado } from '@/componentes/ia/PainelIALiderado'
import { PdiLiderado } from '@/componentes/pdi/PdiLiderado'
import { PainelLiderado } from '@/componentes/acompanhamento/PainelLiderado'
import { MonitorEquipes } from '@/componentes/estrutura/MonitorEquipes'
import { ImportarLiderados } from '@/componentes/estrutura/ImportarLiderados'
import { MoverEquipe } from '@/componentes/estrutura/MoverEquipe'
import {
  useAtualizarColaborador,
  useColaboradores,
  useCriarColaborador,
  useCriarEquipe,
  useDeletarColaborador,
  useDeletarEquipe,
  useDesligarColaborador,
  useEnviarFotoEquipe,
  useEquipes,
  useReativarColaborador,
} from '@/recursos/time/hooks'
import type { Colaborador, Equipe, Organizacao } from '@/recursos/time/tipos'

interface ConstrutorProps {
  org: Organizacao
  // Abre o fluxo de convite (o modal vive na página).
  aoConvidar: (colaborador: { id: string; nome: string }) => void
}

export function ConstrutorEstrutura({ org, aoConvidar }: ConstrutorProps) {
  const equipesQ = useEquipes(org.id)
  const colaboradoresQ = useColaboradores(org.id)
  const mover = useAtualizarColaborador(org.id)
  const criarEquipe = useCriarEquipe(org.id)

  const equipes = equipesQ.data ?? []
  const colaboradores = colaboradoresQ.data ?? []

  // O chip sendo arrastado (para o "fantasma" no DragOverlay).
  const [arrastando, setArrastando] = useState<Colaborador | null>(null)
  const [nomeEquipe, setNomeEquipe] = useState('')
  const [erroEquipe, setErroEquipe] = useState('')

  // Arraste só começa após mover 6px — assim cliques nos botões não viram arraste.
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  // Carrossel: rola o trilho de equipes ao clicar nos botões ‹ ›.
  const trilhoRef = useRef<HTMLDivElement>(null)
  function rolar(delta: number) {
    trilhoRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  // Visualização (cartões x lista) — lembrada no localStorage para a próxima visita.
  const [visao, setVisao] = useState<'cartoes' | 'lista'>(
    () => (localStorage.getItem('onebyone.estrutura.view') as 'cartoes' | 'lista') || 'cartoes',
  )
  function trocarVisao(v: 'cartoes' | 'lista') {
    setVisao(v)
    localStorage.setItem('onebyone.estrutura.view', v)
  }
  // Monitor (Kanban em tela cheia) — é uma ação, não uma view persistida.
  const [monitorAberto, setMonitorAberto] = useState(false)
  const [importando, setImportando] = useState(false)

  // Agrupa os liderados por equipe.
  const porEquipe = useMemo(() => {
    const mapa: Record<string, Colaborador[]> = {}
    for (const e of equipes) mapa[e.id] = []
    for (const c of colaboradores) {
      if (!mapa[c.equipe_id]) mapa[c.equipe_id] = []
      mapa[c.equipe_id].push(c)
    }
    return mapa
  }, [equipes, colaboradores])

  function aoIniciar(e: DragStartEvent) {
    setArrastando(colaboradores.find((c) => c.id === e.active.id) ?? null)
  }

  function aoSoltar(e: DragEndEvent) {
    setArrastando(null)
    const { active, over } = e
    if (!over) return
    const colab = colaboradores.find((c) => c.id === active.id)
    const destinoEquipe = String(over.id)
    // Só grava se realmente mudou de equipe.
    if (colab && colab.equipe_id !== destinoEquipe) {
      mover.mutate({ id: colab.id, dados: { equipe_id: destinoEquipe } })
    }
  }

  function adicionarEquipe(ev: React.FormEvent) {
    ev.preventDefault()
    const nome = nomeEquipe.trim()
    if (!nome) return
    setErroEquipe('')
    criarEquipe.mutate(
      { organizacao_id: org.id, nome },
      {
        onSuccess: () => setNomeEquipe(''),
        onError: (e) => setErroEquipe(extrairMensagemErro(e)),
      },
    )
  }

  if (equipesQ.isLoading) {
    return <p className="text-tinta-suave">Carregando estrutura…</p>
  }

  return (
    <section className="mb-12">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="fonte-display text-xl font-bold text-tinta">Estrutura do time</h2>
        <Ajuda titulo="Como montar seu time">
          Em <strong className="text-tinta">Cartões</strong>, cada coluna é uma equipe e você{' '}
          <strong className="text-tinta">arrasta</strong> liderados entre elas. Em{' '}
          <strong className="text-tinta">Lista</strong>, vê todos com nome completo e troca a equipe
          pelo seletor. Sua escolha de visualização fica salva.
        </Ajuda>

        {/* Alternador de visualização (lembrado no localStorage) + Monitor */}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-borda bg-creme p-1">
            {([
              { id: 'cartoes', rotulo: '▦ Cartões' },
              { id: 'lista', rotulo: '☰ Lista' },
            ] as const).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => trocarVisao(v.id)}
                className={[
                  'rounded-full px-3 py-1 text-sm font-bold transition',
                  visao === v.id ? 'gradiente-marca text-white' : 'text-tinta-suave hover:text-tinta',
                ].join(' ')}
              >
                {v.rotulo}
              </button>
            ))}
          </div>
          {/* Importar liderados em lote (CSV) */}
          <button
            type="button"
            onClick={() => setImportando(true)}
            title="Importar vários liderados de um CSV"
            className="rounded-full border border-borda bg-creme px-3 py-1.5 text-sm font-bold text-tinta transition hover:border-juncao hover:text-juncao"
          >
            📥 Importar
          </button>
          {/* Monitor: Kanban em tela cheia */}
          <button
            type="button"
            onClick={() => setMonitorAberto(true)}
            title="Abrir o time em tela cheia (Kanban)"
            className="rounded-full border border-borda bg-creme px-3 py-1.5 text-sm font-bold text-tinta transition hover:border-juncao hover:text-juncao"
          >
            🖥️ Monitor
          </button>
        </div>
      </div>

      {monitorAberto && <MonitorEquipes org={org} aoFechar={() => setMonitorAberto(false)} />}
      {importando && <ImportarLiderados org={org} aoFechar={() => setImportando(false)} />}

      {/* Uma única DndContext serve às duas visões — arrastar entre equipes
          funciona tanto em Cartões quanto em Lista. */}
      <DndContext sensors={sensores} onDragStart={aoIniciar} onDragEnd={aoSoltar}>
        {visao === 'cartoes' ? (
          <div className="relative">
            {/* Botões ‹ › estilo Netflix — só quando há colunas suficientes para rolar */}
            {equipes.length >= 3 && (
              <>
                <button
                  type="button"
                  onClick={() => rolar(-360)}
                  aria-label="Anterior"
                  className="absolute -left-6 top-1/2 z-20 hidden -translate-y-1/2 text-6xl font-light leading-none text-tinta-suave/55 transition-transform duration-200 hover:scale-150 hover:text-juncao [text-shadow:0_2px_10px_rgba(0,0,0,0.15)] sm:block"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => rolar(360)}
                  aria-label="Próximo"
                  className="absolute -right-6 top-1/2 z-20 hidden -translate-y-1/2 text-6xl font-light leading-none text-tinta-suave/55 transition-transform duration-200 hover:scale-150 hover:text-juncao [text-shadow:0_2px_10px_rgba(0,0,0,0.15)] sm:block"
                >
                  ›
                </button>
              </>
            )}

            <div ref={trilhoRef} className="esconder-scroll flex gap-4 overflow-x-auto scroll-smooth px-1 pb-3">
              {equipes.map((equipe, i) => (
                <EquipeColuna key={equipe.id} layout="coluna" equipe={equipe} org={org} indice={i} liderados={porEquipe[equipe.id] ?? []} aoConvidar={aoConvidar} />
              ))}

              {/* Coluna para criar uma nova equipe (inline, sem modal) */}
              <form onSubmit={adicionarEquipe} className="flex w-[85vw] max-w-80 shrink-0 flex-col justify-center gap-2 rounded-[var(--radius-cartao)] border-2 border-dashed border-borda bg-creme/40 p-4 sm:w-80">
                <span className="text-xs font-bold uppercase tracking-wider text-tinta-suave">Nova equipe</span>
                <input value={nomeEquipe} onChange={(e) => setNomeEquipe(e.target.value)} placeholder="Ex.: Produto, Vendas…" className="w-full rounded-[var(--radius-suave)] border-2 border-borda bg-areia px-3 py-2 text-sm text-tinta outline-none focus:border-juncao" />
                {erroEquipe && <span className="text-xs font-medium text-alerta">{erroEquipe}</span>}
                <button type="submit" disabled={!nomeEquipe.trim() || criarEquipe.isPending} className="rounded-[var(--radius-suave)] bg-tinta px-3 py-2 text-sm font-bold text-creme transition hover:brightness-110 disabled:opacity-50">
                  + Criar equipe
                </button>
              </form>
            </div>
          </div>
        ) : (
          // LISTA: cada equipe é uma faixa (área de soltar) com os liderados em linha.
          <div className="flex flex-col gap-4">
            {equipes.map((equipe, i) => (
              <EquipeColuna key={equipe.id} layout="lista" equipe={equipe} org={org} indice={i} liderados={porEquipe[equipe.id] ?? []} aoConvidar={aoConvidar} />
            ))}

            {/* Criar nova equipe (linha) */}
            <form onSubmit={adicionarEquipe} className="flex flex-wrap items-center gap-2 rounded-[var(--radius-cartao)] border-2 border-dashed border-borda bg-creme/40 p-3">
              <span className="text-xs font-bold uppercase tracking-wider text-tinta-suave">Nova equipe</span>
              <input value={nomeEquipe} onChange={(e) => setNomeEquipe(e.target.value)} placeholder="Ex.: Produto, Vendas…" className="min-w-48 flex-1 rounded-[var(--radius-suave)] border-2 border-borda bg-areia px-3 py-1.5 text-sm text-tinta outline-none focus:border-juncao" />
              {erroEquipe && <span className="text-xs font-medium text-alerta">{erroEquipe}</span>}
              <button type="submit" disabled={!nomeEquipe.trim() || criarEquipe.isPending} className="rounded-[var(--radius-suave)] bg-tinta px-4 py-1.5 text-sm font-bold text-creme transition hover:brightness-110 disabled:opacity-50">
                + Criar equipe
              </button>
            </form>
          </div>
        )}

        {/* Fantasma do liderado sendo arrastado (mesmo em ambas as visões) */}
        <DragOverlay>
          {arrastando ? (
            <div className="w-72">
              <ChipConteudo colaborador={arrastando} sobreposicao />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  )
}

// Cores de acento (borda de topo + brasão) variando por posição da equipe.
const ACENTOS = ['var(--color-gestor)', 'var(--color-liderado)', 'var(--color-juncao)', 'var(--color-sucesso)']

// ── Equipe (área de soltar) — renderiza como COLUNA (cartões) ou FAIXA (lista) ─
function EquipeColuna({
  equipe,
  org,
  indice,
  liderados,
  aoConvidar,
  layout,
}: {
  equipe: Equipe
  org: Organizacao
  indice: number
  liderados: Colaborador[]
  aoConvidar: (c: { id: string; nome: string }) => void
  layout: 'coluna' | 'lista'
}) {
  const lista = layout === 'lista'
  const { setNodeRef, isOver } = useDroppable({ id: equipe.id })
  const criar = useCriarColaborador(org.id)
  const deletarEquipe = useDeletarEquipe(org.id)
  const enviarFoto = useEnviarFotoEquipe(org.id)
  const confirmar = useConfirmar()
  const fotoRef = useRef<HTMLInputElement>(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [erro, setErro] = useState('')

  const acento = ACENTOS[indice % ACENTOS.length]
  const ativos = liderados.filter((c) => c.ativo).length
  // E-mail válido o suficiente para o sinal vermelho em tempo real (formato básico).
  const emailInvalido = email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  function adicionar(ev: React.FormEvent) {
    ev.preventDefault()
    setErro('')
    if (!nome.trim() || !email.trim()) {
      setErro('Informe nome e e-mail.')
      return
    }
    criar.mutate(
      {
        organizacao_id: org.id,
        equipe_id: equipe.id,
        nome: nome.trim(),
        email: email.trim(),
        whatsapp: telefone.trim() || null, // telefone é opcional
      },
      {
        onSuccess: () => {
          setNome('')
          setEmail('')
          setTelefone('')
        },
        // Mostra o motivo (ex.: e-mail inválido) em vez de falhar em silêncio.
        onError: (e) => setErro(extrairMensagemErro(e)),
      },
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={lista ? { borderLeftColor: acento, borderLeftWidth: 5 } : { borderTopColor: acento, borderTopWidth: 5 }}
      className={[
        'flex flex-col gap-3 rounded-[var(--radius-cartao)] border-2 p-4 shadow-[var(--shadow-cartao)] transition-colors',
        lista ? 'w-full' : 'w-[85vw] max-w-80 shrink-0 sm:w-80',
        isOver ? 'border-juncao bg-juncao/5' : 'border-borda bg-creme',
      ].join(' ')}
    >
      {/* Cabeçalho encorpado: brasão (logo ou monograma) + título + total */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fotoRef.current?.click()}
          title="Trocar logo/brasão da equipe"
          className="group relative h-11 w-11 shrink-0"
        >
          {/* Wrapper interno arredondado que RECORTA a imagem/overlay. O selo de
              câmera fica fora dele (irmão), então nunca é cortado. */}
          <span
            className="absolute inset-0 overflow-hidden rounded-[var(--radius-suave)] ring-1 ring-borda"
            style={equipe.foto_url ? undefined : { backgroundColor: acento }}
          >
            {equipe.foto_url ? (
              <img src={equipe.foto_url} alt={equipe.nome} className="h-full w-full object-cover" />
            ) : (
              <span className="fonte-display flex h-full w-full items-center justify-center text-lg font-extrabold text-white">
                {equipe.nome.charAt(0).toUpperCase()}
              </span>
            )}
            {/* Overlay no hover deixa claro que dá pra trocar o logo da equipe */}
            <span className="absolute inset-0 flex items-center justify-center bg-tinta/55 text-base text-white opacity-0 transition-opacity group-hover:opacity-100">
              📷
            </span>
            {enviarFoto.isPending && (
              <span className="absolute inset-0 flex items-center justify-center bg-tinta/40 text-xs text-white">…</span>
            )}
          </span>
          {/* Selo de câmera SEMPRE visível (fora do wrapper recortado) */}
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-creme text-[0.55rem] shadow ring-1 ring-borda">
            📷
          </span>
        </button>
        <input
          ref={fotoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) enviarFoto.mutate({ id: equipe.id, arquivo: f })
          }}
        />

        <div className="min-w-0 flex-1">
          <h3 className="fonte-display truncate text-lg font-extrabold leading-tight text-tinta">{equipe.nome}</h3>
          <span className="text-xs font-semibold text-tinta-suave">
            {liderados.length} {liderados.length === 1 ? 'liderado' : 'liderados'}
            {ativos !== liderados.length && ` · ${ativos} ${ativos === 1 ? 'ativo' : 'ativos'}`}
          </span>
        </div>

        {/* Excluir equipe — só quando vazia, para não "perder" liderados. */}
        <button
          type="button"
          title={liderados.length === 0 ? 'Excluir equipe' : 'Mova ou desligue os liderados antes de excluir'}
          disabled={liderados.length > 0}
          onClick={async () => {
            const ok = await confirmar({
              emoji: '🗑️',
              perigoso: true,
              titulo: `Excluir a equipe "${equipe.nome}"?`,
              mensagem: 'A equipe será removida. Esta ação não pode ser desfeita.',
              textoConfirmar: 'Excluir',
            })
            if (ok) deletarEquipe.mutate(equipe.id)
          }}
          className="shrink-0 text-tinta-suave/40 transition hover:text-alerta disabled:cursor-not-allowed disabled:opacity-30"
        >
          ✕
        </button>
      </div>

      <div
        className={[
          'flex min-h-[3rem] flex-col gap-2',
          // Nos CARTÕES, mostra ~3 liderados e o resto vira scroll fino temático.
          lista ? '' : 'max-h-[19.5rem] overflow-y-auto scroll-fino pr-1',
        ].join(' ')}
      >
        {liderados.length === 0 ? (
          <p className="rounded-[var(--radius-suave)] border border-dashed border-borda px-3 py-4 text-center text-xs text-tinta-suave">
            Arraste alguém para cá ou adicione {lista ? 'na linha' : 'abaixo'}.
          </p>
        ) : lista ? (
          liderados.map((c) => <LinhaLideradoDrag key={c.id} colaborador={c} org={org} aoConvidar={aoConvidar} />)
        ) : (
          liderados.map((c) => <ChipLiderado key={c.id} colaborador={c} org={org} aoConvidar={aoConvidar} />)
        )}
      </div>

      {/* Adicionar liderado nesta equipe (inline). Na lista, em linha horizontal. */}
      <form onSubmit={adicionar} className={lista ? 'mt-1 flex flex-wrap items-start gap-2 border-t border-borda pt-3' : 'mt-1 flex flex-col gap-2 border-t border-borda pt-3'}>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do liderado"
          className={[lista ? 'min-w-40 flex-1' : 'w-full', 'rounded-[var(--radius-suave)] border-2 border-borda bg-areia px-3 py-1.5 text-sm text-tinta outline-none focus:border-juncao'].join(' ')}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="email@empresa.com"
          aria-invalid={emailInvalido}
          className={[
            lista ? 'min-w-48 flex-1' : 'w-full',
            'rounded-[var(--radius-suave)] border-2 bg-areia px-3 py-1.5 text-sm text-tinta outline-none transition-colors',
            emailInvalido ? 'border-alerta focus:border-alerta' : 'border-borda focus:border-juncao',
          ].join(' ')}
        />
        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          type="tel"
          placeholder="Telefone (opcional)"
          className={[lista ? 'w-40' : 'w-full', 'rounded-[var(--radius-suave)] border-2 border-borda bg-areia px-3 py-1.5 text-sm text-tinta outline-none focus:border-juncao'].join(' ')}
        />
        <button
          type="submit"
          disabled={!nome.trim() || !email.trim() || emailInvalido || criar.isPending}
          className={[lista ? '' : 'w-full', 'rounded-[var(--radius-suave)] border-2 border-borda px-3 py-1.5 text-sm font-bold text-tinta transition hover:border-tinta disabled:opacity-50'].join(' ')}
        >
          {criar.isPending ? 'Adicionando…' : '+ Adicionar'}
        </button>
        {/* Mensagens (ocupam a linha toda em ambos os layouts) */}
        {emailInvalido && <span className="w-full text-xs font-medium text-alerta">⚠ E-mail inválido (ex.: nome@empresa.com)</span>}
        {erro && <span className="w-full text-xs font-medium text-alerta">{erro}</span>}
      </form>
    </div>
  )
}

// ── Ações de um liderado (compartilhadas entre a view de cartões e a de lista) ─
function AcoesLiderado({
  colaborador,
  org,
  aoConvidar,
}: {
  colaborador: Colaborador
  org: Organizacao
  aoConvidar: (c: { id: string; nome: string }) => void
}) {
  const deletar = useDeletarColaborador(org.id)
  const desligar = useDesligarColaborador(org.id)
  const reativar = useReativarColaborador(org.id)
  const confirmar = useConfirmar()
  const [mostrarIA, setMostrarIA] = useState(false)
  const [mostrarPdi, setMostrarPdi] = useState(false)
  const [mostrarPainel, setMostrarPainel] = useState(false)

  const botao = 'rounded-full border border-borda px-2.5 py-1.5 text-xs text-tinta-suave transition hover:border-juncao hover:text-juncao sm:px-2 sm:py-1 sm:text-[0.7rem]'

  return (
    <>
      {/* stopPropagation: clicar nos botões não inicia o arraste do cartão */}
      <div className="flex flex-wrap items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
        {/* No celular: mover de equipe por seletor (no desktop é arrasto) */}
        <MoverEquipe colaborador={colaborador} org={org} />
        {colaborador.ativo && (
          <>
            <Link to={`/liderado/${colaborador.id}`} className="gradiente-marca rounded-full px-2.5 py-1 text-[0.7rem] font-bold text-white">
              1:1
            </Link>
            <button type="button" onClick={() => setMostrarIA(true)} title="IA: overview, pauta, feedback" aria-label="IA do liderado" className="rounded-full border border-borda px-2 py-1 text-[0.7rem] font-bold text-juncao hover:bg-juncao/10">✨</button>
            <button type="button" onClick={() => setMostrarPainel(true)} title="Acompanhamento: sentimento, entregas, feedbacks, estudos" aria-label="Acompanhamento do liderado" className={botao}>📊</button>
            <button type="button" onClick={() => setMostrarPdi(true)} title="PDI" aria-label="PDI do liderado" className={botao}>🎯</button>
            <Link to={`/liderado/${colaborador.id}/dossie`} title="Dossiê: indicadores + linha do tempo" aria-label="Dossiê do liderado" className={botao}>📜</Link>
            {!colaborador.usuario_id && (
              <button type="button" onClick={() => aoConvidar({ id: colaborador.id, nome: colaborador.nome })} className="rounded-full border border-borda px-2 py-1 text-[0.7rem] font-bold text-juncao hover:bg-juncao/10">
                Convidar
              </button>
            )}
          </>
        )}

        {/* Toggle Ativo/Inativo — liga/desliga direto, sem modal */}
        <button
          type="button"
          onClick={() => (colaborador.ativo ? desligar.mutate({ id: colaborador.id }) : reativar.mutate(colaborador.id))}
          title={colaborador.ativo ? 'Ativo — clique para desligar' : 'Inativo — clique para reativar'}
          aria-pressed={colaborador.ativo}
          className={['relative h-5 w-9 shrink-0 rounded-full transition-colors', colaborador.ativo ? 'bg-sucesso' : 'bg-borda'].join(' ')}
        >
          <span className={['absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', colaborador.ativo ? 'left-[1.15rem]' : 'left-0.5'].join(' ')} />
        </button>

        <button
          type="button"
          onClick={async () => {
            const ok = await confirmar({ emoji: '🗑️', perigoso: true, titulo: `Remover ${colaborador.nome.split(' ')[0]}?`, mensagem: 'Remove o liderado definitivamente. Se ele só saiu da empresa, use o toggle "Desligar".', textoConfirmar: 'Remover' })
            if (ok) deletar.mutate(colaborador.id)
          }}
          aria-label="Remover"
          className="px-1 text-[0.7rem] text-tinta-suave/40 hover:text-alerta"
        >
          ✕
        </button>
      </div>

      {mostrarIA && <PainelIALiderado colaboradorId={colaborador.id} nome={colaborador.nome} organizacaoId={org.id} aoFechar={() => setMostrarIA(false)} />}
      {mostrarPdi && <PdiLiderado colaboradorId={colaborador.id} nome={colaborador.nome} aoFechar={() => setMostrarPdi(false)} />}
      {mostrarPainel && <PainelLiderado colaboradorId={colaborador.id} nome={colaborador.nome} org={org} aoFechar={() => setMostrarPainel(false)} />}
    </>
  )
}

// ── Contato do liderado (e-mail + telefone) com botão de copiar ───────────────
function ContatoLiderado({ email, telefone }: { email: string; telefone: string | null }) {
  const [copiado, setCopiado] = useState('')
  function copiar(valor: string, tipo: string) {
    navigator.clipboard?.writeText(valor)
    setCopiado(tipo)
    setTimeout(() => setCopiado(''), 1200)
  }
  const linha = 'flex items-center gap-1 text-xs text-tinta-suave'
  const btn = 'shrink-0 rounded px-1 text-tinta-suave/60 transition hover:text-juncao'
  return (
    // stopPropagation: copiar não inicia arraste do cartão.
    <div className="flex flex-col gap-0.5" onPointerDown={(e) => e.stopPropagation()}>
      <div className={linha}>
        <span className="truncate">✉️ {email}</span>
        <button type="button" onClick={() => copiar(email, 'email')} title="Copiar e-mail" aria-label="Copiar e-mail" className={btn}>
          {copiado === 'email' ? '✓' : '📋'}
        </button>
      </div>
      {telefone && (
        <div className={linha}>
          <span className="truncate">📞 {telefone}</span>
          <button type="button" onClick={() => copiar(telefone, 'tel')} title="Copiar telefone" aria-label="Copiar telefone" className={btn}>
            {copiado === 'tel' ? '✓' : '📋'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Chip arrastável de um liderado (view de CARTÕES) ──────────────────────────
function ChipLiderado({
  colaborador,
  org,
  aoConvidar,
}: {
  colaborador: Colaborador
  org: Organizacao
  aoConvidar: (c: { id: string; nome: string }) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: colaborador.id })
  const estilo = { transform: CSS.Translate.toString(transform) }

  return (
    <div
      ref={setNodeRef}
      style={estilo}
      {...attributes}
      {...listeners}
      className={['cursor-grab touch-none select-none active:cursor-grabbing', isDragging ? 'opacity-30' : 'opacity-100'].join(' ')}
    >
      <ChipConteudo colaborador={colaborador}>
        <AcoesLiderado colaborador={colaborador} org={org} aoConvidar={aoConvidar} />
      </ChipConteudo>
    </div>
  )
}

// ── Conteúdo visual do chip — 2 linhas (nome em cima, ações embaixo) ──────────
function ChipConteudo({
  colaborador,
  sobreposicao = false,
  children,
}: {
  colaborador: Colaborador
  sobreposicao?: boolean
  children?: React.ReactNode
}) {
  return (
    <div
      className={[
        'flex flex-col gap-2 rounded-[var(--radius-suave)] border border-borda bg-areia p-2.5 shadow-[var(--shadow-cartao)]',
        sobreposicao ? 'rotate-2 shadow-[var(--shadow-flutuante)]' : '',
        !colaborador.ativo ? 'opacity-50 grayscale' : '',
        // Pisca âmbar enquanto o liderado ativo ainda não foi convidado (sem conta).
        !sobreposicao && colaborador.ativo && !colaborador.usuario_id ? 'piscar-alerta' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        <AvatarUsuario fotoUrl={colaborador.foto_url} nome={colaborador.nome} tamanho={30} />
        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-tinta">{colaborador.nome}</span>
          {!colaborador.ativo && (
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-alerta">Inativo</span>
          )}
        </div>
      </div>
      {!sobreposicao && <ContatoLiderado email={colaborador.email} telefone={colaborador.whatsapp} />}
      {children}
    </div>
  )
}

// ── Linha arrastável de um liderado (view de LISTA) ───────────────────────────
// A linha inteira é a "pega" de arraste; contato e ações têm stopPropagation, então
// clicar neles não inicia o arraste. Soltar numa outra faixa de equipe move o liderado.
function LinhaLideradoDrag({
  colaborador,
  org,
  aoConvidar,
}: {
  colaborador: Colaborador
  org: Organizacao
  aoConvidar: (c: { id: string; nome: string }) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: colaborador.id })
  const estilo = { transform: CSS.Translate.toString(transform) }
  return (
    <div
      ref={setNodeRef}
      style={estilo}
      {...attributes}
      {...listeners}
      className={[
        'flex flex-wrap items-center gap-3 rounded-[var(--radius-suave)] border border-borda bg-areia p-2.5 shadow-[var(--shadow-cartao)]',
        'cursor-grab touch-none select-none active:cursor-grabbing',
        isDragging ? 'opacity-30' : '',
        !colaborador.ativo ? 'opacity-60 grayscale' : '',
        // Pisca âmbar enquanto o liderado ativo ainda não foi convidado.
        colaborador.ativo && !colaborador.usuario_id ? 'piscar-alerta' : '',
      ].join(' ')}
    >
      <AvatarUsuario fotoUrl={colaborador.foto_url} nome={colaborador.nome} tamanho={34} />
      <div className="min-w-0 flex-1">
        <span className="block truncate font-bold text-tinta">
          {colaborador.nome}
          {!colaborador.ativo && <span className="ml-2 text-xs font-bold uppercase text-alerta">inativo</span>}
        </span>
        <ContatoLiderado email={colaborador.email} telefone={colaborador.whatsapp} />
      </div>
      <AcoesLiderado colaborador={colaborador} org={org} aoConvidar={aoConvidar} />
    </div>
  )
}
