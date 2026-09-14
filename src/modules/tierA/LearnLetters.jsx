import { useEffect, useRef, useState } from 'react'
import { playGentle, playSuccess, speak } from '../../data/sound'
import { useGameProgress } from '../../hooks/useGameProgress'
import SetReportBanner from '../../components/SetReportBanner'
import { MAX_LEVEL_LETTERS, makeLetterRound, LETTER_NAMES } from './numbersLettersLogic'

export default function LearnLetters({ profileId }) {
  const { level, stars, setAnswered, setSize, recordAnswer } = useGameProgress(
    profileId,
    'tierA-learn-letters',
    { maxLevel: MAX_LEVEL_LETTERS, setSize: 8, passAccuracy: 0.75, targetTimeMs: Infinity },
  )
  const [round, setRound] = useState(() => makeLetterRound(level))
  const [feedback, setFeedback] = useState('')
  const [wrongLabel, setWrongLabel] = useState(null)
  const [report, setReport] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const startRef = useRef(Date.now())

  useEffect(() => {
    speak(`Cari huruf ${round.target.spokenName}!`)
  }, [round])

  function choose(item) {
    if (revealed) return
    const correct = item.label === round.target.label
    const elapsed = Date.now() - startRef.current
    const spokenName = LETTER_NAMES[item.label] || item.label

    if (correct) {
      playSuccess()
      speak(`Betul! Ini huruf ${round.target.spokenName}! Pintar!`)
      setFeedback(`🎉 Betul! Huruf ${round.target.label} — dibaca "${round.target.spokenName}"`)
    } else {
      playGentle()
      speak(`Bukan. Itu huruf ${spokenName}. Yang kita cari huruf ${round.target.spokenName}!`)
      setRevealed(true)
      setWrongLabel(item.label)
      setFeedback(`Yang benar: huruf ${round.target.label} — dibaca "${round.target.spokenName}"`)
    }

    const result = recordAnswer(correct, elapsed)
    if (result.setResult) setReport(result)
    const delay = result.setResult ? 2600 : (correct ? 900 : 1800)
    setTimeout(() => {
      setFeedback('')
      setReport(null)
      setWrongLabel(null)
      setRevealed(false)
      const next = makeLetterRound(result.level)
      setRound(next)
      startRef.current = Date.now()
    }, delay)
  }

  // Label kelompok huruf yang sedang dipelajari
  const groups = ['A–E', 'F–J', 'K–O', 'P–T', 'U–Z']
  const groupLabel = groups[Math.min(4, Math.floor((level - 1) / 2))]

  return (
    <div className="game-area math-game">
      <div className="star-bar">
        ⭐ {stars}{' '}
        <span className="level-badge">Soal {setAnswered + 1}/{setSize}</span>
        <span className="level-badge" style={{ marginLeft: '1vh', background: '#e8f4fd', color: '#1a73e8' }}>
          Kelompok {groupLabel}
        </span>
      </div>

      {/* Instruksi audio + nama huruf, bukan tampilkan simbolnya */}
      <div className="question-box" style={{ fontSize: '3.5vh', padding: '2vh', textAlign: 'center', lineHeight: 1.4 }}>
        <div style={{ fontSize: '5vh', marginBottom: '1vh' }}>👂</div>
        Cari huruf{' '}
        <strong style={{ fontSize: '5.5vh', fontFamily: 'monospace' }}>
          {round.target.spokenName}
        </strong>
        <button
          onClick={() => speak(`Cari huruf ${round.target.spokenName}!`)}
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
            style={{ fontSize: '5vh', minWidth: '13vh', minHeight: '13vh', fontFamily: 'monospace' }}
            onClick={() => choose(o)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {feedback && !report && <div className="feedback-msg show">{feedback}</div>}
      <SetReportBanner report={report} showTiming={false} />
    </div>
  )
}
