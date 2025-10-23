import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlanBadge } from "@/components/PlanBadge";
import { ClipboardCard } from "@/components/ClipboardCard";
import { FormattersPanel } from "@/components/FormattersPanel";
import { AiActionsPanel } from "@/components/AiActionsPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { FeedbackForm } from "@/components/FeedbackForm";
import { UpgradeModal } from "@/components/UpgradeModal";
import { 
  History, 
  Wand2, 
  Settings, 
  MessageSquare, 
  Search,
  Sparkles,
  Loader2,
  LogOut,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ClipboardItem, User } from "@shared/schema";

export default function Dashboard() {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<Omit<User, "password">>({
    queryKey: ["/api/auth/me"],
  });

  // Fetch clipboard history
  const { data: clipboardItems = [], isLoading: historyLoading } = useQuery<ClipboardItem[]>({
    queryKey: ["/api/history"],
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PUT", `/api/history/${id}/favorite`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
  });

  // Create clipboard item mutation
  const createClipboardMutation = useMutation({
    mutationFn: async (data: { content: string; contentType: string; formatted: boolean }) => {
      const res = await apiRequest("POST", "/api/history", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
  });

  // AI processing mutation
  const aiMutation = useMutation({
    mutationFn: async ({ text, operation }: { text: string; operation: string }) => {
      const res = await apiRequest("/api/v1/ai/process", "POST", { text, operation });
      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async ({ rating, message }: { rating: number; message: string }) => {
      const res = await apiRequest("POST", "/api/feedback", { rating, message, userId: user?.id });
      return res.json();
    },
  });

  const handleCopyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavoriteMutation.mutate(id);
  };

  const handleSaveFormattedToHistory = (content: string, contentType: string) => {
    // Save formatted content to clipboard history
    createClipboardMutation.mutate({
      content,
      contentType,
      formatted: true,
    });
  };

  const handleAiAction = async (text: string, operation: string): Promise<string> => {
    try {
      const data = await aiMutation.mutateAsync({ text, operation });
      
      // Save AI output to clipboard history
      createClipboardMutation.mutate({
        content: data.result,
        contentType: "text",
        formatted: false,
      });
      
      return data.result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("AI processing failed");
    }
  };

  const handleUpgrade = async (plan: "pro" | "team") => {
    try {
      setUpgradeModalOpen(false);
      toast({
        title: "Redirecting to checkout",
        description: `Opening Stripe checkout for ${plan} plan...`,
      });
      
      const res = await apiRequest("/api/billing/create-subscription", "POST", { plan });
      const data = await res.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManageBilling = async () => {
    try {
      const res = await apiRequest("POST", "/api/billing/portal", {});
      const data = await res.json();
      window.open(data.url, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open billing portal",
        variant: "destructive",
      });
    }
  };

  const handleFeedback = async (rating: number, message: string) => {
    await feedbackMutation.mutateAsync({ rating, message });
  };

  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", "POST", {});
      queryClient.clear();
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const filteredItems = clipboardItems.filter(item =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.contentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">User not found</h2>
          <p className="text-muted-foreground">Please refresh the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold" data-testid="text-app-title">DevClip</h1>
            </div>
            <PlanBadge plan={user.plan as "free" | "pro" | "team"} />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="formatters" data-testid="tab-formatters">
              <Wand2 className="h-4 w-4 mr-2" />
              Formatters
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="feedback" data-testid="tab-feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </TabsTrigger>
          </TabsList>

          {/* Clipboard History */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clipboard history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "No matching items" : "No clipboard items yet"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery 
                    ? "Try a different search query" 
                    : "Your clipboard history will appear here"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <ClipboardCard
                    key={item.id}
                    item={item}
                    onCopy={handleCopyToClipboard}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Formatters */}
          <TabsContent value="formatters">
            <FormattersPanel onSaveToHistory={handleSaveFormattedToHistory} />
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <SettingsPanel
                  user={{
                    email: user.email,
                    username: user.username,
                    plan: user.plan as "free" | "pro" | "team",
                    aiCredits: user.aiCredits,
                  }}
                  onUpgrade={() => setUpgradeModalOpen(true)}
                  onManageBilling={handleManageBilling}
                />
              </div>
              <div>
                <AiActionsPanel
                  onAiAction={handleAiAction}
                  plan={user.plan as "free" | "pro" | "team"}
                  credits={user.aiCredits}
                  onUpgrade={() => setUpgradeModalOpen(true)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback">
            <div className="max-w-2xl mx-auto">
              <FeedbackForm onSubmit={handleFeedback} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onSelectPlan={handleUpgrade}
      />
    </div>
  );
}
