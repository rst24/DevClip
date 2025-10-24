import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Signup() {
  useEffect(() => {
    // Redirect to Replit Auth SSO login (handles signup too)
    window.location.href = "/api/login";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to sign up...</p>
      </div>
    </div>
  );
}
