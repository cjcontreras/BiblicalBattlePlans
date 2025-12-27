import { useState } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import { Card, Button, Input } from '../ui'

interface FreeReadingInputProps {
  onSubmit: (chapters: number, notes?: string) => void
  isLoading?: boolean
  chaptersReadToday: number
}

export function FreeReadingInput({
  onSubmit,
  isLoading = false,
  chaptersReadToday
}: FreeReadingInputProps) {
  const [chapters, setChapters] = useState<string>('1')
  const [notes, setNotes] = useState<string>('')

  const handleSubmit = () => {
    const chapterCount = parseInt(chapters, 10)
    if (chapterCount > 0) {
      onSubmit(chapterCount, notes.trim() || undefined)
      // Reset form
      setChapters('1')
      setNotes('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Card noPadding>
      <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <h3 className="font-pixel text-[0.625rem] text-ink">
            LOG READING
          </h3>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-ink-muted" />
            <span className="font-pixel text-[0.5rem] text-ink">
              {chaptersReadToday} today
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Input
            type="number"
            label="Chapters Read"
            value={chapters}
            onChange={(e) => setChapters(e.target.value)}
            min="1"
            placeholder="1"
            disabled={isLoading}
            onKeyDown={handleKeyDown}
          />

          <div className="w-full">
            <label className="block mb-1.5 font-pixel text-[0.625rem] text-ink-muted uppercase tracking-wide">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Psalms 1-3, John 5"
              rows={2}
              disabled={isLoading}
              onKeyDown={handleKeyDown}
              className="
                w-full
                bg-parchment-light
                border-2 border-border-subtle
                text-ink
                placeholder:text-ink-faint
                font-pixel text-[0.75rem]
                px-3 py-2.5
                focus:outline-none focus:border-gold
                focus:shadow-[0_0_0_3px_rgba(200,160,96,0.2)]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150
                resize-none
              "
            />
          </div>
        </div>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isLoading || parseInt(chapters) <= 0}
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>LOG CHAPTERS</span>
        </Button>

        <p className="font-pixel text-[0.5rem] text-ink-muted text-center">
          Press Enter to submit
        </p>
      </div>
    </Card>
  )
}
