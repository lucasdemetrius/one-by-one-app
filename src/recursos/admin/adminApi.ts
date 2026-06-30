// Arquivo: src/recursos/admin/adminApi.ts
// Descrição: Conversa com o painel de ADMIN da API Go (/api/v1/admin/...). Só a conta
//            ADMIN acessa. Cada hook é gated por `ativo` (enabled) para só buscar os dados
//            da aba que está visível. Os tipos espelham os DTOs do backend (internal/admin/dto.go).

import { useQuery } from '@tanstack/react-query'
import { api, extrairDados } from '@/lib/api'
import type { Papel } from '@/recursos/auth/tipos'

// ── Visão geral ──────────────────────────────────────────────────────────────
export interface ContasResumo {
  total: number
  admin: number
  rh: number
  gestores: number
  liderados: number
  inativas: number
  novas_hoje: number
  novas_7d: number
  novas_30d: number
}
export interface Estrutura {
  organizacoes: number
  equipes: number
  colaboradores: number
  colaboradores_com_conta: number
}
export interface Atividade {
  onebyones_total: number
  realizados_total: number
  realizados_30d: number
  agendamentos_ativos: number
  logins_hoje: number
  logins_7d: number
  ativos_hoje: number
  ativos_7d: number
  ativos_30d: number
  eventos_hoje: number
}
export interface VisaoGeral {
  contas: ContasResumo
  estrutura: Estrutura
  atividade: Atividade
  gerado_em: string
}
export function useVisaoGeral(ativo: boolean) {
  return useQuery({
    queryKey: ['admin', 'visao-geral'],
    enabled: ativo,
    queryFn: async () => extrairDados<VisaoGeral>((await api.get('/admin/visao-geral')).data),
  })
}

// ── Acessos (série temporal estilo Google Analytics) ─────────────────────────
export interface SerieAcessos {
  dias: string[]
  logins: number[]
  ativos: number[]
  eventos: number[]
  periodo: number
  total_logs: number
}
export function useAcessos(dias: number, ativo: boolean) {
  return useQuery({
    queryKey: ['admin', 'acessos', dias],
    enabled: ativo,
    queryFn: async () => extrairDados<SerieAcessos>((await api.get('/admin/acessos', { params: { dias } })).data),
  })
}

// ── Uso (distribuições) ──────────────────────────────────────────────────────
export interface Contagem {
  rotulo: string
  total: number
}
export interface FuncUso {
  entidade: string
  acao: string
  total: number
}
export interface Uso {
  periodo: number
  top_funcionalidades: FuncUso[]
  por_hora: Contagem[]
  por_dia_semana: Contagem[]
  por_papel: Contagem[]
}
export function useUso(dias: number, ativo: boolean) {
  return useQuery({
    queryKey: ['admin', 'uso', dias],
    enabled: ativo,
    queryFn: async () => extrairDados<Uso>((await api.get('/admin/uso', { params: { dias } })).data),
  })
}

// ── Crescimento ──────────────────────────────────────────────────────────────
export interface Crescimento {
  periodo: number
  dias: string[]
  novos_rh: number[]
  novos_gestores: number[]
  novos_liderados: number[]
  novos_total: number[]
  acumulado_total: number[]
  realizados: number[]
}
export function useCrescimento(dias: number, ativo: boolean) {
  return useQuery({
    queryKey: ['admin', 'crescimento', dias],
    enabled: ativo,
    queryFn: async () => extrairDados<Crescimento>((await api.get('/admin/crescimento', { params: { dias } })).data),
  })
}

// ── Contas (lista paginada com resumo de uso) ────────────────────────────────
export interface ContaItem {
  id: string
  nome: string
  email: string
  role: Papel
  criado_em: string
  ultimo_acesso: string | null
  total_eventos: number
  equipes: number
  colaboradores: number
  onebyones: number
  gestores: number
}
export interface ContasPagina {
  itens: ContaItem[]
  total: number
  limite: number
  offset: number
}
export interface FiltroContas {
  papel?: string
  busca?: string
  limite?: number
  offset?: number
}
export function useContas(filtro: FiltroContas, ativo: boolean) {
  return useQuery({
    queryKey: ['admin', 'contas', filtro],
    enabled: ativo,
    queryFn: async () => extrairDados<ContasPagina>((await api.get('/admin/contas', { params: filtro })).data),
  })
}

// ── Saúde da plataforma ──────────────────────────────────────────────────────
export interface GestorEngajamento {
  id: string
  nome: string
  email: string
  realizados: number
  liderados: number
}
export interface Saude {
  gestores: number
  gestores_com_1a1: number
  gestores_sem_1a1: number
  pct_gestores_engajados: number
  media_liderados_por_gestor: number
  liderados_ativos: number
  liderados_com_conta: number
  pct_liderados_vinculados: number
  contas_com_ia: number
  contas_com_foto: number
  realizados_30d: number
  top_gestores: GestorEngajamento[]
  gerado_em: string
}
export function useSaude(ativo: boolean) {
  return useQuery({
    queryKey: ['admin', 'saude'],
    enabled: ativo,
    queryFn: async () => extrairDados<Saude>((await api.get('/admin/saude')).data),
  })
}
