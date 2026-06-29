// Arquivo: src/paginas/PaginaRegistro.tsx
// Descrição: Cadastro em estilo "Duolingo". Começa por um PASSO 0 onde a pessoa diz
//            se é GESTOR ou RH — porque agora a aplicação tem dois mundos:
//              • Gestor (role LIDER): monta seu time e faz os 1:1. Fluxo de 3 passos
//                (conta → equipes → liderados), igual ao de sempre.
//              • RH (role RH): é o topo da empresa. Cadastra a própria conta e depois
//                os GESTORES; cada gestor depois monta o seu time. Fluxo de 2 passos
//                (conta → gestores).
//            A cada passo o dado é gravado de verdade, então ao concluir já caímos no
//            painel com tudo montado. Comemora com fogos no fim.

import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Campo } from '@/componentes/ui/Campo'
import { BotaoDuo } from '@/componentes/ui/BotaoDuo'
import { useAuth } from '@/recursos/auth/AuthContext'
import { extrairMensagemErro } from '@/lib/api'
import { fogos } from '@/lib/fogos'
import { criarColaborador, criarEquipe, criarOrganizacao } from '@/recursos/time/timeApi'
import { criarGestor } from '@/recursos/rh/rhApi'
import { LayoutAuth } from './LayoutAuth'
import { RequisitosSenha, senhaForte } from '@/componentes/auth/RequisitosSenha'
import { CampoRecaptcha } from '@/componentes/auth/CampoRecaptcha'

// Regex simples de e-mail para o sinal vermelho em tempo real.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// humanizarErro deixa a mensagem de e-mail duplicado NEUTRA e amigável — sem revelar
// qual papel (Gestor/RH/Liderado) já usa aquele e-mail (privacidade). Para os demais
// erros, mantém a mensagem original do backend.
function humanizarErro(e: unknown): string {
  const msg = extrairMensagemErro(e)
  const m = msg.toLowerCase()
  const ehEmail = m.includes('e-mail') || m.includes('email')
  const ehDuplicado =
    m.includes('já') || m.includes('existe') || m.includes('cadastrad') || m.includes('uso')
  if (ehEmail && ehDuplicado) {
    return 'Este e-mail já está em uso. Faça login ou use outro.'
  }
  return msg
}

interface LideradoNovo {
  nome: string
  email: string
  equipeId: string
}

interface GestorNovo {
  nome: string
  email: string
  senha: string
}

// Papel escolhido no Passo 0 ('' = ainda não escolheu).
type PapelEscolhido = '' | 'GESTOR' | 'RH'

export function PaginaRegistro() {
  const { cadastrar, entrar } = useAuth()
  const navegar = useNavigate()

  // Passo 0 — quem é você?
  const [papel, setPapel] = useState<PapelEscolhido>('')

  const [passo, setPasso] = useState<1 | 2 | 3>(1)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [tokenRecaptcha, setTokenRecaptcha] = useState('')
  const [errosCampos, setErrosCampos] = useState<{ nome?: string; email?: string }>({})
  const [comemorando, setComemorando] = useState(false)

  // Conta (compartilhado por Gestor e RH)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [orgId, setOrgId] = useState('')

  // Gestor · Passo 2 — equipes
  const [nomeEquipe, setNomeEquipe] = useState('')
  const [equipesDigitadas, setEquipesDigitadas] = useState<string[]>([])
  const [equipesCriadas, setEquipesCriadas] = useState<{ id: string; nome: string }[]>([])

  // Gestor · Passo 3 — liderados
  const [lidNome, setLidNome] = useState('')
  const [lidEmail, setLidEmail] = useState('')
  const [lidEquipe, setLidEquipe] = useState('')
  const [liderados, setLiderados] = useState<LideradoNovo[]>([])

  // RH · Passo 2 — gestores
  const [gNome, setGNome] = useState('')
  const [gEmail, setGEmail] = useState('')
  const [gSenha, setGSenha] = useState('')
  const [gestores, setGestores] = useState<GestorNovo[]>([])
  const [empresaRH, setEmpresaRH] = useState('')

  const lidEmailInvalido = lidEmail.trim().length > 0 && !EMAIL_RE.test(lidEmail.trim())
  const gEmailInvalido = gEmail.trim().length > 0 && !EMAIL_RE.test(gEmail.trim())

  // ── Passo 0: escolha do papel ───────────────────────────────────────────────
  function escolher(p: 'GESTOR' | 'RH') {
    setErro('')
    setPapel(p)
    setPasso(1)
  }

  // Quantos passos a barra de progresso mostra conforme o papel (Gestor=3, RH=2).
  const totalPassos = papel === 'RH' ? 2 : 3

  // Valida os campos da conta (nome/e-mail/senha) e destaca em vermelho o que falta.
  function contaValida(): boolean {
    const errs: { nome?: string; email?: string } = {}
    if (!nome.trim()) errs.nome = 'Informe seu nome.'
    if (!EMAIL_RE.test(email.trim())) errs.email = 'Informe um e-mail válido.'
    setErrosCampos(errs)
    return Object.keys(errs).length === 0 && senhaForte(senha)
  }

  // ── GESTOR · Passo 1: cria conta + login + organização padrão ───────────────
  async function concluirPasso1(ev: React.FormEvent) {
    ev.preventDefault()
    setErro('')
    if (!contaValida()) return
    setCarregando(true)
    try {
      await cadastrar({ nome, email, password: senha, role: 'LIDER' }, tokenRecaptcha)
      await entrar({ email, password: senha })
      const org = await criarOrganizacao({ nome: 'Minha empresa' })
      setOrgId(org.id)
      setPasso(2)
    } catch (e) {
      setErro(humanizarErro(e))
    } finally {
      setCarregando(false)
    }
  }

  function adicionarEquipeNaLista() {
    const n = nomeEquipe.trim()
    if (!n) return
    setEquipesDigitadas((lista) => [...lista, n])
    setNomeEquipe('')
  }

  // ── GESTOR · Passo 2: cria as equipes digitadas ─────────────────────────────
  async function concluirPasso2() {
    setErro('')
    setCarregando(true)
    try {
      const nomes = equipesDigitadas.length > 0 ? equipesDigitadas : ['Meu time']
      const criadas: { id: string; nome: string }[] = []
      for (const n of nomes) {
        const eq = await criarEquipe({ organizacao_id: orgId, nome: n })
        criadas.push({ id: eq.id, nome: eq.nome })
      }
      setEquipesCriadas(criadas)
      setLidEquipe(criadas[0]?.id ?? '')
      setPasso(3)
    } catch (e) {
      setErro(humanizarErro(e))
    } finally {
      setCarregando(false)
    }
  }

  function adicionarLideradoNaLista() {
    if (!lidNome.trim() || !EMAIL_RE.test(lidEmail.trim()) || !lidEquipe) return
    setLiderados((lista) => [
      ...lista,
      { nome: lidNome.trim(), email: lidEmail.trim(), equipeId: lidEquipe },
    ])
    setLidNome('')
    setLidEmail('')
  }

  // ── GESTOR · Passo 3: cria os liderados e comemora ──────────────────────────
  async function concluir() {
    setErro('')
    setCarregando(true)
    try {
      for (const l of liderados) {
        await criarColaborador({
          organizacao_id: orgId,
          equipe_id: l.equipeId,
          nome: l.nome,
          email: l.email,
        })
      }
      comemorarEIr()
    } catch (e) {
      setErro(humanizarErro(e))
      setCarregando(false)
    }
  }

  // ── RH · Passo 1: cria a conta de RH + login ────────────────────────────────
  async function concluirContaRH(ev: React.FormEvent) {
    ev.preventDefault()
    setErro('')
    if (!contaValida()) return
    setCarregando(true)
    try {
      await cadastrar({ nome, email, password: senha, role: 'RH' }, tokenRecaptcha)
      await entrar({ email, password: senha })
      setPasso(2)
    } catch (e) {
      setErro(humanizarErro(e))
    } finally {
      setCarregando(false)
    }
  }

  function adicionarGestorNaLista() {
    if (!gNome.trim() || !EMAIL_RE.test(gEmail.trim()) || gSenha.trim().length < 6) return
    // E-mail = uma conta. Não pode repetir na lista, nem ser o e-mail da própria conta de RH
    // (Gestor e RH nunca compartilham e-mail). O backend também barra, mas avisamos antes.
    const alvo = gEmail.trim().toLowerCase()
    if (alvo === email.trim().toLowerCase()) {
      setErro('Esse é o e-mail da sua conta de RH. Cada gestor precisa de um e-mail próprio.')
      return
    }
    if (gestores.some((g) => g.email.toLowerCase() === alvo)) {
      setErro('Esse e-mail já está na lista. Um e-mail = uma conta.')
      return
    }
    setErro('')
    setGestores((lista) => [
      ...lista,
      { nome: gNome.trim(), email: gEmail.trim(), senha: gSenha },
    ])
    setGNome('')
    setGEmail('')
    setGSenha('')
  }

  // ── RH · Passo 2: cria os gestores e comemora ───────────────────────────────
  async function concluirRH() {
    setErro('')
    setCarregando(true)
    try {
      for (const g of gestores) {
        await criarGestor({ nome: g.nome, email: g.email, password: g.senha, empresa: empresaRH.trim() || undefined })
      }
      comemorarEIr()
    } catch (e) {
      setErro(humanizarErro(e))
      setCarregando(false)
    }
  }

  // Comemoração compartilhada pelos dois fluxos.
  function comemorarEIr() {
    setComemorando(true)
    fogos(3200)
    // RH tem painel próprio; gestor cai no painel padrão.
    setTimeout(() => navegar(papel === 'RH' ? '/rh' : '/painel'), 2800)
  }

  const nomeEquipePorId = useMemo(
    () => Object.fromEntries(equipesCriadas.map((e) => [e.id, e.nome])),
    [equipesCriadas],
  )

  // ── Tela de comemoração ─────────────────────────────────────────────────────
  if (comemorando) {
    const titulo =
      papel === 'RH'
        ? `Tudo pronto, ${nome.split(' ')[0] || 'RH'}!`
        : `Tudo pronto, ${nome.split(' ')[0] || 'gestor'}!`
    const legenda = papel === 'RH' ? 'Seus gestores já estão a bordo. Preparando seu painel…' : 'Seu time já está montado. Preparando seu painel…'
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-areia px-6 text-center">
        <div className="animar-pop">
          <div className="gradiente-marca mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[var(--radius-grande)] text-4xl">
            🎉
          </div>
          <h1 className="fonte-display text-4xl font-extrabold text-tinta">{titulo}</h1>
          <p className="mt-3 text-lg text-tinta-suave">{legenda}</p>
        </div>
      </div>
    )
  }

  const erroBox = erro && (
    <div className="rounded-[var(--radius-suave)] border-2 border-alerta/30 bg-alerta/10 px-4 py-3 text-sm font-medium text-alerta">
      {erro}
    </div>
  )

  // ── PASSO 0 — quem é você? ───────────────────────────────────────────────────
  if (papel === '') {
    return (
      <LayoutAuth chamada="Veja o OneByOne em ação">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="fonte-display text-3xl font-extrabold text-tinta sm:text-4xl">
              Como você vai usar?
            </h1>
            <p className="mt-2 text-tinta-suave">Isso ajuda a montar tudo do seu jeito.</p>
          </div>

          {/* Cartão: Gestor */}
          <button
            type="button"
            onClick={() => escolher('GESTOR')}
            className="group flex items-center gap-4 rounded-[var(--radius-cartao)] border-2 border-borda bg-creme p-5 text-left transition hover:border-juncao hover:shadow-md"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-grande)] bg-juncao/10 text-3xl">
              🧭
            </span>
            <span className="min-w-0">
              <span className="block fonte-display text-xl font-extrabold text-tinta">Sou Gestor</span>
              <span className="block text-sm text-tinta-suave">
                Gerencio meu time e faço os 1:1 com meus liderados.
              </span>
            </span>
          </button>

          {/* Cartão: RH */}
          <button
            type="button"
            onClick={() => escolher('RH')}
            className="group flex items-center gap-4 rounded-[var(--radius-cartao)] border-2 border-borda bg-creme p-5 text-left transition hover:border-juncao hover:shadow-md"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-grande)] bg-liderado/15 text-3xl">
              🏛️
            </span>
            <span className="min-w-0">
              <span className="block fonte-display text-xl font-extrabold text-tinta">Sou RH</span>
              <span className="block text-sm text-tinta-suave">
                Cadastro os gestores da empresa e acompanho todos eles.
              </span>
            </span>
          </button>

          <p className="text-center text-base text-tinta-suave">
            Já tem conta?{' '}
            <Link to="/entrar" className="font-bold text-juncao hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </LayoutAuth>
    )
  }

  return (
    <LayoutAuth chamada="Veja o OneByOne em ação">
      {/* Barra de progresso (3 passos no Gestor, 2 no RH) */}
      <div className="mb-8 flex items-center gap-2">
        {Array.from({ length: totalPassos }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            className={[
              'h-2.5 flex-1 rounded-full transition-colors',
              n <= passo ? 'gradiente-marca' : 'bg-borda',
            ].join(' ')}
          />
        ))}
      </div>

      {/* ───────────────────────────── FLUXO GESTOR ───────────────────────────── */}
      {papel === 'GESTOR' && passo === 1 && (
        <form onSubmit={concluirPasso1} className="flex flex-col gap-5">
          <div>
            <button
              type="button"
              onClick={() => setPapel('')}
              className="text-sm font-bold text-juncao hover:underline"
            >
              ← Voltar
            </button>
            <span className="mt-2 block text-sm font-bold uppercase tracking-wider text-juncao">
              Passo 1 de 3
            </span>
            <h1 className="fonte-display mt-1 text-3xl font-extrabold text-tinta sm:text-4xl">
              Crie sua conta
            </h1>
            <p className="mt-2 text-tinta-suave">Você é o gestor do time. Leva menos de um minuto.</p>
          </div>
          <Campo tamanho="grande" rotulo="Seu nome" valor={nome} onChange={setNome} placeholder="Como quer ser chamado" autoComplete="name" erro={errosCampos.nome} />
          <Campo tamanho="grande" rotulo="E-mail" tipo="email" valor={email} onChange={setEmail} placeholder="voce@empresa.com" autoComplete="email" erro={errosCampos.email} />
          <Campo tamanho="grande" rotulo="Senha" tipo="password" valor={senha} onChange={setSenha} placeholder="crie uma senha forte" autoComplete="new-password" />
          <RequisitosSenha senha={senha} />
          {erroBox}
          <CampoRecaptcha onToken={setTokenRecaptcha} />
          <BotaoDuo type="submit" variante="marca" tamanho="grande" larguraTotal carregando={carregando}>
            Continuar →
          </BotaoDuo>
          <p className="text-center text-base text-tinta-suave">
            Já tem conta?{' '}
            <Link to="/entrar" className="font-bold text-juncao hover:underline">Entrar</Link>
          </p>
        </form>
      )}

      {papel === 'GESTOR' && passo === 2 && (
        <div className="flex flex-col gap-5">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-juncao">Passo 2 de 3</span>
            <h1 className="fonte-display mt-1 text-3xl font-extrabold text-tinta sm:text-4xl">
              Quais são suas equipes?
            </h1>
            <p className="mt-2 text-tinta-suave">Pode adicionar várias — ou pular e criar depois.</p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); adicionarEquipeNaLista() }}
            className="flex gap-2"
          >
            <Campo tamanho="grande" rotulo="" valor={nomeEquipe} onChange={setNomeEquipe} placeholder="Ex.: Produto, Vendas…" />
            <button
              type="submit"
              disabled={!nomeEquipe.trim()}
              className="mt-0 shrink-0 self-stretch rounded-[var(--radius-suave)] border-2 border-borda px-5 text-2xl font-bold text-tinta transition hover:border-juncao disabled:opacity-40"
            >
              +
            </button>
          </form>

          {equipesDigitadas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {equipesDigitadas.map((nomeEq, i) => (
                <span key={i} className="flex items-center gap-2 rounded-full bg-juncao/10 px-3 py-1.5 text-sm font-bold text-juncao">
                  {nomeEq}
                  <button
                    type="button"
                    onClick={() => setEquipesDigitadas((l) => l.filter((_, idx) => idx !== i))}
                    aria-label={`Remover ${nomeEq}`}
                    className="text-juncao/60 hover:text-alerta"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {erroBox}
          <BotaoDuo variante="marca" tamanho="grande" larguraTotal carregando={carregando} onClick={concluirPasso2}>
            {equipesDigitadas.length > 0 ? 'Continuar →' : 'Pular por agora →'}
          </BotaoDuo>
        </div>
      )}

      {papel === 'GESTOR' && passo === 3 && (
        <div className="flex flex-col gap-5">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-juncao">Passo 3 de 3</span>
            <h1 className="fonte-display mt-1 text-3xl font-extrabold text-tinta sm:text-4xl">
              Quem são seus liderados?
            </h1>
            <p className="mt-2 text-tinta-suave">Adicione quem quiser agora — dá pra completar depois.</p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); adicionarLideradoNaLista() }}
            className="flex flex-col gap-3 rounded-[var(--radius-cartao)] border-2 border-dashed border-borda bg-creme/40 p-4"
          >
            <Campo rotulo="" valor={lidNome} onChange={setLidNome} placeholder="Nome do liderado" />
            <Campo rotulo="" tipo="email" valor={lidEmail} onChange={setLidEmail} placeholder="email@empresa.com" erro={lidEmailInvalido ? 'E-mail inválido (ex.: nome@empresa.com)' : undefined} />
            {equipesCriadas.length > 1 && (
              <select
                value={lidEquipe}
                onChange={(e) => setLidEquipe(e.target.value)}
                className="w-full rounded-[var(--radius-suave)] border-2 border-borda bg-creme px-4 py-3 text-tinta outline-none focus:border-juncao"
              >
                {equipesCriadas.map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.nome}</option>
                ))}
              </select>
            )}
            <button
              type="submit"
              disabled={!lidNome.trim() || !EMAIL_RE.test(lidEmail.trim()) || !lidEquipe}
              className="rounded-[var(--radius-suave)] border-2 border-borda px-4 py-2.5 text-sm font-bold text-tinta transition hover:border-juncao disabled:opacity-40"
            >
              + Adicionar liderado
            </button>
          </form>

          {liderados.length > 0 && (
            <div className="flex flex-col gap-2">
              {liderados.map((l, i) => (
                <div key={i} className="flex items-center gap-3 rounded-[var(--radius-suave)] border border-borda bg-creme px-3 py-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-liderado/15 text-sm font-bold text-liderado">
                    {l.nome.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-tinta">{l.nome}</span>
                    <span className="block truncate text-xs text-tinta-suave">
                      {l.email}{nomeEquipePorId[l.equipeId] ? ` · ${nomeEquipePorId[l.equipeId]}` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLiderados((lista) => lista.filter((_, idx) => idx !== i))}
                    aria-label={`Remover ${l.nome}`}
                    className="text-tinta-suave/50 hover:text-alerta"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {erroBox}
          <BotaoDuo variante="sucesso" tamanho="grande" larguraTotal carregando={carregando} onClick={concluir}>
            {liderados.length > 0 ? '🎉 Concluir e ver meu painel' : 'Ver meu painel →'}
          </BotaoDuo>
        </div>
      )}

      {/* ────────────────────────────── FLUXO RH ──────────────────────────────── */}
      {papel === 'RH' && passo === 1 && (
        <form onSubmit={concluirContaRH} className="flex flex-col gap-5">
          <div>
            <button
              type="button"
              onClick={() => setPapel('')}
              className="text-sm font-bold text-juncao hover:underline"
            >
              ← Voltar
            </button>
            <span className="mt-2 block text-sm font-bold uppercase tracking-wider text-juncao">
              Passo 1 de 2
            </span>
            <h1 className="fonte-display mt-1 text-3xl font-extrabold text-tinta sm:text-4xl">
              Crie a conta do RH
            </h1>
            <p className="mt-2 text-tinta-suave">
              Você é o topo da empresa. Depois você cadastra seus gestores.
            </p>
          </div>
          <Campo tamanho="grande" rotulo="Seu nome" valor={nome} onChange={setNome} placeholder="Como quer ser chamado" autoComplete="name" erro={errosCampos.nome} />
          <Campo tamanho="grande" rotulo="E-mail" tipo="email" valor={email} onChange={setEmail} placeholder="rh@empresa.com" autoComplete="email" erro={errosCampos.email} />
          <Campo tamanho="grande" rotulo="Senha" tipo="password" valor={senha} onChange={setSenha} placeholder="crie uma senha forte" autoComplete="new-password" />
          <RequisitosSenha senha={senha} />
          {erroBox}
          <CampoRecaptcha onToken={setTokenRecaptcha} />
          <BotaoDuo type="submit" variante="marca" tamanho="grande" larguraTotal carregando={carregando}>
            Continuar →
          </BotaoDuo>
          <p className="text-center text-base text-tinta-suave">
            Já tem conta?{' '}
            <Link to="/entrar" className="font-bold text-juncao hover:underline">Entrar</Link>
          </p>
        </form>
      )}

      {papel === 'RH' && passo === 2 && (
        <div className="flex flex-col gap-5">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-juncao">Passo 2 de 2</span>
            <h1 className="fonte-display mt-1 text-3xl font-extrabold text-tinta sm:text-4xl">
              Adicione seus gestores
            </h1>
            <p className="mt-2 text-tinta-suave">
              Cada gestor recebe uma conta e depois monta o próprio time. Pode pular e cadastrar depois.
            </p>
          </div>

          <Campo
            tamanho="grande"
            rotulo="Nome da empresa"
            valor={empresaRH}
            onChange={setEmpresaRH}
            placeholder="Ex.: Acme Ltda"
          />
          <p className="-mt-3 text-sm text-tinta-suave">
            Cada gestor já entra com <strong className="text-tinta">esta empresa montada</strong> — eles não criam empresa nenhuma.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); adicionarGestorNaLista() }}
            className="flex flex-col gap-3 rounded-[var(--radius-cartao)] border-2 border-dashed border-borda bg-creme/40 p-4"
          >
            <Campo rotulo="" valor={gNome} onChange={setGNome} placeholder="Nome do gestor" />
            <Campo rotulo="" tipo="email" valor={gEmail} onChange={setGEmail} placeholder="gestor@empresa.com" erro={gEmailInvalido ? 'E-mail inválido (ex.: nome@empresa.com)' : undefined} />
            <Campo rotulo="" tipo="password" valor={gSenha} onChange={setGSenha} placeholder="Senha inicial (forte)" autoComplete="new-password" />
            <button
              type="submit"
              disabled={!gNome.trim() || !EMAIL_RE.test(gEmail.trim()) || !senhaForte(gSenha)}
              className="rounded-[var(--radius-suave)] border-2 border-borda px-4 py-2.5 text-sm font-bold text-tinta transition hover:border-juncao disabled:opacity-40"
            >
              + Adicionar gestor
            </button>
          </form>

          {gestores.length > 0 && (
            <div className="flex flex-col gap-2">
              {gestores.map((g, i) => (
                <div key={i} className="flex items-center gap-3 rounded-[var(--radius-suave)] border border-borda bg-creme px-3 py-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-juncao/10 text-sm font-bold text-juncao">
                    {g.nome.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-tinta">{g.nome}</span>
                    <span className="block truncate text-xs text-tinta-suave">{g.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGestores((lista) => lista.filter((_, idx) => idx !== i))}
                    aria-label={`Remover ${g.nome}`}
                    className="text-tinta-suave/50 hover:text-alerta"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {erroBox}
          <BotaoDuo variante="sucesso" tamanho="grande" larguraTotal carregando={carregando} onClick={concluirRH}>
            {gestores.length > 0 ? '🎉 Concluir e ver meu painel' : 'Ver meu painel →'}
          </BotaoDuo>
        </div>
      )}
    </LayoutAuth>
  )
}
