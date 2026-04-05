-- Completely disable RLS on users table
-- We're using Clerk for authentication, so RLS is not needed for security
-- The application layer handles authorization
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
