import BalloonPop from './tierA/BalloonPop'
import AnimalSounds from './tierA/AnimalSounds'
import ColorMatch from './tierA/ColorMatch'
import NumbersLetters from './tierA/NumbersLetters'
import AdditionB from './tierB/AdditionB'
import OddOneOutB from './tierB/OddOneOut'
import WordPictureMatch from './tierB/WordPictureMatch'
import AddSubtract from './tierC/AddSubtract'
import OddOneOutC from './tierC/OddOneOut'
import FillBlank from './tierC/FillBlank'
import Multiplication from './tierD/Multiplication'
import PatternSequence from './tierD/PatternSequence'
import SynonymMatch from './tierD/SynonymMatch'
import { MAX_LEVEL as COLOR_MATCH_MAX } from './tierA/colorMatchLogic'
import { MAX_LEVEL as NUMBERS_LETTERS_MAX } from './tierA/numbersLettersLogic'
import { MAX_LEVEL as ADDITION_MAX } from './tierB/additionLogic'
import { MAX_LEVEL as WORD_PICTURE_MAX } from './tierB/wordPictureLogic'
import { MAX_LEVEL as ADD_SUBTRACT_MAX } from './tierC/addSubtractLogic'
import { MAX_LEVEL as FILL_BLANK_MAX } from './tierC/fillBlankLogic'
import { MAX_LEVEL as MULTIPLICATION_MAX } from './tierD/multiplicationLogic'
import { MAX_LEVEL as PATTERN_MAX } from './tierD/patternSequenceLogic'
import { MAX_LEVEL as SYNONYM_MAX } from './tierD/synonymMatchLogic'
import { MAX_LEVEL_B as ODD_ONE_OUT_B_MAX, MAX_LEVEL_C as ODD_ONE_OUT_C_MAX } from './shared/oddOneOutLogic'

// maxLevel null = free play tanpa grading (lihat README bab "Sistem Leveling").
export const GAMES = [
  { id: 'tierA-balloon-pop', tier: 'A', subject: 'math', title: 'Balon Angka', emoji: '🎈', maxLevel: null, component: BalloonPop },
  { id: 'tierA-animal-sounds', tier: 'A', subject: 'english', title: 'Animal Sounds', emoji: '🐶', maxLevel: null, component: AnimalSounds },
  { id: 'tierA-color-match', tier: 'A', subject: 'logic', title: 'Color Match', emoji: '🌈', maxLevel: COLOR_MATCH_MAX, component: ColorMatch },
  { id: 'tierA-numbers-letters', tier: 'A', subject: 'literacy', title: 'Angka & Huruf', emoji: '🔤', maxLevel: NUMBERS_LETTERS_MAX, component: NumbersLetters },
  { id: 'tierB-addition', tier: 'B', subject: 'math', title: 'Tambah Ceria', emoji: '➕', maxLevel: ADDITION_MAX, component: AdditionB },
  { id: 'tierB-odd-one-out', tier: 'B', subject: 'logic', title: 'Cari yang Beda', emoji: '🔍', maxLevel: ODD_ONE_OUT_B_MAX, component: OddOneOutB },
  { id: 'tierB-word-picture', tier: 'B', subject: 'english', title: 'Kata & Gambar', emoji: '🖼️', maxLevel: WORD_PICTURE_MAX, component: WordPictureMatch },
  { id: 'tierC-add-subtract', tier: 'C', subject: 'math', title: 'Tambah & Kurang', emoji: '➗', maxLevel: ADD_SUBTRACT_MAX, component: AddSubtract },
  { id: 'tierC-odd-one-out', tier: 'C', subject: 'logic', title: 'Cari yang Beda', emoji: '🧐', maxLevel: ODD_ONE_OUT_C_MAX, component: OddOneOutC },
  { id: 'tierC-fill-blank', tier: 'C', subject: 'english', title: 'Lengkapi Kalimat', emoji: '📝', maxLevel: FILL_BLANK_MAX, component: FillBlank },
  { id: 'tierD-multiplication', tier: 'D', subject: 'math', title: 'Perkalian Cepat', emoji: '✖️', maxLevel: MULTIPLICATION_MAX, component: Multiplication },
  { id: 'tierD-pattern-sequence', tier: 'D', subject: 'logic', title: 'Lanjutkan Pola', emoji: '🧩', maxLevel: PATTERN_MAX, component: PatternSequence },
  { id: 'tierD-synonym-match', tier: 'D', subject: 'english', title: 'Synonym Match', emoji: '📚', maxLevel: SYNONYM_MAX, component: SynonymMatch },
]

export function gamesForTier(tier) {
  return GAMES.filter((g) => g.tier === tier)
}
