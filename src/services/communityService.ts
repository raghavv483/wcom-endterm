import { supabase } from "@/integrations/supabase/client";

// Questions
export const getQuestions = async (filters?: {
  searchQuery?: string;
  selectedTag?: string;
  sortBy?: string;
}) => {
  let query = supabase.from("questions").select("*");

  if (filters?.selectedTag) {
    query = query.contains("tags", [filters.selectedTag]);
  }

  if (filters?.searchQuery) {
    query = query.or(
      `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
    );
  }

  // Sort options
  if (filters?.sortBy === "popular") {
    query = query.order("upvotes", { ascending: false });
  } else if (filters?.sortBy === "unanswered") {
    query = query.eq("is_answered", false);
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getQuestionById = async (id: string) => {
  // Get question
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  // Calculate total votes from votes table
  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("vote_type")
    .eq("voteable_id", id)
    .eq("voteable_type", "question");

  if (!votesError && votes) {
    let upvotes = 0;
    let downvotes = 0;
    votes.forEach((v: any) => {
      if (v.vote_type === "upvote") upvotes++;
      else if (v.vote_type === "downvote") downvotes++;
    });
    return { ...data, upvotes, downvotes };
  }

  return data;
};

export const createQuestion = async (
  title: string,
  description: string,
  tags: string[],
  userId: string
) => {
  const { data, error } = await supabase.from("questions").insert({
    title,
    description,
    tags,
    user_id: userId,
  }).select();

  if (error) throw error;
  return data?.[0] || data;
};

export const updateQuestion = async (
  id: string,
  updates: {
    title?: string;
    description?: string;
    tags?: string[];
  }
) => {
  const { data, error } = await supabase
    .from("questions")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
  return data;
};

export const deleteQuestion = async (id: string) => {
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw error;
};

export const incrementViewCount = async (id: string) => {
  const { error } = await supabase.rpc("increment_views", { question_id: id });
  if (error) console.error("Error incrementing views:", error);
};

// Answers
export const getAnswers = async (questionId: string) => {
  const { data, error } = await supabase
    .from("answers")
    .select("*")
    .eq("question_id", questionId)
    .order("is_accepted", { ascending: false })
    .order("upvotes", { ascending: false });

  if (error) throw error;

  // Calculate total votes for each answer
  if (data && data.length > 0) {
    const answersWithVotes = await Promise.all(
      data.map(async (answer) => {
        const { data: votes, error: votesError } = await supabase
          .from("votes")
          .select("vote_type")
          .eq("voteable_id", answer.id)
          .eq("voteable_type", "answer");

        if (!votesError && votes) {
          let upvotes = 0;
          let downvotes = 0;
          votes.forEach((v: any) => {
            if (v.vote_type === "upvote") upvotes++;
            else if (v.vote_type === "downvote") downvotes++;
          });
          return { ...answer, upvotes, downvotes };
        }
        return answer;
      })
    );
    return answersWithVotes;
  }
  return data;
};

export const createAnswer = async (
  questionId: string,
  content: string,
  userId: string
) => {
  const { data, error } = await supabase.from("answers").insert({
    question_id: questionId,
    content,
    user_id: userId,
  }).select();

  if (error) throw error;

  // Update question's answer count
  await supabase.rpc("increment_answers", { question_id: questionId });

  return data?.[0] || data;
};

export const updateAnswer = async (id: string, content: string) => {
  const { data, error } = await supabase
    .from("answers")
    .update({ content })
    .eq("id", id);

  if (error) throw error;
  return data;
};

export const deleteAnswer = async (id: string, questionId: string) => {
  const { error } = await supabase.from("answers").delete().eq("id", id);
  if (error) throw error;

  // Decrement question's answer count
  await supabase.rpc("decrement_answers", { question_id: questionId });
};

export const acceptAnswer = async (answerId: string, questionId: string) => {
  // First, unaccept any previously accepted answer
  await supabase
    .from("answers")
    .update({ is_accepted: false })
    .eq("question_id", questionId);

  // Then accept the new answer
  const { data, error } = await supabase
    .from("answers")
    .update({ is_accepted: true })
    .eq("id", answerId);

  if (error) throw error;

  // Mark question as answered
  await supabase.from("questions").update({ is_answered: true }).eq("id", questionId);

  return data;
};

// Comments
export const getComments = async (answerId: string) => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("answer_id", answerId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};

export const createComment = async (
  answerId: string,
  content: string,
  userId: string
) => {
  const { data, error } = await supabase.from("comments").insert({
    answer_id: answerId,
    content,
    user_id: userId,
  });

  if (error) throw error;
  return data;
};

export const deleteComment = async (id: string) => {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
};

// Votes
export const voteOnQuestion = async (
  questionId: string,
  userId: string,
  voteType: "upvote" | "downvote"
) => {
  try {
    // Simple approach: Just try to delete existing vote, then insert new one
    // Delete won't error even if no vote exists
    await supabase
      .from("votes")
      .delete()
      .eq("user_id", userId)
      .eq("voteable_id", questionId);

    // Insert new vote
    const { error } = await supabase.from("votes").insert({
      user_id: userId,
      voteable_id: questionId,
      voteable_type: "question",
      vote_type: voteType,
    });

    if (error) {
      console.error("Insert vote error:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Vote on question error:", error);
    throw error;
  }
};

export const voteOnAnswer = async (
  answerId: string,
  userId: string,
  voteType: "upvote" | "downvote"
) => {
  try {
    // Simple approach: Just try to delete existing vote, then insert new one
    // Delete won't error even if no vote exists
    await supabase
      .from("votes")
      .delete()
      .eq("user_id", userId)
      .eq("voteable_id", answerId);

    // Insert new vote
    const { error } = await supabase.from("votes").insert({
      user_id: userId,
      voteable_id: answerId,
      voteable_type: "answer",
      vote_type: voteType,
    });

    if (error) {
      console.error("Insert vote error:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Vote on answer error:", error);
    throw error;
  }
};

// Reputation
export const getUserReputation = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_reputation")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

export const updateUserReputation = async (
  userId: string,
  updates: {
    reputation_score?: number;
    questions_asked?: number;
    questions_answered?: number;
    helpful_answers?: number;
    badges?: string[];
  }
) => {
  const { data, error } = await supabase
    .from("user_reputation")
    .upsert({
      user_id: userId,
      ...updates,
      updated_at: new Date(),
    })
    .eq("user_id", userId);

  if (error) throw error;
  return data;
};
