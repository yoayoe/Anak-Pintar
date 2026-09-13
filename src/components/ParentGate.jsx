import { useEffect, useState } from 'react'
import { createPin, pinExists, verifyPin } from '../data/storage'

export default function ParentGate({ onSuccess, onCancel, allowCancel = true }) {
  const [step, setStep] = useState(null) // null while checking, then 'create' | 'enter'
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    pinExists()
      .then((exists) => setStep(exists ? 'enter' : 'create'))
      .catch(() => setError('Gagal terhubung ke server'))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (pin.length !== 4) return setError('PIN harus 4 digit')
    if (pin !== confirmPin) return setError('PIN tidak sama')
    setBusy(true)
    try {
      await createPin(pin)
      onSuccess()
    } catch {
      setError('Gagal menyimpan PIN, coba lagi')
    } finally {
      setBusy(false)
    }
  }

  async function handleEnter(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const ok = await verifyPin(pin)
      if (ok) {
        onSuccess()
      } else {
        setError('PIN salah')
        setPin('')
      }
    } catch {
      setError('Terlalu banyak percobaan, coba lagi nanti')
      setPin('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {step === null && <p>Memuat...</p>}
        {step === 'create' && (
          <form onSubmit={handleCreate}>
            <h2>Buat PIN Orang Tua</h2>
            <p>PIN ini dipakai untuk mengatur profil &amp; batas waktu anak.</p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="4 digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Ulangi PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            />
            {error && <p className="form-error">{error}</p>}
            <div className="modal-actions">
              {allowCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Batal</button>}
              <button type="submit" className="btn-primary" disabled={busy}>Simpan</button>
            </div>
          </form>
        )}
        {step === 'enter' && (
          <form onSubmit={handleEnter}>
            <h2>Masuk sebagai Orang Tua</h2>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Masukkan PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
            {error && <p className="form-error">{error}</p>}
            <div className="modal-actions">
              {allowCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Batal</button>}
              <button type="submit" className="btn-primary" disabled={busy}>Masuk</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
