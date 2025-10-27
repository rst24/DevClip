import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlanBadge } from "./PlanBadge";
import {
  User,
  Settings,
  CreditCard,
  Key,
  LogOut,
  Zap,
} from "lucide-react";

interface UserProfileDropdownProps {
  user: {
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    plan: "free" | "pro" | "team";
    aiCreditsBalance: number;
  };
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  onManageBilling?: () => void;
}

export function UserProfileDropdown({
  user,
  onNavigate,
  onLogout,
  onManageBilling,
}: UserProfileDropdownProps) {
  const getInitials = () => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    if (first && last) return `${first}${last}`.toUpperCase();
    if (user.email) return user.email.slice(0, 2).toUpperCase();
    return "U";
  };

  const getDisplayName = () => {
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(" ");
    }
    return user.email;
  };

  const isPaidPlan = user.plan === "pro" || user.plan === "team";

  // Get credit status color
  const getCreditStatusColor = () => {
    const balance = user.aiCreditsBalance;
    const allocation =
      user.plan === "free" ? 50 : user.plan === "pro" ? 5000 : 25000;
    const percentage = (balance / allocation) * 100;

    if (percentage > 50) return "text-green-600 dark:text-green-400";
    if (percentage > 20) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-user-profile"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImageUrl} alt={getDisplayName()} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">
                {getDisplayName()}
              </p>
              <PlanBadge plan={user.plan} />
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Credits Balance */}
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              <span>Credits</span>
            </div>
            <Badge
              variant="outline"
              className={getCreditStatusColor()}
              data-testid="badge-credits-balance"
            >
              {user.aiCreditsBalance.toLocaleString()}
            </Badge>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onNavigate("settings")}
          data-testid="menu-settings"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        {isPaidPlan && onManageBilling && (
          <DropdownMenuItem
            onClick={onManageBilling}
            data-testid="menu-billing"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Manage Billing</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => onNavigate("settings")}
          data-testid="menu-api-keys"
        >
          <Key className="mr-2 h-4 w-4" />
          <span>API Keys</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogout} data-testid="menu-logout">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
