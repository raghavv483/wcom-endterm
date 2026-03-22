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

// YouTube API Key - using direct client-side approach
const YOUTUBE_API_KEY = 'AIzaSyBLDJVOMKbERybAEvk-oknmoT2bxKyY9d4';

const topics = ["All", "5G", "LTE", "RF", "Antennas", "IoT", "Satellite", "Bluetooth"];

// Topic detection function
function detectTopic(title: string, description: string): { topic: string; confidence: number } {
  const topicKeywords: Record<string, string[]> = {
    "5G": ["5g", "nr", "new radio", "5g network"],
    "LTE": ["lte", "4g", "long term evolution"],
    "RF": ["rf", "radio frequency", "modulation", "spectrum"],
    "Antennas": ["antenna", "mimo", "beam", "radiation"],
    "IoT": ["iot", "internet of things", "sensor"],
    "Satellite": ["satellite", "orbit", "geo", "leo"],
    "Bluetooth": ["bluetooth", "ble", "low energy"],
  };

  const text = `${title} ${description}`.toLowerCase();
  let bestMatch = { topic: "Wireless", confidence: 0 };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    let matches = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) matches++;
    }
    const confidence = Math.min(95, (matches / keywords.length) * 100 + 20);
    
    if (matches > 0 && confidence > bestMatch.confidence) {
      bestMatch = { topic, confidence: Math.round(confidence) };
    }
  }

  return bestMatch;
}

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
      
      // Build search query based on user input and selected topic
      let searchTerm = "wireless communication tutorial";
      
      if (searchQuery.trim()) {
        searchTerm = searchQuery.trim();
      } else if (selectedTopic !== "All") {
        searchTerm = `${selectedTopic} wireless communication tutorial`;
      }

      console.log('Fetching videos for:', searchTerm);

      // Call YouTube API directly from client
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(searchTerm)}&maxResults=25&key=${YOUTUBE_API_KEY}&order=relevance&relevanceLanguage=en`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchResponse.ok || !searchData.items || searchData.items.length === 0) {
        console.warn('YouTube search returned no results or error');
        setVideos(MOCK_VIDEOS);
        setLoading(false);
        return;
      }

      // Get video IDs for stats
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

      // Fetch detailed statistics
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
      const statsResponse = await fetch(statsUrl);
      const statsData = await statsResponse.json();

      if (!statsResponse.ok) {
        console.warn('YouTube stats fetch failed, using mock videos');
        setVideos(MOCK_VIDEOS);
        setLoading(false);
        return;
      }

      // Merge search results with statistics
      const videos = searchData.items.map((item: any, index: number) => {
        const stats = statsData.items?.[index]?.statistics || {};
        const contentDetails = statsData.items?.[index]?.contentDetails || {};
        
        const views = parseInt(stats.viewCount || '0');
        const likes = parseInt(stats.likeCount || '0');
        const comments = parseInt(stats.commentCount || '0');

        // Detect topic from title
        const { topic: detectedTopic, confidence } = detectTopic(
          item.snippet.title,
          item.snippet.description || ''
        );

        // Parse duration
        const duration = contentDetails.duration || 'PT0M0S';
        const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const hours = parseInt(durationMatch?.[1] || '0');
        const minutes = parseInt(durationMatch?.[2] || '0');
        const seconds = parseInt(durationMatch?.[3] || '0');
        const formattedDuration = hours > 0 
          ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          : `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Determine difficulty
        let difficulty = "Beginner";
        const titleLower = item.snippet.title.toLowerCase();
        if (titleLower.includes("advanced") || titleLower.includes("deep dive")) {
          difficulty = "Advanced";
        } else if (titleLower.includes("intermediate") || views > 50000) {
          difficulty = "Intermediate";
        }

        return {
          id: item.id.videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
          duration: formattedDuration,
          views,
          likes,
          comments,
          topic: detectedTopic,
          confidence,
          difficulty,
          uploadDate: item.snippet.publishedAt.split('T')[0],
          score: (likes * 0.5 + comments * 0.3 + views * 0.2) / 1000
        };
      });

      // Sort by score
      videos.sort((a: any, b: any) => b.score - a.score);

      console.log('Fetched', videos.length, 'videos from YouTube');
      setVideos(videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      // Fallback to demo videos on any error
      setVideos(MOCK_VIDEOS);
      toast({
        title: 'Using demo videos',
        description: 'Could not fetch live videos, showing demo videos instead.',
        variant: 'default',
      });
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
