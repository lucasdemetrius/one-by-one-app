// Arquivo: src/recursos/classificacao/classificacaoApi.ts
// Descrição: API da classificação 9-box (desempenho × potencial por liderado).

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, extrairDados } from '@/lib/api'

export type Nivel = 'BAIXO' | 'MEDIO' | 'ALTO'

export interface Classificacao {
  colaborador_id: string
  desempenho: Nivel
  potencial: Nivel
}

// listarClassificacoes: GET /organizacoes/:id/classificacoes
export async function listarClassificacoes(orgId: string): Promise<Classificacao[]> {
  const resp = await api.get(`/organizacoes/${orgId}/classificacoes`)
  return extrairDados<Classificacao[]>(resp.data) ?? []
}

// definirClassificacao: PUT /colaboradores/:id/classificacao
export async function definirClassificacao(
  colaboradorId: string,
  desempenho: Nivel,
  potencial: Nivel,
): Promise<Classificacao> {
  const resp = await api.put(`/colaboradores/${colaboradorId}/classificacao`, {
    desempenho,
    potencial,
  })
  return extrairDados<Classificacao>(resp.data)
}

// removerClassificacao: DELETE /colaboradores/:id/classificacao
// Tira o liderado da matriz 9-box (volta para "A classificar").
export async function removerClassificacao(colaboradorId: string): Promise<void> {
  await api.delete(`/colaboradores/${colaboradorId}/classificacao`)
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useClassificacoes(orgId: string | undefined) {
  return useQuery({
    queryKey: ['classificacoes', orgId ?? ''],
    queryFn: () => listarClassificacoes(orgId as string),
    enabled: Boolean(orgId),
  })
}

export function useDefinirClassificacao(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { colaboradorId: string; desempenho: Nivel; potencial: Nivel }) =>
      definirClassificacao(v.colaboradorId, v.desempenho, v.potencial),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classificacoes', orgId] }),
  })
}

export function useRemoverClassificacao(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (colaboradorId: string) => removerClassificacao(colaboradorId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classificacoes', orgId] }),
  })
}
