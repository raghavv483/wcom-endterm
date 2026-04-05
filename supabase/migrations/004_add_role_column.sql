-- Add role column to users table if it doesn't exist
-- This is a fix for ensuring role column exists after migration 001 creates users table

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'));
    RAISE NOTICE 'Added role column to users table';
  ELSE
    RAISE NOTICE 'Role column already exists on users table';
  END IF;
END $$;
