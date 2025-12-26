import { useState } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import { Card, CardHeader, CardContent, Button, Input } from '../ui'

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-pixel text-terminal-green">
            LOG READING
          </h3>
          <div className="flex items-center gap-2 text-terminal-gray-400">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-mono">
              {chaptersReadToday} today
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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
            <label className="block mb-1.5 text-sm font-medium text-terminal-gray-200">
              {"> Notes (optional)"}
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
                bg-terminal-dark
                border-2 border-terminal-gray-500
                text-terminal-gray-100
                placeholder:text-terminal-gray-400
                font-mono text-sm
                px-3 py-2
                focus:outline-none focus:border-terminal-green
                focus:shadow-[0_0_5px_var(--color-terminal-green)]
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

        <p className="text-xs text-terminal-gray-400 text-center">
          Press Enter to submit
        </p>
      </CardContent>
    </Card>
  )
}
