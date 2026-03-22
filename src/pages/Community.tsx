import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  MessageSquare,
  Eye,
  ThumbsUp,
  Tag,
  TrendingUp,
  Loader,
} from "lucide-react";
import { getQuestions } from "@/services/communityService";

const CommunityHub = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, [searchQuery, selectedTag, sortBy]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await getQuestions({
        searchQuery,
        selectedTag: selectedTag || undefined,
        sortBy,
      });
      setQuestions(data || []);
    } catch (error) {
      console.error("Error loading questions:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };
  const allTags = [
    "5G",
    "4G",
    "LTE",
    "RF",
    "Antennas",
    "MIMO",
    "IoT",
    "Satellite",
    "Bluetooth",
    "WiFi",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between flex-col lg:flex-row gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Community Q&A</h1>
              <p className="text-blue-100">
                Ask questions, share knowledge, and connect with experts in wireless communication
              </p>
            </div>
            <Link to="/community/ask">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 gap-2">
                <Plus className="h-5 w-5" />
                Ask Question
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <Card className="p-4 bg-slate-800 border-slate-700 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
            </Card>

            {/* Sort Options */}
            <Card className="p-4 bg-slate-800 border-slate-700 mb-6">
              <h3 className="font-semibold text-white mb-3">Sort By</h3>
              <div className="space-y-2">
                {[
                  { value: "newest", label: "Newest" },
                  { value: "popular", label: "Most Popular" },
                  { value: "unanswered", label: "Unanswered" },
                  { value: "trending", label: "Trending" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      sortBy === option.value
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Tags Filter */}
            <Card className="p-4 bg-slate-800 border-slate-700">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Popular Tags
              </h3>
              <div className="space-y-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTag === tag
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="p-4 bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
                <div className="text-blue-100 text-sm mb-1">Total Questions</div>
                <div className="text-3xl font-bold text-white">{questions.length}</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
                <div className="text-purple-100 text-sm mb-1">Total Answers</div>
                <div className="text-3xl font-bold text-white">
                  {questions.reduce((sum, q) => sum + (q.answers_count || 0), 0)}
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-indigo-900 to-indigo-800 border-indigo-700">
                <div className="text-indigo-100 text-sm mb-1">Active Users</div>
                <div className="text-3xl font-bold text-white">{new Set(questions.map((q) => q.user_id)).size}</div>
              </Card>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {loading ? (
                <Card className="p-8 bg-slate-800 border-slate-700 text-center">
                  <Loader className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
                  <p className="text-slate-300 mt-2">Loading questions...</p>
                </Card>
              ) : questions.length > 0 ? (
                questions.map((question) => (
                  <Link key={question.id} to={`/community/questions/${question.id}`}>
                    <Card className="p-6 bg-slate-800 border-slate-700 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer">
                      <div className="flex gap-4">
                        {/* Stats Column */}
                        <div className="flex flex-col items-center gap-4 min-w-fit">
                          <div className="text-center">
                            <div className="text-sm text-slate-400">votes</div>
                            <div className="text-2xl font-bold text-blue-400">
                              {(question.upvotes || 0) - (question.downvotes || 0)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-slate-400">answers</div>
                            <div
                              className={`text-2xl font-bold ${
                                question.is_answered ? "text-green-400" : "text-slate-500"
                              }`}
                            >
                              {question.answers_count || 0}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-slate-400">views</div>
                            <div className="text-2xl font-bold text-slate-400">
                              {(question.views_count || 0) / 1000 > 1
                                ? ((question.views_count || 0) / 1000).toFixed(1) + "k"
                                : question.views_count || 0}
                            </div>
                          </div>
                        </div>

                        {/* Content Column */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2 hover:text-blue-400">
                            {question.title}
                          </h3>
                          <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                            {question.description}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {(question.tags || []).map((tag: string) => (
                              <Badge
                                key={tag}
                                className="bg-blue-900 text-blue-200 hover:bg-blue-800"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                {(question.user_id || "U").charAt(0).toUpperCase()}
                              </div>
                              <span>
                                asked by{" "}
                                <span className="text-slate-200">
                                  {question.user_id?.substring(0, 8) || "Anonymous"}
                                </span>
                              </span>
                            </div>
                            <span>
                              {new Date(question.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card className="p-8 bg-slate-800 border-slate-700 text-center">
                  <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-300">No questions found. Try adjusting your filters or be the first to ask!</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
