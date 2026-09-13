import { useRef, useState } from 'react'
import { playGentle, playSuccess, speak } from '../../data/sound'
import { useGameProgress } from '../../hooks/useGameProgress'
import SetReportBanner from '../../components/SetReportBanner'
import { makeRound, EASY_PAIRINGS, MEDIUM_PAIRINGS, MAX_LEVEL_B as MAX_LEVEL } from '../shared/oddOneOutLogic'

function poolForLevel(level) {
  return level >= 5 ? MEDIUM_PAIRINGS : EASY_PAIRINGS
}

export default function OddOneOut({ profileId }) {
  const { level, stars, setAnswered, setSize, recordAnswer } = useGameProgress(profileId, 'tierB-odd-one-out', {
    maxLevel: MAX_LEVEL,
    setSize: 8,
    passAccuracy: 0.75,
    targetTimeMs: Infinity, // ini soal kategorisasi, bukan drill kecepatan
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
        ⭐ {stars} <span className="level-badge">Soal {setAnswered + 1}/{setSize}</span>
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
      <SetReportBanner report={report} showTiming={false} />
    </div>
  )
}
