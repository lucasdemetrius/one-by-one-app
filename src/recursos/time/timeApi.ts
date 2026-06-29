// Arquivo: src/recursos/time/timeApi.ts
// Descrição: Funções que conversam com os endpoints de organização, equipe e
//            colaborador da API Go. Isolam o axios/URLs do resto do app.

import { api, extrairDados } from '@/lib/api'
import type {
  Colaborador,
  CriarColaborador,
  CriarEquipe,
  CriarOrganizacao,
  Equipe,
  Organizacao,
} from './tipos'

// ── Organizações ───────────────────────────────────────────────────────────

// Lista as organizações do líder autenticado. GET /organizacoes
export async function listarOrganizacoes(): Promise<Organizacao[]> {
  const resp = await api.get('/organizacoes')
  return extrairDados<Organizacao[]>(resp.data) ?? []
}

// Cria uma organização para o líder autenticado. POST /organizacoes
export async function criarOrganizacao(
  dados: CriarOrganizacao,
): Promise<Organizacao> {
  const resp = await api.post('/organizacoes', dados)
  return extrairDados<Organizacao>(resp.data)
}

// ── Equipes ────────────────────────────────────────────────────────────────

// Lista as equipes de uma organização. GET /organizacoes/:id/equipes
export async function listarEquipes(organizacaoId: string): Promise<Equipe[]> {
  const resp = await api.get(`/organizacoes/${organizacaoId}/equipes`)
  return extrairDados<Equipe[]>(resp.data) ?? []
}

// Cria uma equipe dentro de uma organização. POST /equipes
export async function criarEquipe(dados: CriarEquipe): Promise<Equipe> {
  const resp = await api.post('/equipes', dados)
  return extrairDados<Equipe>(resp.data)
}

// Remove uma equipe (soft delete). DELETE /equipes/:id
export async function deletarEquipe(equipeId: string): Promise<void> {
  await api.delete(`/equipes/${equipeId}`)
}

// Envia o logo/brasão da equipe (multipart). POST /equipes/:id/foto
export async function enviarFotoEquipe(equipeId: string, arquivo: File): Promise<Equipe> {
  const form = new FormData()
  form.append('foto', arquivo)
  const resp = await api.post(`/equipes/${equipeId}/foto`, form)
  return extrairDados<Equipe>(resp.data)
}

// ── Colaboradores (liderados) ──────────────────────────────────────────────

// Lista todos os colaboradores de uma organização. GET /organizacoes/:id/colaboradores
export async function listarColaboradores(
  organizacaoId: string,
): Promise<Colaborador[]> {
  const resp = await api.get(`/organizacoes/${organizacaoId}/colaboradores`)
  return extrairDados<Colaborador[]>(resp.data) ?? []
}

// Busca um colaborador pelo id. GET /colaboradores/:id
export async function buscarColaborador(id: string): Promise<Colaborador> {
  const resp = await api.get(`/colaboradores/${id}`)
  return extrairDados<Colaborador>(resp.data)
}

// Busca o colaborador do liderado logado (id da sala do 1:1). GET /meu-colaborador
export async function buscarMeuColaborador(): Promise<Colaborador> {
  const resp = await api.get('/meu-colaborador')
  return extrairDados<Colaborador>(resp.data)
}

// ── Importação em lote (CSV) ─────────────────────────────────────────────────

export interface ItemImport {
  nome: string
  email: string
}

export interface ErroImport {
  linha: number
  nome: string
  email: string
  motivo: string
}

export interface ResultadoImport {
  criados: Colaborador[]
  erros: ErroImport[]
}

// Importa vários liderados de uma vez numa equipe. POST /importar-liderados
export async function importarLiderados(dados: {
  organizacao_id: string
  equipe_id: string
  itens: ItemImport[]
}): Promise<ResultadoImport> {
  const resp = await api.post('/importar-liderados', dados)
  return extrairDados<ResultadoImport>(resp.data)
}

// Cria um colaborador (liderado). POST /colaboradores
export async function criarColaborador(
  dados: CriarColaborador,
): Promise<Colaborador> {
  const resp = await api.post('/colaboradores', dados)
  return extrairDados<Colaborador>(resp.data)
}

// Atualiza campos de um colaborador (ex.: mover de equipe). PUT /colaboradores/:id
export async function atualizarColaborador(
  colaboradorId: string,
  dados: Partial<Pick<Colaborador, 'nome' | 'email' | 'equipe_id'>>,
): Promise<Colaborador> {
  const resp = await api.put(`/colaboradores/${colaboradorId}`, dados)
  return extrairDados<Colaborador>(resp.data)
}

// Desliga (inativa) um colaborador. POST /colaboradores/:id/desligar
export async function desligarColaborador(
  colaboradorId: string,
  dataDesligamento?: string,
): Promise<void> {
  await api.post(`/colaboradores/${colaboradorId}/desligar`, {
    data_desligamento: dataDesligamento,
  })
}

// Reativa um colaborador desligado. POST /colaboradores/:id/reativar
export async function reativarColaborador(colaboradorId: string): Promise<void> {
  await api.post(`/colaboradores/${colaboradorId}/reativar`)
}

// Remove um colaborador (soft delete). DELETE /colaboradores/:id
export async function deletarColaborador(colaboradorId: string): Promise<void> {
  await api.delete(`/colaboradores/${colaboradorId}`)
}
