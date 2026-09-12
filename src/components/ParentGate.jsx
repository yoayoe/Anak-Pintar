import { useState } from 'react'
import { loadPin, savePin } from '../data/storage'

export default function ParentGate({ onSuccess, onCancel }) {
  const existingPin = loadPin()
  const [step, setStep] = useState(existingPin ? 'enter' : 'create')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')

  function handleCreate(e) {
    e.preventDefault()
    if (pin.length !== 4) return setError('PIN harus 4 digit')
    if (pin !== confirmPin) return setError('PIN tidak sama')
    savePin(pin)
    onSuccess()
  }

  function handleEnter(e) {
    e.preventDefault()
    if (pin === existingPin) {
      onSuccess()
    } else {
      setError('PIN salah')
      setPin('')
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {step === 'create' ? (
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
              <button type="button" className="btn-secondary" onClick={onCancel}>Batal</button>
              <button type="submit" className="btn-primary">Simpan</button>
            </div>
          </form>
        ) : (
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
              <button type="button" className="btn-secondary" onClick={onCancel}>Batal</button>
              <button type="submit" className="btn-primary">Masuk</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
