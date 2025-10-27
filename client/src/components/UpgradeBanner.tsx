import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

interface UpgradeBannerProps {
  onUpgradeClick: () => void;
  userPlan: "free" | "pro" | "team";
}

export function UpgradeBanner({ onUpgradeClick, userPlan }: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Only show for free users
  if (userPlan !== "free" || dismissed) {
    return null;
  }

  return (
    <Alert className="border-primary/50 bg-primary/10" data-testid="alert-upgrade-banner">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
          <AlertDescription className="text-sm">
            <strong className="font-semibold">Upgrade to Pro</strong> for 5,000 AI credits/month,
            cloud sync, and priority support. Only <strong>$8.99/month</strong>.
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={onUpgradeClick}
            data-testid="button-upgrade-banner"
          >
            Upgrade Now
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setDismissed(true)}
            data-testid="button-dismiss-banner"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
}
