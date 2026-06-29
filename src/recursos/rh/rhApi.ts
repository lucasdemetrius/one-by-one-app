// Arquivo: src/recursos/rh/rhApi.ts
// Descrição: Funções que conversam com os endpoints do módulo de RH da API Go
//            (/api/v1/rh/...). Só contas RH têm acesso a essas rotas. O vínculo
//            gestor→RH é derivado do JWT no backend — NUNCA enviamos rh_id daqui.

import { api, extrairDados } from '@/lib/api'
import type { Usuario } from '@/recursos/auth/tipos'
import type { Recorrencia } from '@/recursos/agenda/agendaApi'

// Corpo enviado ao cadastrar um gestor (o RH logado vira o "dono" do gestor).
export interface DadosNovoGestor {
  nome: string
  email: string
  password: string
  empresa?: string // nome da empresa (organização) que o RH monta para o gestor já usar
}

// criarGestor cadastra um gestor sob o RH autenticado.
// Rota: POST /api/v1/rh/gestores
export async function criarGestor(dados: DadosNovoGestor): Promise<Usuario> {
  const resposta = await api.post('/rh/gestores', dados)
  return extrairDados<Usuario>(resposta.data)
}

// GestorResumo espelha o GestorResumoDTO do backend: o gestor + KPIs de produtividade
// (saúde do 1:1). Os KPIs vêm zerados se o gestor ainda não montou a agenda.
export interface GestorResumo {
  id: string
  nome: string
  email: string
  criado_em: string
  percentual_em_dia: number
  total_agendados: number
  atrasados: number
  realizados_ult_30: number
  streak_semanas: number
}

// listarGestores devolve os gestores do tenant do RH com seus KPIs (dashboard).
// Rota: GET /api/v1/rh/gestores
export async function listarGestores(): Promise<GestorResumo[]> {
  const resposta = await api.get('/rh/gestores')
  return extrairDados<GestorResumo[]>(resposta.data)
}

// OneByOneResumo espelha o 1:1 retornado no drill-down (campos do onebyone do backend).
export interface OneByOneResumo {
  id: string
  colabor_id: string
  status: string
  realizado_em: string | null
  data_agendada: string
  recorrencia: string
}

// AgendamentoResumo espelha o agendamento retornado no drill-down.
export interface AgendamentoResumo {
  id: string
  colaborador_id: string
  liderado_nome: string
  data_hora: string
  recorrencia: string
}

// onebyonesDoGestor lista os 1:1 de um gestor do tenant. O backend valida que o gestor
// pertence ao RH (senão 404). Rota: GET /api/v1/rh/gestores/:id/onebyones
export async function onebyonesDoGestor(gestorId: string): Promise<OneByOneResumo[]> {
  const resposta = await api.get(`/rh/gestores/${gestorId}/onebyones`)
  return extrairDados<OneByOneResumo[]>(resposta.data)
}

// agendamentosDoGestor lista a agenda de 1:1 de um gestor do tenant.
// Rota: GET /api/v1/rh/gestores/:id/agendamentos
export async function agendamentosDoGestor(gestorId: string): Promise<AgendamentoResumo[]> {
  const resposta = await api.get(`/rh/gestores/${gestorId}/agendamentos`)
  return extrairDados<AgendamentoResumo[]>(resposta.data)
}

// AgendaItemRH é um 1:1 da agenda CONSOLIDADA do RH (todos os gestores), com gestor/equipe.
// Tem os mesmos campos de um Agendamento (id, colaborador_id, liderado_nome, data_hora,
// recorrencia, repete_ate), então pode ser reaproveitado no calendário/projeção.
export interface AgendaItemRH {
  id: string
  gestor_id: string
  gestor_nome: string
  colaborador_id: string
  liderado_nome: string
  equipe_id: string
  equipe_nome: string
  data_hora: string
  recorrencia: Recorrencia
  repete_ate?: string
}

// agendaDoRH traz a agenda consolidada de todos os gestores do tenant. GET /rh/agenda
export async function agendaDoRH(): Promise<AgendaItemRH[]> {
  const resposta = await api.get('/rh/agenda')
  return extrairDados<AgendaItemRH[]>(resposta.data)
}

// MatrixItemRH é um liderado na 9-box consolidada do RH, com gestor/equipe e classificação.
export interface MatrixItemRH {
  colaborador_id: string
  liderado_nome: string
  gestor_id: string
  gestor_nome: string
  equipe_id: string
  equipe_nome: string
  desempenho: '' | 'BAIXO' | 'MEDIO' | 'ALTO'
  potencial: '' | 'BAIXO' | 'MEDIO' | 'ALTO'
}

// matrixDoRH traz todos os liderados do tenant com a classificação 9-box. GET /rh/matrix
export async function matrixDoRH(): Promise<MatrixItemRH[]> {
  const resposta = await api.get('/rh/matrix')
  return extrairDados<MatrixItemRH[]>(resposta.data)
}

// LideradoRisco é um liderado que precisa de atenção, com o motivo (humor caindo etc.).
export interface LideradoRisco {
  colaborador_id: string
  nome: string
  motivo: string
}

// GestorEvolucao resume a EVOLUÇÃO dos liderados de um gestor (qualidade, não quantidade):
// tendência de humor do time, liderados em risco, progresso de PDI e lacunas de 9-box.
export interface GestorEvolucao {
  gestor_id: string
  gestor_nome: string
  total_liderados: number
  com_humor: number
  humor_media: number
  humor_tendencia: number
  liderados_em_risco: number
  pdi_total: number
  pdi_concluidos: number
  pdi_atrasados: number
  sem_classificacao: number
  riscos: LideradoRisco[]
}

// acompanhamentoDosGestores traz a evolução dos liderados por gestor, já ordenado por
// necessidade de atenção (mais em risco primeiro). GET /rh/acompanhamento
export async function acompanhamentoDosGestores(): Promise<GestorEvolucao[]> {
  const resposta = await api.get('/rh/acompanhamento')
  return extrairDados<GestorEvolucao[]>(resposta.data) ?? []
}
