# ⚡ Quick Deploy Guide - 3 Minutes

## 🎯 Your Mission (If You Choose to Accept)

Deploy the missing migration so voting works. Current status:
- ✅ Voting UI works (button clicks, visual feedback)
- ✅ Vote logic is correct (math, state management)
- ❌ Voting doesn't save (votes table doesn't exist in DB)

---

## 🚀 Deploy in 3 Steps

### Step 1: Open Supabase
```
https://supabase.com/dashboard
```

### Step 2: Select Project & SQL Editor
```
Click "wavelearn" project
→ Left sidebar: "SQL Editor"
→ "New query" button
```

### Step 3: Copy, Paste, Run
```
File: supabase/migrations/002_community_schema.sql
Action: Select all (Ctrl+A) → Copy (Ctrl+C)
Paste into Supabase (Ctrl+V)
Click "Run"
```

**That's it!** ✨

---

## ✅ Verify It Worked

1. Look at left sidebar → "Tables"
2. You should see:
   - questions ✅
   - answers ✅
   - comments ✅
   - **votes** ✅ ← This is the important one!
   - user_reputation ✅

---

## 🧪 Test Voting

1. **Refresh browser** (Ctrl+Shift+R)
2. Go to `/community` 
3. Click any question
4. Click upvote button ⬆️
5. Should show "Vote recorded!" ✅
6. Refresh page (F5)
7. Vote count should stay ✅

---

## ❌ If It Fails

| Problem | Check |
|---------|-------|
| Vote count still resets | Did you deploy? Check Tables section |
| No "votes" table | Migration didn't deploy, try again |
| "Failed to vote" error | Hard refresh: Ctrl+Shift+R |
| Permission denied error | Check RLS policies in Supabase |
| Not logged in | Check Clerk profile in top right |

---

## 🎉 Success = ✅

When voting works:
- Vote count updates ✅
- Vote count persists after refresh ✅
- No error messages ✅
- Buttons highlight when active ✅

---

## 📚 Full Documentation

For more details:
- [NEXT_STEPS.md](NEXT_STEPS.md) - Detailed testing guide
- [VOTING_DEBUG_GUIDE.md](VOTING_DEBUG_GUIDE.md) - Troubleshooting
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Full overview

---

**Total time: ~3 minutes** ⏱️
