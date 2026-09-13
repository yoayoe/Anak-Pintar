import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cookieParser from 'cookie-parser'
import express from 'express'
import rateLimit from 'express-rate-limit'
import * as db from './db.js'
import * as sessions from './sessions.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.join(__dirname, '..', 'dist')
const PORT = process.env.PORT || 3000
const SESSION_COOKIE = 'dc_session'

const app = express()
app.use(express.json())
app.use(cookieParser())

// Cloudflare Tunnel forwards the real visitor IP via this header (not the
// standard X-Forwarded-For chain, so Express's own `trust proxy` setting
// doesn't apply here - a custom keyGenerator is the correct hook for
// express-rate-limit rather than turning on app-wide trust-proxy handling).
function clientIp(req) {
  return req.headers['cf-connecting-ip'] || req.socket.remoteAddress
}

// The cookie is not marked `Secure` on purpose: the tunnel terminates TLS at
// Cloudflare's edge and talks to this server in plain HTTP, and LAN access
// during setup/debugging is also plain HTTP - marking it Secure would make
// the browser silently drop it in both cases. httpOnly + SameSite=Lax is
// still real protection against XSS cookie theft and cross-site requests.
function setSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: sessions.SESSION_TTL_MS,
    path: '/',
  })
}

const api = express.Router()

// ---------- session / parent pin ----------
// The whole app sits behind this PIN now (not just the Settings screen) -
// these routes must stay reachable without a session, everything else below
// requireAuth does not.

const pinVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, try again later' },
  keyGenerator: clientIp,
})

api.get('/session', (req, res) => {
  res.json({ authenticated: sessions.isValidSession(req.cookies[SESSION_COOKIE]) })
})

api.post('/session/logout', (req, res) => {
  sessions.destroySession(req.cookies[SESSION_COOKIE])
  res.clearCookie(SESSION_COOKIE, { path: '/' })
  res.status(204).end()
})

api.get('/pin', (req, res) => {
  res.json({ exists: db.pinExists() })
})

api.post('/pin', (req, res) => {
  const ok = db.setPin(String(req.body.pin || ''))
  if (!ok) return res.status(409).json({ error: 'pin already set' })
  // Whoever just set the PIN is trusted as the parent - log them straight in
  // instead of asking them to immediately re-enter what they just typed.
  setSessionCookie(res, sessions.createSession())
  res.status(201).json({ ok: true })
})

api.post('/pin/verify', pinVerifyLimiter, (req, res) => {
  const ok = db.verifyPin(String(req.body.pin || ''))
  if (ok) setSessionCookie(res, sessions.createSession())
  res.json({ ok })
})

function requireAuth(req, res, next) {
  if (sessions.isValidSession(req.cookies[SESSION_COOKIE])) return next()
  res.status(401).json({ error: 'unauthorized' })
}

api.use(requireAuth)

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

app.use('/api', api)

// ---------- static frontend ----------

app.use(express.static(DIST_DIR))
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'))
})

app.listen(PORT, () => {
  if (!db.pinExists()) {
    console.warn(
      '[security] Belum ada PIN orang tua. Set PIN dari akses LAN dulu sebelum mengaktifkan Cloudflare Tunnel, ' +
        'karena siapa pun yang membuat PIN pertama akan langsung masuk sebagai orang tua.',
    )
  }
  console.log(`Dunia Ceria server listening on port ${PORT}`)
})
