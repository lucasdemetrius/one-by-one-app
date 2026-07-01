// Arquivo: src/recursos/config/configApi.ts
// Descrição: Lê a configuração PÚBLICA da API (ex.: se o reCAPTCHA está ligado e qual a
//            site key). Serve para o front decidir, em tempo de execução, se mostra o
//            widget anti-robô — sem precisar rebuildar quando as chaves mudam no .env.

import { useQuery } from '@tanstack/react-query'

import { api, extrairDados } from '@/lib/api'

export interface ConfigPublica {
  recaptcha_habilitado: boolean
  recaptcha_site_key: string
  // Login com Google: ligado quando há GOOGLE_CLIENT_ID no .env do backend.
  google_habilitado: boolean
  google_client_id: string
}

// buscarConfig chama GET /api/v1/config.
export async function buscarConfig(): Promise<ConfigPublica> {
  const resp = await api.get('/config')
  return extrairDados<ConfigPublica>(resp.data)
}

// useConfig expõe a config como hook. staleTime alto: não muda durante a sessão.
export function useConfig() {
  return useQuery({
    queryKey: ['config-publica'],
    queryFn: buscarConfig,
    staleTime: Infinity,
    retry: 1,
  })
}
