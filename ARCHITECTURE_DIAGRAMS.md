# 📊 Architecture & Data Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     WaveLearn App                           │
│                  (React + TypeScript)                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Community.   │  │ AskQuestion. │  │ Question     │    │
│  │ tsx          │  │ tsx          │  │ Detail.tsx   │    │
│  │              │  │              │  │              │    │
│  │ • Browse Q   │  │ • Form       │  │ • Vote       │    │
│  │ • Filter/    │  │ • Validate   │  │ • Delete     │    │
│  │   Sort       │  │ • Submit     │  │ • Answer     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                 │                  │             │
│         └─────────────────┼──────────────────┘             │
│                           │                                │
│           ┌───────────────▼───────────────┐               │
│           │  communityService.ts          │               │
│           │  (20+ Supabase operations)    │               │
│           │                               │               │
│           │  • getQuestions()             │               │
│           │  • createQuestion()           │               │
│           │  • voteOnQuestion()           │               │
│           │  • deleteQuestion()           │               │
│           │  • getAnswers()               │               │
│           │  • createAnswer()             │               │
│           │  • voteOnAnswer()             │               │
│           │  • deleteAnswer()             │               │
│           │  • getComments()              │               │
│           │  • createComment()            │               │
│           │  • And 10+ more...            │               │
│           └───────────────┬───────────────┘               │
│                           │                                │
└───────────────────────────┼────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Supabase API   │
                    │  (HTTPS REST)   │
                    └───────┬────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼────┐        ┌────▼────┐      ┌────▼────┐
    │ Questions│        │ Answers │      │ Votes   │
    │ Table    │        │ Table   │      │ Table   │
    └──────────┘        └─────────┘      └─────────┘
         │                  │                  │
    ┌────▼────┐        ┌────▼────┐      ┌────▼────┐
    │Comments │        │User Rep │      │Comments │
    │Table    │        │Table    │      │Table    │
    └─────────┘        └─────────┘      └─────────┘

    PostgreSQL Database (Supabase)
```

---

## Data Flow: Voting Example

### Step 1: User Clicks Upvote
```
User clicks ⬆️ button
    │
    ▼
React Component (QuestionDetail.tsx)
    │
    ├─ Update local state (optimistic)
    │  └─ Set userVotes[questionId] = "upvote"
    │  └─ Update question.upvotes += 1
    │  └─ Button highlights blue
    │
    └─ Call voteOnQuestion() service function
            │
            ▼
    communityService.ts
            │
            ├─ Delete existing vote
            │  └─ supabase.from("votes").delete()
            │     .eq("user_id", userId)
            │     .eq("voteable_id", questionId)
            │
            └─ Insert new vote
               └─ supabase.from("votes").insert({
                    user_id: userId,
                    voteable_id: questionId,
                    voteable_type: "question",
                    vote_type: "upvote"
                  })
```

### Step 2: Database Processes
```
Supabase receives INSERT request
    │
    ├─ Check RLS policy: votes_create
    │  └─ Is auth.uid() == user_id? YES ✅
    │
    ├─ Check unique constraint
    │  └─ (user_id, voteable_id, voteable_type) not already present? YES ✅
    │
    ├─ Check referential integrity
    │  └─ Does voteable_id exist in questions table? YES ✅
    │
    └─ INSERT vote into database
       └─ Vote is now persisted! ✅
```

### Step 3: Success Response
```
Supabase returns success
    │
    ▼
React receives response
    │
    ├─ Show success toast: "Vote recorded!" ✅
    │
    └─ State is already updated (from step 1)
       └─ UI already shows vote count +1
       └─ Button already highlighted blue
```

### Step 4: Page Refresh
```
User refreshes page (F5)
    │
    ▼
QuestionDetail.tsx loads
    │
    ├─ Call getQuestionById(questionId)
    │  │
    │  └─ Fetch from Supabase
    │     │
    │     ├─ Get question details
    │     └─ Get upvotes/downvotes from database
    │
    └─ Check if user has already voted
       │
       └─ Call to votes table
          │
          ├─ SELECT * FROM votes
          │  WHERE user_id = ? AND voteable_id = ?
          │
          └─ If found, set userVotes[questionId] = vote_type
             └─ Button stays highlighted! ✅
             └─ Vote count shows correctly! ✅
```

---

## Database Schema

### Questions Table
```
┌─────────────────────────────────────┐
│ questions                           │
├─────────────────────────────────────┤
│ id (UUID, PK)       Example: 9a8b7c... │
│ user_id (TEXT)      User who asked  │
│ title (TEXT)        Question title  │
│ description (TEXT)  Full text       │
│ tags (ARRAY)        ["react", "vue"]│
│ views_count (INT)   How many views  │
│ answers_count (INT) Number of answers │
│ upvotes (INT)       Number of ⬆️    │
│ downvotes (INT)     Number of ⬇️    │
│ is_answered (BOOL)  Marked complete?│
│ created_at (TS)     When created    │
│ updated_at (TS)     Last modified   │
└─────────────────────────────────────┘
```

### Votes Table ← THIS WAS MISSING
```
┌─────────────────────────────────────┐
│ votes                               │
├─────────────────────────────────────┤
│ id (UUID, PK)       Auto-generated  │
│ user_id (TEXT)      User voting     │
│ voteable_id (UUID)  Question/Answer │
│ voteable_type (TEXT)"question" or   │
│                     "answer"        │
│ vote_type (TEXT)    "upvote" or     │
│                     "downvote"      │
│ created_at (TS)     When voted      │
├─────────────────────────────────────┤
│ UNIQUE (user_id,    Only 1 vote     │
│   voteable_id,      per user per    │
│   voteable_type)    item            │
└─────────────────────────────────────┘

Example rows:
┌────────────────────────────────────────────────┐
│ user_id       │ voteable_id│type    │vote_type │
├────────────────────────────────────────────────┤
│ user_12345    │ q123...    │question│upvote    │
│ user_12345    │ a456...    │answer  │downvote  │
│ user_67890    │ q123...    │question│upvote    │
└────────────────────────────────────────────────┘
```

### Answers Table
```
┌─────────────────────────────────────┐
│ answers                             │
├─────────────────────────────────────┤
│ id (UUID, PK)       Auto-generated  │
│ question_id (UUID)  Parent question │
│ user_id (TEXT)      Who answered    │
│ content (TEXT)      Answer text     │
│ upvotes (INT)       Number of ⬆️    │
│ downvotes (INT)     Number of ⬇️    │
│ is_accepted (BOOL)  Marked correct? │
│ created_at (TS)     When created    │
│ updated_at (TS)     Last modified   │
└─────────────────────────────────────┘
```

### Comments Table (For answers)
```
┌─────────────────────────────────────┐
│ comments                            │
├─────────────────────────────────────┤
│ id (UUID, PK)       Auto-generated  │
│ answer_id (UUID)    Parent answer   │
│ user_id (TEXT)      Who commented   │
│ content (TEXT)      Comment text    │
│ upvotes (INT)       Number of ⬆️    │
│ created_at (TS)     When created    │
└─────────────────────────────────────┘
```

### User Reputation Table
```
┌─────────────────────────────────────┐
│ user_reputation                     │
├─────────────────────────────────────┤
│ user_id (TEXT, PK) Clerk user ID   │
│ reputation_score (INT) Total points │
│ questions_asked (INT) Q count       │
│ questions_answered (INT) A count    │
│ helpful_answers (INT) Accepted Qs   │
│ badges (ARRAY) ["expert","helper"] │
│ updated_at (TS) Last modified       │
└─────────────────────────────────────┘
```

---

## Vote Logic Decision Tree

```
User clicks vote button on question
    │
    ├─ Get current vote state for this user
    │  └─ userVotes[questionId] = ?
    │
    ├─ User voted upvote before?
    │  │
    │  ├─ YES, clicked upvote again?
    │  │  └─ Toggle OFF: Delete vote (count -1)
    │  │
    │  └─ User voted downvote before?
    │     │
    │     └─ YES, clicked upvote?
    │        └─ Switch: Remove downvote, add upvote
    │           (count recalculates)
    │
    └─ NO previous vote?
       └─ First vote: Insert upvote (count +1)

Result: User can have only ONE vote per item
├─ Upvote
├─ Downvote  ← Choose one or the other
├─ Or no vote at all
└─ (Can't have both upvote AND downvote)
```

---

## Security: Row Level Security (RLS) Policies

```
All tables have RLS enabled:
┌──────────────────────────────────────┐
│ SELECT (Read) Policy                 │
├──────────────────────────────────────┤
│ ALLOW: true (everyone can read)      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ INSERT (Create) Policy               │
├──────────────────────────────────────┤
│ ALLOW: auth.uid()::text = user_id    │
│ = Only you can insert your data      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ UPDATE Policy                        │
├──────────────────────────────────────┤
│ ALLOW: auth.uid()::text = user_id    │
│ = Only you can modify your data      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ DELETE Policy                        │
├──────────────────────────────────────┤
│ ALLOW: auth.uid()::text = user_id    │
│ = Only you can delete your data      │
└──────────────────────────────────────┘
```

---

## File Structure

```
src/
├── pages/
│   ├── Community.tsx              Query questions with filters
│   │                              ↓ Calls communityService
│   │
│   ├── AskQuestion.tsx            Create new question
│   │                              ↓ Calls communityService
│   │
│   └── QuestionDetail.tsx         View question + vote + delete
│                                  ↓ Calls communityService (5x)
│
├── services/
│   └── communityService.ts        All DB operations
│                                  ↓ Calls Supabase API
│
└── context/
    └── AuthContext.tsx            Clerk user context
                                   ↓ Provides user.id
```

---

## Component Flow

```
App.tsx
  │
  ├─ Route: /community
  │  └─ Community.tsx
  │     ├─ Fetch questions
  │     ├─ Show filters/search
  │     └─ Click question → /community/questions/:id
  │
  ├─ Route: /community/ask
  │  └─ AskQuestion.tsx
  │     ├─ Form with validation
  │     └─ Submit → Back to /community
  │
  └─ Route: /community/questions/:id
     └─ QuestionDetail.tsx
        ├─ Load question + answers
        ├─ Vote buttons
        ├─ Delete buttons (if owner)
        ├─ Post answer form
        └─ List of answers with votes
```

---

## Current Issue Visualized

```
Without Migration Deployed:
┌─────────────────────────┐
│ User clicks vote �       │
└────────────┬────────────┘
             │ ✅ UI updates
             ▼
        ┌─────────┐
        │ State   │
        │ Updated │
        │ (Local) │
        └────┬────┘
             │ Optimistic ✅
             │ Button highlights
             │ Count changes
             │
             ├─ Send to Supabase ❌
             │
             ▼
        ┌──────────────┐
        │ Supabase:    │
        │ INSERT into  │
        │ votes        │
        │ table        │
        └──────┬───────┘
               │ ❌ ERROR!
               │ "relation 'votes' 
               │  does not exist"
               │
             ▼
        ┌──────────────┐
        │ User sees:   │
        │ "Failed to   │
        │ vote" error  │
        │              │
        │ Page refresh │
        │ resets to 0  │
        └──────────────┘

With Migration Deployed:
┌─────────────────────────┐
│ User clicks vote �       │
└────────────┬────────────┘
             │ ✅ UI updates
             ▼
        ┌─────────┐
        │ State   │
        │ Updated │
        │ (Local) │
        └────┬────┘
             │ Optimistic ✅
             │ Button highlights
             │ Count changes
             │
             ├─ Send to Supabase ✅
             │
             ▼
        ┌──────────────┐
        │ Supabase:    │
        │ INSERT into  │
        │ votes        │
        │ table        │
        └──────┬───────┘
               │ ✅ SUCCESS!
               │ Vote inserted
               │ Count updated
               │
             ▼
        ┌──────────────┐
        │ User sees:   │
        │ "Vote        │
        │ recorded!"   │
        │              │
        │ Page refresh │
        │ stays same ✅ │
        └──────────────┘
```

---

## Performance Indexes

```
Database creates indexes for fast queries:

1. idx_questions_created_at
   ├─ Speeds up: ORDER BY created_at DESC
   └─ Used by: Community page sorting

2. idx_questions_tags
   ├─ Speeds up: WHERE tags @> ARRAY[?]
   └─ Used by: Tag filtering

3. idx_questions_user_id
   ├─ Speeds up: WHERE user_id = ?
   └─ Used by: Finding user's questions

4. idx_answers_question_id
   ├─ Speeds up: WHERE question_id = ?
   └─ Used by: Loading answers for question

5. idx_votes_user_id
   ├─ Speeds up: WHERE user_id = ?
   └─ Used by: Finding user's votes
```

---

This visualizes the complete system architecture and why the migration deployment is critical! 🚀
