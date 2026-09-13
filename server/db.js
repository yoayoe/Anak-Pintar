import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'db.json')

const EMPTY_DB = {
  parentPinHash: null,
  parentPinSalt: null,
  profiles: [],
  progress: {},
  playtime: {},
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function load() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    return { ...EMPTY_DB, ...JSON.parse(raw) }
  } catch {
    return { ...EMPTY_DB }
  }
}

let db = load()

// Atomic-ish save: write to a temp file then rename over the real one, so a
// crash mid-write can't leave db.json half-written and unreadable.
function save() {
  ensureDir(DB_PATH)
  const tmpPath = `${DB_PATH}.tmp`
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2))
  fs.renameSync(tmpPath, DB_PATH)
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

// ---------- profiles ----------

export function listProfiles() {
  return db.profiles
}

export function createProfile(fields) {
  const profile = { tierOverride: null, ...fields, id: generateId() }
  db.profiles.push(profile)
  save()
  return profile
}

export function updateProfile(id, patch) {
  const idx = db.profiles.findIndex((p) => p.id === id)
  if (idx === -1) return null
  db.profiles[idx] = { ...db.profiles[idx], ...patch }
  save()
  return db.profiles[idx]
}

export function deleteProfile(id) {
  db.profiles = db.profiles.filter((p) => p.id !== id)
  delete db.progress[id]
  delete db.playtime[id]
  save()
}

// ---------- progress ----------

export function getProgress(profileId) {
  return db.progress[profileId] || { totalStars: 0, games: {} }
}

export function setProgress(profileId, progress) {
  db.progress[profileId] = progress
  save()
  return progress
}

// ---------- playtime ----------

export function getPlaytimeSeconds(profileId, date = todayStr()) {
  return db.playtime[profileId]?.[date] || 0
}

// Riwayat n hari terakhir (termasuk hari ini), urut dari yang paling lama -
// dipakai layar monitoring orang tua. Hari tanpa data ikut dikembalikan
// sebagai 0 supaya grafiknya tidak bolong.
export function getPlaytimeHistory(profileId, days = 7) {
  const perDay = db.playtime[profileId] || {}
  const out = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    out.push({ date, seconds: perDay[date] || 0 })
  }
  return out
}

export function addPlaytimeSeconds(profileId, seconds, date = todayStr()) {
  if (!db.playtime[profileId]) db.playtime[profileId] = {}
  const next = (db.playtime[profileId][date] || 0) + seconds
  db.playtime[profileId][date] = next
  save()
  return next
}

// ---------- parent pin ----------
// Stored as a salted scrypt hash, never in plain text - this app is reachable
// from the open internet via the tunnel, so db.json leaking (a bad backup, a
// misconfigured volume) shouldn't hand over the parent PIN directly.

function hashPin(pin, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(pin, salt, 64).toString('hex') }
}

export function pinExists() {
  return Boolean(db.parentPinHash)
}

export function setPin(pin) {
  if (db.parentPinHash) return false
  const { salt, hash } = hashPin(pin)
  db.parentPinSalt = salt
  db.parentPinHash = hash
  save()
  return true
}

export function verifyPin(pin) {
  if (!db.parentPinHash) return false
  const { hash } = hashPin(pin, db.parentPinSalt)
  const a = Buffer.from(hash, 'hex')
  const b = Buffer.from(db.parentPinHash, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export { todayStr }
