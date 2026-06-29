// Arquivo: src/paginas/PaginaConvite.tsx
// Descrição: Tela PÚBLICA de convite do liderado. Ele abre o link /convite/:token,
//            vê quem o convidou, informa o código (contra-senha) e define sua senha
//            de acesso. Ao aceitar, já entra logado (a API devolve a sessão pronta).

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Logo } from '@/componentes/marca/Logo'
import { Botao } from '@/componentes/ui/Botao'
import { Campo } from '@/componentes/ui/Campo'
import { CodigoSegmentado } from '@/componentes/ui/CodigoSegmentado'
import { useAuth } from '@/recursos/auth/AuthContext'
import { extrairMensagemErro } from '@/lib/api'
import { fogos } from '@/lib/fogos'
import { aceitarConvite, buscarConvite } from '@/recursos/convite/conviteApi'
import type { ConvitePublico } from '@/recursos/convite/conviteApi'

// Moldura comum (logo + cartão centralizado). DEFINIDA FORA do componente de
// página — se ficasse dentro, o React a recriaria a cada tecla e remontaria o
// formulário, fazendo o campo perder o foco e o valor digitado.
function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <div className="textura-papel flex min-h-screen flex-col items-center justify-center bg-areia px-4 sm:px-6">
      <div className="mb-8">
        <Logo tamanho={36} />
      </div>
      <div className="w-full max-w-md rounded-[var(--radius-cartao)] border border-borda bg-creme p-6 shadow-[var(--shadow-flutuante)] sm:p-8">
        {children}
      </div>
    </div>
  )
}

export function PaginaConvite() {
  const { token = '' } = useParams()
  const navegar = useNavigate()
  const { aplicarSessao } = useAuth()

  const [convite, setConvite] = useState<ConvitePublico | null>(null)
  const [carregandoConvite, setCarregandoConvite] = useState(true)

  const [codigo, setCodigo] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [comemorando, setComemorando] = useState(false)

  // Ao abrir, busca os dados públicos do convite.
  useEffect(() => {
    buscarConvite(token)
      .then(setConvite)
      .catch(() => setConvite(null))
      .finally(() => setCarregandoConvite(false))
  }, [token])

  async function aoAceitar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const sessao = await aceitarConvite(token, codigo, senha)
      aplicarSessao(sessao) // entra logado
      setComemorando(true)
      fogos(3000)
      setTimeout(() => navegar('/painel'), 2600)
    } catch (e) {
      setErro(extrairMensagemErro(e))
      setEnviando(false)
    }
  }

  // Comemoração após aceitar.
  if (comemorando) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-areia px-6 text-center">
        <div className="animar-pop">
          <div className="gradiente-marca mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[var(--radius-grande)] text-4xl">
            🎉
          </div>
          <h1 className="fonte-display text-4xl font-extrabold text-tinta">
            Tudo certo, {convite?.colaborador_nome?.split(' ')[0] || 'bem-vindo'}!
          </h1>
          <p className="mt-3 text-lg text-tinta-suave">
            Sua conta está pronta. Entrando…
          </p>
        </div>
      </div>
    )
  }

  if (carregandoConvite) {
    return (
      <Moldura>
        <p className="text-center text-tinta-suave">Carregando convite…</p>
      </Moldura>
    )
  }

  // Convite inexistente, expirado ou já usado.
  if (!convite || !convite.valido) {
    return (
      <Moldura>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-areia-escura text-2xl">
            ⌛
          </div>
          <h1 className="fonte-display text-2xl font-bold text-tinta">
            Convite indisponível
          </h1>
          <p className="mt-2 text-tinta-suave">
            Este convite não existe, expirou ou já foi usado. Peça um novo ao seu
            gestor.
          </p>
        </div>
      </Moldura>
    )
  }

  // Convite válido → formulário de aceite.
  return (
    <Moldura>
      <span className="text-sm font-bold uppercase tracking-wider text-juncao">
        Você foi convidado
      </span>
      <h1 className="fonte-display mt-1 text-3xl font-extrabold text-tinta">
        Olá, {convite.colaborador_nome.split(' ')[0]}! 👋
      </h1>
      <p className="mb-6 mt-2 text-tinta-suave">
        Crie seu acesso ao OneByOne com o código que seu gestor te enviou.
      </p>

      <form onSubmit={aoAceitar} className="flex flex-col gap-5">
        <Campo
          rotulo="E-mail"
          valor={convite.email}
          onChange={() => {}}
          tipo="email"
          somenteLeitura
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-tinta">Código do convite</span>
          <CodigoSegmentado valor={codigo} onChange={setCodigo} tamanho={6} />
          <span className="text-xs text-tinta-suave">As 6 letras/números que seu gestor te enviou.</span>
        </div>
        <Campo
          rotulo="Crie sua senha"
          tipo="password"
          valor={senha}
          onChange={setSenha}
          placeholder="mínimo 6 caracteres"
          autoComplete="new-password"
        />

        {erro && (
          <div className="rounded-[var(--radius-suave)] border border-alerta/30 bg-alerta/10 px-4 py-3 text-sm font-medium text-alerta">
            {erro}
          </div>
        )}

        <Botao type="submit" variante="marca" larguraTotal carregando={enviando}>
          Aceitar convite e entrar
        </Botao>
      </form>
    </Moldura>
  )
}
