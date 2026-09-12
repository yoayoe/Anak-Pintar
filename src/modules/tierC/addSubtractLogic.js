export const MAX_LEVEL = 10

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Penjumlahan & pengurangan dua digit, sesuai kurikulum kelas 2-3.
export function makeQuestion(level) {
  const maxOperand = Math.min(50, 5 + level * 5)
  const isAddition = Math.random() < 0.5
  let a = randInt(1, maxOperand)
  let b = randInt(1, maxOperand)
  if (!isAddition && a < b) [a, b] = [b, a] // hindari hasil negatif
  const answer = isAddition ? a + b : a - b
  // Format "a op ? = c" muncul mulai level 6, melatih relasi bukan cuma hafalan urutan.
  const missingOperand = level >= 6 && Math.random() < 0.4
  const target = missingOperand ? b : answer
  const options = new Set([target])
  while (options.size < 4) {
    const delta = randInt(-6, 6) || 1
    options.add(Math.max(0, target + delta))
  }
  const opSymbol = isAddition ? '+' : '-'
  return {
    prompt: missingOperand ? `${a} ${opSymbol} ? = ${answer}` : `${a} ${opSymbol} ${b} = ?`,
    target,
    options: [...options].sort(() => Math.random() - 0.5),
  }
}
