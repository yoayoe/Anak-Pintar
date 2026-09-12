import { useRef, useState } from 'react'
import { playGentle, playSuccess, speak } from '../../data/sound'
import { useGameProgress } from '../../hooks/useGameProgress'
import { stageLabel } from '../../data/levelStage'
import SetReportBanner from '../../components/SetReportBanner'
import { MAX_LEVEL, makeRound } from './fillBlankLogic'

export default function FillBlank({ profileId }) {
  const { level, stars, setAnswered, setSize, recordAnswer } = useGameProgress(profileId, 'tierC-fill-blank', {
    maxLevel: MAX_LEVEL,
    targetTimeMs: 12000,
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
      speak(round.sentence.replace('___', round.answer), 'en-US')
      setFeedback('🎉 Correct!')
    } else {
      playGentle()
      setFeedback(`Try again. Answer: ${round.answer}`)
    }
    const result = recordAnswer(correct, elapsed)
    if (result.setResult) setReport(result)
    const delay = result.setResult ? 2600 : correct ? 900 : 1400
    setTimeout(() => {
      setFeedback('')
      setReport(null)
      setRound(makeRound(result.level))
      startRef.current = Date.now()
    }, delay)
  }

  return (
    <div className="game-area english-game">
      <div className="star-bar">
        ⭐ {stars}{' '}
        <span className="level-badge">
          Level {level} · {stageLabel(level, MAX_LEVEL)} · Soal {setAnswered + 1}/{setSize}
        </span>
      </div>
      <div className="question-box sentence-box">{round.sentence}</div>
      <div className="options-grid">
        {round.options.map((opt) => (
          <button key={opt} className="option-btn" onClick={() => choose(opt)}>
            {opt}
          </button>
        ))}
      </div>
      {feedback && !report && <div className="feedback-msg show">{feedback}</div>}
      <SetReportBanner report={report} />
    </div>
  )
}
