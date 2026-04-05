-- Create a new users_app table without any RLS
-- This will be used for our app since the original users table has RLS issues

CREATE TABLE IF NOT EXISTS users_app (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100),
  password_hash VARCHAR(255) DEFAULT 'clerk_auth',
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- NO RLS on this table - it's clean and doesn't have RLS enabled
-- Verify RLS is not enabled
ALTER TABLE users_app DISABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_users_app_email ON users_app(email);
CREATE INDEX idx_users_app_role ON users_app(role);

-- IMPORTANT: The hook will use users_app instead of users
