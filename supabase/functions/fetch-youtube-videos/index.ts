import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Topic keywords for auto-detection
const topicKeywords: Record<string, string[]> = {
  "5G": ["5g", "nr", "new radio", "5g network", "next generation"],
  "LTE": ["lte", "4g", "long term evolution", "evolved packet"],
  "RF": ["rf", "radio frequency", "modulation", "spectrum", "propagation"],
  "Antennas": ["antenna", "mimo", "beam", "radiation pattern", "array"],
  "IoT": ["iot", "internet of things", "sensor", "m2m", "machine to machine"],
  "Satellite": ["satellite", "orbit", "geo", "leo", "satellite communication"],
  "Bluetooth": ["bluetooth", "ble", "low energy", "pairing"],
  "Wireless": ["wireless", "wi-fi", "wifi", "802.11"]
};

// Detect topic from title and description
function detectTopic(title: string, description: string): { topic: string; confidence: number } {
  const text = `${title} ${description}`.toLowerCase();
  let bestMatch = { topic: "Wireless", confidence: 0 };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    let matches = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches++;
      }
    }
    const confidence = Math.min(95, (matches / keywords.length) * 100 + 20);
    
    if (matches > 0 && confidence > bestMatch.confidence) {
      bestMatch = { topic, confidence: Math.round(confidence) };
    }
  }

  return bestMatch;
}

// Calculate video score
function calculateScore(views: number, likes: number, comments: number): number {
  return (likes * 0.5 + comments * 0.3 + views * 0.2) / 1000;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, maxResults = 20, topic = "" } = await req.json();
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

    if (!YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY is not configured');
    }

    // Build search query
    let searchQuery = query || "wireless communication tutorial";
    if (topic && topic !== "All") {
      searchQuery += ` ${topic}`;
    }

    console.log(`Searching YouTube for: ${searchQuery}`);

    // Search for videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(searchQuery)}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}&order=relevance&relevanceLanguage=en`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return new Response(JSON.stringify({ videos: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get video IDs
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // Fetch detailed statistics
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const statsResponse = await fetch(statsUrl);
    const statsData = await statsResponse.json();

    // Merge data and calculate scores
    const videos = searchData.items.map((item: any, index: number) => {
      const stats = statsData.items[index]?.statistics || {};
      const contentDetails = statsData.items[index]?.contentDetails || {};
      
      const views = parseInt(stats.viewCount || '0');
      const likes = parseInt(stats.likeCount || '0');
      const comments = parseInt(stats.commentCount || '0');

      // Detect topic
      const { topic: detectedTopic, confidence } = detectTopic(
        item.snippet.title,
        item.snippet.description
      );

      // Parse duration from ISO 8601 format (PT1H2M10S)
      const duration = contentDetails.duration || 'PT0M0S';
      const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      const hours = parseInt(durationMatch?.[1] || '0');
      const minutes = parseInt(durationMatch?.[2] || '0');
      const seconds = parseInt(durationMatch?.[3] || '0');
      const formattedDuration = hours > 0 
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes}:${seconds.toString().padStart(2, '0')}`;

      // Determine difficulty based on views and title
      let difficulty = "Beginner";
      const titleLower = item.snippet.title.toLowerCase();
      if (titleLower.includes("advanced") || titleLower.includes("deep dive") || titleLower.includes("expert")) {
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
        score: calculateScore(views, likes, comments)
      };
    });

    // Sort by score
    videos.sort((a: any, b: any) => b.score - a.score);

    console.log(`Found ${videos.length} videos`);

    return new Response(JSON.stringify({ videos }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-youtube-videos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
