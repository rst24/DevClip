import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Key, Copy, Trash2, Plus, CheckCircle2, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface ApiKey {
  id: number;
  name: string;
  keyPreview: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

interface NewApiKeyResponse {
  id: number;
  name: string;
  key: string;
  createdAt: string;
  message: string;
}

interface User {
  plan: 'free' | 'pro' | 'team';
}

export function ApiKeysPanel() {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<NewApiKeyResponse | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Fetch API keys
  const { data: apiKeys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/keys"],
  });

  // Generate API key mutation
  const generateKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("/api/keys/generate", "POST", { name });
      if (!res.ok) {
        const errorData = await res.json();
        const error = new Error(errorData.message);
        (error as any).upgradeRequired = errorData.upgradeRequired;
        throw error;
      }
      return res.json();
    },
    onSuccess: (data: NewApiKeyResponse) => {
      setGeneratedKey(data);
      setShowGenerateDialog(false);
      setNewKeyName("");
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "API Key Generated",
        description: "Save this key securely - it won't be shown again",
      });
    },
    onError: (error: any) => {
      if (error.upgradeRequired) {
        setUpgradeMessage(error.message);
        setShowUpgradeDialog(true);
        setShowGenerateDialog(false);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to generate API key",
          variant: "destructive",
        });
      }
    },
  });

  // Revoke API key mutation
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      const res = await apiRequest(`/api/keys/${keyId}`, "DELETE", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      setKeyToRevoke(null);
      toast({
        title: "API Key Revoked",
        description: "The API key has been revoked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke API key",
        variant: "destructive",
      });
    },
  });

  const handleCopy = (text: string, keyId?: number) => {
    navigator.clipboard.writeText(text);
    if (keyId) {
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    }
    toast({
      title: "Copied to clipboard",
      description: "API key copied successfully",
    });
  };

  const handleGenerate = () => {
    if (newKeyName.trim()) {
      generateKeyMutation.mutate(newKeyName.trim());
    }
  };

  const activeKeys = apiKeys.filter(k => !k.revokedAt);
  const revokedKeys = apiKeys.filter(k => k.revokedAt);

  // Get key limits based on plan
  const getKeyLimit = (plan: string | undefined) => {
    if (plan === 'team') return 'Unlimited';
    if (plan === 'pro') return '6';
    return '0';
  };

  const keyLimit = getKeyLimit(user?.plan);
  const canGenerateKeys = user?.plan === 'pro' || user?.plan === 'team';
  const hasReachedLimit = user?.plan === 'pro' && activeKeys.length >= 6;
  const shouldDisableGenerate = !canGenerateKeys || hasReachedLimit;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">API Keys</h2>
        <p className="text-sm text-muted-foreground">
          Manage API keys for browser extension and external integrations
        </p>
      </div>

      {/* Plan-based key limit info */}
      {user && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {user.plan === 'free' && 'API keys not available on Free plan'}
                {user.plan === 'pro' && `API Key Limit: ${activeKeys.length} / 6`}
                {user.plan === 'team' && 'API Keys: Unlimited'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {user.plan === 'free' && 'Upgrade to Pro or Team to access API keys'}
                {user.plan === 'pro' && 'Pro plan allows up to 6 active API keys'}
                {user.plan === 'team' && 'Team plan provides unlimited API keys'}
              </p>
            </div>
            <Badge variant="secondary" className="capitalize" data-testid="badge-plan">
              {user.plan}
            </Badge>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <h3 className="font-semibold">Active Keys</h3>
          </div>
          <Button 
            onClick={() => {
              if (hasReachedLimit) {
                setUpgradeMessage("Pro plan limit: 6 API keys maximum. Revoke an existing key or upgrade to Team plan for unlimited keys.");
                setShowUpgradeDialog(true);
              } else {
                setShowGenerateDialog(true);
              }
            }} 
            size="sm"
            disabled={shouldDisableGenerate}
            data-testid="button-generate-key"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Key
          </Button>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : activeKeys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">
              No API keys yet. Generate one to access the API.
            </p>
            <Button 
              onClick={() => {
                if (!canGenerateKeys) {
                  setUpgradeMessage("API keys are only available on Pro and Team plans");
                  setShowUpgradeDialog(true);
                } else {
                  setShowGenerateDialog(true);
                }
              }} 
              variant="outline"
              size="sm"
              data-testid="button-generate-first-key"
            >
              <Plus className="h-4 w-4 mr-2" />
              {canGenerateKeys ? 'Generate Your First Key' : 'Upgrade to Generate Keys'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-3 rounded-md border bg-card"
                data-testid={`key-item-${key.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-sm font-medium truncate" data-testid={`key-name-${key.id}`}>
                      {key.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span data-testid={`key-preview-${key.id}`}>{key.keyPreview}</span>
                    <span>•</span>
                    <span data-testid={`key-created-${key.id}`}>
                      Created {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                    </span>
                    {key.lastUsedAt && (
                      <>
                        <span>•</span>
                        <span data-testid={`key-lastused-${key.id}`}>
                          Last used {formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setKeyToRevoke(key)}
                    data-testid={`button-revoke-${key.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {revokedKeys.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Revoked Keys</h4>
            </div>
            <div className="space-y-2">
              {revokedKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-3 rounded-md border bg-muted/30 opacity-60"
                  data-testid={`revoked-key-item-${key.id}`}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium truncate">{key.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {key.keyPreview} • Revoked {formatDistanceToNow(new Date(key.revokedAt!), { addSuffix: true })}
                    </div>
                  </div>
                  <Badge variant="secondary">Revoked</Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* API Documentation Link */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold mb-1">API Documentation</h4>
            <p className="text-xs text-muted-foreground">
              Learn how to use the DevClip API in your applications
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/docs" target="_blank" data-testid="link-api-docs">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Docs
            </a>
          </Button>
        </div>
      </Card>

      {/* Generate Key Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent data-testid="dialog-generate-key">
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for browser extension or external integrations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g., Browser Extension, CI/CD Pipeline"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                data-testid="input-key-name"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Choose a descriptive name to identify this key
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGenerateDialog(false)}
              data-testid="button-cancel-generate"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!newKeyName.trim() || generateKeyMutation.isPending}
              data-testid="button-confirm-generate"
            >
              {generateKeyMutation.isPending ? "Generating..." : "Generate Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show Generated Key Dialog */}
      <Dialog open={!!generatedKey} onOpenChange={() => setGeneratedKey(null)}>
        <DialogContent data-testid="dialog-show-generated-key">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              API Key Generated
            </DialogTitle>
            <DialogDescription>
              Save this key securely - it won't be shown again
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Key Name</Label>
              <div className="text-sm font-medium mt-1" data-testid="text-generated-key-name">
                {generatedKey?.name}
              </div>
            </div>
            <div>
              <Label>API Key</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  readOnly
                  value={generatedKey?.key || ""}
                  className="font-mono text-sm"
                  data-testid="input-generated-key"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(generatedKey?.key || "")}
                  data-testid="button-copy-generated-key"
                >
                  {copiedKeyId === generatedKey?.id ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="rounded-md bg-yellow-500/10 border border-yellow-500/20 p-3">
              <p className="text-xs text-yellow-600 dark:text-yellow-500">
                ⚠️ This is the only time you'll see this key. Copy it now and store it securely.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setGeneratedKey(null)} data-testid="button-close-generated-key">
              I've Saved My Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Key Confirmation */}
      <AlertDialog open={!!keyToRevoke} onOpenChange={() => setKeyToRevoke(null)}>
        <AlertDialogContent data-testid="dialog-revoke-key">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately revoke the API key "{keyToRevoke?.name}". 
              Any applications using this key will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-revoke">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => keyToRevoke && revokeKeyMutation.mutate(keyToRevoke.id)}
              className="bg-destructive text-destructive-foreground hover-elevate"
              data-testid="button-confirm-revoke"
            >
              {revokeKeyMutation.isPending ? "Revoking..." : "Revoke Key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upgrade Required Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent data-testid="dialog-upgrade-required">
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
            <DialogDescription>
              {upgradeMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-md border">
                <div>
                  <p className="font-medium">Pro Plan</p>
                  <p className="text-sm text-muted-foreground">6 API keys • 5,000 credits/month</p>
                </div>
                <p className="font-semibold">$4.99/mo</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md border border-primary">
                <div>
                  <p className="font-medium">Team Plan</p>
                  <p className="text-sm text-muted-foreground">Unlimited API keys • 25,000 credits/month</p>
                </div>
                <p className="font-semibold">$24.99/mo</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
              data-testid="button-cancel-upgrade"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => {
                setShowUpgradeDialog(false);
                const event = new CustomEvent('changePlan');
                window.dispatchEvent(event);
              }}
              data-testid="button-view-plans"
            >
              View Plans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
