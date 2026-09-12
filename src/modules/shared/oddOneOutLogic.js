// Bank kategori besar dipakai bersama oleh game "Cari yang Beda" Tier B dan Tier C.
// Tiap kategori punya 10 anggota supaya kombinasi soal (3 anggota acak + 1 pengecoh) sangat bervariasi.
export const CATEGORIES = {
  fruits: ['🍎', '🍌', '🍊', '🍇', '🍓', '🍍', '🥭', '🍑', '🍒', '🥝'],
  vegetables: ['🥕', '🥦', '🌽', '🥔', '🍅', '🥒', '🧅', '🍆', '🥬', '🫑'],
  animals: ['🐶', '🐱', '🐮', '🐷', '🐴', '🐑', '🐘', '🦁', '🐹', '🐭'],
  seaAnimals: ['🐟', '🐬', '🐳', '🐙', '🦀', '🐠', '🦐', '🐢', '🦑', '🐡'],
  vehicles: ['🚗', '🚌', '🚲', '✈️', '🚂', '🚢', '🚁', '🏍️', '🚕', '🛵'],
  shapes: ['🔺', '🔵', '🟩', '⭐', '🟣', '🔶', '💎', '🟥', '🔷', '🟡'],
  instruments: ['🎸', '🥁', '🎺', '🎻', '🎹', '🪕', '🎷', '🪘', '🪗', '📯'],
  clothing: ['👕', '👖', '🧦', '👗', '🧥', '👒', '👟', '🧤', '🧣', '👞'],
  sky: ['☀️', '🌙', '☁️', '🌈', '⚡', '🌧️', '❄️', '🌫️', '🌠', '🌪️'],
  bugs: ['🐝', '🦋', '🐞', '🐛', '🦗', '🐜', '🕷️', '🐌', '🪲', '🦟'],
  desserts: ['🍰', '🍩', '🍪', '🍦', '🎂', '🍫', '🍭', '🍿', '🧁', '🍬'],
  sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🥊', '🏸', '⛳'],
}

// Kategori yang jelas berbeda - mudah dibedakan.
export const EASY_PAIRINGS = [
  ['fruits', 'vehicles'],
  ['animals', 'shapes'],
  ['instruments', 'vegetables'],
  ['clothing', 'seaAnimals'],
  ['bugs', 'vehicles'],
  ['sky', 'shapes'],
  ['desserts', 'vehicles'],
  ['sports', 'sky'],
]

// Kategori masih beda domain tapi lebih dekat - butuh perhatian lebih.
export const MEDIUM_PAIRINGS = [
  ['fruits', 'vegetables'],
  ['animals', 'seaAnimals'],
  ['vehicles', 'instruments'],
  ['clothing', 'instruments'],
  ['bugs', 'seaAnimals'],
  ['shapes', 'sky'],
  ['desserts', 'fruits'],
  ['sports', 'instruments'],
]

// Kategori paling dekat/subtil - paling menantang.
export const HARD_PAIRINGS = [
  ['animals', 'bugs'],
  ['vegetables', 'fruits'],
  ['seaAnimals', 'bugs'],
  ['vehicles', 'sky'],
  ['desserts', 'vegetables'],
]

function shuffled(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function makeRound(pairings) {
  const [majorityCategory, oddCategory] = pairings[Math.floor(Math.random() * pairings.length)]
  const majorityItems = shuffled(CATEGORIES[majorityCategory]).slice(0, 3)
  const oddItem = CATEGORIES[oddCategory][Math.floor(Math.random() * CATEGORIES[oddCategory].length)]
  return { items: shuffled([...majorityItems, oddItem]), oddItem }
}
