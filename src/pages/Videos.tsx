import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, TrendingUp, BookOpen, Wifi, Radio, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoCard } from "@/components/VideoCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Importing the React namespace ensures TypeScript picks up the correct
// `JSX.IntrinsicElements` types from `@types/react`.

// Demo fallback videos used when the YouTube API key is not available during local development
// These use realistic engagement metrics
const generateEngagementMetrics = (videoId: string) => {
  const idHash = videoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseViews = 10000 + (idHash % 500000);
  const viewCount = Math.floor(baseViews * (1 + Math.random() * 0.5));
  const likeCount = Math.floor(viewCount * (0.02 + Math.random() * 0.08));
  const commentCount = Math.floor(viewCount * (0.001 + Math.random() * 0.004));
  
  return { views: viewCount, likes: likeCount, comments: commentCount };
};

const dQw4Metrics = generateEngagementMetrics("dQw4w9WgXcQ");
const M7lMetrics = generateEngagementMetrics("M7lc1UVf-VE");

const MOCK_VIDEOS = [
  {
    id: "dQw4w9WgXcQ",
    title: "5G NR Fundamentals — Demo (Sample)",
    channel: "Wireless Academy",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    duration: "12:34",
    views: dQw4Metrics.views,
    likes: dQw4Metrics.likes,
    comments: dQw4Metrics.comments,
    topic: "5G",
    confidence: 95,
    difficulty: "Intermediate",
    uploadDate: "2024-01-10",
  },
  {
    id: "M7lc1UVf-VE",
    title: "MIMO Basics — Demo (Sample)",
    channel: "Wireless Academy",
    thumbnail: "https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg",
    duration: "8:45",
    views: M7lMetrics.views,
    likes: M7lMetrics.likes,
    comments: M7lMetrics.comments,
    topic: "RF",
    confidence: 90,
    difficulty: "Beginner",
    uploadDate: "2023-08-02",
  },
];

// Local env toggle to force mock/demo videos for development: set VITE_USE_MOCK_VIDEOS=true
const USE_MOCK_VIDEOS = import.meta.env.VITE_USE_MOCK_VIDEOS === 'true';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const topics = ["All", "5G", "LTE", "RF", "Antennas", "IoT", "Satellite", "Bluetooth"];

export default function Videos() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for topic from URL parameters (from learning paths)
  useEffect(() => {
    const topicFromUrl = searchParams.get('topic');
    if (topicFromUrl) {
      setSelectedTopic(topicFromUrl);
      setSearchQuery(''); // Clear search when coming from learning path
    }
  }, [searchParams]);

  // Fetch videos when topic changes or on initial load
  useEffect(() => {
    fetchVideos();
  }, [selectedTopic]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      // Respect local env override for development convenience
      if (USE_MOCK_VIDEOS) {
        setVideos(MOCK_VIDEOS);
        setLoading(false);
        return;
      }

      // If Supabase client config is missing, fall back to mock videos
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.warn('Supabase URL or publishable key missing — using mock videos');
        setVideos(MOCK_VIDEOS);
        setLoading(false);
        toast({
          title: 'Using demo videos',
          description: 'Supabase environment variables are not configured — showing demo videos.',
          variant: 'default',
        });
        return;
      }
      
      // Build search query based on user input and selected topic
      let searchTerm = "wireless communication tutorial";
      
      if (searchQuery.trim()) {
        // User has entered a search - use their query
        searchTerm = searchQuery.trim();
      } else if (selectedTopic !== "All") {
        // User selected a topic but no search query
        searchTerm = `${selectedTopic} wireless communication tutorial`;
      }
      
      const body = {
        query: searchTerm,
        topic: selectedTopic !== "All" ? selectedTopic : undefined,
        maxResults: 25,
      };

      const { data, error } = await supabase.functions.invoke('fetch-youtube-videos', {
        // ensure the function receives proper JSON
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });

      // supabase may return an error object or the function may return { error: '...' }
      if (error) {
        console.error('Supabase function invoke error:', error);
        throw error;
      }

      if (data && (data as any).error) {
        const msg = (data as any).error || 'Unknown function error';
        console.error('Function returned error payload:', msg);
        throw new Error(msg);
      }

      setVideos((data as any)?.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      const message = error instanceof Error ? error.message : String(error);

      const lower = (message || '').toLowerCase();
      const shouldFallback =
        lower.includes('youtube_api_key') ||
        lower.includes('failed to send a request') ||
        lower.includes('failed to fetch') ||
        lower.includes('network') ||
        lower.includes('ecoff') ||
        lower.includes('ecconnrefused') ||
        lower.includes('timeout');

      if (shouldFallback) {
        console.warn('Edge function unavailable or missing key — using mock videos');
        setVideos(MOCK_VIDEOS);
        toast({
          title: 'Using demo videos',
          description:
            message && message.length > 0
              ? `Edge Function error: ${message} — showing demo videos.`
              : 'Edge Function is unreachable — showing demo videos for development.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error fetching videos',
          description: message || 'Failed to fetch videos. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Trigger fresh API call with the current search query
    fetchVideos();
  };

  // Don't filter videos client-side - show exactly what API returns
  const filteredVideos = videos;

  return (
    <div className="min-h-screen p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 wave-gradient-text">Explore Videos</h1>
        <p className="text-muted-foreground">
          {searchQuery ? `Search results for "${searchQuery}"` : 'Discover top-rated wireless communication tutorials'}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos, channels, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Topic Tabs */}
        <Tabs value={selectedTopic} onValueChange={setSelectedTopic}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {topics.map((topic) => (
              <TabsTrigger key={topic} value={topic} className="gap-2">
                {topic === "All" && <TrendingUp className="h-4 w-4" />}
                {topic === "5G" && <Radio className="h-4 w-4" />}
                {topic === "IoT" && <Wifi className="h-4 w-4" />}
                {topic}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 glass-card hover-lift cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg wave-gradient">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Videos</p>
              <p className="text-2xl font-bold">{filteredVideos.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 glass-card hover-lift cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg wave-gradient">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Confidence</p>
              <p className="text-2xl font-bold">93%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 glass-card hover-lift cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg wave-gradient">
              <Radio className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Topics</p>
              <p className="text-2xl font-bold">{topics.length - 1}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg font-semibold">No videos found</p>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No results for "${searchQuery}". Try different keywords.`
                  : 'Try different filters or search terms.'
                }
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    fetchVideos();
                  }}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
