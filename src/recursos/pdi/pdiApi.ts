// Arquivo: src/recursos/pdi/pdiApi.ts
// Descrição: API e hooks do PDI (Plano de Desenvolvimento Individual) por liderado.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, extrairDados } from '@/lib/api'

export interface ItemPDI {
  id: string
  colaborador_id: string
  titulo: string
  descricao: string | null
  prazo: string | null // "YYYY-MM-DD"
  concluido: boolean
  concluido_em: string | null // "YYYY-MM-DD" — quando foi concluído (evolução)
  criado_em: string
}

export async function listarPdi(colaboradorId: string): Promise<ItemPDI[]> {
  const resp = await api.get(`/colaboradores/${colaboradorId}/pdi`)
  return extrairDados<ItemPDI[]>(resp.data) ?? []
}

export async function criarPdi(colaboradorId: string, dados: { titulo: string; prazo?: string }): Promise<ItemPDI> {
  const resp = await api.post(`/colaboradores/${colaboradorId}/pdi`, dados)
  return extrairDados<ItemPDI>(resp.data)
}

export async function atualizarPdi(itemId: string, dados: { concluido?: boolean; titulo?: string; prazo?: string }): Promise<void> {
  await api.put(`/pdi/${itemId}`, dados)
}

export async function deletarPdi(itemId: string): Promise<void> {
  await api.delete(`/pdi/${itemId}`)
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function usePdi(colaboradorId: string) {
  return useQuery({ queryKey: ['pdi', colaboradorId], queryFn: () => listarPdi(colaboradorId) })
}

export function useCriarPdi(colaboradorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dados: { titulo: string; prazo?: string }) => criarPdi(colaboradorId, dados),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pdi', colaboradorId] }),
  })
}

export function useAtualizarPdi(colaboradorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; dados: { concluido?: boolean; titulo?: string; prazo?: string } }) =>
      atualizarPdi(v.id, v.dados),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pdi', colaboradorId] }),
  })
}

export function useDeletarPdi(colaboradorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletarPdi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pdi', colaboradorId] }),
  })
}
