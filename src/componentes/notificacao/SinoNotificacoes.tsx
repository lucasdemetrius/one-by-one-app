// Arquivo: src/componentes/notificacao/SinoNotificacoes.tsx
// Descrição: Sino de notificações in-app no topo. Mostra o nº de não-lidas (badge),
//            abre um painel com a lista (clicar marca como lida e navega pelo link)
//            e tem uma engrenagem ⚙️ com as PREFERÊNCIAS — o usuário desliga o que
//            não quer receber ("não ser uma aplicação chata"). O painel é portado
//            para o body para não ser cortado pelo header fixo.

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import {
  useContagemNaoLidas,
  useNotificacoes,
  useMarcarLida,
  useLerTodas,
  usePrefsNotif,
  useSalvarPrefs,
  type Notificacao,
  type PrefNotif,
} from '@/recursos/notificacao/notificacaoApi'

// Tempo relativo curtinho ("agora", "há 5 min", "há 2 h", "ontem", data).
function tempoRelativo(iso: string): string {
  const d = new Date(iso)
  const min = Math.floor((Date.now() - d.getTime()) / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  const dias = Math.floor(h / 24)
  if (dias === 1) return 'ontem'
  if (dias < 7) return `há ${dias} dias`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function SinoNotificacoes() {
  const [aberto, setAberto] = useState(false)
  const [mostrarPrefs, setMostrarPrefs] = useState(false)
  const navigate = useNavigate()

  const contagemQ = useContagemNaoLidas()
  const listaQ = useNotificacoes(aberto)
  const marcarLida = useMarcarLida()
  const lerTodas = useLerTodas()

  const naoLidas = contagemQ.data ?? 0
  const itens = listaQ.data ?? []

  function aoClicarNotif(n: Notificacao) {
    if (!n.lida) marcarLida.mutate(n.id)
    if (n.link) {
      setAberto(false)
      navigate(n.link)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label="Notificações"
        title="Notificações"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors hover:bg-areia-escura"
      >
        <span className={naoLidas > 0 ? 'animate-[balancar_1.2s_ease-in-out]' : ''}>🔔</span>
        {naoLidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-alerta px-1 text-[10px] font-bold text-white">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {aberto && (
            <>
              {/* Clique fora fecha */}
              <div className="fixed inset-0 z-[58]" onClick={() => setAberto(false)} />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="fixed right-3 top-16 z-[60] flex max-h-[70vh] w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[var(--radius-cartao)] border-2 border-borda bg-creme shadow-[var(--shadow-flutuante)]"
              >
                <header className="flex items-center justify-between border-b border-borda px-4 py-3">
                  <span className="fonte-display text-base font-extrabold text-tinta">
                    {mostrarPrefs ? 'Preferências' : 'Notificações'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMostrarPrefs((v) => !v)}
                    title={mostrarPrefs ? 'Voltar' : 'Preferências de notificação'}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-tinta-suave transition-colors hover:bg-areia-escura"
                  >
                    {mostrarPrefs ? '←' : '⚙️'}
                  </button>
                </header>

                {mostrarPrefs ? (
                  <PainelPreferencias />
                ) : (
                  <>
                    <div className="scroll-fino flex-1 overflow-y-auto">
                      {listaQ.isLoading ? (
                        <p className="px-4 py-8 text-center text-sm text-tinta-suave">Carregando…</p>
                      ) : itens.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                          <span className="text-3xl">🌙</span>
                          <p className="mt-2 text-sm text-tinta-suave">Tudo em dia. Sem novidades por aqui.</p>
                        </div>
                      ) : (
                        <ul>
                          {itens.map((n) => (
                            <li key={n.id}>
                              <button
                                type="button"
                                onClick={() => aoClicarNotif(n)}
                                className={[
                                  'flex w-full gap-2 border-b border-borda/60 px-4 py-3 text-left transition-colors hover:bg-areia/60',
                                  n.lida ? 'opacity-70' : 'bg-juncao/5',
                                ].join(' ')}
                              >
                                {!n.lida && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-juncao" />}
                                <div className={n.lida ? 'flex-1' : 'flex-1 pl-0'}>
                                  <p className="text-sm font-bold text-tinta">{n.titulo}</p>
                                  <p className="text-sm text-tinta-suave">{n.mensagem}</p>
                                  <p className="mt-0.5 text-xs text-tinta-suave/70">{tempoRelativo(n.criado_em)}</p>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {itens.some((n) => !n.lida) && (
                      <button
                        type="button"
                        onClick={() => lerTodas.mutate()}
                        className="border-t border-borda px-4 py-2.5 text-sm font-bold text-juncao transition-colors hover:bg-areia/60"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}

// Painel de preferências (3 tipos de aviso da agenda).
function PainelPreferencias() {
  const prefsQ = usePrefsNotif(true)
  const salvar = useSalvarPrefs()

  const prefs: PrefNotif = prefsQ.data ?? { agenda_1dia: true, agenda_hoje: true, agenda_1h: true }

  function alternar(campo: keyof PrefNotif) {
    salvar.mutate({ ...prefs, [campo]: !prefs[campo] })
  }

  const linhas: { campo: keyof PrefNotif; rotulo: string; descricao: string }[] = [
    { campo: 'agenda_1dia', rotulo: '🗓️ 1 dia antes', descricao: 'Aviso no dia anterior ao 1:1' },
    { campo: 'agenda_hoje', rotulo: '☀️ No dia, de manhã', descricao: 'Lembrete na manhã do 1:1' },
    { campo: 'agenda_1h', rotulo: '⏰ 1 hora antes', descricao: 'Aviso pouco antes de começar' },
  ]

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      <p className="mb-2 text-xs text-tinta-suave">Escolha o que quer receber. Desligue o que não ajudar.</p>
      {prefsQ.isLoading ? (
        <p className="py-6 text-center text-sm text-tinta-suave">Carregando…</p>
      ) : (
        <ul className="flex flex-col">
          {linhas.map((l) => (
            <li key={l.campo} className="border-b border-borda/60 last:border-0">
              <button type="button" onClick={() => alternar(l.campo)} className="flex w-full items-center justify-between gap-3 py-3 text-left">
                <div>
                  <p className="text-sm font-bold text-tinta">{l.rotulo}</p>
                  <p className="text-xs text-tinta-suave">{l.descricao}</p>
                </div>
                <span
                  className={[
                    'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                    prefs[l.campo] ? 'bg-juncao' : 'bg-borda',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                      prefs[l.campo] ? 'left-[22px]' : 'left-0.5',
                    ].join(' ')}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
