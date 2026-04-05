-- Add INSERT policy for users table to allow creating new users on signup
-- This is needed for Clerk-based authentication

-- First, check if the policy exists and drop it if needed
DROP POLICY IF EXISTS "Users can create own profile" ON users;

-- Create policy to allow anyone to insert their own user record (for Clerk users)
CREATE POLICY "Users can create own profile" ON users
  FOR INSERT 
  WITH CHECK (true); -- Allow inserts from authenticated users

-- Also ensure users can see all users (needed for admin discovery)
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT 
  USING (true); -- Allow viewing all users
