// Arquivo: src/paginas/PaginaInicial.tsx
// Descrição: Landing page pública do OneByOne — um site completo que apresenta
//            o produto. História: o gestor acompanha vários liderados (sentimento,
//            entregas, feedbacks, estudos, PDI) e o 1:1 vira a conversa que importa.
//            Seções: hero, recursos, como funciona, para os dois lados, o 1:1,
//            perguntas frequentes e chamada final.

import { Link } from 'react-router-dom'

import { Logo } from '@/componentes/marca/Logo'
import { Botao } from '@/componentes/ui/Botao'
import { CarrosselDemo } from '@/componentes/CarrosselDemo'
import { PainelCoop } from '@/componentes/PainelCoop'
import { CartaoValor } from '@/componentes/CartaoValor'
import { VALORES } from '@/recursos/conteudo/valores'

// Passos de "como funciona".
const PASSOS = [
  {
    numero: '1',
    emoji: '🙌',
    titulo: 'Crie sua conta',
    texto: 'Em menos de um minuto. Você escolhe se é Gestor (faz os 1:1) ou RH (cadastra e acompanha os gestores).',
  },
  {
    numero: '2',
    emoji: '👥',
    titulo: 'Monte seu time',
    texto: 'Adicione seus liderados e organize por equipe, do seu jeito.',
  },
  {
    numero: '3',
    emoji: '🌱',
    titulo: 'Acompanhe e converse',
    texto: 'Veja como cada um está e conduza 1:1 que realmente importam.',
  },
]

// Benefícios para cada lado da relação.
const PARA_GESTOR = [
  'Enxergue o time inteiro num lugar só',
  'Antecipe-se a problemas pelo sentimento de cada pessoa',
  'Desenvolva gente com PDI, feedback e estudos à vista',
]
const PARA_LIDERADO = [
  'Tenha voz e seja ouvido nas conversas',
  'Acompanhe o seu próprio crescimento',
  'Saiba onde focar para evoluir de verdade',
]

// Perguntas frequentes.
const PERGUNTAS = [
  {
    p: 'Preciso instalar alguma coisa?',
    r: 'Não. O OneByOne roda no navegador — é só criar a conta e usar.',
  },
  {
    p: 'Serve para times de qualquer tamanho?',
    r: 'Sim, de uma dupla a times grandes. Você organiza por equipes.',
  },
  {
    p: 'Os liderados também acessam?',
    r: 'Sim — o 1:1 é dos dois lados. Cada um participa da conversa.',
  },
  {
    p: 'Meus dados ficam seguros?',
    r: 'Sim. Acesso autenticado e cada pessoa só vê o que lhe diz respeito.',
  },
]

export function PaginaInicial() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-areia">
      {/* Brilhos decorativos ao fundo */}
      <div
        aria-hidden
        className="gradiente-marca pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full opacity-[0.16] blur-[130px]"
      />
      <div
        aria-hidden
        className="gradiente-marca pointer-events-none absolute -left-48 top-[34rem] h-[30rem] w-[30rem] rounded-full opacity-[0.1] blur-[130px]"
      />

      {/* ── Navegação (fixa no topo) ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-borda/60 bg-areia/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/entrar"
              className="rounded-[var(--radius-suave)] px-4 py-2 text-sm font-bold text-tinta transition-colors hover:bg-areia-escura"
            >
              Entrar
            </Link>
            <Link to="/criar-conta">
              <Botao variante="marca">Criar conta</Botao>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <main className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-12 lg:grid-cols-2 lg:pt-20">
        <div className="animar-surgir">
          <span className="inline-flex items-center gap-2 rounded-full border border-borda bg-creme px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-tinta-suave">
            <span className="gradiente-marca h-2 w-2 rounded-full" />
            Gestão de pessoas, de gente para gente
          </span>

          <h1 className="fonte-display mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-tinta sm:text-6xl">
            Perto de cada liderado,{' '}
            <span className="texto-gradiente">de verdade</span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-tinta-suave">
            Sentimento, entregas, feedbacks, estudos e a evolução do PDI de cada
            pessoa do time — num só lugar. E o 1:1 vira a conversa que importa.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/criar-conta">
              <Botao variante="marca">Começar agora — é grátis</Botao>
            </Link>
            <Link to="/entrar">
              <Botao variante="contorno">Já tenho conta</Botao>
            </Link>
          </div>

          <p className="mt-6 text-sm text-tinta-suave">
            Feito para líderes que se importam com gente. 💜
          </p>
        </div>

        <div>
          <CarrosselDemo />
        </div>
      </main>

      {/* ── Recursos ────────────────────────────────────────────────────────── */}
      <section className="relative bg-areia-escura py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-juncao">
              Tudo num lugar só
            </span>
            <h2 className="fonte-display mt-3 text-4xl font-extrabold tracking-tight text-tinta">
              O que você passa a enxergar de cada pessoa
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {VALORES.map((valor, i) => (
              <div
                key={valor.titulo}
                className="animar-surgir"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <CartaoValor valor={valor} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ───────────────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-juncao">
              Simples assim
            </span>
            <h2 className="fonte-display mt-3 text-4xl font-extrabold tracking-tight text-tinta">
              Como funciona, em 3 passos
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PASSOS.map((passo) => (
              <div
                key={passo.numero}
                className="relative rounded-[var(--radius-cartao)] border border-borda bg-creme p-7 shadow-[var(--shadow-cartao)]"
              >
                <div className="gradiente-marca mb-5 flex h-11 w-11 items-center justify-center rounded-full fonte-display text-lg font-extrabold text-white">
                  {passo.numero}
                </div>
                <h3 className="fonte-display mb-2 text-xl font-bold text-tinta">
                  {passo.emoji} {passo.titulo}
                </h3>
                <p className="leading-relaxed text-tinta-suave">{passo.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Para o RH (novidade) ────────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="overflow-hidden rounded-[var(--radius-grande)] border border-borda bg-creme p-8 shadow-[var(--shadow-cartao)] sm:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-juncao">
                  Novidade · Para o RH
                </span>
                <h2 className="fonte-display mt-3 text-3xl font-extrabold tracking-tight text-tinta sm:text-4xl">
                  É do RH? Acompanhe todos os gestores
                </h2>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-tinta-suave">
                  Agora o RH também cria conta. Cadastre os gestores da empresa e tenha a
                  gestão dos OneByOnes de todos: produtividade da agenda, 1:1 realizados e a
                  evolução de cada time — num painel só.
                </p>
                <div className="mt-7">
                  <Link to="/criar-conta">
                    <Botao variante="marca">Criar conta de RH</Botao>
                  </Link>
                </div>
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  'Cadastre os gestores da empresa em segundos',
                  'Veja a produtividade dos 1:1 de cada gestor',
                  'Abra o detalhe: agenda e histórico de cada time',
                  'Cada empresa só enxerga os seus — isolado e seguro',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-[var(--radius-suave)] border border-borda bg-areia px-4 py-3 text-tinta"
                  >
                    <span className="mt-0.5 text-juncao">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Para os dois lados ──────────────────────────────────────────────── */}
      <section className="relative bg-areia-escura py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-juncao">
              Co-op de verdade
            </span>
            <h2 className="fonte-display mt-3 text-4xl font-extrabold tracking-tight text-tinta">
              Bom para os dois lados
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Gestor */}
            <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-8 shadow-[var(--shadow-cartao)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gestor text-lg font-bold text-white">
                  G
                </span>
                <h3 className="fonte-display text-2xl font-bold text-tinta">
                  Para o gestor
                </h3>
              </div>
              <ul className="flex flex-col gap-3">
                {PARA_GESTOR.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-tinta-suave">
                    <span className="mt-1 text-gestor">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Liderado */}
            <div className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-8 shadow-[var(--shadow-cartao)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-liderado text-lg font-bold text-white">
                  L
                </span>
                <h3 className="fonte-display text-2xl font-bold text-tinta">
                  Para o liderado
                </h3>
              </div>
              <ul className="flex flex-col gap-3">
                {PARA_LIDERADO.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-tinta-suave">
                    <span className="mt-1 text-liderado">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── O 1:1 ───────────────────────────────────────────────────────────── */}
      <section id="encontro" className="relative scroll-mt-20 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-juncao">
              O encontro
            </span>
            <h2 className="fonte-display mt-3 text-4xl font-extrabold tracking-tight text-tinta">
              E o 1:1 vira conversa que importa
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-tinta-suave">
              Gestor e liderado montam a pauta juntos, arrastando os temas. O que
              for conversado fica registrado, e a constância da dupla vira evolução.
            </p>
            <div className="mt-8">
              <Link to="/criar-conta">
                <Botao variante="marca">Experimentar o tabuleiro</Botao>
              </Link>
            </div>
          </div>

          <div className="h-[26rem]">
            <PainelCoop />
          </div>
        </div>
      </section>

      {/* ── Perguntas frequentes ────────────────────────────────────────────── */}
      <section className="relative bg-areia-escura py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="fonte-display mb-10 text-center text-4xl font-extrabold tracking-tight text-tinta">
            Perguntas frequentes
          </h2>
          <div className="flex flex-col gap-4">
            {PERGUNTAS.map((item) => (
              <div
                key={item.p}
                className="rounded-[var(--radius-cartao)] border border-borda bg-creme p-6 shadow-[var(--shadow-cartao)]"
              >
                <h3 className="mb-1.5 font-bold text-tinta">{item.p}</h3>
                <p className="leading-relaxed text-tinta-suave">{item.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chamada final ───────────────────────────────────────────────────── */}
      <section className="relative px-6 py-24">
        <div className="gradiente-marca relative mx-auto max-w-5xl overflow-hidden rounded-[var(--radius-grande)] px-8 py-16 text-center shadow-[var(--shadow-flutuante)]">
          <h2 className="fonte-display text-4xl font-extrabold tracking-tight text-white">
            Comece a se aproximar do seu time hoje
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
            Leva menos de um minuto para criar sua conta e convidar seus liderados.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/criar-conta">
              <Botao variante="primario">Criar conta grátis</Botao>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Rodapé ──────────────────────────────────────────────────────────── */}
      <footer className="relative border-t border-borda bg-areia">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
          <div>
            <Logo tamanho={28} />
            <p className="mt-3 max-w-xs text-sm text-tinta-suave">
              O 1:1 que vocês jogam juntos. Gestão de pessoas, de gente para gente.
            </p>
          </div>
          <div>
            <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-tinta-suave">
              Produto
            </span>
            <ul className="flex flex-col gap-2 text-sm text-tinta">
              <li><a href="#" className="hover:text-juncao">Recursos</a></li>
              <li><a href="#" className="hover:text-juncao">O 1:1</a></li>
              <li><a href="#" className="hover:text-juncao">Perguntas frequentes</a></li>
            </ul>
          </div>
          <div>
            <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-tinta-suave">
              Conta
            </span>
            <ul className="flex flex-col gap-2 text-sm text-tinta">
              <li><Link to="/entrar" className="hover:text-juncao">Entrar</Link></li>
              <li><Link to="/criar-conta" className="hover:text-juncao">Criar conta</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-borda px-6 py-6 text-center text-sm text-tinta-suave">
          © 2026 OneByOne. Feito para conversas que importam.
        </div>
      </footer>
    </div>
  )
}
