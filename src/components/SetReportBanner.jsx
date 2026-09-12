export default function SetReportBanner({ report, showTiming = true }) {
  if (!report || !report.setResult) return null

  const pct = Math.round(report.accuracy * 100)
  const avgSec = (report.avgTimeMs / 1000).toFixed(1)
  const statLine = showTiming ? `${pct}% benar · rata-rata ${avgSec} detik/soal` : `${pct}% benar`

  if (report.setResult === 'passed') {
    return (
      <div className="set-report passed">
        <div className="set-report-title">🌟 Set selesai!</div>
        <div>{statLine}</div>
        {report.leveledUp ? (
          <div className="set-report-level">Naik ke Level {report.level}! 🎉</div>
        ) : (
          <div className="set-report-level">
            Set {report.setsPassedAtLevel}/{report.setsPerLevel} di level ini
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="set-report retry">
      <div className="set-report-title">💪 Ayo coba set berikutnya!</div>
      <div>{statLine}</div>
      {report.leveledDown ? (
        <div className="set-report-level">Turun ke Level {report.level} biar makin pas</div>
      ) : (
        <div className="set-report-level">Tetap di Level {report.level}, latihan lagi ya</div>
      )}
    </div>
  )
}
