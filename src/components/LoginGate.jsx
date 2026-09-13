import { useEffect, useState } from 'react'
import { checkSession } from '../data/storage'
import ParentGate from './ParentGate'

// Gates the entire app behind the parent PIN, not just the Settings screen -
// necessary once the app is reachable from the open internet through the
// tunnel, not just the home LAN. A successful check sets an httpOnly session
// cookie server-side, so this only has to prompt again after the cookie
// expires or the server restarts.
export default function LoginGate({ children }) {
  const [authenticated, setAuthenticated] = useState(null) // null while checking

  useEffect(() => {
    checkSession()
      .then(setAuthenticated)
      .catch(() => setAuthenticated(false))
  }, [])

  if (authenticated === null) {
    return (
      <div className="screen">
        <p>Memuat...</p>
      </div>
    )
  }

  if (!authenticated) {
    return <ParentGate allowCancel={false} onSuccess={() => setAuthenticated(true)} />
  }

  return children
}
