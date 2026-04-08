import { supabase } from '@/integrations/supabase/client';

// Types
export interface Quiz {
  id: string;
  admin_id: string;
  title: string;
  description: string | null;
  passing_percentage?: number;
  instructions?: string | null;
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
  tags?: string[];
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
  description: string | null = null,
  passingPercentage: number = 70,
  instructions: string | null = null
) => {
  try {
    console.log('📝 Creating quiz via REST API with service role key');
    console.log('Quiz data:', { adminId, title, description, passingPercentage, instructions });
    
    const payload = {
      admin_id: adminId,
      title,
      description,
      passing_percentage: passingPercentage,
      instructions,
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
  orderIndex: number = 0,
  tags: string[] = []
) => {
  try {
    console.log('📝 Adding quiz question via REST API');
    console.log('  Question:', question.substring(0, 50) + '...');
    console.log('  Tags passed:', tags);
    
    // Build payload - ALWAYS include tags (even if empty array)
    const payload: any = {
      quiz_id: quizId,
      question,
      options,
      correct_index: correctIndex,
      order_index: orderIndex,
      tags: tags && tags.length > 0 ? tags : [], // Always include tags field
    };

    console.log('  Final payload tags:', payload.tags);
    
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
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Add question error:', errorData);
      throw new Error(`Failed to add question: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Question added with tags:', data[0]?.tags);
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

// Submit individual question response
export const submitQuestionResponse = async (
  quizId: string,
  questionId: string,
  attemptId: string,
  userId: string,
  selectedIndex: number,
  isCorrect: boolean
) => {
  try {
    console.log('📝 Submitting question response');
    
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/question_responses`,
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
          question_id: questionId,
          attempt_id: attemptId,
          user_id: userId,
          selected_index: selectedIndex,
          is_correct: isCorrect,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Submit response error:', errorData);
      throw new Error(`Failed to submit response: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Response submitted');
    return data[0];
  } catch (error) {
    console.error('❌ Exception in submitQuestionResponse:', error);
    throw error;
  }
};

// Get topic stats for a quiz
export const getTopicStats = async (quizId: string) => {
  try {
    console.log('📊 Fetching topic stats for quiz:', quizId);
    
    const encodedQuizId = encodeURIComponent(quizId);
    
    // Step 1: Get all questions with their tags and correct answers
    console.log('📥 Step 1: Fetching questions...');
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

    if (!questionsResponse.ok) {
      console.warn('⚠️ Could not fetch questions');
      return [];
    }

    const questions = await questionsResponse.json() || [];
    console.log(`✅ Questions fetched: ${questions.length}`);

    // Filter questions that have tags
    const questionsWithTags = questions.filter((q: any) => q.tags && q.tags.length > 0);
    console.log(`✅ Questions with tags: ${questionsWithTags.length}`);

    if (questionsWithTags.length === 0) {
      console.log('ℹ️ No questions with tags found');
      return [];
    }

    // Step 2: Get all responses for this quiz
    console.log('📥 Step 2: Fetching responses...');
    let responses: any[] = [];
    try {
      const responsesResponse = await fetch(
        `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/question_responses?quiz_id=eq.${encodedQuizId}`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (responsesResponse.ok) {
        responses = await responsesResponse.json() || [];
        console.log(`✅ Responses fetched: ${responses.length}`);
      } else {
        console.warn('⚠️ Could not fetch responses - table may not exist yet');
        return [];
      }
    } catch (error) {
      console.warn('⚠️ Error fetching responses:', error);
      return [];
    }

    if (responses.length === 0) {
      console.log('ℹ️ No responses yet - wait for users to complete quizzes');
      return [];
    }

    // Step 3: Calculate topic statistics
    console.log('📊 Step 3: Calculating topic statistics...');
    const topicStats: { [key: string]: { correct: number; total: number } } = {};

    // For each question with tags
    questionsWithTags.forEach((question: any) => {
      // Get all responses for this question
      const questionResponses = responses.filter((r: any) => r.question_id === question.id);
      
      if (questionResponses.length > 0) {
        // Count correct responses
        const correctCount = questionResponses.filter((r: any) => r.is_correct).length;
        
        // Add to each tag's stats
        question.tags.forEach((tag: string) => {
          if (!topicStats[tag]) {
            topicStats[tag] = { correct: 0, total: 0 };
          }
          topicStats[tag].total += questionResponses.length;
          topicStats[tag].correct += correctCount;
        });

        console.log(`Question "${question.question.substring(0, 30)}..." - Tags: ${question.tags.join(', ')} - Correct: ${correctCount}/${questionResponses.length}`);
      }
    });

    // Convert to array with percentages
    const result = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      correct: stats.correct,
      total: stats.total,
      percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }));

    console.log('✅ Final topic stats:', result);
    return result.sort((a, b) => b.percentage - a.percentage);
  } catch (error) {
    console.error('❌ Exception in getTopicStats:', error);
    return [];
  }
};

// Get all unique topics for a quiz
export const getQuizTopics = async (quizId: string) => {
  try {
    console.log('📊 Fetching topics for quiz:', quizId);
    
    const encodedQuizId = encodeURIComponent(quizId);
    
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quiz_questions?quiz_id=eq.${encodedQuizId}&select=tags`,
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
      throw new Error(`Failed to fetch questions: ${response.status}`);
    }

    const questions = await response.json() || [];
    
    // Collect all unique topics
    const topics = new Set<string>();
    questions.forEach((question: any) => {
      if (question.tags && Array.isArray(question.tags)) {
        question.tags.forEach((tag: string) => topics.add(tag));
      }
    });

    return Array.from(topics).sort();
  } catch (error) {
    console.error('❌ Exception in getQuizTopics:', error);
    return [];
  }
};

// Get user's attempt results with question details
export const getUserAttemptResults = async (quizId: string, userId: string) => {
  try {
    console.log('📊 Fetching user attempt results:', { quizId, userId });
    
    const encodedQuizId = encodeURIComponent(quizId);
    const encodedUserId = encodeURIComponent(userId);

    // Get the quiz with questions
    const quiz = await getQuizWithQuestions(quizId);

    // Get user's attempt
    const attemptResponse = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/quiz_attempts?quiz_id=eq.${encodedQuizId}&user_id=eq.${encodedUserId}&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!attemptResponse.ok) {
      throw new Error(`Failed to fetch attempt: ${attemptResponse.status}`);
    }

    const attempts = await attemptResponse.json() || [];
    if (attempts.length === 0) return null;

    const attempt = attempts[0];
    const attemptId = attempt.id;

    // Try to get individual responses
    let responses: any[] = [];
    try {
      const responsesResponse = await fetch(
        `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/question_responses?attempt_id=eq.${encodeURIComponent(attemptId)}&select=*`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (responsesResponse.ok) {
        responses = await responsesResponse.json() || [];
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch individual responses:', error);
    }

    // Build detailed results with question info
    const detailedResults = quiz.questions.map((question) => {
      const response = responses.find((r: any) => r.question_id === question.id);
      return {
        questionId: question.id,
        questionText: question.question,
        options: question.options,
        correctIndex: question.correct_index,
        userSelectedIndex: response?.selected_index ?? -1,
        isCorrect: response?.is_correct ?? false,
        tags: question.tags || [],
      };
    });

    return {
      attempt,
      quiz,
      detailedResults,
    };
  } catch (error) {
    console.error('❌ Exception in getUserAttemptResults:', error);
    return null;
  }
};

// Get all responses for a quiz (admin view)
export const getQuizResponses = async (quizId: string) => {
  try {
    console.log('📊 Fetching all quiz responses:', quizId);
    
    const encodedQuizId = encodeURIComponent(quizId);

    // Get quiz with questions
    const quiz = await getQuizWithQuestions(quizId);

    // Try to get all responses for this quiz
    let responses: any[] = [];
    try {
      const responsesResponse = await fetch(
        `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/question_responses?quiz_id=eq.${encodedQuizId}&select=*`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (responsesResponse.ok) {
        responses = await responsesResponse.json() || [];
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch responses:', error);
    }

    // Group responses by user and question
    const responsesByUser: { [userId: string]: any[] } = {};
    const responsesByQuestion: { [questionId: string]: any[] } = {};

    responses.forEach((response) => {
      if (!responsesByUser[response.user_id]) {
        responsesByUser[response.user_id] = [];
      }
      responsesByUser[response.user_id].push(response);

      if (!responsesByQuestion[response.question_id]) {
        responsesByQuestion[response.question_id] = [];
      }
      responsesByQuestion[response.question_id].push(response);
    });

    return {
      quiz,
      responses,
      responsesByUser,
      responsesByQuestion,
      totalResponses: responses.length,
    };
  } catch (error) {
    console.error('❌ Exception in getQuizResponses:', error);
    return {
      quiz: null,
      responses: [],
      responsesByUser: {},
      responsesByQuestion: {},
      totalResponses: 0,
    };
  }
};

// Get responses for a specific question (admin view)
export const getQuestionResponses = async (questionId: string) => {
  try {
    console.log('📊 Fetching responses for question:', questionId);
    
    const encodedQuestionId = encodeURIComponent(questionId);

    let responses: any[] = [];
    try {
      const responsesResponse = await fetch(
        `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/question_responses?question_id=eq.${encodedQuestionId}&select=*`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (responsesResponse.ok) {
        responses = await responsesResponse.json() || [];
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch responses:', error);
    }

    // Calculate stats
    const correct = responses.filter((r) => r.is_correct).length;
    const total = responses.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Count answer distribution
    const answerDistribution: { [key: number]: number } = {};
    responses.forEach((response) => {
      const idx = response.selected_index;
      if (idx !== null && idx !== undefined) {
        answerDistribution[idx] = (answerDistribution[idx] || 0) + 1;
      }
    });

    return {
      responses,
      correct,
      total,
      accuracy,
      answerDistribution,
    };
  } catch (error) {
    console.error('❌ Exception in getQuestionResponses:', error);
    return {
      responses: [],
      correct: 0,
      total: 0,
      accuracy: 0,
      answerDistribution: {},
    };
  }
};

// Get user names for a list of user IDs
export const getUserNames = async (userIds: string[]) => {
  try {
    if (!userIds || userIds.length === 0) return {};

    console.log('👥 Fetching user names for:', userIds.length, 'users');
    
    // Build query for all user IDs
    const userIdList = userIds.map(id => encodeURIComponent(id)).join('&id=eq.');
    
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/users?id=eq.${userIdList}&select=id,username`,
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
      console.warn('⚠️ Failed to fetch user names');
      return {};
    }

    const users = await response.json() || [];
    
    // Create map of user_id to username
    const userMap: { [key: string]: string } = {};
    users.forEach((user: any) => {
      userMap[user.id] = user.username || user.id;
    });

    return userMap;
  } catch (error) {
    console.error('❌ Error fetching user names:', error);
    return {};
  }
};
