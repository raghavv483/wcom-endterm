-- Properly disable RLS by dropping all policies first, then disabling RLS

-- Drop ALL policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for own records" ON users;
DROP POLICY IF EXISTS "Allow read all" ON users;
DROP POLICY IF EXISTS "Allow insert all" ON users;
DROP POLICY IF EXISTS "Allow update all" ON users;

-- Drop ALL policies on quiz tables
DROP POLICY IF EXISTS "quizzes_select_policy" ON quizzes;
DROP POLICY IF EXISTS "quizzes_insert_policy" ON quizzes;
DROP POLICY IF EXISTS "quizzes_update_policy" ON quizzes;
DROP POLICY IF EXISTS "quiz_questions_select" ON quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_insert" ON quiz_questions;
DROP POLICY IF EXISTS "quiz_attempts_select" ON quiz_attempts;
DROP POLICY IF EXISTS "quiz_attempts_insert" ON quiz_attempts;
DROP POLICY IF EXISTS "follows_read" ON follows;
DROP POLICY IF EXISTS "follows_create" ON follows;
DROP POLICY IF EXISTS "follows_delete" ON follows;

-- Now disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE follows DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
