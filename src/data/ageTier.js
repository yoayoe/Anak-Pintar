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

export function tierForProfile(profile) {
  return tierFromAge(ageFromBirthYear(profile.birthYear))
}
