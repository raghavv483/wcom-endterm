# User Profile & Authentication System

## Overview

Complete user authentication and profile management system with API key usage tracking and activity logging.

## Features

### Authentication
- **User Registration** (`/signup`)
  - Email, username, and password validation
  - Password confirmation
  - Client-side form validation

- **User Login** (`/login`)
  - Email and password authentication
  - JWT token generation and storage
  - Automatic session persistence

- **User Logout**
  - Session cleanup
  - Token removal

### User Profile Dashboard (`/profile`)
- **Account Information**
  - Email display
  - Username with edit capability
  - Account creation date
  - Last login timestamp

- **API Key Usage Tracking**
  - List of APIs used
  - Masked API keys for security
  - Request count per API
  - Last used timestamp

- **Activity History**
  - Detailed request logs
  - Endpoint information
  - HTTP method and status codes
  - Response time tracking
  - Chronological ordering

## Database Schema

### users
```sql
- id: UUID (primary key)
- email: VARCHAR (unique)
- username: VARCHAR
- password_hash: VARCHAR (bcrypt hashed)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- last_login: TIMESTAMP
```

### sessions
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- token_hash: VARCHAR (bcrypt hashed)
- expires_at: TIMESTAMP
- created_at: TIMESTAMP
```

### api_key_usage
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- api_key_masked: VARCHAR
- service: VARCHAR
- request_count: INTEGER
- last_used: TIMESTAMP
- updated_at: TIMESTAMP
```

### activity_logs
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- api_key_used: VARCHAR
- endpoint: VARCHAR
- method: VARCHAR
- status_code: INTEGER
- response_time_ms: INTEGER
- timestamp: TIMESTAMP
```

## Security Features

- **Password Hashing**: bcrypt (10 rounds)
- **JWT Tokens**: Signed with secret key
- **Token Expiration**: 7 days
- **Row-Level Security**: Supabase RLS policies on all tables
- **API Key Masking**: Only last 4 characters visible
- **Protected Routes**: AuthProvider with token verification

## API Endpoints

### Authentication

#### POST `/api/auth/login`
Authenticate user with email and password
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "created_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-01T00:00:00Z"
  },
  "token": "jwt_token_here"
}
```

#### POST `/api/auth/signup`
Register new user
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "created_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-01T00:00:00Z"
  },
  "token": "jwt_token_here"
}
```

#### POST `/api/auth/logout`
Logout user (requires Authorization header with Bearer token)

#### GET `/api/auth/me`
Get current user information (requires Authorization header)

#### PUT `/api/auth/profile`
Update user profile (requires Authorization header)
```json
{
  "username": "new_username"
}
```

### Profile

#### GET `/api/profile/api-key-usage`
Get API key usage statistics for user (requires Authorization header)

Response:
```json
[
  {
    "id": "uuid",
    "api_key_masked": "****9d4",
    "service": "groq",
    "request_count": 42,
    "last_used": "2024-01-01T12:30:00Z"
  }
]
```

#### GET `/api/profile/activity-logs?limit=50`
Get activity logs for user (requires Authorization header)

Response:
```json
[
  {
    "id": "uuid",
    "endpoint": "/api/videos",
    "method": "GET",
    "status_code": 200,
    "response_time_ms": 150,
    "timestamp": "2024-01-01T12:30:00Z"
  }
]
```

## Frontend Components

### AuthContext (`src/context/AuthContext.tsx`)
Global authentication state management
```typescript
const { user, loading, login, signup, logout, updateProfile } = useAuth();
```

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)
Route wrapper that requires authentication
```tsx
<ProtectedRoute>
  <Profile />
</ProtectedRoute>
```

### Profile Page (`src/pages/Profile.tsx`)
User profile dashboard with:
- Account information display
- Profile edit functionality
- API key usage statistics
- Activity history table

### Login Page (`src/pages/Login.tsx`)
User authentication form

### Signup Page (`src/pages/Signup.tsx`)
User registration form

## Implementation Steps

### 1. Database Setup
```bash
# Run migrations (in Supabase dashboard or CLI)
psql -h DATABASE_HOST -U postgres -d DATABASE_NAME -f supabase/migrations/001_auth_schema.sql
```

### 2. Environment Variables
```env
# .env or .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Install Dependencies
```bash
npm install
# or
bun install
```

### 4. Backend API Routes
- Implemented in `src/server/routes/auth.ts`
- Implemented in `src/server/routes/profile.ts`
- Uses Hono framework for routing

### 5. Frontend Integration
- AuthProvider wraps entire app in `App.tsx`
- Protected routes use `ProtectedRoute` component
- User menu in `Layout.tsx` sidebar

## Usage Examples

### Login Flow
```typescript
const { login } = useAuth();

try {
  await login('user@example.com', 'password123');
  // User is now authenticated
  navigate('/profile');
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### Check Authentication
```typescript
const { user, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!user) return <Navigate to="/login" />;

return <UserProfile />;
```

### Update Profile
```typescript
const { updateProfile } = useAuth();

try {
  await updateProfile('new_username');
  // Profile updated
} catch (error) {
  console.error('Update failed:', error.message);
}
```

### Logout
```typescript
const { logout } = useAuth();

await logout();
navigate('/login');
```

## Security Considerations

1. **Token Storage**: JWT stored in localStorage (suitable for development, use secure cookies for production)
2. **HTTPS**: Always use HTTPS in production to prevent token interception
3. **Password Hashing**: Never store plaintext passwords - always use bcrypt
4. **API Key Masking**: Sensitive API keys are masked before storage/display
5. **RLS Policies**: Database enforces user data isolation at the SQL level

## Future Enhancements

- Password reset functionality
- Two-factor authentication
- Email verification
- OAuth integration (Google, GitHub)
- Session management (multiple devices)
- User preferences and settings
- Admin dashboard for usage analytics
- API key management and revocation

## Troubleshooting

### Token Expires or User Gets Logged Out
- Increase JWT expiration time in `src/server/routes/auth.ts`
- Implement token refresh endpoint
- Use secure session cookies instead of localStorage

### API Key Usage Not Updating
- Ensure middleware captures API calls
- Verify database writes are succeeding
- Check RLS policies aren't blocking writes

### Profile Page Shows Empty Data
- Verify user is authenticated
- Check JWT token is valid
- Ensure API endpoints are running
- Check browser console for fetch errors

## Files Modified/Created

### New Files
- `src/pages/Profile.tsx` - User profile dashboard
- `src/pages/Login.tsx` - Login page
- `src/pages/Signup.tsx` - Signup page
- `src/components/ProtectedRoute.tsx` - Protected route wrapper
- `src/context/AuthContext.tsx` - Authentication context
- `src/server.ts` - Hono server setup
- `src/server/routes/auth.ts` - Authentication endpoints
- `src/server/routes/profile.ts` - Profile endpoints
- `supabase/migrations/001_auth_schema.sql` - Database schema

### Modified Files
- `src/App.tsx` - Added AuthProvider and new routes
- `src/components/Layout.tsx` - Added user menu
- `package.json` - Added dependencies

## References

- [Hono Documentation](https://hono.dev/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
