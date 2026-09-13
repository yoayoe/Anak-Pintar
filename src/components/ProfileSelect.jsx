import { useState } from 'react'
import { useProfiles } from '../context/ProfileContext'
import { ageFromBirthYear, TIER_LABELS, tierForProfile } from '../data/ageTier'
import ParentGate from './ParentGate'

export default function ProfileSelect({ onPlay, onOpenSettings }) {
  const { profiles, loading, setActiveProfileId } = useProfiles()
  const [showGate, setShowGate] = useState(false)

  function play(id) {
    setActiveProfileId(id)
    onPlay()
  }

  return (
    <div className="screen profile-select">
      <h1>Dunia Ceria</h1>
      <div className="profile-cards">
        {profiles.map((p) => (
          <button key={p.id} className="profile-card" onClick={() => play(p.id)}>
            <span className="profile-avatar">{p.avatar}</span>
            <span className="profile-name">{p.name}</span>
            <span className="profile-tier">{TIER_LABELS[tierForProfile(p)]}</span>
          </button>
        ))}
        {!loading && profiles.length === 0 && (
          <p className="empty-hint">Belum ada profil. Tambahkan lewat Pengaturan Orang Tua.</p>
        )}
      </div>
      <button className="gear-btn" onClick={() => setShowGate(true)} aria-label="Pengaturan Orang Tua">
        ⚙️ Pengaturan Orang Tua
      </button>
      {showGate && (
        <ParentGate
          onSuccess={() => {
            setShowGate(false)
            onOpenSettings()
          }}
          onCancel={() => setShowGate(false)}
        />
      )}
    </div>
  )
}

export function ageLabel(profile) {
  return `${ageFromBirthYear(profile.birthYear)} th`
}
