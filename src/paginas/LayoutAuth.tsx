// Arquivo: src/paginas/LayoutAuth.tsx
// Descrição: Moldura das telas de login e cadastro. Layout ASSIMÉTRICO: o lado
//            esquerdo (maior) explica o produto e seus valores; o lado direito
//            (menor) traz o formulário. Em telas pequenas, mostra só o formulário.

import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

import { Logo } from '@/componentes/marca/Logo'
import { CarrosselDemo } from '@/componentes/CarrosselDemo'
import { FundoVivo } from '@/componentes/estrutura/FundoVivo'

interface LayoutAuthProps {
  children: ReactNode
  // Eyebrow curto exibido acima do carrossel (contexto da tela).
  chamada: string
}

export function LayoutAuth({ children, chamada }: LayoutAuthProps) {
  return (
    <div className="relative flex min-h-screen w-full bg-areia">
      <FundoVivo />
      {/* ── Lado esquerdo (MAIOR): demonstração do produto (carrossel) ───────── */}
      <aside className="relative z-10 hidden w-[56%] flex-col justify-between overflow-hidden p-12 lg:flex">
        {/* Fundo com leve gradiente da marca para um clima premium */}
        <div
          aria-hidden
          className="gradiente-marca pointer-events-none absolute inset-0 opacity-[0.07]"
        />
        <div
          aria-hidden
          className="gradiente-marca pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full opacity-20 blur-3xl"
        />

        <Link to="/" aria-label="Voltar para o início" className="relative w-fit">
          <Logo tamanho={36} />
        </Link>

        {/* Centralizado: eyebrow + carrossel de demonstração */}
        <div className="relative flex flex-1 flex-col items-center justify-center py-8">
          <span className="mb-6 text-sm font-bold uppercase tracking-wider text-juncao">
            {chamada}
          </span>
          <CarrosselDemo />
        </div>

        <p className="relative text-center text-sm text-tinta-suave">
          OneByOne — o 1:1 que vocês jogam juntos.
        </p>
      </aside>

      {/* ── Lado direito (MENOR): formulário ────────────────────────────────── */}
      <main className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 sm:px-10 lg:w-[44%]">
        <div className="mb-8 lg:hidden">
          <Logo tamanho={34} />
        </div>
        <div className="w-full max-w-lg animar-surgir">{children}</div>
      </main>
    </div>
  )
}
