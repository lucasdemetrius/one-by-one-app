// Arquivo: src/componentes/marca/Logo.tsx
// Descrição: Marca do OneByOne. O símbolo são dois círculos que se conectam —
//            o gestor (petróleo) e o liderado (terracota) encontrando-se no 1:1.
//            Reforça a ideia de "co-op" já na identidade visual.

interface LogoProps {
  // Tamanho do símbolo em pixels (a tipografia acompanha proporcionalmente).
  tamanho?: number
  // Quando false, mostra só o símbolo (sem o texto "OneByOne").
  comTexto?: boolean
}

export function Logo({ tamanho = 36, comTexto = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Símbolo: dois círculos com uma interseção (o ponto de encontro do 1:1) */}
      <svg
        width={tamanho}
        height={tamanho}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="18" cy="24" r="13" fill="var(--color-gestor)" />
        <circle cx="30" cy="24" r="13" fill="var(--color-liderado)" fillOpacity="0.92" />
      </svg>

      {comTexto && (
        <span className="flex flex-col justify-center leading-none">
          <span
            className="fonte-display font-semibold text-tinta"
            style={{ fontSize: tamanho * 0.62 }}
          >
            One<span className="text-juncao">by</span>One
          </span>
          {/* Assinatura discreta da marca/empresa — o domínio é teambox.com.br.
              Posiciona o OneByOne como o PRODUTO e o TeamBox como a EMPRESA. */}
          <span
            className="tracking-wide text-tinta-suave"
            style={{ fontSize: tamanho * 0.36, marginTop: tamanho * 0.08 }}
          >
            by <span className="font-bold">TeamBox</span>
          </span>
        </span>
      )}
    </div>
  )
}
