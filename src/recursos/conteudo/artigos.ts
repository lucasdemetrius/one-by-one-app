// Arquivo: src/recursos/conteudo/artigos.ts
// Descrição: Conteúdo (dados puros) das páginas públicas da Central de Conteúdo — a
//            base de SEO do TeamBOX. Cada artigo é um objeto tipado (título, resumo,
//            palavras-chave, seções e FAQ). As páginas /conteudo e /conteudo/:slug
//            renderizam a partir daqui, e o sitemap é gerado a partir dos slugs.
//
//            Para escalar para 30+ páginas, basta adicionar novos objetos a ARTIGOS.

export interface SecaoArtigo {
  titulo: string
  paragrafos: string[]
}

export interface PerguntaFAQ {
  pergunta: string
  resposta: string
}

export interface Artigo {
  slug: string
  titulo: string
  resumo: string
  categoria: string
  palavrasChave: string[]
  atualizadoEm: string // ISO (AAAA-MM-DD)
  leituraMin: number
  secoes: SecaoArtigo[]
  faq: PerguntaFAQ[]
}

export const ARTIGOS: Artigo[] = [
  {
    slug: 'o-que-e-1-1-one-on-one',
    titulo: 'O que é 1:1 (one-on-one) e por que toda liderança deveria fazer',
    resumo:
      'A reunião 1:1 (one-on-one) é a conversa periódica entre líder e liderado. Entenda o que é, para que serve e como ela melhora engajamento, retenção e desempenho.',
    categoria: 'Gestão de pessoas',
    palavrasChave: ['1:1', 'one on one', 'reunião individual', 'gestão de pessoas', 'liderança'],
    atualizadoEm: '2026-07-01',
    leituraMin: 6,
    secoes: [
      {
        titulo: 'O que é uma reunião 1:1',
        paragrafos: [
          'A reunião 1:1 (do inglês one-on-one) é um encontro periódico e recorrente entre um líder e cada pessoa do seu time, feito individualmente. Diferente das reuniões de status ou de projeto, o 1:1 pertence ao liderado: é o espaço dele para falar de carreira, dificuldades, expectativas e do que precisa para trabalhar melhor.',
          'A cadência mais comum é semanal ou quinzenal, com 30 a 60 minutos. O que faz o 1:1 funcionar não é a duração, e sim a regularidade: uma conversa curta toda semana constrói mais confiança do que uma reunião longa a cada trimestre.',
        ],
      },
      {
        titulo: 'Para que serve o 1:1',
        paragrafos: [
          'O 1:1 tem três funções principais: construir relação de confiança, antecipar problemas antes que virem crises e acompanhar o desenvolvimento da pessoa ao longo do tempo.',
          'É no 1:1 que o líder percebe sinais de desmotivação, sobrecarga ou conflito cedo — quando ainda dá para agir. E é onde o liderado recebe feedback contínuo, alinha prioridades e sente que a carreira dele importa para a empresa.',
        ],
      },
      {
        titulo: 'Por que o 1:1 melhora resultados',
        paragrafos: [
          'Times com 1:1 consistentes tendem a ter maior engajamento e menor rotatividade. A razão é simples: as pessoas ficam onde se sentem ouvidas e enxergam evolução. A conversa individual é o principal canal para isso.',
          'Além da retenção, o 1:1 melhora a execução: ao alinhar prioridades toda semana, o time gasta menos energia no que não importa e o líder corrige o rumo antes de o trabalho seguir na direção errada.',
        ],
      },
      {
        titulo: 'Erros comuns que esvaziam o 1:1',
        paragrafos: [
          'O erro mais frequente é transformar o 1:1 em reunião de status ("o que você entregou esta semana?"). Isso já cabe em outros rituais. O 1:1 deve olhar para a pessoa, não só para as tarefas.',
          'Outros erros: cancelar sempre que a agenda aperta (sinaliza que a pessoa não é prioridade), o líder falar 90% do tempo, e não registrar nada — sem histórico, cada conversa recomeça do zero e nada de combinado é cobrado.',
        ],
      },
      {
        titulo: 'Como o TeamBOX ajuda',
        paragrafos: [
          'O TeamBOX organiza seus 1:1 por liderado: você agenda com recorrência, segue um roteiro de pauta, registra o que foi conversado e acompanha a evolução (humor, entregas, feedbacks, PDI e a matriz 9-box) reunião após reunião.',
          'Assim o histórico não se perde, os combinados viram acompanhamento e você enxerga tendências do time inteiro — não só a foto de uma semana.',
        ],
      },
    ],
    faq: [
      {
        pergunta: 'Qual a frequência ideal de um 1:1?',
        resposta:
          'Semanal ou quinzenal para a maioria dos times. O mais importante é manter a regularidade — uma conversa curta e constante vale mais do que uma longa e esporádica.',
      },
      {
        pergunta: 'Quanto tempo deve durar um 1:1?',
        resposta:
          'Entre 30 e 60 minutos. Times novos ou em momentos delicados pedem mais tempo; relações já maduras funcionam bem com 30 minutos focados.',
      },
      {
        pergunta: 'Quem conduz a reunião 1:1?',
        resposta:
          'A pauta pertence ao liderado, mas o líder é responsável por garantir que o encontro aconteça, ouvir mais do que falar e dar continuidade aos combinados.',
      },
    ],
  },
  {
    slug: 'matriz-9-box-nine-box',
    titulo: 'Matriz 9-Box (Nine Box): o guia completo de desempenho e potencial',
    resumo:
      'A matriz 9-box (nine box) cruza desempenho e potencial em 9 quadrantes para mapear talentos, riscos e sucessão. Veja como montar, ler e usar a sua.',
    categoria: 'Avaliação de desempenho',
    palavrasChave: ['9-box', 'nine box', 'matriz 9 box', 'desempenho e potencial', 'gestão de talentos', 'sucessão'],
    atualizadoEm: '2026-07-01',
    leituraMin: 7,
    secoes: [
      {
        titulo: 'O que é a matriz 9-box',
        paragrafos: [
          'A matriz 9-box (ou nine box) é uma ferramenta de gestão de talentos que posiciona cada pessoa em uma grade de 9 quadrantes, cruzando dois eixos: desempenho (o que a pessoa entrega hoje) e potencial (o quanto pode crescer).',
          'Cada eixo é dividido em três níveis — baixo, médio e alto — gerando 9 combinações. O resultado é um mapa visual do time que revela onde estão os talentos-chave, quem precisa de atenção e onde há risco.',
        ],
      },
      {
        titulo: 'Os dois eixos: desempenho x potencial',
        paragrafos: [
          'Desempenho é a entrega consistente no papel atual: resultados, qualidade e comportamento no dia a dia. É relativamente objetivo e olha para o presente e o passado recente.',
          'Potencial é a capacidade de assumir desafios maiores no futuro — aprendizado rápido, ambição, capacidade de lidar com complexidade e de liderar. É mais subjetivo, por isso deve ser avaliado com critérios claros para evitar viés.',
        ],
      },
      {
        titulo: 'Os 9 quadrantes e o que fazer com cada um',
        paragrafos: [
          'Alto desempenho + alto potencial são as "estrelas": invista, desafie e prepare para sucessão. Alto potencial com desempenho ainda médio ou baixo são "enigmas" e "fortes potenciais": precisam de oportunidade e desenvolvimento direcionado.',
          'Alto desempenho com potencial menor são os "especialistas" e "mantenedores": pilares do time, essenciais para reconhecer e reter. O quadrante de baixo desempenho e baixo potencial pede atenção: entenda a causa, dê feedback claro e um plano — ou tome a decisão difícil.',
        ],
      },
      {
        titulo: 'Como fazer sua matriz 9-box',
        paragrafos: [
          'Defina critérios objetivos para cada eixo antes de avaliar, calibre as notas com outros líderes para reduzir viés, e posicione cada pessoa no quadrante correspondente. Trate o resultado como ponto de partida de conversa, não como rótulo definitivo.',
          'A 9-box não é para engavetar: use-a para orientar PDIs, decisões de promoção, planos de sucessão e conversas de carreira nos 1:1. E refaça periodicamente — as pessoas evoluem.',
        ],
      },
      {
        titulo: 'A 9-box no TeamBOX',
        paragrafos: [
          'No TeamBOX a matriz 9-box é interativa: você arrasta cada liderado para o quadrante, filtra por equipe, vê destaques e riscos na hora e exporta em PDF. O posicionamento fica salvo e evolui junto com os 1:1 e o PDI de cada pessoa.',
        ],
      },
    ],
    faq: [
      {
        pergunta: 'Qual a diferença entre desempenho e potencial?',
        resposta:
          'Desempenho é a entrega no papel atual (presente); potencial é a capacidade de crescer e assumir desafios maiores no futuro. A 9-box cruza os dois.',
      },
      {
        pergunta: 'Com que frequência revisar a 9-box?',
        resposta:
          'Normalmente a cada 6 a 12 meses, ou após ciclos de avaliação. O importante é revisar com regularidade, porque as pessoas mudam de quadrante ao longo do tempo.',
      },
      {
        pergunta: 'A 9-box serve para demitir?',
        resposta:
          'Não é esse o objetivo. Ela orienta desenvolvimento, reconhecimento e sucessão. O quadrante mais baixo pede investigação da causa e um plano — a decisão de desligamento é a última etapa, não a primeira.',
      },
    ],
  },
  {
    slug: 'como-fazer-reuniao-1-1',
    titulo: 'Como conduzir uma reunião 1:1: roteiro, perguntas e erros a evitar',
    resumo:
      'Um roteiro prático de reunião 1:1: como se preparar, perguntas poderosas para fazer, como registrar combinados e os erros que esvaziam o encontro.',
    categoria: 'Gestão de pessoas',
    palavrasChave: ['reunião 1:1', 'roteiro 1:1', 'perguntas one on one', 'pauta 1:1', 'liderança'],
    atualizadoEm: '2026-07-01',
    leituraMin: 6,
    secoes: [
      {
        titulo: 'Antes do 1:1: preparação',
        paragrafos: [
          'Um bom 1:1 começa antes da reunião. Revise o que ficou combinado da última vez, anote os pontos que você quer trazer e deixe claro que a pauta é compartilhada — o liderado também deve chegar com os temas dele.',
          'Reserve o horário como algo inegociável. Cancelar 1:1 com frequência é a forma mais rápida de sinalizar que a pessoa não é prioridade.',
        ],
      },
      {
        titulo: 'Um roteiro simples que funciona',
        paragrafos: [
          'Comece pelo check-in humano ("como você está?"), depois passe para os temas do liderado, em seguida os seus, revisite os combinados anteriores e feche com os próximos passos. Esse fluxo garante que a conversa não vire só status de tarefas.',
          'Guarde os últimos minutos para carreira e desenvolvimento pelo menos uma vez por mês. É o que diferencia um 1:1 de uma reunião operacional.',
        ],
      },
      {
        titulo: 'Perguntas poderosas para o 1:1',
        paragrafos: [
          'Boas perguntas abrem a conversa: "O que está te travando esta semana?", "O que eu poderia fazer para te ajudar mais?", "Do que você tem mais orgulho recentemente?", "Como você está se sentindo em relação ao seu crescimento aqui?".',
          'Evite perguntas de sim/não. O objetivo é ouvir — se você está falando mais do que o liderado, o 1:1 saiu do trilho.',
        ],
      },
      {
        titulo: 'Registre e dê continuidade',
        paragrafos: [
          'Sem registro, cada 1:1 recomeça do zero e nada é cobrado. Anote os combinados, quem faz o quê e até quando. Na reunião seguinte, comece revisitando esses pontos.',
          'O registro também constrói memória de carreira: com o histórico, a conversa de promoção ou de feedback fica baseada em fatos, não em impressões da última semana.',
        ],
      },
      {
        titulo: 'Faça o 1:1 no TeamBOX',
        paragrafos: [
          'No TeamBOX você monta a pauta a partir de templates, conduz o 1:1 ao vivo lado a lado com o liderado, registra as respostas por bloco e acompanha humor, entregas e feedbacks reunião após reunião — com a agenda e os lembretes já integrados.',
        ],
      },
    ],
    faq: [
      {
        pergunta: 'O que falar em um 1:1?',
        resposta:
          'Comece com um check-in pessoal, depois os temas do liderado, seus pontos, a revisão dos combinados anteriores e os próximos passos. Reserve espaço para carreira ao menos uma vez por mês.',
      },
      {
        pergunta: 'Como não transformar o 1:1 em reunião de status?',
        resposta:
          'Priorize a pauta do liderado e temas de pessoas e carreira. Status de tarefas cabe em outros rituais; o 1:1 é sobre a pessoa.',
      },
      {
        pergunta: 'Preciso registrar o 1:1?',
        resposta:
          'Sim. Sem registro, os combinados se perdem e não há acompanhamento. Anotar cria memória, continuidade e uma base justa para feedback e promoção.',
      },
    ],
  },
  {
    slug: 'pdi-plano-de-desenvolvimento-individual',
    titulo: 'PDI: como montar um Plano de Desenvolvimento Individual que funciona',
    resumo:
      'O PDI (Plano de Desenvolvimento Individual) organiza objetivos, prazos e ações de crescimento de cada pessoa. Veja como criar um PDI prático e acompanhá-lo.',
    categoria: 'Desenvolvimento',
    palavrasChave: ['PDI', 'plano de desenvolvimento individual', 'desenvolvimento de carreira', 'metas', 'gestão de pessoas'],
    atualizadoEm: '2026-07-01',
    leituraMin: 6,
    secoes: [
      {
        titulo: 'O que é PDI',
        paragrafos: [
          'PDI é a sigla de Plano de Desenvolvimento Individual: um plano combinado entre líder e liderado com os objetivos de crescimento da pessoa, as ações para chegar lá e os prazos de cada etapa.',
          'É a ponte entre a conversa de carreira e a prática. Sem PDI, "quero crescer" fica só na intenção; com PDI, vira metas concretas e acompanháveis.',
        ],
      },
      {
        titulo: 'Como montar um PDI em passos',
        paragrafos: [
          'Comece pelo destino: onde a pessoa quer chegar e quais competências isso exige. Depois faça o diagnóstico do ponto atual (o que já domina e o que falta). A diferença entre os dois é a agenda de desenvolvimento.',
          'Traduza essa diferença em objetivos claros, cada um com ações específicas e prazo. Bons objetivos são poucos e focados — dois ou três bem trabalhados valem mais do que uma lista longa que ninguém acompanha.',
        ],
      },
      {
        titulo: 'A regra 70-20-10',
        paragrafos: [
          'Uma referência útil: cerca de 70% do desenvolvimento vem da prática (projetos desafiadores, novas responsabilidades), 20% de aprender com outras pessoas (mentoria, feedback) e 10% de educação formal (cursos, leituras).',
          'Isso evita o erro clássico de reduzir o PDI a "fazer um curso". A maior parte do crescimento acontece no trabalho real, com desafios e feedback.',
        ],
      },
      {
        titulo: 'Acompanhe o PDI nos 1:1',
        paragrafos: [
          'Um PDI que não é revisitado morre. Traga o plano para os 1:1: revise o progresso, remova obstáculos e ajuste prazos quando a realidade mudar. O acompanhamento constante é o que separa um PDI vivo de um documento esquecido.',
          'Conecte o PDI à matriz 9-box: o quadrante da pessoa aponta o foco (potencial a desenvolver, desempenho a consolidar) e o PDI vira o caminho prático para mudar de quadrante.',
        ],
      },
      {
        titulo: 'PDI no TeamBOX',
        paragrafos: [
          'No TeamBOX cada liderado tem seu PDI com objetivos e prazos, visível junto ao histórico de 1:1, ao humor, às entregas e à posição na 9-box. Assim o desenvolvimento deixa de ser um documento à parte e passa a andar com o dia a dia da liderança.',
        ],
      },
    ],
    faq: [
      {
        pergunta: 'Qual a diferença entre PDI e meta de desempenho?',
        resposta:
          'Meta de desempenho olha para a entrega no papel atual; o PDI olha para o crescimento da pessoa (competências e carreira). Eles se complementam.',
      },
      {
        pergunta: 'Quantos objetivos um PDI deve ter?',
        resposta:
          'Poucos e focados — geralmente dois ou três. É melhor concluir alguns objetivos bem escolhidos do que não acompanhar uma lista longa.',
      },
      {
        pergunta: 'De quem é a responsabilidade pelo PDI?',
        resposta:
          'É compartilhada: o liderado é o dono do próprio desenvolvimento, e o líder apoia, remove obstáculos e acompanha nos 1:1.',
      },
    ],
  },
  {
    slug: 'feedback-continuo-como-dar-e-receber',
    titulo: 'Feedback contínuo: como dar e receber feedback no dia a dia',
    resumo:
      'Feedback contínuo é dar retorno perto do fato, não só na avaliação anual. Veja técnicas práticas (SBI, feed-forward) para dar e receber feedback sem desgaste.',
    categoria: 'Feedback',
    palavrasChave: ['feedback', 'feedback contínuo', 'como dar feedback', 'SBI', 'cultura de feedback'],
    atualizadoEm: '2026-07-01',
    leituraMin: 6,
    secoes: [
      {
        titulo: 'O que é feedback contínuo',
        paragrafos: [
          'Feedback contínuo é a prática de dar retorno de forma frequente e próxima do fato, em vez de acumular tudo para a avaliação anual. Quanto menor a distância entre o acontecimento e o feedback, mais útil e menos ameaçador ele é.',
          'A avaliação de fim de ano deixa de ter surpresas quando o feedback já aconteceu ao longo do caminho, nos 1:1 e no dia a dia.',
        ],
      },
      {
        titulo: 'Como dar feedback: o modelo SBI',
        paragrafos: [
          'Um modelo simples e eficaz é o SBI: Situação (quando/onde), Comportamento (o que a pessoa fez, de forma observável) e Impacto (o efeito que aquilo teve). Ex.: "Na reunião de ontem (S), quando você interrompeu o cliente (C), ele parou de trazer as objeções dele (I)".',
          'Falar de comportamento observável — e não de traços de personalidade — torna o feedback específico e acionável, e evita que a pessoa se sinta atacada.',
        ],
      },
      {
        titulo: 'Feedback positivo também é feedback',
        paragrafos: [
          'Reconhecer o que foi bem, com a mesma especificidade, reforça os comportamentos certos e constrói a confiança necessária para as conversas difíceis. Feedback só corretivo desgasta; a proporção deve pender para o reconhecimento genuíno.',
          'Elogio vago ("mandou bem!") ajuda pouco. Diga exatamente o que a pessoa fez e o impacto — assim ela sabe o que repetir.',
        ],
      },
      {
        titulo: 'Como receber feedback',
        paragrafos: [
          'Receber bem é uma habilidade: ouça sem interromper, faça perguntas para entender, agradeça e dê um tempo antes de reagir. Nem todo feedback é justo, mas quase todo carrega um dado útil sobre como você foi percebido.',
          'Como líder, peça feedback sobre você mesmo nos 1:1. Isso dá o exemplo e cria segurança para o time falar abertamente.',
        ],
      },
      {
        titulo: 'Feedback no TeamBOX',
        paragrafos: [
          'No TeamBOX o feedback fica registrado no acompanhamento de cada liderado, junto do humor, das entregas e dos estudos. Com o histórico, a avaliação deixa de depender da memória recente e passa a refletir o ano inteiro — de forma justa e baseada em fatos.',
        ],
      },
    ],
    faq: [
      {
        pergunta: 'O que é o modelo SBI de feedback?',
        resposta:
          'SBI significa Situação, Comportamento e Impacto. Você descreve quando aconteceu, o que a pessoa fez (observável) e o efeito disso — deixando o feedback específico e acionável.',
      },
      {
        pergunta: 'Com que frequência dar feedback?',
        resposta:
          'O mais perto possível do fato. A prática de feedback contínuo (frequente, no dia a dia e nos 1:1) é mais eficaz do que concentrar tudo na avaliação anual.',
      },
      {
        pergunta: 'Como dar feedback difícil sem desgastar a relação?',
        resposta:
          'Fale de comportamento observável e do impacto (modelo SBI), em particular, perto do fato e com intenção de ajudar. Equilibre com reconhecimento genuíno ao longo do tempo.',
      },
    ],
  },
]

// acharArtigo localiza um artigo pelo slug (usado na página /conteudo/:slug).
export function acharArtigo(slug: string): Artigo | undefined {
  return ARTIGOS.find((a) => a.slug === slug)
}
