import { useState } from 'react'
import { ProfileProvider, useProfiles } from './context/ProfileContext'
import { tierForProfile } from './data/ageTier'
import LoginGate from './components/LoginGate'
import ProfileSelect from './components/ProfileSelect'
import Settings from './components/Settings'
import GameShell from './components/GameShell'
import GameMenu from './components/GameMenu'
import PlacementTest from './components/PlacementTest'

function Router() {
  const { activeProfile, setActiveProfileId } = useProfiles()
  const [screen, setScreen] = useState('select') // 'select' | 'settings' | 'play' | 'placement'
  const [activeGame, setActiveGame] = useState(null)

  function goHome() {
    setActiveGame(null)
    setActiveProfileId(null)
    setScreen('select')
  }

  if (screen === 'settings') {
    return <Settings onBack={() => setScreen('select')} />
  }

  if (screen === 'placement' && activeProfile) {
    return (
      <GameShell profile={activeProfile} onHome={() => setScreen('play')}>
        {/* key membuat tes restart bersih kalau tierOverride berubah (mis. anak turun tier) */}
        <PlacementTest
          key={tierForProfile(activeProfile)}
          profile={activeProfile}
          onFinish={() => setScreen('play')}
          onCancel={() => setScreen('play')}
        />
      </GameShell>
    )
  }

  if (screen === 'play' && activeProfile) {
    return (
      <GameShell profile={activeProfile} onHome={activeGame ? () => setActiveGame(null) : goHome}>
        {activeGame ? (
          <activeGame.component profileId={activeProfile.id} />
        ) : (
          <GameMenu
            profile={activeProfile}
            onSelectGame={setActiveGame}
            onStartPlacement={() => setScreen('placement')}
          />
        )}
      </GameShell>
    )
  }

  return <ProfileSelect onPlay={() => setScreen('play')} onOpenSettings={() => setScreen('settings')} />
}

export default function App() {
  return (
    <LoginGate>
      <ProfileProvider>
        <Router />
      </ProfileProvider>
    </LoginGate>
  )
}
