import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileJson, FileCode, Database, Eraser, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  formatJson, 
  formatYaml, 
  formatSql, 
  stripAnsi, 
  logToMarkdown 
} from "@/lib/formatters";

interface FormattersPanelProps {
  onSaveToHistory?: (content: string, contentType: string) => void;
}

const formatters = [
  { id: "json", label: "JSON", icon: FileJson, description: "Prettify JSON" },
  { id: "yaml", label: "YAML", icon: FileCode, description: "Format YAML" },
  { id: "sql", label: "SQL", icon: Database, description: "Format SQL" },
  { id: "ansi-clean", label: "Strip ANSI", icon: Eraser, description: "Remove color codes" },
  { id: "log-to-markdown", label: "Log→MD", icon: FileText, description: "Convert logs to Markdown" },
];

export function FormattersPanel({ onSaveToHistory }: FormattersPanelProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFormat = async (formatType: string) => {
    if (!input.trim()) {
      toast({
        title: "No input",
        description: "Please enter some text to format",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let result: string;
      
      // All formatting happens locally in the browser
      switch (formatType) {
        case "json":
          result = formatJson(input);
          break;
        case "yaml":
          result = formatYaml(input);
          break;
        case "sql":
          result = formatSql(input);
          break;
        case "ansi-clean":
          result = stripAnsi(input);
          break;
        case "log-to-markdown":
          result = logToMarkdown(input);
          break;
        default:
          throw new Error("Unknown format type");
      }
      
      setOutput(result);
      
      // Optionally save to history
      if (onSaveToHistory) {
        onSaveToHistory(result, formatType);
      }
      
      toast({
        title: "Formatted successfully",
        description: `Applied ${formatType} formatting locally`,
      });
    } catch (error) {
      toast({
        title: "Format failed",
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
      description: "Output copied to clipboard",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Local Formatters</h2>
        <p className="text-sm text-muted-foreground mb-4">
          All formatting happens locally for privacy and speed
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {formatters.map((formatter) => {
          const Icon = formatter.icon;
          return (
            <Button
              key={formatter.id}
              variant="outline"
              className="flex-col h-auto py-3 gap-2"
              onClick={() => handleFormat(formatter.id)}
              disabled={loading || !input.trim()}
              data-testid={`button-format-${formatter.id}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{formatter.label}</span>
            </Button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Input</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your text here..."
            className="font-mono text-xs min-h-[300px] resize-none"
            data-testid="textarea-input"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Output</label>
            {output && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                data-testid="button-copy-output"
              >
                Copy
              </Button>
            )}
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Formatted output will appear here..."
            className="font-mono text-xs min-h-[300px] resize-none bg-muted/50"
            data-testid="textarea-output"
          />
        </div>
      </div>
    </div>
  );
}
