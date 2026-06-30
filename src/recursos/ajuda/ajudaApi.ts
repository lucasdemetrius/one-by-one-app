// Arquivo: src/recursos/ajuda/ajudaApi.ts
// Descrição: Conversa com o assistente de IA da Central de Ajuda da API Go (/api/v1/ajuda).
//            O backend resolve a chave em cascata (plataforma → BYOK do gestor → mensagem
//            amigável), então este chat funciona para qualquer papel. Os tipos espelham os
//            DTOs do backend (internal/ajuda/dto.go).

import { useMutation, useQuery } from '@tanstack/react-query'
import { api, extrairDados } from '@/lib/api'

// Resposta do assistente (espelha RespostaIADTO).
export interface RespostaIA {
  resposta: string
  // 'plataforma' (chave da plataforma) | 'byok' (chave do gestor) | 'indisponivel'
  fonte: 'plataforma' | 'byok' | 'indisponivel'
  ia_disponivel: boolean
}

// useStatusIAAjuda diz se há IA utilizável para o usuário (o front mostra/oculta o chat).
// GET /api/v1/ajuda/ia/status
export function useStatusIAAjuda() {
  return useQuery({
    queryKey: ['ajuda', 'ia', 'status'],
    queryFn: async () => extrairDados<{ ia_disponivel: boolean }>((await api.get('/ajuda/ia/status')).data),
  })
}

// usePerguntarAjuda envia uma pergunta livre ao assistente. POST /api/v1/ajuda/perguntar
export function usePerguntarAjuda() {
  return useMutation({
    mutationFn: async (pergunta: string) =>
      extrairDados<RespostaIA>((await api.post('/ajuda/perguntar', { pergunta })).data),
  })
}
