import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, Wand2, Cloud, Zap, Code, Lock } from "lucide-react";

export default function Landing() {
  const handleSignIn = () => {
    window.location.href = "/auth/replit";
  };

  const handleTryFormatters = () => {
    window.location.href = "/app";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold" data-testid="text-app-title">DevClip</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={handleSignIn}
              data-testid="button-signin"
            >
              Sign In
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Your Developer Clipboard,
              <span className="text-primary"> Supercharged</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Format JSON, YAML, SQL instantly. Clean logs. Explain code with AI. 
              All in one privacy-first tool built for developers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleTryFormatters}
              className="text-lg px-8"
              data-testid="button-try-formatters"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              Try Formatters Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleSignIn}
              className="text-lg px-8"
              data-testid="button-signin-hero"
            >
              Sign In for AI Features
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            No signup required to try formatters • All formatting runs locally in your browser
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card data-testid="card-feature-formatters">
            <CardHeader>
              <Wand2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Instant Formatters</CardTitle>
              <CardDescription>
                Format JSON, YAML, SQL, clean ANSI codes, convert logs to markdown. 
                Works offline, no login required.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card data-testid="card-feature-ai">
            <CardHeader>
              <Sparkles className="h-8 w-8 text-primary mb-2" />
              <CardTitle>AI-Powered Actions</CardTitle>
              <CardDescription>
                Explain code, refactor snippets, summarize logs. 
                50 free AI credits monthly, 5,000 with Pro.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card data-testid="card-feature-privacy">
            <CardHeader>
              <Lock className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                All formatting runs locally. Your code never leaves your browser 
                unless you use AI features.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card data-testid="card-feature-cloud">
            <CardHeader>
              <Cloud className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Cloud Sync</CardTitle>
              <CardDescription>
                Sign in to sync clipboard history across devices. 
                Access your formatted snippets anywhere.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card data-testid="card-feature-fast">
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Instant formatting with no round trips. 
                Copy, format, paste in milliseconds.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card data-testid="card-feature-devtools">
            <CardHeader>
              <Code className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Developer Tools</CardTitle>
              <CardDescription>
                Built by developers, for developers. 
                Chrome extension coming soon.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you need AI power
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for trying out</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">✓ Local formatting</p>
                <p className="text-sm">✓ 50 AI credits/month</p>
                <p className="text-sm">✓ No login required</p>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For power users</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$10</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">✓ Everything in Free</p>
                <p className="text-sm">✓ 5,000 AI credits</p>
                <p className="text-sm">✓ Cloud sync</p>
                <p className="text-sm">✓ Credit carryover</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>For teams</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">✓ Everything in Pro</p>
                <p className="text-sm">✓ 25,000 shared credits</p>
                <p className="text-sm">✓ Admin dashboard</p>
                <p className="text-sm">✓ API access</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl md:text-3xl">
              Ready to supercharge your clipboard?
            </CardTitle>
            <CardDescription className="text-lg">
              Try formatters now, no signup needed. Sign in when you're ready for AI features.
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                onClick={handleTryFormatters}
                data-testid="button-cta-try"
              >
                Start Formatting
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleSignIn}
                data-testid="button-cta-signin"
              >
                Sign In
              </Button>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>DevClip • Built for developers, by developers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
