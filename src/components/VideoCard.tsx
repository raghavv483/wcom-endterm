import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, ThumbsUp, MessageSquare, Clock, TrendingUp, Plus, Check } from "lucide-react";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    channel: string;
    thumbnail: string;
    duration: string;
    views: number;
    likes: number;
    comments: number;
    topic: string;
    confidence: number;
    difficulty: string;
    uploadDate: string;
  };
}

export function VideoCard({ video }: VideoCardProps) {
  const { toast } = useToast();
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const score = ((video.likes || 0) * 0.5 + (video.comments || 0) * 0.3 + (video.views || 0) * 0.2) / 1000;

  const loadCollections = () => {
    const saved = localStorage.getItem('wavelearn-collections');
    if (saved) {
      try {
        setCollections(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading collections:', error);
        setCollections([]);
      }
    } else {
      setCollections([]);
    }
  };

  const addToCollection = (collectionId: string) => {
    const saved = localStorage.getItem('wavelearn-collections');
    if (!saved) return;

    try {
      const allCollections = JSON.parse(saved);
      const collectionIndex = allCollections.findIndex((c: any) => c.id === collectionId);
      
      if (collectionIndex === -1) return;

      // Check if video already exists in collection
      const videoExists = allCollections[collectionIndex].videos.some(
        (v: any) => v.id === video.id
      );

      if (videoExists) {
        toast({
          title: 'Already in collection',
          description: 'This video is already in the collection',
          variant: 'default',
        });
        return;
      }

      // Add video to collection
      allCollections[collectionIndex].videos.push({
        id: video.id,
        title: video.title,
        channel: video.channel,
        thumbnail: video.thumbnail,
        duration: video.duration,
        topic: video.topic,
        views: video.views,
        likes: video.likes,
        comments: video.comments,
        confidence: video.confidence,
        difficulty: video.difficulty,
        uploadDate: video.uploadDate,
      });

      localStorage.setItem('wavelearn-collections', JSON.stringify(allCollections));
      
      toast({
        title: 'Added to collection!',
        description: `"${video.title}" added to ${allCollections[collectionIndex].name}`,
      });

      setShowCollectionDialog(false);
    } catch (error) {
      console.error('Error adding to collection:', error);
      toast({
        title: 'Error',
        description: 'Could not add video to collection',
        variant: 'destructive',
      });
    }
  };

  const handleAddToCollection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    loadCollections();
    setShowCollectionDialog(true);
  };

  const isVideoInCollection = (collectionId: string) => {
    const collection = collections.find((c: any) => c.id === collectionId);
    if (!collection) return false;
    return collection.videos.some((v: any) => v.id === video.id);
  };

  return (
    <>
      <Link to={`/video/${video.id}`}>
        <Card className="overflow-hidden hover-lift glass-card cursor-pointer group relative">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden bg-muted">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {video.duration}
            </div>
            <div className="absolute top-2 left-2">
              <Badge className="wave-gradient text-white border-0">
                {video.topic}
              </Badge>
            </div>
            {/* Add to Collection Button */}
            <Button
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity wave-gradient"
              onClick={handleAddToCollection}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>

          <p className="text-sm text-muted-foreground">{video.channel}</p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNumber(video.views)}
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {formatNumber(video.likes)}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {formatNumber(video.comments)}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {video.difficulty || 'Intermediate'}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="font-medium">{video.confidence || 95}%</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Score: {score.toFixed(1)}
            </div>
          </div>
        </div>
      </Card>
    </Link>

    {/* Collection Selection Dialog */}
    <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
          <DialogDescription>
            Choose a collection to add "{video.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {collections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No collections yet</p>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCollectionDialog(false);
                  window.location.href = '/collections';
                }}
              >
                Create Collection
              </Button>
            </div>
          ) : (
            collections.map((collection: any) => {
              const isInCollection = isVideoInCollection(collection.id);
              return (
                <button
                  key={collection.id}
                  onClick={() => !isInCollection && addToCollection(collection.id)}
                  disabled={isInCollection}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isInCollection
                      ? 'border-green-500 bg-green-500/10 cursor-not-allowed'
                      : 'border-muted hover:border-primary hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${collection.color}`} />
                        <h4 className="font-semibold">{collection.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {collection.videos.length} videos
                      </p>
                    </div>
                    {isInCollection && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
}
