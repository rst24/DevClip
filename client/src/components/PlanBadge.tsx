import { Badge } from "@/components/ui/badge";
import { Crown, Users, Zap } from "lucide-react";

interface PlanBadgeProps {
  plan: "free" | "pro" | "team";
  className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const config = {
    free: {
      label: "Free",
      icon: Zap,
      variant: "secondary" as const,
    },
    pro: {
      label: "Pro",
      icon: Crown,
      variant: "default" as const,
    },
    team: {
      label: "Team",
      icon: Users,
      variant: "default" as const,
    },
  };

  const { label, icon: Icon, variant } = config[plan];

  return (
    <Badge variant={variant} className={className} data-testid={`badge-plan-${plan}`}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}
