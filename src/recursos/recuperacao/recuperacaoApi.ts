// Arquivo: src/recursos/recuperacao/recuperacaoApi.ts
// Descrição: Chamadas do fluxo "esqueci minha senha" (rotas públicas da API).

import { api, cabecalhoRecaptcha, extrairDados } from '@/lib/api'

// Pede o link de recuperação. O backend SEMPRE responde sucesso (anti-enumeração):
// não dá pra descobrir quais e-mails têm conta.
// Rota: POST /api/v1/auth/recuperar-senha
export async function solicitarRecuperacao(email: string, tokenRecaptcha?: string): Promise<void> {
  await api.post('/auth/recuperar-senha', { email }, cabecalhoRecaptcha(tokenRecaptcha))
}

// Confere se o link (token) ainda é válido — para mostrar o formulário ou um aviso.
// Rota: GET /api/v1/recuperacoes/:token
export async function validarTokenRecuperacao(token: string): Promise<boolean> {
  const resp = await api.get(`/recuperacoes/${token}`)
  return extrairDados<{ valido: boolean }>(resp.data)?.valido ?? false
}

// Redefine a senha com o código (contra-senha) recebido por e-mail.
// Rota: POST /api/v1/recuperacoes/:token/redefinir
export async function redefinirSenha(token: string, codigo: string, nova_senha: string): Promise<void> {
  await api.post(`/recuperacoes/${token}/redefinir`, { codigo, nova_senha })
}
