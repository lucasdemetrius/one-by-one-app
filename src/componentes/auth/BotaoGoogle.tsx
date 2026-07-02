// Arquivo: src/componentes/auth/BotaoGoogle.tsx
// Descrição: Botão "Entrar com o Google". É DORMENTE: só aparece quando o login
//            social está ligado no backend (GOOGLE_CLIENT_ID no .env → refletido em
//            /config). O Client ID vem em runtime (como o reCAPTCHA), então não
//            precisa rebuildar o front quando ligar/desligar.
//
//            Visual: o iframe do Google não é estilizável por CSS — a largura precisa
//            ser passada por parâmetro. Medimos a coluna do formulário e passamos ao
//            botão (o Google limita a 400px), com tamanho grande e cantos "pill" para
//            acompanhar os botões do app.
//
//            Regra do produto: se o e-mail JÁ tem conta, entra nela direto. Se é conta
//            NOVA, o backend devolve precisa_papel=true e este componente pergunta
//            "Como você vai usar?" (Gestor / RH / Liderado) antes de criar a conta.

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { useLayoutEffect, useRef, useState } from 'react'

import { useAuth } from '@/recursos/auth/AuthContext'
import { useConfig } from '@/recursos/config/configApi'
import { extrairMensagemErro } from '@/lib/api'
import type { PapelGoogle } from '@/recursos/auth/authApi'

// Largura máxima que o Google aceita para o botão (limite do GIS).
const LARGURA_MAXIMA_GOOGLE = 400

// Opções da pergunta "Como você vai usar?" (conta nova via Google). Só Gestor e RH:
// o liderado NÃO se auto-cadastra — entra por convite do gestor.
const PAPEIS: { papel: PapelGoogle; emoji: string; titulo: string; descricao: string }[] = [
  { papel: 'LIDER', emoji: '🧭', titulo: 'Sou Gestor', descricao: 'Gerencio meu time e faço os 1:1 com meus liderados.' },
  { papel: 'RH', emoji: '🏛️', titulo: 'Sou RH', descricao: 'Cadastro os gestores da empresa e acompanho todos eles.' },
]

interface Props {
  // onSucesso é chamado após o login com Google dar certo (a tela navega).
  onSucesso: () => void
  // texto define o rótulo do botão do Google (login vs cadastro).
  texto?: 'signin_with' | 'signup_with' | 'continue_with'
  // aoPerguntarPapel avisa a página quando a pergunta "como você vai usar?" entra
  // (true) ou sai (false) de cena — para a página esconder conteúdo redundante
  // (ex.: os cartões Gestor/RH do Passo 0 do cadastro, que são quase idênticos).
  aoPerguntarPapel?: (perguntando: boolean) => void
}

export function BotaoGoogle({ onSucesso, texto = 'continue_with', aoPerguntarPapel }: Props) {
  const { data: config } = useConfig()
  const { entrarComGoogle, carregando } = useAuth()
  const [erro, setErro] = useState('')
  // Credencial do Google aguardando a escolha do papel (conta nova). Enquanto
  // preenchida, o botão dá lugar à pergunta "Como você vai usar?".
  const [credencialPendente, setCredencialPendente] = useState('')
  // Mede a largura da coluna do formulário para o botão do Google preenchê-la
  // (até o teto de 400px do Google). Recalcula quando a janela muda de tamanho.
  const areaRef = useRef<HTMLDivElement>(null)
  const [largura, setLargura] = useState(0)

  useLayoutEffect(() => {
    function medir() {
      if (areaRef.current) {
        setLargura(Math.min(Math.floor(areaRef.current.clientWidth), LARGURA_MAXIMA_GOOGLE))
      }
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [config])

  // Autentica no backend. Sem papel: conta nova vira pergunta (precisa_papel).
  async function autenticar(credential: string, papel?: PapelGoogle) {
    setErro('')
    try {
      const usuario = await entrarComGoogle(credential, papel)
      if (usuario) {
        onSucesso()
        return
      }
      // Conta nova: guarda a credencial e mostra a pergunta do papel.
      setCredencialPendente(credential)
      aoPerguntarPapel?.(true)
    } catch (e) {
      // Mostra a mensagem real do backend (ex.: erro de validação do token).
      setErro(extrairMensagemErro(e))
    }
  }

  // Sai da pergunta e volta ao botão do Google (limpa também o erro antigo).
  function voltarDaPergunta() {
    setCredencialPendente('')
    setErro('')
    aoPerguntarPapel?.(false)
  }

  // Login com Google desligado (ou config ainda carregando) → não mostra nada.
  if (!config?.google_habilitado || !config.google_client_id) return null

  return (
    <GoogleOAuthProvider clientId={config.google_client_id}>
      <div ref={areaRef} className="mt-6 flex w-full flex-col items-center gap-3">
        {credencialPendente ? (
          // ── Conta nova: pergunta o papel antes de criar (regra do produto) ──
          <div className="flex w-full flex-col gap-3">
            <p className="text-center font-bold text-tinta">Conta nova! Como você vai usar?</p>
            {PAPEIS.map((op) => (
              <button
                key={op.papel}
                type="button"
                disabled={carregando}
                onClick={() => autenticar(credencialPendente, op.papel)}
                className="group flex items-center gap-3 rounded-[var(--radius-cartao)] border-2 border-borda bg-creme p-4 text-left transition hover:border-juncao hover:shadow-md disabled:opacity-50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-grande)] bg-juncao/10 text-2xl">
                  {op.emoji}
                </span>
                <span className="min-w-0">
                  <span className="fonte-display block text-lg font-extrabold text-tinta">{op.titulo}</span>
                  <span className="block text-sm text-tinta-suave">{op.descricao}</span>
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={voltarDaPergunta}
              className="text-sm font-bold text-tinta-suave hover:text-tinta"
            >
              ← Voltar
            </button>
          </div>
        ) : (
          <>
            {/* Separador "ou" entre o formulário e o login social */}
            <div className="flex w-full items-center gap-3 text-xs font-bold uppercase tracking-wider text-tinta-suave">
              <span className="h-px flex-1 bg-borda" /> ou <span className="h-px flex-1 bg-borda" />
            </div>
            {largura > 0 && (
              <GoogleLogin
                onSuccess={(resp) => {
                  if (!resp.credential) {
                    setErro('Não foi possível entrar com o Google. Tente novamente.')
                    return
                  }
                  void autenticar(resp.credential)
                }}
                onError={() => setErro('Não foi possível entrar com o Google. Tente novamente.')}
                text={texto}
                shape="pill"
                size="large"
                width={largura}
              />
            )}
          </>
        )}
        {erro && <p className="text-center text-sm font-medium text-alerta">{erro}</p>}
      </div>
    </GoogleOAuthProvider>
  )
}
