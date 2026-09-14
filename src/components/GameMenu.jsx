import { useEffect, useState } from 'react'
import { gamesForTier } from '../modules/registry'
import { tierForProfile, TIER_LABELS, isTierAMastered } from '../data/ageTier'
import { loadProgress } from '../data/storage'
import { useProfiles } from '../context/ProfileContext'

const SUBJECT_LABELS = { math: 'Matematika', logic: 'Logika', english: 'Bahasa Inggris', literacy: 'Baca Tulis' }
const SUBJECT_COLORS = { math: 'c1', logic: 'c2', english: 'c3', literacy: 'c4' }

export default function GameMenu({ profile, onSelectGame, onStartPlacement }) {
  const { updateProfile } = useProfiles()
  const tier = tierForProfile(profile)
  const games = gamesForTier(tier)
  const [justUpgraded, setJustUpgraded] = useState(false)

  // Tier A -> B otomatis kalau anak sudah menguasai semua game Tier A, walau
  // umurnya belum cukup untuk Tier B - tidak menimpa pilihan manual orang tua.
  useEffect(() => {
    if (tier !== 'A' || profile.tierOverride || profile.tierUpgrade) return
    let cancelled = false
    loadProgress(profile.id).then((progress) => {
      if (cancelled) return
      if (isTierAMastered(progress.games)) {
        updateProfile(profile.id, { tierUpgrade: 'B' })
        setJustUpgraded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [tier, profile.id, profile.tierOverride, profile.tierUpgrade, updateProfile])

  return (
    <div className="game-menu">
      <h2>
        Halo, {profile.name}! {TIER_LABELS[tier]}
      </h2>
      {justUpgraded && (
        <p className="empty-hint">🎉 Hebat! {profile.name} sudah menguasai semua materi dasar dan naik ke {TIER_LABELS.B}!</p>
      )}
      {games.length === 0 ? (
        <p className="empty-hint">Game untuk tingkat ini sedang disiapkan. Segera hadir!</p>
      ) : (
        <>
          <div className="cards">
            {games.map((g) => (
              <button key={g.id} className={`card ${SUBJECT_COLORS[g.subject]}`} onClick={() => onSelectGame(g)}>
                <span className="emoji">{g.emoji}</span>
                {g.title}
                <span className="subject-tag">{SUBJECT_LABELS[g.subject]}</span>
              </button>
            ))}
          </div>
          <button className="gear-btn" onClick={onStartPlacement}>
            🎯 Belum yakin levelnya? Coba Tes Penempatan
          </button>
        </>
      )}
    </div>
  )
}
