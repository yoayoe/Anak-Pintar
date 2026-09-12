import { useState } from 'react'
import { playGentle, speak } from '../../data/sound'
import { useGameProgress } from '../../hooks/useGameProgress'

const ANIMALS = [
  { emoji: '🐶', word: 'Dog', say: 'Woof woof! Dog!' },
  { emoji: '🐱', word: 'Cat', say: 'Meow! Cat!' },
  { emoji: '🐮', word: 'Cow', say: 'Moo! Cow!' },
  { emoji: '🐷', word: 'Pig', say: 'Oink oink! Pig!' },
  { emoji: '🐔', word: 'Chicken', say: 'Cluck cluck! Chicken!' },
  { emoji: '🐸', word: 'Frog', say: 'Ribbit! Frog!' },
  { emoji: '🦆', word: 'Duck', say: 'Quack quack! Duck!' },
  { emoji: '🐑', word: 'Sheep', say: 'Baa baa! Sheep!' },
  { emoji: '🐘', word: 'Elephant', say: 'Toot! Elephant!' },
  { emoji: '🐴', word: 'Horse', say: 'Neigh! Horse!' },
  { emoji: '🦁', word: 'Lion', say: 'Roar! Lion!' },
  { emoji: '🐻', word: 'Bear', say: 'Grr! Bear!' },
  { emoji: '🐝', word: 'Bee', say: 'Buzz buzz! Bee!' },
  { emoji: '🦉', word: 'Owl', say: 'Hoot hoot! Owl!' },
  { emoji: '🐍', word: 'Snake', say: 'Hiss! Snake!' },
  { emoji: '🐒', word: 'Monkey', say: 'Ooh ooh ah ah! Monkey!' },
  { emoji: '🐢', word: 'Turtle', say: 'Slow and steady! Turtle!' },
  { emoji: '🐰', word: 'Rabbit', say: 'Hop hop! Rabbit!' },
]

function pickRandomNine() {
  return [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, 9)
}

export default function AnimalSounds({ profileId }) {
  const { stars, awardStar } = useGameProgress(profileId, 'tierA-animal-sounds')
  const [bubble, setBubble] = useState('')
  const [tapped, setTapped] = useState(() => new Set())
  const [shown] = useState(pickRandomNine)

  function tap(animal) {
    playGentle()
    speak(animal.say, 'en-US', 0.85, 1.1)
    setBubble(animal.say)
    setTapped((prev) => {
      const next = new Set(prev)
      const wasNew = !next.has(animal.word)
      next.add(animal.word)
      if (wasNew && next.size % 3 === 0) awardStar()
      return next
    })
    setTimeout(() => setBubble(''), 1600)
  }

  return (
    <div className="game-area animal-game">
      <div className="star-bar">⭐ {stars}</div>
      {bubble && <div className="speech-bubble show">{bubble}</div>}
      <div className="animal-grid">
        {shown.map((a) => (
          <button key={a.word} className="animal-btn" onClick={() => tap(a)}>
            {a.emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
