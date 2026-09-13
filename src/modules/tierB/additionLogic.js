export const MAX_LEVEL = 9

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Penjumlahan sampai ~20, sesuai kurikulum TK-Kelas 1.
export function makeQuestion(level) {
  const maxOperand = Math.min(10, 1 + level)
  const a = randInt(1, maxOperand)
  const b = randInt(1, maxOperand)
  const answer = a + b
  // Format "a + ? = c" muncul mulai level 5, melatih pemahaman relasi bukan cuma hafalan.
  const missingAddend = level >= 5 && Math.random() < 0.4
  const target = missingAddend ? b : answer
  const options = new Set([target])
  while (options.size < 4) {
    const delta = randInt(-3, 3) || 1
    options.add(Math.max(0, target + delta))
  }
  return {
    prompt: missingAddend ? `${a} + ? = ${answer}` : `${a} + ${b} = ?`,
    target,
    options: [...options].sort(() => Math.random() - 0.5),
  }
}
