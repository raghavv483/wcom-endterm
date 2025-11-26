import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, BookOpen, Lightbulb, Zap } from "lucide-react";

// Format AI response text with proper styling
const formatResponse = (text: string) => {
  // Split into paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map((para, idx) => {
    const trimmed = para.trim();
    
    // Check if it's a bullet list
    if (trimmed.match(/^[\*\-•]\s/m)) {
      const items = trimmed.split('\n').filter(line => line.trim());
      return (
        <ul key={idx} className="space-y-2 my-3 pl-4">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary mt-1.5">•</span>
              <span className="flex-1">{item.replace(/^[\*\-•]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
            </li>
          ))}
        </ul>
      );
    }
    
    // Check if it's a numbered list
    if (trimmed.match(/^\d+\.\s/m)) {
      const items = trimmed.split('\n').filter(line => line.trim());
      return (
        <ol key={idx} className="space-y-2 my-3 pl-4">
          {items.map((item, i) => {
            const cleaned = item.replace(/^\d+\.\s*/, '');
            return (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary font-semibold min-w-[24px]">{i + 1}.</span>
                <span className="flex-1" dangerouslySetInnerHTML={{ 
                  __html: cleaned.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>') 
                }} />
              </li>
            );
          })}
        </ol>
      );
    }
    
    // Regular paragraph with bold formatting
    const formatted = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
    return <p key={idx} className="mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
};

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm your wireless communication AI tutor. I can help explain concepts, generate summaries, answer questions, and create study notes. What would you like to learn about today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const quickPrompts = [
    { icon: BookOpen, text: "Explain MIMO in simple terms", color: "bg-blue-500" },
    { icon: Lightbulb, text: "What's the difference between 4G and 5G?", color: "bg-purple-500" },
    { icon: Zap, text: "Generate notes on RF modulation", color: "bg-amber-500" },
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { role: "user", content: input }]);
    const userMessage = input;
    setInput("");

    // Call GROQ API (configurable via env)
    const GROQ_URL = import.meta.env.VITE_GROQ_API_URL;
    const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

    if (!GROQ_URL) {
      // Fallback message when not configured
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "GROQ API is not configured. Set VITE_GROQ_API_URL to enable real responses.",
          },
        ]);
      }, 400);
      return;
    }

    setLoading(true);

    fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(GROQ_KEY ? { Authorization: `Bearer ${GROQ_KEY}` } : {}),
      },
      // GROQ uses OpenAI-compatible format
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert wireless communication tutor. Format your responses clearly with:\n- Use proper paragraphs separated by blank lines\n- Use bullet points (•) for lists\n- Use numbered lists (1., 2., 3.) for steps or sequences\n- Use **bold** for key terms and concepts\n- Keep explanations clear and well-structured\n- Break down complex topics into digestible sections"
          },
          ...messages,
          { role: "user", content: userMessage }
        ],
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`GROQ API error: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        // Try to robustly extract a reply from a variety of possible API shapes
        // Common shapes handled:
        // - { reply: string }
        // - { message: string }
        // - { choices: [{ message: { content } }] } (OpenAI chat)
        // - { outputs: [{ content: [{ type: 'output_text', text: '...' }] }] }
        // - { output_text: '...' }
        console.debug('GROQ response:', data);

        let reply: string | undefined;

        if (typeof data === 'string') {
          reply = data;
        } else if (data?.reply) {
          reply = data.reply;
        } else if (data?.message) {
          reply = data.message;
        } else if (Array.isArray(data?.choices) && data.choices[0]?.message?.content) {
          reply = data.choices[0].message.content;
        } else if (Array.isArray(data?.outputs) && data.outputs[0]) {
          // Some providers return outputs[].content[] with text
          const out = data.outputs[0];
          if (Array.isArray(out.content)) {
            // find first text-like piece
            const textPiece = out.content.find((c: any) => c?.type?.includes('text') || c?.text);
            reply = textPiece?.text || (out.content[0] && String(out.content[0]));
          } else if (out.text) {
            reply = out.text;
          }
        } else if (data?.output_text) {
          reply = data.output_text;
        }

        if (!reply) {
          // fallback to stringified payload
          reply = JSON.stringify(data);
        }

        setMessages((prev) => [...prev, { role: "assistant", content: String(reply) }]);
      })
      .catch((err) => {
        console.error("GROQ API error", err);
        toast({ title: "AI error", description: String(err.message || err), variant: "destructive" });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Failed to get a response from GROQ AI. See console for details." },
        ]);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen p-6 lg:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold wave-gradient-text">AI Learning Assistant</h1>
          <p className="text-muted-foreground">
            Get instant help with wireless communication concepts
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickPrompts.map((prompt, idx) => (
            <Card
              key={idx}
              className="p-4 glass-card hover-lift cursor-pointer group"
              onClick={() => setInput(prompt.text)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${prompt.color} text-white`}>
                  <prompt.icon className="h-4 w-4" />
                </div>
                <p className="text-sm group-hover:text-primary transition-colors">
                  {prompt.text}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Chat Messages */}
        <Card className="p-6 glass-card min-h-[500px] flex flex-col">
          <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "wave-gradient text-white"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <Badge variant="outline" className="text-xs">AI Tutor</Badge>
                    </div>
                  )}
                  <div className="text-sm">
                    {message.role === "user" ? (
                      <p className="leading-relaxed">{message.content}</p>
                    ) : (
                      <div className="space-y-1">{formatResponse(message.content)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask anything about wireless communication..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} className="wave-gradient" disabled={loading}>
              {loading ? <span className="h-4 w-4 inline-block">...</span> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 glass-card">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Powered by GROQ AI</p>
              <p>
                This chat uses GROQ's ultra-fast AI models to provide real-time 
                AI tutoring, concept explanations, and personalized learning assistance.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
