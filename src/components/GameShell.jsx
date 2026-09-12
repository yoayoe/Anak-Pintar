import { useDailyTimer } from '../hooks/useDailyTimer'

export default function GameShell({ profile, onHome, children }) {
  const timer = useDailyTimer(profile.id, profile.dailyLimitMinutes)
  const minutesLeft = Math.ceil(timer.remainingSeconds / 60)

  if (timer.isLocked) {
    return (
      <div className="screen lock-screen">
        <div className="lock-card">
          <span className="lock-emoji">🌙</span>
          <h2>Waktu main hari ini sudah habis</h2>
          <p>Sampai jumpa besok ya, {profile.name}!</p>
          <button className="btn-primary" onClick={onHome}>Kembali</button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-shell">
      <button className="home-btn" onClick={onHome}>🏠</button>
      <div className={`timer-badge ${timer.isWarning ? 'warning' : ''}`}>
        ⏳ {minutesLeft} menit
      </div>
      {children}
    </div>
  )
}
