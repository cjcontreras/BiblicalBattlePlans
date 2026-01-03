import { useState, useCallback, useMemo } from 'react'
import { ChevronDown, ChevronRight, Check, Minus, Book } from 'lucide-react'
import { 
  type BibleBook,
  getTestamentLabel,
  getBooksByTestament,
} from '../../lib/bibleData'
import type { FreeReadingChapter, BookCompletionStatus } from '../../types'
import { isChapterCompleted } from '../../hooks/useFreeReadingChapters'
import { Card } from '../ui'

interface BibleChapterPickerProps {
  books: BibleBook[]
  completedChapters: FreeReadingChapter[]
  bookStatus: BookCompletionStatus[]
  onToggleChapter: (book: string, chapter: number, isCompleted: boolean) => void
  onToggleBook: (book: string, totalChapters: number, completedChapters: number[]) => void
  disabled?: boolean
}

export function BibleChapterPicker({
  books,
  completedChapters,
  bookStatus,
  onToggleChapter,
  onToggleBook,
  disabled = false,
}: BibleChapterPickerProps) {
  // Track which testaments and books are expanded (all collapsed by default)
  const [expandedTestaments, setExpandedTestaments] = useState<Set<string>>(new Set())
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set())

  // Group books by testament
  const booksByTestament = useMemo(() => getBooksByTestament(books), [books])

  // Get status map for quick lookup
  const statusMap = useMemo(() => {
    const map = new Map<string, BookCompletionStatus>()
    for (const status of bookStatus) {
      map.set(status.book, status)
    }
    return map
  }, [bookStatus])

  const toggleTestament = useCallback((testament: string) => {
    setExpandedTestaments(prev => {
      const next = new Set(prev)
      if (next.has(testament)) {
        next.delete(testament)
      } else {
        next.add(testament)
      }
      return next
    })
  }, [])

  const toggleBookExpansion = useCallback((bookName: string) => {
    setExpandedBooks(prev => {
      const next = new Set(prev)
      if (next.has(bookName)) {
        next.delete(bookName)
      } else {
        next.add(bookName)
      }
      return next
    })
  }, [])

  const handleBookCheckbox = useCallback((book: BibleBook, status: BookCompletionStatus) => {
    if (disabled) return
    onToggleBook(book.name, book.chapters, status.completedChapterNumbers)
  }, [disabled, onToggleBook])

  const handleChapterCheckbox = useCallback((bookName: string, chapter: number) => {
    if (disabled) return
    const isCompleted = isChapterCompleted(completedChapters, bookName, chapter)
    onToggleChapter(bookName, chapter, isCompleted)
  }, [disabled, completedChapters, onToggleChapter])

  // Determine checkbox state for a book
  const getBookCheckboxState = (status: BookCompletionStatus): 'checked' | 'indeterminate' | 'unchecked' => {
    if (status.isComplete) return 'checked'
    if (status.completedChapters > 0) return 'indeterminate'
    return 'unchecked'
  }

  return (
    <Card noPadding>
      <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Book className="w-4 h-4 text-ink-muted" />
          <h3 className="font-pixel text-[0.75rem] text-ink">
            SELECT CHAPTERS
          </h3>
        </div>
        <p className="font-pixel text-[0.625rem] text-ink-muted mt-1">
          Check off chapters as you read. Click a book name to expand.
        </p>
      </div>

      <div className="divide-y divide-border-subtle">
        {Object.entries(booksByTestament).map(([testament, testamentBooks]) => (
          <div key={testament}>
            {/* Testament Header */}
            <button
              onClick={() => toggleTestament(testament)}
              className="w-full flex items-center justify-between px-4 py-3 bg-parchment-light hover:bg-parchment-lightest transition-colors"
              disabled={disabled}
            >
              <div className="flex items-center gap-2">
                {expandedTestaments.has(testament) ? (
                  <ChevronDown className="w-4 h-4 text-ink-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-ink-muted" />
                )}
                <span className="font-pixel text-[0.625rem] text-ink uppercase">
                  {getTestamentLabel(testament as 'OT' | 'NT' | 'Apocrypha')}
                </span>
              </div>
              <TestamentProgress books={testamentBooks} statusMap={statusMap} />
            </button>

            {/* Books in Testament */}
            {expandedTestaments.has(testament) && (
              <div className="divide-y divide-border-subtle/50">
                {testamentBooks.map(book => {
                  const status = statusMap.get(book.name) || {
                    book: book.name,
                    totalChapters: book.chapters,
                    completedChapters: 0,
                    completedChapterNumbers: [],
                    isComplete: false,
                  }
                  const isExpanded = expandedBooks.has(book.name)
                  const checkboxState = getBookCheckboxState(status)

                  return (
                    <div key={book.name}>
                      {/* Book Row */}
                      <div className="flex items-center px-4 py-2 bg-parchment hover:bg-parchment-light/50 transition-colors">
                        {/* Book Checkbox */}
                        <button
                          onClick={() => handleBookCheckbox(book, status)}
                          disabled={disabled}
                          className="mr-3 flex-shrink-0"
                          aria-label={`Toggle all chapters in ${book.name}`}
                        >
                          <BookCheckbox state={checkboxState} disabled={disabled} />
                        </button>

                        {/* Book Name & Expand Toggle */}
                        <button
                          onClick={() => toggleBookExpansion(book.name)}
                          disabled={disabled}
                          className="flex-1 flex items-center justify-between min-w-0"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isExpanded ? (
                              <ChevronDown className="w-3 h-3 text-ink-muted flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-ink-muted flex-shrink-0" />
                            )}
                            <span className={`font-pixel text-[0.625rem] truncate ${
                              status.isComplete ? 'text-ink-muted line-through' : 'text-ink'
                            }`}>
                              {book.name}
                            </span>
                          </div>
                          <span className="font-pixel text-[0.625rem] text-ink-muted ml-2 flex-shrink-0">
                            {status.completedChapters}/{book.chapters}
                          </span>
                        </button>
                      </div>

                      {/* Chapter Grid */}
                      {isExpanded && (
                        <ChapterGrid
                          bookName={book.name}
                          totalChapters={book.chapters}
                          completedChapters={completedChapters}
                          onToggle={handleChapterCheckbox}
                          disabled={disabled}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

// Sub-components

interface BookCheckboxProps {
  state: 'checked' | 'indeterminate' | 'unchecked'
  disabled?: boolean
}

function BookCheckbox({ state, disabled }: BookCheckboxProps) {
  const baseClasses = "w-5 h-5 border-2 flex items-center justify-center transition-all"
  
  if (state === 'checked') {
    return (
      <div className={`${baseClasses} border-sage-dark bg-sage ${disabled ? 'opacity-50' : ''}`}>
        <Check className="w-3 h-3 text-white" />
      </div>
    )
  }
  
  if (state === 'indeterminate') {
    return (
      <div className={`${baseClasses} border-sage bg-sage/30 ${disabled ? 'opacity-50' : ''}`}>
        <Minus className="w-3 h-3 text-sage-dark" />
      </div>
    )
  }
  
  return (
    <div className={`${baseClasses} border-border bg-parchment-lightest ${disabled ? 'opacity-50' : ''}`} />
  )
}

interface ChapterGridProps {
  bookName: string
  totalChapters: number
  completedChapters: FreeReadingChapter[]
  onToggle: (bookName: string, chapter: number) => void
  disabled?: boolean
}

function ChapterGrid({ bookName, totalChapters, completedChapters, onToggle, disabled }: ChapterGridProps) {
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1)

  return (
    <div className="px-4 py-3 bg-parchment-light/50">
      <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 gap-1">
        {chapters.map(chapter => {
          const isCompleted = isChapterCompleted(completedChapters, bookName, chapter)
          return (
            <button
              key={chapter}
              onClick={() => onToggle(bookName, chapter)}
              disabled={disabled}
              className={`
                w-7 h-7 flex items-center justify-center
                font-pixel text-[0.625rem]
                border transition-all
                ${isCompleted 
                  ? 'bg-sage border-sage-dark text-white' 
                  : 'bg-parchment-lightest border-border-subtle text-ink hover:border-sage hover:bg-sage/10'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              aria-label={`${bookName} chapter ${chapter}${isCompleted ? ' (completed)' : ''}`}
            >
              {chapter}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface TestamentProgressProps {
  books: BibleBook[]
  statusMap: Map<string, BookCompletionStatus>
}

function TestamentProgress({ books, statusMap }: TestamentProgressProps) {
  const stats = useMemo(() => {
    let completed = 0
    let total = 0
    for (const book of books) {
      total += book.chapters
      const status = statusMap.get(book.name)
      if (status) {
        completed += status.completedChapters
      }
    }
    return { completed, total }
  }, [books, statusMap])

  const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-parchment border border-border-subtle overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-sage to-sage-light transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="font-pixel text-[0.625rem] text-ink-muted w-8 text-right">
        {percentage}%
      </span>
    </div>
  )
}


