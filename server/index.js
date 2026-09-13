import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import rateLimit from 'express-rate-limit'
import * as db from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.join(__dirname, '..', 'dist')
const PORT = process.env.PORT || 3000

const app = express()
app.use(express.json())

// Cloudflare Tunnel forwards the real visitor IP via this header (not the
// standard X-Forwarded-For chain, so Express's own `trust proxy` setting
// doesn't apply here - a custom keyGenerator is the correct hook for
// express-rate-limit rather than turning on app-wide trust-proxy handling).
function clientIp(req) {
  return req.headers['cf-connecting-ip'] || req.socket.remoteAddress
}

const api = express.Router()

// ---------- profiles ----------

api.get('/profiles', (req, res) => {
  res.json(db.listProfiles())
})

api.post('/profiles', (req, res) => {
  res.status(201).json(db.createProfile(req.body))
})

api.patch('/profiles/:id', (req, res) => {
  const updated = db.updateProfile(req.params.id, req.body)
  if (!updated) return res.status(404).json({ error: 'not found' })
  res.json(updated)
})

api.delete('/profiles/:id', (req, res) => {
  db.deleteProfile(req.params.id)
  res.status(204).end()
})

// ---------- progress ----------

api.get('/progress/:profileId', (req, res) => {
  res.json(db.getProgress(req.params.profileId))
})

api.put('/progress/:profileId', (req, res) => {
  res.json(db.setProgress(req.params.profileId, req.body))
})

// ---------- playtime ----------

api.get('/playtime/:profileId', (req, res) => {
  res.json({ seconds: db.getPlaytimeSeconds(req.params.profileId, req.query.date) })
})

api.post('/playtime/:profileId', (req, res) => {
  const seconds = Number(req.body.seconds) || 0
  const total = db.addPlaytimeSeconds(req.params.profileId, seconds, req.body.date)
  res.json({ seconds: total })
})

// ---------- parent pin ----------
// The app is reachable from the open internet via Cloudflare Tunnel, so the
// verify endpoint is rate-limited - a 4-digit PIN only has 10,000 combinations.

const pinVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, try again later' },
  keyGenerator: clientIp,
})

api.get('/pin', (req, res) => {
  res.json({ exists: db.pinExists() })
})

api.post('/pin', (req, res) => {
  const ok = db.setPin(String(req.body.pin || ''))
  if (!ok) return res.status(409).json({ error: 'pin already set' })
  res.status(201).json({ ok: true })
})

api.post('/pin/verify', pinVerifyLimiter, (req, res) => {
  res.json({ ok: db.verifyPin(String(req.body.pin || '')) })
})

app.use('/api', api)

// ---------- static frontend ----------

app.use(express.static(DIST_DIR))
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Dunia Ceria server listening on port ${PORT}`)
})
