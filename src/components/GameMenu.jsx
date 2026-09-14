import { useEffect, useState } from 'react'
import { gamesForTier, isTierMastered } from '../modules/registry'
import { tierForProfile, TIER_LABELS, NEXT_TIER } from '../data/ageTier'
import { loadProgress } from '../data/storage'
import { useProfiles } from '../context/ProfileContext'

const SUBJECT_LABELS = { math: 'Matematika', logic: 'Logika', english: 'Bahasa Inggris', literacy: 'Baca Tulis' }
const SUBJECT_COLORS = { math: 'c1', logic: 'c2', english: 'c3', literacy: 'c4' }

export default function GameMenu({ profile, onSelectGame, onStartPlacement }) {
  const { updateProfile } = useProfiles()
  const tier = tierForProfile(profile)
  const games = gamesForTier(tier)
  const [upgradedTo, setUpgradedTo] = useState(null)

  // Naik tier otomatis (A->B, B->C, C->D) kalau anak sudah menguasai semua game
  // berjenjang tier saat ini, walau umurnya belum cukup untuk tier berikutnya -
  // tidak menimpa pilihan manual orang tua (tierOverride).
  useEffect(() => {
    const nextTier = NEXT_TIER[tier]
    if (!nextTier || profile.tierOverride || profile.tierUpgrade) return
    let cancelled = false
    loadProgress(profile.id).then((progress) => {
      if (cancelled) return
      if (isTierMastered(tier, progress.games)) {
        updateProfile(profile.id, { tierUpgrade: nextTier })
        setUpgradedTo(nextTier)
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
      {upgradedTo && (
        <p className="empty-hint">🎉 Hebat! {profile.name} sudah menguasai semua materi dan naik ke {TIER_LABELS[upgradedTo]}!</p>
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
