-- Biblical Battle Plans - Secure Guild Join (Security Fix)
-- Addresses RLS vulnerability where users could join any guild without invite code validation

-- ============================================
-- SECURE JOIN GUILD FUNCTION
-- ============================================

-- Create a secure function that validates invite code before allowing join
-- This replaces direct INSERT into guild_members for joining
CREATE OR REPLACE FUNCTION join_guild_by_invite_code(p_invite_code TEXT)
RETURNS TABLE (guild_id UUID, guild_name TEXT) AS $$
DECLARE
  v_guild_id UUID;
  v_guild_name TEXT;
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find guild by invite code (case-insensitive)
  SELECT id, name INTO v_guild_id, v_guild_name
  FROM guilds
  WHERE invite_code = UPPER(p_invite_code)
    AND is_active = true;

  IF v_guild_id IS NULL THEN
    RAISE EXCEPTION 'Guild not found. Please check the invite code.';
  END IF;

  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM guild_members
    WHERE guild_members.guild_id = v_guild_id
      AND guild_members.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You are already a member of this guild.';
  END IF;

  -- Insert the member (bypasses RLS with SECURITY DEFINER)
  INSERT INTO guild_members (guild_id, user_id, role)
  VALUES (v_guild_id, v_user_id, 'member');

  -- Return the guild info
  RETURN QUERY SELECT v_guild_id, v_guild_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RESTRICT DIRECT INSERT POLICY
-- ============================================

-- Drop the permissive policy
DROP POLICY IF EXISTS "Users can join guilds" ON guild_members;

-- Create a more restrictive policy that only allows:
-- 1. System triggers (SECURITY DEFINER functions like add_creator_as_admin)
-- 2. The join_guild_by_invite_code function
--
-- By setting WITH CHECK (false), direct inserts are blocked.
-- The SECURITY DEFINER functions bypass RLS, so they still work.
CREATE POLICY "No direct member inserts"
  ON guild_members FOR INSERT
  WITH CHECK (false);

-- ============================================
-- SECURE GUILD PREVIEW FUNCTION
-- ============================================

-- Return limited guild info for preview before joining (no invite_code exposed)
CREATE OR REPLACE FUNCTION get_guild_by_invite_code(p_invite_code TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  member_count INTEGER,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    g.id,
    g.name,
    g.description,
    g.member_count,
    g.is_public,
    g.created_at
  FROM guilds g
  WHERE g.invite_code = UPPER(p_invite_code)
    AND g.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RESTRICT GUILD SELECT POLICY
-- ============================================

-- Drop the overly permissive policy from 015_guild_activities.sql
DROP POLICY IF EXISTS "Authenticated users can view guilds" ON guilds;

-- Restore proper SELECT policy: only view public guilds or guilds you're a member of
-- The secure RPC functions (join_guild_by_invite_code, get_guild_by_invite_code)
-- use SECURITY DEFINER to bypass this restriction when validating invite codes
CREATE POLICY "View public or member guilds"
  ON guilds FOR SELECT
  USING (
    is_public = true
    OR is_guild_member(id, auth.uid())
    OR created_by = auth.uid()
  );

-- ============================================
-- DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION join_guild_by_invite_code IS 'Securely join a guild by validating the invite code. Returns guild_id and guild_name on success.';
COMMENT ON FUNCTION get_guild_by_invite_code IS 'Get limited guild info for preview before joining. Does not expose invite_code.';
