import { useState } from 'react'
import { useProfiles } from '../context/ProfileContext'
import { ageFromBirthYear, TIER_LABELS, tierForProfile } from '../data/ageTier'
import { loadPlaytimeSeconds } from '../data/storage'

const AVATARS = ['🐻', '🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🦄']

export default function Settings({ onBack }) {
  const { profiles, addProfile, updateProfile, removeProfile } = useProfiles()
  const [form, setForm] = useState(null)

  function startNew() {
    setForm({ name: '', avatar: AVATARS[0], birthYear: new Date().getFullYear() - 5, dailyLimitMinutes: 45 })
  }

  function startEdit(p) {
    setForm({ ...p })
  }

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (form.id) {
      updateProfile(form.id, form)
    } else {
      addProfile(form)
    }
    setForm(null)
  }

  return (
    <div className="screen settings">
      <button className="home-btn" onClick={onBack}>🏠</button>
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
                  <span className="settings-row-sub">Main hari ini: {Math.round(loadPlaytimeSeconds(p.id) / 60)} menit</span>
                </div>
                <button className="btn-secondary" onClick={() => startEdit(p)}>Ubah</button>
                <button className="btn-danger" onClick={() => removeProfile(p.id)}>Hapus</button>
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
    </div>
  )
}
