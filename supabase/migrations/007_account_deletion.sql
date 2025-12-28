-- Account Deletion Function (GDPR Compliance)
-- This function allows users to delete their own account and all associated data.
-- The CASCADE constraints handle deleting related records automatically.

-- Create a function that deletes the current user's account
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();

  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete from auth.users - this will cascade to profiles, user_plans, daily_progress, etc.
  DELETE FROM auth.users WHERE id = current_user_id;

  -- If we reach here, deletion was successful
  -- Note: The user's session will become invalid after this
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- Add a comment for documentation
COMMENT ON FUNCTION delete_user_account() IS 'Allows authenticated users to permanently delete their own account and all associated data. This action cannot be undone.';
