// Arquivo: src/componentes/ia/PainelIALiderado.tsx
// Descrição: Painel de IA sobre UM liderado (visão do gestor). Reúne o contexto
//            real (9-box + conteúdo dos temas) e pede à IA do gestor (BYOK):
//            overview, sugestão de pauta do próximo 1:1, ou rascunho de
//            feedback/PDI. Tudo via POST /ia/chat — sem novo backend.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { listarTodosBlocos } from '@/recursos/conteudo/conteudoApi'
import type { Bloco } from '@/recursos/conteudo/conteudoApi'
import { useChatIA, useConfigIA } from '@/recursos/ia/iaApi'
import { useClassificacoes } from '@/recursos/classificacao/classificacaoApi'
import { extrairMensagemErro } from '@/lib/api'
import { Drawer } from '@/componentes/ui/Drawer'

interface Props {
  colaboradorId: string
  nome: string
  organizacaoId: string
  aoFechar: () => void
}

const nivelTexto: Record<string, string> = { BAIXO: 'baixo', MEDIO: 'médio', ALTO: 'alto' }

// Resume os blocos em texto legível para a IA.
function digestBlocos(blocos: Bloco[]): string {
  if (blocos.length === 0) return 'Ainda não há conteúdo registrado nos temas.'
  const porTema: Record<string, Bloco[]> = {}
  for (const b of blocos) (porTema[b.tema] ??= []).push(b)
  return Object.entries(porTema)
    .map(([tema, bs]) => {
      const itens = bs
        .map((b) => {
          if (b.tipo === 'TEXTO') return `  - ${b.texto}`
          if (b.tipo === 'LINK') return `  - Curso/link: ${b.texto || b.url}`
          if (b.tipo === 'IMAGEM') return `  - [imagem]${b.texto ? ': ' + b.texto : ''}`
          if (b.tipo === 'MARCO')
            return `  - Marco: ${b.texto}${b.data_inicio ? ` (${b.data_inicio}${b.data_fim ? ' a ' + b.data_fim : ''})` : ''}`
          return ''
        })
        .filter(Boolean)
        .join('\n')
      return `Tema "${tema}":\n${itens}`
    })
    .join('\n\n')
}

const ACOES = [
  {
    id: 'overview',
    rotulo: '🔮 Overview',
    instrucao:
      'Faça um OVERVIEW deste liderado: como ele está, pontos fortes, sinais de atenção e 2-3 sugestões práticas para o gestor no próximo 1:1. Use tópicos curtos, tom gentil e direto.',
  },
  {
    id: 'pauta',
    rotulo: '🗓️ Sugerir pauta',
    instrucao:
      'Sugira uma PAUTA para o próximo 1:1 com este liderado: 4 a 5 itens (temas e perguntas) personalizados pelos dados. Tópicos curtos.',
  },
  {
    id: 'feedback',
    rotulo: '📝 Feedback + PDI',
    instrucao:
      'Escreva um rascunho de FEEDBACK construtivo e um esboço de PDI (2-3 objetivos com ações e prazo sugerido) para este liderado, com base nos dados. Tom profissional e acolhedor.',
  },
]

export function PainelIALiderado({ colaboradorId, nome, organizacaoId, aoFechar }: Props) {
  const configQ = useConfigIA()
  const classificacoesQ = useClassificacoes(organizacaoId)
  const chat = useChatIA()

  const [blocos, setBlocos] = useState<Bloco[]>([])
  const [resultado, setResultado] = useState('')
  const [acaoAtiva, setAcaoAtiva] = useState('')

  const temIA = configQ.data?.tem_chave ?? false

  useEffect(() => {
    listarTodosBlocos(colaboradorId).then(setBlocos).catch(() => setBlocos([]))
  }, [colaboradorId])

  function contexto(): string {
    const cl = (classificacoesQ.data ?? []).find((c) => c.colaborador_id === colaboradorId)
    const noveBox = cl
      ? `9-box: desempenho ${nivelTexto[cl.desempenho]}, potencial ${nivelTexto[cl.potencial]}.`
      : '9-box: ainda não classificado.'
    return `Liderado: ${nome}\n${noveBox}\n\nConteúdo dos temas do 1:1:\n${digestBlocos(blocos)}`
  }

  async function rodar(acaoId: string, instrucao: string) {
    setAcaoAtiva(acaoId)
    setResultado('')
    try {
      const r = await chat.mutateAsync(`${instrucao}\n\nDADOS DO LIDERADO:\n${contexto()}`)
      setResultado(r)
    } catch (err) {
      setResultado(`⚠️ ${extrairMensagemErro(err)}`)
    }
  }

  return (
    <Drawer aoFechar={aoFechar} largura="max-w-lg">
      {(fechar) => (
        <>
          <header className="gradiente-marca flex items-center justify-between px-5 py-4 text-white">
            <span className="fonte-display font-bold">✨ IA · {nome.split(' ')[0]}</span>
            <button type="button" onClick={fechar} aria-label="Fechar" className="text-white/80 hover:text-white">✕</button>
          </header>

          {!temIA ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <span className="text-4xl">🔌</span>
              <p className="text-tinta-suave">Conecte sua IA no perfil para usar estes recursos.</p>
              <Link to="/perfil" className="rounded-full gradiente-marca px-4 py-2 text-sm font-bold text-white">Conectar IA</Link>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 border-b border-borda p-4">
                {ACOES.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => rodar(a.id, a.instrucao)}
                    disabled={chat.isPending}
                    className={[
                      'rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition disabled:opacity-50',
                      acaoAtiva === a.id ? 'border-juncao bg-juncao/10 text-juncao' : 'border-borda text-tinta hover:border-juncao',
                    ].join(' ')}
                  >
                    {a.rotulo}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {chat.isPending ? (
                  <p className="text-center text-tinta-suave">A IA está analisando o liderado…</p>
                ) : resultado ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-tinta">{resultado}</p>
                ) : (
                  <p className="text-center text-sm text-tinta-suave">
                    Escolha uma ação acima. A IA usa o 9-box e o conteúdo dos temas deste liderado.
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </Drawer>
  )
}
