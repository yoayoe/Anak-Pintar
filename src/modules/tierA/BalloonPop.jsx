import { useEffect, useRef, useState } from 'react'
import { playPop } from '../../data/sound'
import { useGameProgress } from '../../hooks/useGameProgress'

const COLORS = ['#ff6f91', '#ffb400', '#63d471', '#4dd0e1', '#ba68c8', '#ff8a65']
const PARTICLES = ['✨', '⭐', '🎉']

export default function BalloonPop({ profileId }) {
  const { stars, awardStar } = useGameProgress(profileId, 'tierA-balloon-pop')
  const [score, setScore] = useState(0)
  const areaRef = useRef(null)
  const activeRef = useRef([])
  const idRef = useRef(0)

  useEffect(() => {
    spawnBalloon()
    const interval = setInterval(spawnBalloon, 2000)
    return () => {
      clearInterval(interval)
      activeRef.current.forEach((b) => {
        clearTimeout(b.timeout)
        b.el.remove()
      })
      activeRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function spawnBalloon() {
    const area = areaRef.current
    if (!area) return
    const id = idRef.current++
    const el = document.createElement('div')
    el.className = 'balloon'
    el.style.left = 5 + Math.random() * 80 + 'vw'
    el.style.background = COLORS[Math.floor(Math.random() * COLORS.length)]
    el.textContent = '🎈'
    const duration = 11 + Math.random() * 4
    el.style.transition = `transform ${duration}s linear, opacity .2s`
    area.appendChild(el)

    requestAnimationFrame(() => {
      el.style.transform = 'translateY(-135vh)'
    })

    const timeout = setTimeout(() => {
      el.remove()
      activeRef.current = activeRef.current.filter((b) => b.id !== id)
    }, duration * 1000 + 100)

    el.addEventListener('click', () => pop(id, el, timeout))
    activeRef.current.push({ id, el, timeout })
  }

  function pop(id, el, timeout) {
    clearTimeout(timeout)
    const rect = el.getBoundingClientRect()
    playPop()
    setScore((s) => {
      const next = s + 1
      if (next % 5 === 0) awardStar()
      return next
    })
    burst(rect)
    el.remove()
    activeRef.current = activeRef.current.filter((b) => b.id !== id)
  }

  function burst(rect) {
    for (let i = 0; i < 5; i++) {
      const p = document.createElement('div')
      p.className = 'pop-particle'
      p.textContent = PARTICLES[Math.floor(Math.random() * PARTICLES.length)]
      p.style.left = rect.left + rect.width / 2 + 'px'
      p.style.top = rect.top + rect.height / 2 + 'px'
      document.body.appendChild(p)
      const angle = Math.random() * Math.PI * 2
      const dist = 40 + Math.random() * 60
      p.style.transition = 'transform .5s ease-out, opacity .5s'
      requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`
        p.style.opacity = '0'
      })
      setTimeout(() => p.remove(), 550)
    }
  }

  return (
    <div className="game-area balloon-game" ref={areaRef}>
      <div className="star-bar">
        ⭐ {score} <span className="stars-total">(total {stars}★)</span>
      </div>
    </div>
  )
}
