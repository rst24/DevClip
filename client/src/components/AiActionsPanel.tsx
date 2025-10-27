import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Code2, Wand2, ScrollText, Copy, Check, ChevronRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AiActionsPanelProps {
  onAiAction: (text: string, operation: string) => Promise<string>;
  plan: "free" | "pro" | "team";
  credits: number;
  onUpgrade: () => void;
}

const aiActions = [
  { 
    id: "explain", 
    label: "Explain Code", 
    icon: Sparkles, 
    description: "Get detailed explanation with examples",
    minCredits: 2,
    placeholder: "Paste your code here...",
  },
  { 
    id: "refactor", 
    label: "Refactor Code", 
    icon: Wand2, 
    description: "Improve code quality & readability",
    minCredits: 3,
    placeholder: "Paste code to refactor...",
  },
  { 
    id: "summarize", 
    label: "Summarize Logs", 
    icon: ScrollText, 
    description: "Extract key insights from logs",
    minCredits: 2,
    placeholder: "Paste your logs here...",
  },
];

// AI model tier mapping
const AI_MODEL_TIERS = {
  free: { 
    model: "GPT-5 Nano", 
    description: "Fast, efficient AI",
    color: "text-blue-600 dark:text-blue-400",
  },
  pro: { 
    model: "GPT-5 Mini", 
    description: "Balanced quality & speed",
    color: "text-purple-600 dark:text-purple-400",
  },
  team: { 
    model: "GPT-5", 
    description: "Premium AI quality",
    color: "text-amber-600 dark:text-amber-400",
  },
};

export function AiActionsPanel({ onAiAction, plan, credits, onUpgrade }: AiActionsPanelProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const canUseAi = credits > 0;
  const modelTier = AI_MODEL_TIERS[plan];

  const handleAiAction = async (operation: string) => {
    if (!input.trim()) {
      toast({
        title: "No input",
        description: "Please enter some code or text to analyze",
        variant: "destructive",
      });
      return;
    }

    if (input.length > 5000) {
      toast({
        title: "Input too long",
        description: "Maximum 5000 characters allowed",
        variant: "destructive",
      });
      return;
    }

    const action = aiActions.find(a => a.id === operation);
    if (action && credits < action.minCredits) {
      toast({
        title: "Not enough credits",
        description: `This action requires ${action.minCredits} credits. You have ${credits}.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSelectedAction(operation);
    try {
      const result = await onAiAction(input, operation);
      setOutput(result);
      toast({
        title: "✨ AI processing complete",
        description: `Used ${action?.minCredits || 2} credits`,
      });
    } catch (error) {
      toast({
        title: "AI processing failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      setOutput("");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "AI output copied to clipboard",
    });
  };

  const formatOutput = (text: string) => {
    // Split into sections based on markdown-like patterns
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('###')) {
        return (
          <div key={idx} className="text-base font-semibold mt-4 mb-2 text-foreground">
            {line.replace(/^###\s*/, '')}
          </div>
        );
      }
      if (line.startsWith('##')) {
        return (
          <div key={idx} className="text-lg font-bold mt-5 mb-3 text-foreground">
            {line.replace(/^##\s*/, '')}
          </div>
        );
      }
      
      // Code blocks
      if (line.startsWith('```')) {
        return <div key={idx} className="text-xs text-muted-foreground">{line}</div>;
      }
      
      // Bold text
      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={idx} className="mb-1">
            {parts.map((part, i) => 
              part.startsWith('**') && part.endsWith('**') ? (
                <span key={i} className="font-semibold text-foreground">
                  {part.slice(2, -2)}
                </span>
              ) : (
                <span key={i} className="text-muted-foreground">{part}</span>
              )
            )}
          </div>
        );
      }
      
      // Bullet points
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return (
          <div key={idx} className="flex gap-2 mb-1 text-muted-foreground">
            <span className="text-primary">•</span>
            <span>{line.replace(/^[\s-•]+/, '')}</span>
          </div>
        );
      }
      
      // Regular text
      return line.trim() ? (
        <div key={idx} className="mb-1 text-muted-foreground">{line}</div>
      ) : (
        <div key={idx} className="h-2" />
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Model Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                AI-Powered Tools
                <Badge variant="secondary" data-testid="badge-ai-model" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  {modelTier.model}
                </Badge>
              </CardTitle>
              <CardDescription>
                {modelTier.description} • {credits} credits remaining
              </CardDescription>
            </div>
            {plan === "free" && (
              <Button size="sm" onClick={onUpgrade} data-testid="button-upgrade-ai">
                <ChevronRight className="h-4 w-4 mr-1" />
                Upgrade for Better AI
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Action Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {aiActions.map((action) => {
          const Icon = action.icon;
          const disabled = loading || !canUseAi || credits < action.minCredits;
          const isSelected = selectedAction === action.id;
          
          return (
            <Card
              key={action.id}
              className={cn(
                "cursor-pointer transition-all border-2",
                disabled ? "opacity-60 cursor-not-allowed" : "hover-elevate active-elevate-2",
                isSelected && !disabled ? "border-primary" : "border-transparent"
              )}
              onClick={() => !disabled && handleAiAction(action.id)}
              data-testid={`button-ai-${action.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2.5 rounded-lg",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-1">{action.label}</div>
                    <div className="text-xs text-muted-foreground mb-2">{action.description}</div>
                    <Badge variant="outline" className="text-xs">
                      {action.minCredits} credits
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Input/Output Tabs */}
      <Card>
        <Tabs defaultValue="input" className="w-full">
          <CardHeader className="pb-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input" data-testid="tab-ai-input">
                <Code2 className="h-4 w-4 mr-2" />
                Input
              </TabsTrigger>
              <TabsTrigger value="output" data-testid="tab-ai-output" disabled={!output}>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Output
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="input" className="mt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {selectedAction 
                      ? aiActions.find(a => a.id === selectedAction)?.placeholder 
                      : "Select an AI action above"}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {input.length} / 5,000
                  </span>
                </div>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    selectedAction
                      ? aiActions.find(a => a.id === selectedAction)?.placeholder
                      : "Select an AI action above, then paste your code or logs here..."
                  }
                  className="font-mono text-sm min-h-[400px] resize-y"
                  disabled={!canUseAi || loading}
                  data-testid="textarea-ai-input"
                />
              </div>
            </TabsContent>

            <TabsContent value="output" className="mt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">AI-Generated Response</label>
                  {output && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopy}
                      data-testid="button-copy-ai-output"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                {output ? (
                  <ScrollArea className="h-[400px] w-full rounded-md border bg-muted/30 p-4">
                    <div className="space-y-1 text-sm">
                      {formatOutput(output)}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-[400px] rounded-md border bg-muted/30 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">AI output will appear here</p>
                      <p className="text-xs mt-1">Select an action and provide input to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
