import { useEffect, useRef, useState } from 'react'
import { addPlaytimeSeconds, loadPlaytimeSeconds, todayStr } from '../data/storage'

const WARNING_THRESHOLD_SECONDS = 5 * 60

export function useDailyTimer(profileId, dailyLimitMinutes) {
  const limitSeconds = dailyLimitMinutes * 60
  const [usedSeconds, setUsedSeconds] = useState(() => loadPlaytimeSeconds(profileId))
  const dayRef = useRef(todayStr())

  useEffect(() => {
    setUsedSeconds(loadPlaytimeSeconds(profileId))
    dayRef.current = todayStr()

    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return

      const currentDay = todayStr()
      if (currentDay !== dayRef.current) {
        dayRef.current = currentDay
        setUsedSeconds(loadPlaytimeSeconds(profileId, currentDay))
        return
      }

      const next = addPlaytimeSeconds(profileId, 1, currentDay)
      setUsedSeconds(next)
    }, 1000)

    return () => clearInterval(interval)
  }, [profileId])

  const remainingSeconds = Math.max(0, limitSeconds - usedSeconds)
  const isLocked = remainingSeconds <= 0
  const isWarning = remainingSeconds > 0 && remainingSeconds <= WARNING_THRESHOLD_SECONDS

  return { usedSeconds, remainingSeconds, limitSeconds, isLocked, isWarning }
}
