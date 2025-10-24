import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlanBadge } from "./PlanBadge";
import { ApiKeysPanel } from "./ApiKeysPanel";
import { 
  Settings, 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Database,
  ExternalLink,
  Cloud,
  Mail,
  HelpCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface SettingsPanelProps {
  user: {
    email: string;
    plan: "free" | "pro" | "team";
    aiCreditsBalance: number;
    aiCreditsUsed?: number;
    creditCarryover?: number;
    firstName?: string;
    lastName?: string;
  };
  onUpgrade: () => void;
  onManageBilling: () => void;
}

export function SettingsPanel({ user, onUpgrade, onManageBilling }: SettingsPanelProps) {
  const [notifications, setNotifications] = useState(true);
  const [autoFormat, setAutoFormat] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Account Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5" />
          <h3 className="font-semibold">Account</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Email</Label>
            <div className="text-sm font-medium mt-1" data-testid="text-user-email">
              {user.email}
            </div>
          </div>

          {(user.firstName || user.lastName) && (
            <div>
              <Label className="text-sm text-muted-foreground">Name</Label>
              <div className="text-sm font-medium mt-1" data-testid="text-user-name">
                {[user.firstName, user.lastName].filter(Boolean).join(' ')}
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm text-muted-foreground">Plan</Label>
            <div className="mt-1">
              <PlanBadge plan={user.plan} />
            </div>
          </div>
        </div>
      </Card>

      {/* Subscription Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5" />
          <h3 className="font-semibold">Subscription</h3>
        </div>

        <div className="space-y-4">
          {/* Monthly Allocation */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">Monthly Allocation</div>
            <div className="text-sm font-medium" data-testid="text-monthly-allocation">
              {user.plan === "free" ? "50 credits" : 
               user.plan === "pro" ? "5,000 credits" :
               "25,000 credits"}
            </div>
          </div>

          <Separator />

          {/* Current Balance */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Current Balance</div>
              <div className="text-xs text-muted-foreground">
                Available credits
              </div>
            </div>
            <Badge variant="outline" data-testid="text-credits-balance">
              {(user.aiCreditsBalance ?? 50).toLocaleString()} credits
            </Badge>
          </div>

          {/* Credits Used This Month */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Used This Month</div>
              <div className="text-xs text-muted-foreground">
                Credits consumed
              </div>
            </div>
            <Badge variant="secondary" data-testid="text-credits-used">
              {(user.aiCreditsUsed || 0).toLocaleString()} credits
            </Badge>
          </div>

          {/* Carryover Credits (Pro/Team only) */}
          {user.plan !== "free" && (user.creditCarryover ?? 0) > 0 && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Carryover Credits</div>
                <div className="text-xs text-muted-foreground">
                  From previous month
                </div>
              </div>
              <Badge variant="outline" data-testid="text-credits-carryover">
                {(user.creditCarryover ?? 0).toLocaleString()} credits
              </Badge>
            </div>
          )}

          {/* Usage Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-muted-foreground">Usage</div>
              <div className="text-xs text-muted-foreground" data-testid="text-usage-percentage">
                {(() => {
                  const monthlyAllocation = user.plan === "free" ? 50 : user.plan === "pro" ? 5000 : 25000;
                  const usedCredits = user.aiCreditsUsed || 0;
                  const percentage = Math.min(100, Math.round((usedCredits / monthlyAllocation) * 100));
                  return `${percentage}%`;
                })()}
              </div>
            </div>
            <Progress 
              value={(() => {
                const monthlyAllocation = user.plan === "free" ? 50 : user.plan === "pro" ? 5000 : 25000;
                const usedCredits = user.aiCreditsUsed || 0;
                return Math.min(100, (usedCredits / monthlyAllocation) * 100);
              })()} 
              data-testid="progress-credit-usage"
            />
          </div>

          {/* Credit Cost Information */}
          <div className="rounded-md bg-muted p-3">
            <div className="text-xs text-muted-foreground">
              AI actions cost 1-3 credits based on complexity
            </div>
          </div>

          <Separator />

          {user.plan === "free" ? (
            <Button 
              onClick={onUpgrade} 
              className="w-full"
              data-testid="button-upgrade-settings"
            >
              Upgrade to Pro
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={onManageBilling}
              className="w-full"
              data-testid="button-manage-billing"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
          )}
        </div>
      </Card>

      {/* Preferences Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5" />
          <h3 className="font-semibold">Preferences</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications" className="text-sm font-medium">
                Notifications
              </Label>
              <div className="text-sm text-muted-foreground">
                Receive updates and tips
              </div>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
              data-testid="switch-notifications"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoformat" className="text-sm font-medium">
                Auto-format on paste
              </Label>
              <div className="text-sm text-muted-foreground">
                Automatically detect and format
              </div>
            </div>
            <Switch
              id="autoformat"
              checked={autoFormat}
              onCheckedChange={setAutoFormat}
              data-testid="switch-autoformat"
            />
          </div>
        </div>
      </Card>

      {/* API Keys Section */}
      <ApiKeysPanel />

      {/* Privacy Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5" />
          <h3 className="font-semibold">Privacy & Data</h3>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            All formatting happens locally in your browser. Only AI features make 
            API calls with your explicit consent.
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Cloud className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Clipboard history synced securely to the cloud
            </span>
          </div>

          <Button variant="outline" size="sm" className="mt-2" data-testid="button-clear-history">
            Clear History
          </Button>
        </div>
      </Card>

      {/* Support Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5" />
          <h3 className="font-semibold">Help & Support</h3>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Need help with DevClip? Our support team is here for you.
          </div>

          <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
            <Mail className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="text-sm font-medium">Email Support</div>
              <a 
                href="mailto:support@devclip.xyz" 
                className="text-sm text-primary hover:underline"
                data-testid="link-support-email-settings"
              >
                support@devclip.xyz
              </a>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            We typically respond within 24 hours
          </div>

          <Separator />

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/docs'}
            data-testid="button-view-docs"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View API Documentation
          </Button>
        </div>
      </Card>
    </div>
  );
}
