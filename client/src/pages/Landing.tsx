import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, Wand2, Cloud, Zap, Code, Lock, Download, Chrome, ExternalLink, FileJson, Terminal, Braces } from "lucide-react";

export default function Landing() {
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  const handleTryFormatters = () => {
    window.location.href = "/app";
  };

  const handleScrollToExtension = () => {
    // Smooth scroll to installation section
    document.getElementById('extension-download')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleViewDocs = () => {
    window.location.href = "/docs";
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
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-sm">
                  <Download className="h-3 w-3 mr-1" />
                  Now Available for Chrome & Edge
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Format Code in
                  <span className="text-primary"> One Click</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Browser extension with local JSON, YAML, SQL formatters + AI-powered code tools. 
                  Format instantly, explain code, refactor with GPT-5 (Nano/Mini/Premium).
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  size="lg" 
                  onClick={handleScrollToExtension}
                  className="text-lg px-8 w-full sm:w-auto"
                  data-testid="button-get-extension"
                >
                  <Chrome className="mr-2 h-5 w-5" />
                  Get Extension
                </Button>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={handleTryFormatters}
                    className="flex-1"
                    data-testid="button-try-web"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Or Try Web Version
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={handleViewDocs}
                    className="flex-1"
                    data-testid="button-view-docs"
                  >
                    <Code className="mr-2 h-4 w-4" />
                    API Docs
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Free local formatters • 50 AI credits/month • Pro: 5,000 credits + API access
              </p>
            </div>

            <div className="relative">
              <Card className="p-6 bg-muted/50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Chrome className="h-5 w-5" />
                      <span className="font-semibold">DevClip Extension</span>
                    </div>
                    <Badge variant="secondary">v1.0</Badge>
                  </div>
                  <div className="border rounded-md p-4 bg-background space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FileJson className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Format JSON</span>
                      <Badge variant="outline" className="ml-auto text-xs">Free</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Braces className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Format YAML</span>
                      <Badge variant="outline" className="ml-auto text-xs">Free</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Terminal className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Strip ANSI</span>
                      <Badge variant="outline" className="ml-auto text-xs">Free</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Explain Code (AI)</span>
                      <Badge variant="secondary" className="ml-auto text-xs">1 credit</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Wand2 className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Refactor Code (AI)</span>
                      <Badge variant="secondary" className="ml-auto text-xs">2 credits</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    All formatters work offline • AI features require API key
                  </p>
                </div>
              </Card>
            </div>
          </div>
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

          <Card data-testid="card-feature-extension">
            <CardHeader>
              <Chrome className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Browser Extension</CardTitle>
              <CardDescription>
                Chrome & Edge extension with local formatters and AI tools. 
                One-click access from any webpage.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card data-testid="card-feature-api">
            <CardHeader>
              <Code className="h-8 w-8 text-primary mb-2" />
              <CardTitle>REST API</CardTitle>
              <CardDescription>
                Integrate DevClip into CI/CD, LangChain, n8n workflows. 
                Comprehensive API for automation.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Extension Download */}
      <section id="extension-download" className="container mx-auto px-4 py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Get the Extension</h2>
            <p className="text-lg text-muted-foreground">
              Install DevClip for Chrome or Edge in seconds
            </p>
          </div>

          <Card className="p-8">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4 text-left">
                  <h3 className="font-semibold text-lg">Installation Steps</h3>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                      <span>Download and extract the .zip file</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                      <span>Open chrome://extensions/ and enable Developer mode</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                      <span>Click "Load unpacked" and select the extracted folder</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
                      <span>Configure your API key in extension options (optional for AI features)</span>
                    </li>
                  </ol>
                </div>
                <div className="space-y-4 text-left">
                  <h3 className="font-semibold text-lg">What's Included</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Local formatters (JSON, YAML, SQL, ANSI)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>AI code explanation (requires API key)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Code refactoring suggestions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Log summarization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Clipboard integration</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="pt-4">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = '/api/download/extension'}
                  data-testid="button-download-extension-zip"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Extension (.zip)
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Chrome Web Store listing coming soon
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you need AI power and API access
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
                <p className="text-sm">✓ Browser extension</p>
                <p className="text-sm text-muted-foreground">✗ No API keys</p>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For power users</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$8.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">✓ Everything in Free</p>
                <p className="text-sm">✓ 5,000 AI credits</p>
                <p className="text-sm">✓ 3 API keys</p>
                <p className="text-sm">✓ Credit carryover</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>For teams</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$39.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">✓ Everything in Pro</p>
                <p className="text-sm">✓ 25,000 shared credits</p>
                <p className="text-sm">✓ Unlimited API keys</p>
                <p className="text-sm">✓ Team features</p>
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
              Ready to streamline your developer workflow?
            </CardTitle>
            <CardDescription className="text-lg">
              Get the extension, try formatters, or integrate our API into your tools
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                onClick={handleScrollToExtension}
                data-testid="button-cta-extension"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Get Extension
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleViewDocs}
                data-testid="button-cta-docs"
              >
                <Code className="mr-2 h-4 w-4" />
                View API Docs
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
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Product */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  DevClip
                </h3>
                <p className="text-sm text-muted-foreground">
                  Format code in one click. Browser extension with local formatters + AI-powered tools.
                </p>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-semibold mb-3">Resources</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="/docs" className="hover-elevate rounded px-2 py-1 inline-block" data-testid="link-footer-docs">
                      API Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#extension-download" className="hover-elevate rounded px-2 py-1 inline-block" data-testid="link-footer-extension">
                      Browser Extension
                    </a>
                  </li>
                  <li>
                    <a href="/app" className="hover-elevate rounded px-2 py-1 inline-block" data-testid="link-footer-app">
                      Web App
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="font-semibold mb-3">Support</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a 
                      href="mailto:support@devclip.xyz" 
                      className="hover-elevate rounded px-2 py-1 inline-block flex items-center gap-1"
                      data-testid="link-footer-email"
                    >
                      <ExternalLink className="h-3 w-3" />
                      support@devclip.xyz
                    </a>
                  </li>
                  <li className="text-xs">
                    We typically respond within 24 hours
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-6 text-center text-sm text-muted-foreground">
              <p>DevClip • Built for developers, by developers • © {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
