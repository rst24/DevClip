import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  Zap,
  TrendingUp,
  Clock,
  Wand2,
  Sparkles,
  Database,
  ChevronDown,
  ChevronUp,
  Copy,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import type { ClipboardItem, User } from "@shared/schema";
import { cn } from "@/lib/utils";

interface DashboardHomeProps {
  user: User;
  onNavigateToTab: (tab: string) => void;
  clipboardItems: ClipboardItem[];
  onCopyToClipboard: (content: string) => Promise<void>;
  onToggleFavorite: (id: string) => void;
}

interface AnalyticsData {
  summary: {
    totalOperations: number;
    totalTokensUsed: number;
    averageTokensPerOperation: string;
  };
  dailyTimeSeries: Array<{
    date: string;
    operations: number;
    tokens: number;
  }>;
  recentOperations: Array<{
    id: string;
    operationType: string;
    tokensCharged: number;
    createdAt: string;
  }>;
}

export function DashboardHome({
  user,
  onNavigateToTab,
  clipboardItems,
  onCopyToClipboard,
  onToggleFavorite,
}: DashboardHomeProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
  });

  const recentItems = clipboardItems.slice(0, 5);
  const plan = (user as any).plan as "free" | "pro" | "team";
  const tokensUsed = (user as any).tokensUsed || 0;
  const tokensTotal = plan === "pro" ? 300 : plan === "team" ? 1000 : 100;
  const tokensRemaining = tokensTotal - tokensUsed;
  const usagePercent = (tokensUsed / tokensTotal) * 100;

  const toggleItemExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getOperationLabel = (type: string) => {
    const labels: Record<string, string> = {
      explain: 'Explain Code',
      refactor: 'Refactor Code',
      summarize: 'Summarize Logs',
    };
    return labels[type] || type;
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold mb-1" data-testid="text-dashboard-welcome">
          Welcome back{(user as any).firstName ? `, ${(user as any).firstName}` : ''}!
        </h2>
        <p className="text-muted-foreground">
          Here's your DevClip activity overview
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Tokens Overview */}
        <Card data-testid="card-tokens-overview">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Tokens</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-tokens-remaining">
              {tokensRemaining.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              of {tokensTotal.toLocaleString()} remaining this month
            </p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  usagePercent >= 90 ? "bg-destructive" :
                  usagePercent >= 80 ? "bg-orange-500" :
                  "bg-primary"
                )}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                data-testid="progress-tokens-usage"
              />
            </div>
          </CardContent>
        </Card>

        {/* Total Operations */}
        {analyticsLoading ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card data-testid="card-total-operations">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-operations">
                {analyticsData?.summary.totalOperations || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time AI requests
              </p>
            </CardContent>
          </Card>
        )}

        {/* Code Memory */}
        <Card data-testid="card-memory-count">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Memory</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-memory-count">
              {clipboardItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Saved snippets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trend Chart */}
      {analyticsLoading ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ) : analyticsData && analyticsData.dailyTimeSeries.length > 0 ? (
        <Card data-testid="card-usage-trend">
          <CardHeader>
            <CardTitle className="text-base">Usage Trend (Last 30 Days)</CardTitle>
            <CardDescription>Daily AI operations and tokens consumed</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analyticsData.dailyTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  className="text-muted-foreground"
                />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                />
                <Line
                  type="monotone"
                  dataKey="operations"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Operations"
                />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Tokens"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}

      {/* Quick Actions */}
      <Card data-testid="card-quick-actions">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Jump to your most-used features</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="justify-start h-auto py-3"
            onClick={() => onNavigateToTab('formatters')}
            data-testid="button-quick-formatters"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            <div className="text-left flex-1">
              <div className="font-medium">Format Code</div>
              <div className="text-xs text-muted-foreground">13 languages supported</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-3"
            onClick={() => onNavigateToTab('ai-tools')}
            data-testid="button-quick-ai-tools"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <div className="text-left flex-1">
              <div className="font-medium">AI Tools</div>
              <div className="text-xs text-muted-foreground">{tokensRemaining} tokens left</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-3"
            onClick={() => onNavigateToTab('memory')}
            data-testid="button-quick-memory"
          >
            <Database className="h-4 w-4 mr-2" />
            <div className="text-left flex-1">
              <div className="font-medium">Code Memory</div>
              <div className="text-xs text-muted-foreground">{clipboardItems.length} snippets saved</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-3"
            onClick={() => onNavigateToTab('settings')}
            data-testid="button-quick-settings"
          >
            <Activity className="h-4 w-4 mr-2" />
            <div className="text-left flex-1">
              <div className="font-medium">API Keys</div>
              <div className="text-xs text-muted-foreground">Manage integrations</div>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card data-testid="card-recent-activity">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Your latest clipboard items</CardDescription>
            </div>
            {recentItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToTab('memory')}
                data-testid="button-view-all-memory"
              >
                View All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentItems.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Use formatters or AI tools to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentItems.map((item) => {
                const isExpanded = expandedItems.has(item.id);
                const displayContent = isExpanded ? item.content : truncateContent(item.content);

                return (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 space-y-2"
                    data-testid={`activity-item-${item.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.contentType}
                          </Badge>
                          {item.formatted && (
                            <Badge variant="outline" className="text-xs">
                              <Wand2 className="h-3 w-3 mr-1" />
                              Formatted
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                          {displayContent}
                        </pre>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopyToClipboard(item.content)}
                        data-testid={`button-copy-${item.id}`}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleFavorite(item.id)}
                        data-testid={`button-favorite-${item.id}`}
                      >
                        <Star
                          className={cn(
                            "h-3 w-3 mr-1",
                            item.favorite && "fill-current text-yellow-500"
                          )}
                        />
                        {item.favorite ? 'Unfavorite' : 'Favorite'}
                      </Button>
                      {item.content.length > 120 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleItemExpanded(item.id)}
                          data-testid={`button-expand-${item.id}`}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3 mr-1" />
                              Collapse
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" />
                              Expand
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
