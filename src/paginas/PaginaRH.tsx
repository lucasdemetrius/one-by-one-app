// Arquivo: src/paginas/PaginaRH.tsx
// Descrição: Painel do RH (topo do tenant). Diferente do painel do gestor: aqui o RH
//            vê TODOS os gestores que cadastrou, com os KPIs de produtividade dos 1:1
//            (saúde da agenda), cadastra novos gestores, e abre um drawer com o
//            drill-down de cada gestor (os 1:1 e a agenda dele). Os dados vêm das
//            rotas /api/v1/rh/... — o backend garante o isolamento por tenant.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { LayoutApp } from './LayoutApp'
import { SecaoAgendaRH } from './PaginaRHAgenda'
import { SecaoMatrixRH } from './PaginaRHMatrix'
import { BotaoDuo } from '@/componentes/ui/BotaoDuo'
import { Campo } from '@/componentes/ui/Campo'
import { Drawer } from '@/componentes/ui/Drawer'
import { useAuth } from '@/recursos/auth/AuthContext'
import { extrairMensagemErro } from '@/lib/api'
import {
  acompanhamentoDosGestores,
  agendamentosDoGestor,
  criarGestor,
  listarGestores,
  onebyonesDoGestor,
  type AgendamentoResumo,
  type GestorEvolucao,
  type GestorResumo,
  type OneByOneResumo,
} from '@/recursos/rh/rhApi'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Mensagem neutra de e-mail já em uso (não revela qual papel já usa o e-mail).
function humanizarErro(e: unknown): string {
  const msg = extrairMensagemErro(e)
  const m = msg.toLowerCase()
  if ((m.includes('e-mail') || m.includes('email')) && (m.includes('já') || m.includes('existe') || m.includes('cadastrad') || m.includes('uso'))) {
    return 'Este e-mail já está em uso. Tente outro.'
  }
  return msg
}

function fmtData(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtDataHora(s: string): string {
  const d = new Date(s)
  return isNaN(d.getTime()) ? s : d.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// Cor do "% em dia": verde (bom), âmbar (atenção), coral (crítico).
function corPercentual(p: number): string {
  if (p >= 80) return 'text-gestor'
  if (p >= 50) return 'text-amber-500'
  return 'text-alerta'
}

function corStatus(s: string): string {
  if (s === 'REALIZADO') return 'bg-gestor/15 text-gestor'
  if (s === 'PENDENTE') return 'bg-alerta/15 text-alerta'
  return 'bg-juncao/10 text-juncao'
}

// ── Drawer: cadastrar um novo gestor ───────────────────────────────────────────
function DrawerNovoGestor({ aoFechar, aoCriar }: { aoFechar: () => void; aoCriar: () => void }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const emailInvalido = email.trim().length > 0 && !EMAIL_RE.test(email.trim())
  const podeSalvar = nome.trim().length >= 2 && EMAIL_RE.test(email.trim()) && senha.trim().length >= 6

  async function salvar(fechar: () => void) {
    if (!podeSalvar) return
    setErro('')
    setSalvando(true)
    try {
      await criarGestor({ nome: nome.trim(), email: email.trim(), password: senha, empresa: empresa.trim() || undefined })
      aoCriar()
      fechar()
    } catch (e) {
      setErro(humanizarErro(e))
      setSalvando(false)
    }
  }

  return (
    <Drawer aoFechar={aoFechar}>
      {(fechar) => (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-borda px-6 py-5">
            <h2 className="fonte-display text-2xl font-extrabold text-tinta">Novo gestor</h2>
            <button type="button" onClick={fechar} aria-label="Fechar" className="text-2xl text-tinta-suave hover:text-tinta">✕</button>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); salvar(fechar) }}
            className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6"
          >
            <p className="text-tinta-suave">
              O gestor recebe uma conta e, ao entrar, monta o próprio time e faz os 1:1. Você acompanha tudo por aqui.
            </p>
            <Campo rotulo="Nome do gestor" valor={nome} onChange={setNome} placeholder="Como ele será chamado" />
            <Campo rotulo="E-mail" tipo="email" valor={email} onChange={setEmail} placeholder="gestor@empresa.com" erro={emailInvalido ? 'E-mail inválido' : undefined} />
            <Campo rotulo="Senha inicial" tipo="password" valor={senha} onChange={setSenha} placeholder="mínimo 6 caracteres" autoComplete="new-password" />
            <Campo rotulo="Empresa (opcional)" valor={empresa} onChange={setEmpresa} placeholder="Ex.: Acme Ltda — a que o gestor vai usar" />
            {erro && (
              <div className="rounded-[var(--radius-suave)] border-2 border-alerta/30 bg-alerta/10 px-4 py-3 text-sm font-medium text-alerta">
                {erro}
              </div>
            )}
            <div className="mt-auto">
              <BotaoDuo type="submit" variante="marca" tamanho="grande" larguraTotal carregando={salvando}>
                Cadastrar gestor
              </BotaoDuo>
            </div>
          </form>
        </div>
      )}
    </Drawer>
  )
}

// ── Drawer: drill-down de um gestor (1:1 + agenda) ─────────────────────────────
function DrawerDetalheGestor({ gestor, aoFechar }: { gestor: GestorResumo; aoFechar: () => void }) {
  const [onebyones, setOnebyones] = useState<OneByOneResumo[]>([])
  const [agenda, setAgenda] = useState<AgendamentoResumo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    Promise.all([onebyonesDoGestor(gestor.id), agendamentosDoGestor(gestor.id)])
      .then(([o, a]) => { if (ativo) { setOnebyones(o); setAgenda(a) } })
      .catch((e) => { if (ativo) setErro(extrairMensagemErro(e)) })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [gestor.id])

  return (
    <Drawer aoFechar={aoFechar} largura="max-w-lg">
      {(fechar) => (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-borda px-6 py-5">
            <div className="min-w-0">
              <h2 className="fonte-display truncate text-2xl font-extrabold text-tinta">{gestor.nome}</h2>
              <p className="truncate text-sm text-tinta-suave">{gestor.email}</p>
            </div>
            <button type="button" onClick={fechar} aria-label="Fechar" className="text-2xl text-tinta-suave hover:text-tinta">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* KPIs no topo do detalhe */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              <div className="rounded-[var(--radius-suave)] border border-borda bg-creme p-3 text-center">
                <div className={`fonte-display text-2xl font-extrabold ${corPercentual(gestor.percentual_em_dia)}`}>{gestor.percentual_em_dia}%</div>
                <div className="text-xs text-tinta-suave">em dia</div>
              </div>
              <div className="rounded-[var(--radius-suave)] border border-borda bg-creme p-3 text-center">
                <div className="fonte-display text-2xl font-extrabold text-tinta">{gestor.realizados_ult_30}</div>
                <div className="text-xs text-tinta-suave">1:1 em 30d</div>
              </div>
              <div className="rounded-[var(--radius-suave)] border border-borda bg-creme p-3 text-center">
                <div className="fonte-display text-2xl font-extrabold text-tinta">🔥 {gestor.streak_semanas}</div>
                <div className="text-xs text-tinta-suave">sem. seguidas</div>
              </div>
            </div>

            {carregando && <p className="text-tinta-suave">Carregando…</p>}
            {erro && <p className="text-alerta">{erro}</p>}

            {!carregando && !erro && (
              <>
                {/* Agenda */}
                <h3 className="fonte-display mb-2 text-lg font-bold text-tinta">Agenda de 1:1</h3>
                {agenda.length === 0 ? (
                  <p className="mb-6 text-sm text-tinta-suave">Nenhum 1:1 agendado.</p>
                ) : (
                  <div className="mb-6 flex flex-col gap-2">
                    {agenda.map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-[var(--radius-suave)] border border-borda bg-creme px-3 py-2">
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-bold text-tinta">{a.liderado_nome || 'Liderado'}</span>
                          <span className="block text-xs text-tinta-suave">{a.recorrencia !== 'NENHUMA' ? a.recorrencia.toLowerCase() : 'sem recorrência'}</span>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-tinta-suave">{fmtDataHora(a.data_hora)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 1:1 (livro-razão) */}
                <h3 className="fonte-display mb-2 text-lg font-bold text-tinta">Histórico de 1:1</h3>
                {onebyones.length === 0 ? (
                  <p className="text-sm text-tinta-suave">Nenhum 1:1 registrado ainda.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {onebyones.map((o) => (
                      <div key={o.id} className="flex items-center justify-between rounded-[var(--radius-suave)] border border-borda bg-creme px-3 py-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${corStatus(o.status)}`}>{o.status}</span>
                        <span className="text-sm text-tinta-suave">
                          {o.status === 'REALIZADO' && o.realizado_em ? `Realizado ${fmtData(o.realizado_em)}` : `Agendado ${fmtData(o.data_agendada)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Drawer>
  )
}

// Lê a tendência de humor do time (recente − anterior) como ícone, cor e rótulo.
function tendenciaHumor(t: number): { icone: string; cor: string; rotulo: string } {
  if (t <= -0.3) return { icone: '↘', cor: 'text-alerta', rotulo: 'caindo' }
  if (t >= 0.3) return { icone: '↗', cor: 'text-sucesso', rotulo: 'subindo' }
  return { icone: '→', cor: 'text-tinta-suave', rotulo: 'estável' }
}

// ── Cartão de EVOLUÇÃO de um gestor (qualidade, não quantidade) ────────────────
// Mostra a evolução dos liderados do gestor: humor do time, PDI e quem está em risco.
// O destaque é "com quem o RH deve sentar" — não quantos 1:1 foram feitos.
function CartaoEvolucao({ g }: { g: GestorEvolucao }) {
  const [aberto, setAberto] = useState(false)
  const riscos = g.riscos ?? [] // o backend pode mandar null quando não há ninguém em risco
  const tend = tendenciaHumor(g.humor_tendencia)
  const emRisco = g.liderados_em_risco > 0

  return (
    <div className={`flex flex-col rounded-[var(--radius-cartao)] border bg-creme p-5 shadow-[var(--shadow-cartao)] ${emRisco ? 'border-alerta/40' : 'border-borda'}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gestor text-base font-bold text-white">
            {g.gestor_nome.charAt(0).toUpperCase()}
          </span>
          <span className="truncate font-bold text-tinta">{g.gestor_nome}</span>
        </div>
        {emRisco ? (
          <span className="shrink-0 rounded-full bg-alerta/15 px-2.5 py-1 text-xs font-bold text-alerta">🚩 {g.liderados_em_risco} em risco</span>
        ) : g.total_liderados > 0 ? (
          <span className="shrink-0 rounded-full bg-sucesso/15 px-2.5 py-1 text-xs font-bold text-sucesso">✓ time bem</span>
        ) : null}
      </div>

      <dl className="flex flex-col gap-1.5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-tinta-suave">Humor do time</dt>
          <dd className={`font-bold ${tend.cor}`}>
            {g.com_humor > 0 ? `${tend.icone} ${g.humor_media.toFixed(1)} · ${tend.rotulo}` : '— sem registros'}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-tinta-suave">PDI</dt>
          <dd className="font-semibold text-tinta">
            {g.pdi_total > 0
              ? `${g.pdi_concluidos}/${g.pdi_total}${g.pdi_atrasados ? ` · ${g.pdi_atrasados} atrasado${g.pdi_atrasados > 1 ? 's' : ''}` : ''}`
              : '— sem PDI'}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-tinta-suave">Liderados</dt>
          <dd className="font-semibold text-tinta">
            {g.total_liderados}
            {g.sem_classificacao ? ` · ${g.sem_classificacao} sem 9-box` : ''}
          </dd>
        </div>
      </dl>

      {riscos.length > 0 && (
        <div className="mt-3">
          <button type="button" onClick={() => setAberto((v) => !v)} className="text-xs font-bold text-juncao hover:underline">
            {aberto ? 'ocultar' : `ver quem precisa de atenção (${riscos.length})`}
          </button>
          {aberto && (
            <ul className="mt-2 flex flex-col gap-1">
              {riscos.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-2 rounded-[var(--radius-suave)] bg-alerta/5 px-2.5 py-1.5 text-xs">
                  <Link to={`/liderado/${r.colaborador_id}/dossie`} className="truncate font-semibold text-tinta transition hover:text-juncao hover:underline" title={`Abrir o dossiê de ${r.nome}`}>
                    {r.nome}
                  </Link>
                  <span className="shrink-0 text-alerta">{r.motivo}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export function PaginaRH() {
  const { usuario } = useAuth()
  const [gestores, setGestores] = useState<GestorResumo[]>([])
  const [evolucao, setEvolucao] = useState<GestorEvolucao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [abrirNovo, setAbrirNovo] = useState(false)
  const [detalhe, setDetalhe] = useState<GestorResumo | null>(null)

  function recarregar() {
    setCarregando(true)
    listarGestores()
      .then((gs) => { setGestores(gs); setErro('') })
      .catch((e) => setErro(extrairMensagemErro(e)))
      .finally(() => setCarregando(false))
    // Evolução dos liderados por gestor (best-effort: não derruba o painel se falhar).
    acompanhamentoDosGestores().then(setEvolucao).catch(() => {})
  }

  useEffect(() => { recarregar() }, [])

  const primeiroNome = usuario?.nome?.split(' ')[0] ?? 'RH'

  return (
    <LayoutApp>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-sm font-bold uppercase tracking-wider text-juncao">Painel do RH</span>
          <h1 className="fonte-display mt-1 text-3xl font-extrabold text-tinta sm:text-4xl">
            Olá, {primeiroNome} 👋
          </h1>
          <p className="mt-2 text-tinta-suave">Acompanhe a evolução dos liderados de cada gestor — e veja com quem vale sentar.</p>
        </div>
        <BotaoDuo variante="marca" onClick={() => setAbrirNovo(true)}>
          + Cadastrar gestor
        </BotaoDuo>
      </div>

      {/* Acompanhamento dos gestores — foco na EVOLUÇÃO dos liderados (não na contagem de
          1:1). Já vem ordenado por necessidade de atenção (🚩 primeiro). */}
      {evolucao.length > 0 && (
        <section className="mb-10">
          <div className="mb-3">
            <h2 className="fonte-display text-xl font-bold text-tinta">🌱 Acompanhamento dos gestores</h2>
            <p className="text-sm text-tinta-suave">Onde os liderados estão (ou não) evoluindo — comece por quem está marcado com 🚩.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {evolucao.map((g) => (
              <CartaoEvolucao key={g.gestor_id} g={g} />
            ))}
          </div>
        </section>
      )}

      {carregando && <p className="text-tinta-suave">Carregando gestores…</p>}
      {erro && (
        <div className="rounded-[var(--radius-suave)] border-2 border-alerta/30 bg-alerta/10 px-4 py-3 text-sm font-medium text-alerta">
          {erro}
        </div>
      )}

      {/* Estado vazio */}
      {!carregando && !erro && gestores.length === 0 && (
        <div className="rounded-[var(--radius-cartao)] border-2 border-dashed border-borda bg-creme/40 p-10 text-center">
          <div className="gradiente-marca mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[var(--radius-grande)] text-3xl">🏛️</div>
          <h2 className="fonte-display text-2xl font-extrabold text-tinta">Cadastre seu primeiro gestor</h2>
          <p className="mx-auto mt-2 max-w-md text-tinta-suave">
            Cada gestor entra com a própria conta, monta o time e faz os 1:1. Você acompanha tudo daqui.
          </p>
          <div className="mt-6 flex justify-center">
            <BotaoDuo variante="marca" onClick={() => setAbrirNovo(true)}>+ Cadastrar gestor</BotaoDuo>
          </div>
        </div>
      )}

      {/* Grade de gestores */}
      {!carregando && gestores.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gestores.map((g) => (
            <div key={g.id} className="flex flex-col rounded-[var(--radius-cartao)] border border-borda bg-creme p-5 shadow-[var(--shadow-cartao)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gestor text-lg font-bold text-white">
                  {g.nome.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <span className="block truncate font-bold text-tinta">{g.nome}</span>
                  <span className="block truncate text-xs text-tinta-suave">{g.email}</span>
                </div>
              </div>

              <div className="mb-4 flex items-end gap-4">
                <div>
                  <span className={`fonte-display text-3xl font-extrabold ${corPercentual(g.percentual_em_dia)}`}>{g.percentual_em_dia}%</span>
                  <span className="ml-1 text-xs text-tinta-suave">em dia</span>
                </div>
                <div className="mb-1 flex flex-col text-xs text-tinta-suave">
                  <span>{g.total_agendados} agendados · {g.atrasados} atrasados</span>
                  <span>{g.realizados_ult_30} em 30d · 🔥 {g.streak_semanas} sem.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetalhe(g)}
                className="mt-auto rounded-[var(--radius-suave)] border-2 border-borda px-4 py-2 text-sm font-bold text-tinta transition hover:border-juncao"
              >
                Ver 1:1 e agenda →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Embaixo dos indicadores: calendário e Matrix9-Box consolidados da empresa. */}
      {!carregando && gestores.length > 0 && (
        <div className="mt-12 border-t border-borda pt-10">
          <SecaoAgendaRH />
          <SecaoMatrixRH />
        </div>
      )}

      {abrirNovo && <DrawerNovoGestor aoFechar={() => setAbrirNovo(false)} aoCriar={recarregar} />}
      {detalhe && <DrawerDetalheGestor gestor={detalhe} aoFechar={() => setDetalhe(null)} />}
    </LayoutApp>
  )
}
