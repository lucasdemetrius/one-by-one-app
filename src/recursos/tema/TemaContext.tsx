// Arquivo: src/recursos/tema/TemaContext.tsx
// Descrição: Contexto global do TEMA visual. Guarda o tema escolhido, persiste
//            no localStorage e aplica o atributo data-tema no <html> — o que faz
//            todo o sistema de design trocar de cara instantaneamente.
//
//            Temas disponíveis: 'coop' (padrão), 'brutalista', 'energetico'.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

// Identificadores dos temas (batem com os blocos data-tema no index.css).
export type Tema = 'encanto' | 'escuro' | 'tech' | 'coop' | 'brutalista' | 'energetico'

// Tema padrão do produto: o claro e encantador "encanto" (pensado para o RH).
export const TEMA_PADRAO: Tema = 'encanto'

// Metadados de cada tema, usados pelo seletor para exibir nome e amostra de cor.
export const TEMAS: {
  id: Tema
  nome: string
  descricao: string
  // Trio de cores (gestor, liderado, junção) para a "amostra" no seletor.
  amostra: [string, string, string]
}[] = [
  {
    id: 'encanto',
    nome: 'Encanto (claro)',
    descricao: 'Claro, premium e acolhedor. Gradiente alegre.',
    amostra: ['#6366f1', '#fb7185', '#8b5cf6'],
  },
  {
    id: 'escuro',
    nome: 'Escuro',
    descricao: 'Modo escuro neutro e limpo, acentos vibrantes.',
    amostra: ['#818cf8', '#fb7185', '#a78bfa'],
  },
  {
    id: 'tech',
    nome: 'Tech premium',
    descricao: 'Dark sofisticado, acento esmeralda. Moderno.',
    amostra: ['#4f9dff', '#ff8a4c', '#2ee6ad'],
  },
  {
    id: 'coop',
    nome: 'Co-op humano',
    descricao: 'Quente e terroso. Os dois lado a lado.',
    amostra: ['#1f6f6b', '#d9622b', '#b8893b'],
  },
  {
    id: 'brutalista',
    nome: 'Brutalista',
    descricao: 'Ousado, bordas pretas, sombras duras.',
    amostra: ['#2d5bff', '#ff5c39', '#7c3aed'],
  },
  {
    id: 'energetico',
    nome: 'Energético',
    descricao: 'Vibrante e divertido, cara de jogo.',
    amostra: ['#1cb0f6', '#ff9600', '#58cc02'],
  },
]

// Versionada: ao mudar o tema padrão, subir o sufixo reseta a escolha salva
// (assim quem já tinha um tema antigo cai no novo padrão e pode trocar depois).
const CHAVE_TEMA = 'onebyone.tema.v3'

interface ContextoTema {
  tema: Tema
  definirTema: (tema: Tema) => void
}

const TemaContext = createContext<ContextoTema | undefined>(undefined)

// Lê o tema salvo; cai no padrão se não houver ou for inválido.
function lerTemaSalvo(): Tema {
  const salvo = localStorage.getItem(CHAVE_TEMA) as Tema | null
  if (
    salvo === 'encanto' ||
    salvo === 'escuro' ||
    salvo === 'tech' ||
    salvo === 'coop' ||
    salvo === 'brutalista' ||
    salvo === 'energetico'
  ) {
    return salvo
  }
  return TEMA_PADRAO
}

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(lerTemaSalvo)

  // Aplica o tema no <html> e persiste sempre que mudar.
  useEffect(() => {
    document.documentElement.dataset.tema = tema
    localStorage.setItem(CHAVE_TEMA, tema)
  }, [tema])

  const definirTema = useCallback((novo: Tema) => setTema(novo), [])

  const valor = useMemo<ContextoTema>(
    () => ({ tema, definirTema }),
    [tema, definirTema],
  )

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>
}

// useTema dá acesso ao tema atual e à ação de troca em qualquer componente.
// eslint-disable-next-line react-refresh/only-export-components
export function useTema(): ContextoTema {
  const contexto = useContext(TemaContext)
  if (!contexto) {
    throw new Error('useTema precisa estar dentro de <TemaProvider>')
  }
  return contexto
}
