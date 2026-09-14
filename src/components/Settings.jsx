import { useEffect, useState } from 'react'
import { useProfiles } from '../context/ProfileContext'
import { ageFromBirthYear, ageTierForProfile, TIER_LABELS, TIERS, tierForProfile } from '../data/ageTier'
import { loadPlaytimeSeconds, logout } from '../data/storage'
import ProgressReport from './ProgressReport'

const AVATARS = ['🐻', '🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🦄']

export default function Settings({ onBack }) {
  const { profiles, addProfile, updateProfile, removeProfile } = useProfiles()
  const [form, setForm] = useState(null)
  const [reportProfileId, setReportProfileId] = useState(null)
  const [playtimes, setPlaytimes] = useState({})
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all(profiles.map((p) => loadPlaytimeSeconds(p.id).then((seconds) => [p.id, seconds]))).then((pairs) => {
      if (!cancelled) setPlaytimes(Object.fromEntries(pairs))
    })
    return () => {
      cancelled = true
    }
  }, [profiles])

  function startNew() {
    setForm({ name: '', avatar: AVATARS[0], birthYear: new Date().getFullYear() - 5, dailyLimitMinutes: 45 })
  }

  function startEdit(p) {
    setForm({ ...p })
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (form.id) {
      await updateProfile(form.id, form)
    } else {
      await addProfile(form)
    }
    setForm(null)
  }

  async function handleLogout() {
    await logout()
    window.location.reload()
  }

  async function confirmDelete() {
    await removeProfile(confirmDeleteId)
    setConfirmDeleteId(null)
  }

  const reportProfile = profiles.find((p) => p.id === reportProfileId)
  const deleteProfile = profiles.find((p) => p.id === confirmDeleteId)
  if (reportProfile) {
    return <ProgressReport profile={reportProfile} onBack={() => setReportProfileId(null)} />
  }

  return (
    <div className="screen settings">
      <button className="home-btn" onClick={onBack}>🏠</button>
      <button className="btn-secondary logout-btn" onClick={handleLogout}>Keluar</button>
      <h1>Pengaturan Orang Tua</h1>

      {!form && (
        <>
          <div className="settings-list">
            {profiles.map((p) => (
              <div key={p.id} className="settings-row">
                <span className="profile-avatar-sm">{p.avatar}</span>
                <div className="settings-row-info">
                  <strong>{p.name}</strong>
                  <span>{ageFromBirthYear(p.birthYear)} tahun · {TIER_LABELS[tierForProfile(p)]} · {p.dailyLimitMinutes} menit/hari</span>
                  {p.tierOverride && p.tierOverride !== ageTierForProfile(p) && (
                    <span className="settings-row-sub">
                      ⚠️ Tingkat diatur manual (bukan {TIER_LABELS[ageTierForProfile(p)]} sesuai umur)
                    </span>
                  )}
                  {!p.tierOverride && p.tierUpgrade && p.tierUpgrade !== ageTierForProfile(p) && (
                    <span className="settings-row-sub">
                      🌟 Naik tingkat otomatis karena sudah menguasai {TIER_LABELS[ageTierForProfile(p)]}
                    </span>
                  )}
                  <span className="settings-row-sub">Main hari ini: {Math.round((playtimes[p.id] || 0) / 60)} menit</span>
                </div>
                <div className="settings-row-actions">
                  <button className="btn-secondary" onClick={() => setReportProfileId(p.id)}>📊 Progres</button>
                  <button className="btn-secondary" onClick={() => startEdit(p)}>Ubah</button>
                  <button className="btn-danger" onClick={() => setConfirmDeleteId(p.id)}>Hapus</button>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={startNew}>+ Tambah Profil Anak</button>
        </>
      )}

      {form && (
        <form className="profile-form" onSubmit={submit}>
          <label>
            Nama
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </label>
          <label>
            Avatar
            <div className="avatar-picker">
              {AVATARS.map((a) => (
                <button
                  type="button"
                  key={a}
                  className={`avatar-choice ${form.avatar === a ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, avatar: a })}
                >
                  {a}
                </button>
              ))}
            </div>
          </label>
          <label>
            Tahun Lahir
            <input
              type="number"
              value={form.birthYear}
              onChange={(e) => setForm({ ...form, birthYear: Number(e.target.value) })}
            />
          </label>
          <label>
            Tingkat Kesulitan
            <select
              value={form.tierOverride || ''}
              onChange={(e) => setForm({ ...form, tierOverride: e.target.value || null })}
            >
              <option value="">Otomatis (sesuai umur: {TIER_LABELS[ageTierForProfile(form)]})</option>
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {TIER_LABELS[t]}
                </option>
              ))}
            </select>
            <span className="field-hint">
              Ubah manual kalau anak perlu tingkat lebih mudah/sulit dari umurnya. Tes Penempatan juga bisa
              menyarankan ini otomatis kalau anak kesulitan di semua soal.
            </span>
          </label>
          <label>
            Batas Waktu Harian: {form.dailyLimitMinutes} menit
            <input
              type="range"
              min={30}
              max={60}
              step={5}
              value={form.dailyLimitMinutes}
              onChange={(e) => setForm({ ...form, dailyLimitMinutes: Number(e.target.value) })}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setForm(null)}>Batal</button>
            <button type="submit" className="btn-primary">Simpan</button>
          </div>
        </form>
      )}

      {deleteProfile && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Hapus Profil?</h2>
            <p>
              Profil <strong>{deleteProfile.name}</strong> beserta semua progres belajarnya akan dihapus permanen.
              Yakin ingin melanjutkan?
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setConfirmDeleteId(null)}>Batal</button>
              <button type="button" className="btn-danger" onClick={confirmDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
