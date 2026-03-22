import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  CheckCircle,
  ArrowLeft,
  Loader,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getQuestionById,
  getAnswers,
  createAnswer,
  voteOnQuestion,
  voteOnAnswer,
  deleteQuestion,
  deleteAnswer,
} from "@/services/communityService";

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [userVotes, setUserVotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadQuestionAndAnswers();
  }, [id]);

  const loadQuestionAndAnswers = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setQuestion(null);
      setAnswers([]);
      
      // Load question first
      const questionData = await getQuestionById(id);
      setQuestion(questionData);
      
      // Then load answers
      if (questionData && (questionData as any).id) {
        const answersData = await getAnswers((questionData as any).id);
        setAnswers(answersData || []);
      }
    } catch (error) {
      console.error("Error loading question:", error);
      toast.error("Failed to load question");
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return created.toLocaleDateString();
  };

  const getInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
  };

  const handleVote = async (type: "upvote" | "downvote") => {
    if (!user) {
      toast.error("You must be logged in to vote");
      return;
    }
    if (!question) return;

    try {
      const currentVote = userVotes[question.id];
      
      // Optimistically update UI
      let newUpvotes = question.upvotes || 0;
      let newDownvotes = question.downvotes || 0;

      if (currentVote === type) {
        // Toggling off the same vote
        if (type === "upvote") {
          newUpvotes = Math.max(0, newUpvotes - 1);
        } else {
          newDownvotes = Math.max(0, newDownvotes - 1);
        }
        setUserVotes((prev) => {
          const newVotes = { ...prev };
          delete newVotes[question.id];
          return newVotes;
        });
      } else if (currentVote) {
        // Switching vote
        if (currentVote === "upvote") {
          newUpvotes = Math.max(0, newUpvotes - 1);
        } else {
          newDownvotes = Math.max(0, newDownvotes - 1);
        }
        if (type === "upvote") {
          newUpvotes += 1;
        } else {
          newDownvotes += 1;
        }
        setUserVotes((prev) => ({ ...prev, [question.id]: type }));
      } else {
        // First vote
        if (type === "upvote") {
          newUpvotes += 1;
        } else {
          newDownvotes += 1;
        }
        setUserVotes((prev) => ({ ...prev, [question.id]: type }));
      }

      setQuestion((prev: any) => ({
        ...prev,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
      }));

      await voteOnQuestion(question.id, user.id, type);
      toast.success("Vote recorded!");
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
      // Reload to revert optimistic update
      loadQuestionAndAnswers();
    }
  };

  const handleAnswerVote = async (answerId: string, type: "upvote" | "downvote") => {
    if (!user) {
      toast.error("You must be logged in to vote");
      return;
    }

    try {
      const currentVote = userVotes[answerId];
      
      // Optimistically update UI
      setAnswers((prevAnswers) =>
        prevAnswers.map((ans) => {
          if (ans.id !== answerId) return ans;

          let newUpvotes = ans.upvotes || 0;
          let newDownvotes = ans.downvotes || 0;

          if (currentVote === type) {
            // Toggling off the same vote
            if (type === "upvote") {
              newUpvotes = Math.max(0, newUpvotes - 1);
            } else {
              newDownvotes = Math.max(0, newDownvotes - 1);
            }
            setUserVotes((prev) => {
              const newVotes = { ...prev };
              delete newVotes[answerId];
              return newVotes;
            });
          } else if (currentVote) {
            // Switching vote
            if (currentVote === "upvote") {
              newUpvotes = Math.max(0, newUpvotes - 1);
            } else {
              newDownvotes = Math.max(0, newDownvotes - 1);
            }
            if (type === "upvote") {
              newUpvotes += 1;
            } else {
              newDownvotes += 1;
            }
            setUserVotes((prev) => ({ ...prev, [answerId]: type }));
          } else {
            // First vote
            if (type === "upvote") {
              newUpvotes += 1;
            } else {
              newDownvotes += 1;
            }
            setUserVotes((prev) => ({ ...prev, [answerId]: type }));
          }

          return {
            ...ans,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
          };
        })
      );

      await voteOnAnswer(answerId, user.id, type);
      toast.success("Vote recorded!");
    } catch (error) {
      console.error("Error voting on answer:", error);
      toast.error("Failed to vote");
      // Reload to revert optimistic update
      loadQuestionAndAnswers();
    }
  };

  const handleDeleteQuestion = async () => {
    if (!user || user.id !== question.user_id) {
      toast.error("You can only delete your own questions");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      await deleteQuestion(question.id);
      toast.success("Question deleted successfully");
      navigate("/community");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const handleDeleteAnswer = async (answerId: string, answerUserId: string) => {
    if (!user || user.id !== answerUserId) {
      toast.error("You can only delete your own answers");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this answer?")) {
      return;
    }

    try {
      await deleteAnswer(answerId, question.id);
      setAnswers((prev) => prev.filter((ans) => ans.id !== answerId));
      toast.success("Answer deleted successfully");
    } catch (error) {
      console.error("Error deleting answer:", error);
      toast.error("Failed to delete answer");
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to post an answer");
      return;
    }
    if (!answer.trim() || answer.length < 10) {
      toast.error("Answer must be at least 10 characters");
      return;
    }
    if (!question) return;

    try {
      setSubmittingAnswer(true);
      const newAnswer = await createAnswer(question.id, answer, user.id);
      
      // Add the new answer to the list immediately
      setAnswers((prev) => [newAnswer, ...prev]);
      
      // Update question's answer count
      setQuestion((prev: any) => ({
        ...prev,
        answers_count: (prev.answers_count || 0) + 1,
      }));
      
      // Clear form and close it
      setAnswer("");
      setShowAnswerForm(false);
      toast.success("Answer posted successfully!");
    } catch (error) {
      console.error("Error posting answer:", error);
      toast.error("Failed to post answer");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 py-8">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/community")}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Community
        </button>

        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-96 gap-4">
            <Loader className="h-12 w-12 text-blue-400 animate-spin" />
            <p className="text-slate-300">Loading question...</p>
          </div>
        ) : !question ? (
          <Card className="p-8 bg-slate-800 border-slate-700 text-center">
            <p className="text-slate-300">Question not found</p>
            <Button onClick={() => navigate("/community")} className="mt-4">
              Back to Community
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Question */}
                <Card className="p-8 bg-slate-800 border-slate-700 mb-8">
                  <div className="flex gap-4">
                    {/* Vote Buttons */}
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleVote("upvote")}
                        className={`transition-colors ${
                          userVotes[question.id] === "upvote"
                            ? "text-blue-400 bg-slate-700"
                            : "text-slate-400 hover:text-blue-400 hover:bg-slate-700"
                        }`}
                      >
                        <ThumbsUp className="h-6 w-6" />
                      </Button>
                      <span className="text-xl font-semibold text-slate-300">
                        {(question.upvotes || 0) - (question.downvotes || 0)}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleVote("downvote")}
                        className={`transition-colors ${
                          userVotes[question.id] === "downvote"
                            ? "text-red-400 bg-slate-700"
                            : "text-slate-400 hover:text-red-400 hover:bg-slate-700"
                        }`}
                      >
                        <ThumbsDown className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-white">{question.title}</h1>
                        {question.is_answered && (
                          <Badge className="bg-green-900 text-green-200 gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Answered
                          </Badge>
                        )}
                      </div>

                      <p className="text-slate-300 whitespace-pre-line mb-6">
                        {question.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {question.tags?.map((tag: string) => (
                          <Badge key={tag} className="bg-blue-900 text-blue-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {getInitials(question.user_id)}
                          </div>
                          <div>
                            <p className="text-white font-semibold">
                              {question.user_id.substring(0, 8)}
                            </p>
                            <p className="text-xs text-slate-400">
                              asked {formatDate(question.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-slate-200"
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                          {user?.id === question.user_id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleDeleteQuestion}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Answers */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {answers.length} Answers
                  </h2>

                  <div className="space-y-4 mb-8">
                    {answers.map((ans) => (
                      <Card key={ans.id} className="p-6 bg-slate-800 border-slate-700">
                        <div className="flex gap-4">
                          {/* Vote Buttons */}
                          <div className="flex flex-col items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleAnswerVote(ans.id, "upvote")}
                              className={`transition-colors ${
                                userVotes[ans.id] === "upvote"
                                  ? "text-blue-400 bg-slate-700"
                                  : "text-slate-400 hover:text-blue-400 hover:bg-slate-700"
                              }`}
                            >
                              <ThumbsUp className="h-5 w-5" />
                            </Button>
                            <span className="text-lg font-semibold text-slate-300">
                              {(ans.upvotes || 0) - (ans.downvotes || 0)}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleAnswerVote(ans.id, "downvote")}
                              className={`transition-colors ${
                                userVotes[ans.id] === "downvote"
                                  ? "text-red-400 bg-slate-700"
                                  : "text-slate-400 hover:text-red-400 hover:bg-slate-700"
                              }`}
                            >
                              <ThumbsDown className="h-5 w-5" />
                            </Button>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            {ans.is_accepted && (
                              <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded-lg flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-400" />
                                <span className="text-sm text-green-300">
                                  Accepted Answer
                                </span>
                              </div>
                            )}

                            <p className="text-slate-200 whitespace-pre-line mb-4">
                              {ans.content}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                  {getInitials(ans.user_id)}
                                </div>
                                <div>
                                  <p className="text-white font-semibold text-sm">
                                    {ans.user_id.substring(0, 8)}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {formatDate(ans.created_at)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-slate-400 hover:text-slate-200"
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Comment
                                </Button>
                                {user?.id === ans.user_id && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteAnswer(ans.id, ans.user_id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Answer Form */}
                  {!showAnswerForm ? (
                    <Button
                      onClick={() => setShowAnswerForm(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Post Your Answer
                    </Button>
                  ) : (
                    <Card className="p-6 bg-slate-800 border-slate-700">
                      <h3 className="text-white font-semibold mb-4">Your Answer</h3>
                      <form onSubmit={handleSubmitAnswer}>
                        <textarea
                          placeholder="Write your answer here..."
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-md p-3 h-40 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={submittingAnswer}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {submittingAnswer ? (
                              <>
                                <Loader className="h-4 w-4 mr-2 animate-spin" />
                                Posting...
                              </>
                            ) : (
                              "Post Answer"
                            )}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowAnswerForm(false)}
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Card>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Question Stats */}
                <Card className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 mb-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-slate-400 text-sm">Views</p>
                      <p className="text-2xl font-bold text-white">
                        {question.views_count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Created</p>
                      <p className="text-white">{formatDate(question.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Active</p>
                      <p className="text-white">{formatDate(question.updated_at)}</p>
                    </div>
                  </div>
                </Card>

                {/* Related Questions */}
                <Card className="p-4 bg-slate-800 border-slate-700">
                  <h3 className="text-white font-semibold mb-3">Question Info</h3>
                  <div className="space-y-2">
                    <p className="text-slate-300 text-sm">
                      <strong>Tags:</strong> {question.tags?.join(", ") || "No tags"}
                    </p>
                    <p className="text-slate-300 text-sm">
                      <strong>Asked by:</strong> {question.user_id.substring(0, 8)}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;
