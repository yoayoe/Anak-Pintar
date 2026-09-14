export const MAX_LEVEL = 6

const NUMBER_WORDS = ['satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh']
export const NUMBERS = NUMBER_WORDS.map((word, i) => ({ label: String(i + 1), speech: word }))
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((ch) => ({ label: ch, speech: ch }))

function shuffled(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

// Sama pola dengan colorMatchLogic: makin tinggi level, makin banyak pilihan (2 -> 8).
export function makeRound(level) {
  const kind = Math.random() < 0.5 ? 'number' : 'letter'
  const pool = kind === 'number' ? NUMBERS : LETTERS
  const count = Math.min(pool.length, 2 + level)
  const picks = shuffled(pool).slice(0, count)
  const target = picks[Math.floor(Math.random() * picks.length)]
  return { kind, target, options: shuffled(picks) }
}
