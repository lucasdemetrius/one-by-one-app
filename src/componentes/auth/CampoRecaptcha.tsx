// Arquivo: src/componentes/auth/CampoRecaptcha.tsx
// Descrição: Widget do Google reCAPTCHA v2 (caixa "não sou um robô"). É DORMENTE: se o
//            backend disser que o reCAPTCHA está desligado (sem chaves no .env), o
//            componente não renderiza nada e os formulários funcionam normalmente.
//            Quando ligado, carrega o script do Google e reporta o token via onToken.

import { useEffect, useRef } from 'react'

import { useConfig } from '@/recursos/config/configApi'

// O script do Google injeta o objeto global `grecaptcha`. Tipagem mínima.
declare global {
  interface Window {
    grecaptcha?: {
      render: (
        el: HTMLElement,
        params: Record<string, unknown>,
      ) => number
    }
    aoCarregarRecaptcha?: () => void
  }
}

const ID_SCRIPT = 'script-google-recaptcha'

// carregarScript injeta (uma única vez) o script do reCAPTCHA e chama `aoCarregar`
// quando a API estiver pronta.
function carregarScript(aoCarregar: () => void) {
  if (window.grecaptcha?.render) {
    aoCarregar()
    return
  }
  window.aoCarregarRecaptcha = aoCarregar
  if (document.getElementById(ID_SCRIPT)) return
  const s = document.createElement('script')
  s.id = ID_SCRIPT
  s.src = 'https://www.google.com/recaptcha/api.js?onload=aoCarregarRecaptcha&render=explicit'
  s.async = true
  s.defer = true
  document.head.appendChild(s)
}

interface Props {
  // onToken recebe o token quando o usuário resolve o desafio, e '' quando expira/zera.
  onToken: (token: string) => void
}

export function CampoRecaptcha({ onToken }: Props) {
  const { data: config } = useConfig()
  const containerRef = useRef<HTMLDivElement>(null)
  const renderizadoRef = useRef(false)
  // Guarda o onToken mais recente sem recriar o widget a cada render.
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken

  useEffect(() => {
    if (!config?.recaptcha_habilitado || !config.recaptcha_site_key) return
    if (renderizadoRef.current) return
    carregarScript(() => {
      if (!containerRef.current || renderizadoRef.current || !window.grecaptcha) return
      renderizadoRef.current = true
      window.grecaptcha.render(containerRef.current, {
        sitekey: config.recaptcha_site_key,
        callback: (token: string) => onTokenRef.current(token),
        'expired-callback': () => onTokenRef.current(''),
        'error-callback': () => onTokenRef.current(''),
      })
    })
  }, [config])

  // Desligado (ou ainda carregando a config) → não mostra nada.
  if (!config?.recaptcha_habilitado) return null
  return <div ref={containerRef} className="flex justify-center" />
}
