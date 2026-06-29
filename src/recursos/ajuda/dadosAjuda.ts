// Arquivo: src/recursos/ajuda/dadosAjuda.ts
// Descrição: Conteúdo dos 3 manuais de ajuda (RH, Gestor, Liderado) + a legenda de
//            ícones. Texto curto e direto, redigido a partir do código real (não
//            inventa recurso). Separado da apresentação (PaginaAjuda desenha isto).

export type PapelAjuda = 'RH' | 'LIDER' | 'COLABORADOR'

export interface PassoRapido {
  emoji: string
  titulo: string
  descricao: string
}
export interface RecursoAjuda {
  icone: string
  titulo: string
  descricao: string
  onde: string
}
export interface FaqAjuda {
  pergunta: string
  resposta: string
}
export interface Manual {
  papel: PapelAjuda
  rotulo: string // nome curto na aba
  emoji: string // ícone do papel
  titulo: string
  promessa: string
  inicio_rapido: PassoRapido[]
  recursos: RecursoAjuda[]
  faq: FaqAjuda[]
}
export interface ItemLegenda {
  icone: string
  nome: string
  oquefaz: string
}

export const MANUAIS: Record<PapelAjuda, Manual> = {
  RH: {
    papel: 'RH',
    rotulo: 'RH',
    emoji: '🏛️',
    titulo: 'Manual do RH',
    promessa:
      'Você cadastra os gestores da empresa e acompanha, num lugar só, a produtividade dos 1:1, a agenda e o talento de todo mundo.',
    inicio_rapido: [
      { emoji: '🏛️', titulo: 'Crie sua conta de RH', descricao: 'No cadastro, escolha "Sou RH", preencha nome, e-mail e senha — você é o topo da empresa.' },
      { emoji: '👤', titulo: 'Cadastre seus gestores', descricao: 'Informe o nome da empresa e adicione cada gestor (nome, e-mail e senha inicial); pode cadastrar depois.' },
      { emoji: '📊', titulo: 'Acompanhe pelo painel', descricao: 'Caia direto no painel do RH e veja os indicadores de 1:1 de cada gestor em cartões.' },
      { emoji: '✨', titulo: 'Conecte uma IA (opcional)', descricao: 'No seu Perfil, conecte uma IA e ela fica disponível para todos os seus gestores.' },
    ],
    recursos: [
      { icone: '👤', titulo: 'Cadastrar gestor', descricao: 'Cria a conta do gestor com a empresa já montada — ele entra e vai direto montar o time, sem precisar criar empresa.', onde: 'Painel do RH · "+ Cadastrar gestor"' },
      { icone: '📊', titulo: 'Indicadores dos gestores', descricao: 'Cada gestor vira um cartão com % em dia, agendados, atrasados, 1:1 nos últimos 30 dias e o streak 🔥 de semanas seguidas.', onde: 'Painel do RH · grade de cartões' },
      { icone: '🔍', titulo: 'Detalhe de um gestor', descricao: 'Abra um gestor para ver os indicadores dele, a agenda de 1:1 e o histórico de reuniões.', onde: 'Cartão do gestor · "Ver 1:1 e agenda →"' },
      { icone: '📅', titulo: 'Agenda da empresa', descricao: 'Todos os 1:1 de todos os gestores num calendário só, com filtro por gestor e por equipe. Só acompanhamento — quem marca é cada gestor.', onde: 'Painel do RH · "Agenda da empresa"' },
      { icone: '🎯', titulo: 'Matrix 9-box da empresa', descricao: 'Todos os liderados no 9-box (desempenho × potencial), com destaques, em atenção e quem ainda falta classificar.', onde: 'Painel do RH · "Matrix9-Box da empresa"' },
      { icone: '✨', titulo: 'IA da empresa (sua chave)', descricao: 'Conecte Claude, ChatGPT, DeepSeek ou Grok colando sua chave. A chave é cifrada e nunca aparece de volta.', onde: 'Perfil · "Sua IA"' },
      { icone: '🤖', titulo: 'Gestores herdam sua IA', descricao: 'A IA que você conecta fica disponível automaticamente para todos os gestores que ainda não conectaram a própria.', onde: 'Perfil · aviso na seção "Sua IA"' },
    ],
    faq: [
      { pergunta: 'O que acontece quando eu cadastro um gestor?', resposta: 'Ele ganha uma conta com a empresa já montada e, ao entrar, monta o próprio time e faz os 1:1.' },
      { pergunta: 'Eu marco ou remarco os 1:1?', resposta: 'Não — a agenda e a Matrix do RH são só para acompanhar; quem agenda e classifica é cada gestor.' },
      { pergunta: 'Por que os indicadores de um gestor estão zerados?', resposta: 'Porque ele ainda não montou a agenda de 1:1; os números aparecem assim que ele começa.' },
      { pergunta: 'Preciso pagar pela IA?', resposta: 'Não — você usa sua própria conta de IA (Claude, ChatGPT, DeepSeek ou Grok) colando a chave.' },
      { pergunta: 'Meus gestores precisam configurar IA?', resposta: 'Não: se você conectar uma IA, todos herdam a sua; eles podem conectar a própria se quiserem.' },
    ],
  },

  LIDER: {
    papel: 'LIDER',
    rotulo: 'Gestor',
    emoji: '🧭',
    titulo: 'Manual do Gestor',
    promessa:
      'Monte seu time, conduza 1:1 ao vivo e acompanhe cada liderado de perto — tudo num lugar só, sem virar burocracia.',
    inicio_rapido: [
      { emoji: '🏢', titulo: 'Crie sua organização', descricao: 'No primeiro acesso, dê um nome à sua empresa e o sistema já cria uma equipe inicial pra você.' },
      { emoji: '🗂️', titulo: 'Monte o time', descricao: 'Na Estrutura, crie equipes e adicione liderados (nome + e-mail) direto na coluna, sem abrir telas.' },
      { emoji: '🗓️', titulo: 'Agende o 1:1', descricao: 'Na Agenda, clique num dia, escolha o liderado e a recorrência (semanal, quinzenal, mensal).' },
      { emoji: '▶️', titulo: 'Conduza ao vivo', descricao: 'Abra o 1:1 do liderado (botão 1:1): arraste os temas, registre conteúdo e encerre com resumo.' },
      { emoji: '📜', titulo: 'Acompanhe o Dossiê', descricao: 'No 📜 de cada liderado veja humor, engajamento, 9-box, PDI e a linha do tempo completa.' },
    ],
    recursos: [
      { icone: '🗂️', titulo: 'Estrutura do time', descricao: 'Crie equipes e adicione liderados na própria coluna. Arraste um liderado de uma equipe para outra e já fica salvo. Importe vários por CSV (📥).', onde: 'Painel inicial · "Estrutura do time"' },
      { icone: '▶️', titulo: '1:1 ao vivo', descricao: 'Você e o liderado entram na mesma sala: arrastam temas entre Banco / Pauta de hoje / Conversado e veem o cursor um do outro em tempo real. Cada tema abre o conteúdo (textos, links, imagens, marcos).', onde: 'Botão "1:1" no liderado' },
      { icone: '✅', titulo: 'Encerrar o 1:1', descricao: 'Ao terminar, registre um resumo e os próximos passos. Vira histórico, conta como reunião realizada (alimenta saúde e streak) e congela a pauta para consulta.', onde: 'Botão "✅ Encerrar 1:1" na sala' },
      { icone: '📊', titulo: 'Acompanhamento', descricao: 'Registre por abas o sentimento da semana (humor 1 a 5), entregas, feedbacks recebidos e estudos. Tem gráfico de humor e exportar PDF.', onde: 'Botão 📊 no liderado' },
      { icone: '🎯', titulo: 'PDI', descricao: 'Defina objetivos de desenvolvimento com prazo, marque como concluídos e acompanhe o progresso. Avisa atrasados e quanto falta pra cada prazo.', onde: 'Botão 🎯 no liderado' },
      { icone: '🔲', titulo: 'Matrix 9-Box', descricao: 'Arraste cada liderado para o quadrante de desempenho × potencial. Filtra por equipe, mostra destaques e quem precisa de atenção, exporta PDF.', onde: 'Painel · 9-Box (ou /matrix9-box)' },
      { icone: '🗓️', titulo: 'Agenda com recorrência', descricao: 'Calendário dos 1:1: clique num dia para marcar (com término por data ou nº de vezes), arraste um chip para remarcar e cancele um ou todos de um liderado. Lembrete por e-mail.', onde: 'Página Agenda · "Seus 1:1"' },
      { icone: '✉️', titulo: 'Convidar o liderado', descricao: 'Gera um link + código para o liderado criar a própria senha e acessar o app. O código aparece uma vez só e o convite expira em 7 dias.', onde: 'Botão "Convidar" no liderado' },
      { icone: '📜', titulo: 'Dossiê do liderado', descricao: 'Página inteira com indicadores comportamentais (humor, engajamento, 9-box, PDI) e a linha do tempo de tudo que aconteceu com aquela pessoa.', onde: 'Botão 📜 no liderado' },
      { icone: '✨', titulo: 'IA (sua chave – BYOK)', descricao: 'Conecte sua conta de IA (Claude, ChatGPT, DeepSeek ou Grok); ela é cifrada e nunca volta. Gera overview, sugestão de pauta, rascunho de feedback/PDI. Se o RH já conectou uma IA, você a usa sem chave própria.', onde: 'Perfil · "Sua IA" e botão ✨' },
    ],
    faq: [
      { pergunta: 'Qual a diferença entre "Desligar" e "Remover" um liderado?', resposta: 'Desligar (o toggle) só inativa, preservando o histórico; o ✕ remove de vez — use desligar quando a pessoa sai da empresa.' },
      { pergunta: 'Por que o cartão de um liderado fica piscando em âmbar?', resposta: 'É o aviso de que ele ainda não tem conta — clique em "Convidar" para gerar o link e o código.' },
      { pergunta: 'Preciso pagar pela IA?', resposta: 'Não. Você conecta a sua própria conta de IA (BYOK) no Perfil, ou usa a que o seu RH já configurou.' },
      { pergunta: 'O liderado também participa do 1:1 ao vivo?', resposta: 'Sim: vocês entram na mesma sala e veem em tempo real os temas se movendo e o cursor um do outro.' },
      { pergunta: 'O que acontece quando eu encerro um 1:1?', resposta: 'O resumo vira histórico, a reunião conta como realizada (sobe a saúde e o streak) e a pauta fica só pra consulta.' },
      { pergunta: 'Posso cancelar todos os 1:1 de um liderado de uma vez?', resposta: 'Sim, no detalhe de um 1:1 há "Cancelar todos" — útil quando a pessoa deixa a empresa.' },
    ],
  },

  COLABORADOR: {
    papel: 'COLABORADOR',
    rotulo: 'Liderado',
    emoji: '❤️',
    titulo: 'Manual do Liderado',
    promessa: 'Você participa das suas conversas 1:1 com o gestor ao vivo, sem precisar configurar nada.',
    inicio_rapido: [
      { emoji: '📩', titulo: 'Abra o convite', descricao: 'Clique no link que seu gestor te enviou para abrir a tela de convite.' },
      { emoji: '🔑', titulo: 'Código e senha', descricao: 'Informe o código de 6 letras/números do convite e escolha uma senha (mínimo 6 caracteres).' },
      { emoji: '🎉', titulo: 'Já entra logado', descricao: 'Ao aceitar, sua conta fica pronta na hora e você entra direto, sem novo login.' },
      { emoji: '❤️', titulo: 'Vá pro seu 1:1', descricao: 'Clique em OneByOne ❤️ no menu e você cai direto na pauta do seu próprio 1:1.' },
    ],
    recursos: [
      { icone: '📩', titulo: 'Aceitar o convite', descricao: 'Use o link do gestor, o código de 6 caracteres e crie sua senha. Seu e-mail já vem preenchido.', onde: 'Link /convite (tela pública)' },
      { icone: '❤️', titulo: 'Entrar no seu 1:1', descricao: 'Você não escolhe ninguém: ao abrir o OneByOne, vai direto para a pauta do seu próprio 1:1.', onde: 'Menu OneByOne ❤️' },
      { icone: '🟢', titulo: 'Estar ao vivo com o gestor', descricao: 'Vocês dois entram na mesma sala ao mesmo tempo. A bolinha verde mostra quem está presente agora.', onde: 'Topo da pauta do 1:1' },
      { icone: '🧩', titulo: 'Mexer no tabuleiro de temas', descricao: 'Arraste os temas da pauta e o gestor vê o movimento na hora, em tempo real.', onde: 'Tabuleiro da pauta' },
      { icone: '✍️', titulo: 'Montar o conteúdo de um tema', descricao: 'Abra um tema para adicionar textos, links, imagens e marcos com datas.', onde: 'Botão Abrir em cada tema' },
      { icone: '🖱️', titulo: 'Ver os cursores ao vivo', descricao: 'O cursor do gestor aparece se mexendo na tela, e o seu aparece pra ele.', onde: 'Na própria pauta do 1:1' },
      { icone: '👤', titulo: 'Seu perfil e foto', descricao: 'Ajuste seu nome, foto e senha quando quiser.', onde: 'Sua foto no canto superior direito' },
      { icone: '🔔', titulo: 'Sino de avisos', descricao: 'Acompanhe notificações pelo sininho no topo da tela.', onde: 'Topo, ao lado do seu nome' },
    ],
    faq: [
      { pergunta: 'Preciso montar equipe ou criar o 1:1?', resposta: 'Não. Quem monta a estrutura e cria o 1:1 é o gestor; você só participa.' },
      { pergunta: 'Onde fica o link do convite?', resposta: 'Seu gestor te envia o link e o código de 6 caracteres por fora (e-mail, mensagem etc.).' },
      { pergunta: 'O convite diz que expirou. E agora?', resposta: 'Convites têm validade e uso único; é só pedir um novo ao seu gestor.' },
      { pergunta: 'Posso encerrar o 1:1?', resposta: 'Não. Só o gestor encerra; depois disso a pauta fica em modo consulta para os dois.' },
      { pergunta: 'Disse que não estou vinculado a um 1:1.', resposta: 'Peça ao seu gestor para te adicionar à equipe; assim seu acesso passa a abrir o 1:1.' },
    ],
  },
}

// Legenda de ícones (a "cola" visual dos botões do gestor na Estrutura/topo).
export const LEGENDA: ItemLegenda[] = [
  { icone: '1:1', nome: '1:1', oquefaz: 'Abre a tela do liderado para conduzir a reunião one-on-one.' },
  { icone: '✨', nome: 'IA', oquefaz: 'Abre a IA do liderado: visão geral, sugestão de pauta e feedback.' },
  { icone: '📊', nome: 'Acompanhamento', oquefaz: 'Sentimento, entregas, feedbacks e estudos do liderado.' },
  { icone: '🎯', nome: 'PDI', oquefaz: 'Plano de Desenvolvimento Individual (objetivos e metas).' },
  { icone: '📜', nome: 'Dossiê', oquefaz: 'Indicadores comportamentais + linha do tempo do liderado.' },
  { icone: '✉️', nome: 'Convidar', oquefaz: 'Só para quem não tem conta; envia o convite de acesso.' },
  { icone: '🟢', nome: 'Ativo/Inativo', oquefaz: 'Chavinha que liga (ativo) ou desliga (inativo) na hora.' },
  { icone: '✕', nome: 'Remover', oquefaz: 'Remove o liderado de vez (pede confirmação).' },
  { icone: '🔀', nome: 'Mover equipe', oquefaz: 'No celular, troca de equipe pelo seletor (no PC é arrastar).' },
  { icone: '📥', nome: 'Importar', oquefaz: 'Adiciona vários liderados de uma vez via CSV.' },
  { icone: '▦', nome: 'Cartões / Lista', oquefaz: 'Alterna entre ver o time em cartões ou em lista.' },
  { icone: '➕', nome: 'Criar / Adicionar', oquefaz: 'Cria uma equipe ou adiciona um liderado sem janela extra.' },
]
