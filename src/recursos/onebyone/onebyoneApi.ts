// Arquivo: src/recursos/onebyone/onebyoneApi.ts
// Descrição: Client do 1:1 (livro-razão) e da "Saúde do 1:1". encerrarOneByOne
//            registra que o encontro aconteceu (status REALIZADO); useSaudeOneByOne
//            traz cadência/atrasados/streak para o card do painel.

import { useQuery } from '@tanstack/react-query'

import { api, extrairDados } from '@/lib/api'

export interface SaudeOneByOne {
  percentual_em_dia: number
  total_agendados: number
  atrasados: number
  realizados_ult_30: number
  streak_semanas: number
}

/** Registra o 1:1 do colaborador como REALIZADO (idempotente por dia no backend). */
export async function encerrarOneByOne(colaboradorId: string): Promise<void> {
  await api.post('/onebyone/encerrar', { colabor_id: colaboradorId })
}

async function obterSaude(): Promise<SaudeOneByOne> {
  const resp = await api.get('/saude-1a1')
  return extrairDados<SaudeOneByOne>(resp.data)
}

/** Saúde do 1:1 do gestor (cadência, atrasados, realizados, streak). */
export function useSaudeOneByOne() {
  return useQuery({ queryKey: ['saude-1a1'], queryFn: obterSaude })
}
