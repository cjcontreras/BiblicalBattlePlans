import { useQuery } from '@tanstack/react-query'
import { getSupabase, safeQuery } from '../lib/supabase'
import { useAuth } from './useAuth'

interface HeatmapDay {
  reading_date: string
  chapter_count: number
}

export interface HeatmapData {
  days: Record<string, number>
  maxChapters: number
  startDate: string
  endDate: string
}

export function useReadingHeatmap() {
  const { user, isInitialized } = useAuth()

  return useQuery({
    queryKey: ['heatmap', user?.id],
    queryFn: async (): Promise<HeatmapData> => {
      if (!user) throw new Error('Not authenticated')

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 90)

      const startStr = startDate.toLocaleDateString('en-CA')
      const endStr = endDate.toLocaleDateString('en-CA')

      const { data, error } = await safeQuery<{ data: HeatmapDay[] | null; error: { message: string } | null }>(() =>
        (getSupabase().rpc as Function)('get_reading_heatmap', {
          p_user_id: user.id,
          p_start_date: startStr,
          p_end_date: endStr,
        })
      )

      if (error) throw error

      const days: Record<string, number> = {}
      let maxChapters = 0

      if (data && Array.isArray(data)) {
        for (const row of data) {
          days[row.reading_date] = row.chapter_count
          if (row.chapter_count > maxChapters) {
            maxChapters = row.chapter_count
          }
        }
      }

      return { days, maxChapters, startDate: startStr, endDate: endStr }
    },
    enabled: !!user && isInitialized,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
