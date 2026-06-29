// Arquivo: src/recursos/ia/iaApi.ts
// Descrição: API e hooks da IA do gestor (BYOK). Config (provedor + chave) e chat.
//            A chave NUNCA volta do servidor — só o provedor e tem_chave.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, extrairDados } from '@/lib/api'

export type ProvedorIA = 'CLAUDE' | 'OPENAI' | 'DEEPSEEK' | 'GROK'

export interface ConfigIA {
  provedor: string // '' se não configurado
  tem_chave: boolean
  herdada_do_rh?: boolean // usando a IA configurada pelo RH (gestor sem IA própria)
}

// Metadados de cada provedor (rótulo + onde pegar a chave).
export const PROVEDORES: { id: ProvedorIA; nome: string; ajuda: string }[] = [
  { id: 'CLAUDE', nome: 'Claude (Anthropic)', ajuda: 'console.anthropic.com' },
  { id: 'OPENAI', nome: 'ChatGPT (OpenAI)', ajuda: 'platform.openai.com' },
  { id: 'DEEPSEEK', nome: 'DeepSeek', ajuda: 'platform.deepseek.com' },
  { id: 'GROK', nome: 'Grok (xAI)', ajuda: 'console.x.ai' },
]

export async function obterConfigIA(): Promise<ConfigIA> {
  const resp = await api.get('/ia/config')
  return extrairDados<ConfigIA>(resp.data)
}

export async function salvarConfigIA(provedor: string, chave: string): Promise<void> {
  await api.put('/ia/config', { provedor, chave })
}

export async function chatIA(mensagem: string): Promise<string> {
  const resp = await api.post('/ia/chat', { mensagem })
  return extrairDados<{ resposta: string }>(resp.data).resposta
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useConfigIA() {
  return useQuery({ queryKey: ['ia-config'], queryFn: obterConfigIA })
}

export function useSalvarConfigIA() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { provedor: string; chave: string }) => salvarConfigIA(v.provedor, v.chave),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ia-config'] }),
  })
}

export function useChatIA() {
  return useMutation({ mutationFn: chatIA })
}
