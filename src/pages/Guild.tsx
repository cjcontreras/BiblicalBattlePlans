import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Users, Settings, UserPlus, LogOut, Crown, Trash2 } from 'lucide-react'
import { Card, CardContent, Button, Badge, LoadingSpinner } from '../components/ui'
import {
  GuildMemberList,
  InviteShareModal,
  GuildSettingsModal,
  GuildTabs,
  GuildLeaderboard,
  GuildActivityFeed,
} from '../components/guilds'
import type { GuildTab } from '../components/guilds'
import { useGuild, useMyGuildMembership, useLeaveGuild, useDeleteGuild } from '../hooks/useGuilds'
import type { Profile } from '../types'

export function Guild() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: guild, isLoading, error } = useGuild(id || '')
  const membership = useMyGuildMembership(id || '')
  const leaveGuild = useLeaveGuild()
  const deleteGuild = useDeleteGuild()

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [activeTab, setActiveTab] = useState<GuildTab>('members')

  const isAdmin = membership?.role === 'admin'
  const isOnlyMember = guild?.members.length === 1

  const handleLeave = async () => {
    if (!id) return

    const message = isAdmin && guild && guild.members.length > 1
      ? 'You are an admin. Are you sure you want to leave this guild?'
      : 'Are you sure you want to leave this guild?'

    if (!confirm(message)) return

    try {
      await leaveGuild.mutateAsync(id)
      navigate('/guild')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to leave guild')
    }
  }

  const handleDelete = async () => {
    if (!id || !guild) return

    if (!confirm(`Are you sure you want to delete "${guild.name}"? This cannot be undone.`)) return

    try {
      await deleteGuild.mutateAsync(id)
      navigate('/guild')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete guild')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !guild) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="font-pixel text-[0.625rem] text-danger">
            {error?.message || 'Guild not found'}
          </p>
          <Link
            to="/guild"
            className="inline-flex items-center gap-2 mt-4 font-pixel text-[0.625rem] text-sage hover:text-sage-dark"
          >
            <ChevronLeft className="w-4 h-4" />
            BACK TO GUILDS
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/guild"
        className="inline-flex items-center gap-2 font-pixel text-[0.625rem] text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="w-4 h-4" />
        ALL GUILDS
      </Link>

      {/* Guild Header */}
      <Card variant="elevated">
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              {/* Name + Badges */}
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-pixel text-base text-ink">
                  {guild.name.toUpperCase()}
                </h1>
                {isAdmin && (
                  <Badge variant="gold">
                    <Crown className="w-3 h-3 mr-1" />
                    ADMIN
                  </Badge>
                )}
              </div>

              {/* Description */}
              {guild.description && (
                <p className="font-pixel text-[0.625rem] text-ink-muted mb-4">
                  {guild.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-2 text-ink-muted">
                <Users className="w-4 h-4" />
                <span className="font-pixel text-[0.625rem]">
                  {guild.member_count} {guild.member_count === 1 ? 'MEMBER' : 'MEMBERS'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserPlus className="w-4 h-4" />}
                onClick={() => setShowInviteModal(true)}
              >
                INVITE
              </Button>
              {isAdmin && (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Settings className="w-4 h-4" />}
                  onClick={() => setShowSettingsModal(true)}
                >
                  SETTINGS
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content Section */}
      <div className="sage-panel">
        <GuildTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="p-4">
          {activeTab === 'members' && (
            <GuildMemberList
              members={guild.members as (typeof guild.members[number] & { profile: Profile })[]}
              guildId={guild.id}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'leaderboard' && (
            <GuildLeaderboard
              guildId={guild.id}
              members={guild.members as (typeof guild.members[number] & { profile: Profile })[]}
            />
          )}

          {activeTab === 'activity' && (
            <GuildActivityFeed
              guildId={guild.id}
              members={guild.members as (typeof guild.members[number] & { profile: Profile })[]}
            />
          )}
        </div>
      </div>

      {/* Leave or Delete Guild */}
      <div className="text-center pt-4">
        {isOnlyMember ? (
          <button
            onClick={handleDelete}
            disabled={deleteGuild.isPending}
            className="inline-flex items-center gap-2 font-pixel text-[0.625rem] text-danger hover:underline disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            DELETE GUILD
          </button>
        ) : (
          <button
            onClick={handleLeave}
            disabled={leaveGuild.isPending}
            className="inline-flex items-center gap-2 font-pixel text-[0.625rem] text-danger hover:underline disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            LEAVE GUILD
          </button>
        )}
      </div>

      {/* Modals */}
      <InviteShareModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        guildId={guild.id}
        guildName={guild.name}
        inviteCode={guild.invite_code}
        isAdmin={isAdmin}
      />

      {isAdmin && (
        <GuildSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          guild={guild}
        />
      )}
    </div>
  )
}
