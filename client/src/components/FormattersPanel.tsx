import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileJson, FileCode, Database, Eraser, FileText, Code2, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  formatJson, 
  formatYaml, 
  formatSql, 
  stripAnsi, 
  logToMarkdown 
} from "@/lib/formatters";
import { formatCode, detectLanguage, supportedLanguages } from "@/lib/universalFormatter";

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

const universalFormatter = {
  id: "auto",
  label: "Smart Format",
  icon: Sparkles,
  description: `Auto-detect & format code (13 languages supported)`,
};

export function FormattersPanel({ onSaveToHistory }: FormattersPanelProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
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
      
      // Universal formatter with auto-detection
      if (formatType === "auto") {
        const language = detectLanguage(input);
        setDetectedLang(language);
        result = await formatCode(input, language);
        
        toast({
          title: "Formatted successfully",
          description: `Detected ${language.toUpperCase()} and formatted locally`,
        });
      } else {
        // Legacy formatters
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
        
        toast({
          title: "Formatted successfully",
          description: `Applied ${formatType} formatting locally`,
        });
      }
      
      setOutput(result);
      
      // Optionally save to history
      if (onSaveToHistory) {
        onSaveToHistory(result, formatType);
      }
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Local Formatters</h2>
        <p className="text-sm text-muted-foreground mb-4">
          All formatting happens locally for privacy and speed
        </p>
      </div>

      {/* Universal Smart Formatter */}
      <Card className="p-4 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{universalFormatter.label}</h3>
              <Badge variant="secondary" className="text-xs">New</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {universalFormatter.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {supportedLanguages.slice(0, 8).map((lang) => (
                <Badge key={lang.id} variant="outline" className="text-xs">
                  {lang.label}
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs">+{supportedLanguages.length - 8} more</Badge>
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => handleFormat("auto")}
            disabled={loading || !input.trim()}
            data-testid="button-format-auto"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Format
          </Button>
        </div>
      </Card>

      {/* Legacy Formatters */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Quick Formatters</h3>
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
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Output</label>
              {detectedLang && (
                <Badge variant="secondary" className="text-xs">
                  {detectedLang.toUpperCase()}
                </Badge>
              )}
            </div>
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
