-- Create a database function to handle user creation (bypasses RLS with service role)
CREATE OR REPLACE FUNCTION create_or_get_user(
  p_email TEXT,
  p_username TEXT
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  username TEXT,
  role TEXT
) AS $$
BEGIN
  -- Try to insert new user
  INSERT INTO public.users (email, username, password_hash, role)
  VALUES (p_email, p_username, 'clerk_auth', 'user')
  ON CONFLICT (email) DO NOTHING;
  
  -- Return the user (either newly created or existing)
  RETURN QUERY
  SELECT 
    users.id,
    users.email,
    users.username,
    users.role
  FROM public.users
  WHERE users.email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke execute from public, grant to authenticated users
REVOKE EXECUTE ON FUNCTION create_or_get_user(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_or_get_user(TEXT, TEXT) TO authenticated;
