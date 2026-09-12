import { useRef, useState } from 'react'
import { playGentle, playSuccess, speak } from '../../data/sound'
import { useGameProgress } from '../../hooks/useGameProgress'
import { stageLabel } from '../../data/levelStage'
import SetReportBanner from '../../components/SetReportBanner'
import { makeRound, EASY_PAIRINGS, MEDIUM_PAIRINGS, HARD_PAIRINGS } from '../shared/oddOneOutLogic'

const MAX_LEVEL = 10

function poolForLevel(level) {
  if (level >= 7) return HARD_PAIRINGS
  if (level >= 4) return MEDIUM_PAIRINGS
  return EASY_PAIRINGS
}

export default function OddOneOut({ profileId }) {
  const { level, stars, setAnswered, setSize, recordAnswer } = useGameProgress(profileId, 'tierC-odd-one-out', {
    maxLevel: MAX_LEVEL,
    targetTimeMs: 12000,
  })
  const [round, setRound] = useState(() => makeRound(poolForLevel(level)))
  const [feedback, setFeedback] = useState('')
  const [wrongItem, setWrongItem] = useState(null)
  const [report, setReport] = useState(null)
  const startRef = useRef(Date.now())

  function choose(item) {
    const correct = item === round.oddItem
    const elapsed = Date.now() - startRef.current
    if (correct) {
      playSuccess()
      speak('Betul! Itu yang beda!', 'id-ID')
      setFeedback('🎉 Betul!')
    } else {
      playGentle()
      setWrongItem(item)
      setTimeout(() => setWrongItem(null), 300)
      setFeedback('Coba lagi ya')
    }
    const result = recordAnswer(correct, elapsed)
    if (result.setResult) setReport(result)
    const delay = result.setResult ? 2600 : 900
    setTimeout(() => {
      setFeedback('')
      setReport(null)
      setRound(makeRound(poolForLevel(result.level)))
      startRef.current = Date.now()
    }, delay)
  }

  return (
    <div className="game-area oddoneout-game">
      <div className="star-bar">
        ⭐ {stars}{' '}
        <span className="level-badge">
          Level {level} · {stageLabel(level, MAX_LEVEL)} · Soal {setAnswered + 1}/{setSize}
        </span>
      </div>
      <div className="oddoneout-prompt">Cari yang beda!</div>
      <div className="oddoneout-grid">
        {round.items.map((item, i) => (
          <button
            key={i}
            className={`oddoneout-btn ${wrongItem === item ? 'wrong' : ''}`}
            onClick={() => choose(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {feedback && !report && <div className="feedback-msg show">{feedback}</div>}
      <SetReportBanner report={report} />
    </div>
  )
}
