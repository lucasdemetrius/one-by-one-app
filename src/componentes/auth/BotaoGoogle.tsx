// Arquivo: src/componentes/auth/BotaoGoogle.tsx
// Descrição: Botão "Entrar com o Google". É DORMENTE: só aparece quando o login
//            social está ligado no backend (GOOGLE_CLIENT_ID no .env → refletido em
//            /config). O Client ID vem em runtime (como o reCAPTCHA), então não
//            precisa rebuildar o front quando ligar/desligar. Ao autenticar, chama
//            onSucesso (a tela decide para onde navegar).

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'

import { useAuth } from '@/recursos/auth/AuthContext'
import { useConfig } from '@/recursos/config/configApi'

interface Props {
  // onSucesso é chamado após o login com Google dar certo (a tela navega).
  onSucesso: () => void
  // texto define o rótulo do botão do Google (login vs cadastro).
  texto?: 'signin_with' | 'signup_with' | 'continue_with'
}

export function BotaoGoogle({ onSucesso, texto = 'continue_with' }: Props) {
  const { data: config } = useConfig()
  const { entrarComGoogle } = useAuth()
  const [erro, setErro] = useState('')

  // Login com Google desligado (ou config ainda carregando) → não mostra nada.
  if (!config?.google_habilitado || !config.google_client_id) return null

  return (
    <GoogleOAuthProvider clientId={config.google_client_id}>
      <div className="mt-6 flex flex-col items-center gap-3">
        {/* Separador "ou" entre o formulário e o login social */}
        <div className="flex w-full items-center gap-3 text-xs font-bold uppercase tracking-wider text-tinta-suave">
          <span className="h-px flex-1 bg-borda" /> ou <span className="h-px flex-1 bg-borda" />
        </div>
        <GoogleLogin
          onSuccess={async (resp) => {
            setErro('')
            if (!resp.credential) {
              setErro('Não foi possível entrar com o Google. Tente novamente.')
              return
            }
            try {
              await entrarComGoogle(resp.credential)
              onSucesso()
            } catch {
              setErro('Não foi possível entrar com o Google. Tente novamente.')
            }
          }}
          onError={() => setErro('Não foi possível entrar com o Google. Tente novamente.')}
          text={texto}
          shape="pill"
        />
        {erro && <p className="text-sm font-medium text-alerta">{erro}</p>}
      </div>
    </GoogleOAuthProvider>
  )
}
