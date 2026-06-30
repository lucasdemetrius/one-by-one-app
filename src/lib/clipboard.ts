// Arquivo: src/lib/clipboard.ts
// Descrição: Copiar texto para a área de transferência de forma ROBUSTA.
//            A API moderna (navigator.clipboard) só existe em "contexto seguro"
//            — HTTPS ou localhost. Em HTTP puro (ex.: acessar o app pelo IP) ela
//            vem `undefined` e a cópia falha em silêncio. Por isso caímos para o
//            método legado (textarea escondido + execCommand) quando a moderna
//            não está disponível. Retorna `true` somente se a cópia ocorreu —
//            assim a tela só mostra "✓ copiado" quando realmente copiou.

export async function copiarTexto(texto: string): Promise<boolean> {
  // 1) Caminho moderno — só funciona em contexto seguro (HTTPS/localhost).
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(texto)
      return true
    } catch {
      // Permissão negada ou indisponível — tenta o fallback abaixo.
    }
  }

  // 2) Fallback (HTTP/IP): cria um <textarea> fora da tela, seleciona e copia.
  try {
    const area = document.createElement('textarea')
    area.value = texto
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.top = '-1000px'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.focus()
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}
