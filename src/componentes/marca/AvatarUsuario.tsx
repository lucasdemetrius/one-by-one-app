// Arquivo: src/componentes/marca/AvatarUsuario.tsx
// Descrição: Avatar do usuário — mostra a foto (URL presignada do S3) ou, se não
//            houver ou a URL falhar/expirar, cai no círculo com a inicial.

import { useEffect, useState } from 'react'

interface AvatarUsuarioProps {
  fotoUrl?: string | null
  nome: string
  // Tamanho em pixels (largura = altura).
  tamanho?: number
}

export function AvatarUsuario({ fotoUrl, nome, tamanho = 40 }: AvatarUsuarioProps) {
  // Se a imagem falhar ao carregar (ex.: URL presignada expirada), usa a inicial.
  const [erro, setErro] = useState(false)
  useEffect(() => setErro(false), [fotoUrl])

  const inicial = (nome.charAt(0) || '?').toUpperCase()

  if (fotoUrl && !erro) {
    return (
      <img
        src={fotoUrl}
        alt={nome}
        onError={() => setErro(true)}
        style={{ width: tamanho, height: tamanho }}
        className="shrink-0 rounded-full object-cover"
      />
    )
  }

  return (
    <span
      className="gradiente-marca flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.4 }}
    >
      {inicial}
    </span>
  )
}
