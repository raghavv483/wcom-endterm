import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, X, Loader } from "lucide-react";
import { createQuestion } from "@/services/communityService";

const AskQuestion = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const availableTags = [
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
    "Modulation",
    "Signal Processing",
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to ask a question");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a question title");
      return;
    }

    if (title.length < 10) {
      toast.error("Title must be at least 10 characters");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (description.length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }

    if (selectedTags.length === 0) {
      toast.error("Please select at least one tag");
      return;
    }

    try {
      setLoading(true);
      await createQuestion(title, description, selectedTags, user.id);
      toast.success("Your question has been posted!");

      // Redirect to community hub
      setTimeout(() => {
        navigate("/community");
      }, 1000);
    } catch (error) {
      console.error("Error posting question:", error);
      toast.error("Failed to post question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Ask a Question</h1>
            <p className="text-slate-300">
              Help the community by sharing your question about wireless communication
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Card className="p-6 bg-slate-800 border-slate-700">
              <label className="block text-white font-semibold mb-3">Question Title</label>
              <Input
                type="text"
                placeholder="What is your question? Be specific..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-12"
              />
              <p className="text-xs text-slate-400 mt-2">
                {title.length}/200 characters
              </p>
            </Card>

            {/* Description */}
            <Card className="p-6 bg-slate-800 border-slate-700">
              <label className="block text-white font-semibold mb-3">
                Description (Details & Context)
              </label>
              <textarea
                placeholder="Provide more context about your question. Include what you've already tried, what you expect, and any relevant code or details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-md p-3 h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-2">
                {description.length}/5000 characters
              </p>
            </Card>

            {/* Tags */}
            <Card className="p-6 bg-slate-800 border-slate-700">
              <label className="block text-white font-semibold mb-3">Tags (Select up to 5)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    type="button"
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-blue-600 text-white ring-2 ring-blue-400"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} className="bg-blue-600 text-white gap-2 py-1 px-3">
                      {tag}
                      <button
                        onClick={() => toggleTag(tag)}
                        type="button"
                        className="hover:bg-blue-700 rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </Card>

            {/* Preview */}
            <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
              <h3 className="text-white font-semibold mb-4">Preview</h3>
              <div className="bg-slate-900 p-4 rounded-lg">
                {title ? (
                  <>
                    <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
                    <p className="text-slate-300 text-sm mb-3">{description || "Your description will appear here..."}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <Badge key={tag} className="bg-blue-900 text-blue-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm">Fill in the title and description to see preview</p>
                )}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Post Question
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => navigate("/community")}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 h-12"
              >
                Cancel
              </Button>
            </div>
          </form>

          {/* Tips */}
          <Card className="mt-8 p-6 bg-blue-900/20 border-blue-700/50">
            <h3 className="text-blue-300 font-semibold mb-2">💡 Tips for a great question:</h3>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Be specific and provide context</li>
              <li>• Include relevant details and examples</li>
              <li>• Describe what you've already tried</li>
              <li>• Use clear and descriptive title</li>
              <li>• Select relevant tags for better visibility</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AskQuestion;
