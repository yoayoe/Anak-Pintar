export const MAX_LEVEL = 10
export const SHAPES = ['🔺', '🔵', '🟩', '⭐', '🟣', '🟥', '🟧', '💎', '🔶', '🟢']

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeAdditiveSequence(level) {
  const step = randInt(1, Math.min(9, 1 + Math.floor(level / 2)))
  const direction = Math.random() < 0.5 ? 1 : -1
  const start = direction === 1 ? randInt(1, 10) : randInt(30, 60)
  const length = 5
  const seq = Array.from({ length }, (_, i) => start + i * step * direction)
  return { shown: seq.slice(0, length - 1), answer: seq[length - 1], kind: 'number' }
}

function makeMultiplicativeSequence() {
  const ratio = randInt(2, 3)
  const start = randInt(1, 4)
  const length = 5
  const seq = Array.from({ length }, (_, i) => start * ratio ** i)
  return { shown: seq.slice(0, length - 1), answer: seq[length - 1], kind: 'number' }
}

function makeNumberSequence(level) {
  if (level >= 6 && Math.random() < 0.4) return makeMultiplicativeSequence()
  return makeAdditiveSequence(level)
}

function makeShapePattern(level) {
  const periodLen = level < 4 ? 2 : level < 8 ? 3 : 4
  const period = Array.from({ length: periodLen }, () => SHAPES[randInt(0, SHAPES.length - 1)])
  const totalLen = periodLen * 2 + 1
  const seq = Array.from({ length: totalLen }, (_, i) => period[i % periodLen])
  return { shown: seq.slice(0, totalLen - 1), answer: seq[totalLen - 1], kind: 'shape' }
}

export function makeRound(level) {
  const base = Math.random() < 0.5 ? makeNumberSequence(level) : makeShapePattern(level)
  const distractPool =
    base.kind === 'number'
      ? [base.answer + 1, base.answer - 1, base.answer + 2].filter((v) => v !== base.answer)
      : SHAPES.filter((s) => s !== base.answer)
  const options = new Set([base.answer])
  let i = 0
  while (options.size < 4 && i < distractPool.length) {
    options.add(distractPool[i])
    i++
  }
  while (options.size < 4) {
    options.add(base.kind === 'number' ? base.answer + options.size : SHAPES[randInt(0, SHAPES.length - 1)])
  }
  return { ...base, options: [...options].sort(() => Math.random() - 0.5) }
}
