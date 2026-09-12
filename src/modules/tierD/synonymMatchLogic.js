export const MAX_LEVEL = 6

export const EASY_PAIRS = [
  { word: 'Happy', synonym: 'Glad', distractors: ['Sad', 'Angry', 'Tired'] },
  { word: 'Big', synonym: 'Large', distractors: ['Small', 'Short', 'Thin'] },
  { word: 'Fast', synonym: 'Quick', distractors: ['Slow', 'Heavy', 'Loud'] },
  { word: 'Small', synonym: 'Tiny', distractors: ['Huge', 'Wide', 'Tall'] },
  { word: 'Smart', synonym: 'Clever', distractors: ['Silly', 'Slow', 'Weak'] },
  { word: 'Pretty', synonym: 'Beautiful', distractors: ['Ugly', 'Plain', 'Dull'] },
  { word: 'Cold', synonym: 'Chilly', distractors: ['Hot', 'Warm', 'Dry'] },
  { word: 'Funny', synonym: 'Silly', distractors: ['Serious', 'Boring', 'Sad'] },
  { word: 'Nice', synonym: 'Kind', distractors: ['Mean', 'Rude', 'Cruel'] },
  { word: 'Loud', synonym: 'Noisy', distractors: ['Quiet', 'Soft', 'Calm'] },
  { word: 'Old', synonym: 'Ancient', distractors: ['New', 'Young', 'Fresh'] },
  { word: 'Strong', synonym: 'Powerful', distractors: ['Weak', 'Fragile', 'Tiny'] },
  { word: 'Sad', synonym: 'Unhappy', distractors: ['Glad', 'Joyful', 'Calm'] },
  { word: 'Clean', synonym: 'Tidy', distractors: ['Dirty', 'Messy', 'Wet'] },
]

export const HARD_PAIRS = [
  { word: 'Brave', synonym: 'Courageous', distractors: ['Afraid', 'Lazy', 'Shy'] },
  { word: 'Begin', synonym: 'Start', distractors: ['Finish', 'Stop', 'Pause'] },
  { word: 'Difficult', synonym: 'Hard', distractors: ['Easy', 'Simple', 'Soft'] },
  { word: 'Silent', synonym: 'Quiet', distractors: ['Loud', 'Bright', 'Fast'] },
  { word: 'Enormous', synonym: 'Huge', distractors: ['Tiny', 'Average', 'Slim'] },
  { word: 'Ancient', synonym: 'Old', distractors: ['Modern', 'New', 'Recent'] },
  { word: 'Furious', synonym: 'Angry', distractors: ['Calm', 'Happy', 'Bored'] },
  { word: 'Assist', synonym: 'Help', distractors: ['Block', 'Ignore', 'Harm'] },
  { word: 'Rapid', synonym: 'Swift', distractors: ['Sluggish', 'Steady', 'Gentle'] },
  { word: 'Genuine', synonym: 'Real', distractors: ['Fake', 'Copied', 'False'] },
  { word: 'Exhausted', synonym: 'Tired', distractors: ['Energetic', 'Alert', 'Fresh'] },
  { word: 'Peculiar', synonym: 'Strange', distractors: ['Normal', 'Common', 'Usual'] },
  { word: 'Generous', synonym: 'Giving', distractors: ['Selfish', 'Greedy', 'Stingy'] },
  { word: 'Terrified', synonym: 'Scared', distractors: ['Brave', 'Confident', 'Bold'] },
]

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function makeRound(level) {
  const pool = level >= 4 ? HARD_PAIRS : EASY_PAIRS
  const pick = pool[randInt(0, pool.length - 1)]
  const options = [pick.synonym, ...pick.distractors].sort(() => Math.random() - 0.5)
  return { word: pick.word, answer: pick.synonym, options }
}
