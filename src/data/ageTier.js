export const TIERS = ['A', 'B', 'C', 'D']

export const TIER_LABELS = {
  A: 'Pra-sekolah (3-4 th)',
  B: 'TK - Kelas 1 (5-6 th)',
  C: 'Kelas 2-3 (7-8 th)',
  D: 'Kelas 4-5+ (9-10+ th)',
}

export function ageFromBirthYear(birthYear) {
  return new Date().getFullYear() - Number(birthYear)
}

export function tierFromAge(age) {
  if (age <= 4) return 'A'
  if (age <= 6) return 'B'
  if (age <= 8) return 'C'
  return 'D'
}

// Tingkat satu tangga di bawah - dipakai saat anak ternyata belum siap untuk
// tingkat sesuai umurnya (lihat PlacementTest). Tier A tidak punya tingkat di bawahnya.
export const PREV_TIER = { B: 'A', C: 'B', D: 'C' }

// Tingkat murni dari umur, mengabaikan tierOverride - dipakai untuk menampilkan
// "harusnya di tingkat X" walau anak sedang main di tingkat yang diturunkan.
export function ageTierForProfile(profile) {
  return tierFromAge(ageFromBirthYear(profile.birthYear))
}

// tierOverride (diisi manual oleh orang tua) selalu menang — itu keputusan sadar orang tua.
// tierUpgrade: naik tier otomatis karena menguasai semua game tier bawahnya (umur belum cukup),
// hanya dipakai kalau orang tua belum mengatur tierOverride manual.
export function tierForProfile(profile) {
  return profile.tierOverride || profile.tierUpgrade || ageTierForProfile(profile)
}

// Kriteria "menguasai Tier A": level cukup tinggi di semua game graded Tier A.
const TIER_A_MASTERY = {
  'tierA-learn-numbers': 8,  // max 10
  'tierA-learn-letters': 8,  // max 10
  'tierA-color-match': 3,    // max 4
}

export function isTierAMastered(games = {}) {
  return Object.entries(TIER_A_MASTERY).every(
    ([gameId, minLevel]) => (games[gameId]?.level || 1) >= minLevel,
  )
}
