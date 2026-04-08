import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import { Layout } from "./components/Layout";
import { ApiKeyProvider } from "./context/ApiKeyContext";
import { ApiKeyModal } from "./components/ApiKeyModal";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Videos from "./pages/Videos";
import VideoDetail from "./pages/VideoDetail";
import LearningPaths from "./pages/LearningPaths";
import AIChat from "./pages/AIChat";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import Community from "./pages/Community";
import AskQuestion from "./pages/AskQuestion";
import QuestionDetail from "./pages/QuestionDetail";
import PDFQuestionGenerator from "./pages/PDFQuestionGenerator";
import Assignments from "./pages/Assignments";
import AssignmentDetail from "./pages/AssignmentDetail";
import NotFound from "./pages/NotFound";
import { AdminDashboard } from "./pages/AdminDashboard";
import { QuizBuilder } from "./components/QuizBuilder";
import { AdminList } from "./components/AdminList";
import AdminProfile from "./pages/AdminProfile";
import UserQuizFeed from "./pages/UserQuizFeed";
import QuizStats from "./pages/QuizStats";
import QuizAttemptReview from "./pages/QuizAttemptReview";
import QuizResponsesAdmin from "./pages/QuizResponsesAdmin";
import { QuizAttempt } from "./components/QuizAttempt";

const queryClient = new QueryClient();

const App = () => (
  <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
    <ApiKeyProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Sonner />
          <ApiKeyModal />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/videos" element={<ProtectedRoute><Layout><Videos /></Layout></ProtectedRoute>} />
              <Route path="/video/:id" element={<ProtectedRoute><Layout><VideoDetail /></Layout></ProtectedRoute>} />
              <Route path="/learning-paths" element={<ProtectedRoute><Layout><LearningPaths /></Layout></ProtectedRoute>} />
              <Route path="/ai-chat" element={<ProtectedRoute><Layout><AIChat /></Layout></ProtectedRoute>} />
              <Route path="/collections" element={<ProtectedRoute><Layout><Collections /></Layout></ProtectedRoute>} />
              <Route path="/collection/:id" element={<ProtectedRoute><Layout><CollectionDetail /></Layout></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><Layout><Community /></Layout></ProtectedRoute>} />
              <Route path="/community/ask" element={<ProtectedRoute><Layout><AskQuestion /></Layout></ProtectedRoute>} />
              <Route path="/community/questions/:id" element={<ProtectedRoute><Layout><QuestionDetail /></Layout></ProtectedRoute>} />
              <Route path="/generate-questions" element={<ProtectedRoute><Layout><PDFQuestionGenerator /></Layout></ProtectedRoute>} />
              <Route path="/assignments" element={<ProtectedRoute><Layout><Assignments /></Layout></ProtectedRoute>} />
              <Route path="/assignments/:slug" element={<ProtectedRoute><Layout><AssignmentDetail /></Layout></ProtectedRoute>} />
              
              {/* Quiz Routes */}
              <Route path="/quizzes" element={<ProtectedRoute><Layout><UserQuizFeed /></Layout></ProtectedRoute>} />
              <Route path="/quiz/:id" element={<ProtectedRoute><Layout><QuizAttempt /></Layout></ProtectedRoute>} />
              <Route path="/quiz/:id/attempt/review" element={<ProtectedRoute><Layout><QuizAttemptReview /></Layout></ProtectedRoute>} />
              <Route path="/quiz/:id/stats" element={<AdminProtectedRoute><Layout><QuizStats /></Layout></AdminProtectedRoute>} />
              <Route path="/quiz/:id/responses" element={<AdminProtectedRoute><Layout><QuizResponsesAdmin /></Layout></AdminProtectedRoute>} />
              <Route path="/admins" element={<ProtectedRoute><Layout><AdminList /></Layout></ProtectedRoute>} />
              <Route path="/admin/:adminId" element={<ProtectedRoute><Layout><AdminProfile /></Layout></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminProtectedRoute><Layout><AdminDashboard /></Layout></AdminProtectedRoute>} />
              <Route path="/admin/quiz/create" element={<AdminProtectedRoute><Layout><QuizBuilder /></Layout></AdminProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ApiKeyProvider>
  </ClerkProvider>
);

export default App;
