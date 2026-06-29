// Arquivo: src/recursos/pauta/tipos.ts
// Descrição: Tipos e dados iniciais do "Tabuleiro do 1:1" — a pauta da reunião
//            organizada em colunas pelas quais os temas são arrastados.
//
//            Por enquanto os dados são locais (em memória), para a experiência
//            de drag-and-drop funcionar de ponta a ponta. Numa próxima etapa
//            estes temas virão dos módulos template/templatebloco da API Go.

// Quem propôs o tema — usado para colorir o cartão pela persona.
export type Autor = 'gestor' | 'liderado'

// Um tema/assunto da pauta (um cartão arrastável).
export interface Tema {
  id: string
  titulo: string
  emoji: string
  autor: Autor
}

// As três colunas do tabuleiro, na ordem do fluxo de um 1:1:
//   banco      → temas sugeridos, ainda fora da pauta de hoje
//   pauta      → temas escolhidos para conversar nesta reunião
//   conversado → temas já discutidos (alimenta a gamificação)
export type ColunaId = 'banco' | 'pauta' | 'conversado'

// Estrutura completa do tabuleiro: cada coluna tem sua lista ordenada de temas.
export type Tabuleiro = Record<ColunaId, Tema[]>

// Metadados de exibição de cada coluna (título, dica e cor de destaque).
export const COLUNAS: {
  id: ColunaId
  titulo: string
  dica: string
  // Token de cor usado no destaque da coluna (ver index.css).
  cor: 'borda' | 'gestor' | 'juncao'
}[] = [
  { id: 'banco', titulo: 'Banco de temas', dica: 'Arraste para a pauta de hoje', cor: 'borda' },
  { id: 'pauta', titulo: 'Pauta de hoje', dica: 'O que vão conversar agora', cor: 'gestor' },
  { id: 'conversado', titulo: 'Conversado', dica: 'Concluídos nesta reunião', cor: 'juncao' },
]

// Quantos pontos de XP cada tema concluído vale (gamificação).
export const XP_POR_TEMA = 50

// Tabuleiro inicial de exemplo, para a tela já nascer "viva".
export const TABULEIRO_INICIAL: Tabuleiro = {
  banco: [
    { id: 'b1', titulo: 'Reconhecimento da semana', emoji: '⭐', autor: 'gestor' },
    { id: 'b2', titulo: 'Plano de carreira', emoji: '🌱', autor: 'liderado' },
    { id: 'b3', titulo: 'Férias e descanso', emoji: '🏖️', autor: 'liderado' },
    { id: 'b4', titulo: 'Metas do trimestre', emoji: '🎯', autor: 'gestor' },
  ],
  pauta: [
    { id: 'p1', titulo: 'Como foi sua semana?', emoji: '🗓️', autor: 'gestor' },
    { id: 'p2', titulo: 'Bloqueios atuais', emoji: '🧩', autor: 'liderado' },
    { id: 'p3', titulo: 'Feedback sobre o projeto', emoji: '💬', autor: 'liderado' },
  ],
  conversado: [],
}
