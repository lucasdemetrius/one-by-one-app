// Arquivo: src/recursos/conteudo/valores.ts
// Descrição: Conteúdo dos "valores" do produto — o que o OneByOne entrega para
//            aproximar gestor e liderado. Usado na landing e na tela de cadastro.
//            Centralizar aqui evita repetir os textos em vários lugares.

export interface Valor {
  emoji: string
  titulo: string
  descricao: string
  // Token de cor (gestor/liderado/junção) usado no destaque do ícone.
  cor: 'gestor' | 'liderado' | 'juncao'
}

// Os pilares do que o gestor passa a enxergar de cada pessoa do time.
export const VALORES: Valor[] = [
  {
    emoji: '💜',
    titulo: 'Sentimento & clima',
    descricao: 'Saiba como cada pessoa está se sentindo na empresa, semana a semana.',
    cor: 'juncao',
  },
  {
    emoji: '📦',
    titulo: 'Entregas',
    descricao: 'Acompanhe o que cada liderado está entregando — sem microgerenciar.',
    cor: 'gestor',
  },
  {
    emoji: '💬',
    titulo: 'Feedbacks recebidos',
    descricao: 'Todos os feedbacks que a pessoa recebeu, reunidos num histórico só.',
    cor: 'liderado',
  },
  {
    emoji: '📚',
    titulo: 'O que está estudando',
    descricao: 'Veja o que cada um está aprendendo e incentive o crescimento.',
    cor: 'gestor',
  },
  {
    emoji: '🎯',
    titulo: 'Evolução do PDI',
    descricao: 'Acompanhe o Plano de Desenvolvimento Individual evoluir de verdade.',
    cor: 'liderado',
  },
  {
    emoji: '🗓️',
    titulo: '1:1 que fluem',
    descricao: 'Monte a pauta arrastando temas e registre o que importa na conversa.',
    cor: 'juncao',
  },
]
