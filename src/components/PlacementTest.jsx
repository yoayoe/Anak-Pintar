import { useMemo, useState } from 'react'
import { useProfiles } from '../context/ProfileContext'
import { PREV_TIER, TIER_LABELS, tierForProfile } from '../data/ageTier'
import { stageLabel } from '../data/levelStage'
import { applyPlacementLevels } from '../data/storage'
import { makeRound as colorMakeRound, MAX_LEVEL as COLOR_MAX_LEVEL } from '../modules/tierA/colorMatchLogic'
import { makeNumberRound, makeLetterRound, MAX_LEVEL_NUMBERS, MAX_LEVEL_LETTERS } from '../modules/tierA/numbersLettersLogic'
import { makeQuestion as additionMakeQuestion, MAX_LEVEL as ADDITION_MAX_LEVEL } from '../modules/tierB/additionLogic'
import { makeRound as wordPictureMakeRound, MAX_LEVEL as WORD_PICTURE_MAX_LEVEL } from '../modules/tierB/wordPictureLogic'
import { makeQuestion as addSubtractMakeQuestion, MAX_LEVEL as ADD_SUBTRACT_MAX_LEVEL } from '../modules/tierC/addSubtractLogic'
import { makeRound as fillBlankMakeRound, MAX_LEVEL as FILL_BLANK_MAX_LEVEL } from '../modules/tierC/fillBlankLogic'
import {
  makeRound as oddOneOutMakeRound,
  EASY_PAIRINGS,
  MEDIUM_PAIRINGS,
  HARD_PAIRINGS,
  MAX_LEVEL_B as ODD_ONE_OUT_B_MAX_LEVEL,
  MAX_LEVEL_C as ODD_ONE_OUT_C_MAX_LEVEL,
} from '../modules/shared/oddOneOutLogic'
import { makeQuestion as multMakeQuestion, MAX_LEVEL as MULT_MAX_LEVEL } from '../modules/tierD/multiplicationLogic'
import { makeRound as patternMakeRound, MAX_LEVEL as PATTERN_MAX_LEVEL } from '../modules/tierD/patternSequenceLogic'
import { makeRound as synonymMakeRound, MAX_LEVEL as SYNONYM_MAX_LEVEL } from '../modules/tierD/synonymMatchLogic'


function oddOneOutPoolB(level) {
  return level >= 5 ? MEDIUM_PAIRINGS : EASY_PAIRINGS
}

function oddOneOutPoolC(level) {
  if (level >= 7) return HARD_PAIRINGS
  if (level >= 4) return MEDIUM_PAIRINGS
  return EASY_PAIRINGS
}

const ROUNDS_PER_SUBJECT = 5

const PLACEMENT_BY_TIER = {
  A: [
    {
      gameId: 'tierA-color-match',
      title: 'Warna',
      minLevel: 1,
      maxLevel: COLOR_MAX_LEVEL,
      kind: 'color',
      generate: colorMakeRound,
      isCorrect: (q, key) => key === q.target.name,
    },
    {
      gameId: 'tierA-learn-numbers',
      title: 'Angka',
      minLevel: 1,
      maxLevel: MAX_LEVEL_NUMBERS,
      kind: 'text',
      generate: (level) => {
        const r = makeNumberRound(level)
        return { target: r.target.label, options: r.options.map((o) => o.label), prompt: `Mana angka ${r.target.speech}?` }
      },
      getPrompt: (q) => q.prompt,
      isCorrect: (q, key) => key === q.target,
    },
    {
      gameId: 'tierA-learn-letters',
      title: 'Huruf',
      minLevel: 1,
      maxLevel: MAX_LEVEL_LETTERS,
      kind: 'text',
      generate: (level) => {
        const r = makeLetterRound(level)
        return { target: r.target.label, options: r.options.map((o) => o.label), prompt: `Cari huruf ${r.target.spokenName}!` }
      },
      getPrompt: (q) => q.prompt,
      isCorrect: (q, key) => key === q.target,
    },
  ],
  B: [
    {
      gameId: 'tierB-addition',
      title: 'Matematika (Penjumlahan)',
      minLevel: 1,
      maxLevel: ADDITION_MAX_LEVEL,
      kind: 'text',
      generate: additionMakeQuestion,
      getPrompt: (q) => q.prompt,
      isCorrect: (q, key) => key === q.target,
    },
    {
      gameId: 'tierB-odd-one-out',
      title: 'Logika (Cari yang Beda)',
      minLevel: 1,
      maxLevel: ODD_ONE_OUT_B_MAX_LEVEL,
      kind: 'oddoneout',
      generate: (level) => oddOneOutMakeRound(oddOneOutPoolB(level)),
      isCorrect: (q, key) => key === q.oddItem,
    },
    {
      gameId: 'tierB-word-picture',
      title: 'Bahasa Inggris (Kata & Gambar)',
      minLevel: 1,
      maxLevel: WORD_PICTURE_MAX_LEVEL,
      kind: 'picture-word',
      generate: wordPictureMakeRound,
      isCorrect: (q, key) => key === q.answer,
    },
  ],
  C: [
    {
      gameId: 'tierC-add-subtract',
      title: 'Matematika (Tambah & Kurang)',
      minLevel: 1,
      maxLevel: ADD_SUBTRACT_MAX_LEVEL,
      kind: 'text',
      generate: addSubtractMakeQuestion,
      getPrompt: (q) => q.prompt,
      isCorrect: (q, key) => key === q.target,
    },
    {
      gameId: 'tierC-odd-one-out',
      title: 'Logika (Cari yang Beda)',
      minLevel: 1,
      maxLevel: ODD_ONE_OUT_C_MAX_LEVEL,
      kind: 'oddoneout',
      generate: (level) => oddOneOutMakeRound(oddOneOutPoolC(level)),
      isCorrect: (q, key) => key === q.oddItem,
    },
    {
      gameId: 'tierC-fill-blank',
      title: 'Bahasa Inggris (Lengkapi Kalimat)',
      minLevel: 1,
      maxLevel: FILL_BLANK_MAX_LEVEL,
      kind: 'text',
      generate: fillBlankMakeRound,
      getPrompt: (q) => q.sentence,
      isCorrect: (q, key) => key === q.answer,
    },
  ],
  D: [
    {
      gameId: 'tierD-multiplication',
      title: 'Matematika (Perkalian)',
      minLevel: 1,
      maxLevel: MULT_MAX_LEVEL,
      kind: 'text',
      generate: multMakeQuestion,
      getPrompt: (q) => q.prompt,
      isCorrect: (q, key) => key === q.target,
    },
    {
      gameId: 'tierD-pattern-sequence',
      title: 'Logika (Pola)',
      minLevel: 1,
      maxLevel: PATTERN_MAX_LEVEL,
      kind: 'pattern',
      generate: patternMakeRound,
      isCorrect: (q, key) => key === q.answer,
    },
    {
      gameId: 'tierD-synonym-match',
      title: 'Bahasa Inggris (Sinonim)',
      minLevel: 1,
      maxLevel: SYNONYM_MAX_LEVEL,
      kind: 'text',
      generate: synonymMakeRound,
      getPrompt: (q) => `Sinonim dari: ${q.word}`,
      isCorrect: (q, key) => key === q.answer,
    },
  ],
}

function initSubjectState(subject) {
  return { low: subject.minLevel, high: subject.maxLevel, round: 0 }
}

export default function PlacementTest({ profile, onFinish, onCancel }) {
  const { updateProfile } = useProfiles()
  const tier = tierForProfile(profile)
  const subjects = PLACEMENT_BY_TIER[tier] || []
  const lowerTier = PREV_TIER[tier]

  const [subjectIdx, setSubjectIdx] = useState(0)
  const [subjectState, setSubjectState] = useState(() => (subjects[0] ? initSubjectState(subjects[0]) : null))
  const [results, setResults] = useState({})
  const [done, setDone] = useState(subjects.length === 0)

  const subject = subjects[subjectIdx]
  const currentLevel = subjectState
    ? Math.max(subjectState.low, Math.min(subjectState.high, Math.round((subjectState.low + subjectState.high) / 2)))
    : 1

  const question = useMemo(
    () => (subject && !done ? subject.generate(currentLevel) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subject, currentLevel, subjectIdx, subjectState?.round, done],
  )

  function answer(key) {
    const correct = subject.isCorrect(question, key)
    let { low, high, round } = subjectState
    if (correct) low = currentLevel
    else high = currentLevel - 1
    round += 1

    const finished = round >= ROUNDS_PER_SUBJECT || low >= high
    if (finished) {
      const recommended = Math.max(subject.minLevel, low - 1)
      const nextResults = { ...results, [subject.gameId]: recommended }
      setResults(nextResults)
      const nextIdx = subjectIdx + 1
      if (nextIdx >= subjects.length) {
        setDone(true)
      } else {
        setSubjectIdx(nextIdx)
        setSubjectState(initSubjectState(subjects[nextIdx]))
      }
    } else {
      setSubjectState({ low, high, round })
    }
  }

  async function applyAndFinish() {
    await applyPlacementLevels(profile.id, results)
    onFinish(results)
  }

  function tryLowerTier() {
    updateProfile(profile.id, { tierOverride: lowerTier })
    // PlacementTest di-remount otomatis (lihat key di App.jsx) begitu tier berubah,
    // jadi tesnya langsung mulai dari awal untuk tingkat yang baru.
  }

  if (subjects.length === 0) {
    return (
      <div className="screen placement-test">
        <p className="empty-hint">Belum ada tes penempatan untuk tingkat ini.</p>
        <button className="btn-primary" onClick={onCancel}>
          Kembali
        </button>
      </div>
    )
  }

  if (done) {
    const strugglingBadly = subjects.length > 0 && subjects.every((s) => results[s.gameId] <= s.minLevel)
    const canGoLower = strugglingBadly && lowerTier
    const atFloorStruggling = strugglingBadly && !lowerTier

    return (
      <div className="screen placement-test">
        <h2>Hasil Tes Penempatan</h2>
        <div className="placement-results">
          {subjects.map((s) => (
            <div key={s.gameId} className="placement-result-row">
              <strong>{s.title}</strong>
              <span>
                Level {results[s.gameId]} · {stageLabel(results[s.gameId], s.maxLevel)}
              </span>
            </div>
          ))}
        </div>
        {canGoLower && (
          <div className="placement-warning">
            <p>
              Sepertinya soal di {TIER_LABELS[tier]} masih agak sulit buat sekarang. Mau coba tingkat{' '}
              {TIER_LABELS[lowerTier]} dulu? Bisa dinaikkan lagi kapan saja lewat Pengaturan Orang Tua.
            </p>
            <button className="btn-primary" onClick={tryLowerTier}>
              Coba Tingkat {TIER_LABELS[lowerTier]}
            </button>
          </div>
        )}
        {atFloorStruggling && (
          <div className="placement-warning placement-floor">
            <p>
              {TIER_LABELS[tier]} sudah tingkat termudah di aplikasi ini, jadi levelnya tetap di Level 1 — tidak apa-apa,
              ini wajar dan akan membaik dengan latihan rutin.
            </p>
            <p>
              Sambil ditemani orang tua, coba juga <strong>Balon Angka</strong> dan <strong>Animal Sounds</strong> —
              main bebas tanpa dinilai, cocok buat pemanasan sebelum coba lagi.
            </p>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Batal
          </button>
          <button className="btn-primary" onClick={applyAndFinish}>
            Terapkan &amp; Mulai Main
          </button>
        </div>
      </div>
    )
  }

  const options = question.options

  return (
    <div className="screen placement-test">
      <div className="placement-progress">
        Subjek {subjectIdx + 1}/{subjects.length} · {subject.title} · Soal {subjectState.round + 1}/{ROUNDS_PER_SUBJECT}
      </div>

      {subject.kind === 'color' && (
        <>
          <div className="color-prompt">
            Cari warna ini!
            <div className="target-swatch" style={{ background: question.target.hex }} />
          </div>
          <div className="color-grid">
            {options.map((o, i) => (
              <button
                key={o.name}
                className={`color-shape ${i % 2 === 0 ? 'circle' : 'square'}`}
                style={{ background: o.hex }}
                onClick={() => answer(o.name)}
              />
            ))}
          </div>
        </>
      )}

      {subject.kind === 'text' && (
        <>
          <div className="question-box">{subject.getPrompt(question)}</div>
          <div className="options-grid">
            {options.map((o) => (
              <button key={o} className="option-btn" onClick={() => answer(o)}>
                {o}
              </button>
            ))}
          </div>
        </>
      )}

      {subject.kind === 'pattern' && (
        <>
          <div className="pattern-row">
            {question.shown.map((v, i) => (
              <span key={i} className="pattern-item">
                {v}
              </span>
            ))}
            <span className="pattern-item pattern-blank">?</span>
          </div>
          <div className="options-grid">
            {options.map((o, i) => (
              <button key={i} className="option-btn" onClick={() => answer(o)}>
                {o}
              </button>
            ))}
          </div>
        </>
      )}

      {subject.kind === 'oddoneout' && (
        <>
          <div className="oddoneout-prompt">Cari yang beda!</div>
          <div className="oddoneout-grid">
            {question.items.map((item, i) => (
              <button key={i} className="oddoneout-btn" onClick={() => answer(item)}>
                {item}
              </button>
            ))}
          </div>
        </>
      )}

      {subject.kind === 'picture-word' && (
        <>
          <div className="emoji-prompt">{question.emoji}</div>
          <div className="options-grid">
            {options.map((o) => (
              <button key={o} className="option-btn" onClick={() => answer(o)}>
                {o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
