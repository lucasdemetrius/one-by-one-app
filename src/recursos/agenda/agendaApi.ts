// Arquivo: src/recursos/agenda/agendaApi.ts
// Descrição: API e hooks dos agendamentos de 1:1 (com recorrência). Espelha o
//            módulo agendamento do backend Go.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, extrairDados } from '@/lib/api'

export type Recorrencia =
  | 'NENHUMA'
  | 'SEMANAL'
  | 'QUINZENAL'
  | 'MENSAL'
  | 'BIMESTRAL'
  | 'TRIMESTRAL'
  | 'SEMESTRAL'

// Quantos MESES cada recorrência "mensal" avança (as semanais/quinzenais são contadas em
// dias). Usado pela projeção do calendário e pelo cálculo de "repetir N vezes".
export const MESES_RECORRENCIA: Partial<Record<Recorrencia, number>> = {
  MENSAL: 1,
  BIMESTRAL: 2,
  TRIMESTRAL: 3,
  SEMESTRAL: 6,
}

export interface Agendamento {
  id: string
  colaborador_id: string
  liderado_nome: string
  data_hora: string // "YYYY-MM-DDTHH:MM"
  recorrencia: Recorrencia
  repete_ate?: string // "YYYY-MM-DD" — fim da recorrência ('' / ausente = para sempre)
}

export interface CriarAgendamento {
  colaborador_id: string
  data_hora: string
  recorrencia: Recorrencia
  repete_ate?: string // "YYYY-MM-DD" (opcional)
}

export async function listarAgendamentos(): Promise<Agendamento[]> {
  const resp = await api.get('/agendamentos')
  return extrairDados<Agendamento[]>(resp.data) ?? []
}

export async function criarAgendamento(dados: CriarAgendamento): Promise<Agendamento> {
  const resp = await api.post('/agendamentos', dados)
  return extrairDados<Agendamento>(resp.data)
}

export async function deletarAgendamento(id: string): Promise<void> {
  await api.delete(`/agendamentos/${id}`)
}

// Cancela TODOS os 1:1 de um liderado de uma vez (ex.: quando ele sai da empresa).
// DELETE /agendamentos?colaborador_id=...
export async function cancelarTodosDoColaborador(colaboradorId: string): Promise<void> {
  await api.delete('/agendamentos', { params: { colaborador_id: colaboradorId } })
}

// Muda a data/hora de um 1:1 (arrastar no calendário). PUT /agendamentos/:id
export async function reagendarAgendamento(id: string, data_hora: string): Promise<void> {
  await api.put(`/agendamentos/${id}`, { data_hora })
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useAgendamentos() {
  return useQuery({ queryKey: ['agendamentos'], queryFn: listarAgendamentos })
}

export function useCriarAgendamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: criarAgendamento,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agendamentos'] }),
  })
}

export function useDeletarAgendamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletarAgendamento,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agendamentos'] }),
  })
}

export function useCancelarTodosDoColaborador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cancelarTodosDoColaborador,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agendamentos'] }),
  })
}

export function useReagendarAgendamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; data_hora: string }) => reagendarAgendamento(v.id, v.data_hora),
    // Otimista: move o 1:1 para o novo dia NA HORA (sem "voltar pra origem e
    // depois ir"). Reverte se a API falhar.
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: ['agendamentos'] })
      const anterior = qc.getQueryData<Agendamento[]>(['agendamentos'])
      qc.setQueryData<Agendamento[]>(['agendamentos'], (old) =>
        (old ?? []).map((a) => (a.id === v.id ? { ...a, data_hora: v.data_hora } : a)),
      )
      return { anterior }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.anterior) qc.setQueryData(['agendamentos'], ctx.anterior)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['agendamentos'] }),
  })
}
