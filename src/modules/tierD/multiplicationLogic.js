export const MAX_LEVEL = 10

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function makeQuestion(level) {
  const maxFactor = Math.min(12, 2 + level)
  const a = randInt(2, maxFactor)
  const b = randInt(2, maxFactor)
  const answer = a * b
  // Missing-factor format ("a x ? = c") adds variety once the level is high enough.
  const missingFactor = level >= 5 && Math.random() < 0.4
  const target = missingFactor ? b : answer
  const options = new Set([target])
  while (options.size < 4) {
    const delta = randInt(-4, 4) || 1
    options.add(Math.max(1, target + delta))
  }
  return {
    prompt: missingFactor ? `${a} × ? = ${answer}` : `${a} × ${b} = ?`,
    target,
    options: [...options].sort(() => Math.random() - 0.5),
  }
}
