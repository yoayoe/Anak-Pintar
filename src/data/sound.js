let audioCtx = null

function ctx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function tone(freq, dur, type = 'sine', vol = 0.2, delay = 0) {
  try {
    const c = ctx()
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.setValueAtTime(vol, c.currentTime + delay)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur)
    o.connect(g)
    g.connect(c.destination)
    o.start(c.currentTime + delay)
    o.stop(c.currentTime + delay + dur)
  } catch {
    // audio not available, ignore
  }
}

export function playPop() {
  tone(600, 0.08, 'triangle', 0.25)
  tone(900, 0.08, 'triangle', 0.15, 0.05)
}

export function playSuccess() {
  tone(523, 0.12, 'sine', 0.2)
  tone(659, 0.12, 'sine', 0.2, 0.1)
  tone(784, 0.18, 'sine', 0.2, 0.2)
}

export function playGentle() {
  tone(300, 0.15, 'sine', 0.12)
}

// Setting utterance.lang alone doesn't reliably pick a matching voice on every
// browser/OS - some just keep using the default voice regardless. Look up a
// voice for the language explicitly so id-ID/en-US text isn't read in the
// wrong accent when a matching voice is installed.
function findVoice(lang) {
  if (!('speechSynthesis' in window)) return null
  const voices = speechSynthesis.getVoices()
  const prefix = lang.split('-')[0].toLowerCase()
  return (
    voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
    null
  )
}

export function speak(text, lang = 'id-ID', rate = 0.9, pitch = 1.15) {
  try {
    if (!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    const voice = findVoice(lang)
    if (voice) u.voice = voice
    u.rate = rate
    u.pitch = pitch
    // PENTING untuk Safari iOS: speak() harus dipanggil SYNCHRONOUS di dalam
    // gesture pengguna (tap/klik), tanpa setTimeout/Promise di antaranya -
    // kalau tidak, Safari mendiamkannya total tanpa error. cancel() hanya
    // dipanggil kalau memang sedang bicara, supaya tidak membatalkan
    // utterance yang baru saja di-queue oleh tap ini sendiri.
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel()
    speechSynthesis.speak(u)
  } catch {
    // speech not available, ignore
  }
}
