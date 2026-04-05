-- Drop existing foreign keys that reference users table
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_admin_id_fkey;
ALTER TABLE quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_user_id_fkey;
ALTER TABLE follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
ALTER TABLE follows DROP CONSTRAINT IF EXISTS follows_following_id_fkey;

-- Add foreign keys to users_app table instead
ALTER TABLE quizzes ADD CONSTRAINT quizzes_admin_id_fkey 
  FOREIGN KEY (admin_id) REFERENCES users_app(id) ON DELETE CASCADE;

ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users_app(id) ON DELETE CASCADE;

ALTER TABLE follows ADD CONSTRAINT follows_follower_id_fkey 
  FOREIGN KEY (follower_id) REFERENCES users_app(id) ON DELETE CASCADE;

ALTER TABLE follows ADD CONSTRAINT follows_following_id_fkey 
  FOREIGN KEY (following_id) REFERENCES users_app(id) ON DELETE CASCADE;
