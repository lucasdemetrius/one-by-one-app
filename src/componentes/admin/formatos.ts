// Arquivo: src/componentes/admin/formatos.ts
// Descrição: Helpers de formatação do painel de admin (rótulos de papel, datas). Ficam num
//            arquivo SÓ de funções/constantes (sem componentes) para o fast-refresh do Vite
//            não reclamar de export misto em Graficos.tsx.

// Rótulo amigável de cada papel (técnico → persona).
export const PAPEL_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  RH: 'RH',
  LIDER: 'Gestores',
  COLABORADOR: 'Liderados',
  ANONIMO: 'Anônimo',
}

// 'YYYY-MM-DD' → 'DD/MM'
export function diaCurto(d: string): string {
  const p = d.split('-')
  return p.length === 3 ? `${p[2]}/${p[1]}` : d
}

// ISO → 'DD/MM HH:mm' (ou '—' quando vazio)
export function quando(iso: string | null): string {
  if (!iso) return '—'
  const dt = new Date(iso)
  const dois = (n: number) => String(n).padStart(2, '0')
  return `${dois(dt.getDate())}/${dois(dt.getMonth() + 1)} ${dois(dt.getHours())}:${dois(dt.getMinutes())}`
}
