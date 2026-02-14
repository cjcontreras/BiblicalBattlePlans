import { useState, useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { useReadingHeatmap } from '../../hooks/useReadingHeatmap'

const DAY_LABELS = ['', 'MON', '', 'WED', '', 'FRI', ''] // rows 0-6 (Sun-Sat)
const MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function getIntensityLevel(count: number, max: number): number {
  if (count === 0 || max === 0) return 0
  const ratio = count / max
  if (ratio <= 0.25) return 1
  if (ratio <= 0.50) return 2
  if (ratio <= 0.75) return 3
  return 4
}

const INTENSITY_COLORS = [
  'bg-[#d5cbae]', // 0 - warm tan (visible on sage bg)
  'bg-[#a8cead]', // 1 - muted sage
  'bg-[#74b07e]', // 2 - medium green
  'bg-[#4a8f56]', // 3 - rich green
  'bg-[#2d6b38]', // 4 - dark forest
]

interface CellData {
  date: string
  count: number
  dayOfWeek: number // 0=Sun, 6=Sat
  weekIndex: number
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ReadingHeatmap() {
  const { data, isLoading } = useReadingHeatmap()
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number } | null>(null)

  const { grid, monthLabels, totalWeeks } = useMemo(() => {
    if (!data) return { grid: [], monthLabels: [], totalWeeks: 0 }

    const start = new Date(data.startDate + 'T12:00:00')
    const end = new Date(data.endDate + 'T12:00:00')

    // Adjust start to the previous Sunday to align the grid
    const adjustedStart = new Date(start)
    adjustedStart.setDate(adjustedStart.getDate() - adjustedStart.getDay())

    const cells: CellData[] = []
    const current = new Date(adjustedStart)
    let weekIndex = 0

    while (current <= end) {
      const dateStr = current.toLocaleDateString('en-CA')
      const dayOfWeek = current.getDay()

      cells.push({
        date: dateStr,
        count: data.days[dateStr] || 0,
        dayOfWeek,
        weekIndex,
      })

      current.setDate(current.getDate() + 1)
      if (current.getDay() === 0) weekIndex++
    }

    const weeks = cells.length > 0 ? cells[cells.length - 1].weekIndex + 1 : 0

    // Calculate month labels - find first Sunday of each new month
    const months: { label: string; column: number }[] = []
    let lastMonth = -1
    for (const cell of cells) {
      if (cell.dayOfWeek !== 0) continue
      const d = new Date(cell.date + 'T12:00:00')
      const month = d.getMonth()
      if (month !== lastMonth) {
        months.push({ label: MONTH_ABBR[month], column: cell.weekIndex })
        lastMonth = month
      }
    }

    return { grid: cells, monthLabels: months, totalWeeks: weeks }
  }, [data])

  if (isLoading) return null
  if (!data || Object.keys(data.days).length === 0) return null

  function handleCellInteraction(
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    cell: CellData
  ) {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      date: cell.date,
      count: cell.count,
    })
  }

  // Build a lookup for fast cell access
  const cellMap = new Map<string, CellData>()
  for (const cell of grid) {
    cellMap.set(`${cell.weekIndex}-${cell.dayOfWeek}`, cell)
  }

  // Build month label lookup by column
  const monthLabelMap = new Map<number, string>()
  for (const m of monthLabels) {
    monthLabelMap.set(m.column, m.label)
  }

  return (
    <div className="sage-panel">
      <div className="sage-panel-header">
        <div className="flex items-center gap-2 font-pixel text-[0.75rem]">
          <CalendarDays className="w-5 h-5" />
          CAMPAIGN LOG
        </div>
      </div>
      <div className="p-4 sm:p-5">
        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y - 8,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-parchment-light border border-border-subtle px-2 py-1 shadow-md">
              <span className="font-pixel text-[0.5rem] text-ink whitespace-nowrap">
                {tooltip.count} {tooltip.count === 1 ? 'chapter' : 'chapters'} — {formatDate(tooltip.date)}
              </span>
            </div>
          </div>
        )}

        {/* Grid area: day labels + cells + month labels */}
        <div
          className="grid mx-auto"
          style={{
            gridTemplateColumns: `24px repeat(${totalWeeks}, 1fr)`,
            gridTemplateRows: 'repeat(7, 1fr) auto',
            gap: '3px',
            maxWidth: '380px',
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Day labels (column 1, rows 1-7) */}
          {DAY_LABELS.map((label, i) => (
            <div
              key={`label-${i}`}
              className="flex items-center justify-end pr-1"
              style={{ gridRow: i + 1, gridColumn: 1 }}
            >
              {label && (
                <span className="font-pixel text-[0.4rem] text-ink-muted leading-none">{label}</span>
              )}
            </div>
          ))}

          {/* Heatmap cells (columns 2+, rows 1-7) */}
          {Array.from({ length: totalWeeks }, (_, weekIdx) =>
            Array.from({ length: 7 }, (_, dayIdx) => {
              const cell = cellMap.get(`${weekIdx}-${dayIdx}`)
              const gridCol = weekIdx + 2 // offset by 1 for day labels column
              const gridRow = dayIdx + 1
              if (!cell) {
                return (
                  <div
                    key={`empty-${weekIdx}-${dayIdx}`}
                    style={{ gridRow, gridColumn: gridCol, aspectRatio: '1' }}
                  />
                )
              }
              const level = getIntensityLevel(cell.count, data!.maxChapters)
              return (
                <div
                  key={cell.date}
                  className={`${INTENSITY_COLORS[level]} cursor-pointer`}
                  style={{ gridRow, gridColumn: gridCol, aspectRatio: '1' }}
                  onMouseEnter={(e) => handleCellInteraction(e, cell)}
                  onTouchStart={(e) => handleCellInteraction(e, cell)}
                />
              )
            })
          ).flat()}

          {/* Month labels (row 8, spanning across columns) */}
          <div style={{ gridRow: 8, gridColumn: 1 }} />
          {Array.from({ length: totalWeeks }, (_, weekIdx) => {
            const label = monthLabelMap.get(weekIdx)
            return (
              <div
                key={`month-${weekIdx}`}
                className="pt-1"
                style={{ gridRow: 8, gridColumn: weekIdx + 2 }}
              >
                {label && (
                  <span className="font-pixel text-[0.4rem] text-ink-muted">{label}</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-1.5 mt-3" style={{ maxWidth: '380px', margin: '12px auto 0' }}>
          <span className="font-pixel text-[0.4rem] text-ink-muted">LESS</span>
          {INTENSITY_COLORS.map((color, i) => (
            <div key={i} className={`${color} w-[10px] h-[10px] sm:w-3 sm:h-3`} />
          ))}
          <span className="font-pixel text-[0.4rem] text-ink-muted">MORE</span>
        </div>
      </div>
    </div>
  )
}
