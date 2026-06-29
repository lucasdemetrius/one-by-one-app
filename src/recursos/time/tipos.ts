// Arquivo: src/recursos/time/tipos.ts
// Descrição: Tipos do domínio "time" — organização, equipe e colaborador (liderado).
//            Espelham os DTOs do backend Go (internal/organizacao, equipe, colaborador).
//            A estrutura é: Organização → Equipes → Colaboradores.

// ── Organização (espelha OrganizacaoRespostaDTO) ───────────────────────────
export interface Organizacao {
  id: string
  usuario_id: string
  template_id: string | null
  nome: string
  criado_em: string
  alterado_em: string | null
  foto_url: string | null
}

export interface CriarOrganizacao {
  nome: string
  template_id?: string | null
}

// ── Equipe (espelha EquipeRespostaDTO) ─────────────────────────────────────
export interface Equipe {
  id: string
  usuario_id: string
  organizacao_id: string
  template_id: string | null
  nome: string
  criado_em: string
  alterado_em: string | null
  foto_url: string | null
}

export interface CriarEquipe {
  organizacao_id: string
  nome: string
  template_id?: string | null
}

// ── Colaborador / Liderado (espelha ColaboradorRespostaDTO) ─────────────────
export interface Colaborador {
  id: string
  usuario_id: string | null
  organizacao_id: string
  equipe_id: string
  template_id: string | null
  nome: string
  email: string
  whatsapp: string | null
  data_nascimento: string | null
  criado_em: string
  alterado_em: string | null
  foto_url: string | null
  // Desligamento (saída da empresa/equipe). null = ativo.
  desligado_em: string | null
  // Conveniência: true quando NÃO está desligado.
  ativo: boolean
}

export interface CriarColaborador {
  organizacao_id: string
  equipe_id: string
  nome: string
  email: string
  whatsapp?: string | null
  data_nascimento?: string
}
