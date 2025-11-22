import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Videos from "./pages/Videos";
import VideoDetail from "./pages/VideoDetail";
import LearningPaths from "./pages/LearningPaths";
import AIChat from "./pages/AIChat";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/videos" element={<Layout><Videos /></Layout>} />
          <Route path="/video/:id" element={<Layout><VideoDetail /></Layout>} />
          <Route path="/learning-paths" element={<Layout><LearningPaths /></Layout>} />
          <Route path="/ai-chat" element={<Layout><AIChat /></Layout>} />
          <Route path="/collections" element={<Layout><Collections /></Layout>} />
          <Route path="/collection/:id" element={<Layout><CollectionDetail /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
