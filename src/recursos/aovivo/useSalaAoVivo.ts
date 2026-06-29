// Arquivo: src/recursos/aovivo/useSalaAoVivo.ts
// Descrição: Hook do "1:1 ao vivo". Conecta ao WebSocket da sala, expõe os
//            participantes presentes e os cursores dos outros, e oferece funções
//            para enviar o movimento do mouse e as mudanças do tabuleiro.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { CHAVE_TOKEN } from '@/lib/api'
import type { Tabuleiro } from '@/recursos/pauta/tipos'

export interface ParticipanteVivo {
  id: string
  nome: string
  papel: string
  cor: string
}

// Cursor de outro participante (x e y são frações 0..1 do viewport).
export interface CursorVivo {
  id: string
  x: number
  y: number
}

interface Opcoes {
  nome: string
  papel: string
  // Chamado quando chega um tabuleiro de outro participante (aplicar sem reenviar).
  aoReceberTabuleiro: (tabuleiro: Tabuleiro) => void
  // Chamado quando outro participante mexeu no conteúdo de um tema (recarregar
  // os blocos daquele tema, se estiver aberto). Recebe o título do tema.
  aoTemaAtualizado?: (tema: string) => void
  // Chamado quando outro participante entra/sai do modo apresentação de um tema.
  aoApresentacao?: (tema: string, ativo: boolean) => void
  // Chamado quando o 1:1 é ENCERRADO (pelo gestor) — recebe o resumo registrado.
  // Dispara nos DOIS lados (e em quem entrar depois): a tela vira modo consulta.
  aoEncerrar?: (resumo: string) => void
}

export function useSalaAoVivo(
  salaId: string,
  { nome, papel, aoReceberTabuleiro, aoTemaAtualizado, aoApresentacao, aoEncerrar }: Opcoes,
) {
  const wsRef = useRef<WebSocket | null>(null)
  const meuIdRef = useRef('')
  const aoReceberRef = useRef(aoReceberTabuleiro)
  aoReceberRef.current = aoReceberTabuleiro
  // Mantém a referência sempre atualizada para capturar o tema aberto mais recente.
  const aoTemaRef = useRef(aoTemaAtualizado)
  aoTemaRef.current = aoTemaAtualizado
  const aoApresentacaoRef = useRef(aoApresentacao)
  aoApresentacaoRef.current = aoApresentacao
  const aoEncerrarRef = useRef(aoEncerrar)
  aoEncerrarRef.current = aoEncerrar

  const [participantes, setParticipantes] = useState<ParticipanteVivo[]>([])
  const [cursores, setCursores] = useState<Record<string, CursorVivo>>({})
  const [conectado, setConectado] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem(CHAVE_TOKEN)
    if (!salaId || !token) return

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const url =
      `${proto}://${window.location.host}/api/v1/ws/1a1/${salaId}` +
      `?token=${encodeURIComponent(token)}&nome=${encodeURIComponent(nome)}&papel=${encodeURIComponent(papel)}`

    // Reconexão automática: se o socket cai (ex.: um deploy reinicia a API ou o nginx),
    // tentamos reabrir sozinhos com backoff (1s → 2s → … → 8s), zerando ao reconectar.
    // Sem isto, a aba ficava presa em "Conectando…" para sempre após qualquer reinício.
    let fechando = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let espera = 1000

    function conectar() {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConectado(true)
        espera = 1000 // reconectou: zera o backoff
      }
      ws.onclose = () => {
        setConectado(false)
        if (!fechando) {
          timer = setTimeout(conectar, espera)
          espera = Math.min(espera * 2, 8000)
        }
      }

      ws.onmessage = (ev) => {
        let m: { tipo: string; [k: string]: unknown }
        try {
          m = JSON.parse(ev.data)
        } catch {
          return
        }
        switch (m.tipo) {
          case 'voce':
            meuIdRef.current = String(m.id)
            break
          case 'presenca': {
            const lista = (m.participantes as ParticipanteVivo[]) ?? []
            setParticipantes(lista)
            // Limpa cursores de quem saiu.
            const ids = new Set(lista.map((p) => p.id))
            setCursores((prev) => {
              const novo: Record<string, CursorVivo> = {}
              for (const k of Object.keys(prev)) if (ids.has(k)) novo[k] = prev[k]
              return novo
            })
            break
          }
          case 'cursor': {
            const de = String(m.de)
            if (de === meuIdRef.current) break
            setCursores((prev) => ({ ...prev, [de]: { id: de, x: Number(m.x), y: Number(m.y) } }))
            break
          }
          case 'tabuleiro':
            aoReceberRef.current?.(m.tabuleiro as Tabuleiro)
            break
          case 'tema-atualizado':
            aoTemaRef.current?.(String(m.tema))
            break
          case 'apresentacao':
            aoApresentacaoRef.current?.(String(m.tema), Boolean(m.ativo))
            break
          case 'encerrado':
            aoEncerrarRef.current?.(String(m.resumo ?? ''))
            break
        }
      }
    }

    conectar()

    return () => {
      fechando = true
      if (timer) clearTimeout(timer)
      wsRef.current?.close()
    }
  }, [salaId, nome, papel])

  const enviarCursor = useCallback((x: number, y: number) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipo: 'cursor', x, y }))
    }
  }, [])

  const enviarTabuleiro = useCallback((tabuleiro: Tabuleiro) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipo: 'tabuleiro', tabuleiro }))
    }
  }, [])

  // Avisa os outros participantes que o conteúdo de um tema mudou (após
  // adicionar/remover um bloco), para que recarreguem aquele tema.
  const enviarTemaAtualizado = useCallback((tema: string) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipo: 'tema-atualizado', tema }))
    }
  }, [])

  // Avisa que entrou/saiu do modo apresentação de um tema (sincroniza ao vivo).
  const enviarApresentacao = useCallback((tema: string, ativo: boolean) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipo: 'apresentacao', tema, ativo }))
    }
  }, [])

  // Encerra o 1:1 para todos na sala (envia o resumo junto). O servidor guarda
  // o sinal e retransmite — os dois lados caem no modo consulta.
  const enviarEncerrado = useCallback((resumo: string) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipo: 'encerrado', resumo }))
    }
  }, [])

  // Mapa id → participante (para nome/cor dos cursores).
  const participantesPorId = useMemo(
    () => Object.fromEntries(participantes.map((p) => [p.id, p])),
    [participantes],
  )

  return {
    conectado,
    participantes,
    cursores,
    meuId: meuIdRef.current,
    participantesPorId,
    enviarCursor,
    enviarTabuleiro,
    enviarTemaAtualizado,
    enviarApresentacao,
    enviarEncerrado,
  }
}
