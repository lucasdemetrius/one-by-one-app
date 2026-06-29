// Arquivo: src/componentes/ia/LogosIA.tsx
// Descrição: Logos (marca) de cada provedor de IA + metadados (cor, label, onde
//            pegar a chave). Renderizados como um "badge" arredondado na cor da
//            marca com o glifo branco. Usados nos cartões de seleção e no chat.

import type { ProvedorIA } from '@/recursos/ia/iaApi'

// Metadados visuais de cada provedor (cor da marca + textos).
export const META_IA: Record<ProvedorIA, { nome: string; empresa: string; cor: string; ajuda: string }> = {
  CLAUDE: { nome: 'Claude', empresa: 'Anthropic', cor: '#CC785C', ajuda: 'console.anthropic.com' },
  OPENAI: { nome: 'ChatGPT', empresa: 'OpenAI', cor: '#0DA37F', ajuda: 'platform.openai.com' },
  DEEPSEEK: { nome: 'DeepSeek', empresa: 'DeepSeek', cor: '#4D6BFE', ajuda: 'platform.deepseek.com' },
  GROK: { nome: 'Grok', empresa: 'xAI', cor: '#111114', ajuda: 'console.x.ai' },
}

// Glifo (branco, currentColor) de cada provedor — desenho próprio, inspirado na marca.
function Glifo({ id }: { id: ProvedorIA }) {
  switch (id) {
    case 'CLAUDE':
      // Estrela/sunburst da Anthropic (raios saindo do centro).
      return (
        <g stroke="#fff" strokeWidth={2.1} strokeLinecap="round">
          {Array.from({ length: 12 }).map((_, i) => {
            const ang = (i * 30 * Math.PI) / 180
            const x = 12 + Math.cos(ang) * 7
            const y = 12 + Math.sin(ang) * 7
            return <line key={i} x1={12} y1={12} x2={x} y2={y} />
          })}
        </g>
      )
    case 'OPENAI':
      // Flor/nó da OpenAI, aproximado por três elipses entrelaçadas.
      return (
        <g fill="none" stroke="#fff" strokeWidth={1.7}>
          <ellipse cx={12} cy={12} rx={4} ry={8.5} />
          <ellipse cx={12} cy={12} rx={4} ry={8.5} transform="rotate(60 12 12)" />
          <ellipse cx={12} cy={12} rx={4} ry={8.5} transform="rotate(120 12 12)" />
        </g>
      )
    case 'DEEPSEEK':
      // Onda/baleia estilizada.
      return (
        <g fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3" />
          <circle cx={17} cy={8.5} r={1.1} fill="#fff" stroke="none" />
        </g>
      )
    case 'GROK':
      // Barra/corte diagonal do Grok (xAI).
      return (
        <g stroke="#fff" strokeWidth={2.4} strokeLinecap="round">
          <line x1={6} y1={18} x2={18} y2={6} />
          <line x1={9.5} y1={6} x2={18} y2={6} />
          <line x1={6} y1={18} x2={14.5} y2={18} />
        </g>
      )
  }
}

// LogoIA: badge quadrado-arredondado na cor da marca com o glifo branco.
export function LogoIA({ id, tamanho = 44 }: { id: ProvedorIA; tamanho?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-[28%] shadow-[var(--shadow-cartao)]"
      style={{ width: tamanho, height: tamanho, backgroundColor: META_IA[id].cor }}
    >
      <svg width={tamanho * 0.62} height={tamanho * 0.62} viewBox="0 0 24 24" aria-hidden>
        <Glifo id={id} />
      </svg>
    </span>
  )
}
