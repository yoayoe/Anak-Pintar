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

export function speak(text, lang = 'id-ID', rate = 0.9, pitch = 1.15) {
  try {
    if (!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = rate
    u.pitch = pitch
    speechSynthesis.cancel()
    speechSynthesis.speak(u)
  } catch {
    // speech not available, ignore
  }
}
