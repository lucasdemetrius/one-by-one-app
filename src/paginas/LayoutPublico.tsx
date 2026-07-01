// Arquivo: src/paginas/LayoutPublico.tsx
// Descrição: Casca visual das páginas PÚBLICAS de conteúdo (SEO) — cabeçalho com a
//            marca e chamadas para login/cadastro, e rodapé. Sem estado de sessão:
//            serve para visitante não logado (é o que o Google indexa).

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function LayoutPublico({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-areia text-tinta">
      {/* Cabeçalho */}
      <header className="border-b border-borda bg-creme/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-4">
          <Link to="/" className="fonte-display text-xl font-extrabold text-tinta">
            Team<span className="text-juncao">BOX</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 text-sm font-bold">
            <Link to="/conteudo" className="text-tinta-suave hover:text-tinta">
              Conteúdo
            </Link>
            <Link to="/entrar" className="text-tinta-suave hover:text-tinta">
              Entrar
            </Link>
            <Link
              to="/criar-conta"
              className="gradiente-marca rounded-full px-4 py-2 text-white shadow-[var(--shadow-cartao)]"
            >
              Criar conta grátis
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">{children}</main>

      {/* Rodapé */}
      <footer className="border-t border-borda bg-creme/60">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-5 py-8 text-center text-sm text-tinta-suave">
          <p className="fonte-display text-lg font-extrabold text-tinta">
            Team<span className="text-juncao">BOX</span>
          </p>
          <p>1:1, matriz 9-box, PDI e feedback — a liderança de perto, sem virar planilha.</p>
          <p>
            <Link to="/criar-conta" className="font-bold text-juncao hover:underline">
              Comece grátis
            </Link>{' '}
            · <Link to="/conteudo" className="font-bold text-juncao hover:underline">Central de conteúdo</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
