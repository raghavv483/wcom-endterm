# 🎯 Next Steps: Deploy Migration & Test Features

## Current Status
✅ Voting UI implemented and working (optimistic updates)
✅ Delete buttons implemented and working (owner-only)
✅ Service layer ready with vote/delete functions
❌ **BLOCKER**: Migration not deployed - `votes` table doesn't exist in database

---

## Step 1: Deploy Migration (Required) ⚡

### Easiest Method: Supabase Dashboard

**Time Required:** ~1 minute

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Click the **"wavelearn"** project

2. **Navigate to SQL Editor**
   - Left sidebar → **SQL Editor**
   - Click **"New query"**

3. **Copy & Paste SQL**
   - Open file: `supabase/migrations/002_community_schema.sql` in your editor
   - Select all (Ctrl+A) → Copy (Ctrl+C)
   - Paste into Supabase SQL Editor (Ctrl+V)

4. **Execute**
   - Click **"Run"** button (or Ctrl+Enter)
   - Wait for ✓ Queries completed

5. **Verify Success**
   - Look at left sidebar under **Tables**
   - You should see these 5 new tables:
     - ✅ questions
     - ✅ answers
     - ✅ comments
     - ✅ **votes** ← This is the critical one!
     - ✅ user_reputation

### Alternative: Command Line

```bash
# Step 1: Get your service role key
# 1. Go to https://supabase.com/dashboard
# 2. Click "wavelearn" project
# 3. Settings → API
# 4. Copy "service_role" key (NOT public key)

# Step 2: Deploy using npm script
set SUPABASE_SERVICE_ROLE_KEY=<paste-your-key>
npm run deploy:migration
```

---

## Step 2: Test Core Features ✨

### Test 1: Voting System

**Location:** Any question at `/community/questions/[question-id]`

**Test Steps:**
1. Click **upvote button** ⬆️
   - Expected: Button highlights in blue immediately
   - Expected: Vote count increases
   - Expected: Toast shows "Vote recorded!"
   
2. **Refresh page** (F5)
   - Expected: Vote count stays the same
   - Expected: Button still highlighted in blue
   - **If this fails**: Migration not deployed or RLS issue

3. Click **downvote button** ⬇️ (while upvote is active)
   - Expected: Upvote becomes inactive (not blue)
   - Expected: Downvote highlights in red
   - Expected: Vote count changes correctly

4. Click **downvote again** (same button)
   - Expected: Downvote becomes inactive
   - Expected: Vote count returns to original
   - Expected: No more highlighting

**Success Criteria:**
- ✅ Upvote/downvote buttons show visual feedback
- ✅ Vote count updates immediately
- ✅ Vote count persists after page refresh
- ✅ Can toggle between upvote/downvote/no vote
- ✅ "Vote recorded!" toast appears
- ✅ No "Failed to vote" error

---

### Test 2: Delete Functionality

**Location:** Any question you created at `/community/questions/[your-question-id]`

**Test Steps:**
1. Click **red Delete button** on the question
   - Expected: Confirmation dialog appears
   - Message: "Are you sure you want to delete this question?"

2. Click **"Delete"** in dialog
   - Expected: Question is deleted
   - Expected: Page redirects to `/community`
   - Expected: Question no longer in the list

3. Try deleting a **different user's answer**
   - Expected: **No delete button shows** (security check)
   - Only the author of an answer sees their delete button

**Success Criteria:**
- ✅ Delete button appears for your own content
- ✅ Confirmation dialog works
- ✅ Deletion removes item from database
- ✅ Delete button hidden for other users' content

---

### Test 3: Answer Submission & Display

**Location:** Question detail page `/community/questions/[id]`

**Test Steps:**
1. Scroll to **"Post Your Answer"** section
2. Type an answer (min 10 characters)
3. Click **"Post Answer"**
   - Expected: Answer appears in list immediately
   - Expected: Toast shows "Answer posted successfully!"
   - Expected: Form clears

4. Refresh page (F5)
   - Expected: Answer still visible
   - Expected: Answer count increased

5. Try upvoting the answer
   - Expected: Same behavior as question voting
   - Expected: Vote count updates and persists

---

## Step 3: If Tests Fail 🔧

### Problem: "Failed to vote" error still appears

**Checklist:**
1. ✅ Did you deploy the migration? (Check Supabase Tables section)
2. ✅ Did you refresh the app after deployment? (Hard refresh: Ctrl+Shift+R)
3. ✅ Are you logged in? (Check if Clerk shows your profile)
4. ✅ Check browser console for errors (F12 → Console tab)

**If migration shows as deployed:**
- Go to Supabase dashboard
- Click your project
- SQL Editor
- Run this query to check:
```sql
SELECT * FROM votes LIMIT 5;
```
- If you see "relation 'votes' does not exist", migration didn't run properly
- Try running the migration again

### Problem: Delete doesn't work

1. Verify you own the content (check `user_id` matches your Clerk ID)
2. Check browser console (F12) for errors
3. Make sure you're logged in with Clerk

### Problem: Answer submission fails

1. Check that you're logged in
2. Make sure answer is at least 10 characters
3. Check console for errors
4. Verify question_id is being passed correctly

---

## Step 4: Next Features to Build 🚀

After voting is working:

1. **Comments on Answers**
   - Table already exists: `comments`
   - Service functions ready: `getComments()`, `createComment()`
   - Need: UI component to add/display comments

2. **User Reputation System**
   - Table exists: `user_reputation`
   - Service functions ready: `getUserReputation()`, `updateUserReputation()`
   - Need: Logic to award points for good answers

3. **Mark Answer as Accepted**
   - UI: Button on answers for question author
   - Service: `acceptAnswer()` function ready
   - Need: Logic and UI implementation

4. **View Counts & Trending**
   - Service ready: `incrementViewCount()`
   - Need: Track when user views a question
   - Need: Trending questions page

---

## Troubleshooting Flowchart

```
Migration deployed?
├─ No → Go to Supabase dashboard, paste SQL, run
└─ Yes → App hard refreshed? (Ctrl+Shift+R)
    ├─ No → Hard refresh now
    └─ Yes → Logged in with Clerk?
        ├─ No → Click login button
        └─ Yes → Check console for errors
            ├─ See "votes" table error? → Re-deploy migration
            ├─ See permission error? → Check RLS policies
            └─ See other error? → Contact support with error message
```

---

## Quick Reference: Created Files

| File | Purpose |
|------|---------|
| `supabase/migrations/002_community_schema.sql` | Database schema (READY TO DEPLOY) |
| `src/services/communityService.ts` | All Supabase CRUD operations |
| `src/pages/Community.tsx` | Browse questions |
| `src/pages/AskQuestion.tsx` | Create new questions |
| `src/pages/QuestionDetail.tsx` | View question + answers, vote, delete |
| `deploy-migration.mjs` | Script to deploy migration (optional) |
| `MIGRATION_DEPLOYMENT.md` | Detailed deployment guide |

---

## Success Checklist

- [ ] Migration deployed to Supabase
- [ ] 5 new tables appear in Supabase dashboard
- [ ] Voting works (vote count updates and persists)
- [ ] Delete works (for owned content only)
- [ ] Answer submission works
- [ ] All tests pass without errors
- [ ] "Failed to vote" error no longer appears

**Once this is done:** You can move on to comments, reputation, and other advanced features! 🎉
