# 🚀 Deploying Community Feature Migration

## Problem
The voting system shows "Failed to vote" because the `votes` table doesn't exist in your Supabase database yet. The migration file is ready but needs to be deployed.

## ✅ Solution: Deploy via Supabase Dashboard (30 seconds)

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard

### Step 2: Select Your Project
- Click on the **"wavelearn"** project
- (Project ID: `vhtlioeeqkkcsycgadcj`)

### Step 3: Open SQL Editor
- In the left sidebar, click **"SQL Editor"**
- Click **"New query"** button

### Step 4: Copy the Migration SQL
- Open this file in your editor: `supabase/migrations/002_community_schema.sql`
- Select ALL content (Ctrl+A)
- Copy it (Ctrl+C)

### Step 5: Paste & Execute
- Paste the SQL into the Supabase SQL Editor (Ctrl+V)
- Click the **"Run"** button (or press Ctrl+Enter)
- Wait for it to complete (should be instant)

### Step 6: Verify
You should see:
```
✓ Queries completed
```

Then check the Tables section in left sidebar - you should see:
- ✅ questions
- ✅ answers  
- ✅ comments
- ✅ **votes** ← This is the critical one!
- ✅ user_reputation

---

## 🎯 After Deployment
Once the migration is deployed:

1. **Refresh your app** (F5 or Ctrl+Shift+R)
2. **Go to a question** at: `/community/questions/[any-id]`
3. **Click the upvote button**
4. You should see: `✓ Vote recorded!` (success toast)
5. **Refresh the page** - the vote count should stay

---

## Alternative: Use Script (if above doesn't work)

If you prefer to use the deployment script:

```bash
# Step 1: Get service role key from Supabase
# Go to: https://supabase.com/dashboard
# → wavelearn project
# → Settings > API
# → Copy "service_role" key

# Step 2: Run the deployment script
set SUPABASE_SERVICE_ROLE_KEY=<paste-your-key-here>
npm run deploy:migration
```

---

## 📋 What Gets Created

### Tables
- **questions** - For posting questions
- **answers** - For answering questions
- **comments** - For commenting on answers
- **votes** - For upvoting/downvoting (THIS IS CRITICAL)
- **user_reputation** - For tracking user stats

### Security
- All tables have Row Level Security (RLS) enabled
- Public READ access for everyone
- INSERT/UPDATE/DELETE restricted to authenticated users
- Users can only modify their own content

### Performance
- Indexes created on frequently queried columns
- GIN index on tags for fast filtering

---

## ❓ Troubleshooting

### "Queries completed with errors"
If you get an error, it might be:
- **Already deployed**: The tables already exist (this is fine, the `CREATE TABLE IF NOT EXISTS` handles it)
- **Permission issue**: Make sure you're logged into the correct Supabase account
- **RLS conflict**: Similar issue - the policies might already exist

**Solution**: Try copying just one section at a time to identify which part fails.

### After deployment, voting still fails
1. **Hard refresh** the app: Ctrl+Shift+R
2. **Check browser console**: F12 → Console tab
3. **Look for errors** about the "votes" table
4. If still failing, the RLS policies might be too restrictive - check they allow your user

---

## 🎉 Success Indicators
- ✅ Vote buttons show feedback immediately
- ✅ Vote count updates in the UI
- ✅ Vote count persists after page refresh
- ✅ "Failed to vote" error is gone
- ✅ Can upvote/downvote/toggle votes
- ✅ Delete buttons work for your own content

---

**Next Steps After Migration:**
1. Test voting functionality
2. Test delete functionality  
3. Test answer submission
4. Start working on comments and reputation system
