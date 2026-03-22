# 🔍 Voting Feature Debugging Guide

## Current Issue Summary

**Symptoms:**
- Vote count changes in UI ✅
- Toast shows "Vote recorded!" ✅
- Page refreshes and vote count resets ❌
- Console shows "Failed to vote" error ❌

**Root Cause:**
The `votes` table doesn't exist in your Supabase database because the migration hasn't been deployed yet.

---

## 🎯 Solution: Deploy Migration

### The Root Cause Explained

Your code is correct, but it's trying to insert data into a table that doesn't exist yet:

```
Your App → Tries to insert into votes table
           ↓
         votes table doesn't exist in database
           ↓
         Supabase returns error
           ↓
         Vote UI updates (optimistic) but doesn't save
           ↓
         Page refresh clears UI, shows original vote count
```

### How to Fix It

**Step 1: Open Supabase Dashboard**
```
https://supabase.com/dashboard
```

**Step 2: Select "wavelearn" Project**
- Click on the project in the list
- Project ID should be: `vhtlioeeqkkcsycgadcj`

**Step 3: Open SQL Editor**
- Left sidebar → **"SQL Editor"**
- Click **"New query"** button

**Step 4: Copy SQL Migration**
```
Open file: supabase/migrations/002_community_schema.sql
Ctrl+A → Ctrl+C (copy all)
```

**Step 5: Paste in Supabase**
```
Click in the SQL editor text area
Ctrl+V (paste)
```

**Step 6: Execute**
```
Click "Run" button (or Ctrl+Enter)
Wait for "✓ Queries completed"
```

**Step 7: Verify Tables Were Created**
- Look at the left sidebar
- Click **"Tables"** section
- You should see these new tables:
  - questions
  - answers
  - comments
  - **votes** ← This one is critical!
  - user_reputation

---

## ✅ Verification Checklist

After deploying, verify each step:

- [ ] **Tables Created**
  - [ ] Go to Supabase dashboard → Tables section
  - [ ] See all 5 tables listed?
  - [ ] Specifically see "votes" table?

- [ ] **App Hard Refreshed**
  - [ ] Close dev server (Ctrl+C)
  - [ ] Restart: `npm run dev`
  - [ ] Or hard refresh browser: Ctrl+Shift+R

- [ ] **Logged In**
  - [ ] See your profile in top right?
  - [ ] Not showing "Sign In" button?

- [ ] **Test Voting**
  - [ ] Go to `/community`
  - [ ] Click any question to open it
  - [ ] Click upvote button
  - [ ] Do you see "Vote recorded!" toast?
  - [ ] Does vote count increase?
  - [ ] Refresh page (F5) - does count stay?

---

## 🧪 Detailed Test Scenarios

### Test 1: First Time Voting

**Starting State:**
- Question has 0 upvotes, 0 downvotes
- No vote button is highlighted

**Action:**
1. Click upvote button ⬆️

**Expected Behavior:**
- Upvote button turns blue immediately ✅
- Vote count shows "1" ✅
- Toast appears: "Vote recorded!" ✅

**If Wrong:**
- ❌ Button doesn't highlight → CSS issue or React state issue
- ❌ Count doesn't change → React state not updating
- ❌ No toast → Toast library issue
- ❌ Error toast → Database connection issue

**Debug:**
```javascript
// Open browser console (F12)
// Look for messages like:
"Error voting: Error: relation "votes" does not exist"
```

---

### Test 2: Persistence (Critical Test)

**Starting State:**
- You just upvoted a question (vote count shows "1", button is blue)

**Action:**
1. Refresh page (F5)
2. Wait for page to load

**Expected Behavior:**
- Vote count still shows "1" ✅
- Upvote button still highlighted in blue ✅
- No "Failed to vote" error in console ✅

**If Wrong:**
- ❌ Vote count reset to 0 → Vote didn't save to database
- ❌ Button not highlighted → Frontend didn't fetch vote status
- ❌ See error "relation 'votes' does not exist" → Migration not deployed

**Debug:**
```javascript
// This error means migration failed:
"relation 'votes' does not exist"

// Solution: Deploy migration again
```

---

### Test 3: Vote Switching

**Starting State:**
- Question has your upvote (blue highlight, count = 1)

**Action:**
1. Click downvote button ⬇️

**Expected Behavior:**
- Upvote button loses blue highlight ✅
- Downvote button turns red ✅
- Vote count changes correctly ✅

**Possible States:**
- Original: ↑0 ↓0 → After upvoting: ↑1 ↓0 → After switching to downvote: ↑0 ↓1

**If Wrong:**
- ❌ Both buttons highlighted → Toggle logic issue
- ❌ Count goes to 2 instead of switching → Vote logic error
- ❌ Error appears → Database constraint issue

---

### Test 4: Vote Toggle-Off

**Starting State:**
- Question has your upvote (blue, count = 1)

**Action:**
1. Click upvote button again (same button)

**Expected Behavior:**
- Upvote button loses highlight ✅
- Vote count goes back to 0 ✅
- No buttons highlighted ✅

**If Wrong:**
- ❌ Vote doesn't turn off → Toggle logic not working
- ❌ Count increases instead → Vote removal logic broken
- ❌ Count becomes negative → Database arithmetic issue

---

## 🚨 Common Errors & Fixes

### Error 1: "relation 'votes' does not exist"

**Meaning:**
The `votes` table hasn't been created yet. Migration not deployed.

**Fix:**
```
1. Go to Supabase dashboard
2. Copy SQL from: supabase/migrations/002_community_schema.sql
3. Paste into SQL Editor
4. Click Run
5. Wait for "✓ Queries completed"
```

**Verify:**
```
After deploying, run this query in Supabase SQL Editor:
SELECT * FROM votes;

You should get a result showing the votes table (even if empty)
```

---

### Error 2: "column 'user_id' violates unique constraint"

**Meaning:**
You already voted this way. The unique constraint prevents duplicate votes.

**This is actually correct behavior** - you can only have one vote per user per item.

**Expected Flow:**
1. First vote → Inserts into votes table ✅
2. Second vote (same type) → Should delete first vote, then insert new one
3. Different vote type → Should delete old vote, insert new one

**If Error Appears:**
The vote deletion isn't working. Check:
- Is the delete query executing? 
- Is the user_id matching?
- Check the vote service code has the delete before insert

---

### Error 3: "permission denied for schema public"

**Meaning:**
Your Supabase role doesn't have permission to insert votes.

**Cause:**
RLS policies aren't configured correctly.

**Fix:**
```
1. Go to Supabase dashboard
2. Click "wavelearn" project
3. Authentication → Policies
4. Check that "votes_create" policy exists
5. If missing, re-deploy the migration
```

---

### Error 4: "You must be logged in to vote"

**Meaning:**
The app thinks you're not logged in.

**Fix:**
```
1. Click your profile icon in top right
2. Should show your name/email
3. If not, click "Sign In" button
4. Log in with Clerk
5. Try voting again
```

---

## 📊 Database State Checks

### Check 1: Verify Tables Exist

**In Supabase Dashboard:**
1. Go to Tables section (left sidebar)
2. You should see:
   - [ ] questions
   - [ ] answers
   - [ ] comments
   - [ ] **votes** ← This is critical
   - [ ] user_reputation

**If Missing:**
→ Migration wasn't deployed. Go back to Step 1.

---

### Check 2: Verify Votes Were Inserted

**In Supabase Dashboard:**
1. Click "SQL Editor"
2. New query
3. Paste:
```sql
SELECT * FROM votes;
```
4. Click Run

**You should see:**
```
id                                  | user_id        | voteable_id               | voteable_type | vote_type
50f1c8b1-12ab-...                  | user_12345    | 9a8b7c6d-5e4f-...        | question      | upvote
```

**If Empty:**
→ Votes aren't being saved. Check error messages in console.

**If Error "relation does not exist":**
→ Migration not deployed.

---

### Check 3: Verify RLS Policies

**In Supabase Dashboard:**
1. Click "wavelearn" project
2. Authentication → Policies
3. Look for the "votes" table
4. You should see these policies:
   - [ ] votes_read (SELECT)
   - [ ] votes_create (INSERT)
   - [ ] votes_delete (DELETE)

**If Missing:**
→ Migration not deployed completely. Re-run it.

---

## 🔧 Step-by-Step Debugging

### If Voting Still Fails After Deployment

**Step 1: Check Migration Deployed**
```
Go to Supabase → Tables
See "votes" table? 
  YES → Go to Step 2
  NO → Deploy migration again
```

**Step 2: Hard Refresh App**
```
Browser: Ctrl+Shift+R (hard refresh)
Or: Close dev server, npm run dev
```

**Step 3: Check Logged In**
```
Look at top right of app
See profile info?
  YES → Go to Step 4
  NO → Click Sign In, log in
```

**Step 4: Check Console Errors**
```
Press F12 → Console tab
Try voting
See any errors?
  YES → Copy error message, search for solution below
  NO → Check if vote count updated in UI
```

**Step 5: Check Database Directly**
```
Go to Supabase → SQL Editor
Run: SELECT * FROM votes;
See any rows?
  YES → Votes were saved! Check if page loads them
  NO → Check console error, fix issue
```

---

## 🎯 Success Indicators

You'll know it's working when:

✅ Vote button highlights immediately when clicked
✅ Vote count changes in the UI
✅ Toast shows "Vote recorded!"
✅ Page refreshes and vote count stays the same
✅ Can switch between upvote/downvote
✅ Can toggle votes off by clicking same button twice
✅ Delete buttons work for your own content
✅ No "Failed to vote" error in console
✅ No "relation 'votes' does not exist" error

---

## 📞 If Nothing Works

1. **Verify migration file exists**
   - Check: `supabase/migrations/002_community_schema.sql`
   - Should be ~350 lines

2. **Verify Supabase project**
   - Go to https://supabase.com/dashboard
   - Confirm you're in "wavelearn" project
   - ID should be: vhtlioeeqkkcsycgadcj

3. **Check Clerk is working**
   - See your profile in app? 
   - Can you create questions? If yes, auth is working

4. **Check network requests**
   - Press F12 → Network tab
   - Click vote button
   - Look for request to `/rest/v1/votes`
   - If it fails, click it to see error details

5. **Nuclear option: Re-create database**
   - Go to Supabase dashboard
   - Project Settings → Databases
   - Delete and recreate (⚠️ WARNING: This deletes all data!)
   - Re-deploy migration
   - Add test data

---

**Remember:** The voting system is correctly implemented. The only issue is the database table not existing. Once you deploy the migration, everything should work! 🚀
