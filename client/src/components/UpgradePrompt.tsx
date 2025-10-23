import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Cloud, Zap, Check } from "lucide-react";

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

export function UpgradePrompt({ open, onOpenChange, feature = "AI features" }: UpgradePromptProps) {
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-upgrade-prompt">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Sign In to Unlock {feature}
          </DialogTitle>
          <DialogDescription>
            Create a free account to access powerful features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">50 Free AI Credits Monthly</p>
                <p className="text-sm text-muted-foreground">
                  Explain code, refactor snippets, summarize logs
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Cloud className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Cloud Sync</p>
                <p className="text-sm text-muted-foreground">
                  Access your clipboard history from any device
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Unlimited History</p>
                <p className="text-sm text-muted-foreground">
                  Never lose your formatted snippets
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <Button 
              className="w-full" 
              onClick={handleSignIn}
              data-testid="button-signin-upgrade"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Sign In with Replit
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Free forever • No credit card required
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
