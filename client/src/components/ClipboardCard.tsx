import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Star, Code2, FileJson, Database, FileCode, FileText, ScrollText, Check, Users } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { ClipboardItem } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ClipboardCardProps {
  item: ClipboardItem;
  onCopy: (content: string) => void;
  onToggleFavorite: (id: string) => void;
  onFormat?: (id: string, format: string) => void;
}

const contentTypeIcons = {
  json: FileJson,
  yaml: FileCode,
  sql: Database,
  code: Code2,
  text: FileText,
  log: ScrollText,
};

const contentTypeColors = {
  json: "text-amber-600 dark:text-amber-400",
  yaml: "text-blue-600 dark:text-blue-400",
  sql: "text-purple-600 dark:text-purple-400",
  code: "text-green-600 dark:text-green-400",
  text: "text-muted-foreground",
  log: "text-orange-600 dark:text-orange-400",
};

export function ClipboardCard({ item, onCopy, onToggleFavorite }: ClipboardCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const Icon = contentTypeIcons[item.contentType as keyof typeof contentTypeIcons] || FileText;
  const iconColor = contentTypeColors[item.contentType as keyof typeof contentTypeColors] || "text-muted-foreground";

  const handleCopy = () => {
    onCopy(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const preview = item.content.split('\n').slice(0, 3).join('\n');
  const hasMore = item.content.length > preview.length;

  return (
    <Card 
      className={cn(
        "p-3 hover-elevate active-elevate-2 cursor-pointer transition-all",
        item.favorite && "border-primary/50"
      )}
      onClick={() => setExpanded(!expanded)}
      data-testid={`card-clipboard-${item.id}`}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5", iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {/* Language badge (new memory metadata) */}
            {item.language && (
              <Badge variant="outline" className="text-xs" data-testid={`badge-language-${item.id}`}>
                {item.language}
              </Badge>
            )}
            
            {/* Content type (fallback if no language) */}
            {!item.language && (
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {item.contentType}
              </span>
            )}
            
            {item.formatted && (
              <Badge variant="secondary" className="text-xs">Formatted</Badge>
            )}
            
            {/* Shared status indicator */}
            {item.isShared && (
              <Badge variant="secondary" className="text-xs gap-1" data-testid={`badge-shared-${item.id}`}>
                <Users className="h-3 w-3" />
                Shared
              </Badge>
            )}
            
            <span className="text-xs text-muted-foreground ml-auto">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          {/* Tags (new memory metadata) */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-1 mb-2 flex-wrap">
              {item.tags.map((tag, idx) => (
                <Badge 
                  key={idx} 
                  variant="default" 
                  className="text-xs"
                  data-testid={`badge-tag-${item.id}-${idx}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <pre className={cn(
            "font-mono text-xs whitespace-pre-wrap break-words",
            !expanded && "line-clamp-3"
          )}>
            {expanded ? item.content : preview}
          </pre>
          
          {!expanded && hasMore && (
            <button className="text-xs text-primary hover:underline mt-1">
              Show more
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCopy}
            data-testid={`button-copy-${item.id}`}
            className="h-8 w-8"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onToggleFavorite(item.id)}
            data-testid={`button-favorite-${item.id}`}
            className={cn("h-8 w-8", item.favorite && "text-amber-500")}
          >
            <Star className={cn("h-3.5 w-3.5", item.favorite && "fill-current")} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
