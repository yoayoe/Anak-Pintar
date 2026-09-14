import { useEffect, useState } from 'react'
import { GAMES } from '../modules/registry'
import { stageLabel } from '../data/levelStage'
import { ageFromBirthYear, TIER_LABELS, tierForProfile } from '../data/ageTier'
import { loadPlaytimeHistory, loadProgress } from '../data/storage'

const SUBJECT_LABELS = { math: 'Matematika', logic: 'Logika', english: 'Bahasa Inggris', literacy: 'Baca Tulis' }
const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const SETS_PER_LEVEL = 3

function dayLabel(dateStr) {
  // Dipaksa jam 00:00 lokal - tanpa itu string 'YYYY-MM-DD' diparse sebagai UTC
  // dan harinya bisa meleset satu di zona waktu Indonesia.
  return DAY_LABELS[new Date(`${dateStr}T00:00:00`).getDay()]
}

function minutes(seconds) {
  return Math.round(seconds / 60)
}

export default function ProgressReport({ profile, onBack }) {
  const [progress, setProgress] = useState(null)
  const [history, setHistory] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([loadProgress(profile.id), loadPlaytimeHistory(profile.id, 7)])
      .then(([p, h]) => {
        if (cancelled) return
        setProgress(p)
        setHistory(h)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [profile.id])

  if (error) {
    return (
      <div className="screen settings">
        <button className="home-btn" onClick={onBack}>🏠</button>
        <h1>Progres {profile.name}</h1>
        <p className="empty-hint">Gagal memuat data dari server. Coba lagi sebentar.</p>
      </div>
    )
  }

  if (!progress || !history) {
    return (
      <div className="screen settings">
        <button className="home-btn" onClick={onBack}>🏠</button>
        <h1>Progres {profile.name}</h1>
        <p className="empty-hint">Memuat...</p>
      </div>
    )
  }

  const tier = tierForProfile(profile)
  const limitSeconds = profile.dailyLimitMinutes * 60
  const totalWeekSeconds = history.reduce((sum, d) => sum + d.seconds, 0)
  const daysPlayed = history.filter((d) => d.seconds > 0).length
  const chartMax = Math.max(limitSeconds, ...history.map((d) => d.seconds), 1)

  // Game tier saat ini, plus game tier lain yang terlanjur punya progres
  // (misalnya setelah turun tingkat) supaya riwayatnya tidak hilang dari laporan.
  const games = GAMES.filter((g) => g.tier === tier || progress.games[g.id])

  return (
    <div className="screen settings progress-report">
      <button className="home-btn" onClick={onBack}>🏠</button>
      <h1>Progres {profile.name}</h1>
      <p className="report-subtitle">
        {profile.avatar} {ageFromBirthYear(profile.birthYear)} tahun · {TIER_LABELS[tier]} · ⭐ {progress.totalStars} bintang
      </p>

      <h2 className="report-heading">Waktu Main 7 Hari Terakhir</h2>
      <div className="report-chart">
        <div className="report-chart-body">
          <div className="report-chart-limit" style={{ bottom: `${(limitSeconds / chartMax) * 100}%` }}>
            <span>batas {profile.dailyLimitMinutes}m</span>
          </div>
          {history.map((d) => (
            <div key={d.date} className="report-bar-col">
              <div
                className={`report-bar ${d.seconds >= limitSeconds ? 'full' : ''}`}
                style={{ height: `${(d.seconds / chartMax) * 100}%` }}
              >
                {d.seconds > 0 && <span className="report-bar-value">{minutes(d.seconds)}m</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="report-chart-days">
          {history.map((d) => (
            <span key={d.date}>{dayLabel(d.date)}</span>
          ))}
        </div>
      </div>
      <p className="report-summary">
        Total minggu ini <strong>{minutes(totalWeekSeconds)} menit</strong> · main {daysPlayed} dari 7 hari
        {daysPlayed > 0 && ` · rata-rata ${Math.round(minutes(totalWeekSeconds) / daysPlayed)} menit/hari main`}
      </p>

      <h2 className="report-heading">Perkembangan per Game</h2>
      <div className="report-games">
        {games.map((g) => {
          const state = progress.games[g.id]
          const played = Boolean(state)
          const level = state?.level || 1
          const struggling = (state?.consecutiveSetFails || 0) >= 1

          return (
            <div key={g.id} className={`report-game ${played ? '' : 'unplayed'}`}>
              <span className="report-game-emoji">{g.emoji}</span>
              <div className="report-game-info">
                <strong>
                  {g.title} {g.tier !== tier && <span className="report-tag">Tingkat {g.tier}</span>}
                </strong>
                <span className="report-game-sub">{SUBJECT_LABELS[g.subject]}</span>

                {!played && <span className="report-game-sub">Belum pernah dimainkan</span>}

                {played && g.maxLevel && (
                  <>
                    <span className="report-game-sub">
                      Level {level}/{g.maxLevel} · {stageLabel(level, g.maxLevel)} · ⭐ {state.stars}
                    </span>
                    <div className="report-level-bar">
                      <div className="report-level-fill" style={{ width: `${(level / g.maxLevel) * 100}%` }} />
                    </div>
                    <span className="report-game-sub">
                      {state.setsPassedAtLevel}/{SETS_PER_LEVEL} set lulus menuju level berikutnya
                      {state.setAnswered > 0 && ` · sedang mengerjakan set (${state.setAnswered} soal)`}
                    </span>
                    {struggling && <span className="report-warning">⚠️ Baru gagal 1 set — kalau gagal lagi, level turun</span>}
                  </>
                )}

                {played && !g.maxLevel && <span className="report-game-sub">Main bebas · ⭐ {state.stars}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
