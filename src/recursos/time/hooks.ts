// Arquivo: src/recursos/time/hooks.ts
// Descrição: Hooks do TanStack Query para o domínio "time". Cuidam de buscar e
//            cachear os dados (organização, equipes, colaboradores) e de criar/
//            remover, invalidando o cache automaticamente após cada mudança.
//
//            Para quem vem de C#: pense nestes hooks como uma camada de serviço
//            já com cache e atualização automática da tela embutidos.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  atualizarColaborador,
  buscarColaborador,
  buscarMeuColaborador,
  criarColaborador,
  criarEquipe,
  criarOrganizacao,
  deletarColaborador,
  deletarEquipe,
  desligarColaborador,
  enviarFotoEquipe,
  listarColaboradores,
  listarEquipes,
  listarOrganizacoes,
  reativarColaborador,
} from './timeApi'
import type { Colaborador } from './tipos'

// Chaves de cache — centralizadas para evitar erro de digitação.
const chaves = {
  organizacoes: ['organizacoes'] as const,
  equipes: (orgId: string) => ['equipes', orgId] as const,
  colaboradores: (orgId: string) => ['colaboradores', orgId] as const,
}

// ── Consultas ──────────────────────────────────────────────────────────────

export function useOrganizacoes() {
  return useQuery({
    queryKey: chaves.organizacoes,
    queryFn: listarOrganizacoes,
  })
}

export function useEquipes(organizacaoId: string | undefined) {
  return useQuery({
    queryKey: chaves.equipes(organizacaoId ?? ''),
    queryFn: () => listarEquipes(organizacaoId as string),
    // Só busca quando já existe uma organização selecionada.
    enabled: Boolean(organizacaoId),
  })
}

export function useColaboradores(organizacaoId: string | undefined) {
  return useQuery({
    queryKey: chaves.colaboradores(organizacaoId ?? ''),
    queryFn: () => listarColaboradores(organizacaoId as string),
    enabled: Boolean(organizacaoId),
  })
}

export function useColaborador(id: string | undefined) {
  return useQuery({
    queryKey: ['colaborador', id ?? ''],
    queryFn: () => buscarColaborador(id as string),
    enabled: Boolean(id),
  })
}

// O colaborador do liderado logado (id da sala do 1:1 ao vivo).
export function useMeuColaborador(habilitado: boolean) {
  return useQuery({
    queryKey: ['meu-colaborador'],
    queryFn: buscarMeuColaborador,
    enabled: habilitado,
    retry: false, // gestor não tem colaborador → 404, não insistir
  })
}

// ── Mutações ─────────────────────────────────────────────────────────────────

export function useCriarOrganizacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: criarOrganizacao,
    onSuccess: () => qc.invalidateQueries({ queryKey: chaves.organizacoes }),
  })
}

export function useCriarEquipe(organizacaoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: criarEquipe,
    onSuccess: () => qc.invalidateQueries({ queryKey: chaves.equipes(organizacaoId) }),
  })
}

export function useDeletarEquipe(organizacaoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletarEquipe,
    onSuccess: () => qc.invalidateQueries({ queryKey: chaves.equipes(organizacaoId) }),
  })
}

// Envia o logo/brasão de uma equipe.
export function useEnviarFotoEquipe(organizacaoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; arquivo: File }) => enviarFotoEquipe(vars.id, vars.arquivo),
    onSuccess: () => qc.invalidateQueries({ queryKey: chaves.equipes(organizacaoId) }),
  })
}

export function useCriarColaborador(organizacaoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: criarColaborador,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: chaves.colaboradores(organizacaoId) }),
  })
}

export function useDeletarColaborador(organizacaoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletarColaborador,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: chaves.colaboradores(organizacaoId) }),
  })
}

// Move um colaborador para outra equipe (ou edita campos). Usado no arraste.
export function useAtualizarColaborador(organizacaoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      id: string
      dados: Partial<Pick<Colaborador, 'nome' | 'email' | 'equipe_id'>>
    }) => atualizarColaborador(vars.id, vars.dados),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: chaves.colaboradores(organizacaoId) }),
  })
}

// Desliga (inativa) um liderado — data opcional (default: hoje).
export function useDesligarColaborador(organizacaoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; data?: string }) =>
      desligarColaborador(vars.id, vars.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: chaves.colaboradores(organizacaoId) }),
  })
}

// Reativa um liderado desligado.
export function useReativarColaborador(organizacaoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reativarColaborador,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: chaves.colaboradores(organizacaoId) }),
  })
}
