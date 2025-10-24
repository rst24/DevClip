import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Login() {
  useEffect(() => {
    // Redirect to Replit Auth SSO login
    window.location.href = "/api/login";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  );
}
