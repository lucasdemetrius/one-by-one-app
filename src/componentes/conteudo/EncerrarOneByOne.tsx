// Arquivo: src/componentes/conteudo/EncerrarOneByOne.tsx
// Descrição: Ritual de ENCERRAR um 1:1. O gestor registra um resumo e os próximos
//            passos (itens de ação). Fica salvo num tema-histórico do liderado —
//            visível no conteúdo, na apresentação e na linha do tempo. Comemora ao
//            fim (o 1:1 que terminou bem merece um confete 🎉).

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Modal } from '@/componentes/ui/Modal'
import { BotaoDuo } from '@/componentes/ui/BotaoDuo'
import { criarBloco } from '@/recursos/conteudo/conteudoApi'
import { encerrarOneByOne } from '@/recursos/onebyone/onebyoneApi'
import { extrairMensagemErro } from '@/lib/api'
import { fogos } from '@/lib/fogos'

// Tema reservado onde os encerramentos viram histórico do 1:1.
export const TEMA_HISTORICO = '📋 Histórico de 1:1'

interface Props {
  colaboradorId: string
  aoFechar: () => void
  // Avisa quem abriu (para sincronizar/registrar que o histórico mudou) — recebe
  // o texto registrado para encerrar o 1:1 ao vivo nos dois lados.
  aoEncerrado?: (texto: string) => void
}

export function EncerrarOneByOne({ colaboradorId, aoFechar, aoEncerrado }: Props) {
  const queryClient = useQueryClient()
  const [resumo, setResumo] = useState('')
  const [passo, setPasso] = useState('')
  const [passos, setPassos] = useState<string[]>([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function addPasso() {
    const p = passo.trim()
    if (!p) return
    setPassos((l) => [...l, p])
    setPasso('')
  }

  async function encerrar() {
    setErro('')
    if (!resumo.trim() && passos.length === 0) {
      setErro('Escreva um resumo ou ao menos um próximo passo.')
      return
    }
    setSalvando(true)
    const data = new Date().toLocaleDateString('pt-BR')
    const texto =
      `📅 1:1 de ${data}\n\n` +
      (resumo.trim() ? `${resumo.trim()}\n\n` : '') +
      (passos.length ? `Próximos passos:\n${passos.map((p) => `• ${p}`).join('\n')}` : '')
    try {
      // Em paralelo: salva o histórico (resumo + passos) e marca o 1:1 como REALIZADO
      // (livro-razão que alimenta a "Saúde do 1:1" e o streak).
      await Promise.all([
        criarBloco(colaboradorId, { tema: TEMA_HISTORICO, tipo: 'TEXTO', texto }),
        encerrarOneByOne(colaboradorId),
      ])
      // Atualiza o card de saúde e a agenda no painel sem recarregar.
      queryClient.invalidateQueries({ queryKey: ['saude-1a1'] })
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
      aoEncerrado?.(texto)
      fogos(2200)
      aoFechar()
    } catch (e) {
      setErro(extrairMensagemErro(e))
      setSalvando(false)
    }
  }

  const campo =
    'w-full rounded-[var(--radius-suave)] border-2 border-borda bg-creme px-3.5 py-2.5 text-sm text-tinta outline-none focus:border-juncao'

  return (
    <Modal aberto aoFechar={aoFechar} titulo="Encerrar 1:1 ✅">
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-tinta-suave">
          Resumo da conversa
          <textarea
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            rows={3}
            placeholder="O que ficou desta conversa?"
            className={`${campo} font-normal`}
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-tinta-suave">
            Próximos passos
          </span>
          <form onSubmit={(e) => { e.preventDefault(); addPasso() }} className="flex gap-2">
            <input
              value={passo}
              onChange={(e) => setPasso(e.target.value)}
              placeholder="Ex.: enviar material do curso"
              className={`${campo} font-normal`}
            />
            <button type="submit" disabled={!passo.trim()} className="shrink-0 rounded-[var(--radius-suave)] border-2 border-borda px-4 text-xl font-bold text-tinta hover:border-juncao disabled:opacity-40">+</button>
          </form>
          {passos.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {passos.map((p, i) => (
                <li key={i} className="flex items-center gap-2 rounded-[var(--radius-suave)] bg-areia px-3 py-1.5 text-sm text-tinta">
                  <span className="text-juncao">➡️</span>
                  <span className="flex-1">{p}</span>
                  <button type="button" onClick={() => setPassos((l) => l.filter((_, idx) => idx !== i))} aria-label="Remover" className="text-tinta-suave/50 hover:text-alerta">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {erro && <span className="text-sm font-medium text-alerta">{erro}</span>}

        <BotaoDuo variante="sucesso" larguraTotal carregando={salvando} onClick={encerrar}>
          🎉 Encerrar e registrar
        </BotaoDuo>
      </div>
    </Modal>
  )
}
