import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlanBadge } from "./PlanBadge";
import { 
  Settings, 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Database,
  ExternalLink,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface SettingsPanelProps {
  user: {
    email: string;
    username: string;
    plan: "free" | "pro" | "team";
    aiCredits: number;
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

          <div>
            <Label className="text-sm text-muted-foreground">Username</Label>
            <div className="text-sm font-medium mt-1" data-testid="text-user-username">
              {user.username}
            </div>
          </div>

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
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">AI Credits</div>
              <div className="text-sm text-muted-foreground">
                {user.plan === "free" ? "10/month on Free plan" : 
                 user.plan === "pro" ? "250/month on Pro plan" :
                 "2000/month on Team plan"}
              </div>
            </div>
            <Badge variant="outline" data-testid="text-credits-remaining">
              {user.aiCredits} remaining
            </Badge>
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
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Clipboard history stored in IndexedDB (local)
            </span>
          </div>

          <Button variant="outline" size="sm" className="mt-2" data-testid="button-clear-history">
            Clear Local History
          </Button>
        </div>
      </Card>
    </div>
  );
}
