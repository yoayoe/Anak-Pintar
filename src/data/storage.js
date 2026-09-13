// Thin fetch wrappers around the backend API (see server/index.js). Function
// names mirror the old localStorage-based module so the rest of the app's
// mental model carries over - they're just async now.

async function api(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

// ---------- profiles ----------

export function loadProfiles() {
  return api('/profiles')
}

export function createProfile(fields) {
  return api('/profiles', { method: 'POST', body: JSON.stringify(fields) })
}

export function updateProfileApi(id, patch) {
  return api(`/profiles/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export function deleteProfileApi(id) {
  return api(`/profiles/${id}`, { method: 'DELETE' })
}

// ---------- progress ----------

export function loadProgress(profileId) {
  return api(`/progress/${profileId}`)
}

export function saveProgress(profileId, progress) {
  // Fire-and-forget from hot paths (every answer) - callers already hold the
  // computed next state in memory and don't need to wait on the network.
  return api(`/progress/${profileId}`, { method: 'PUT', body: JSON.stringify(progress) }).catch((err) => {
    console.error('Failed to save progress, will not retry:', err)
  })
}

// Used by the placement test to set each game's starting level directly,
// instead of everyone starting from level 1 regardless of real skill.
export async function applyPlacementLevels(profileId, levelsByGame) {
  const progress = await loadProgress(profileId)
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
  await saveProgress(profileId, next)
  return next
}

// ---------- playtime ----------

export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function loadPlaytimeSeconds(profileId, date = todayStr()) {
  const { seconds } = await api(`/playtime/${profileId}?date=${date}`)
  return seconds
}

export async function addPlaytimeSeconds(profileId, seconds, date = todayStr()) {
  const res = await api(`/playtime/${profileId}`, { method: 'POST', body: JSON.stringify({ seconds, date }) })
  return res.seconds
}

// ---------- parent pin ----------

export async function pinExists() {
  const { exists } = await api('/pin')
  return exists
}

export async function createPin(pin) {
  await api('/pin', { method: 'POST', body: JSON.stringify({ pin }) })
}

export async function verifyPin(pin) {
  const { ok } = await api('/pin/verify', { method: 'POST', body: JSON.stringify({ pin }) })
  return ok
}
