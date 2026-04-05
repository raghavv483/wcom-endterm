import { supabase } from '@/integrations/supabase/client';

// Types
export interface Quiz {
  id: string;
  admin_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  admin_name?: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_index: number;
  order_index: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number | null;
  total_questions: number | null;
  attempted_at: string;
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

// Quiz Operations
export const createQuiz = async (
  adminId: string,
  title: string,
  description: string | null = null
) => {
  try {
    console.log('📝 Creating quiz via REST API with service role key');
    console.log('Quiz data:', { adminId, title, description });
    
    const payload = {
      admin_id: adminId,
      title,
      description,
    };
    
    console.log('📋 Request payload:', JSON.stringify(payload));

    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quizzes`,
      {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(payload),
      }
    );

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', {
      'content-type': response.headers.get('content-type'),
    });

    const responseText = await response.text();
    console.log('📊 Raw response:', responseText);

    if (!response.ok) {
      console.error('❌ Response not OK');
      try {
        const errorData = JSON.parse(responseText);
        console.error('❌ Quiz creation error:', errorData);
        throw new Error(`Failed to create quiz: ${response.status} - ${errorData.message || JSON.stringify(errorData)}`);
      } catch (e) {
        throw new Error(`Failed to create quiz: ${response.status} - ${responseText}`);
      }
    }

    const data = JSON.parse(responseText);
    console.log('✅ Quiz created:', data[0]);
    return data[0];
  } catch (error) {
    console.error('❌ Exception in createQuiz:', error);
    throw error;
  }
};

export const getQuizzesByAdmin = async (adminId: string) => {
  try {
    console.log('📥 Fetching quizzes for admin:', adminId);
    
    const encodedAdminId = encodeURIComponent(adminId);
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quizzes?admin_id=eq.${encodedAdminId}`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Fetch quizzes error:', error);
      throw new Error(`Failed to fetch quizzes: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Quizzes fetched:', data);
    // Sort by created_at descending on client side
    return ((data || []) as Quiz[]).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('❌ Exception in getQuizzesByAdmin:', error);
    throw error;
  }
};

export const getQuizById = async (quizId: string) => {
  try {
    console.log('📥 Fetching quiz by ID:', quizId);
    
    const encodedQuizId = encodeURIComponent(quizId);
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quizzes?id=eq.${encodedQuizId}`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Fetch quiz error:', error);
      throw new Error(`Failed to fetch quiz: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Quiz fetched:', data);
    return data[0] as Quiz;
  } catch (error) {
    console.error('❌ Exception in getQuizById:', error);
    throw error;
  }
};

export const getQuizWithQuestions = async (quizId: string) => {
  try {
    if (!quizId) {
      throw new Error('Quiz ID is required');
    }

    console.log('📥 Fetching quiz with questions:', quizId);
    
    // URL encode the quiz ID
    const encodedQuizId = encodeURIComponent(quizId);
    
    // Fetch quiz
    const quizResponse = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quizzes?id=eq.${encodedQuizId}`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!quizResponse.ok) {
      const errorData = await quizResponse.text();
      console.error('❌ Quiz fetch error:', quizResponse.status, errorData);
      throw new Error(`Failed to fetch quiz: ${quizResponse.status} - ${errorData}`);
    }

    const quizData = await quizResponse.json();
    console.log('✅ Quiz data:', quizData);
    
    if (!quizData || quizData.length === 0) {
      throw new Error('Quiz not found');
    }

    const quiz = quizData[0];

    // Fetch questions - handle gracefully if none exist
    console.log('📥 Fetching questions for quiz:', encodedQuizId);
    let questions: any[] = [];
    
    try {
      const questionsResponse = await fetch(
        `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quiz_questions?quiz_id=eq.${encodedQuizId}`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        questions = questionsData || [];
        console.log('✅ Questions fetched:', questions.length);
      } else if (questionsResponse.status === 404) {
        console.log('⚠️ No questions found (404)');
        questions = [];
      } else {
        const errorData = await questionsResponse.text();
        console.error('❌ Questions fetch error:', questionsResponse.status, errorData);
        questions = [];
      }
    } catch (questionsError) {
      console.error('⚠️ Error fetching questions, continuing without them:', questionsError);
      questions = [];
    }

    // Sort questions by order_index
    const sortedQuestions = questions.sort((a: any, b: any) => 
      (a.order_index || 0) - (b.order_index || 0)
    );

    return {
      ...quiz,
      questions: sortedQuestions || [],
    } as QuizWithQuestions;
  } catch (error) {
    console.error('❌ Exception in getQuizWithQuestions:', error);
    throw error;
  }
};

export const updateQuiz = async (quizId: string, updates: Partial<Quiz>) => {
  try {
    console.log('📝 Updating quiz via REST API:', quizId);
    
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quizzes?id=eq.${quizId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Update quiz error:', error);
      throw new Error(`Failed to update quiz: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Quiz updated');
    return data[0];
  } catch (error) {
    console.error('❌ Exception in updateQuiz:', error);
    throw error;
  }
};

export const deleteQuiz = async (quizId: string) => {
  try {
    console.log('🗑️ Deleting quiz via REST API:', quizId);
    
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quizzes?id=eq.${quizId}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Delete quiz error:', error);
      throw new Error(`Failed to delete quiz: ${response.status}`);
    }

    console.log('✅ Quiz deleted');
  } catch (error) {
    console.error('❌ Exception in deleteQuiz:', error);
    throw error;
  }
};

// Quiz Questions
export const addQuizQuestion = async (
  quizId: string,
  question: string,
  options: string[],
  correctIndex: number,
  orderIndex: number = 0
) => {
  try {
    console.log('📝 Adding quiz question via REST API');
    
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quiz_questions`,
      {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          quiz_id: quizId,
          question,
          options,
          correct_index: correctIndex,
          order_index: orderIndex,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Add question error:', errorData);
      throw new Error(`Failed to add question: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Question added:', data[0]);
    return data[0];
  } catch (error) {
    console.error('❌ Exception in addQuizQuestion:', error);
    throw error;
  }
};

export const updateQuizQuestion = async (
  questionId: string,
  updates: Partial<QuizQuestion>
) => {
  const { data, error } = await supabase
    .from('quiz_questions')
    .update(updates)
    .eq('id', questionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteQuizQuestion = async (questionId: string) => {
  const { error } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('id', questionId);

  if (error) throw error;
};

// Quiz Attempts
export const submitQuizAttempt = async (
  quizId: string,
  userId: string,
  score: number,
  totalQuestions: number
) => {
  try {
    console.log('📝 Submitting quiz attempt via REST API');
    
    const encodedQuizId = encodeURIComponent(quizId);
    const encodedUserId = encodeURIComponent(userId);
    const encodedExistsId = encodeURIComponent(quizId); // Will be set if exists
    
    // First check if attempt exists
    const getResponse = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quiz_attempts?quiz_id=eq.${encodedQuizId}&user_id=eq.${encodedUserId}`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    const existingAttempts = await getResponse.json();
    const existsId = existingAttempts?.[0]?.id;

    let response;
    if (existsId) {
      // Update existing
      const encodedId = encodeURIComponent(existsId);
      response = await fetch(
        `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quiz_attempts?id=eq.${encodedId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ score, total_questions: totalQuestions }),
        }
      );
    } else {
      // Create new
      response = await fetch(
        `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quiz_attempts`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            quiz_id: quizId,
            user_id: userId,
            score,
            total_questions: totalQuestions,
          }),
        }
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Submit attempt error:', errorData);
      throw new Error(`Failed to submit attempt: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Attempt submitted:', data[0]);
    return data[0];
  } catch (error) {
    console.error('❌ Exception in submitQuizAttempt:', error);
    throw error;
  }
};

export const getUserAttemptForQuiz = async (quizId: string, userId: string) => {
  try {
    if (!quizId || !userId) {
      console.log('⚠️ Missing quizId or userId for attempt check');
      return null;
    }

    console.log('📥 Fetching user attempt:', { quizId, userId });
    
    const encodedQuizId = encodeURIComponent(quizId);
    const encodedUserId = encodeURIComponent(userId);
    
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quiz_attempts?quiz_id=eq.${encodedQuizId}&user_id=eq.${encodedUserId}`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // 404 means no record found, which is fine
      if (response.status === 404) {
        console.log('✅ No previous attempt found (404)');
        return null;
      }
      const errorData = await response.text();
      console.error('❌ Attempt fetch error:', response.status, errorData);
      return null; // Return null on any error instead of throwing
    }

    const data = await response.json();
    console.log('✅ Attempt fetched:', data);
    return (data && data.length > 0 ? data[0] : null) as QuizAttempt | null;
  } catch (error) {
    console.error('❌ Exception in getUserAttemptForQuiz:', error);
    return null; // Return null if not found instead of throwing
  }
};

export const getAttemptsByQuiz = async (quizId: string) => {
  try {
    const encodedQuizId = encodeURIComponent(quizId);
    
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quiz_attempts?quiz_id=eq.${encodedQuizId}`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) throw new Error(`Failed to fetch attempts: ${response.status}`);
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('❌ Exception in getAttemptsByQuiz:', error);
    return [];
  }
};

export const getQuizzesForUser = async (userId: string) => {
  try {
    const encodedUserId = encodeURIComponent(userId);
    
    // Get followed admins
    const followResponse = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/follows?follower_id=eq.${encodedUserId}`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!followResponse.ok) throw new Error('Failed to fetch followed admins');
    
    const followedAdminsData = await followResponse.json();
    const adminIds = followedAdminsData?.map((f: any) => f.following_id) || [];

    if (adminIds.length === 0) {
      return [];
    }

    // Get quizzes from all followed admins
    const allQuizzes: Quiz[] = [];
    for (const adminId of adminIds) {
      const quizzes = await getQuizzesByAdmin(adminId);
      allQuizzes.push(...quizzes);
    }

    // Get user's attempts
    const attemptsResponse = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quiz_attempts?user_id=eq.${encodedUserId}`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    const attemptsData = await attemptsResponse.json();
    const attemptedQuizIds = new Set((attemptsData || []).map((a: any) => a.quiz_id));

    return allQuizzes.map((quiz) => ({
      ...quiz,
      attempted: attemptedQuizIds.has(quiz.id),
    }));
  } catch (error) {
    console.error('❌ Exception in getQuizzesForUser:', error);
    return [];
  }
};

export const getQuizStats = async (quizId: string) => {
  try {
    const encodedQuizId = encodeURIComponent(quizId);
    
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quiz_attempts?quiz_id=eq.${encodedQuizId}&select=score,total_questions`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) throw new Error(`Failed to fetch stats: ${response.status}`);

    const attempts = await response.json() || [];
    const totalAttempts = attempts.length;
    const averageScore =
      totalAttempts > 0
        ? Math.round(
            attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / totalAttempts
          )
        : 0;

    return {
      totalAttempts,
      averageScore,
    };
  } catch (error) {
    console.error('❌ Exception in getQuizStats:', error);
    return {
      totalAttempts: 0,
      averageScore: 0,
    };
  }
};
