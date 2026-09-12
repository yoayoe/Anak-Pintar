import { createContext, useContext, useMemo, useState } from 'react'
import { generateId, loadProfiles, saveProfiles } from '../data/storage'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState(() => loadProfiles())
  const [activeProfileId, setActiveProfileId] = useState(null)

  function addProfile(profile) {
    const next = [...profiles, { id: generateId(), ...profile }]
    setProfiles(next)
    saveProfiles(next)
  }

  function updateProfile(id, patch) {
    const next = profiles.map((p) => (p.id === id ? { ...p, ...patch } : p))
    setProfiles(next)
    saveProfiles(next)
  }

  function removeProfile(id) {
    const next = profiles.filter((p) => p.id !== id)
    setProfiles(next)
    saveProfiles(next)
    if (activeProfileId === id) setActiveProfileId(null)
  }

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) || null,
    [profiles, activeProfileId],
  )

  const value = {
    profiles,
    activeProfile,
    setActiveProfileId,
    addProfile,
    updateProfile,
    removeProfile,
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfiles() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfiles must be used within ProfileProvider')
  return ctx
}
