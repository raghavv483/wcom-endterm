# ✅ Pre-Deployment Checklist & Verification

## Before You Deploy

### ✓ Pre-Flight Check

- [ ] You have access to https://supabase.com/dashboard
- [ ] You can log in and see the "wavelearn" project
- [ ] You have read the deployment guides (DEPLOY_QUICK_GUIDE.md)
- [ ] Your app is running (`npm run dev`)
- [ ] You can access http://localhost:5173 without errors

---

## 🎯 Deployment Steps (Copy-Paste Guide)

### Step 1: Navigate to Supabase Dashboard
```
1. Go to: https://supabase.com/dashboard
2. Log in if needed
3. Click on "wavelearn" project
```

### Step 2: Open SQL Editor
```
1. Look at left sidebar
2. Find "SQL Editor" (should be under "Development")
3. Click "New query"
```

### Step 3: Copy This Exact SQL

The migration file location: `supabase/migrations/002_community_schema.sql`

**Open that file and copy the ENTIRE content:**

```sql
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
CREATE POLICY "votes_create" ON votes FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "votes_delete" ON votes FOR DELETE USING (auth.uid()::text = user_id);

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
```

### Step 4: Paste in Supabase Editor
```
1. Click in the white SQL editor area
2. Ctrl+V (paste all the SQL)
```

### Step 5: Execute
```
1. Click "Run" button (or press Ctrl+Enter)
2. Wait for "✓ Queries completed"
```

---

## ✅ Post-Deployment Verification

### Check 1: Tables Created ✅

1. **Look at left sidebar**
   - Click "Tables" section
   - Expand the list

2. **Verify these 5 tables exist:**
   - [ ] questions ✅
   - [ ] answers ✅
   - [ ] comments ✅
   - [ ] **votes** ✅ (CRITICAL!)
   - [ ] user_reputation ✅

**If any are missing:** Something went wrong. Check the error message and try again.

---

### Check 2: Verify "votes" Table Structure ✅

1. **Click on "votes" table** in the Tables list
2. **Check the columns:**
   - [ ] id (uuid, PK)
   - [ ] user_id (text)
   - [ ] voteable_id (uuid)
   - [ ] voteable_type (text)
   - [ ] vote_type (text)
   - [ ] created_at (timestamp)

**If columns are different:** Something went wrong with the deployment.

---

### Check 3: Test Query ✅

1. **Go to SQL Editor**
2. **Create a new query**
3. **Paste this test query:**

```sql
SELECT * FROM votes LIMIT 5;
```

4. **Click Run**
5. **Expected result:**
   - Shows a table with 0 rows (or any number if you already tested)
   - No error message
   - Column headers match Check 2 above

**If error "relation 'votes' does not exist":** Deployment failed. Try again.

---

### Check 4: Test RLS Policies ✅

1. **Go to SQL Editor**
2. **Create new query**
3. **Paste:**

```sql
-- List all RLS policies
SELECT 
  t.tablename,
  p.policyname,
  p.qual AS allowed_check
FROM pg_tables t
JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.tablename IN ('questions', 'answers', 'comments', 'votes', 'user_reputation')
ORDER BY t.tablename, p.policyname;
```

4. **Click Run**
5. **Expected result:**
   - See policies for all 5 tables
   - Should include: votes_read, votes_create, votes_delete
   - No errors

**If no results or errors:** RLS policies didn't create. Try redeploying.

---

## 🧪 Post-Deployment App Test

### Test 1: Vote Creation

**Setup:**
1. Hard refresh app: Ctrl+Shift+R
2. Go to http://localhost:5173/community
3. Click any question

**Test:**
1. Click upvote button ⬆️
2. Check for "Vote recorded!" toast
3. Check vote count increased by 1

**Success Criteria:**
- [ ] Button highlights blue immediately ✅
- [ ] Vote count increases ✅
- [ ] Toast shows "Vote recorded!" ✅
- [ ] No error in console ✅

**If fails:**
- [ ] Check browser console (F12)
- [ ] Look for error message
- [ ] Compare with common errors section below

---

### Test 2: Vote Persistence

**Setup:**
- From Test 1, you have an upvoted question
- Vote count shows +1, button is blue

**Test:**
1. Refresh page (F5)
2. Wait for page to load
3. Check vote count and button

**Success Criteria:**
- [ ] Vote count still shows +1 ✅
- [ ] Button still highlighted blue ✅
- [ ] No "Failed to vote" error ✅
- [ ] No "relation 'votes'" error ✅

**If fails:**
- [ ] Check console for errors
- [ ] Verify migration deployed (Check 1)
- [ ] Verify you're logged in (see profile in top right)

---

### Test 3: Vote Switching

**Setup:**
- You have an upvote (button blue, count = 1)

**Test:**
1. Click downvote button ⬇️
2. Check results

**Success Criteria:**
- [ ] Upvote button loses highlight ✅
- [ ] Downvote button highlights red ✅
- [ ] Vote count updates correctly ✅
- [ ] Toast shows "Vote recorded!" ✅

**Expected: upvote (count=1) → switch to downvote (count=-1 or showing downvote)**

---

### Test 4: Vote Toggle-Off

**Setup:**
- You have an upvote (button blue, count = 1)

**Test:**
1. Click upvote button again (same button)
2. Check results

**Success Criteria:**
- [ ] Button loses highlight ✅
- [ ] Vote count goes to 0 ✅
- [ ] Toast shows "Vote recorded!" ✅

---

### Test 5: Answer Operations

**Setup:**
- Go to a question

**Test:**
1. Scroll to "Post Your Answer"
2. Type an answer (10+ characters)
3. Click "Post Answer"

**Success Criteria:**
- [ ] Answer appears immediately ✅
- [ ] Toast shows "Answer posted successfully!" ✅
- [ ] Refresh page - answer still there ✅
- [ ] Can upvote/downvote answer ✅

---

### Test 6: Delete Operation

**Setup:**
- Go to a question you created

**Test:**
1. Click delete button (red X) on question
2. Confirm deletion

**Success Criteria:**
- [ ] Confirmation dialog appears ✅
- [ ] After confirming, question deleted ✅
- [ ] Redirects to /community ✅
- [ ] Question no longer in list ✅

**Security Check:**
- [ ] Try deleting someone else's question
- [ ] Delete button should NOT appear ✅

---

## 🚨 Common Deployment Issues

### Issue 1: "Queries completed with errors"

**Possible Causes:**
1. **Tables already exist** (from previous attempt)
   - This is OK! `CREATE TABLE IF NOT EXISTS` handles it
   - Just re-run the migration

2. **Syntax error in SQL**
   - Copy the exact SQL again from the file
   - Check for typos

3. **Permission issue**
   - Make sure you're logged in as the project owner
   - Check your role in Supabase settings

**Solution:**
- Try running just the indexes section:
```sql
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
```
- If this works, tables exist. If not, re-deploy.

---

### Issue 2: After deployment, voting still fails

**Check List:**
1. [ ] Hard refresh browser: Ctrl+Shift+R
2. [ ] Close dev server, restart: npm run dev
3. [ ] Check Tables section - see "votes"?
4. [ ] Check you're logged in (profile visible?)
5. [ ] Check console (F12) for error message

**If "relation 'votes' does not exist" error:**
- Migration deployed but votes table wasn't created
- Try running deployment again

**If "permission denied" error:**
- RLS policies too restrictive
- Check RLS is set correctly (use Check 3 above)

**If votes work but reset on refresh:**
- Migration deployed but frontend not loading votes
- Hard refresh app: Ctrl+Shift+R
- Check network requests in F12 → Network tab

---

### Issue 3: Delete buttons don't work

**Check:**
1. Are you logged in?
2. Are you the author of the content?
3. Check console for specific error

**If "permission denied":**
- RLS policy for delete is restricting
- Check the policy in Supabase: Settings → Policies

---

### Issue 4: "Failed to vote" but no specific error

**Try:**
1. Hard refresh: Ctrl+Shift+R
2. Check network requests: F12 → Network → Filter "votes"
3. Click vote button
4. Right-click the request → "Copy as cURL"
5. Check what error the server returns

---

## 📋 Final Checklist

- [ ] Migration deployed
- [ ] All 5 tables created
- [ ] All RLS policies created
- [ ] Indexes created
- [ ] App hard refreshed
- [ ] Logged in with Clerk
- [ ] Test 1: Vote creation ✅
- [ ] Test 2: Vote persistence ✅
- [ ] Test 3: Vote switching ✅
- [ ] Test 4: Vote toggle-off ✅
- [ ] Test 5: Answer operations ✅
- [ ] Test 6: Delete operations ✅
- [ ] No errors in console ✅

---

## 🎉 Success!

If all checks pass, the community feature is fully operational! 

**Next Steps:**
1. Test thoroughly with multiple users
2. Test edge cases (rapid voting, delete, etc.)
3. Start implementing comments feature
4. Start implementing reputation system

**You did it!** 🚀
