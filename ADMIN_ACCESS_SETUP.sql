-- Run this in your Supabase Dashboard → SQL Editor
-- Required for the Admin Access page to work correctly

-- 1. Grant role by email
--    Looks up auth.users directly (bypasses profiles gap),
--    then upserts profile row with the requested role.
CREATE OR REPLACE FUNCTION public.grant_role_by_email(p_email text, p_role text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = lower(trim(p_email));

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No account found with that email. The user must sign up first.');
  END IF;

  INSERT INTO public.profiles (id, email, role)
  VALUES (v_user_id, lower(trim(p_email)), p_role)
  ON CONFLICT (id) DO UPDATE
    SET role  = p_role,
        email = lower(trim(p_email));

  RETURN json_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_role_by_email(text, text) TO authenticated;

-- 2. Get all admin/core profiles with their auth email
--    Returns id, email (from auth.users), role — avoids null-email issues in profiles.
CREATE OR REPLACE FUNCTION public.get_roles_with_emails()
RETURNS TABLE (id uuid, email text, role text)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, u.email, p.role
  FROM   public.profiles p
  JOIN   auth.users      u ON u.id = p.id
  WHERE p.role IN ('admin', 'coordinator')
  ORDER  BY p.role, u.email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_roles_with_emails() TO authenticated;

-- 3. Revoke role by user ID (sets role back to 'member')
--    SECURITY DEFINER bypasses RLS so the admin can update any profile.
CREATE OR REPLACE FUNCTION public.revoke_role_by_id(p_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles SET role = 'member' WHERE id = p_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Profile not found.');
  END IF;
  RETURN json_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.revoke_role_by_id(uuid) TO authenticated;
