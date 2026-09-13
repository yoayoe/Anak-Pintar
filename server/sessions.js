import crypto from 'node:crypto'

// In-memory only, on purpose: a server restart logging everyone out (they
// just re-enter the PIN) is a fine trade for not keeping long-lived login
// tokens sitting in db.json backups.
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

const sessions = new Map() // token -> expiresAt

export function createSession() {
  const token = crypto.randomBytes(32).toString('hex')
  sessions.set(token, Date.now() + SESSION_TTL_MS)
  return token
}

export function isValidSession(token) {
  if (!token) return false
  const expiresAt = sessions.get(token)
  if (!expiresAt) return false
  if (Date.now() > expiresAt) {
    sessions.delete(token)
    return false
  }
  return true
}

export function destroySession(token) {
  sessions.delete(token)
}
