// Arquivo: src/recursos/notificacao/notificacaoApi.ts
// Descrição: API e hooks das notificações in-app (sino) e das preferências.
//            A contagem de não-lidas faz polling leve (a cada 60s) para o badge.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, extrairDados } from '@/lib/api'

export interface Notificacao {
  id: string
  tipo: string
  titulo: string
  mensagem: string
  link: string | null
  lida: boolean
  criado_em: string
}

export interface PrefNotif {
  agenda_1dia: boolean
  agenda_hoje: boolean
  agenda_1h: boolean
}

async function listarNotificacoes(): Promise<Notificacao[]> {
  const resp = await api.get('/notificacoes')
  return extrairDados<Notificacao[]>(resp.data) ?? []
}

async function contarNaoLidas(): Promise<number> {
  const resp = await api.get('/notificacoes/contagem')
  return extrairDados<{ nao_lidas: number }>(resp.data)?.nao_lidas ?? 0
}

async function marcarLida(id: string): Promise<void> {
  await api.put(`/notificacoes/itens/${id}/lida`)
}

async function lerTodas(): Promise<void> {
  await api.put('/notificacoes/ler-todas')
}

async function obterPrefs(): Promise<PrefNotif> {
  const resp = await api.get('/notificacoes/preferencias')
  return extrairDados<PrefNotif>(resp.data)
}

async function salvarPrefs(p: PrefNotif): Promise<void> {
  await api.put('/notificacoes/preferencias', p)
}

// ── Hooks ────────────────────────────────────────────────────────────────────

/** Contagem de não-lidas para o badge do sino (polling a cada 60s). */
export function useContagemNaoLidas() {
  return useQuery({
    queryKey: ['notif', 'contagem'],
    queryFn: contarNaoLidas,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
}

/** Lista de notificações — só busca quando o painel está aberto. */
export function useNotificacoes(habilitado: boolean) {
  return useQuery({
    queryKey: ['notif', 'lista'],
    queryFn: listarNotificacoes,
    enabled: habilitado,
  })
}

export function useMarcarLida() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: marcarLida,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notif', 'lista'] })
      qc.invalidateQueries({ queryKey: ['notif', 'contagem'] })
    },
  })
}

export function useLerTodas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: lerTodas,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notif', 'lista'] })
      qc.invalidateQueries({ queryKey: ['notif', 'contagem'] })
    },
  })
}

export function usePrefsNotif(habilitado: boolean) {
  return useQuery({ queryKey: ['notif', 'prefs'], queryFn: obterPrefs, enabled: habilitado })
}

export function useSalvarPrefs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: salvarPrefs,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notif', 'prefs'] }),
  })
}
