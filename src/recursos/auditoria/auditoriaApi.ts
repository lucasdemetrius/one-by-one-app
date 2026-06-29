// Arquivo: src/recursos/auditoria/auditoriaApi.ts
// Descrição: API da linha do tempo (auditoria) de um liderado.

import { api, extrairDados } from '@/lib/api'

export interface EventoAuditoria {
  id: string
  acao: string
  entidade: string
  criado_em: string
}

// GET /colaboradores/:id/timeline — eventos do liderado (só o líder dono).
export async function listarTimeline(colaboradorId: string): Promise<EventoAuditoria[]> {
  const resp = await api.get(`/colaboradores/${colaboradorId}/timeline`)
  return extrairDados<EventoAuditoria[]>(resp.data) ?? []
}
