// Arquivo: src/componentes/SeletorTema.tsx
// Descrição: Botão flutuante (canto inferior direito) que abre as opções de tema.
//            Fica logo ACIMA do botão de chat de IA (empilhados no mesmo canto).
//            A escolha é lembrada entre sessões.

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { TEMAS, useTema } from '@/recursos/tema/TemaContext'

export function SeletorTema() {
  const { tema, definirTema } = useTema()
  const [aberto, setAberto] = useState(false)

  return (
    <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end gap-3">
      {/* Lista de temas (aparece ao abrir) */}
      <AnimatePresence>
        {aberto && (
          <motion.ul
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="flex w-64 flex-col gap-1.5 rounded-[var(--radius-cartao)] border-2 border-borda bg-creme p-2 shadow-[var(--shadow-flutuante)]"
          >
            <li className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wider text-tinta-suave">
              Escolha o visual
            </li>
            {TEMAS.map((opcao) => {
              const ativo = tema === opcao.id
              return (
                <li key={opcao.id}>
                  <button
                    type="button"
                    onClick={() => definirTema(opcao.id)}
                    className={[
                      'flex w-full items-center gap-3 rounded-[var(--radius-suave)] px-3 py-2.5 text-left transition-colors',
                      ativo ? 'bg-areia-escura' : 'hover:bg-areia',
                    ].join(' ')}
                  >
                    {/* Amostra das 3 cores do tema */}
                    <span className="flex shrink-0 gap-1">
                      {opcao.amostra.map((cor, i) => (
                        <span
                          key={i}
                          className="h-4 w-4 rounded-full border border-black/10"
                          style={{ backgroundColor: cor }}
                        />
                      ))}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-tinta">
                        {opcao.nome}
                      </span>
                      <span className="block truncate text-xs text-tinta-suave">
                        {opcao.descricao}
                      </span>
                    </span>
                    {/* Marca de selecionado */}
                    {ativo && <span className="text-juncao">●</span>}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Botão que abre/fecha o seletor */}
      <motion.button
        type="button"
        onClick={() => setAberto((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Trocar o visual do app"
        className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-borda bg-creme text-2xl shadow-[var(--shadow-flutuante)]"
      >
        🎨
      </motion.button>
    </div>
  )
}
