// Arquivo: src/paginas/PaginaLogin.tsx
// Descrição: Tela de login. Coleta e-mail e senha, chama o contexto de auth e,
//            ao entrar com sucesso, leva o usuário para o painel principal.
//            Visual encorpado e acolhedor (campos grandes + botão "Duo" 3D).

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Campo } from '@/componentes/ui/Campo'
import { BotaoDuo } from '@/componentes/ui/BotaoDuo'
import { useAuth } from '@/recursos/auth/AuthContext'
import { extrairMensagemErro } from '@/lib/api'
import { CampoRecaptcha } from '@/componentes/auth/CampoRecaptcha'
import { LayoutAuth } from './LayoutAuth'

export function PaginaLogin() {
  const { entrar, carregando } = useAuth()
  const navegar = useNavigate()

  // Chave onde guardamos o e-mail (login) para lembrar entre sessões. A SENHA não fica aqui:
  // quem guarda a senha é o gerenciador do navegador (seguro/criptografado), via autocomplete.
  const CHAVE_LEMBRAR = 'onebyone.login.email'

  // Estado controlado dos campos e da mensagem de erro geral. O e-mail e a checkbox já
  // nascem com o que foi salvo (init "preguiçoso" do useState — roda uma vez, sem efeito).
  const [email, setEmail] = useState(() => localStorage.getItem(CHAVE_LEMBRAR) ?? '')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [tokenRecaptcha, setTokenRecaptcha] = useState('')
  const [errosCampos, setErrosCampos] = useState<{ email?: string; senha?: string }>({})
  const [lembrar, setLembrar] = useState(() => localStorage.getItem(CHAVE_LEMBRAR) !== null)

  // aoEnviar é disparado no submit do formulário.
  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault()
    setErro('')
    // Valida os campos obrigatórios — destaca em vermelho qual está faltando.
    const errs: { email?: string; senha?: string } = {}
    if (!email.trim()) errs.email = 'Informe o e-mail.'
    if (!senha) errs.senha = 'Informe a senha.'
    setErrosCampos(errs)
    if (Object.keys(errs).length > 0) return
    // Lembrar (ou esquecer) o e-mail conforme a checkbox.
    if (lembrar) localStorage.setItem(CHAVE_LEMBRAR, email.trim())
    else localStorage.removeItem(CHAVE_LEMBRAR)
    try {
      await entrar({ email, password: senha }, tokenRecaptcha)
      // Login OK → vai para o painel principal.
      navegar('/painel')
    } catch (e) {
      setErro(extrairMensagemErro(e))
    }
  }

  return (
    <LayoutAuth chamada="Veja o OneByOne em ação">
      <div className="text-center lg:text-left">
        <span className="inline-block text-5xl animar-acenar">👋</span>
        <h1 className="fonte-display mt-3 text-4xl font-extrabold leading-tight text-tinta sm:text-5xl">
          Que bom te ver!
        </h1>
        <p className="mb-8 mt-3 text-lg text-tinta-suave">
          Entre e continue de onde a última conversa parou.
        </p>
      </div>

      <form onSubmit={aoEnviar} className="flex flex-col gap-5">
        <Campo
          tamanho="grande"
          rotulo="E-mail"
          tipo="email"
          valor={email}
          onChange={setEmail}
          placeholder="voce@empresa.com"
          autoComplete="email"
          erro={errosCampos.email}
        />
        <Campo
          tamanho="grande"
          rotulo="Senha"
          tipo="password"
          valor={senha}
          onChange={setSenha}
          placeholder="••••••••"
          autoComplete="current-password"
          erro={errosCampos.senha}
          revelavel
        />
        <div className="-mt-2 flex flex-wrap items-center justify-between gap-2">
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-semibold text-tinta-suave">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
              className="h-4 w-4 rounded border-2 border-borda accent-[var(--color-juncao)]"
            />
            Lembrar meu acesso
          </label>
          <Link to="/recuperar-senha" className="text-sm font-semibold text-juncao hover:underline">
            Esqueci minha senha
          </Link>
        </div>

        {/* Mensagem de erro geral do login, quando houver */}
        {erro && (
          <div className="rounded-[var(--radius-suave)] border-2 border-alerta/30 bg-alerta/10 px-4 py-3 text-sm font-medium text-alerta">
            {erro}
          </div>
        )}

        <CampoRecaptcha onToken={setTokenRecaptcha} />

        <BotaoDuo type="submit" variante="marca" tamanho="grande" larguraTotal carregando={carregando}>
          Entrar →
        </BotaoDuo>
      </form>

      <p className="mt-8 text-center text-base text-tinta-suave">
        Ainda não tem conta?{' '}
        <Link to="/criar-conta" className="font-bold text-juncao hover:underline">
          Crie a sua grátis
        </Link>
      </p>
    </LayoutAuth>
  )
}
