const STAGE_NAMES = ['Pemanasan', 'Dasar', 'Menengah', 'Mahir', 'Master']

export function stageLabel(level, maxLevel) {
  const idx = Math.min(STAGE_NAMES.length - 1, Math.floor(((level - 1) / maxLevel) * STAGE_NAMES.length))
  return STAGE_NAMES[idx]
}
