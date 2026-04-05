-- Create users table if it doesn't exist (for standalone migration)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  role TEXT DEFAULT 'user'
);

-- Add role column to users table (if table already exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_index INT NOT NULL CHECK (correct_index >= 0 AND correct_index < 4),
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INT,
  total_questions INT,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_id, user_id) -- one attempt per user per quiz
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id) -- cannot follow yourself
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quizzes_admin_id ON quizzes(admin_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Row-Level Security Policies

-- Enable RLS on all tables
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Quizzes: Only admins can insert, anyone can read
CREATE POLICY "Only admins can create quizzes" ON quizzes
  FOR INSERT WITH CHECK (
    auth.uid()::uuid = admin_id AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
  );

CREATE POLICY "Anyone can read quizzes" ON quizzes
  FOR SELECT USING (true);

CREATE POLICY "Admins can update own quizzes" ON quizzes
  FOR UPDATE USING (auth.uid()::uuid = admin_id)
  WITH CHECK (auth.uid()::uuid = admin_id);

CREATE POLICY "Admins can delete own quizzes" ON quizzes
  FOR DELETE USING (auth.uid()::uuid = admin_id);

-- Quiz Questions: Anyone can read, admins can insert their own
CREATE POLICY "Anyone can read quiz questions" ON quiz_questions
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert questions for their quizzes" ON quiz_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE id = quiz_id AND admin_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Admins can update their quiz questions" ON quiz_questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE id = quiz_id AND admin_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Admins can delete their quiz questions" ON quiz_questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE id = quiz_id AND admin_id = auth.uid()::uuid
    )
  );

-- Quiz Attempts: Users can insert/update their own, users can read their own
CREATE POLICY "Users can insert their own attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can read their own attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update their own attempts" ON quiz_attempts
  FOR UPDATE USING (auth.uid()::uuid = user_id)
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Admins can read attempts on their quizzes" ON quiz_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE id = quiz_id AND admin_id = auth.uid()::uuid
    )
  );

-- Follows: Users can manage their own follows
CREATE POLICY "Users can insert their own follows" ON follows
  FOR INSERT WITH CHECK (auth.uid()::uuid = follower_id);

CREATE POLICY "Users can read follows" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can delete their own follows" ON follows
  FOR DELETE USING (auth.uid()::uuid = follower_id);
