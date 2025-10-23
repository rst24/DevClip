import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Code2, Wand2, ScrollText, Lock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
    description: "Get a clear explanation",
    minCredits: 2,
  },
  { 
    id: "refactor", 
    label: "Refactor", 
    icon: Wand2, 
    description: "Improve code quality",
    minCredits: 3,
  },
  { 
    id: "summarize", 
    label: "Summarize Logs", 
    icon: ScrollText, 
    description: "Extract key insights",
    minCredits: 2,
  },
];

export function AiActionsPanel({ onAiAction, plan, credits, onUpgrade }: AiActionsPanelProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const canUseAi = plan !== "free" && credits > 0;

  const handleAiAction = async (operation: string) => {
    if (plan === "free") {
      onUpgrade();
      return;
    }

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
    try {
      const result = await onAiAction(input, operation);
      setOutput(result);
      toast({
        title: "AI processing complete",
        description: `Used ${action?.minCredits || 2} credits`,
      });
    } catch (error) {
      toast({
        title: "AI processing failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    toast({
      title: "Copied!",
      description: "AI output copied to clipboard",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">AI-Powered Tools</h2>
          {plan !== "free" && (
            <Badge variant="outline" data-testid="badge-credits">
              {credits} credits
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {plan === "free" 
            ? "Upgrade to Pro to unlock AI features" 
            : "GPT-4o-mini powered code analysis and summarization"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {aiActions.map((action) => {
          const Icon = action.icon;
          const disabled = loading || !canUseAi || credits < action.minCredits;
          
          return (
            <Card
              key={action.id}
              className={cn(
                "p-4 cursor-pointer transition-all relative",
                disabled ? "opacity-60" : "hover-elevate active-elevate-2"
              )}
              onClick={() => !disabled && handleAiAction(action.id)}
              data-testid={`button-ai-${action.id}`}
            >
              {plan === "free" && (
                <div className="absolute top-2 right-2">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm mb-1">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.minCredits} credits
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Input</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your code or logs here..."
            className="font-mono text-xs min-h-[300px] resize-none"
            disabled={!canUseAi}
            data-testid="textarea-ai-input"
          />
          <div className="text-xs text-muted-foreground">
            {input.length} / 5000 characters
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">AI Output</label>
            {output && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                data-testid="button-copy-ai-output"
              >
                Copy
              </Button>
            )}
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="AI-generated output will appear here..."
            className="font-mono text-xs min-h-[300px] resize-none bg-muted/50"
            data-testid="textarea-ai-output"
          />
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
