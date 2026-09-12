import { useRef, useState } from 'react'
import { playGentle, playSuccess, speak } from '../../data/sound'
import { useGameProgress } from '../../hooks/useGameProgress'
import SetReportBanner from '../../components/SetReportBanner'
import { MAX_LEVEL, makeRound } from './colorMatchLogic'

export default function ColorMatch({ profileId }) {
  const { level, stars, setAnswered, setSize, recordAnswer } = useGameProgress(profileId, 'tierA-color-match', {
    maxLevel: MAX_LEVEL,
    setSize: 8,
    passAccuracy: 0.75,
    targetTimeMs: Infinity, // no speed pressure for pre-schoolers
  })
  const [round, setRound] = useState(() => makeRound(level))
  const [feedback, setFeedback] = useState('')
  const [wrongName, setWrongName] = useState(null)
  const [report, setReport] = useState(null)
  const startRef = useRef(Date.now())

  function choose(color) {
    const correct = color.name === round.target.name
    const elapsed = Date.now() - startRef.current
    if (correct) {
      playSuccess()
      speak(`Correct! This is ${color.name}!`, 'en-US')
      setFeedback(`🎉 Correct! ${color.name}`)
    } else {
      playGentle()
      speak('Try again', 'en-US')
      setWrongName(color.name)
      setTimeout(() => setWrongName(null), 300)
      setFeedback(`It was ${round.target.name}`)
    }
    const result = recordAnswer(correct, elapsed)
    if (result.setResult) setReport(result)
    const delay = result.setResult ? 2600 : 900
    setTimeout(() => {
      setFeedback('')
      setReport(null)
      const next = makeRound(result.level)
      setRound(next)
      speak(`Find the color ${next.target.name}`, 'en-US')
      startRef.current = Date.now()
    }, delay)
  }

  return (
    <div className="game-area color-game">
      <div className="star-bar">
        ⭐ {stars} <span className="level-badge">Soal {setAnswered + 1}/{setSize}</span>
      </div>
      <div className="color-prompt">
        Find this color!
        <div className="target-swatch" style={{ background: round.target.hex }} />
      </div>
      <div className="color-grid">
        {round.options.map((c, i) => (
          <button
            key={c.name}
            className={`color-shape ${i % 2 === 0 ? 'circle' : 'square'} ${wrongName === c.name ? 'wrong' : ''}`}
            style={{ background: c.hex }}
            onClick={() => choose(c)}
          />
        ))}
      </div>
      {feedback && !report && <div className="feedback-msg show">{feedback}</div>}
      <SetReportBanner report={report} showTiming={false} />
    </div>
  )
}
