import { gamesForTier } from '../modules/registry'
import { tierForProfile, TIER_LABELS } from '../data/ageTier'

const SUBJECT_LABELS = { math: 'Matematika', logic: 'Logika', english: 'Bahasa Inggris', literacy: 'Baca Tulis' }
const SUBJECT_COLORS = { math: 'c1', logic: 'c2', english: 'c3', literacy: 'c4' }

export default function GameMenu({ profile, onSelectGame, onStartPlacement }) {
  const tier = tierForProfile(profile)
  const games = gamesForTier(tier)

  return (
    <div className="game-menu">
      <h2>
        Halo, {profile.name}! {TIER_LABELS[tier]}
      </h2>
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
