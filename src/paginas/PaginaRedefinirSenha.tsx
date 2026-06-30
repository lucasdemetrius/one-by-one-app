// Arquivo: src/paginas/PaginaRedefinirSenha.tsx
// Descrição: "Esqueci minha senha" — passo 2: a pessoa chega pelo link do e-mail
//            (/redefinir-senha/:token), informa o código (contra-senha) e a nova senha
//            (com os requisitos de complexidade). Se o link for inválido/expirado,
//            mostra um aviso amigável com a opção de pedir outro.

import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

import { Campo } from '@/componentes/ui/Campo'
import { BotaoDuo } from '@/componentes/ui/BotaoDuo'
import { extrairMensagemErro } from '@/lib/api'
import { LayoutAuth } from './LayoutAuth'
import { RequisitosSenha, senhaForte } from '@/componentes/auth/RequisitosSenha'
import { validarTokenRecuperacao, redefinirSenha } from '@/recursos/recuperacao/recuperacaoApi'

type Estado = 'carregando' | 'valido' | 'invalido' | 'pronto'

export function PaginaRedefinirSenha() {
  const { token = '' } = useParams()
  const navegar = useNavigate()

  const [estado, setEstado] = useState<Estado>('carregando')
  const [codigo, setCodigo] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Ao abrir, confere se o link ainda vale (para mostrar o formulário ou o aviso).
  useEffect(() => {
    let vivo = true
    validarTokenRecuperacao(token)
      .then((v) => vivo && setEstado(v ? 'valido' : 'invalido'))
      .catch(() => vivo && setEstado('invalido'))
    return () => {
      vivo = false
    }
  }, [token])

  const podeEnviar = codigo.trim().length > 0 && senhaForte(novaSenha)

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault()
    if (!podeEnviar) return
    setErro('')
    setEnviando(true)
    try {
      await redefinirSenha(token, codigo.trim(), novaSenha)
      setEstado('pronto')
    } catch (e) {
      setErro(extrairMensagemErro(e))
    } finally {
      setEnviando(false)
    }
  }

  // ── Carregando o link ──
  if (estado === 'carregando') {
    return (
      <LayoutAuth chamada="Quase lá">
        <p className="py-16 text-center text-tinta-suave">Validando o link…</p>
      </LayoutAuth>
    )
  }

  // ── Link inválido/expirado ──
  if (estado === 'invalido') {
    return (
      <LayoutAuth chamada="Ops">
        <div className="text-center lg:text-left">
          <span className="inline-block text-5xl">⏳</span>
          <h1 className="fonte-display mt-3 text-4xl font-extrabold leading-tight text-tinta sm:text-5xl">
            Link inválido ou expirado
          </h1>
          <p className="mb-8 mt-3 text-lg text-tinta-suave">
            Este link já foi usado ou passou de 1 hora. Peça um novo — é rapidinho.
          </p>
          <Link to="/recuperar-senha" className="font-bold text-juncao hover:underline">
            Pedir um novo link →
          </Link>
        </div>
      </LayoutAuth>
    )
  }

  // ── Sucesso ──
  if (estado === 'pronto') {
    return (
      <LayoutAuth chamada="Tudo certo!">
        <div className="text-center lg:text-left">
          <span className="inline-block text-5xl">🎉</span>
          <h1 className="fonte-display mt-3 text-4xl font-extrabold leading-tight text-tinta sm:text-5xl">
            Senha redefinida!
          </h1>
          <p className="mb-8 mt-3 text-lg text-tinta-suave">Agora é só entrar com a sua nova senha.</p>
          <BotaoDuo variante="marca" tamanho="grande" onClick={() => navegar('/entrar')}>
            Ir para o login →
          </BotaoDuo>
        </div>
      </LayoutAuth>
    )
  }

  // ── Formulário (token válido) ──
  return (
    <LayoutAuth chamada="Crie sua nova senha">
      <div className="text-center lg:text-left">
        <span className="inline-block text-5xl">🔐</span>
        <h1 className="fonte-display mt-3 text-4xl font-extrabold leading-tight text-tinta sm:text-5xl">
          Nova senha
        </h1>
        <p className="mb-8 mt-3 text-lg text-tinta-suave">
          Cole o <strong className="text-tinta">código</strong> que enviamos no e-mail e escolha uma nova senha.
        </p>
      </div>

      <form onSubmit={aoEnviar} className="flex flex-col gap-5">
        <Campo
          tamanho="grande"
          rotulo="Código do e-mail"
          valor={codigo}
          onChange={setCodigo}
          placeholder="ex.: 482931"
          autoComplete="one-time-code"
        />
        <div className="flex flex-col gap-2">
          <Campo
            tamanho="grande"
            rotulo="Nova senha"
            tipo="password"
            valor={novaSenha}
            onChange={setNovaSenha}
            placeholder="••••••••"
            autoComplete="new-password"
            revelavel
          />
          <RequisitosSenha senha={novaSenha} />
        </div>

        {erro && (
          <div className="rounded-[var(--radius-suave)] border-2 border-alerta/30 bg-alerta/10 px-4 py-3 text-sm font-medium text-alerta">
            {erro}
          </div>
        )}

        <BotaoDuo type="submit" variante="marca" tamanho="grande" larguraTotal carregando={enviando} desabilitado={!podeEnviar}>
          Redefinir senha
        </BotaoDuo>
      </form>

      <p className="mt-8 text-center text-base text-tinta-suave">
        <Link to="/entrar" className="font-bold text-juncao hover:underline">
          ← Voltar ao login
        </Link>
      </p>
    </LayoutAuth>
  )
}
