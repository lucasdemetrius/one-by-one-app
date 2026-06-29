// Arquivo: src/paginas/PaginaOneByOne.tsx
// Descrição: O 1:1 de um liderado — AO VIVO. Os participantes entram na mesma
//            sala (WebSocket): o tabuleiro é sincronizado em tempo real e cada um
//            vê o cursor do outro (tipo Gartic). Cada tema abre o editor de conteúdo.

import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import { useAuth } from '@/recursos/auth/AuthContext'
import { useColaborador } from '@/recursos/time/hooks'
import { LayoutApp } from './LayoutApp'
import { TabuleiroPauta } from '@/componentes/pauta/TabuleiroPauta'
import { TABULEIRO_INICIAL } from '@/recursos/pauta/tipos'
import type { Tabuleiro } from '@/recursos/pauta/tipos'
import { obterTabuleiro, salvarTabuleiro } from '@/recursos/pauta/tabuleiroApi'
import { TemaEditor } from '@/componentes/conteudo/TemaEditor'
import { ApresentacaoTema } from '@/componentes/conteudo/ApresentacaoTema'
import { EncerrarOneByOne, TEMA_HISTORICO } from '@/componentes/conteudo/EncerrarOneByOne'
import { Ajuda } from '@/componentes/ui/Ajuda'
import { useSalaAoVivo } from '@/recursos/aovivo/useSalaAoVivo'
import { CursoresAoVivo } from '@/componentes/aovivo/CursoresAoVivo'

function Persona({
  inicial,
  nome,
  papel,
  cor,
  presente,
}: {
  inicial: string
  nome: string
  papel: string
  cor: string
  presente: boolean
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-white shadow-[var(--shadow-cartao)]"
          style={{ backgroundColor: cor }}
        >
          {inicial}
        </div>
        {/* Bolinha de presença ao vivo: verde (na sala) ou cinza (fora) */}
        <span
          title={presente ? 'Na sala agora' : 'Fora da sala'}
          className={[
            'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-creme',
            presente ? 'animate-pulse bg-sucesso' : 'bg-tinta-suave/30',
          ].join(' ')}
        />
      </div>
      <div className="leading-tight">
        <span className="block text-sm font-bold text-tinta">{nome}</span>
        <span className="block text-xs text-tinta-suave">
          {papel}
          {' · '}
          <span className={presente ? 'font-bold text-sucesso' : 'text-tinta-suave/70'}>
            {presente ? 'na sala' : 'fora'}
          </span>
        </span>
      </div>
    </div>
  )
}

export function PaginaOneByOne() {
  const { id = '' } = useParams()
  const [searchParams] = useSearchParams()
  const { usuario } = useAuth()
  const colaboradorQ = useColaborador(id)

  const [tabuleiro, setTabuleiro] = useState<Tabuleiro>(TABULEIRO_INICIAL)
  const [temaAberto, setTemaAberto] = useState<string | null>(searchParams.get('tema'))
  // Sinal de "conteúdo de um tema mudou" vindo de outro participante da sala.
  // O contador `n` incrementa a cada aviso; o TemaEditor recarrega se o tema bate.
  const [sinalTema, setSinalTema] = useState<{ tema: string; n: number }>({ tema: '', n: 0 })
  // Tema em modo apresentação (tela cheia, sincronizado ao vivo). null = nenhum.
  const [temaApresentando, setTemaApresentando] = useState<string | null>(null)
  // Modal de encerramento do 1:1 (resumo + próximos passos).
  const [encerrando, setEncerrando] = useState(false)
  const [copiado, setCopiado] = useState(false) // feedback do botão "copiar link da sala"
  // Quando preenchido, o 1:1 foi ENCERRADO: a tela vira modo CONSULTA (somente
  // leitura) para os dois, mostrando os pontos mapeados. Vem do sinal ao vivo.
  const [encerrado, setEncerrado] = useState<{ resumo: string } | null>(null)
  // Só começa a salvar/sincronizar depois de carregar o tabuleiro do backend.
  const [carregado, setCarregado] = useState(false)

  const nomeLiderado = colaboradorQ.data?.nome ?? 'Liderado'
  const primeiroGestor = usuario?.nome?.split(' ')[0] ?? 'Você'
  const ehGestor = usuario?.role === 'LIDER'

  // ── Sala ao vivo (WebSocket) ──────────────────────────────────────────────
  // aplicandoRemoto evita o "eco": quando aplicamos um tabuleiro recebido da sala,
  // não reenviamos de volta (senão A→B→A→… em loop).
  const aplicandoRemoto = useRef(false)
  const ultimoEnvioTab = useRef(0)

  const {
    conectado,
    participantes,
    cursores,
    participantesPorId,
    enviarCursor,
    enviarTabuleiro,
    enviarTemaAtualizado,
    enviarApresentacao,
    enviarEncerrado,
  } = useSalaAoVivo(id, {
    nome: usuario?.nome ?? 'Alguém',
    papel: ehGestor ? 'gestor' : 'liderado',
    aoReceberTabuleiro: (tab) => {
      aplicandoRemoto.current = true
      setTabuleiro(tab)
    },
    // Outro participante mexeu no conteúdo de um tema: registra o sinal para o
    // TemaEditor recarregar (ele só recarrega se for o tema que está aberto).
    aoTemaAtualizado: (tema) => setSinalTema((s) => ({ tema, n: s.n + 1 })),
    // O outro entrou/saiu do modo apresentação → espelha aqui ao vivo.
    aoApresentacao: (tema, ativo) => setTemaApresentando(ativo ? tema : null),
    // O gestor encerrou: os DOIS lados caem no modo consulta (somente leitura).
    aoEncerrar: (resumo) => {
      setEncerrando(false)
      setTemaAberto(null)
      setTemaApresentando(null)
      setEncerrado({ resumo })
    },
  })

  // Envia o tabuleiro à sala quando ele muda LOCALMENTE, com throttle (~120ms)
  // para não travar durante o arraste (antes enviava a cada micro-movimento).
  useEffect(() => {
    if (aplicandoRemoto.current) {
      aplicandoRemoto.current = false
      return
    }
    const agora = performance.now()
    const restante = 120 - (agora - ultimoEnvioTab.current)
    if (restante <= 0) {
      ultimoEnvioTab.current = agora
      enviarTabuleiro(tabuleiro)
    } else {
      const t = setTimeout(() => {
        ultimoEnvioTab.current = performance.now()
        enviarTabuleiro(tabuleiro)
      }, restante)
      return () => clearTimeout(t)
    }
  }, [tabuleiro, enviarTabuleiro])

  // Carrega a pauta salva do liderado ao abrir (se houver). Marca aplicandoRemoto
  // para a aplicação inicial não disparar reenvio/salvamento desnecessários.
  useEffect(() => {
    let vivo = true
    obterTabuleiro(id)
      .then((t) => {
        if (vivo && t) {
          aplicandoRemoto.current = true
          setTabuleiro(t)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (vivo) setCarregado(true)
      })
    return () => {
      vivo = false
    }
  }, [id])

  // Persiste a pauta no backend (debounce 800ms) — sobrevive ao recarregar.
  // Só salva depois de carregar e enquanto o 1:1 não foi encerrado (consulta).
  const salvarTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!carregado || encerrado) return
    if (salvarTimer.current) clearTimeout(salvarTimer.current)
    salvarTimer.current = setTimeout(() => {
      salvarTabuleiro(id, tabuleiro).catch(() => {})
    }, 800)
    return () => {
      if (salvarTimer.current) clearTimeout(salvarTimer.current)
    }
  }, [tabuleiro, carregado, id, encerrado])

  // Captura o movimento do mouse (com throttle) e envia para a sala.
  const ultimoEnvio = useRef(0)
  useEffect(() => {
    function aoMover(e: MouseEvent) {
      const agora = e.timeStamp
      if (agora - ultimoEnvio.current < 45) return
      ultimoEnvio.current = agora
      enviarCursor(e.clientX / window.innerWidth, e.clientY / window.innerHeight)
    }
    window.addEventListener('mousemove', aoMover)
    return () => window.removeEventListener('mousemove', aoMover)
  }, [enviarCursor])

  // Presença ao vivo: quem está conectado na sala (pelo papel do participante).
  const gestorPresente = participantes.some((p) => p.papel === 'gestor')
  const lideradoPresente = participantes.some((p) => p.papel === 'liderado')

  return (
    <LayoutApp>
      {/* Cabeçalho: a dupla + quem está ao vivo */}
      <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-cartao)] border border-borda bg-creme p-5 shadow-[var(--shadow-cartao)]">
        {/* A dupla. As etiquetas mudam conforme quem está vendo: o gestor é "você"
            para si mesmo; para o liderado, o gestor vira "sua dupla" e o liderado
            é quem ganha o "você". Ambos estão na MESMA sala ao vivo. */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Persona
            inicial="G"
            nome={ehGestor ? primeiroGestor : 'Seu gestor'}
            papel={ehGestor ? 'você' : 'sua dupla'}
            cor="var(--color-gestor)"
            presente={gestorPresente}
          />
          <span className="fonte-display text-sm font-bold text-tinta-suave">1:1</span>
          <Persona
            inicial={nomeLiderado.charAt(0).toUpperCase()}
            nome={nomeLiderado.split(' ')[0]}
            papel={ehGestor ? 'liderado' : 'você'}
            cor="var(--color-liderado)"
            presente={lideradoPresente}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Indicador ao vivo + presença */}
          <div className="flex items-center gap-2">
            <span
              className={[
                'h-2.5 w-2.5 rounded-full',
                conectado ? 'animate-pulse bg-sucesso' : 'bg-borda',
              ].join(' ')}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-tinta-suave">
              {conectado ? 'Ao vivo' : 'Conectando…'}
            </span>
            <div className="flex -space-x-1.5 pl-1">
              {participantes.map((p) => (
                <span
                  key={p.id}
                  title={p.nome}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-creme text-[0.65rem] font-bold text-white"
                  style={{ backgroundColor: p.cor }}
                >
                  {p.nome.charAt(0).toUpperCase()}
                </span>
              ))}
            </div>
          </div>
          {/* Copiar o link da sala para o gestor enviar ao liderado entrar no 1:1 ao vivo */}
          {ehGestor && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(`${window.location.origin}/liderado/${id}`)
                setCopiado(true)
                setTimeout(() => setCopiado(false), 2000)
              }}
              title="Copiar o link da sala para enviar ao liderado"
              className="rounded-full border-2 border-borda px-3 py-1 text-sm font-bold text-tinta transition hover:border-juncao hover:text-juncao"
            >
              {copiado ? '✓ Copiado!' : '🔗 Copiar link'}
            </button>
          )}
          <Link to="/painel" className="text-sm font-bold text-juncao hover:underline">
            ← Time
          </Link>
        </div>
      </section>

      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="fonte-display text-xl font-bold text-tinta sm:text-2xl">
            {ehGestor
              ? `Pauta do 1:1 com ${nomeLiderado.split(' ')[0]}`
              : 'Pauta do seu 1:1'}
          </h1>
          <Ajuda titulo="Como funciona o 1:1 ao vivo">
            Gestor e liderado entram na <strong className="text-tinta">mesma sala</strong>: arrastem
            os temas (o outro vê na hora), abram um tema para montar o conteúdo (textos, links,
            imagens, marcos) e usem <strong className="text-tinta">▶ Apresentar</strong> para mostrar
            em tela cheia. Os cursores de cada um aparecem ao vivo.
          </Ajuda>
          {ehGestor && !encerrado && (
            <button
              type="button"
              onClick={() => setEncerrando(true)}
              className="ml-auto rounded-full bg-sucesso px-4 py-1.5 text-sm font-bold text-white shadow-[0_6px_16px_-6px_var(--color-sucesso)] transition hover:brightness-105"
            >
              ✅ Encerrar 1:1
            </button>
          )}
        </div>
        <p className="text-sm text-tinta-suave">
          Arraste os temas (o outro vê ao vivo). Clique no título ou no botão{' '}
          <strong className="text-tinta">Abrir</strong> de um tema para ver e
          editar o conteúdo (textos, links, imagens e marcos).
        </p>
      </div>

      {/* 1:1 ENCERRADO → banner + pontos mapeados (somente leitura, p/ os dois) */}
      {encerrado && (
        <section className="mb-5 overflow-hidden rounded-[var(--radius-cartao)] border-2 border-sucesso/40 bg-sucesso/5 shadow-[var(--shadow-cartao)]">
          <div className="flex flex-wrap items-center gap-3 border-b border-sucesso/30 bg-sucesso/10 px-5 py-3">
            <span className="text-2xl">✅</span>
            <div>
              <h2 className="fonte-display text-lg font-extrabold text-tinta">1:1 encerrado</h2>
              <p className="text-xs font-semibold text-tinta-suave">Modo consulta — os pontos abaixo ficam registrados para os dois.</p>
            </div>
            <Link to="/painel" className="ml-auto rounded-full bg-tinta px-4 py-1.5 text-sm font-bold text-creme transition hover:brightness-110">
              ← Voltar ao time
            </Link>
          </div>
          {encerrado.resumo.trim() && (
            <pre className="whitespace-pre-wrap px-5 py-4 font-sans text-sm leading-relaxed text-tinta">{encerrado.resumo}</pre>
          )}
        </section>
      )}

      {/* Tabuleiro — interativo no 1:1 ao vivo; congelado após encerrar (consulta). */}
      <div className={encerrado ? 'pointer-events-none select-none opacity-70' : ''} aria-disabled={!!encerrado}>
        <TabuleiroPauta
          tabuleiro={tabuleiro}
          setTabuleiro={setTabuleiro}
          aoAbrirTema={(tema) => !encerrado && setTemaAberto(tema.titulo)}
        />
      </div>

      {/* Editor de conteúdo do tema selecionado */}
      <AnimatePresence>
        {temaAberto && (
          <TemaEditor
            colaboradorId={id}
            tema={temaAberto}
            aoFechar={() => setTemaAberto(null)}
            aoMudarConteudo={(t) => enviarTemaAtualizado(t)}
            sinalExterno={sinalTema}
            aoApresentar={(t) => {
              setTemaApresentando(t)
              enviarApresentacao(t, true) // espelha ao vivo para o outro
            }}
          />
        )}
      </AnimatePresence>

      {/* Modo apresentação (tela cheia, sincronizado ao vivo) */}
      {temaApresentando && (
        <ApresentacaoTema
          colaboradorId={id}
          tema={temaApresentando}
          aoFechar={() => {
            const t = temaApresentando
            setTemaApresentando(null)
            enviarApresentacao(t, false)
          }}
        />
      )}

      {/* Encerrar 1:1 (resumo + próximos passos → histórico + timeline) */}
      {encerrando && (
        <EncerrarOneByOne
          colaboradorId={id}
          aoFechar={() => setEncerrando(false)}
          aoEncerrado={(texto) => {
            enviarTemaAtualizado(TEMA_HISTORICO) // recarrega o histórico no editor
            enviarEncerrado(texto) // avisa a sala: os dois caem no modo consulta
            setEncerrado({ resumo: texto }) // garante o flip do gestor mesmo sem o eco
          }}
        />
      )}

      {/* Cursores dos outros participantes */}
      <CursoresAoVivo cursores={cursores} participantesPorId={participantesPorId} />
    </LayoutApp>
  )
}

// Wrapper de rota: força REMONTAR a página a cada liderado (key={id}). Sem isso,
// navegar de /liderado/A para /liderado/B reaproveitaria o estado (tabuleiro,
// carregado…) e poderia salvar a pauta de A no id de B. O key zera tudo.
export function PaginaOneByOneRota() {
  const { id = '' } = useParams()
  return <PaginaOneByOne key={id} />
}
