import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoCard } from "@/components/VideoCard";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Folder, 
  Video, 
  Trash2, 
  PlayCircle,
  Clock,
  TrendingUp
} from "lucide-react";
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

interface Video {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
  topic: string;
  views: number;
  likes: number;
  comments: number;
  confidence: number;
  difficulty: string;
  uploadDate: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  videos: Video[];
  createdAt: string;
  color: string;
}

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToRemove, setVideoToRemove] = useState<string | null>(null);

  useEffect(() => {
    console.log("Component mounted, loading collection with id:", id);
    loadCollection();
  }, [id]);

  const loadCollection = () => {
    const saved = localStorage.getItem("wavelearn-collections");
    console.log("Loading collections from localStorage:", saved);
    if (saved) {
      try {
        const collections: Collection[] = JSON.parse(saved);
        console.log("Parsed collections:", collections);
        console.log("Looking for collection with id:", id);
        const found = collections.find((c) => c.id === id);
        console.log("Found collection:", found);
        if (found) {
          setCollection(found);
        } else {
          toast({
            title: "Collection not found",
            description: "This collection may have been deleted",
            variant: "destructive",
          });
          navigate("/collections");
        }
      } catch (error) {
        console.error("Error loading collection:", error);
        navigate("/collections");
      }
    } else {
      console.log("No collections found in localStorage");
      navigate("/collections");
    }
  };

  const removeVideo = (videoId: string) => {
    if (!collection) return;

    const saved = localStorage.getItem("wavelearn-collections");
    if (saved) {
      try {
        const collections: Collection[] = JSON.parse(saved);
        const collectionIndex = collections.findIndex((c) => c.id === id);
        
        if (collectionIndex !== -1) {
          collections[collectionIndex].videos = collections[collectionIndex].videos.filter(
            (v) => v.id !== videoId
          );
          localStorage.setItem("wavelearn-collections", JSON.stringify(collections));
          setCollection(collections[collectionIndex]);
          
          toast({
            title: "Video removed",
            description: "Video has been removed from collection",
          });
        }
      } catch (error) {
        console.error("Error removing video:", error);
        toast({
          title: "Error",
          description: "Failed to remove video",
          variant: "destructive",
        });
      }
    }
    
    setDeleteDialogOpen(false);
    setVideoToRemove(null);
  };

  const confirmRemove = (videoId: string) => {
    setVideoToRemove(videoId);
    setDeleteDialogOpen(true);
  };

  const calculateTotalDuration = () => {
    if (!collection) return "0:00";
    
    let totalSeconds = 0;
    collection.videos.forEach((video) => {
      const [minutes, seconds] = video.duration.split(":").map(Number);
      totalSeconds += minutes * 60 + (seconds || 0);
    });
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!collection) {
    return (
      <div className="min-h-screen p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <Folder className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">Loading collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Button 
            variant="ghost" 
            className="mb-4 gap-2" 
            onClick={() => navigate("/collections")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collections
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${collection.color}`} />
                <h1 className="text-4xl font-bold wave-gradient-text">{collection.name}</h1>
              </div>
              <p className="text-muted-foreground text-lg mb-4">
                {collection.description || "No description"}
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span>{collection.videos.length} {collection.videos.length === 1 ? "video" : "videos"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{calculateTotalDuration()} total</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                  <span>0% complete</span>
                </div>
              </div>
            </div>
            <Button className="wave-gradient gap-2" onClick={() => navigate("/videos")}>
              <Video className="h-4 w-4" />
              Add More Videos
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 glass-card hover-lift cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg wave-gradient">
                <Video className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Videos</p>
                <p className="text-2xl font-bold">{collection.videos.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 glass-card hover-lift cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg wave-gradient">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-2xl font-bold">{calculateTotalDuration()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 glass-card hover-lift cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg wave-gradient">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">0%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Videos Grid or Empty State */}
        {collection.videos.length === 0 ? (
          <Card className="p-12 glass-card text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full wave-gradient flex items-center justify-center">
                <Video className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold">No Videos Yet</h3>
              <p className="text-muted-foreground">
                Start building your collection by adding videos from the library
              </p>
              <Button className="wave-gradient gap-2 mt-4" onClick={() => navigate("/videos")}>
                <Video className="h-4 w-4" />
                Browse Videos
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-bold mb-4">Videos in Collection</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collection.videos.map((video) => (
                  <div key={video.id} className="relative group">
                    <VideoCard video={video} />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        confirmRemove(video.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic Breakdown */}
            <Card className="p-6 glass-card">
              <h3 className="text-lg font-bold mb-4">Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(collection.videos.map(v => v.topic))).map((topic) => {
                  const count = collection.videos.filter(v => v.topic === topic).length;
                  return (
                    <Badge key={topic} variant="outline" className="gap-1">
                      {topic} • {count}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          </>
        )}

        {/* Remove Video Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Video?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the video from this collection. The video itself will remain 
                in the library.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => videoToRemove && removeVideo(videoToRemove)}
                className="bg-destructive hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
