import { useEffect, useRef, useState } from 'react'
import { addPlaytimeSeconds, loadPlaytimeSeconds, todayStr } from '../data/storage'

const WARNING_THRESHOLD_SECONDS = 5 * 60
// Ticking every second gives responsive UI feedback, but syncing every tick
// to a backend (especially one reachable over the internet via a tunnel)
// would be 60 requests/minute per active session. Batch the writes instead.
const FLUSH_INTERVAL_SECONDS = 10

export function useDailyTimer(profileId, dailyLimitMinutes) {
  const limitSeconds = dailyLimitMinutes * 60
  const [usedSeconds, setUsedSeconds] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const dayRef = useRef(todayStr())
  const pendingRef = useRef(0)

  function flush(day = dayRef.current) {
    const pending = pendingRef.current
    if (pending <= 0) return
    pendingRef.current = 0
    addPlaytimeSeconds(profileId, pending, day).catch((err) => console.error('Failed to save playtime:', err))
  }

  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    pendingRef.current = 0
    dayRef.current = todayStr()

    loadPlaytimeSeconds(profileId)
      .then((seconds) => {
        if (!cancelled) setUsedSeconds(seconds)
      })
      .catch((err) => console.error('Failed to load playtime:', err))
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })

    let ticks = 0
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return

      const currentDay = todayStr()
      if (currentDay !== dayRef.current) {
        flush(dayRef.current)
        dayRef.current = currentDay
        ticks = 0
        loadPlaytimeSeconds(profileId, currentDay).then((seconds) => {
          if (!cancelled) setUsedSeconds(seconds)
        })
        return
      }

      pendingRef.current += 1
      setUsedSeconds((prev) => prev + 1)
      ticks += 1
      if (ticks >= FLUSH_INTERVAL_SECONDS) {
        ticks = 0
        flush(currentDay)
      }
    }, 1000)

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      flush()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId])

  const remainingSeconds = Math.max(0, limitSeconds - usedSeconds)
  const isLocked = loaded && remainingSeconds <= 0
  const isWarning = remainingSeconds > 0 && remainingSeconds <= WARNING_THRESHOLD_SECONDS

  return { usedSeconds, remainingSeconds, limitSeconds, isLocked, isWarning }
}
