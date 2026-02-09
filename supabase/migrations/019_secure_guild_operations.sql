-- Secure guild operations with atomic checks
-- Addresses race conditions in leave, delete, and demote operations

-- ============================================
-- SECURE LEAVE GUILD
-- ============================================

CREATE OR REPLACE FUNCTION leave_guild(p_guild_id UUID)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_is_admin BOOLEAN;
  v_admin_count INTEGER;
  v_member_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock the guild_members rows for this guild to prevent race conditions
  -- FOR UPDATE cannot be used with aggregates, so we lock first, then aggregate
  PERFORM 1 FROM guild_members WHERE guild_id = p_guild_id FOR UPDATE;

  -- Now compute aggregates (rows are locked)
  SELECT
    COUNT(*) FILTER (WHERE role = 'admin'),
    COUNT(*),
    bool_or(user_id = v_user_id AND role = 'admin')
  INTO v_admin_count, v_member_count, v_is_admin
  FROM guild_members
  WHERE guild_id = p_guild_id;

  -- Check if user is a member
  IF NOT EXISTS (SELECT 1 FROM guild_members WHERE guild_id = p_guild_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'You are not a member of this guild';
  END IF;

  -- If only member, must delete instead
  IF v_member_count = 1 THEN
    RAISE EXCEPTION 'You are the only member. Delete the guild instead of leaving.';
  END IF;

  -- If last admin with other members, block
  IF v_is_admin AND v_admin_count = 1 THEN
    RAISE EXCEPTION 'You must promote another member to admin before leaving.';
  END IF;

  -- Safe to leave
  DELETE FROM guild_members
  WHERE guild_id = p_guild_id AND user_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SECURE DELETE GUILD
-- ============================================

CREATE OR REPLACE FUNCTION delete_guild(p_guild_id UUID)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_is_admin BOOLEAN;
  v_member_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock rows first to prevent race conditions
  -- FOR UPDATE cannot be used with aggregates, so we lock first, then aggregate
  PERFORM 1 FROM guild_members WHERE guild_id = p_guild_id FOR UPDATE;

  -- Now compute aggregates (rows are locked)
  SELECT
    COUNT(*),
    bool_or(user_id = v_user_id AND role = 'admin')
  INTO v_member_count, v_is_admin
  FROM guild_members
  WHERE guild_id = p_guild_id;

  -- Must be admin
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can delete guilds.';
  END IF;

  -- Must be only member
  IF v_member_count > 1 THEN
    RAISE EXCEPTION 'Remove all other members before deleting the guild.';
  END IF;

  -- Safe to delete (cascades to guild_members)
  DELETE FROM guilds WHERE id = p_guild_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SECURE DEMOTE MEMBER
-- ============================================

CREATE OR REPLACE FUNCTION demote_guild_member(p_guild_id UUID, p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_caller_id UUID;
  v_admin_count INTEGER;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify caller is admin
  IF NOT is_guild_admin(p_guild_id, v_caller_id) THEN
    RAISE EXCEPTION 'Only admins can demote members.';
  END IF;

  -- Lock rows first to prevent race conditions
  -- FOR UPDATE cannot be used with aggregates, so we lock first, then count
  PERFORM 1 FROM guild_members WHERE guild_id = p_guild_id AND role = 'admin' FOR UPDATE;

  -- Now count admins (rows are locked)
  SELECT COUNT(*)
  INTO v_admin_count
  FROM guild_members
  WHERE guild_id = p_guild_id AND role = 'admin';

  -- Cannot demote last admin
  IF v_admin_count <= 1 THEN
    RAISE EXCEPTION 'Cannot demote the last admin.';
  END IF;

  -- Safe to demote
  UPDATE guild_members
  SET role = 'member'
  WHERE guild_id = p_guild_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION leave_guild(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_guild(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION demote_guild_member(UUID, UUID) TO authenticated;
