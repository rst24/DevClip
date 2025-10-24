import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, TrendingUp, Download, Activity, Zap } from "lucide-react";
import { format } from "date-fns";

interface AnalyticsData {
  summary: {
    totalOperations: number;
    totalCreditsUsed: number;
    averageCreditsPerOperation: string;
  };
  byOperationType: Array<{
    operationType: string;
    count: number;
    credits: number;
  }>;
  dailyTimeSeries: Array<{
    date: string;
    operations: number;
    credits: number;
  }>;
  recentOperations: Array<{
    id: string;
    operationType: string;
    creditsUsed: number;
    createdAt: string;
  }>;
}

const COLORS = ['#0066cc', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Analytics() {
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
  });

  const handleExportCSV = () => {
    if (!data) return;
    
    // Create CSV content
    const csvRows = [
      ['Date', 'Operations', 'Credits'].join(','),
      ...data.dailyTimeSeries.map(row => 
        [row.date, row.operations, row.credits].join(',')
      ),
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devclip-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getOperationLabel = (type: string) => {
    const labels: Record<string, string> = {
      explain: 'Explain Code',
      refactor: 'Refactor Code',
      summarize: 'Summarize Logs',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Failed to load analytics data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const hasData = data.summary.totalOperations > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card data-testid="card-total-operations">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-operations">
              {data.summary.totalOperations}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time API requests
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-credits">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-credits">
              {data.summary.totalCreditsUsed}
            </div>
            <p className="text-xs text-muted-foreground">
              Total credits consumed
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-credits">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Credits/Operation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-credits">
              {data.summary.averageCreditsPerOperation}
            </div>
            <p className="text-xs text-muted-foreground">
              Average efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {!hasData ? (
        <Card>
          <CardHeader>
            <CardTitle>No Data Yet</CardTitle>
            <CardDescription>
              Start using AI features to see your usage analytics here
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          {/* Usage Over Time */}
          <Card data-testid="card-usage-over-time">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Usage Over Time</CardTitle>
                <CardDescription>Last 30 days of API activity</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportCSV}
                data-testid="button-export-csv"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.dailyTimeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="operations" 
                    stroke="#0066cc" 
                    name="Operations"
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="credits" 
                    stroke="#10b981" 
                    name="Credits"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Operation Type Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card data-testid="card-operations-by-type">
              <CardHeader>
                <CardTitle>Operations by Type</CardTitle>
                <CardDescription>Breakdown of AI operations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.byOperationType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="operationType" 
                      tickFormatter={getOperationLabel}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={getOperationLabel}
                    />
                    <Bar dataKey="count" fill="#0066cc" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-credits-by-type">
              <CardHeader>
                <CardTitle>Credits by Type</CardTitle>
                <CardDescription>Credit distribution across operations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.byOperationType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => getOperationLabel(entry.operationType)}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="credits"
                    >
                      {data.byOperationType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Operations */}
          <Card data-testid="card-recent-operations">
            <CardHeader>
              <CardTitle>Recent Operations</CardTitle>
              <CardDescription>Last 10 AI requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentOperations.map((op) => (
                  <div 
                    key={op.id} 
                    className="flex items-center justify-between p-3 rounded-md border"
                    data-testid={`operation-${op.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {getOperationLabel(op.operationType)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(op.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{op.creditsUsed} credits</span>
                    </div>
                  </div>
                ))}
                {data.recentOperations.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent operations
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
