-- Add pass criteria fields to quizzes table
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS passing_percentage INT DEFAULT 70 CHECK (passing_percentage >= 0 AND passing_percentage <= 100);
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_quizzes_passing_percentage ON quizzes(passing_percentage);
