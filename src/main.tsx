// Arquivo: src/main.tsx
// Descrição: Ponto de entrada do app React. Monta a árvore de provedores globais
//            na ordem certa e renderiza o App dentro do elemento #root.
//
//            Ordem dos provedores (de fora para dentro):
//              TemaProvider   → aparência/tema visual escolhido
//              BrowserRouter  → habilita navegação por URL
//              QueryClient    → cache/sincronização dos dados da API
//              AuthProvider   → estado de sessão (usuário logado, token)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import './index.css'
import { App } from './App.tsx'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/recursos/auth/AuthContext'
import { TemaProvider } from '@/recursos/tema/TemaContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TemaProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </TemaProvider>
  </StrictMode>,
)
