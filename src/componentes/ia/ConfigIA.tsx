// Arquivo: src/componentes/ia/ConfigIA.tsx
// Descrição: Seção do Perfil onde o gestor conecta a PRÓPRIA IA (BYOK). Em vez de
//            um <select>, mostra os 4 provedores em CARTÕES com a logo da marca:
//            escolhe um, cola a chave e conecta. A chave é cifrada no servidor e
//            nunca volta — por isso mostramos só "conectada". Habilita os recursos
//            de IA do app (chat flutuante, overview, sugestões, PDI).

import { useEffect, useState } from 'react'

import { Ajuda } from '@/componentes/ui/Ajuda'
import { BotaoDuo } from '@/componentes/ui/BotaoDuo'
import { extrairMensagemErro } from '@/lib/api'
import { useAuth } from '@/recursos/auth/AuthContext'
import { PROVEDORES, useConfigIA, useSalvarConfigIA } from '@/recursos/ia/iaApi'
import type { ProvedorIA } from '@/recursos/ia/iaApi'
import { LogoIA, META_IA } from './LogosIA'

export function ConfigIA() {
  const { usuario } = useAuth()
  const ehRH = usuario?.role === 'RH'
  const configQ = useConfigIA()
  const salvar = useSalvarConfigIA()
  // Gestor sem IA própria, mas com IA fornecida pelo RH.
  const herdadaDoRH = !!configQ.data?.herdada_do_rh && !configQ.data?.tem_chave

  const [provedor, setProvedor] = useState<ProvedorIA>('CLAUDE')
  const [chave, setChave] = useState('')
  const [erro, setErro] = useState('')
  const [salvo, setSalvo] = useState(false)

  // Provedor atualmente conectado no servidor (se houver).
  const provedorConectado = configQ.data?.tem_chave ? (configQ.data.provedor as ProvedorIA) : null

  // Pré-seleciona o provedor já configurado.
  useEffect(() => {
    if (configQ.data?.provedor) setProvedor(configQ.data.provedor as ProvedorIA)
  }, [configQ.data?.provedor])

  // "Já tem chave" considerando o provedor selecionado: só conta se for o conectado.
  const selecionadoConectado = provedorConectado === provedor

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSalvo(false)
    if (!selecionadoConectado && !chave.trim()) {
      setErro('Cole a chave de API do provedor escolhido.')
      return
    }
    try {
      await salvar.mutateAsync({ provedor, chave: chave.trim() })
      setChave('')
      setSalvo(true)
    } catch (err) {
      setErro(extrairMensagemErro(err))
    }
  }

  const ajuda = META_IA[provedor].ajuda

  return (
    <section className="mt-8 rounded-[var(--radius-cartao)] border border-borda bg-creme p-6 shadow-[var(--shadow-cartao)]">
      <div className="mb-1 flex items-center gap-2">
        <h2 className="fonte-display text-xl font-bold text-tinta">✨ Sua IA</h2>
        <Ajuda titulo="Como funciona a IA (sua chave)">
          O OneByOne não cobra IA: você conecta a <strong className="text-tinta">sua própria
          conta</strong> (Claude, ChatGPT, DeepSeek ou Grok) colando a chave de API. Ela é{' '}
          <strong className="text-tinta">cifrada</strong> no servidor e nunca aparece de volta.
          Com ela ligada, a IA ajuda você com chat, overview dos liderados, sugestões de pauta e
          rascunhos de PDI/feedback.
        </Ajuda>
        {provedorConectado && (
          <span className="ml-auto rounded-full bg-sucesso/15 px-3 py-1 text-xs font-bold text-sucesso">
            ✓ {META_IA[provedorConectado].nome} conectado
          </span>
        )}
      </div>
      <p className="mb-5 text-sm text-tinta-suave">Escolha seu provedor e conecte sua conta.</p>

      {ehRH && (
        <div className="mb-5 rounded-[var(--radius-suave)] border border-juncao/30 bg-juncao/5 px-4 py-3 text-sm text-tinta">
          💡 A IA que você conectar aqui fica disponível para <strong>todos os seus gestores</strong> usarem nos 1:1.
        </div>
      )}
      {herdadaDoRH && (
        <div className="mb-5 rounded-[var(--radius-suave)] border border-sucesso/30 bg-sucesso/10 px-4 py-3 text-sm text-tinta">
          🤖 Você já está usando a <strong>IA configurada pelo seu RH</strong>. Conecte a sua abaixo só se quiser usar a sua própria conta.
        </div>
      )}

      {/* Cartões dos provedores */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PROVEDORES.map((p) => {
          const sel = provedor === p.id
          const conectado = provedorConectado === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setProvedor(p.id)
                setErro('')
                setSalvo(false)
              }}
              className={[
                'group relative flex flex-col items-center gap-2 rounded-[var(--radius-cartao)] border-2 bg-areia p-4 text-center transition-all',
                sel
                  ? 'border-transparent -translate-y-0.5 shadow-[var(--shadow-flutuante)]'
                  : 'border-borda hover:-translate-y-0.5 hover:shadow-[var(--shadow-cartao)]',
              ].join(' ')}
              style={sel ? { boxShadow: `0 0 0 3px ${META_IA[p.id].cor}` } : undefined}
            >
              {conectado && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-sucesso text-[0.7rem] font-bold text-white">
                  ✓
                </span>
              )}
              <LogoIA id={p.id} tamanho={46} />
              <span className="text-sm font-bold leading-tight text-tinta">{META_IA[p.id].nome}</span>
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-tinta-suave">
                {META_IA[p.id].empresa}
              </span>
            </button>
          )
        })}
      </div>

      {/* Chave do provedor selecionado */}
      <form onSubmit={enviar} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-tinta-suave">
          Chave de API do {META_IA[provedor].nome}
          {selecionadoConectado && (
            <span className="font-normal lowercase text-tinta-suave/70">(deixe em branco para manter a atual)</span>
          )}
          <input
            type="password"
            value={chave}
            onChange={(e) => setChave(e.target.value)}
            placeholder={selecionadoConectado ? '•••••••••• (já configurada)' : 'cole sua chave de API aqui'}
            autoComplete="off"
            className="w-full rounded-[var(--radius-suave)] border-2 border-borda bg-areia px-3.5 py-2.5 text-sm font-normal text-tinta outline-none focus:border-juncao"
          />
          <span className="text-xs font-normal normal-case text-tinta-suave">
            Pegue sua chave em <strong className="text-tinta">{ajuda}</strong>
          </span>
        </label>

        {erro && <span className="text-sm font-medium text-alerta">{erro}</span>}
        {salvo && <span className="text-sm font-medium text-sucesso">✓ IA conectada com sucesso!</span>}

        <BotaoDuo
          type="submit"
          variante="marca"
          carregando={salvar.isPending}
          desabilitado={!selecionadoConectado && !chave.trim()}
        >
          {selecionadoConectado ? `Atualizar ${META_IA[provedor].nome}` : `Conectar ${META_IA[provedor].nome}`}
        </BotaoDuo>
      </form>
    </section>
  )
}
