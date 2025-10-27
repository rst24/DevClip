import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Users, CreditCard, TrendingUp, Shield, Search } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  plan: string;
  tokenBalance: number;
  tokensUsed: number;
  tokenCarryover: number;
  isAdmin: boolean;
  stripeCustomerId: string | null;
  createdAt: string;
}

interface Stats {
  users: {
    total: number;
    free: number;
    pro: number;
    team: number;
  };
  tokens: {
    total: number;
    used: number;
    remaining: number;
  };
}

export default function Admin() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newCredits, setNewCredits] = useState("");

  // Fetch stats
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Update tokens mutation
  const updateCreditsMutation = useMutation({
    mutationFn: async ({ userId, credits }: { userId: string; credits: number }) => {
      return await apiRequest(
        `/api/admin/users/${userId}/credits`,
        "PATCH",
        { tokenBalance: credits }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Tokens updated",
        description: "User tokens have been updated successfully",
      });
      setEditingUser(null);
      setNewCredits("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tokens",
        variant: "destructive",
      });
    },
  });

  // Toggle admin mutation
  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      return await apiRequest(
        `/api/admin/users/${userId}/admin`,
        "PATCH",
        { isAdmin }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Admin status updated",
        description: "User admin status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update admin status",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter((user) =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateCredits = () => {
    if (!editingUser) return;
    const credits = parseInt(newCredits);
    if (isNaN(credits) || credits < 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }
    updateCreditsMutation.mutate({ userId: editingUser.id, credits });
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "pro":
        return "default";
      case "team":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-admin-title">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users, tokens, and platform statistics</p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Shield className="h-4 w-4" />
          Admin Access
        </Badge>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold" data-testid="stat-total-users">{stats.users.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2 flex gap-2 text-xs">
              <span>Free: {stats.users.free}</span>
              <span>Pro: {stats.users.pro}</span>
              <span>Team: {stats.users.team}</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tokens</p>
                <p className="text-2xl font-bold" data-testid="stat-total-tokens">
                  {stats.tokens.total.toLocaleString()}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tokens Used</p>
                <p className="text-2xl font-bold" data-testid="stat-tokens-used">
                  {stats.tokens.used.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold" data-testid="stat-tokens-remaining">
                  {stats.tokens.remaining.toLocaleString()}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
        </div>
      )}

      {/* User Management */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">User Management</h2>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                data-testid="input-user-search"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        {user.firstName || user.lastName
                          ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPlanBadgeVariant(user.plan)}>
                          {user.plan.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.tokenBalance.toLocaleString()}</TableCell>
                      <TableCell>{user.tokensUsed.toLocaleString()}</TableCell>
                      <TableCell>
                        {user.isAdmin && (
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUser(user);
                              setNewCredits(user.tokenBalance.toString());
                            }}
                            data-testid={`button-edit-credits-${user.id}`}
                          >
                            Edit Tokens
                          </Button>
                          <Button
                            size="sm"
                            variant={user.isAdmin ? "destructive" : "default"}
                            onClick={() =>
                              toggleAdminMutation.mutate({
                                userId: user.id,
                                isAdmin: !user.isAdmin,
                              })
                            }
                            data-testid={`button-toggle-admin-${user.id}`}
                          >
                            {user.isAdmin ? "Remove Admin" : "Make Admin"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      {/* Edit Credits Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent data-testid="dialog-edit-credits">
          <DialogHeader>
            <DialogTitle>Edit User Tokens</DialogTitle>
            <DialogDescription>
              Update tokens for {editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="credits">AI Tokens Balance</Label>
              <Input
                id="credits"
                type="number"
                min="0"
                value={newCredits}
                onChange={(e) => setNewCredits(e.target.value)}
                placeholder="Enter tokens amount"
                data-testid="input-new-credits"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Current: {editingUser?.tokenBalance.toLocaleString()} tokens
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCredits}
              disabled={updateCreditsMutation.isPending}
              data-testid="button-save-credits"
            >
              {updateCreditsMutation.isPending ? "Updating..." : "Update Tokens"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
