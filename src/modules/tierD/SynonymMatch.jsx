import { useRef, useState } from 'react'
import { playGentle, playSuccess, speak } from '../../data/sound'
import { useGameProgress } from '../../hooks/useGameProgress'
import { stageLabel } from '../../data/levelStage'
import SetReportBanner from '../../components/SetReportBanner'
import { MAX_LEVEL, makeRound } from './synonymMatchLogic'

export default function SynonymMatch({ profileId }) {
  const { level, stars, setAnswered, setSize, recordAnswer } = useGameProgress(profileId, 'tierD-synonym-match', {
    maxLevel: MAX_LEVEL,
    targetTimeMs: 10000,
  })
  const [round, setRound] = useState(() => makeRound(level))
  const [feedback, setFeedback] = useState('')
  const [report, setReport] = useState(null)
  const startRef = useRef(Date.now())

  function playWord() {
    speak(round.word, 'en-US', 0.85)
  }

  function choose(value) {
    const correct = value === round.answer
    const elapsed = Date.now() - startRef.current
    if (correct) {
      playSuccess()
      speak(`Correct! ${round.word} means ${round.answer}.`, 'en-US')
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
      <div className="question-box">
        Find a word that means the same as: <strong>{round.word}</strong>
        <button type="button" className="btn-secondary speak-btn" onClick={playWord}>
          🔊
        </button>
      </div>
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
