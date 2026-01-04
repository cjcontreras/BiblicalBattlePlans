import { useMemo, useState } from 'react'
import { BookOpen, Trophy, Filter } from 'lucide-react'
import { Card, ProgressBar, Badge } from '../ui'
import type { BookCompletionStatus } from '../../types'
import { 
  type BibleBook,
  getTestamentLabel,
  getBooksByTestament,
} from '../../lib/bibleData'

type FilterMode = 'all' | 'completed' | 'in_progress' | 'unread'

interface BibleProgressDashboardProps {
  books: BibleBook[]
  bookStatus: BookCompletionStatus[]
  totalCompleted: number
  totalChapters: number
  percentage: number
  planName?: string
}

export function BibleProgressDashboard({
  books,
  bookStatus,
  totalCompleted,
  totalChapters,
  percentage,
  planName = 'Bible Reading',
}: BibleProgressDashboardProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('all')

  // Group books by testament for display
  const booksByTestament = useMemo(() => getBooksByTestament(books), [books])

  // Create status map for quick lookup
  const statusMap = useMemo(() => {
    const map = new Map<string, BookCompletionStatus>()
    for (const status of bookStatus) {
      map.set(status.book, status)
    }
    return map
  }, [bookStatus])

  // Calculate testament stats
  const testamentStats = useMemo(() => {
    const stats: Record<string, { completed: number, total: number }> = {}
    
    for (const [testament, testamentBooks] of Object.entries(booksByTestament)) {
      let completed = 0
      let total = 0
      for (const book of testamentBooks) {
        total += book.chapters
        const status = statusMap.get(book.name)
        if (status) {
          completed += status.completedChapters
        }
      }
      stats[testament] = { completed, total }
    }
    
    return stats
  }, [booksByTestament, statusMap])

  // Filter books based on mode
  const filteredBooks = useMemo(() => {
    if (filterMode === 'all') return books

    return books.filter(book => {
      const status = statusMap.get(book.name)
      if (!status) return filterMode === 'unread'
      
      switch (filterMode) {
        case 'completed':
          return status.isComplete
        case 'in_progress':
          return status.completedChapters > 0 && !status.isComplete
        case 'unread':
          return status.completedChapters === 0
        default:
          return true
      }
    })
  }, [books, statusMap, filterMode])

  // Counts for filter badges
  const filterCounts = useMemo(() => {
    let completed = 0
    let inProgress = 0
    let unread = 0

    for (const book of books) {
      const status = statusMap.get(book.name)
      if (!status || status.completedChapters === 0) {
        unread++
      } else if (status.isComplete) {
        completed++
      } else {
        inProgress++
      }
    }

    return { all: books.length, completed, inProgress, unread }
  }, [books, statusMap])

  const isComplete = percentage >= 100

  return (
    <Card noPadding>
      {/* Header with overall progress */}
      <div className="bg-gradient-to-r from-sage-bg/60 to-transparent px-4 py-4 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <Trophy className="w-5 h-5 text-gold" />
            ) : (
              <BookOpen className="w-5 h-5 text-sage" />
            )}
            <h3 className="font-pixel text-[0.75rem] text-ink">
              {planName.toUpperCase()} PROGRESS
            </h3>
          </div>
          {isComplete && (
            <Badge variant="gold">COMPLETE</Badge>
          )}
        </div>

        {/* Main progress display */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="font-pixel text-2xl text-ink">{percentage}%</span>
            <span className="font-pixel text-[0.625rem] text-ink-muted">
              {totalCompleted.toLocaleString()} / {totalChapters.toLocaleString()} chapters
            </span>
          </div>
          <ProgressBar value={percentage} variant="success" size="lg" />
        </div>
      </div>

      {/* Testament breakdown */}
      <div className="px-4 py-3 bg-parchment-light/50 border-b border-border-subtle">
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(testamentStats).map(([testament, stats]) => {
            const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
            return (
              <div key={testament} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[0.625rem] text-ink-muted uppercase">
                    {getTestamentLabel(testament as 'OT' | 'NT' | 'Apocrypha')}
                  </span>
                  <span className="font-pixel text-[0.625rem] text-ink">
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-parchment border border-border-subtle overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sage to-sage-light transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-pixel text-[0.625rem] text-ink-muted">
                  {stats.completed}/{stats.total}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 py-2 border-b border-border-subtle flex items-center gap-2 overflow-x-auto">
        <Filter className="w-3 h-3 text-ink-muted flex-shrink-0" />
        <FilterButton 
          label="All" 
          count={filterCounts.all} 
          active={filterMode === 'all'} 
          onClick={() => setFilterMode('all')} 
        />
        <FilterButton 
          label="Complete" 
          count={filterCounts.completed} 
          active={filterMode === 'completed'} 
          onClick={() => setFilterMode('completed')} 
        />
        <FilterButton 
          label="In Progress" 
          count={filterCounts.inProgress} 
          active={filterMode === 'in_progress'} 
          onClick={() => setFilterMode('in_progress')} 
        />
        <FilterButton 
          label="Unread" 
          count={filterCounts.unread} 
          active={filterMode === 'unread'} 
          onClick={() => setFilterMode('unread')} 
        />
      </div>

      {/* Book grid */}
      <div className="p-4">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-2">
          {filteredBooks.map(book => {
            const status = statusMap.get(book.name)
            return (
              <BookTile 
                key={book.name} 
                book={book} 
                status={status} 
              />
            )
          })}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-8">
            <p className="font-pixel text-[0.625rem] text-ink-muted">
              No books match this filter
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

// Sub-components

interface FilterButtonProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function FilterButton({ label, count, active, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-2 py-1 font-pixel text-[0.625rem] whitespace-nowrap
        border transition-all
        ${active 
          ? 'bg-sage text-white border-sage-dark' 
          : 'bg-parchment-light text-ink-muted border-border-subtle hover:border-sage'
        }
      `}
    >
      {label} ({count})
    </button>
  )
}

interface BookTileProps {
  book: BibleBook
  status?: BookCompletionStatus
}

function BookTile({ book, status }: BookTileProps) {
  const completedPct = status 
    ? Math.round((status.completedChapters / status.totalChapters) * 100) 
    : 0
  
  const isComplete = status?.isComplete ?? false
  const hasProgress = (status?.completedChapters ?? 0) > 0

  // Abbreviate long book names
  const displayName = getBookAbbreviation(book.name)

  return (
    <div 
      className={`
        relative p-2 text-center border transition-all
        ${isComplete 
          ? 'bg-sage/20 border-sage' 
          : hasProgress 
            ? 'bg-parchment-light border-sage/50' 
            : 'bg-parchment border-border-subtle'
        }
      `}
      title={`${book.name}: ${status?.completedChapters ?? 0}/${book.chapters} chapters`}
    >
      {/* Progress fill */}
      {!isComplete && hasProgress && (
        <div 
          className="absolute bottom-0 left-0 right-0 bg-sage/20 transition-all"
          style={{ height: `${completedPct}%` }}
        />
      )}
      
      <div className="relative">
        <div className={`font-pixel text-[0.625rem] leading-tight ${
          isComplete ? 'text-sage-dark' : 'text-ink'
        }`}>
          {displayName}
        </div>
        <div className="font-pixel text-[0.375rem] text-ink-muted mt-0.5">
          {status?.completedChapters ?? 0}/{book.chapters}
        </div>
      </div>
    </div>
  )
}

/**
 * Get abbreviated book name for compact display
 */
function getBookAbbreviation(name: string): string {
  const abbreviations: Record<string, string> = {
    'Genesis': 'Gen',
    'Exodus': 'Exo',
    'Leviticus': 'Lev',
    'Numbers': 'Num',
    'Deuteronomy': 'Deut',
    'Joshua': 'Josh',
    'Judges': 'Judg',
    'Ruth': 'Ruth',
    '1 Samuel': '1Sam',
    '2 Samuel': '2Sam',
    '1 Kings': '1Kgs',
    '2 Kings': '2Kgs',
    '1 Chronicles': '1Chr',
    '2 Chronicles': '2Chr',
    'Ezra': 'Ezra',
    'Nehemiah': 'Neh',
    'Esther': 'Esth',
    'Job': 'Job',
    'Psalms': 'Psa',
    'Proverbs': 'Prov',
    'Ecclesiastes': 'Eccl',
    'Song of Solomon': 'Song',
    'Isaiah': 'Isa',
    'Jeremiah': 'Jer',
    'Lamentations': 'Lam',
    'Ezekiel': 'Ezek',
    'Daniel': 'Dan',
    'Hosea': 'Hos',
    'Joel': 'Joel',
    'Amos': 'Amos',
    'Obadiah': 'Obad',
    'Jonah': 'Jonah',
    'Micah': 'Mic',
    'Nahum': 'Nah',
    'Habakkuk': 'Hab',
    'Zephaniah': 'Zeph',
    'Haggai': 'Hag',
    'Zechariah': 'Zech',
    'Malachi': 'Mal',
    'Matthew': 'Matt',
    'Mark': 'Mark',
    'Luke': 'Luke',
    'John': 'John',
    'Acts': 'Acts',
    'Romans': 'Rom',
    '1 Corinthians': '1Cor',
    '2 Corinthians': '2Cor',
    'Galatians': 'Gal',
    'Ephesians': 'Eph',
    'Philippians': 'Phil',
    'Colossians': 'Col',
    '1 Thessalonians': '1Thes',
    '2 Thessalonians': '2Thes',
    '1 Timothy': '1Tim',
    '2 Timothy': '2Tim',
    'Titus': 'Titus',
    'Philemon': 'Phlm',
    'Hebrews': 'Heb',
    'James': 'Jas',
    '1 Peter': '1Pet',
    '2 Peter': '2Pet',
    '1 John': '1Jn',
    '2 John': '2Jn',
    '3 John': '3Jn',
    'Jude': 'Jude',
    'Revelation': 'Rev',
    // Apocrypha
    'Tobit': 'Tob',
    'Judith': 'Jdt',
    'Additions to Esther': 'AddEst',
    'Wisdom of Solomon': 'Wis',
    'Sirach': 'Sir',
    'Baruch': 'Bar',
    'Letter of Jeremiah': 'LJer',
    'Prayer of Azariah': 'PrAz',
    'Susanna': 'Sus',
    'Bel and the Dragon': 'Bel',
    '1 Maccabees': '1Mac',
    '2 Maccabees': '2Mac',
    '1 Esdras': '1Esd',
    'Prayer of Manasseh': 'PrMan',
    'Psalm 151': 'Ps151',
    '3 Maccabees': '3Mac',
    '2 Esdras': '2Esd',
    '4 Maccabees': '4Mac',
  }
  
  return abbreviations[name] || name.slice(0, 4)
}


