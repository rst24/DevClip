import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPlan: (
    plan: "pro" | "team",
    billingInterval: "month" | "year",
  ) => void;
}

type BillingInterval = "month" | "year";

const plans = [
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 4.99,
    annualPrice: 49.90,
    icon: Crown,
    description: "Perfect for individual developers",
    features: [
      "5,000 AI credits/month",
      "Credit carryover (up to 10,000)",
      "Up to 6 API keys",
      "Code explanation & refactoring",
      "Log summarization",
      "Cloud clipboard sync",
      "Priority support",
      "All local formatters",
    ],
    popular: true,
  },
  {
    id: "team",
    name: "Team",
    monthlyPrice: 24.99,
    annualPrice: 249.90,
    icon: Users,
    description: "For development teams",
    features: [
      "25,000 AI credits/month",
      "Credit carryover (up to 50,000)",
      "Unlimited API keys",
      "Shared snippet library",
      "Team workspace",
      "Usage analytics",
      "Admin controls",
      "Everything in Pro",
    ],
    popular: false,
  },
];

const freeFeatures = [
  "50 AI credits/month",
  "Local clipboard history",
  "All formatters (JSON, YAML, SQL, etc.)",
  "Privacy-first design",
];

export function UpgradeModal({
  open,
  onClose,
  onSelectPlan,
}: UpgradeModalProps) {
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("month");

  // Track modal shown event
  useEffect(() => {
    if (open) {
      trackEvent('upgrade_modal_shown');
    }
  }, [open]);

  const handleSelectPlan = (plan: "pro" | "team") => {
    trackEvent('upgrade_modal_plan_selected', {
      plan,
      billingInterval,
    });
    onSelectPlan(plan, billingInterval);
  };

  const getPrice = (plan: (typeof plans)[0]) => {
    return billingInterval === "month" ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSavings = (plan: (typeof plans)[0]) => {
    return plan.monthlyPrice * 12 - plan.annualPrice;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        data-testid="dialog-upgrade"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Upgrade DevClip
          </DialogTitle>
          <DialogDescription>
            Unlock AI-powered code tools and cloud sync
          </DialogDescription>
        </DialogHeader>

        {/* Billing Interval Toggle */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant={billingInterval === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setBillingInterval("month")}
            data-testid="button-billing-monthly"
            className="min-w-24"
          >
            Monthly
          </Button>
          <Button
            variant={billingInterval === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setBillingInterval("year")}
            data-testid="button-billing-annual"
            className="min-w-24"
          >
            Annual
          </Button>
          {billingInterval === "year" && (
            <Badge
              variant="default"
              className="ml-2"
              data-testid="badge-annual-savings"
            >
              Save up to $50/year
            </Badge>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {/* Free Plan */}
          <Card className="p-6">
            <div className="mb-4">
              <div className="text-lg font-semibold mb-1">Free</div>
              <div className="text-3xl font-bold mb-2">$0</div>
              <div className="text-sm text-muted-foreground">Forever free</div>
            </div>

            <div className="space-y-3 mb-6">
              {freeFeatures.map((feature, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full"
              disabled
              data-testid="button-plan-free"
            >
              Current Plan
            </Button>
          </Card>

          {/* Pro & Team Plans */}
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = getPrice(plan);
            const savings = getSavings(plan);

            return (
              <Card
                key={plan.id}
                className={cn(
                  "p-6 relative",
                  plan.popular && "border-primary shadow-lg",
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="text-lg font-semibold">{plan.name}</div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold">${price}</div>
                    {billingInterval === "year" && (
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        data-testid={`badge-savings-${plan.id}`}
                      >
                        Save ${savings}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    per {billingInterval}
                    {billingInterval === "year" && (
                      <span className="ml-1 text-xs">
                        (${(price / 12).toFixed(2)}/mo)
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {plan.description}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handleSelectPlan(plan.id as "pro" | "team")}
                  data-testid={`button-plan-${plan.id}`}
                >
                  Upgrade to {plan.name}
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="mt-4 space-y-3">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">
              <strong>All plans include:</strong> Local formatting
              (privacy-first), IndexedDB clipboard history, CORS-enabled API, and
              automatic updates.
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            Questions about pricing or features?{" "}
            <a 
              href="mailto:support@devclip.xyz" 
              className="text-primary hover:underline"
              data-testid="link-support-email"
            >
              Contact support@devclip.xyz
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
