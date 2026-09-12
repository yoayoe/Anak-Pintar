import { useRef, useState } from 'react'
import { playGentle, playSuccess } from '../../data/sound'
import { useGameProgress } from '../../hooks/useGameProgress'
import { stageLabel } from '../../data/levelStage'
import SetReportBanner from '../../components/SetReportBanner'
import { MAX_LEVEL, makeQuestion } from './addSubtractLogic'

export default function AddSubtract({ profileId }) {
  const { level, stars, setAnswered, setSize, recordAnswer } = useGameProgress(profileId, 'tierC-add-subtract', {
    maxLevel: MAX_LEVEL,
    targetTimeMs: 15000,
  })
  const [question, setQuestion] = useState(() => makeQuestion(level))
  const [feedback, setFeedback] = useState('')
  const [report, setReport] = useState(null)
  const startRef = useRef(Date.now())

  function choose(value) {
    const correct = value === question.target
    const elapsed = Date.now() - startRef.current
    if (correct) {
      playSuccess()
      setFeedback('🎉 Benar!')
    } else {
      playGentle()
      setFeedback(`Coba lagi. Jawaban: ${question.target}`)
    }
    const result = recordAnswer(correct, elapsed)
    if (result.setResult) setReport(result)
    const delay = result.setResult ? 2600 : correct ? 700 : 1200
    setTimeout(() => {
      setFeedback('')
      setReport(null)
      setQuestion(makeQuestion(result.level))
      startRef.current = Date.now()
    }, delay)
  }

  return (
    <div className="game-area math-game">
      <div className="star-bar">
        ⭐ {stars}{' '}
        <span className="level-badge">
          Level {level} · {stageLabel(level, MAX_LEVEL)} · Soal {setAnswered + 1}/{setSize}
        </span>
      </div>
      <div className="question-box">{question.prompt}</div>
      <div className="options-grid">
        {question.options.map((opt) => (
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
