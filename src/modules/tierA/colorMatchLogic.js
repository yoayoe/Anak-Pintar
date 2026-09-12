export const MAX_LEVEL = 4

export const COLORS = [
  { name: 'Red', hex: '#ff5252' },
  { name: 'Yellow', hex: '#ffd740' },
  { name: 'Green', hex: '#69f0ae' },
  { name: 'Blue', hex: '#40c4ff' },
  { name: 'Purple', hex: '#b388ff' },
  { name: 'Orange', hex: '#ffab40' },
  { name: 'Pink', hex: '#ff8ac6' },
  { name: 'Brown', hex: '#a1683a' },
  { name: 'Black', hex: '#424242' },
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Gray', hex: '#9e9e9e' },
  { name: 'Cyan', hex: '#18ffff' },
]

function shuffled(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

// More options to choose from as the level rises (3 -> 6), instead of a fixed 4.
export function makeRound(level) {
  const count = Math.min(COLORS.length, 2 + level)
  const picks = shuffled(COLORS).slice(0, count)
  const target = picks[Math.floor(Math.random() * picks.length)]
  return { target, options: shuffled(picks) }
}
