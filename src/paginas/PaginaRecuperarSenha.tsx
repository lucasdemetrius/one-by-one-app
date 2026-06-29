// Arquivo: src/paginas/PaginaRecuperarSenha.tsx
// Descrição: "Esqueci minha senha" — passo 1: a pessoa informa o e-mail e recebe (se a
//            conta existir) um link + código por e-mail. A resposta é sempre a mesma,
//            não revelando se o e-mail tem conta (anti-enumeração).

import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Campo } from '@/componentes/ui/Campo'
import { BotaoDuo } from '@/componentes/ui/BotaoDuo'
import { extrairMensagemErro } from '@/lib/api'
import { CampoRecaptcha } from '@/componentes/auth/CampoRecaptcha'
import { LayoutAuth } from './LayoutAuth'
import { solicitarRecuperacao } from '@/recursos/recuperacao/recuperacaoApi'

export function PaginaRecuperarSenha() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [tokenRecaptcha, setTokenRecaptcha] = useState('')
  const [erroCampo, setErroCampo] = useState('')

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault()
    setErro('')
    if (!email.trim()) {
      setErroCampo('Informe o e-mail.')
      return
    }
    setErroCampo('')
    setCarregando(true)
    try {
      await solicitarRecuperacao(email.trim(), tokenRecaptcha)
      setEnviado(true)
    } catch (e) {
      setErro(extrairMensagemErro(e))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <LayoutAuth chamada="Recuperar o acesso é rápido">
      {enviado ? (
        <div className="text-center lg:text-left">
          <span className="inline-block text-5xl">📬</span>
          <h1 className="fonte-display mt-3 text-4xl font-extrabold leading-tight text-tinta sm:text-5xl">
            Confira seu e-mail
          </h1>
          <p className="mb-8 mt-3 text-lg text-tinta-suave">
            Se este e-mail tiver conta, enviamos um <strong className="text-tinta">link</strong> e um{' '}
            <strong className="text-tinta">código</strong> para você criar uma nova senha. O link vale por 1 hora.
          </p>
          <Link to="/entrar" className="font-bold text-juncao hover:underline">
            ← Voltar ao login
          </Link>
        </div>
      ) : (
        <>
          <div className="text-center lg:text-left">
            <span className="inline-block text-5xl">🔑</span>
            <h1 className="fonte-display mt-3 text-4xl font-extrabold leading-tight text-tinta sm:text-5xl">
              Esqueceu a senha?
            </h1>
            <p className="mb-8 mt-3 text-lg text-tinta-suave">
              Sem problema. Informe seu e-mail e enviamos um link para você redefinir.
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
              erro={erroCampo}
            />

            {erro && (
              <div className="rounded-[var(--radius-suave)] border-2 border-alerta/30 bg-alerta/10 px-4 py-3 text-sm font-medium text-alerta">
                {erro}
              </div>
            )}

            <CampoRecaptcha onToken={setTokenRecaptcha} />

            <BotaoDuo type="submit" variante="marca" tamanho="grande" larguraTotal carregando={carregando}>
              Enviar link de recuperação
            </BotaoDuo>
          </form>

          <p className="mt-8 text-center text-base text-tinta-suave">
            Lembrou a senha?{' '}
            <Link to="/entrar" className="font-bold text-juncao hover:underline">
              Voltar ao login
            </Link>
          </p>
        </>
      )}
    </LayoutAuth>
  )
}
