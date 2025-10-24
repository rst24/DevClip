import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlanBadge } from "@/components/PlanBadge";
import { ClipboardCard } from "@/components/ClipboardCard";
import { UpgradeModal } from "@/components/UpgradeModal";

// Lazy load heavy components for code splitting
const FormattersPanel = lazy(() => import("@/components/FormattersPanel").then(m => ({ default: m.FormattersPanel })));
const AiActionsPanel = lazy(() => import("@/components/AiActionsPanel").then(m => ({ default: m.AiActionsPanel })));
const SettingsPanel = lazy(() => import("@/components/SettingsPanel").then(m => ({ default: m.SettingsPanel })));
const FeedbackForm = lazy(() => import("@/components/FeedbackForm").then(m => ({ default: m.FeedbackForm })));
const Analytics = lazy(() => import("@/components/Analytics").then(m => ({ default: m.Analytics })));
import { 
  History, 
  Wand2, 
  Settings, 
  MessageSquare, 
  Search,
  Sparkles,
  Loader2,
  LogOut,
  LogIn,
  Cloud,
  HardDrive,
  BarChart3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { localStorageManager, type LocalClipboardItem } from "@/lib/localStorage";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ClipboardItem, User } from "@shared/schema";

export default function Dashboard() {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localItems, setLocalItems] = useState<LocalClipboardItem[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  // Fetch clipboard history (only for authenticated users)
  const { data: clipboardItems = [], isLoading: historyLoading } = useQuery<ClipboardItem[]>({
    queryKey: ["/api/history"],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (error instanceof Error && isUnauthorizedError(error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Load local items for anonymous users
  useEffect(() => {
    if (!isAuthenticated) {
      setLocalItems(localStorageManager.getItems());
    }
  }, [isAuthenticated]);

  // Check for migration opportunity when user logs in
  useEffect(() => {
    if (isAuthenticated && localStorageManager.hasItems()) {
      const itemCount = localStorageManager.getItems().length;
      toast({
        title: "Local data found",
        description: `You have ${itemCount} clipboard item${itemCount > 1 ? 's' : ''} saved locally. Migrate to cloud for sync across devices?`,
        action: (
          <Button
            size="sm"
            onClick={() => migrateDataMutation.mutate()}
            disabled={migrateDataMutation.isPending}
            data-testid="button-migrate-data"
          >
            {migrateDataMutation.isPending ? "Migrating..." : "Migrate"}
          </Button>
        ),
      });
    }
  }, [isAuthenticated, toast]);

  // Toggle favorite mutation (authenticated)
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest(`/api/history/${id}/favorite`, "PUT", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
  });

  // Create clipboard item mutation (authenticated)
  const createClipboardMutation = useMutation({
    mutationFn: async (data: { content: string; contentType: string; formatted: boolean }) => {
      const res = await apiRequest("/api/history", "POST", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
  });

  // Migrate local data mutation
  const migrateDataMutation = useMutation({
    mutationFn: async () => {
      const localData = localStorageManager.getItems();
      const res = await apiRequest("/api/migrate-local-data", "POST", {
        clipboardItems: localData.map(item => ({
          content: item.content,
          contentType: item.contentType,
          formatted: item.formatted,
          favorite: item.favorite,
        })),
      });
      return res.json();
    },
    onSuccess: (data) => {
      localStorageManager.clear();
      setLocalItems([]);
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "Migration complete!",
        description: `${data.itemsCreated} items migrated to cloud successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Migration failed",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  // AI processing mutation (authenticated)
  const aiMutation = useMutation({
    mutationFn: async ({ text, operation }: { text: string; operation: string }) => {
      const res = await apiRequest("/api/v1/ai/process", "POST", { text, operation });
      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  // Feedback mutation (authenticated)
  const feedbackMutation = useMutation({
    mutationFn: async ({ rating, message }: { rating: number; message: string }) => {
      const res = await apiRequest("/api/feedback", "POST", { rating, message, userId: user?.id });
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
    if (isAuthenticated) {
      toggleFavoriteMutation.mutate(id);
    } else {
      // Handle local storage toggle
      localStorageManager.toggleFavorite(id);
      setLocalItems(localStorageManager.getItems());
    }
  };

  const handleSaveFormattedToHistory = (content: string, contentType: string) => {
    if (isAuthenticated) {
      // Save formatted content to clipboard history via API
      createClipboardMutation.mutate({
        content,
        contentType,
        formatted: true,
      });
    } else {
      // Save to local storage
      localStorageManager.addItem({
        content,
        contentType,
        formatted: true,
        favorite: false,
      });
      setLocalItems(localStorageManager.getItems());
      toast({
        title: "Saved locally",
        description: "Formatted content saved to local storage",
      });
    }
  };

  const handleAiAction = async (text: string, operation: string): Promise<string> => {
    if (!isAuthenticated) {
      throw new Error("AI features require authentication");
    }

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

  const handleUpgrade = async (plan: "pro" | "team", billingInterval: "month" | "year") => {
    try {
      setUpgradeModalOpen(false);
      toast({
        title: "Redirecting to checkout",
        description: `Opening Stripe checkout for ${plan} plan (${billingInterval === "year" ? "annual" : "monthly"})...`,
      });
      
      const res = await apiRequest("/api/billing/create-subscription", "POST", { plan, billingInterval });
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
      const res = await apiRequest("/api/billing/portal", "POST", {});
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

  const handleSignIn = () => {
    window.location.href = "/auth/replit";
  };

  // Determine which items to display and filter
  const displayItems = isAuthenticated ? clipboardItems : localItems;
  const filteredItems = displayItems.filter(item =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.contentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            {isAuthenticated && user && (
              <PlanBadge plan={user.plan as "free" | "pro" | "team"} />
            )}
            {/* Mode indicator */}
            <Badge 
              variant={isAuthenticated ? "default" : "secondary"}
              className="gap-1"
              data-testid="badge-mode-indicator"
            >
              {isAuthenticated ? (
                <>
                  <Cloud className="h-3 w-3" />
                  Cloud Sync
                </>
              ) : (
                <>
                  <HardDrive className="h-3 w-3" />
                  Local Mode
                </>
              )}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignIn}
                data-testid="button-signin"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className={`grid w-full ${isAuthenticated ? 'grid-cols-5' : 'grid-cols-2'} max-w-3xl mx-auto`}>
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="formatters" data-testid="tab-formatters">
              <Wand2 className="h-4 w-4 mr-2" />
              Formatters
            </TabsTrigger>
            {isAuthenticated && (
              <>
                <TabsTrigger value="analytics" data-testid="tab-analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="settings" data-testid="tab-settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="feedback" data-testid="tab-feedback">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Feedback
                </TabsTrigger>
              </>
            )}
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

            {!isAuthenticated && (
              <div className="bg-muted/50 border rounded-lg p-4 text-sm">
                <p className="text-muted-foreground">
                  You're using DevClip in local mode. Your clipboard items are stored in your browser. 
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={handleSignIn}
                    data-testid="button-signin-prompt"
                  >
                    Sign in
                  </Button>
                  {" "}to sync across devices and unlock AI features.
                </p>
              </div>
            )}

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
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <FormattersPanel onSaveToHistory={handleSaveFormattedToHistory} />
            </Suspense>
          </TabsContent>

          {/* Analytics - Authenticated only */}
          {isAuthenticated && (
            <TabsContent value="analytics">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }>
                <Analytics />
              </Suspense>
            </TabsContent>
          )}

          {/* Settings - Authenticated only */}
          {isAuthenticated && user && (
            <TabsContent value="settings">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <SettingsPanel
                      user={{
                        email: user.email,
                        username: user.username,
                        plan: user.plan as "free" | "pro" | "team",
                        aiCredits: user.aiCreditsBalance ?? 50,
                      }}
                      onUpgrade={() => setUpgradeModalOpen(true)}
                      onManageBilling={handleManageBilling}
                    />
                  </div>
                  <div>
                    <AiActionsPanel
                      onAiAction={handleAiAction}
                      plan={user.plan as "free" | "pro" | "team"}
                      credits={user.aiCreditsBalance ?? 50}
                      onUpgrade={() => setUpgradeModalOpen(true)}
                    />
                  </div>
                </div>
              </Suspense>
            </TabsContent>
          )}

          {/* Feedback - Authenticated only */}
          {isAuthenticated && (
            <TabsContent value="feedback">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }>
                <div className="max-w-2xl mx-auto">
                  <FeedbackForm onSubmit={handleFeedback} />
                </div>
              </Suspense>
            </TabsContent>
          )}
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
