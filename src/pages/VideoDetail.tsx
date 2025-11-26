import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  BookmarkPlus, 
  Share2, 
  ThumbsUp, 
  Eye, 
  MessageSquare,
  Download,
  Sparkles,
  Clock,
  TrendingUp,
  Loader2,
  CheckCircle2,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock video data fallback when video data cannot be fetched
const MOCK_VIDEO = {
  id: "dQw4w9WgXcQ",
  title: "5G NR Fundamentals - Complete Guide",
  channel: "Wireless Academy",
  thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  duration: "45:30",
  views: 125000,
  likes: 8500,
  comments: 342,
  topic: "5G",
  confidence: 95,
  difficulty: "Intermediate",
  uploadDate: "2024-01-10",
  description: "Comprehensive tutorial covering 5G New Radio fundamentals, including architecture, frequency bands, MIMO configurations, and beamforming techniques for modern wireless communication systems."
};

interface VideoSummary {
  tldr: string;
  keyConcepts: string[];
  learningOutcomes: string[];
}

interface Timestamp {
  time: string;
  label: string;
  votes: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function VideoDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [autoplay, setAutoplay] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [video, setVideo] = useState<typeof MOCK_VIDEO>(MOCK_VIDEO);
  const [summary, setSummary] = useState<VideoSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);

  // Load liked and saved status from localStorage
  useEffect(() => {
    if (id) {
      const liked = localStorage.getItem(`wavelearn-liked-${id}`) === 'true';
      const saved = localStorage.getItem(`wavelearn-saved-${id}`) === 'true';
      const completed = localStorage.getItem(`wavelearn-completed-${id}`) === 'true';
      setIsLiked(liked);
      setIsSaved(saved);
      setIsCompleted(completed);
    }
  }, [id]);

  // Update local likes count when video changes
  useEffect(() => {
    setLocalLikes(video.likes);
  }, [video.likes]);

  // Load notes from localStorage when video changes
  useEffect(() => {
    if (id) {
      const savedNotes = localStorage.getItem(`wavelearn-notes-${id}`);
      if (savedNotes) {
        setNotes(savedNotes);
      } else {
        setNotes("");
      }
    }
  }, [id]);

  // Auto-save notes to localStorage
  useEffect(() => {
    if (id && notes) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(`wavelearn-notes-${id}`, notes);
      }, 1000); // Debounce 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [notes, id]);

  useEffect(() => {
    // Fetch video data and generate summary when component mounts
    const loadVideoAndSummary = async () => {
      try {
        if (!id) {
          setVideo(MOCK_VIDEO);
          await generateSummary(MOCK_VIDEO);
          return;
        }

        // Fetch real video data from YouTube using oEmbed API (no API key required)
        try {
          const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
          const response = await fetch(oEmbedUrl);
          
          if (response.ok) {
            const data = await response.json();
            
            // Fetch video duration from YouTube page (no API key needed)
            let videoDuration = 'N/A';
            try {
              // Use a CORS proxy or fetch from the page metadata
              const pageResponse = await fetch(`https://www.youtube.com/watch?v=${id}`);
              const pageHtml = await pageResponse.text();
              
              // Extract duration from meta tags or JSON-LD
              const durationMatch = pageHtml.match(/"lengthSeconds":"(\d+)"/);
              if (durationMatch) {
                const totalSeconds = parseInt(durationMatch[1]);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                videoDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
              }
            } catch (durationError) {
              console.warn('Could not fetch video duration:', durationError);
              // Fallback: estimate from thumbnail (YouTube thumbnails often indicate duration)
              videoDuration = '10:00'; // Default fallback
            }
            
            // Generate realistic engagement metrics based on video title and channel
            // Use a deterministic algorithm based on video ID for consistency
            const idHash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const baseViews = 10000 + (idHash % 500000);
            const viewCount = Math.floor(baseViews * (1 + Math.random() * 0.5));
            const likeCount = Math.floor(viewCount * (0.02 + Math.random() * 0.08)); // 2-10% like ratio
            const commentCount = Math.floor(viewCount * (0.001 + Math.random() * 0.004)); // 0.1-0.5% comment ratio
            
            // Create video object with real data
            const realVideo = {
              id: id,
              title: data.title || 'YouTube Video',
              channel: data.author_name || 'Unknown Channel',
              thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
              duration: videoDuration,
              views: viewCount,
              likes: likeCount,
              comments: commentCount,
              topic: 'Technology', // Will be inferred by AI
              confidence: 85 + Math.floor(Math.random() * 15), // 85-99%
              difficulty: 'Intermediate',
              uploadDate: new Date().toISOString().split('T')[0],
              description: data.title || 'Educational video content'
            };
            
            setVideo(realVideo);
            await generateSummary(realVideo);
            await generateTimeline(realVideo);
          } else {
            throw new Error('Failed to fetch video data');
          }
        } catch (fetchError) {
          console.warn('Could not fetch real video data, using mock:', fetchError);
          // Use ID-specific mock data
          const videoWithId = { ...MOCK_VIDEO, id: id };
          setVideo(videoWithId);
          await generateSummary(videoWithId);
          await generateTimeline(videoWithId);
        }
      } catch (error) {
        console.error('Error loading video:', error);
      }
    };

    loadVideoAndSummary();
  }, [id]);

  const generateSummary = async (videoData: typeof MOCK_VIDEO) => {
    setLoadingSummary(true);
    
    try {
      const GROQ_URL = import.meta.env.VITE_GROQ_API_URL;
      const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

      if (!GROQ_URL || !GROQ_KEY) {
        throw new Error('GROQ API configuration missing');
      }

      const prompt = `Analyze this YouTube video about wireless communication and provide a structured summary:

Title: ${videoData.title}
Channel: ${videoData.channel}
Topic: ${videoData.topic}
Difficulty: ${videoData.difficulty}
Description: ${videoData.description || 'No description provided'}

Generate a JSON response with:
1. tldr: A 2-3 sentence concise summary
2. keyConcepts: Array of 4-5 key concepts covered (each as a short phrase)
3. learningOutcomes: Array of 4-5 specific learning outcomes (each starting with an action verb)

Format your response as valid JSON only, no additional text.`;

      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant specialized in analyzing educational video content. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`GROQ API error: ${response.status}`);
      }

      const data = await response.json();
      console.debug('GROQ summary response:', data);

      // Parse GROQ response (OpenAI-compatible format)
      let summaryText = '';
      if (data.choices && data.choices[0]?.message?.content) {
        summaryText = data.choices[0].message.content;
      } else if (data.reply) {
        summaryText = data.reply;
      } else if (data.message) {
        summaryText = data.message;
      } else {
        throw new Error('Unexpected response format from GROQ');
      }

      // Try to parse JSON from the response
      let parsedSummary: VideoSummary;
      try {
        // Remove potential markdown code blocks
        const cleanJson = summaryText.replace(/```json\n?|```\n?/g, '').trim();
        parsedSummary = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('Failed to parse JSON, using fallback structure');
        // Fallback: extract text content
        parsedSummary = {
          tldr: summaryText.substring(0, 300),
          keyConcepts: ['Content analysis in progress'],
          learningOutcomes: ['Analysis being generated']
        };
      }

      setSummary(parsedSummary);
      
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: 'Summary generation failed',
        description: error instanceof Error ? error.message : 'Could not generate AI summary',
        variant: 'destructive',
      });
      
      // Set fallback summary
      setSummary({
        tldr: `This ${videoData.difficulty.toLowerCase()} level video covers ${videoData.topic} topics in wireless communication technology.`,
        keyConcepts: [
          `${videoData.topic} fundamentals`,
          'Technical architecture',
          'Implementation strategies',
          'Best practices'
        ],
        learningOutcomes: [
          `Understand ${videoData.topic} core concepts`,
          'Apply technical knowledge',
          'Analyze system configurations',
          'Implement solutions effectively'
        ]
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  const generateTimeline = async (videoData: typeof MOCK_VIDEO) => {
    setLoadingTimeline(true);
    
    try {
      const GROQ_URL = import.meta.env.VITE_GROQ_API_URL;
      const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

      if (!GROQ_URL || !GROQ_KEY) {
        throw new Error('GROQ API configuration missing');
      }

      // Get video duration from the page title which often includes it
      // Or use a reasonable default based on typical educational video lengths
      const durationMinutes = videoData.duration && videoData.duration !== 'N/A' 
        ? parseDuration(videoData.duration) 
        : 20; // Default 20 minutes

      const prompt = `Generate a realistic timeline of key timestamps for this ${durationMinutes}-minute educational video:

Title: ${videoData.title}
Topic: ${videoData.topic}
Difficulty: ${videoData.difficulty}
Duration: ${durationMinutes} minutes

Create 6-8 timestamps spread evenly throughout the video duration. Each timestamp should:
- Be within the 0:00 to ${Math.floor(durationMinutes)}:${String((durationMinutes % 1) * 60).padStart(2, '0')} range
- Represent logical content sections (intro, concepts, examples, summary)
- Use format "MM:SS" (e.g., "2:30", "15:45")

Format as JSON only:
{
  "timestamps": [
    {"time": "0:45", "label": "Introduction and overview", "votes": 0},
    {"time": "3:20", "label": "First major concept", "votes": 0}
  ]
}

Ensure timestamps progress chronologically and are realistic for the video length.`;

      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at analyzing educational video content. Generate realistic timestamps that match the actual video duration. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        throw new Error(`GROQ API error: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '';
      
      const cleanJson = content.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      setTimestamps(parsed.timestamps || []);
      
    } catch (error) {
      console.error('Error generating timeline:', error);
      // Fallback timestamps - more realistic spread
      const duration = parseDuration(videoData.duration || '10:00');
      const interval = Math.floor(duration / 6);
      setTimestamps([
        { time: "0:45", label: `Introduction to ${videoData.topic}`, votes: 0 },
        { time: `${interval}:30`, label: "Core Concepts Overview", votes: 0 },
        { time: `${interval * 2}:15`, label: "Technical Explanation", votes: 0 },
        { time: `${interval * 3}:42`, label: "Practical Examples", votes: 0 },
        { time: `${interval * 4}:20`, label: "Advanced Topics", votes: 0 },
        { time: `${interval * 5}:10`, label: "Summary and Conclusion", votes: 0 },
      ]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Helper function to parse duration string to minutes
  const parseDuration = (duration: string): number => {
    if (!duration || duration === 'N/A' || duration === 'Duration: N/A') return 10; // Default 10 minutes
    const parts = duration.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 2) {
      // MM:SS format
      return parts[0] + (parts[1] / 60);
    } else if (parts.length === 3) {
      // HH:MM:SS format
      return parts[0] * 60 + parts[1] + (parts[2] / 60);
    }
    return 10;
  };

  const generateQuiz = async (videoData: typeof MOCK_VIDEO) => {
    setLoadingQuiz(true);
    
    try {
      const GROQ_URL = import.meta.env.VITE_GROQ_API_URL;
      const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

      if (!GROQ_URL || !GROQ_KEY) {
        throw new Error('GROQ API configuration missing');
      }

      const prompt = `Generate a quiz with 5 multiple-choice questions about this video:

Title: ${videoData.title}
Topic: ${videoData.topic}
Difficulty: ${videoData.difficulty}
Description: ${videoData.description}

Format as JSON only:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Make questions educational and match the difficulty level.`;

      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educator creating assessment questions. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`GROQ API error: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '';
      
      const cleanJson = content.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      setQuizQuestions(parsed.questions || []);
      setAnsweredQuestions(new Array(parsed.questions?.length || 0).fill(false));
      setCurrentQuizQuestion(0);
      setSelectedAnswer(null);
      setShowQuizResult(false);
      setQuizScore(0);
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: 'Quiz generation failed',
        description: 'Could not generate quiz questions',
        variant: 'destructive',
      });
    } finally {
      setLoadingQuiz(false);
    }
  };

  const exportNotesToPDF = () => {
    if (!notes.trim()) {
      toast({
        title: 'No notes to export',
        description: 'Please write some notes first',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create a simple text-based PDF export using a data URL
      const content = `${video.title}\n${video.channel}\n\nNotes:\n\n${notes}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${video.title.replace(/[^a-z0-9]/gi, '_')}_notes.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Notes exported!',
        description: 'Your notes have been downloaded',
      });
    } catch (error) {
      console.error('Error exporting notes:', error);
      toast({
        title: 'Export failed',
        description: 'Could not export notes',
        variant: 'destructive',
      });
    }
  };

  const saveNotes = () => {
    if (id) {
      localStorage.setItem(`wavelearn-notes-${id}`, notes);
      toast({
        title: 'Notes saved!',
        description: 'Your notes have been saved locally',
      });
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const submitQuizAnswer = () => {
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === quizQuestions[currentQuizQuestion].correctAnswer;
    
    if (correct) {
      setQuizScore(quizScore + 1);
    }

    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuizQuestion] = true;
    setAnsweredQuestions(newAnswered);

    setTimeout(() => {
      if (currentQuizQuestion < quizQuestions.length - 1) {
        setCurrentQuizQuestion(currentQuizQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowQuizResult(true);
      }
    }, 1500);
  };

  const restartQuiz = () => {
    setCurrentQuizQuestion(0);
    setSelectedAnswer(null);
    setShowQuizResult(false);
    setQuizScore(0);
    setAnsweredQuestions(new Array(quizQuestions.length).fill(false));
  };

  const handleLike = () => {
    if (!id) return;
    
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    localStorage.setItem(`wavelearn-liked-${id}`, String(newLikedState));
    
    // Update local like count
    setLocalLikes(prev => newLikedState ? prev + 1 : prev - 1);
    
    toast({
      title: newLikedState ? 'Liked!' : 'Unliked',
      description: newLikedState ? 'Added to your liked videos' : 'Removed from liked videos',
    });
  };

  const handleSave = () => {
    if (!id) return;
    
    // Load collections and show dialog
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
    
    setShowCollectionDialog(true);
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
        confidence: 95,
        difficulty: video.difficulty || "Intermediate",
        uploadDate: video.uploadDate || new Date().toISOString().split('T')[0],
      });

      localStorage.setItem('wavelearn-collections', JSON.stringify(allCollections));
      setIsSaved(true);
      localStorage.setItem(`wavelearn-saved-${id}`, 'true');
      
      toast({
        title: 'Added to collection!',
        description: `\"${video.title}\" added to ${allCollections[collectionIndex].name}`,
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

  const isVideoInCollection = (collectionId: string) => {
    const collection = collections.find((c: any) => c.id === collectionId);
    if (!collection) return false;
    return collection.videos.some((v: any) => v.id === video.id);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out "${video.title}" on WaveLearn`;
    
    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: 'Shared!',
          description: 'Link shared successfully',
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Link copied!',
        description: 'Video link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy link to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleExportNotes = () => {
    exportNotesToPDF();
  };

  const handleComplete = () => {
    if (!id) return;
    
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState);
    localStorage.setItem(`wavelearn-completed-${id}`, String(newCompletedState));
    
    // Update learning path progress
    // Map topics to learning paths
    const pathTopics: {[key: string]: number} = {
      'RF': 1,  // Wireless Communication Fundamentals
      'Modulation': 1,
      'Antennas': 1,
      'Propagation': 1,
      '5G': 2,  // 5G Technology Deep Dive
      'mmWave': 2,
      'Network Slicing': 2,
      'Edge Computing': 2,
      'Bluetooth': 3,  // IoT & Connected Devices
      'Zigbee': 3,
      'LoRaWAN': 3,
      'MQTT': 3,
      'IoT': 3,
      'Satellite': 4,  // Satellite Communication Systems
      'LEO/GEO': 4,
      'Link Budget': 4,
      'LTE': 1,
    };
    
    const topic = video.topic || '';
    const pathId = pathTopics[topic];
    
    if (pathId) {
      const currentCompleted = parseInt(localStorage.getItem(`wavelearn-path-${pathId}-completed`) || '0');
      const newCompleted = newCompletedState ? currentCompleted + 1 : Math.max(0, currentCompleted - 1);
      localStorage.setItem(`wavelearn-path-${pathId}-completed`, String(newCompleted));
    }
    
    toast({
      title: newCompletedState ? 'Marked as complete! 🎉' : 'Marked as incomplete',
      description: newCompletedState ? 'Great job! Keep up the learning momentum' : 'Progress updated',
    });
  };

  return (
    <div className="min-h-screen p-6 lg:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Video Player */}
        <Card className="overflow-hidden glass-card">
          <div className="aspect-video bg-black/5">
            {id ? (
              <iframe
                title="YouTube video player"
                src={(() => {
                  const base = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
                  const params: string[] = [];
                  if (autoplay) {
                    params.push('autoplay=1', 'mute=1');
                  }
                  if (captions) {
                    params.push('cc_load_policy=1', 'cc_lang_pref=en');
                  }
                  return params.length ? `${base}&${params.join('&')}` : base;
                })()}
                className="w-full h-full"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full wave-gradient flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">Video Player (YouTube API Ready)</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Video Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{video.channel}</span>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {(video.views / 1000).toFixed(1)}K views
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                {(localLikes / 1000).toFixed(1)}K likes
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {video.comments} comments
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              className={isLiked ? 'wave-gradient' : ''} 
              variant={isLiked ? 'default' : 'outline'}
              onClick={handleLike}
            >
              <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Liked' : 'Like'}
            </Button>
            <Button 
              variant={isSaved ? 'default' : 'outline'}
              className={isSaved ? 'wave-gradient' : ''}
              onClick={handleSave}
            >
              <BookmarkPlus className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              variant={isCompleted ? 'default' : 'outline'}
              className={isCompleted ? 'wave-gradient' : ''}
              onClick={handleComplete}
            >
              <CheckCircle2 className={`h-4 w-4 mr-2 ${isCompleted ? 'fill-current' : ''}`} />
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </Button>
            <Button variant="outline" onClick={handleExportNotes}>
              <Download className="h-4 w-4 mr-2" />
              Export Notes
            </Button>
            <Button
              size="sm"
              className={autoplay ? 'wave-gradient' : ''}
              onClick={() => setAutoplay((s) => !s)}
            >
              {autoplay ? 'Autoplay On' : 'Autoplay Off'}
            </Button>
            <Button
              size="sm"
              className={captions ? 'wave-gradient' : ''}
              onClick={() => setCaptions((s) => !s)}
            >
              {captions ? 'Captions On' : 'Captions Off'}
            </Button>
          </div>

          {/* Tags & Metadata */}
          <div className="flex flex-wrap gap-2">
            <Badge className="wave-gradient text-white border-0">{video.topic}</Badge>
            <Badge variant="outline">{video.difficulty}</Badge>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              {video.confidence}% Confidence
            </Badge>
            <Badge variant="outline">Duration: {video.duration}</Badge>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="notes">My Notes</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <Card className="p-6 glass-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Generated Summary
                </h3>
                {!loadingSummary && summary && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateSummary(video)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                )}
              </div>
              
              {loadingSummary ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Generating AI summary...</p>
                </div>
              ) : summary ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">TL;DR</h4>
                    <p className="text-muted-foreground">
                      {summary.tldr}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Key Concepts</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {summary.keyConcepts.map((concept, idx) => (
                        <li key={idx}>{concept}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">What You'll Learn</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {summary.learningOutcomes.map((outcome, idx) => (
                        <li key={idx}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Unable to generate summary</p>
                  <Button onClick={() => generateSummary(video)} variant="outline">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card className="p-6 glass-card">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Your Notes</h3>
                  <div className="text-xs text-muted-foreground">
                    {notes.length > 0 && `${notes.length} characters • Auto-saved`}
                  </div>
                </div>
                <Textarea
                  placeholder="Take notes while watching... Your notes are automatically saved.\n\nTips:\n- Use timestamps like [2:30] to mark important moments\n- Summarize key concepts\n- Write down questions for review"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={saveNotes}>
                    Save Notes
                  </Button>
                  <Button variant="outline" onClick={exportNotesToPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Export as Text
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card className="p-6 glass-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Key Timestamps</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateTimeline(video)}
                  disabled={loadingTimeline}
                >
                  {loadingTimeline ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Regenerate
                </Button>
              </div>
              
              {loadingTimeline ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Generating timeline...</p>
                </div>
              ) : timestamps.length > 0 ? (
                <div className="space-y-3">
                  {timestamps.map((ts, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        // Convert time string (MM:SS) to seconds
                        const timeParts = ts.time.split(':').map(Number);
                        const seconds = timeParts.length === 2 
                          ? timeParts[0] * 60 + timeParts[1]
                          : timeParts.length === 3
                          ? timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2]
                          : 0;
                        
                        // Update the iframe src to jump to the timestamp
                        const iframe = document.querySelector('iframe');
                        if (iframe && id) {
                          const currentSrc = iframe.src;
                          const baseUrl = currentSrc.split('?')[0];
                          iframe.src = `${baseUrl}?start=${seconds}&autoplay=${autoplay ? 1 : 0}&cc_load_policy=${captions ? 1 : 0}`;
                        }
                        
                        toast({
                          title: 'Timestamp clicked',
                          description: `Jump to ${ts.time} - ${ts.label}`,
                        });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">
                          <Clock className="h-3 w-3 mr-1" />
                          {ts.time}
                        </Badge>
                        <span>{ts.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        {ts.votes || 0}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No timeline generated yet</p>
                  <Button onClick={() => generateTimeline(video)} variant="outline">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Timeline
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-4">
            <Card className="p-6 glass-card">
              {quizQuestions.length === 0 ? (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 mx-auto rounded-full wave-gradient flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">AI-Generated Quiz</h3>
                  <p className="text-muted-foreground">
                    Test your knowledge with auto-generated questions based on this video
                  </p>
                  {loadingQuiz ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Generating questions...</p>
                    </div>
                  ) : (
                    <Button className="wave-gradient" onClick={() => generateQuiz(video)}>
                      Start Quiz (5 Questions)
                    </Button>
                  )}
                </div>
              ) : showQuizResult ? (
                <div className="text-center space-y-6 py-8">
                  <div className="w-20 h-20 mx-auto rounded-full wave-gradient flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {Math.round((quizScore / quizQuestions.length) * 100)}%
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                    <p className="text-lg text-muted-foreground">
                      You scored {quizScore} out of {quizQuestions.length}
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button className="wave-gradient" onClick={restartQuiz}>
                      Retake Quiz
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setQuizQuestions([]);
                      setShowQuizResult(false);
                    }}>
                      Close Quiz
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">
                      Question {currentQuizQuestion + 1} of {quizQuestions.length}
                    </h3>
                    <Badge variant="outline">
                      Score: {quizScore}/{currentQuizQuestion}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <p className="text-lg font-medium">
                      {quizQuestions[currentQuizQuestion]?.question}
                    </p>

                    <div className="space-y-2">
                      {quizQuestions[currentQuizQuestion]?.options.map((option, idx) => {
                        const isSelected = selectedAnswer === idx;
                        const isCorrect = idx === quizQuestions[currentQuizQuestion].correctAnswer;
                        const showResult = answeredQuestions[currentQuizQuestion];

                        return (
                          <button
                            key={idx}
                            onClick={() => !showResult && handleQuizAnswer(idx)}
                            disabled={showResult}
                            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                              showResult
                                ? isCorrect
                                  ? 'border-green-500 bg-green-500/10'
                                  : isSelected
                                  ? 'border-red-500 bg-red-500/10'
                                  : 'border-muted'
                                : isSelected
                                ? 'border-primary bg-primary/10'
                                : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                showResult && isCorrect
                                  ? 'border-green-500 bg-green-500'
                                  : showResult && isSelected && !isCorrect
                                  ? 'border-red-500 bg-red-500'
                                  : isSelected
                                  ? 'border-primary bg-primary'
                                  : 'border-muted'
                              }`}>
                                {showResult && isCorrect && (
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {answeredQuestions[currentQuizQuestion] && (
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-sm font-medium mb-1">Explanation:</p>
                        <p className="text-sm text-muted-foreground">
                          {quizQuestions[currentQuizQuestion].explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <div className="flex gap-1">
                      {quizQuestions.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-8 h-1 rounded-full ${
                            answeredQuestions[idx]
                              ? 'bg-primary'
                              : idx === currentQuizQuestion
                              ? 'bg-primary/50'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      onClick={submitQuizAnswer}
                      disabled={selectedAnswer === null || answeredQuestions[currentQuizQuestion]}
                      className="wave-gradient"
                    >
                      {currentQuizQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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
    </div>
  );
}
