// Arquivo: src/recursos/pauta/tabuleiroApi.ts
// Descrição: Persistência do tabuleiro do 1:1 na API (por liderado). O estado é o
//            objeto Tabuleiro inteiro, guardado como JSON no backend, para a pauta
//            sobreviver ao recarregar. Espelha o módulo `tabuleiro` do Go.

import { api, extrairDados } from '@/lib/api'
import type { Tabuleiro } from './tipos'

// Busca o tabuleiro salvo do liderado; null se ainda não houver nenhum.
export async function obterTabuleiro(colaboradorId: string): Promise<Tabuleiro | null> {
  const resp = await api.get(`/colaboradores/${colaboradorId}/tabuleiro`)
  const dados = extrairDados<{ estado: Tabuleiro | null }>(resp.data)
  return dados?.estado ?? null
}

// Salva (cria ou atualiza) o tabuleiro do liderado.
export async function salvarTabuleiro(colaboradorId: string, tabuleiro: Tabuleiro): Promise<void> {
  await api.put(`/colaboradores/${colaboradorId}/tabuleiro`, { estado: tabuleiro })
}
