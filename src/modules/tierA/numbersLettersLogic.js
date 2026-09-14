// Numbers: 1-10 dibagi 2 level (Level 1-5: angka 1-5, Level 6-10: angka 6-10)
export const MAX_LEVEL_NUMBERS = 10

// Letters: A-Z dibagi 5 kelompok, 2 level per kelompok
// Lv1-2: A-E, Lv3-4: F-J, Lv5-6: K-O, Lv7-8: P-T, Lv9-10: U-Z
export const MAX_LEVEL_LETTERS = 10

const NUMBER_WORDS = ['satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh']
export const NUMBERS = NUMBER_WORDS.map((word, i) => ({ label: String(i + 1), speech: word }))
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((ch) => ({ label: ch, speech: ch }))

// Nama huruf dalam Bahasa Indonesia yang lebih familiar untuk anak
const LETTER_NAMES = {
  A:'A', B:'Be', C:'Ce', D:'De', E:'E', F:'Ef', G:'Ge', H:'Ha', I:'I',
  J:'Je', K:'Ka', L:'El', M:'Em', N:'En', O:'O', P:'Pe', Q:'Ki', R:'Er',
  S:'Es', T:'Te', U:'U', V:'Ve', W:'We', X:'Eks', Y:'Ye', Z:'Zet',
}

function shuffled(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

// Pool huruf per level group (setiap 2 level, 1 kelompok 5-6 huruf)
function lettersForLevel(level) {
  const groups = [
    LETTERS.slice(0, 5),   // A-E  (Lv 1-2)
    LETTERS.slice(5, 10),  // F-J  (Lv 3-4)
    LETTERS.slice(10, 15), // K-O  (Lv 5-6)
    LETTERS.slice(15, 20), // P-T  (Lv 7-8)
    LETTERS.slice(20, 26), // U-Z  (Lv 9-10)
  ]
  const groupIdx = Math.min(4, Math.floor((level - 1) / 2))
  // Level genap: gabung kelompok sebelumnya juga (review)
  if (level % 2 === 0 && groupIdx > 0) {
    return [...groups[groupIdx - 1], ...groups[groupIdx]]
  }
  return groups[groupIdx]
}

// Pool angka per level (level 1-5: angka 1-5, level 6-10: angka 6-10)
function numbersForLevel(level) {
  if (level <= 5) return NUMBERS.slice(0, 5)
  return NUMBERS.slice(5, 10)
}

// Jumlah pilihan bertambah seiring level (min 2, max 6)
function choiceCount(level) {
  return Math.min(6, 2 + Math.floor((level - 1) / 2))
}

// Soal angka: ucapkan nama angka → anak cari simbolnya
export function makeNumberRound(level) {
  const pool = numbersForLevel(level)
  const count = Math.min(pool.length, choiceCount(level))
  const picks = shuffled(pool).slice(0, count)
  const target = picks[Math.floor(Math.random() * picks.length)]
  return { kind: 'number', target, options: shuffled(picks) }
}

// Soal huruf: ucapkan nama huruf → anak cari simbolnya
export function makeLetterRound(level) {
  const pool = lettersForLevel(level)
  const count = Math.min(pool.length, choiceCount(level))
  const picks = shuffled(pool).slice(0, count)
  const target = picks[Math.floor(Math.random() * picks.length)]
  // tambahkan nama huruf yang diucapkan
  const targetWithName = { ...target, spokenName: LETTER_NAMES[target.label] || target.label }
  return { kind: 'letter', target: targetWithName, options: shuffled(picks) }
}

export { LETTER_NAMES }
