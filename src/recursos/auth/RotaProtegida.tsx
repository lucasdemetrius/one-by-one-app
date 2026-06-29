// Arquivo: src/recursos/auth/RotaProtegida.tsx
// Descrição: Componente que protege rotas que exigem login. Se não houver
//            usuário autenticado, redireciona para a tela de entrar.

import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

import { useAuth } from './AuthContext'

export function RotaProtegida({ children }: { children: ReactNode }) {
  const { autenticado } = useAuth()

  if (!autenticado) {
    // "replace" evita que o botão Voltar caia de novo na rota protegida.
    return <Navigate to="/entrar" replace />
  }

  return <>{children}</>
}
