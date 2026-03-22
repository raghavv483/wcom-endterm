-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  views_count INT DEFAULT 0,
  answers_count INT DEFAULT 0,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  voteable_id UUID NOT NULL,
  voteable_type TEXT NOT NULL CHECK (voteable_type IN ('question', 'answer', 'comment')),
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, voteable_id, voteable_type)
);

-- Create user_reputation table
CREATE TABLE IF NOT EXISTS user_reputation (
  user_id TEXT PRIMARY KEY,
  reputation_score INT DEFAULT 0,
  questions_asked INT DEFAULT 0,
  questions_answered INT DEFAULT 0,
  helpful_answers INT DEFAULT 0,
  badges TEXT[] DEFAULT ARRAY[]::TEXT[],
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for questions (everyone can read, authenticated users can create/update own)
CREATE POLICY "questions_read" ON questions FOR SELECT USING (true);
CREATE POLICY "questions_create" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "questions_update" ON questions FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "questions_delete" ON questions FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for answers
CREATE POLICY "answers_read" ON answers FOR SELECT USING (true);
CREATE POLICY "answers_create" ON answers FOR INSERT WITH CHECK (true);
CREATE POLICY "answers_update" ON answers FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "answers_delete" ON answers FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for comments
CREATE POLICY "comments_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_create" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_update" ON comments FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for votes
CREATE POLICY "votes_read" ON votes FOR SELECT USING (true);
CREATE POLICY "votes_create" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "votes_delete" ON votes FOR DELETE USING (true);

-- Create RLS policies for user_reputation
CREATE POLICY "reputation_read" ON user_reputation FOR SELECT USING (true);
CREATE POLICY "reputation_create" ON user_reputation FOR INSERT WITH CHECK (true);
CREATE POLICY "reputation_update" ON user_reputation FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_comments_answer_id ON comments(answer_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
