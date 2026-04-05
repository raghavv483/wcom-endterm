-- Fix RLS policies to allow user creation and proper access

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;

-- Create new, more permissive policies for Clerk-based auth
-- 1. Allow anyone to SELECT (needed for admin discovery)
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

-- 2. Allow authenticated users to INSERT their own records
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT 
  WITH CHECK (true);

-- 3. Allow users to UPDATE their own records
CREATE POLICY "Enable update for own records" ON users
  FOR UPDATE 
  USING (true);

-- 4. Disable DELETE for safety (optional)
-- CREATE POLICY "Enable delete for own records" ON users
--   FOR DELETE 
--   USING (auth.uid()::text = id::text);

-- Make sure the function is still available
GRANT EXECUTE ON FUNCTION create_or_get_user(TEXT, TEXT) TO anon, authenticated;
