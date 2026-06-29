// Arquivo: src/componentes/auth/RequisitosSenha.tsx
// Descrição: Checklist VIVO dos requisitos de senha (espelha a política do backend
//            pkg/senha: ≥ 8 caracteres, com maiúscula, minúscula e número). Vai ficando
//            verde conforme a pessoa digita. Reutilizado no cadastro e na redefinição.

export interface RequisitoSenha {
  rotulo: string
  ok: boolean
}

// requisitosSenha avalia cada regra para uma senha.
export function requisitosSenha(s: string): RequisitoSenha[] {
  return [
    { rotulo: 'Pelo menos 8 caracteres', ok: s.length >= 8 },
    { rotulo: 'Uma letra maiúscula', ok: /[A-Z]/.test(s) },
    { rotulo: 'Uma letra minúscula', ok: /[a-z]/.test(s) },
    { rotulo: 'Um número', ok: /[0-9]/.test(s) },
  ]
}

// senhaForte diz se a senha cumpre TODOS os requisitos.
export function senhaForte(s: string): boolean {
  return requisitosSenha(s).every((r) => r.ok)
}

// RequisitosSenha mostra a lista de regras, marcando em verde as já cumpridas.
export function RequisitosSenha({ senha }: { senha: string }) {
  const reqs = requisitosSenha(senha)
  return (
    <ul className="flex flex-col gap-1 rounded-[var(--radius-suave)] bg-areia-escura/30 px-3 py-2 text-xs">
      {reqs.map((r) => (
        <li key={r.rotulo} className={`flex items-center gap-2 transition-colors ${r.ok ? 'font-semibold text-sucesso' : 'text-tinta-suave'}`}>
          <span className="text-sm">{r.ok ? '✓' : '○'}</span>
          {r.rotulo}
        </li>
      ))}
    </ul>
  )
}
