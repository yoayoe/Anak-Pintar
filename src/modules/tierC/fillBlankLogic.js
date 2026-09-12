export const MAX_LEVEL = 8

export const EASY_SENTENCES = [
  { sentence: 'She ___ happy today.', answer: 'is', distractors: ['are', 'am', 'be'] },
  { sentence: 'They ___ playing football.', answer: 'are', distractors: ['is', 'am', 'was'] },
  { sentence: 'He ___ to school every day.', answer: 'goes', distractors: ['go', 'going', 'went'] },
  { sentence: 'I ___ two brothers.', answer: 'have', distractors: ['has', 'having', 'had'] },
  { sentence: 'The dog ___ under the table.', answer: 'is', distractors: ['are', 'am', 'be'] },
  { sentence: 'We ___ happy to see you.', answer: 'are', distractors: ['is', 'am', 'be'] },
  { sentence: 'This is ___ apple.', answer: 'an', distractors: ['a', 'the', 'some'] },
  { sentence: 'I saw ___ elephant at the zoo.', answer: 'an', distractors: ['a', 'the', 'some'] },
  { sentence: 'There ___ many books on the shelf.', answer: 'are', distractors: ['is', 'am', 'was'] },
  { sentence: 'My sister ___ a doctor.', answer: 'is', distractors: ['are', 'am', 'be'] },
  { sentence: 'The cats ___ sleeping now.', answer: 'are', distractors: ['is', 'am', 'was'] },
  { sentence: 'My mother ___ to work by car.', answer: 'goes', distractors: ['go', 'going', 'went'] },
  { sentence: 'He ___ a red car.', answer: 'has', distractors: ['have', 'having', 'had'] },
  { sentence: 'The birds ___ singing in the tree.', answer: 'are', distractors: ['is', 'am', 'was'] },
  { sentence: 'I ___ my homework every day.', answer: 'do', distractors: ['does', 'doing', 'did'] },
  { sentence: 'This is ___ umbrella.', answer: 'an', distractors: ['a', 'the', 'some'] },
  { sentence: 'The children ___ playing outside.', answer: 'are', distractors: ['is', 'am', 'was'] },
  { sentence: 'My brother ___ tall.', answer: 'is', distractors: ['are', 'am', 'be'] },
]

export const HARD_SENTENCES = [
  { sentence: 'Yesterday, I ___ to the park.', answer: 'went', distractors: ['go', 'goes', 'going'] },
  { sentence: 'She is ___ than her brother.', answer: 'taller', distractors: ['tall', 'tallest', 'more tall'] },
  { sentence: 'This cake is ___ than that one.', answer: 'bigger', distractors: ['big', 'biggest', 'more big'] },
  { sentence: 'He ___ his keys yesterday.', answer: 'lost', distractors: ['lose', 'loses', 'losing'] },
  { sentence: 'We ___ to the beach last summer.', answer: 'went', distractors: ['go', 'goes', 'going'] },
  { sentence: 'That is the ___ mountain in the world.', answer: 'tallest', distractors: ['taller', 'tall', 'more tall'] },
  { sentence: 'She ___ her homework yesterday.', answer: 'finished', distractors: ['finish', 'finishes', 'finishing'] },
  { sentence: 'They ___ a movie last night.', answer: 'watched', distractors: ['watch', 'watches', 'watching'] },
  { sentence: 'This puzzle is ___ than I thought.', answer: 'harder', distractors: ['hard', 'hardest', 'more hard'] },
  { sentence: 'My dad ___ dinner every night.', answer: 'cooks', distractors: ['cook', 'cooking', 'cooked'] },
  { sentence: 'I ___ my homework before dinner.', answer: 'did', distractors: ['do', 'does', 'doing'] },
  { sentence: 'The baby ___ all afternoon.', answer: 'slept', distractors: ['sleep', 'sleeps', 'sleeping'] },
  { sentence: 'This book is ___ than that one.', answer: 'thinner', distractors: ['thin', 'thinnest', 'more thin'] },
  { sentence: 'They ___ to the zoo tomorrow.', answer: 'will go', distractors: ['go', 'goes', 'going'] },
  { sentence: 'This is the ___ book I have read.', answer: 'best', distractors: ['better', 'good', 'well'] },
  { sentence: 'My grandmother ___ stories every night.', answer: 'tells', distractors: ['tell', 'telling', 'told'] },
  { sentence: 'The sun ___ in the east.', answer: 'rises', distractors: ['rise', 'rising', 'rose'] },
  { sentence: "We ___ a big cake for her birthday.", answer: 'made', distractors: ['make', 'makes', 'making'] },
]

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function makeRound(level) {
  const pool = level >= 5 ? HARD_SENTENCES : EASY_SENTENCES
  const pick = pool[randInt(0, pool.length - 1)]
  const options = [pick.answer, ...pick.distractors].sort(() => Math.random() - 0.5)
  return { sentence: pick.sentence, answer: pick.answer, options }
}
