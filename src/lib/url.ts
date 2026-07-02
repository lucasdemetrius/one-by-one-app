// Arquivo: src/lib/url.ts
// Descrição: Sanitização de URLs vindas de conteúdo do usuário (ex.: bloco de tema
//            do tipo LINK). O React NÃO bloqueia href="javascript:...", então um link
//            malicioso salvo por uma das partes do 1:1 executaria script na outra ao
//            ser clicado (roubo do token). Aqui só deixamos passar http/https/mailto;
//            qualquer outro esquema (javascript:, data:, vbscript:…) vira link inerte.

const ESQUEMAS_PERMITIDOS = ['http:', 'https:', 'mailto:']

// urlSegura devolve a URL se o esquema for seguro; senão devolve undefined (o chamador
// usa como href e o link fica sem destino, sem executar nada).
export function urlSegura(bruta: string | null | undefined): string | undefined {
  if (!bruta) return undefined
  const valor = bruta.trim()
  try {
    // Base garante que URLs relativas ("/x", "pagina") sejam resolvidas e aceitas.
    const u = new URL(valor, window.location.origin)
    return ESQUEMAS_PERMITIDOS.includes(u.protocol) ? valor : undefined
  } catch {
    return undefined
  }
}
