-- Run this in the Supabase SQL editor to enable the full user list in Admin > Access

-- Returns ALL signed-up users with Google name/avatar + their role
CREATE OR REPLACE FUNCTION get_all_users_with_meta()
RETURNS TABLE(
  id         uuid,
  email      text,
  full_name  text,
  avatar_url text,
  role       text,
  created_at timestamptz
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT
    au.id,
    au.email,
    COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      split_part(au.email, '@', 1)
    ) AS full_name,
    au.raw_user_meta_data->>'avatar_url' AS avatar_url,
    COALESCE(p.role, 'user') AS role,
    au.created_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  ORDER BY au.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION get_all_users_with_meta() TO authenticated;
