// Arquivo: src/recursos/auth/authApi.ts
// Descrição: Funções que conversam com os endpoints de autenticação da API Go.
//            Ficam isoladas aqui para que componentes e hooks não conheçam os
//            detalhes do axios nem das URLs.

import { api, cabecalhoRecaptcha, extrairDados } from '@/lib/api'
import type {
  CredenciaisLogin,
  DadosRegistro,
  RespostaLogin,
  Usuario,
} from './tipos'

// fazerLogin autentica o usuário e devolve o token + dados do usuário.
// Rota: POST /api/v1/auth/login
export async function fazerLogin(
  credenciais: CredenciaisLogin,
  tokenRecaptcha?: string,
): Promise<RespostaLogin> {
  const resposta = await api.post('/auth/login', credenciais, cabecalhoRecaptcha(tokenRecaptcha))
  return extrairDados<RespostaLogin>(resposta.data)
}

// registrarConta cria um novo usuário (auto-cadastro público).
// Rota: POST /api/v1/auth/registrar
export async function registrarConta(dados: DadosRegistro, tokenRecaptcha?: string): Promise<Usuario> {
  const resposta = await api.post('/auth/registrar', dados, cabecalhoRecaptcha(tokenRecaptcha))
  return extrairDados<Usuario>(resposta.data)
}

// Papéis possíveis para uma conta NOVA criada via Google (pergunta "como você vai usar?").
// Só Gestor (LIDER) e RH — o liderado não se auto-cadastra, entra por convite.
export type PapelGoogle = 'LIDER' | 'RH'

// Resposta do login com Google: ou a sessão vem pronta (token + usuario), ou
// precisa_papel=true — o e-mail ainda não tem conta e é preciso perguntar o papel.
export interface RespostaLoginGoogle {
  precisa_papel: boolean
  token?: string
  usuario?: Usuario
}

// loginGoogle troca o "credential" (ID token do Google) por uma sessão do OneByOne.
// Conta existente → entra nela. Conta nova → mandar também o `role` escolhido
// (sem role, o backend devolve precisa_papel=true para o front perguntar).
// Rota: POST /api/v1/auth/google
export async function loginGoogle(credential: string, role?: PapelGoogle): Promise<RespostaLoginGoogle> {
  const resposta = await api.post('/auth/google', role ? { credential, role } : { credential })
  return extrairDados<RespostaLoginGoogle>(resposta.data)
}

// enviarFotoPerfil faz upload da foto de perfil do usuário (multipart) e devolve
// o usuário atualizado com a nova foto_url. Rota: POST /api/v1/usuarios/:id/foto
export async function enviarFotoPerfil(id: string, arquivo: File): Promise<Usuario> {
  const form = new FormData()
  form.append('foto', arquivo)
  const resposta = await api.post(`/usuarios/${id}/foto`, form)
  return extrairDados<Usuario>(resposta.data)
}
