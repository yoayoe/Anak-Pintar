export const MAX_LEVEL = 6

export const EASY_WORDS = [
  { emoji: '🍎', word: 'Apple' },
  { emoji: '🍌', word: 'Banana' },
  { emoji: '⚽', word: 'Ball' },
  { emoji: '📖', word: 'Book' },
  { emoji: '🏠', word: 'House' },
  { emoji: '☀️', word: 'Sun' },
  { emoji: '🌙', word: 'Moon' },
  { emoji: '⭐', word: 'Star' },
  { emoji: '🥛', word: 'Milk' },
  { emoji: '🥚', word: 'Egg' },
  { emoji: '🎩', word: 'Hat' },
  { emoji: '👟', word: 'Shoe' },
  { emoji: '🐟', word: 'Fish' },
  { emoji: '🐦', word: 'Bird' },
]

export const HARD_WORDS = [
  { emoji: '🐘', word: 'Elephant' },
  { emoji: '☂️', word: 'Umbrella' },
  { emoji: '🦋', word: 'Butterfly' },
  { emoji: '⛰️', word: 'Mountain' },
  { emoji: '🚲', word: 'Bicycle' },
  { emoji: '🍓', word: 'Strawberry' },
  { emoji: '🎸', word: 'Guitar' },
  { emoji: '🌈', word: 'Rainbow' },
  { emoji: '🦕', word: 'Dinosaur' },
  { emoji: '🥪', word: 'Sandwich' },
  { emoji: '🔭', word: 'Telescope' },
  { emoji: '🌋', word: 'Volcano' },
  { emoji: '🐧', word: 'Penguin' },
  { emoji: '🐙', word: 'Octopus' },
]

function shuffled(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function makeRound(level) {
  const pool = level >= 4 ? HARD_WORDS : EASY_WORDS
  const pick = pool[Math.floor(Math.random() * pool.length)]
  const distractors = shuffled(pool.filter((w) => w.word !== pick.word))
    .slice(0, 3)
    .map((w) => w.word)
  return { emoji: pick.emoji, answer: pick.word, options: shuffled([pick.word, ...distractors]) }
}
