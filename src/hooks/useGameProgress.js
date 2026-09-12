import { useCallback, useState } from 'react'
import { loadProgress, saveProgress } from '../data/storage'

const DEFAULT_GAME_STATE = {
  level: 1,
  stars: 0,
  setsPassedAtLevel: 0,
  consecutiveSetFails: 0,
  setAnswered: 0,
  setCorrect: 0,
  setTotalTimeMs: 0,
}

const DEFAULT_CONFIG = {
  minLevel: 1,
  maxLevel: 10,
  setSize: 10,
  setsPerLevel: 3,
  passAccuracy: 0.8,
  targetTimeMs: 15000,
}

export function useGameProgress(profileId, gameId, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const [progress, setProgress] = useState(() => loadProgress(profileId))
  const gameState = { ...DEFAULT_GAME_STATE, ...(progress.games[gameId] || {}) }

  const persist = useCallback(
    (nextProgress) => {
      setProgress(nextProgress)
      saveProgress(profileId, nextProgress)
    },
    [profileId],
  )

  const awardStar = useCallback(() => {
    const current = { ...DEFAULT_GAME_STATE, ...(progress.games[gameId] || {}) }
    const nextGameState = { ...current, stars: current.stars + 1 }
    persist({
      totalStars: progress.totalStars + 1,
      games: { ...progress.games, [gameId]: nextGameState },
    })
  }, [progress, gameId, persist])

  // Kumon-style mastery: answers accumulate into a "set" (a worksheet of N
  // questions, default 10). A set is graded as a whole on accuracy AND speed,
  // instead of nudging difficulty after every single answer - that keeps a
  // level feeling stable while it's being practiced instead of flickering.
  // Passing enough sets in a row promotes the level; failing two sets in a
  // row eases it back down one notch.
  const recordAnswer = useCallback(
    (correct, elapsedMs) => {
      const current = { ...DEFAULT_GAME_STATE, ...(progress.games[gameId] || {}) }
      let { level, stars, setsPassedAtLevel, consecutiveSetFails, setAnswered, setCorrect, setTotalTimeMs } = current

      if (correct) stars += 1
      setAnswered += 1
      if (correct) setCorrect += 1
      setTotalTimeMs += elapsedMs

      let setResult = null
      let leveledUp = false
      let leveledDown = false
      let reportAccuracy = null
      let reportAvgTimeMs = null

      if (setAnswered >= cfg.setSize) {
        reportAccuracy = setCorrect / setAnswered
        reportAvgTimeMs = setTotalTimeMs / setAnswered
        const passed = reportAccuracy >= cfg.passAccuracy && reportAvgTimeMs <= cfg.targetTimeMs

        if (passed) {
          stars += 3
          setsPassedAtLevel += 1
          consecutiveSetFails = 0
          setResult = 'passed'
          if (setsPassedAtLevel >= cfg.setsPerLevel) {
            leveledUp = level < cfg.maxLevel
            level = Math.min(cfg.maxLevel, level + 1)
            setsPassedAtLevel = 0
          }
        } else {
          consecutiveSetFails += 1
          setResult = 'retry'
          if (consecutiveSetFails >= 2) {
            leveledDown = level > cfg.minLevel
            level = Math.max(cfg.minLevel, level - 1)
            consecutiveSetFails = 0
            setsPassedAtLevel = 0
          }
        }

        setAnswered = 0
        setCorrect = 0
        setTotalTimeMs = 0
      }

      const nextGameState = {
        level,
        stars,
        setsPassedAtLevel,
        consecutiveSetFails,
        setAnswered,
        setCorrect,
        setTotalTimeMs,
      }
      persist({
        totalStars: progress.totalStars + (correct ? 1 : 0) + (setResult === 'passed' ? 3 : 0),
        games: { ...progress.games, [gameId]: nextGameState },
      })

      return {
        level,
        stars,
        setAnswered,
        setSize: cfg.setSize,
        setsPassedAtLevel,
        setsPerLevel: cfg.setsPerLevel,
        setResult,
        leveledUp,
        leveledDown,
        accuracy: reportAccuracy,
        avgTimeMs: reportAvgTimeMs,
      }
    },
    [progress, gameId, persist, cfg.setSize, cfg.setsPerLevel, cfg.passAccuracy, cfg.targetTimeMs, cfg.minLevel, cfg.maxLevel],
  )

  return {
    level: gameState.level,
    stars: gameState.stars,
    totalStars: progress.totalStars,
    setAnswered: gameState.setAnswered,
    setSize: cfg.setSize,
    setsPassedAtLevel: gameState.setsPassedAtLevel,
    setsPerLevel: cfg.setsPerLevel,
    maxLevel: cfg.maxLevel,
    awardStar,
    recordAnswer,
  }
}
