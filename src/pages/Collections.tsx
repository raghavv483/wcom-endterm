import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  BookmarkPlus, 
  Folder, 
  Video, 
  Sparkles, 
  Loader2, 
  Trash2, 
  Edit, 
  Eye,
  PlayCircle
} from "lucide-react";

interface Video {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
  topic: string;
  views?: number;
  likes?: number;
  comments?: number;
  confidence?: number;
  difficulty?: string;
  uploadDate?: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  videos: Video[];
  createdAt: string;
  color: string;
}

const COLORS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-blue-500",
  "from-pink-500 to-rose-500",
];

export default function Collections() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);

  // Load collections from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("wavelearn-collections");
    if (saved) {
      try {
        setCollections(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading collections:", error);
      }
    }
  }, []);

  // Save collections to localStorage
  useEffect(() => {
    if (collections.length > 0) {
      localStorage.setItem("wavelearn-collections", JSON.stringify(collections));
    }
  }, [collections]);

  const generateAISuggestions = async () => {
    setLoadingAI(true);
    try {
      const GROQ_URL = import.meta.env.VITE_GROQ_API_URL;
      const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

      if (!GROQ_URL || !GROQ_KEY) {
        throw new Error("GROQ API configuration missing");
      }

      const prompt = `Generate 5 creative and professional collection names for organizing wireless communication educational videos. 
      
Examples of good names:
- "5G Mastery Journey"
- "RF Fundamentals Toolkit"
- "Exam Prep Arsenal"
- "Antenna Theory Deep Dive"
- "IoT Protocol Library"

Respond with ONLY a JSON array of 5 strings, no additional text:
["name1", "name2", "name3", "name4", "name5"]`;

      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a creative naming expert for educational content. Always respond with valid JSON only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.9,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        throw new Error(`GROQ API error: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "";

      // Clean and parse JSON
      const cleanJson = content.replace(/```json\n?|```\n?/g, "").trim();
      const suggestions = JSON.parse(cleanJson);

      setAiSuggestions(Array.isArray(suggestions) ? suggestions : []);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      // Fallback suggestions
      setAiSuggestions([
        "5G Technology Collection",
        "RF Engineering Essentials",
        "Wireless Protocols Master",
        "Network Architecture Guide",
        "Communication Systems Pro",
      ]);
    } finally {
      setLoadingAI(false);
    }
  };

  const createCollection = () => {
    if (!newCollectionName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a collection name",
        variant: "destructive",
      });
      return;
    }

    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newCollectionName,
      description: newCollectionDescription,
      videos: [],
      createdAt: new Date().toISOString(),
      color: COLORS[collections.length % COLORS.length],
    };

    setCollections([...collections, newCollection]);
    setShowCreateDialog(false);
    setNewCollectionName("");
    setNewCollectionDescription("");
    setAiSuggestions([]);

    toast({
      title: "Collection created!",
      description: `"${newCollectionName}" is ready for videos`,
    });
  };

  const deleteCollection = (id: string) => {
    setCollections(collections.filter((c) => c.id !== id));
    setDeleteDialogOpen(false);
    setCollectionToDelete(null);
    toast({
      title: "Collection deleted",
      description: "Collection has been removed",
    });
  };

  const openCreateDialog = () => {
    setShowCreateDialog(true);
    generateAISuggestions();
  };

  const confirmDelete = (id: string) => {
    setCollectionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const viewCollection = (collection: Collection) => {
    navigate(`/collection/${collection.id}`);
  };
  return (
    <div className="min-h-screen p-6 lg:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold wave-gradient-text mb-2">My Collections</h1>
            <p className="text-muted-foreground">
              {collections.length === 0 
                ? "Organize your learning materials"
                : `${collections.length} ${collections.length === 1 ? "collection" : "collections"} • ${collections.reduce((sum, c) => sum + c.videos.length, 0)} videos`
              }
            </p>
          </div>
          <Button className="wave-gradient gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            New Collection
          </Button>
        </div>

        {/* Collections Grid or Empty State */}
        {collections.length === 0 ? (
          <>
            {/* Empty State */}
            <Card className="p-12 glass-card text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full wave-gradient flex items-center justify-center">
                  <Folder className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Create Your First Collection</h3>
                <p className="text-muted-foreground">
                  Organize videos into custom playlists like "Exam Prep", "Antenna Deep Dive", 
                  or "5G Fundamentals"
                </p>
                <div className="flex gap-2 justify-center pt-4">
                  <Button className="wave-gradient gap-2" onClick={openCreateDialog}>
                    <Plus className="h-4 w-4" />
                    Create Collection
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => navigate("/videos")}>
                    <Video className="h-4 w-4" />
                    Browse Videos
                  </Button>
                </div>
              </div>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 glass-card">
                <BookmarkPlus className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Quick Save</h3>
                <p className="text-sm text-muted-foreground">
                  Save videos with one click while watching
                </p>
              </Card>
              <Card className="p-6 glass-card">
                <Folder className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Smart Organization</h3>
                <p className="text-sm text-muted-foreground">
                  Auto-tag videos by topic and difficulty
                </p>
              </Card>
              <Card className="p-6 glass-card">
                <Video className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Progress Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Track completion across collections
                </p>
              </Card>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Card key={collection.id} className="glass-card hover-lift group overflow-hidden">
                <div className={`h-3 bg-gradient-to-r ${collection.color}`} />
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {collection.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {collection.description || "No description"}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      {collection.videos.length} {collection.videos.length === 1 ? "video" : "videos"}
                    </div>
                    <div className="flex items-center gap-1">
                      <PlayCircle className="h-4 w-4" />
                      {collection.videos.length > 0 ? "0%" : "0%"} complete
                    </div>
                  </div>

                  {/* Preview thumbnails */}
                  {collection.videos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1">
                      {collection.videos.slice(0, 3).map((video, idx) => (
                        <div key={idx} className="aspect-video bg-muted rounded overflow-hidden">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed rounded-lg text-center">
                      <Folder className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No videos yet</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => viewCollection(collection)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate("/videos")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => confirmDelete(collection.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Collection Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Collection
              </DialogTitle>
              <DialogDescription>
                Organize your learning materials into custom playlists
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Collection Name</label>
                <Input
                  placeholder="e.g., 5G Exam Prep"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createCollection()}
                />
              </div>

              {/* AI Suggestions */}
              {loadingAI ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Generating creative names...
                  </span>
                </div>
              ) : aiSuggestions.length > 0 ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Suggestions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((suggestion, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => setNewCollectionName(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  placeholder="What will you learn in this collection?"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="wave-gradient" 
                onClick={createCollection}
                disabled={!newCollectionName.trim()}
              >
                Create Collection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this collection and remove all saved videos from it. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => collectionToDelete && deleteCollection(collectionToDelete)}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
