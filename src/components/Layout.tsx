import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser, useClerk } from "@clerk/react";
import { 
  Home, 
  Video, 
  BookOpen, 
  MessageSquare, 
  Bookmark,
  Menu,
  X,
  Sun,
  Moon,
  Radio,
  User,
  LogOut,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ApiKeyButton } from "@/components/ApiKeyButton";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Videos", href: "/videos", icon: Video },
  { name: "Learning Paths", href: "/learning-paths", icon: BookOpen },
  { name: "AI Tutor", href: "/ai-chat", icon: MessageSquare },
  { name: "Community", href: "/community", icon: MessageSquare },
  { name: "My Collections", href: "/collections", icon: Bookmark },
  { name: "Generate Questions", href: "/generate-questions", icon: FileText },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-card border-r transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 rounded-lg wave-gradient group-hover:scale-110 transition-transform">
                <Radio className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold wave-gradient-text">WaveLearn</h1>
                <p className="text-xs text-muted-foreground">Wireless Education</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    isActive
                      ? "wave-gradient text-white shadow-lg"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle & API Key */}
          <div className="p-4 border-t space-y-2">
            <ApiKeyButton className="w-full justify-start" />
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={toggleDarkMode}
            >
              {darkMode ? (
                <>
                  <Sun className="h-5 w-5" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  Dark Mode
                </>
              )}
            </Button>
            
            {/* User Profile Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <User className="h-5 w-5" />
                    <span className="truncate">{user.firstName || user.emailAddresses[0]?.emailAddress}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-semibold">{user.firstName || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.emailAddresses[0]?.emailAddress}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b lg:hidden">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg wave-gradient">
                <Radio className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold wave-gradient-text">WaveLearn</span>
            </Link>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
