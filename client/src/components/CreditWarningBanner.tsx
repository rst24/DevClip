import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";

interface CreditWarningBannerProps {
  creditsUsed: number;
  creditsTotal: number;
  onUpgradeClick: () => void;
}

export function CreditWarningBanner({
  creditsUsed,
  creditsTotal,
  onUpgradeClick,
}: CreditWarningBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const usagePercent = (creditsUsed / creditsTotal) * 100;
  const creditsRemaining = creditsTotal - creditsUsed;
  const isDepleted = creditsRemaining <= 0;

  // Reset dismissed state when severity escalates or credits replenish
  useEffect(() => {
    if (isDepleted) {
      // Always show critical depletion warning even if previously dismissed
      setDismissed(false);
    } else if (usagePercent < 80) {
      // Reset when credits drop below warning threshold
      setDismissed(false);
    }
  }, [isDepleted, usagePercent]);

  // Show warning at 80% usage or when depleted
  const shouldShow = usagePercent >= 80 || creditsRemaining <= 0;

  if (!shouldShow || dismissed) {
    return null;
  }

  return (
    <Alert
      className={isDepleted ? "border-destructive/50 bg-destructive/10" : "border-yellow-500/50 bg-yellow-500/10"}
      data-testid="alert-credit-warning"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertTriangle
            className={`h-5 w-5 flex-shrink-0 ${isDepleted ? "text-destructive" : "text-yellow-600 dark:text-yellow-500"}`}
          />
          <AlertDescription className="text-sm">
            {isDepleted ? (
              <>
                <strong className="font-semibold">AI credits depleted!</strong> You've used all {creditsTotal} credits
                this month. Upgrade to Pro for 5,000 credits/month.
              </>
            ) : (
              <>
                <strong className="font-semibold">Low on credits!</strong> You have {creditsRemaining} of {creditsTotal} AI
                credits remaining this month ({Math.round(100 - usagePercent)}% left).
              </>
            )}
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isDepleted ? "destructive" : "default"}
            onClick={onUpgradeClick}
            data-testid="button-upgrade-credits"
          >
            {isDepleted ? "Upgrade Now" : "Get More Credits"}
          </Button>
          {!isDepleted && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setDismissed(true)}
              data-testid="button-dismiss-warning"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}
