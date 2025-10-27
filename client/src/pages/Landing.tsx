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
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered Developer Tools
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Format, Explain, Refactor in
                  <span className="text-primary"> One Click</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Smart clipboard manager with 13-language formatter and GPT-5 AI tools. 
                  Format code instantly (offline), explain complex logic, refactor with AI—all from your browser.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    size="lg" 
                    onClick={handleTryFormatters}
                    className="text-lg px-8 flex-1"
                    data-testid="button-start-free"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Free
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={handleScrollToExtension}
                    className="text-lg px-8 flex-1"
                    data-testid="button-get-extension"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Get Extension
                  </Button>
                </div>
                <Button 
                  size="lg" 
                  variant="ghost" 
                  onClick={handleViewDocs}
                  className="w-full"
                  data-testid="button-view-docs"
                >
                  <Code className="mr-2 h-4 w-4" />
                  View API Documentation
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Wand2 className="h-4 w-4" />
                  <span>13 languages</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  <span>Works offline</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  <span>No signup required</span>
                </div>
              </div>
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

      {/* Pricing Comparison */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you need AI power and API access
            </p>
          </div>

          {/* Pricing Cards */}
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
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm">50 AI credits/month</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm">13-language code formatter</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm">Browser extension access</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm">Cloud sync & history</p>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-sm">✗</span>
                  <p className="text-sm">No API key access</p>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-sm">✗</span>
                  <p className="text-sm">No credit carryover</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For power users</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$8.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm"><strong>5,000 AI credits/month</strong></p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm">Everything in Free</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm">Up to 3 API keys</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm">Credit carryover (max 10,000)</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm">Priority support</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm">Advanced analytics</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>For organizations</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$39.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm"><strong>25,000 shared credits/month</strong></p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm">Everything in Pro</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm">Unlimited API keys</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm">Team management dashboard</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm">Dedicated support</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <p className="text-sm">Usage analytics & reporting</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Comparison Table */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
              <CardDescription>See what's included in each plan</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Feature</th>
                    <th className="text-center py-3 px-4 font-semibold">Free</th>
                    <th className="text-center py-3 px-4 font-semibold">Pro</th>
                    <th className="text-center py-3 px-4 font-semibold">Team</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Monthly AI Credits</td>
                    <td className="text-center py-3 px-4">50</td>
                    <td className="text-center py-3 px-4">5,000</td>
                    <td className="text-center py-3 px-4">25,000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Code Formatter (13 languages)</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">AI Code Explanation</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">AI Refactoring</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Cloud Sync & History</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">API Keys</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">—</td>
                    <td className="text-center py-3 px-4">Up to 3</td>
                    <td className="text-center py-3 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Credit Carryover</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">—</td>
                    <td className="text-center py-3 px-4">Max 10,000</td>
                    <td className="text-center py-3 px-4">Max 50,000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Analytics Dashboard</td>
                    <td className="text-center py-3 px-4">Basic</td>
                    <td className="text-center py-3 px-4">Advanced</td>
                    <td className="text-center py-3 px-4">Advanced</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Support</td>
                    <td className="text-center py-3 px-4">Community</td>
                    <td className="text-center py-3 px-4">Priority</td>
                    <td className="text-center py-3 px-4">Dedicated</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Post-Comparison CTA */}
          <div className="max-w-2xl mx-auto text-center space-y-4 mt-12">
            <h3 className="text-2xl font-bold">Ready to boost your productivity?</h3>
            <p className="text-muted-foreground">
              Start with the free plan—no credit card required. Upgrade anytime for more AI credits and features.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button 
                size="lg"
                onClick={handleSignIn}
                data-testid="button-post-comparison-signup"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Start Free
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={handleScrollToExtension}
                data-testid="button-post-comparison-extension"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Get Extension
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about DevClip
            </p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What are AI credits?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                AI credits are used for AI-powered features like code explanation, refactoring, and log summarization. 
                Simple operations cost 1-2 credits, complex ones cost 3-5 credits. Free users get 50 credits/month, 
                Pro users get 5,000, and Team users get 25,000 shared credits.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel my subscription anytime?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Yes! You can cancel your Pro or Team subscription at any time from your dashboard settings. 
                Your plan will remain active until the end of your billing period, and you'll keep any unused 
                credits (subject to carryover limits).
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's included in each tier?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>Free:</strong> 50 AI credits/month, full formatter access (13 languages), cloud sync, browser extension.</p>
                <p><strong>Pro ($8.99/mo):</strong> 5,000 credits, up to 3 API keys, credit carryover (max 10K), priority support.</p>
                <p><strong>Team ($39.99/mo):</strong> 25,000 shared credits, unlimited API keys, team management, dedicated support.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do I need to sign up to use formatters?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                No! The 13-language code formatter works completely offline without any sign-up. Just install the 
                browser extension or use the web app. You only need an account to use AI features and sync your 
                clipboard history across devices.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens to unused credits?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Free plan credits reset monthly and don't carry over. Pro and Team plans support credit carryover—
                unused credits roll over to the next month up to your plan's limit (10,000 for Pro, 50,000 for Team). 
                This ensures you never lose value from low-usage months.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my code kept private?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Absolutely. All formatting happens locally in your browser—your code never leaves your device. 
                AI features require sending code snippets to OpenAI's API (GPT-5), but we never store your code 
                on our servers. You control what gets processed by AI.
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
