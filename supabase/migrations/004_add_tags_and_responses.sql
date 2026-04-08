-- Add tags column to quiz_questions table
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create question_responses table to track individual question answers
CREATE TABLE IF NOT EXISTS question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  selected_index INT,
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_question_responses_quiz_id ON question_responses(quiz_id);
CREATE INDEX IF NOT EXISTS idx_question_responses_question_id ON question_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_question_responses_attempt_id ON question_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_question_responses_user_id ON question_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_question_responses_tags ON quiz_questions USING GIN(tags);

-- Enable RLS on question_responses table
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own responses
CREATE POLICY "Users can insert their own responses" ON question_responses
  FOR INSERT WITH CHECK (
    auth.uid()::uuid = user_id
  );

-- Allow users to read their own responses and admins to read responses for their quizzes
CREATE POLICY "Users can read their own and admins can read quiz responses" ON question_responses
  FOR SELECT USING (
    auth.uid()::uuid = user_id OR
    EXISTS (
      SELECT 1 FROM quizzes WHERE id = quiz_id AND admin_id = auth.uid()::uuid
    )
  );
