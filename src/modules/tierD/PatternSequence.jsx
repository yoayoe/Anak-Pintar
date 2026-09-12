import { useRef, useState } from 'react'
import { playGentle, playSuccess } from '../../data/sound'
import { useGameProgress } from '../../hooks/useGameProgress'
import { stageLabel } from '../../data/levelStage'
import SetReportBanner from '../../components/SetReportBanner'
import { MAX_LEVEL, makeRound } from './patternSequenceLogic'

export default function PatternSequence({ profileId }) {
  const { level, stars, setAnswered, setSize, recordAnswer } = useGameProgress(profileId, 'tierD-pattern-sequence', {
    maxLevel: MAX_LEVEL,
    targetTimeMs: 15000,
  })
  const [round, setRound] = useState(() => makeRound(level))
  const [feedback, setFeedback] = useState('')
  const [report, setReport] = useState(null)
  const startRef = useRef(Date.now())

  function choose(value) {
    const correct = value === round.answer
    const elapsed = Date.now() - startRef.current
    if (correct) {
      playSuccess()
      setFeedback('🎉 Benar!')
    } else {
      playGentle()
      setFeedback(`Coba lagi. Jawaban: ${round.answer}`)
    }
    const result = recordAnswer(correct, elapsed)
    if (result.setResult) setReport(result)
    const delay = result.setResult ? 2600 : correct ? 700 : 1200
    setTimeout(() => {
      setFeedback('')
      setReport(null)
      setRound(makeRound(result.level))
      startRef.current = Date.now()
    }, delay)
  }

  return (
    <div className="game-area logic-game">
      <div className="star-bar">
        ⭐ {stars}{' '}
        <span className="level-badge">
          Level {level} · {stageLabel(level, MAX_LEVEL)} · Soal {setAnswered + 1}/{setSize}
        </span>
      </div>
      <div className="pattern-row">
        {round.shown.map((v, i) => (
          <span key={i} className="pattern-item">
            {v}
          </span>
        ))}
        <span className="pattern-item pattern-blank">?</span>
      </div>
      <div className="options-grid">
        {round.options.map((opt, i) => (
          <button key={i} className="option-btn" onClick={() => choose(opt)}>
            {opt}
          </button>
        ))}
      </div>
      {feedback && !report && <div className="feedback-msg show">{feedback}</div>}
      <SetReportBanner report={report} />
    </div>
  )
}
