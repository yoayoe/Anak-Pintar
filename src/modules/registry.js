import BalloonPop from './tierA/BalloonPop'
import AnimalSounds from './tierA/AnimalSounds'
import ColorMatch from './tierA/ColorMatch'
import AdditionB from './tierB/AdditionB'
import OddOneOutB from './tierB/OddOneOut'
import WordPictureMatch from './tierB/WordPictureMatch'
import AddSubtract from './tierC/AddSubtract'
import OddOneOutC from './tierC/OddOneOut'
import FillBlank from './tierC/FillBlank'
import Multiplication from './tierD/Multiplication'
import PatternSequence from './tierD/PatternSequence'
import SynonymMatch from './tierD/SynonymMatch'

export const GAMES = [
  { id: 'tierA-balloon-pop', tier: 'A', subject: 'math', title: 'Balon Angka', emoji: '🎈', component: BalloonPop },
  { id: 'tierA-animal-sounds', tier: 'A', subject: 'english', title: 'Animal Sounds', emoji: '🐶', component: AnimalSounds },
  { id: 'tierA-color-match', tier: 'A', subject: 'logic', title: 'Color Match', emoji: '🌈', component: ColorMatch },
  { id: 'tierB-addition', tier: 'B', subject: 'math', title: 'Tambah Ceria', emoji: '➕', component: AdditionB },
  { id: 'tierB-odd-one-out', tier: 'B', subject: 'logic', title: 'Cari yang Beda', emoji: '🔍', component: OddOneOutB },
  { id: 'tierB-word-picture', tier: 'B', subject: 'english', title: 'Kata & Gambar', emoji: '🖼️', component: WordPictureMatch },
  { id: 'tierC-add-subtract', tier: 'C', subject: 'math', title: 'Tambah & Kurang', emoji: '➗', component: AddSubtract },
  { id: 'tierC-odd-one-out', tier: 'C', subject: 'logic', title: 'Cari yang Beda', emoji: '🧐', component: OddOneOutC },
  { id: 'tierC-fill-blank', tier: 'C', subject: 'english', title: 'Lengkapi Kalimat', emoji: '📝', component: FillBlank },
  { id: 'tierD-multiplication', tier: 'D', subject: 'math', title: 'Perkalian Cepat', emoji: '✖️', component: Multiplication },
  { id: 'tierD-pattern-sequence', tier: 'D', subject: 'logic', title: 'Lanjutkan Pola', emoji: '🧩', component: PatternSequence },
  { id: 'tierD-synonym-match', tier: 'D', subject: 'english', title: 'Synonym Match', emoji: '📚', component: SynonymMatch },
]

export function gamesForTier(tier) {
  return GAMES.filter((g) => g.tier === tier)
}
