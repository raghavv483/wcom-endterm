# Quiz Tags & Topic Analytics Feature

## Overview
This feature adds the ability to tag questions with topics and provides advanced analytics on the stats page to identify strong and weak topics.

## What's New

### 1. **Question Tags in Admin Quiz Builder**
- When creating quizzes, admins can now add tags to each question
- Tags represent topics (e.g., "Arrays", "Sorting", "Dynamic Programming")
- Tags are entered in an input field and can be added by pressing Enter or clicking the + button
- Click on a tag to remove it

### 2. **Enhanced Stats Page with Topic Analytics**
The quiz stats page now displays:

#### Strong Topics Section (Green)
- Shows topics where users scored 70% or higher
- Displays accuracy percentage and correct/total responses
- Sorted by highest accuracy first

#### Weak Topics Section (Red)
- Shows topics where users scored below 70%
- Displays accuracy percentage and correct/total responses
- Sorted by lowest accuracy first

#### Topic Performance Overview
- Visual progress bar for each topic
- Shows overall accuracy rate for each topic
- Helps identify which areas need improvement

### 3. **Question Response Tracking**
- Individual question responses are now tracked in the `question_responses` table
- Records which users answered which questions correctly
- Enables detailed topic-based analytics

## Database Changes

### New Column
- `tags` (TEXT[]) - Added to `quiz_questions` table to store topic tags

### New Table: `question_responses`
```sql
CREATE TABLE question_responses (
  id UUID PRIMARY KEY,
  quiz_id UUID,
  question_id UUID,
  attempt_id UUID,
  user_id UUID,
  selected_index INT,
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ
)
```

## How to Use

### For Admins (Creating Quizzes)
1. Go to Admin Dashboard → Create New Quiz
2. Add a question with title, options, and correct answer
3. **NEW:** Expand the Question section to see "Topic Tags"
4. Enter tags separated by topics (e.g., "Arrays", "Sorting")
5. Press Enter or click + to add each tag
6. Click on a tag to remove it
7. Create the quiz as normal

### For Admins (Viewing Stats)
1. Go to Admin Dashboard
2. Click "Stats" on any quiz
3. **NEW:** Scroll down to see "Topic Performance Analysis"
4. View strong topics (what users are doing well on)
5. View weak topics (what needs improvement)
6. Use this data to:
   - Provide additional resources for weak topics
   - Adjust teaching focus areas
   - Identify curriculum gaps

## Implementation Details

### Updated Files

#### Frontend Components
1. **src/components/QuizBuilder.tsx**
   - Added `tags` field to `QuestionInput` interface
   - Added tag input UI with Enter key support
   - Added `addTag()` and `removeTag()` functions
   - Pass tags to `addQuizQuestion()`

2. **src/components/QuizAttempt.tsx**
   - Updated to track individual question responses
   - Imports `submitQuestionResponse` function
   - Submits both attempt score and individual responses

3. **src/pages/QuizStats.tsx**
   - Added `topicStats` state
   - Fetches and displays topic analytics
   - Shows strong/weak topics sections
   - Displays topic performance overview chart

#### Services
1. **src/services/quizService.ts**
   - Updated `QuizQuestion` interface with optional `tags`
   - Modified `addQuizQuestion()` to accept and save tags
   - Added `submitQuestionResponse()` - saves individual answers
   - Added `getTopicStats()` - calculates stats by topic
   - Added `getQuizTopics()` - retrieves all topics for a quiz

#### Database
1. **supabase/migrations/004_add_tags_and_responses.sql**
   - Adds `tags` column to `quiz_questions`
   - Creates `question_responses` table
   - Sets up RLS policies for security
   - Creates indexes for performance

## Deployment Steps

1. **Apply Database Migration**
   ```bash
   # Run the SQL migration file to add tags column and question_responses table
   # In Supabase: SQL Editor → Copy and run the SQL from 004_add_tags_and_responses.sql
   ```

2. **Verify Database Changes**
   - Check that `quiz_questions` table has `tags` column
   - Check that `question_responses` table exists

3. **Redeploy Frontend**
   - All code changes are backward compatible
   - Old quizzes will work (tags will be empty arrays)
   - New quizzes can use tags

## Features & Statistics

### Metrics Provided
- **Topic Accuracy**: Percentage of correct answers per topic
- **Topic Volume**: Number of questions attempted per topic
- **Strong Topics**: Topics where accuracy ≥ 70%
- **Weak Topics**: Topics where accuracy < 70%

### Use Cases
1. **Curriculum Planning**: Identify topics needing more coverage
2. **Student Support**: Provide targeted help for weak topics
3. **Performance Tracking**: Monitor improvement over time
4. **Resource Allocation**: Focus resources on struggling topics

## Example Workflow

### Create Quiz with Tags
```
Quiz: "Data Structures 101"

Q1: "What is an array?"
- Tags: Arrays, BasicConcepts
- Correct: Option A

Q2: "Sort this array"
- Tags: Arrays, Sorting, Algorithms
- Correct: Option B
```

### View Analysis
After students take the quiz, the stats page shows:
- **Strong Topics**: "BasicConcepts (100%)", "Arrays (85%)"
- **Weak Topics**: "Sorting (60%)", "Algorithms (55%)"

## Backward Compatibility
- Old quizzes without tags will still work
- Tags are optional - leaving them empty is fine
- Existing statistics continue to work as expected
- New functionality only activates when tags are present

## Performance Notes
- Tags are indexed with GIN for fast queries
- Question responses are indexed by quiz, question, attempt, and user
- Topic stats calculation is optimized for large datasets
- No impact on existing quiz functionality

## Future Enhancements
- Filter quizzes by topic
- Student learning paths based on weak topics
- Topic-based recommendations
- Historical topic performance trends
- Heatmaps showing topic difficulty
