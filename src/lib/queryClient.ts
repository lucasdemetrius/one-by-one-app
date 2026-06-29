// Arquivo: src/lib/queryClient.ts
// Descrição: Configuração única do TanStack Query (React Query), responsável
//            por cachear e sincronizar os dados vindos da API. Centralizar aqui
//            mantém o comportamento consistente em todo o app.

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Não refaz a busca toda vez que a janela ganha foco (evita "piscar").
      refetchOnWindowFocus: false,
      // Considera os dados "frescos" por 30s antes de buscar de novo.
      staleTime: 30_000,
      // Tenta uma vez de novo em caso de falha de rede.
      retry: 1,
    },
  },
})
