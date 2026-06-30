// Arquivo: src/paginas/LayoutApp.tsx
// Descrição: Moldura das telas internas (após o login). Barra superior fixa com a
//            marca, a navegação e o usuário logado. No DESKTOP a navegação fica em
//            linha; no CELULAR vira um menu hambúrguer (drawer/painel deslizante),
//            já que abaixo de sm a barra não cabe os links. O conteúdo entra em
//            {children}. Padding responsivo (px-4 no celular, px-8 no desktop).

import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { useAuth } from '@/recursos/auth/AuthContext'
import { Logo } from '@/componentes/marca/Logo'
import { AvatarUsuario } from '@/componentes/marca/AvatarUsuario'
import { AssistenteIA } from '@/componentes/ia/AssistenteIA'
import { SinoNotificacoes } from '@/componentes/notificacao/SinoNotificacoes'
import { FundoVivo } from '@/componentes/estrutura/FundoVivo'
import { WidgetFeedback } from '@/componentes/feedback/WidgetFeedback'

// Item de navegação que fica destacado quando está na rota ativa.
function ItemNav({ para, children, aoClicar, exato }: { para: string; children: ReactNode; aoClicar?: () => void; exato?: boolean }) {
  return (
    <NavLink
      to={para}
      end={exato}
      onClick={aoClicar}
      className={({ isActive }) =>
        [
          'rounded-[var(--radius-suave)] px-3 py-2 text-sm font-bold transition-colors',
          isActive ? 'bg-areia-escura text-tinta' : 'text-tinta-suave hover:text-tinta',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export function LayoutApp({ children }: { children: ReactNode }) {
  const { usuario, sair } = useAuth()
  const primeiroNome = usuario?.nome?.split(' ')[0] ?? 'Você'
  const [menuAberto, setMenuAberto] = useState(false)

  const ehLider = usuario?.role === 'LIDER'
  const ehRH = usuario?.role === 'RH'
  const ehAdmin = usuario?.role === 'ADMIN'
  // A logo e o "Início" levam ao painel certo conforme o papel (RH e ADMIN têm painel próprio).
  const paraInicio = ehAdmin ? '/admin' : ehRH ? '/rh' : '/painel'
  // Links de navegação (filtrados por papel) — usados no desktop e no menu mobile.
  const links: { para: string; rotulo: string; exato?: boolean }[] = ehAdmin
    ? [{ para: '/admin', rotulo: 'Administração', exato: true }]
    : ehRH
      ? [{ para: '/rh', rotulo: 'Painel', exato: true }]
      : [
          { para: '/painel', rotulo: 'Início' },
          ...(ehLider ? [{ para: '/agenda', rotulo: 'Agenda' }, { para: '/matrix9-box', rotulo: 'Matrix9-Box' }] : []),
          { para: '/onebyone', rotulo: 'OneByOne ❤️' },
        ]

  return (
    <div className="textura-papel relative min-h-screen bg-areia">
      {/* Background vivo (bolhas subindo, atrás de tudo) */}
      <FundoVivo />

      {/* Barra superior fixa (acompanha a rolagem) */}
      <header className="sticky top-0 z-30 border-b border-borda/60 bg-areia/80 shadow-[0_1px_0_rgba(0,0,0,0.02)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Hambúrguer (só no celular) */}
            <button
              type="button"
              onClick={() => setMenuAberto((v) => !v)}
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-suave)] text-xl text-tinta hover:bg-areia-escura sm:hidden"
            >
              {menuAberto ? '✕' : '☰'}
            </button>
            <Link to={paraInicio} aria-label="Início">
              <Logo tamanho={30} />
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {links.map((l) => (
                <ItemNav key={l.para} para={l.para} exato={l.exato}>
                  {l.rotulo}
                </ItemNav>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Ajuda — disponível em toda tela (manual do papel do usuário) */}
            <Link
              to="/ajuda"
              title="Central de ajuda"
              aria-label="Central de ajuda"
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-borda text-sm font-extrabold text-tinta-suave transition-colors hover:border-juncao hover:text-juncao"
            >
              ?
            </Link>
            {/* Sino de notificações (badge de não-lidas + preferências) */}
            <SinoNotificacoes />
            {/* Nome + foto levam ao perfil */}
            <Link
              to="/perfil"
              className="flex items-center gap-2.5 rounded-full py-1 pl-2 pr-1 transition-colors hover:bg-areia-escura"
              title="Meu perfil"
            >
              <span className="hidden text-sm font-semibold text-tinta sm:inline">{primeiroNome}</span>
              <AvatarUsuario fotoUrl={usuario?.foto_url} nome={primeiroNome} tamanho={36} />
            </Link>
            <button
              type="button"
              onClick={sair}
              className="rounded-[var(--radius-suave)] border-2 border-borda px-3 py-1.5 text-sm font-bold text-tinta transition-colors hover:border-tinta"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Menu mobile (desliza abaixo da barra) */}
        <AnimatePresence>
          {menuAberto && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-borda/60 bg-areia/95 sm:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {links.map((l) => (
                  <NavLink
                    key={l.para}
                    to={l.para}
                    end={l.exato}
                    onClick={() => setMenuAberto(false)}
                    className={({ isActive }) =>
                      [
                        'rounded-[var(--radius-suave)] px-3 py-2.5 text-base font-bold transition-colors',
                        isActive ? 'bg-areia-escura text-tinta' : 'text-tinta-suave hover:bg-areia-escura',
                      ].join(' ')
                    }
                  >
                    {l.rotulo}
                  </NavLink>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-8">{children}</main>

      {/* Assistente de IA flutuante (só para o gestor) */}
      {usuario?.role === 'LIDER' && <AssistenteIA />}

      {/* Widget de feedback flutuante (todos os usuários logados) */}
      <WidgetFeedback />
    </div>
  )
}
