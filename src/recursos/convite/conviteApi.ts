// Arquivo: src/recursos/convite/conviteApi.ts
// Descrição: Funções que conversam com os endpoints de convite da API Go.
//            O gestor gera o convite; o liderado consulta e aceita (público).

import { api, extrairDados } from '@/lib/api'
import type { RespostaLogin } from '@/recursos/auth/tipos'

// Retorno da geração do convite (o código só vem aqui, uma vez).
export interface ConviteGerado {
  token: string
  codigo: string
  link: string
  expira_em: string
}

// Dados públicos do convite (o que o liderado vê ao abrir o link).
export interface ConvitePublico {
  token: string
  valido: boolean
  colaborador_nome: string
  email: string
}

// gerarConvite (gestor): cria o convite para um colaborador. POST /colaboradores/:id/convite
export async function gerarConvite(colaboradorId: string): Promise<ConviteGerado> {
  const resp = await api.post(`/colaboradores/${colaboradorId}/convite`)
  return extrairDados<ConviteGerado>(resp.data)
}

// buscarConvite (público): consulta os dados do convite. GET /convites/:token
export async function buscarConvite(token: string): Promise<ConvitePublico> {
  const resp = await api.get(`/convites/${token}`)
  return extrairDados<ConvitePublico>(resp.data)
}

// aceitarConvite (público): valida o código + senha e devolve a sessão pronta.
// POST /convites/:token/aceitar
export async function aceitarConvite(
  token: string,
  codigo: string,
  senha: string,
): Promise<RespostaLogin> {
  const resp = await api.post(`/convites/${token}/aceitar`, { codigo, senha })
  return extrairDados<RespostaLogin>(resp.data)
}
