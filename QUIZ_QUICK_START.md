# Quiz System - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Deploy Database Migration (5 min)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to your "wavelearn" project
3. Click **SQL Editor** → **New Query**
4. Copy-paste the entire content from:
   ```
   supabase/migrations/003_quiz_schema.sql
   ```
5. Click **Run**

**Verify it worked:**
- Go to **Database** → **Tables**
- You should see: `quizzes`, `quiz_questions`, `quiz_attempts`, `follows`

### Step 2: Set Up Your First Admin User (2 min)

1. Open Supabase **SQL Editor** again
2. Run this query (replace with your email):
   ```sql
   UPDATE users
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```

### Step 3: Start the App (1 min)

```bash
npm run dev
```

---

## 📍 Key Routes

### For Everyone
- `/admins` - Browse and follow admins
- `/quizzes` - See quizzes from admins you follow

### For Admins Only
- `/admin/dashboard` - Create and manage quizzes
- `/admin/quiz/create` - Create new quiz

### For All Users
- `/quiz/:id` - Take a quiz

---

## 👤 What Each User Role Can Do

### Regular User
1. Go to `/admins` 
2. Click **Follow** on an admin you like
3. Go to `/quizzes`
4. Click **Start Quiz** on any quiz
5. Answer all questions
6. See instant results and feedback

### Admin User
1. See **Admin Dashboard** in navigation menu
2. Click **Create New Quiz**
3. Fill title, description, and add questions
4. Each question needs:
   - Question text
   - 4 options (A, B, C, D)
   - Select the correct answer
5. Click **Create Quiz**
6. View quiz stats on dashboard

---

## 🎯 Quick Test Flow

### Test 1: Create a Quiz (Admin)
1. Login as admin user
2. Go to Admin Dashboard
3. Click "Create New Quiz"
4. Title: "Wireless Basics"
5. Description: "Test your knowledge"
6. Add Question:
   - Text: "What does MIMO stand for?"
   - Options: 
     - A) Multiple Input Multiple Output ✓
     - B) Multi Input Modular Output
     - C) Multiple Isolated Modulation Operator
     - D) Multi Interface Modulation Output
   - Select A as correct
7. Add 2 more questions
8. Click "Create Quiz"

### Test 2: Take a Quiz (Regular User)
1. Logout and login as regular user
2. Go to `/admins`
3. Find the admin and click "Follow"
4. Go to `/quizzes`
5. See the quiz you created in feed
6. Click "Start Quiz"
7. Answer all questions
8. See results page
9. Notice badge now says "Attempted"

---

## ❓ Common Questions

**Q: Can I retake a quiz?**
A: No, each user can only attempt each quiz once (by design). If you want to modify questions, delete and recreate.

**Q: How do I make someone an admin?**
A: Run this in Supabase SQL Editor:
```sql
UPDATE users SET role = 'admin' WHERE email = 'their-email@example.com';
```

**Q: Where are quiz results saved?**
A: In the `quiz_attempts` table. Admins can see attempt stats on their dashboard.

**Q: Can I delete a quiz?**
A: Yes, click the trash icon on any quiz in your Admin Dashboard. This also deletes all attempts and questions.

**Q: Why can't I see certain quizzes?**
A: You only see quizzes from admins you follow. Go to `/admins` and follow more admins.

---

## 📋 Verification Checklist

- [ ] Migration deployed without errors
- [ ] Tables created in Supabase
- [ ] At least one user set to admin role
- [ ] Admin can create a quiz
- [ ] Quiz appears in admin dashboard
- [ ] Regular user can see admin in `/admins`
- [ ] Regular user can follow admin
- [ ] Quiz appears in regular user's feed
- [ ] Quiz can be completed and scored
- [ ] Score is saved and quiz marked as attempted

---

## 🐛 Troubleshooting

**Problem: Admin Dashboard shows empty**
- Make sure your user's role is set to 'admin' in Supabase

**Problem: Can't see quizzes in feed**
- Make sure you're following at least one admin
- Go to `/admins` and click Follow

**Problem: "Only admins can create quizzes" error**
- Your role is not set to 'admin'. Run the SQL update command above.

**Problem: Quiz attempts not saving**
- Check browser console for errors
- Make sure migration deployed successfully

---

## 📚 Full Documentation

For complete documentation, see: `QUIZ_SYSTEM_IMPLEMENTATION.md`

This includes:
- Complete database schema
- All service functions
- Component details
- Troubleshooting guide
- Enhancement ideas

---

## 🎉 You're Ready!

You now have a fully functional quiz system. Start creating quizzes and have users follow you!

**Need help?** Check the full documentation or review the component code in `src/components/` and `src/services/`.
