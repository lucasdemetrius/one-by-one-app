// Arquivo: src/recursos/feedback/feedbackApi.ts
// Descrição: Conversa com o módulo de feedback da API Go. A escrita (enviarFeedback) é
//            aberta a qualquer usuário logado; o painel (usePainelFeedback) é só do ADMIN
//            e alimenta o dashboard de gestão. Os tipos espelham os DTOs do backend
//            (internal/feedback/dto.go).

import { useQuery } from '@tanstack/react-query'
import { api, extrairDados } from '@/lib/api'

// As 3 reações suportadas (mesmos valores do backend).
export type Reacao = 'CURTI' | 'NAO_CURTI' | 'IRRITADO'

// Corpo enviado em POST /feedback. O usuario_id NUNCA vai daqui — é do JWT no backend.
export interface DadosFeedback {
  reacao: Reacao
  contexto?: string
  comentario?: string
  pagina?: string
}

// enviarFeedback registra uma reação do usuário autenticado. POST /api/v1/feedback
export async function enviarFeedback(dados: DadosFeedback): Promise<void> {
  await api.post('/feedback', dados)
}

// ── Painel do ADMIN (espelha PainelFeedbackDTO) ──────────────────────────────

export interface ContextoFeedback {
  contexto: string
  curti: number
  nao_curti: number
  irritado: number
  total: number
}

export interface ComentarioFeedback {
  reacao: Reacao
  contexto: string | null
  comentario: string
  autor_nome: string
  autor_papel: string
  criado_em: string
}

export interface PainelFeedback {
  periodo: number
  total: number
  curti: number
  nao_curti: number
  irritado: number
  indice_satisfacao: number
  dias: string[]
  serie_curti: number[]
  serie_nao_curti: number[]
  serie_irritado: number[]
  por_contexto: ContextoFeedback[]
  recentes: ComentarioFeedback[]
  gerado_em: string
}

// usePainelFeedback busca o painel de feedback (só ADMIN). GET /api/v1/admin/feedbacks
// `ativo` (enabled) permite adiar a busca até a aba de feedback estar visível.
export function usePainelFeedback(dias: number, ativo = true) {
  return useQuery({
    queryKey: ['admin', 'feedbacks', dias],
    enabled: ativo,
    queryFn: async () => {
      const resposta = await api.get('/admin/feedbacks', { params: { dias } })
      return extrairDados<PainelFeedback>(resposta.data)
    },
  })
}
