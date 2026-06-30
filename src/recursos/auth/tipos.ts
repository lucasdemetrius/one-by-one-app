// Arquivo: src/recursos/auth/tipos.ts
// Descrição: Tipos TypeScript que espelham os DTOs de autenticação do backend Go
//            (internal/usuario/dto.go). Manter os nomes alinhados facilita a
//            ligação entre frontend e API.

// Papel do usuário no sistema. No produto:
//   RH          → persona "RH" (raiz do tenant: cadastra e supervisiona os gestores)
//   LIDER       → persona "Gestor"
//   COLABORADOR → persona "Liderado"
//   ADMIN       → administrador da PLATAFORMA (super-usuário global de monitoração)
export type Papel = 'RH' | 'LIDER' | 'COLABORADOR' | 'ADMIN'

// Dados do usuário autenticado (espelha UsuarioRespostaDTO do Go).
export interface Usuario {
  id: string
  nome: string
  email: string
  role: Papel
  criado_em: string
  alterado_em: string | null
  foto_url: string | null
}

// Corpo enviado no login (espelha LoginDTO).
export interface CredenciaisLogin {
  email: string
  password: string
}

// Resposta do login bem-sucedido (espelha LoginRespostaDTO).
export interface RespostaLogin {
  token: string
  usuario: Usuario
}

// Corpo enviado no auto-cadastro (espelha CriarUsuarioDTO).
export interface DadosRegistro {
  nome: string
  email: string
  password: string
  role?: Papel
}
