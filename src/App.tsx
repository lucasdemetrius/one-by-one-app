// Arquivo: src/App.tsx
// Descrição: Define o mapa de rotas da aplicação (qual URL renderiza qual tela).
//            As rotas públicas são a inicial, o login e o cadastro; o painel é
//            protegido e exige usuário autenticado.

import type { ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import { PaginaInicial } from '@/paginas/PaginaInicial'
import { PaginaLogin } from '@/paginas/PaginaLogin'
import { PaginaRegistro } from '@/paginas/PaginaRegistro'
import { PaginaPainel } from '@/paginas/PaginaPainel'
import { PaginaTabuleiro } from '@/paginas/PaginaTabuleiro'
import { PaginaConvite } from '@/paginas/PaginaConvite'
import { PaginaRecuperarSenha } from '@/paginas/PaginaRecuperarSenha'
import { PaginaRedefinirSenha } from '@/paginas/PaginaRedefinirSenha'
import { PaginaConteudo } from '@/paginas/PaginaConteudo'
import { PaginaConteudoArtigo } from '@/paginas/PaginaConteudoArtigo'
import { PaginaPerfil } from '@/paginas/PaginaPerfil'
import { PaginaOneByOneRota } from '@/paginas/PaginaOneByOne'
import { PaginaMonitor } from '@/paginas/PaginaMonitor'
import { PaginaAgenda } from '@/paginas/PaginaAgenda'
import { PaginaRH } from '@/paginas/PaginaRH'
import { PaginaRHAgenda } from '@/paginas/PaginaRHAgenda'
import { PaginaRHMatrix } from '@/paginas/PaginaRHMatrix'
import { PaginaDossieLiderado } from '@/paginas/PaginaDossieLiderado'
import { PaginaAjuda } from '@/paginas/PaginaAjuda'
import { PaginaAdmin } from '@/paginas/PaginaAdmin'
import { RotaProtegida } from '@/recursos/auth/RotaProtegida'
import { useAuth } from '@/recursos/auth/AuthContext'
import { SeletorTema } from '@/componentes/SeletorTema'
import { ConfirmacaoProvider } from '@/componentes/ui/Confirmacao'

// Roteia o "/painel" por papel: o RH tem um painel próprio (/rh); gestor e liderado
// ficam no painel padrão. (Feito no nível da rota para não montar os hooks do painel
// do gestor à toa para um RH.)
function PainelPorPapel() {
  const { usuario } = useAuth()
  if (usuario?.role === 'RH') return <Navigate to="/rh" replace />
  if (usuario?.role === 'ADMIN') return <Navigate to="/admin" replace />
  return <PaginaPainel />
}

// Garante que só o RH acessa as rotas de RH; gestor/liderado voltam ao painel deles.
function RotaRH({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  if (usuario && usuario.role !== 'RH') return <Navigate to="/painel" replace />
  return <>{children}</>
}

// Garante que só o ADMIN da plataforma acessa as rotas de administração.
function RotaAdmin({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  if (usuario && usuario.role !== 'ADMIN') return <Navigate to="/painel" replace />
  return <>{children}</>
}

export function App() {
  return (
    <ConfirmacaoProvider>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<PaginaInicial />} />
        <Route path="/entrar" element={<PaginaLogin />} />
        <Route path="/criar-conta" element={<PaginaRegistro />} />
        <Route path="/convite/:token" element={<PaginaConvite />} />
        <Route path="/recuperar-senha" element={<PaginaRecuperarSenha />} />
        <Route path="/redefinir-senha/:token" element={<PaginaRedefinirSenha />} />

        {/* Central de conteúdo pública (SEO) — antes dos guards, sem autenticação */}
        <Route path="/conteudo" element={<PaginaConteudo />} />
        <Route path="/conteudo/:slug" element={<PaginaConteudoArtigo />} />

        {/* Rotas protegidas — só acessíveis autenticado */}
        <Route
          path="/painel"
          element={
            <RotaProtegida>
              <PainelPorPapel />
            </RotaProtegida>
          }
        />
        <Route
          path="/rh"
          element={
            <RotaProtegida>
              <RotaRH><PaginaRH /></RotaRH>
            </RotaProtegida>
          }
        />
        <Route
          path="/rh/agenda"
          element={
            <RotaProtegida>
              <RotaRH><PaginaRHAgenda /></RotaRH>
            </RotaProtegida>
          }
        />
        <Route
          path="/rh/matrix"
          element={
            <RotaProtegida>
              <RotaRH><PaginaRHMatrix /></RotaRH>
            </RotaProtegida>
          }
        />
        <Route
          path="/onebyone"
          element={
            <RotaProtegida>
              <PaginaTabuleiro />
            </RotaProtegida>
          }
        />
        {/* Rota antiga renomeada para /onebyone — redireciona para não quebrar links */}
        <Route path="/tabuleiro" element={<Navigate to="/onebyone" replace />} />
        <Route
          path="/perfil"
          element={
            <RotaProtegida>
              <PaginaPerfil />
            </RotaProtegida>
          }
        />
        <Route
          path="/liderado/:id"
          element={
            <RotaProtegida>
              <PaginaOneByOneRota />
            </RotaProtegida>
          }
        />
        <Route
          path="/liderado/:id/dossie"
          element={
            <RotaProtegida>
              <PaginaDossieLiderado />
            </RotaProtegida>
          }
        />
        <Route
          path="/ajuda"
          element={
            <RotaProtegida>
              <PaginaAjuda />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin"
          element={
            <RotaProtegida>
              <RotaAdmin>
                <PaginaAdmin />
              </RotaAdmin>
            </RotaProtegida>
          }
        />
        <Route
          path="/matrix9-box"
          element={
            <RotaProtegida>
              <PaginaMonitor />
            </RotaProtegida>
          }
        />
        {/* Rota antiga renomeada para /matrix9-box — redireciona para não quebrar links */}
        <Route path="/monitor" element={<Navigate to="/matrix9-box" replace />} />
        <Route
          path="/agenda"
          element={
            <RotaProtegida>
              <PaginaAgenda />
            </RotaProtegida>
          }
        />

        {/* Qualquer URL desconhecida volta para a tela inicial */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Seletor de tema flutuante, presente em todas as telas */}
      <SeletorTema />
    </ConfirmacaoProvider>
  )
}
