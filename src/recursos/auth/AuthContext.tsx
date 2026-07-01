// Arquivo: src/recursos/auth/AuthContext.tsx
// Descrição: Contexto global de autenticação. Guarda o usuário logado e o token,
//            persiste o token no localStorage e expõe as ações de login, registro
//            e logout para qualquer componente da árvore.
//
//            Para quem vem de C#/.NET: pense nisto como um "serviço singleton"
//            de sessão, disponível por injeção em qualquer tela via o hook useAuth.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import { CHAVE_TOKEN } from '@/lib/api'
import { fazerLogin, loginGoogle, registrarConta } from './authApi'
import type {
  CredenciaisLogin,
  DadosRegistro,
  RespostaLogin,
  Usuario,
} from './tipos'

// Chave do localStorage onde guardamos os dados do usuário (além do token).
const CHAVE_USUARIO = 'onebyone.usuario'

// Contrato exposto pelo contexto a quem consumir useAuth().
interface ContextoAuth {
  usuario: Usuario | null
  autenticado: boolean
  carregando: boolean
  entrar: (credenciais: CredenciaisLogin, tokenRecaptcha?: string) => Promise<Usuario>
  // entrarComGoogle troca o credential (ID token do Google) por uma sessão e loga.
  entrarComGoogle: (credential: string) => Promise<Usuario>
  cadastrar: (dados: DadosRegistro, tokenRecaptcha?: string) => Promise<Usuario>
  // aplicaSessao grava token + usuário direto (ex.: ao aceitar um convite,
  // que já devolve a sessão pronta, sem novo login).
  aplicarSessao: (resposta: RespostaLogin) => void
  // atualizarUsuario substitui os dados do usuário logado (ex.: após trocar a foto).
  atualizarUsuario: (usuario: Usuario) => void
  sair: () => void
}

const AuthContext = createContext<ContextoAuth | undefined>(undefined)

// Lê o usuário previamente salvo no localStorage (mantém a sessão após F5).
function lerUsuarioSalvo(): Usuario | null {
  try {
    const bruto = localStorage.getItem(CHAVE_USUARIO)
    return bruto ? (JSON.parse(bruto) as Usuario) : null
  } catch {
    return null
  }
}

// AuthProvider envolve o app e disponibiliza o estado de autenticação.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(lerUsuarioSalvo)
  const [carregando, setCarregando] = useState(false)

  // Persiste/limpa o usuário no localStorage sempre que ele mudar.
  useEffect(() => {
    if (usuario) {
      localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario))
    } else {
      localStorage.removeItem(CHAVE_USUARIO)
    }
  }, [usuario])

  // entrar: autentica, guarda token + usuário e devolve o usuário logado.
  const entrar = useCallback(async (credenciais: CredenciaisLogin, tokenRecaptcha?: string) => {
    setCarregando(true)
    try {
      const { token, usuario: logado } = await fazerLogin(credenciais, tokenRecaptcha)
      localStorage.setItem(CHAVE_TOKEN, token)
      setUsuario(logado)
      return logado
    } finally {
      setCarregando(false)
    }
  }, [])

  // entrarComGoogle: autentica via Google (mesmo desfecho do entrar por senha).
  const entrarComGoogle = useCallback(async (credential: string) => {
    setCarregando(true)
    try {
      const { token, usuario: logado } = await loginGoogle(credential)
      localStorage.setItem(CHAVE_TOKEN, token)
      setUsuario(logado)
      return logado
    } finally {
      setCarregando(false)
    }
  }, [])

  // cadastrar: cria a conta. Não loga automaticamente — a tela decide o fluxo.
  const cadastrar = useCallback(async (dados: DadosRegistro, tokenRecaptcha?: string) => {
    setCarregando(true)
    try {
      return await registrarConta(dados, tokenRecaptcha)
    } finally {
      setCarregando(false)
    }
  }, [])

  // aplicarSessao grava token + usuário direto (sem chamar a API de login).
  const aplicarSessao = useCallback((resposta: RespostaLogin) => {
    localStorage.setItem(CHAVE_TOKEN, resposta.token)
    setUsuario(resposta.usuario)
  }, [])

  // atualizarUsuario troca só os dados do usuário (mantém o token da sessão).
  const atualizarUsuario = useCallback((novo: Usuario) => {
    setUsuario(novo)
  }, [])

  // sair: limpa token e usuário, encerrando a sessão.
  const sair = useCallback(() => {
    localStorage.removeItem(CHAVE_TOKEN)
    setUsuario(null)
  }, [])

  const valor = useMemo<ContextoAuth>(
    () => ({
      usuario,
      autenticado: usuario !== null,
      carregando,
      entrar,
      entrarComGoogle,
      cadastrar,
      aplicarSessao,
      atualizarUsuario,
      sair,
    }),
    [usuario, carregando, entrar, entrarComGoogle, cadastrar, aplicarSessao, atualizarUsuario, sair],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// useAuth é o hook para acessar o contexto de autenticação em qualquer tela.
// Lança erro se usado fora do AuthProvider (ajuda a pegar bugs cedo).
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): ContextoAuth {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  }
  return contexto
}
