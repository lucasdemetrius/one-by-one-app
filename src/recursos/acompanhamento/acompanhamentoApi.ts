// Arquivo: src/recursos/acompanhamento/acompanhamentoApi.ts
// Descrição: API e hooks do acompanhamento do liderado — sentimento (humor),
//            entregas, feedbacks e estudos, num só lugar. Espelha o módulo
//            acompanhamento do backend Go.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, extrairDados } from '@/lib/api'

export type TipoAcomp = 'SENTIMENTO' | 'ENTREGA' | 'FEEDBACK' | 'ESTUDO'

export interface Acompanhamento {
  id: string
  colaborador_id: string
  tipo: TipoAcomp
  titulo: string
  detalhe: string | null
  valor: number | null // humor 1-5 no SENTIMENTO
  data_ref: string // "YYYY-MM-DD"
  criado_em: string
}

export interface CriarAcomp {
  tipo: TipoAcomp
  titulo?: string
  detalhe?: string
  valor?: number
  data_ref?: string
}

export async function listarAcompanhamento(colaboradorId: string, tipo?: TipoAcomp): Promise<Acompanhamento[]> {
  const resp = await api.get(`/colaboradores/${colaboradorId}/acompanhamento`, { params: tipo ? { tipo } : undefined })
  return extrairDados<Acompanhamento[]>(resp.data) ?? []
}

export async function criarAcompanhamento(colaboradorId: string, dados: CriarAcomp): Promise<Acompanhamento> {
  const resp = await api.post(`/colaboradores/${colaboradorId}/acompanhamento`, dados)
  return extrairDados<Acompanhamento>(resp.data)
}

export async function deletarAcompanhamento(id: string): Promise<void> {
  await api.delete(`/acompanhamento/${id}`)
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useAcompanhamento(colaboradorId: string, tipo?: TipoAcomp) {
  return useQuery({
    queryKey: ['acompanhamento', colaboradorId, tipo ?? 'todos'],
    queryFn: () => listarAcompanhamento(colaboradorId, tipo),
  })
}

export function useCriarAcompanhamento(colaboradorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dados: CriarAcomp) => criarAcompanhamento(colaboradorId, dados),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['acompanhamento', colaboradorId] }),
  })
}

export function useDeletarAcompanhamento(colaboradorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletarAcompanhamento,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['acompanhamento', colaboradorId] }),
  })
}
