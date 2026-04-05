-- Fix RLS to allow both anonymous and authenticated users to create records
-- Since we're using Clerk for authentication, not Supabase Auth

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable update for own records" ON users;

-- Allow anyone (anonymous or authenticated) to read users
CREATE POLICY "users_select_policy" ON users
  FOR SELECT USING (true);

-- Allow anonymous users to insert (Clerk users appear as anonymous to Supabase)
CREATE POLICY "users_insert_policy" ON users
  FOR INSERT 
  WITH CHECK (true);

-- Allow updates (relaxed for now, can tighten later)
CREATE POLICY "users_update_policy" ON users
  FOR UPDATE 
  USING (true);
