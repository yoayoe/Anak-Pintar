import { useRef, useState } from 'react'
import { playGentle, playSuccess, speak } from '../../data/sound'
import { useGameProgress } from '../../hooks/useGameProgress'
import SetReportBanner from '../../components/SetReportBanner'
import { MAX_LEVEL, makeRound } from './numbersLettersLogic'

export default function NumbersLetters({ profileId }) {
  const { level, stars, setAnswered, setSize, recordAnswer } = useGameProgress(profileId, 'tierA-numbers-letters', {
    maxLevel: MAX_LEVEL,
    setSize: 8,
    passAccuracy: 0.75,
    targetTimeMs: Infinity, // no speed pressure for pre-schoolers
  })
  const [round, setRound] = useState(() => makeRound(level))
  const [feedback, setFeedback] = useState('')
  const [wrongLabel, setWrongLabel] = useState(null)
  const [report, setReport] = useState(null)
  const startRef = useRef(Date.now())

  function prompt(r) {
    return r.kind === 'number' ? `Cari angka ${r.target.speech}!` : `Cari huruf ${r.target.speech}!`
  }

  function choose(item) {
    const correct = item.label === round.target.label
    const elapsed = Date.now() - startRef.current
    if (correct) {
      playSuccess()
      speak(`Betul! Ini ${round.kind === 'number' ? round.target.speech : `huruf ${round.target.speech}`}!`)
      setFeedback(`🎉 Betul! ${round.target.label}`)
    } else {
      playGentle()
      speak('Coba lagi')
      setWrongLabel(item.label)
      setTimeout(() => setWrongLabel(null), 300)
      setFeedback(`Yang benar ${round.target.label}`)
    }
    const result = recordAnswer(correct, elapsed)
    if (result.setResult) setReport(result)
    const delay = result.setResult ? 2600 : 900
    setTimeout(() => {
      setFeedback('')
      setReport(null)
      const next = makeRound(result.level)
      setRound(next)
      speak(prompt(next))
      startRef.current = Date.now()
    }, delay)
  }

  return (
    <div className="game-area math-game">
      <div className="star-bar">
        ⭐ {stars} <span className="level-badge">Soal {setAnswered + 1}/{setSize}</span>
      </div>
      <div className="question-box" style={{ fontSize: '10vh', minWidth: '10vh', justifyContent: 'center' }}>
        {round.target.label}
      </div>
      <div className="options-grid">
        {round.options.map((o) => (
          <button
            key={o.label}
            className={`option-btn ${wrongLabel === o.label ? 'wrong' : ''}`}
            style={{ fontSize: '5vh', minWidth: '13vh', minHeight: '13vh' }}
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
