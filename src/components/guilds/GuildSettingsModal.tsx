import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen } from 'lucide-react'
import { Modal, Input, Button } from '../ui'
import { useUpdateGuild, useSetGuildRecommendedPlan } from '../../hooks/useGuilds'
import { getSupabase } from '../../lib/supabase'
import type { GuildWithMembers, ReadingPlan } from '../../types'

interface GuildSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  guild: GuildWithMembers
}

export function GuildSettingsModal({ isOpen, onClose, guild }: GuildSettingsModalProps) {
  const updateGuild = useUpdateGuild()
  const setRecommendedPlan = useSetGuildRecommendedPlan()

  const [name, setName] = useState(guild.name)
  const [description, setDescription] = useState(guild.description || '')
  const [selectedPlanId, setSelectedPlanId] = useState<string>(guild.recommended_plan_id || '')
  const [error, setError] = useState('')

  // Fetch available reading plans
  const { data: availablePlans } = useQuery({
    queryKey: ['readingPlans', 'active'],
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from('reading_plans')
        .select('id, name, description, duration_days')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data as Pick<ReadingPlan, 'id' | 'name' | 'description' | 'duration_days'>[]
    },
    enabled: isOpen,
  })

  // Reset form when guild changes
  useEffect(() => {
    setName(guild.name)
    setDescription(guild.description || '')
    setSelectedPlanId(guild.recommended_plan_id || '')
    setError('')
  }, [guild, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Guild name is required')
      return
    }

    if (name.trim().length < 3) {
      setError('Guild name must be at least 3 characters')
      return
    }

    try {
      // Update guild info if changed
      if (name !== guild.name || description !== (guild.description || '')) {
        await updateGuild.mutateAsync({
          guildId: guild.id,
          name: name.trim(),
          description: description.trim() || undefined,
        })
      }

      // Update recommended plan if changed
      const currentPlanId = guild.recommended_plan_id || ''
      if (selectedPlanId !== currentPlanId) {
        await setRecommendedPlan.mutateAsync({
          guildId: guild.id,
          planId: selectedPlanId || null,
        })
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update guild')
    }
  }

  const handleClose = () => {
    setName(guild.name)
    setDescription(guild.description || '')
    setSelectedPlanId(guild.recommended_plan_id || '')
    setError('')
    onClose()
  }

  const hasChanges =
    name !== guild.name ||
    description !== (guild.description || '') ||
    selectedPlanId !== (guild.recommended_plan_id || '')

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="GUILD SETTINGS" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <Input
          label="Guild Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning Warriors"
          maxLength={50}
        />

        {/* Description */}
        <div>
          <label className="block mb-1.5 text-[0.625rem] font-pixel text-ink-muted uppercase tracking-wide">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's your guild about?"
            maxLength={200}
            rows={3}
            className="w-full bg-parchment-light border-2 border-border-subtle text-ink placeholder:text-ink-faint font-pixel text-[0.75rem] px-3 py-2.5 focus:outline-none focus:border-sage resize-none"
          />
        </div>

        {/* Recommended Plan */}
        <div>
          <label className="block mb-1.5 text-[0.625rem] font-pixel text-ink-muted uppercase tracking-wide">
            <BookOpen className="w-3 h-3 inline mr-1" />
            Recommended Quest (Optional)
          </label>
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="w-full bg-parchment-light border-2 border-border-subtle text-ink font-pixel text-[0.75rem] px-3 py-2.5 focus:outline-none focus:border-sage"
          >
            <option value="">No recommendation</option>
            {availablePlans?.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} ({plan.duration_days} days)
              </option>
            ))}
          </select>
          <p className="font-pixel text-[0.5rem] text-ink-muted mt-1">
            Recommend a reading plan for your guild members to follow together
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="font-pixel text-[0.625rem] text-danger">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={updateGuild.isPending || setRecommendedPlan.isPending}
            disabled={!hasChanges}
            className="flex-1"
          >
            SAVE
          </Button>
        </div>
      </form>
    </Modal>
  )
}
