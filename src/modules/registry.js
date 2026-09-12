import BalloonPop from './tierA/BalloonPop'
import AnimalSounds from './tierA/AnimalSounds'
import ColorMatch from './tierA/ColorMatch'
import Multiplication from './tierD/Multiplication'
import PatternSequence from './tierD/PatternSequence'
import SynonymMatch from './tierD/SynonymMatch'

export const GAMES = [
  { id: 'tierA-balloon-pop', tier: 'A', subject: 'math', title: 'Balon Angka', emoji: '🎈', component: BalloonPop },
  { id: 'tierA-animal-sounds', tier: 'A', subject: 'english', title: 'Animal Sounds', emoji: '🐶', component: AnimalSounds },
  { id: 'tierA-color-match', tier: 'A', subject: 'logic', title: 'Color Match', emoji: '🌈', component: ColorMatch },
  { id: 'tierD-multiplication', tier: 'D', subject: 'math', title: 'Perkalian Cepat', emoji: '✖️', component: Multiplication },
  { id: 'tierD-pattern-sequence', tier: 'D', subject: 'logic', title: 'Lanjutkan Pola', emoji: '🧩', component: PatternSequence },
  { id: 'tierD-synonym-match', tier: 'D', subject: 'english', title: 'Synonym Match', emoji: '📚', component: SynonymMatch },
]

export function gamesForTier(tier) {
  return GAMES.filter((g) => g.tier === tier)
}
