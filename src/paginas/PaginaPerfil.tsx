// Arquivo: src/paginas/PaginaPerfil.tsx
// Descrição: Página de perfil do usuário logado (gestor ou liderado). Mostra os
//            dados e permite trocar a foto de perfil (upload para o S3 via API).

import { useRef, useState } from 'react'

import { useAuth } from '@/recursos/auth/AuthContext'
import { enviarFotoPerfil } from '@/recursos/auth/authApi'
import { extrairMensagemErro } from '@/lib/api'
import { LayoutApp } from './LayoutApp'
import { Botao } from '@/componentes/ui/Botao'
import { AvatarUsuario } from '@/componentes/marca/AvatarUsuario'
import { ConfigIA } from '@/componentes/ia/ConfigIA'

export function PaginaPerfil() {
  const { usuario, atualizarUsuario } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  if (!usuario) return null

  const persona = usuario.role === 'LIDER' ? 'Gestor' : 'Liderado'

  // Dispara o seletor de arquivo escondido.
  function escolherArquivo() {
    inputRef.current?.click()
  }

  async function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo || !usuario) return

    if (!arquivo.type.startsWith('image/')) {
      setErro('Escolha um arquivo de imagem (JPEG, PNG ou WebP).')
      return
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      setErro('A imagem deve ter no máximo 5MB.')
      return
    }

    setErro('')
    setEnviando(true)
    try {
      const atualizado = await enviarFotoPerfil(usuario.id, arquivo)
      atualizarUsuario(atualizado) // reflete a nova foto no header na hora
    } catch (err) {
      setErro(extrairMensagemErro(err))
    } finally {
      setEnviando(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <LayoutApp>
      <div className="mx-auto max-w-xl">
        <h1 className="fonte-display text-3xl font-extrabold text-tinta">Meu perfil</h1>
        <p className="mt-1 text-tinta-suave">Sua foto e seus dados.</p>

        <div className="mt-8 rounded-[var(--radius-cartao)] border border-borda bg-creme p-8 shadow-[var(--shadow-cartao)]">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            {/* Avatar (clicável) com selo de câmera */}
            <button
              type="button"
              onClick={escolherArquivo}
              disabled={enviando}
              aria-label="Trocar foto de perfil"
              className="relative shrink-0"
            >
              <AvatarUsuario fotoUrl={usuario.foto_url} nome={usuario.nome} tamanho={112} />
              <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-creme bg-tinta text-sm text-creme">
                {enviando ? '…' : '📷'}
              </span>
            </button>

            <div className="text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-juncao">
                {persona}
              </span>
              <h2 className="fonte-display text-2xl font-bold text-tinta">{usuario.nome}</h2>
              <p className="text-tinta-suave">{usuario.email}</p>
              <div className="mt-4 flex justify-center sm:justify-start">
                <Botao variante="contorno" onClick={escolherArquivo} carregando={enviando}>
                  {usuario.foto_url ? 'Trocar foto' : 'Adicionar foto'}
                </Botao>
              </div>
            </div>
          </div>

          {erro && <p className="mt-5 text-sm font-medium text-alerta">{erro}</p>}

          {/* Input de arquivo escondido — acionado pelos botões acima */}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={aoEscolher}
            className="hidden"
          />
        </div>

        {/* Conexão com IA (BYOK): gestor conecta a sua; RH conecta a do tenant (herdada pelos gestores). */}
        {(usuario?.role === 'LIDER' || usuario?.role === 'RH') && <ConfigIA />}
      </div>
    </LayoutApp>
  )
}
