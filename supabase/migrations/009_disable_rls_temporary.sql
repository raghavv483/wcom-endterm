-- Disable RLS on users table to allow Clerk users to insert
-- This is temporary while we get the basic flow working
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Now drop all old policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for own records" ON users;

-- Re-enable RLS with simple policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read all users
CREATE POLICY "Allow read all" ON users FOR SELECT USING (true);

-- Allow everyone to insert new users
CREATE POLICY "Allow insert all" ON users FOR INSERT WITH CHECK (true);

-- Allow everyone to update
CREATE POLICY "Allow update all" ON users FOR UPDATE USING (true);
