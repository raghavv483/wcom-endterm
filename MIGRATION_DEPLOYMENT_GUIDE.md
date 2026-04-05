# How to Deploy Migrations from Terminal

## ⚠️ Prerequisites

You need the **Service Role Key** from your Supabase project.

### Step 1: Get Your Service Role Key

1. Go to: https://vhtlioeeqkkcsycgadcj.supabase.co/dashboard
2. Click **Settings** (gear icon in left sidebar)
3. Go to **API** section
4. Under "Project API keys", find **service_role** key
5. Click the copy icon next to it
6. Save it somewhere safe

### Step 2: Run Migrations from Terminal

#### Option A: Windows PowerShell

```powershell
# Set the environment variable (one time for this terminal session)
$env:SUPABASE_SERVICE_KEY="your_service_role_key_here"

# Run the migration script
node run-migrations-direct.mjs
```

#### Option B: macOS / Linux

```bash
# Run with environment variable
SUPABASE_SERVICE_KEY=your_service_role_key_here node run-migrations-direct.mjs
```

#### Option C: Create .env.migrations file (Safer)

1. Create file: `.env.migrations`
2. Add this line:
   ```
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   ```
3. Run:
   ```bash
   node -r dotenv-cli run-migrations-direct.mjs
   ```

### Step 3: Verify Success

After running the script:
- Check Supabase Dashboard → Database → Tables
- You should see these new tables:
  - ✅ quizzes
  - ✅ quiz_questions  
  - ✅ quiz_attempts
  - ✅ follows

## Alternative: Manual SQL Editor Deployment

If terminal approach doesn't work, use the dashboard:

1. Go to: https://vhtlioeeqkkcsycgadcj.supabase.co/dashboard
2. Click **SQL Editor**
3. For each migration file (in order):
   - Click **New Query**
   - Copy content of migration file
   - Click **Run**

Order:
1. `001_auth_schema.sql`
2. `002_community_schema.sql`  
3. `003_quiz_schema.sql`

---

✅ Once migrations are deployed, users can set roles to admin and start creating quizzes!
