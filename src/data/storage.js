const PROFILES_KEY = 'dc:profiles'
const PIN_KEY = 'dc:parentPin'

// crypto.randomUUID only exists in secure contexts (https, or localhost) - it's
// undefined when the app is opened over plain http via a LAN IP, which broke
// "Simpan" on the add-profile form with a silent TypeError. Fall back to a
// manual id there; it only needs to be unique on this one device.
export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function loadProfiles() {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY)) || []
  } catch {
    return []
  }
}

export function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

export function loadPin() {
  return localStorage.getItem(PIN_KEY) || null
}

export function savePin(pin) {
  localStorage.setItem(PIN_KEY, pin)
}

function progressKey(profileId) {
  return `dc:progress:${profileId}`
}

export function loadProgress(profileId) {
  try {
    return JSON.parse(localStorage.getItem(progressKey(profileId))) || { totalStars: 0, games: {} }
  } catch {
    return { totalStars: 0, games: {} }
  }
}

export function saveProgress(profileId, progress) {
  localStorage.setItem(progressKey(profileId), JSON.stringify(progress))
}

// Used by the placement test to set each game's starting level directly,
// instead of everyone starting from level 1 regardless of real skill.
export function applyPlacementLevels(profileId, levelsByGame) {
  const progress = loadProgress(profileId)
  const games = { ...progress.games }
  for (const [gameId, level] of Object.entries(levelsByGame)) {
    const current = games[gameId] || {}
    games[gameId] = {
      ...current,
      level,
      setsPassedAtLevel: 0,
      consecutiveSetFails: 0,
      setAnswered: 0,
      setCorrect: 0,
      setTotalTimeMs: 0,
    }
  }
  const next = { ...progress, games }
  saveProgress(profileId, next)
  return next
}

export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function playtimeKey(profileId, date) {
  return `dc:playtime:${profileId}:${date}`
}

export function loadPlaytimeSeconds(profileId, date = todayStr()) {
  return Number(localStorage.getItem(playtimeKey(profileId, date))) || 0
}

export function addPlaytimeSeconds(profileId, seconds, date = todayStr()) {
  const total = loadPlaytimeSeconds(profileId, date) + seconds
  localStorage.setItem(playtimeKey(profileId, date), String(total))
  return total
}
