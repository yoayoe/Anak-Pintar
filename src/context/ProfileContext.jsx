import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createProfile, deleteProfileApi, loadProfiles, updateProfileApi } from '../data/storage'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeProfileId, setActiveProfileId] = useState(null)

  useEffect(() => {
    loadProfiles()
      .then(setProfiles)
      .catch((err) => console.error('Failed to load profiles:', err))
      .finally(() => setLoading(false))
  }, [])

  async function addProfile(profile) {
    const created = await createProfile(profile)
    setProfiles((prev) => [...prev, created])
  }

  async function updateProfile(id, patch) {
    const updated = await updateProfileApi(id, patch)
    setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }

  async function removeProfile(id) {
    await deleteProfileApi(id)
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    if (activeProfileId === id) setActiveProfileId(null)
  }

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) || null,
    [profiles, activeProfileId],
  )

  const value = {
    profiles,
    loading,
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
