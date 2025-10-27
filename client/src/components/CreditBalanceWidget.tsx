import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreditBalanceWidgetProps {
  balance: number;
  plan: "free" | "pro" | "team";
}

export function CreditBalanceWidget({
  balance,
  plan,
}: CreditBalanceWidgetProps) {
  // Get monthly allocation based on plan
  const getAllocation = () => {
    if (plan === "free") return 50;
    if (plan === "pro") return 5000;
    return 25000; // team
  };

  const allocation = getAllocation();
  const percentage = (balance / allocation) * 100;

  // Determine color based on remaining percentage
  const getVariant = () => {
    if (percentage > 50) return "default"; // Green
    if (percentage > 20) return "secondary"; // Yellow
    return "destructive"; // Red
  };

  const getTooltipText = () => {
    const used = allocation - balance;
    return `${used.toLocaleString()} of ${allocation.toLocaleString()} credits used this month`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Badge
              variant={getVariant()}
              className="gap-1.5 cursor-help"
              data-testid="badge-credits-widget"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{balance.toLocaleString()}</span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
