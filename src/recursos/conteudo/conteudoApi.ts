// Arquivo: src/recursos/conteudo/conteudoApi.ts
// Descrição: API dos blocos de conteúdo de um tema (por liderado). Texto, link/
//            curso, imagem (S3) e marco com datas. Espelha o módulo blocotema do Go.

import { api, extrairDados } from '@/lib/api'

export type TipoBloco = 'TEXTO' | 'LINK' | 'IMAGEM' | 'MARCO'

export interface Bloco {
  id: string
  tema: string
  tipo: TipoBloco
  texto: string | null
  url: string | null
  imagem_url: string | null
  data_inicio: string | null
  data_fim: string | null
  ordem: number
}

// Dados para criar um bloco de texto, link ou marco (imagem vai por upload).
export interface CriarBloco {
  tema: string
  tipo: 'TEXTO' | 'LINK' | 'MARCO'
  texto?: string
  url?: string
  data_inicio?: string
  data_fim?: string
}

// listarBlocos: GET /colaboradores/:id/blocos?tema=...
export async function listarBlocos(
  colaboradorId: string,
  tema: string,
): Promise<Bloco[]> {
  const resp = await api.get(`/colaboradores/${colaboradorId}/blocos`, {
    params: { tema },
  })
  return extrairDados<Bloco[]>(resp.data) ?? []
}

// listarTodosBlocos: GET /colaboradores/:id/blocos/tudo (todos os temas — para a IA)
export async function listarTodosBlocos(colaboradorId: string): Promise<Bloco[]> {
  const resp = await api.get(`/colaboradores/${colaboradorId}/blocos/tudo`)
  return extrairDados<Bloco[]>(resp.data) ?? []
}

// criarBloco: POST /colaboradores/:id/blocos
export async function criarBloco(
  colaboradorId: string,
  dados: CriarBloco,
): Promise<Bloco> {
  const resp = await api.post(`/colaboradores/${colaboradorId}/blocos`, dados)
  return extrairDados<Bloco>(resp.data)
}

// criarBlocoImagem: POST /colaboradores/:id/blocos-imagem (multipart)
export async function criarBlocoImagem(
  colaboradorId: string,
  tema: string,
  legenda: string,
  arquivo: File,
): Promise<Bloco> {
  const form = new FormData()
  form.append('tema', tema)
  form.append('legenda', legenda)
  form.append('imagem', arquivo)
  const resp = await api.post(`/colaboradores/${colaboradorId}/blocos-imagem`, form)
  return extrairDados<Bloco>(resp.data)
}

// deletarBloco: DELETE /colaboradores/:id/blocos/:blocoId
export async function deletarBloco(
  colaboradorId: string,
  blocoId: string,
): Promise<void> {
  await api.delete(`/colaboradores/${colaboradorId}/blocos/${blocoId}`)
}
