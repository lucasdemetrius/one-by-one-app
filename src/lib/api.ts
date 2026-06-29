// Arquivo: src/lib/api.ts
// Descrição: Cliente HTTP central (axios) usado para falar com o backend Go.
//            Aplica automaticamente o token JWT em toda requisição e padroniza
//            o tratamento do envelope de resposta { sucesso, dados, erro }.

import axios from 'axios'
import type { AxiosError } from 'axios'

// Chave usada no localStorage para guardar o token JWT entre sessões.
export const CHAVE_TOKEN = 'onebyone.token'

// Instância base. baseURL "/api/v1" cai no proxy do Vite, que repassa para a
// API Go (ver vite.config.ts). Em produção, aponte para a URL real da API.
// Sem Content-Type fixo: o axios define sozinho — application/json para objetos
// e multipart/form-data (com boundary) quando o corpo é um FormData (upload de foto).
export const api = axios.create({
  baseURL: '/api/v1',
})

// ── Interceptor de requisição ──────────────────────────────────────────────
// Antes de cada chamada, injeta o cabeçalho Authorization se houver token salvo.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(CHAVE_TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Formato do envelope padrão que a API Go sempre devolve.
interface EnvelopeApi<T> {
  sucesso: boolean
  dados?: T
  erro?: string
}

// extrairDados desembrulha o envelope da API e devolve só o conteúdo de "dados".
// Centraliza esse desembrulho para os controllers/serviços não repetirem ".data.dados".
export function extrairDados<T>(envelope: EnvelopeApi<T>): T {
  return envelope.dados as T
}

// extrairMensagemErro traduz uma falha do axios em uma mensagem legível em
// português, priorizando o campo "erro" devolvido pela API Go.
export function extrairMensagemErro(erro: unknown): string {
  const axiosErro = erro as AxiosError<EnvelopeApi<unknown>>
  if (axiosErro?.response?.data?.erro) {
    return axiosErro.response.data.erro
  }
  if (axiosErro?.message === 'Network Error') {
    return 'Não foi possível falar com o servidor. A API está no ar?'
  }
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

// cabecalhoRecaptcha monta o header X-Recaptcha-Token quando há token (anti-bot).
// Sem token (reCAPTCHA desligado ou não resolvido) devolve {} — o backend ignora.
export function cabecalhoRecaptcha(token?: string) {
  return token ? { headers: { 'X-Recaptcha-Token': token } } : {}
}
