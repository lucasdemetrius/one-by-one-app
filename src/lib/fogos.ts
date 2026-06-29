// Arquivo: src/lib/fogos.ts
// Descrição: Dispara fogos de artifício na tela (canvas-confetti) para comemorar
//            momentos especiais — como a criação da conta do gestor. Usa as cores
//            da marca. Chamada imperativa, não precisa de componente.

import confetti from 'canvas-confetti'

// Cores do gradiente da marca (violeta, coral, esmeralda, índigo).
const CORES = ['#7c5cff', '#fb7185', '#2ee6ad', '#6366f1', '#ff9e6d']

// Sorteia um número entre min e max (usado para variar as explosões).
function entre(min: number, max: number) {
  return Math.random() * (max - min) + min
}

// fogos dispara várias explosões durante `duracaoMs` (padrão 3s) — "muitos fogos".
export function fogos(duracaoMs = 3000) {
  const fim = Date.now() + duracaoMs

  // Explosões laterais contínuas (chuva de confete vindo das bordas).
  ;(function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 60,
      startVelocity: 55,
      origin: { x: 0, y: 0.7 },
      colors: CORES,
    })
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 60,
      startVelocity: 55,
      origin: { x: 1, y: 0.7 },
      colors: CORES,
    })
    if (Date.now() < fim) requestAnimationFrame(frame)
  })()

  // Explosões aleatórias pelo céu (os "fogos" de fato), uma a cada 250ms.
  const intervalo = setInterval(() => {
    if (Date.now() > fim) {
      clearInterval(intervalo)
      return
    }
    confetti({
      particleCount: 80,
      spread: 360,
      startVelocity: 35,
      gravity: 0.9,
      ticks: 200,
      origin: { x: entre(0.2, 0.8), y: entre(0.15, 0.5) },
      colors: CORES,
      scalar: 1.1,
    })
  }, 250)
}
