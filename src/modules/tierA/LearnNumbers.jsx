import { useEffect, useRef, useState } from 'react'
import { playGentle, playSuccess, speak } from '../../data/sound'
import { useGameProgress } from '../../hooks/useGameProgress'
import SetReportBanner from '../../components/SetReportBanner'
import { MAX_LEVEL_NUMBERS, makeNumberRound } from './numbersLettersLogic'

export default function LearnNumbers({ profileId }) {
  const { level, stars, setAnswered, setSize, recordAnswer } = useGameProgress(
    profileId,
    'tierA-learn-numbers',
    { maxLevel: MAX_LEVEL_NUMBERS, setSize: 8, passAccuracy: 0.75, targetTimeMs: Infinity },
  )
  const [round, setRound] = useState(() => makeNumberRound(level))
  const [feedback, setFeedback] = useState('')
  const [wrongLabel, setWrongLabel] = useState(null)
  const [report, setReport] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [correctionSeconds, setCorrectionSeconds] = useState(0)
  const startRef = useRef(Date.now())
  const correctionTimerRef = useRef(null)

  // Ucapkan soal saat round berganti
  useEffect(() => {
    speak(`Mana angka ${round.target.speech}?`)
  }, [round])

  function choose(item) {
    if (revealed || correctionSeconds > 0) return
    const correct = item.label === round.target.label
    if (!correct) {
      clearInterval(correctionTimerRef.current)
      setCorrectionSeconds(5)
      correctionTimerRef.current = setInterval(() => {
        setCorrectionSeconds((seconds) => {
          if (seconds <= 1) {
            clearInterval(correctionTimerRef.current)
            return 0
          }
          return seconds - 1
        })
      }, 1000)
    }
    const elapsed = Date.now() - startRef.current

    if (correct) {
      playSuccess()
      speak(`Betul! Ini angka ${round.target.speech}! Hebat!`)
      setFeedback(`🎉 Betul! Angka ${round.target.label} = "${round.target.speech}"`)
    } else {
      playGentle()
      // Feedback edukatif: sebutkan yang benar, bukan hanya "coba lagi"
      speak(`Ini bukan angka ${round.target.speech}. Yang benar ini ya!`)
      setRevealed(true)
      setWrongLabel(item.label)
      setFeedback(`Yang benar: angka ${round.target.label} = "${round.target.speech}"`)
    }

    const result = recordAnswer(correct, elapsed)
    if (result.setResult) setReport(result)
    const delay = result.setResult ? 2600 : (correct ? 900 : 5000)
    setTimeout(() => {
      setFeedback('')
      setReport(null)
      setWrongLabel(null)
      setRevealed(false)
      const next = makeNumberRound(result.level)
      setRound(next)
      startRef.current = Date.now()
    }, delay)
  }

  return (
    <div className="game-area math-game">
      <div className="star-bar">
        ⭐ {stars} <span className="level-badge">Soal {setAnswered + 1}/{setSize}</span>
      </div>

      {/* Instruksi — soal berupa audio + teks, bukan tampilkan simbolnya */}
      <div className="question-box" style={{ fontSize: '3.5vh', padding: '2vh', textAlign: 'center', lineHeight: 1.4 }}>
        <div style={{ fontSize: '5vh', marginBottom: '1vh' }}>👂</div>
        Mana angka <strong style={{ fontSize: '5vh' }}>{round.target.speech}</strong>?
        <button
          onClick={() => speak(`Mana angka ${round.target.speech}?`)}
          style={{ display: 'block', margin: '1vh auto 0', fontSize: '3vh', background: 'none', border: 'none', cursor: 'pointer' }}
          title="Dengarkan lagi"
        >🔊</button>
      </div>

      <div className="options-grid">
        {round.options.map((o) => (
          <button
            key={o.label}
            className={`option-btn
              ${wrongLabel === o.label ? 'wrong' : ''}
              ${revealed && o.label === round.target.label ? 'correct-reveal' : ''}
            `}
            style={{ fontSize: '5vh', minWidth: '13vh', minHeight: '13vh' }}
            onClick={() => choose(o)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {feedback && !report && <div className="feedback-msg show">{feedback}{correctionSeconds > 0 && <div style={{ marginTop: '1vh' }}>⏳ Soal berikutnya dalam {correctionSeconds}...</div>}</div>}
      <SetReportBanner report={report} showTiming={false} />
    </div>
  )
}
