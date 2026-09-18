import { useEffect, useRef, useState } from 'react'
import { speak } from '../../data/sound'
import { useGameProgress } from '../../hooks/useGameProgress'
import { NUMBERS, LETTERS, LETTER_NAMES } from './numbersLettersLogic'

// Kata bantu asosiasi per huruf (mis. "A seperti Apel") - membantu anak
// mengingat bunyi lewat gambar konkret, gaya pengajaran abjad TK.
const LETTER_HINTS = {
  A: '🍎 Apel', B: '🎈 Balon', C: '☁️ Cumulus', D: '🥁 Drum', E: '🐘 Elephant',
  F: '🐟 Fish', G: '🎸 Gitar', H: '🏠 House', I: '🍦 Ice cream', J: '🧃 Jus',
  K: '🪁 Kite', L: '🦁 Lion', M: '🌙 Moon', N: '🥜 Nut', O: '🐙 Octopus',
  P: '🍕 Pizza', Q: '👑 Queen', R: '🌈 Rainbow', S: '⭐ Star', T: '🌳 Tree',
  U: '☂️ Umbrella', V: '🎻 Violin', W: '🍉 Watermelon', X: '❌ Xilofon',
  Y: '🪀 Yoyo', Z: '🦓 Zebra',
}
const NUMBER_HINTS = ['👆', '✌️', '🤟', '🖐️+1', '🖐️', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

function items() {
  const letters = LETTERS.map((l) => ({
    kind: 'letter', label: l.label, speech: LETTER_NAMES[l.label] || l.label, hint: LETTER_HINTS[l.label],
  }))
  const numbers = NUMBERS.map((n, i) => ({
    kind: 'number', label: n.label, speech: n.speech, hint: NUMBER_HINTS[i],
  }))
  return [...letters, ...numbers]
}

const ALL_ITEMS = items()

function shuffled(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

const STAGE = { IDLE: 'idle', RECORDING: 'recording', PLAYBACK: 'playback' }

// Safari (iOS/macOS) tidak mendukung 'audio/webm' - coba beberapa format dan
// pakai yang pertama didukung, atau biarkan browser pilih default (string kosong).
function pickMimeType() {
  const candidates = ['audio/webm', 'audio/mp4', 'audio/ogg', '']
  return candidates.find((t) => t === '' || MediaRecorder.isTypeSupported(t)) || ''
}

export default function MimicSounds({ profileId }) {
  const { stars, awardStar } = useGameProgress(profileId, 'tierA-mimic-sounds')
  const [queue, setQueue] = useState(() => shuffled(ALL_ITEMS).slice(0, 12))
  const [index, setIndex] = useState(0)
  const [stage, setStage] = useState(STAGE.IDLE)
  const [micError, setMicError] = useState('')
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)

  const current = queue[index]

  useEffect(() => {
    // Tidak auto-speak di sini: banyak browser mobile (Safari/Chrome) memblokir
    // speechSynthesis kalau tidak dipicu langsung oleh tap pengguna. Anak/ortu
    // tekan tombol "🔊 Dengar" sendiri untuk memutar instruksi.
    return () => {
      mediaRecorderRef.current?.state === 'recording' && mediaRecorderRef.current.stop()
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [current])

  function replayPrompt() {
    if (!current) return
    const prompt = current.kind === 'letter' ? `Huruf ${current.speech}` : `Angka ${current.speech}`
    speak(prompt)
  }

  async function startRecording() {
    setMicError('')
    setAudioUrl(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError('Perekaman butuh koneksi HTTPS dan browser yang mendukung mikrofon.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = pickMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
        setStage(STAGE.PLAYBACK)
      }
      recorder.onerror = (e) => {
        setMicError(`Rekaman gagal: ${e.error?.message || 'error tidak diketahui'}`)
        stream.getTracks().forEach((t) => t.stop())
        setStage(STAGE.IDLE)
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setStage(STAGE.RECORDING)
      // Auto-stop setelah 3 detik agar anak tidak lupa melepas tombol
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop()
      }, 3000)
    } catch (err) {
      setMicError(`Mikrofon tidak bisa diakses (${err.name || 'error'}). Cek izin browser ya.`)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
  }

  function next() {
    awardStar()
    setAudioUrl(null)
    setStage(STAGE.IDLE)
    if (index + 1 >= queue.length) {
      setQueue(shuffled(ALL_ITEMS).slice(0, 12))
      setIndex(0)
    } else {
      setIndex(index + 1)
    }
  }

  if (!current) return null

  return (
    <div className="game-area mimic-game">
      <div className="star-bar">⭐ {stars}</div>

      <div className="question-box" style={{ fontSize: '14vh', minWidth: '14vh', justifyContent: 'center' }}>
        {current.label}
      </div>
      <div style={{ fontSize: '2.2vh', color: '#666', textAlign: 'center' }}>
        {current.hint}
      </div>

      <button
        onClick={replayPrompt}
        className="btn-secondary"
        style={{ fontSize: '2.2vh', padding: '1.2vh 3vw' }}
      >🔊 Dengar</button>

      {micError && <div className="feedback-msg show">{micError}</div>}

      {stage === STAGE.IDLE && !micError && (
        <button className="btn-primary" onClick={startRecording} style={{ fontSize: '2.5vh', padding: '2vh 4vw' }}>
          🎙️ Tirukan & Rekam!
        </button>
      )}

      {stage === STAGE.RECORDING && (
        <button className="btn-danger" onClick={stopRecording} style={{ fontSize: '2.5vh', padding: '2vh 4vw' }}>
          ⏺️ Sedang rekam... (tekan untuk selesai)
        </button>
      )}

      {stage === STAGE.PLAYBACK && audioUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2vw', alignItems: 'center' }}>
            <button className="btn-secondary" onClick={replayPrompt}>🔊 Dengar Contoh</button>
            <audio src={audioUrl} controls style={{ height: '5vh' }} />
          </div>
          <div style={{ display: 'flex', gap: '2vw' }}>
            <button className="btn-secondary" onClick={startRecording}>🔄 Ulangi Rekam</button>
            <button className="btn-primary" onClick={next}>➡️ Lanjut</button>
          </div>
        </div>
      )}
    </div>
  )
}
