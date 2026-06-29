// Arquivo: src/recursos/ia/conversas.ts
// Descrição: Persistência das conversas do assistente de IA no navegador
//            (localStorage) — como o claude.ai: várias conversas, com título,
//            histórico de mensagens e troca entre elas. Fica no aparelho do
//            gestor; sincronizar no servidor é um próximo passo opcional.

import { useCallback, useState } from 'react'

export interface MsgIA {
  papel: 'voce' | 'ia'
  texto: string
}

export interface ConversaIA {
  id: string
  titulo: string
  criadoEm: number
  mensagens: MsgIA[]
}

const CHAVE = 'onebyone.ia.conversas'

function ler(): ConversaIA[] {
  try {
    const raw = localStorage.getItem(CHAVE)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function gravar(cs: ConversaIA[]) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(cs))
  } catch {
    /* localStorage cheio/indisponível — ignora silenciosamente */
  }
}

function novoId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `c_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function tituloDe(texto: string): string {
  const t = texto.trim().replace(/\s+/g, ' ')
  if (!t) return 'Nova conversa'
  return t.length > 38 ? t.slice(0, 38) + '…' : t
}

// Hook que expõe as conversas e as operações de CRUD, sempre persistindo.
export function useConversasIA() {
  const [conversas, setConversas] = useState<ConversaIA[]>(() => ler())

  const persistir = useCallback((atualizar: (cs: ConversaIA[]) => ConversaIA[]) => {
    setConversas((cs) => {
      const novo = atualizar(cs)
      gravar(novo)
      return novo
    })
  }, [])

  // Cria uma conversa vazia no topo e devolve o id dela.
  const criar = useCallback((): string => {
    const id = novoId()
    persistir((cs) => [{ id, titulo: 'Nova conversa', criadoEm: Date.now(), mensagens: [] }, ...cs])
    return id
  }, [persistir])

  // Acrescenta uma mensagem; o título vem da primeira fala do gestor.
  const adicionarMensagem = useCallback(
    (id: string, msg: MsgIA) => {
      persistir((cs) =>
        cs.map((c) => {
          if (c.id !== id) return c
          const titulo = c.titulo === 'Nova conversa' && msg.papel === 'voce' ? tituloDe(msg.texto) : c.titulo
          return { ...c, titulo, mensagens: [...c.mensagens, msg] }
        }),
      )
    },
    [persistir],
  )

  const remover = useCallback(
    (id: string) => {
      persistir((cs) => cs.filter((c) => c.id !== id))
    },
    [persistir],
  )

  return { conversas, criar, adicionarMensagem, remover }
}
