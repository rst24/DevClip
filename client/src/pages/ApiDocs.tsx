import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Code,
  Key,
  Zap,
  Copy,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function ApiDocs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Code example copied successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">DevClip API Documentation</h1>
          </div>
          <p className="text-muted-foreground">
            REST API for browser extensions and external integrations
          </p>
        </div>

        {/* Quick Start */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Start
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. Generate an API Key</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Go to Settings → API Keys and generate a new key. You'll need a Pro or Team plan.
              </p>
              <Link href="/?tab=settings">
                <Button size="sm" variant="outline" data-testid="button-generate-key-link">
                  <Key className="h-4 w-4 mr-2" />
                  Generate API Key
                </Button>
              </Link>
            </div>
            <div>
              <h3 className="font-medium mb-2">2. Make Your First Request</h3>
              <p className="text-sm text-muted-foreground mb-2">
                All requests require the <code className="text-xs bg-muted px-1 py-0.5 rounded">Authorization</code> header with your API key.
              </p>
            </div>
          </div>
        </Card>

        {/* Authentication */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Key className="h-5 w-5" />
            Authentication
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            All API requests must include your API key in the Authorization header using Bearer token format.
          </p>
          <div className="bg-muted rounded-md p-4 relative">
            <code className="text-sm">Authorization: Bearer YOUR_API_KEY_HERE</code>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleCopy("Authorization: Bearer YOUR_API_KEY_HERE", "auth-header")}
              data-testid="button-copy-auth-header"
            >
              {copiedCode === "auth-header" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Card>

        {/* Base URL */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Base URL</h2>
          <div className="bg-muted rounded-md p-4 relative">
            <code className="text-sm">{window.location.origin}/api/v1</code>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleCopy(`${window.location.origin}/api/v1`, "base-url")}
              data-testid="button-copy-base-url"
            >
              {copiedCode === "base-url" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Card>

        {/* AI Model Tiers */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">AI Model Tiers</h2>
          <p className="text-sm text-muted-foreground mb-4">
            DevClip uses different GPT-5 models based on your subscription plan, providing clear value at each tier.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">Free</Badge>
              <div>
                <p className="text-sm font-medium">GPT-5 Nano</p>
                <p className="text-xs text-muted-foreground">Fast, efficient AI - perfect for 50 credits/month</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">Pro</Badge>
              <div>
                <p className="text-sm font-medium">GPT-5 Mini</p>
                <p className="text-xs text-muted-foreground">Balanced quality & speed - ideal for 5,000 credits/month</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">Team</Badge>
              <div>
                <p className="text-sm font-medium">GPT-5 (Premium)</p>
                <p className="text-xs text-muted-foreground">Best AI quality - for 25,000 credits/month</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            <strong>Note:</strong> The AI model is automatically selected based on your API key's associated plan. No configuration needed.
          </p>
        </Card>

        {/* Endpoints */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Code className="h-5 w-5" />
            Endpoints
          </h2>

          {/* Format Endpoint */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="font-mono">POST</Badge>
              <code className="text-sm">/api/v1/format</code>
              <Badge variant="secondary">0.1 credit</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Format text using local formatters (JSON, YAML, SQL, ANSI strip, log-to-markdown)
            </p>

            <h4 className="font-medium text-sm mb-2">Request Body</h4>
            <div className="bg-muted rounded-md p-4 mb-4">
              <pre className="text-xs overflow-x-auto">{`{
  "text": "string",      // Text to format
  "operation": "string"  // One of: json, yaml, sql, ansi-strip, log-to-markdown
}`}</pre>
            </div>

            <h4 className="font-medium text-sm mb-2">Code Examples</h4>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList>
                <TabsTrigger value="curl" data-testid="tab-curl-format">cURL</TabsTrigger>
                <TabsTrigger value="javascript" data-testid="tab-js-format">JavaScript</TabsTrigger>
                <TabsTrigger value="python" data-testid="tab-python-format">Python</TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <div className="bg-muted rounded-md p-4 relative">
                  <pre className="text-xs overflow-x-auto">{`curl -X POST ${window.location.origin}/api/v1/format \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "{\\"name\\":\\"John\\",\\"age\\":30}", "operation": "json"}'`}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(`curl -X POST ${window.location.origin}/api/v1/format \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"text": "{\\"name\\":\\"John\\",\\"age\\":30}", "operation": "json"}'`, "curl-format")}
                    data-testid="button-copy-curl-format"
                  >
                    {copiedCode === "curl-format" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="javascript">
                <div className="bg-muted rounded-md p-4 relative">
                  <pre className="text-xs overflow-x-auto">{`const response = await fetch('${window.location.origin}/api/v1/format', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: '{"name":"John","age":30}',
    operation: 'json'
  })
});

const data = await response.json();
console.log(data.result);`}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(`const response = await fetch('${window.location.origin}/api/v1/format', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer YOUR_API_KEY',\n    'Content-Type': 'application/json',\n  },\n  body: JSON.stringify({\n    text: '{"name":"John","age":30}',\n    operation: 'json'\n  })\n});\n\nconst data = await response.json();\nconsole.log(data.result);`, "js-format")}
                    data-testid="button-copy-js-format"
                  >
                    {copiedCode === "js-format" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="python">
                <div className="bg-muted rounded-md p-4 relative">
                  <pre className="text-xs overflow-x-auto">{`import requests

response = requests.post(
    '${window.location.origin}/api/v1/format',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'text': '{"name":"John","age":30}',
        'operation': 'json'
    }
)

data = response.json()
print(data['result'])`}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(`import requests\n\nresponse = requests.post(\n    '${window.location.origin}/api/v1/format',\n    headers={'Authorization': 'Bearer YOUR_API_KEY'},\n    json={\n        'text': '{"name":"John","age":30}',\n        'operation': 'json'\n    }\n)\n\ndata = response.json()\nprint(data['result'])`, "python-format")}
                    data-testid="button-copy-python-format"
                  >
                    {copiedCode === "python-format" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Separator className="my-6" />

          {/* AI Explain Endpoint */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="font-mono">POST</Badge>
              <code className="text-sm">/api/v1/ai/explain</code>
              <Badge variant="secondary">1 credit</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Explain code or text using AI (GPT-4o-mini)
            </p>

            <h4 className="font-medium text-sm mb-2">Request Body</h4>
            <div className="bg-muted rounded-md p-4 mb-4">
              <pre className="text-xs overflow-x-auto">{`{
  "text": "string"  // Code or text to explain
}`}</pre>
            </div>

            <h4 className="font-medium text-sm mb-2">Code Examples</h4>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList>
                <TabsTrigger value="curl" data-testid="tab-curl-explain">cURL</TabsTrigger>
                <TabsTrigger value="javascript" data-testid="tab-js-explain">JavaScript</TabsTrigger>
                <TabsTrigger value="python" data-testid="tab-python-explain">Python</TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <div className="bg-muted rounded-md p-4 relative">
                  <pre className="text-xs overflow-x-auto">{`curl -X POST ${window.location.origin}/api/v1/ai/explain \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "const arr = [1,2,3].map(x => x * 2)"}'`}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(`curl -X POST ${window.location.origin}/api/v1/ai/explain \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"text": "const arr = [1,2,3].map(x => x * 2)"}'`, "curl-explain")}
                    data-testid="button-copy-curl-explain"
                  >
                    {copiedCode === "curl-explain" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="javascript">
                <div className="bg-muted rounded-md p-4 relative">
                  <pre className="text-xs overflow-x-auto">{`const response = await fetch('${window.location.origin}/api/v1/ai/explain', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'const arr = [1,2,3].map(x => x * 2)'
  })
});

const data = await response.json();
console.log(data.result);`}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(`const response = await fetch('${window.location.origin}/api/v1/ai/explain', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer YOUR_API_KEY',\n    'Content-Type': 'application/json',\n  },\n  body: JSON.stringify({\n    text: 'const arr = [1,2,3].map(x => x * 2)'\n  })\n});\n\nconst data = await response.json();\nconsole.log(data.result);`, "js-explain")}
                    data-testid="button-copy-js-explain"
                  >
                    {copiedCode === "js-explain" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="python">
                <div className="bg-muted rounded-md p-4 relative">
                  <pre className="text-xs overflow-x-auto">{`import requests

response = requests.post(
    '${window.location.origin}/api/v1/ai/explain',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={'text': 'const arr = [1,2,3].map(x => x * 2)'}
)

data = response.json()
print(data['result'])`}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(`import requests\n\nresponse = requests.post(\n    '${window.location.origin}/api/v1/ai/explain',\n    headers={'Authorization': 'Bearer YOUR_API_KEY'},\n    json={'text': 'const arr = [1,2,3].map(x => x * 2)'}\n)\n\ndata = response.json()\nprint(data['result'])`, "python-explain")}
                    data-testid="button-copy-python-explain"
                  >
                    {copiedCode === "python-explain" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Separator className="my-6" />

          {/* AI Refactor Endpoint */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="font-mono">POST</Badge>
              <code className="text-sm">/api/v1/ai/refactor</code>
              <Badge variant="secondary">2 credits</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Refactor and improve code using AI
            </p>

            <h4 className="font-medium text-sm mb-2">Request Body</h4>
            <div className="bg-muted rounded-md p-4 mb-4">
              <pre className="text-xs overflow-x-auto">{`{
  "text": "string"  // Code to refactor
}`}</pre>
            </div>

            <h4 className="font-medium text-sm mb-2">Code Examples</h4>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList>
                <TabsTrigger value="curl" data-testid="tab-curl-refactor">cURL</TabsTrigger>
                <TabsTrigger value="javascript" data-testid="tab-js-refactor">JavaScript</TabsTrigger>
                <TabsTrigger value="python" data-testid="tab-python-refactor">Python</TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <div className="bg-muted rounded-md p-4 relative">
                  <pre className="text-xs overflow-x-auto">{`curl -X POST ${window.location.origin}/api/v1/ai/refactor \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "function add(a,b) { return a+b; }"}'`}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(`curl -X POST ${window.location.origin}/api/v1/ai/refactor \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"text": "function add(a,b) { return a+b; }"}'`, "curl-refactor")}
                    data-testid="button-copy-curl-refactor"
                  >
                    {copiedCode === "curl-refactor" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="javascript">
                <div className="bg-muted rounded-md p-4 relative">
                  <pre className="text-xs overflow-x-auto">{`const response = await fetch('${window.location.origin}/api/v1/ai/refactor', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'function add(a,b) { return a+b; }'
  })
});

const data = await response.json();
console.log(data.result);`}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(`const response = await fetch('${window.location.origin}/api/v1/ai/refactor', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer YOUR_API_KEY',\n    'Content-Type': 'application/json',\n  },\n  body: JSON.stringify({\n    text: 'function add(a,b) { return a+b; }'\n  })\n});\n\nconst data = await response.json();\nconsole.log(data.result);`, "js-refactor")}
                    data-testid="button-copy-js-refactor"
                  >
                    {copiedCode === "js-refactor" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="python">
                <div className="bg-muted rounded-md p-4 relative">
                  <pre className="text-xs overflow-x-auto">{`import requests

response = requests.post(
    '${window.location.origin}/api/v1/ai/refactor',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={'text': 'function add(a,b) { return a+b; }'}
)

data = response.json()
print(data['result'])`}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(`import requests\n\nresponse = requests.post(\n    '${window.location.origin}/api/v1/ai/refactor',\n    headers={'Authorization': 'Bearer YOUR_API_KEY'},\n    json={'text': 'function add(a,b) { return a+b; }'}\n)\n\ndata = response.json()\nprint(data['result'])`, "python-refactor")}
                    data-testid="button-copy-python-refactor"
                  >
                    {copiedCode === "python-refactor" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Separator className="my-6" />

          {/* AI Summarize Endpoint */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="font-mono">POST</Badge>
              <code className="text-sm">/api/v1/ai/summarize</code>
              <Badge variant="secondary">1 credit</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Summarize logs or long text using AI
            </p>

            <h4 className="font-medium text-sm mb-2">Request Body</h4>
            <div className="bg-muted rounded-md p-4 mb-4">
              <pre className="text-xs overflow-x-auto">{`{
  "text": "string"  // Text or logs to summarize
}`}</pre>
            </div>

            <h4 className="font-medium text-sm mb-2">Code Examples</h4>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList>
                <TabsTrigger value="curl" data-testid="tab-curl-summarize">cURL</TabsTrigger>
                <TabsTrigger value="javascript" data-testid="tab-js-summarize">JavaScript</TabsTrigger>
                <TabsTrigger value="python" data-testid="tab-python-summarize">Python</TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <div className="bg-muted rounded-md p-4 relative">
                  <pre className="text-xs overflow-x-auto">{`curl -X POST ${window.location.origin}/api/v1/ai/summarize \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Long application logs here..."}'`}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(`curl -X POST ${window.location.origin}/api/v1/ai/summarize \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"text": "Long application logs here..."}'`, "curl-summarize")}
                    data-testid="button-copy-curl-summarize"
                  >
                    {copiedCode === "curl-summarize" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="javascript">
                <div className="bg-muted rounded-md p-4 relative">
                  <pre className="text-xs overflow-x-auto">{`const response = await fetch('${window.location.origin}/api/v1/ai/summarize', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Long application logs here...'
  })
});

const data = await response.json();
console.log(data.result);`}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(`const response = await fetch('${window.location.origin}/api/v1/ai/summarize', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer YOUR_API_KEY',\n    'Content-Type': 'application/json',\n  },\n  body: JSON.stringify({\n    text: 'Long application logs here...'\n  })\n});\n\nconst data = await response.json();\nconsole.log(data.result);`, "js-summarize")}
                    data-testid="button-copy-js-summarize"
                  >
                    {copiedCode === "js-summarize" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="python">
                <div className="bg-muted rounded-md p-4 relative">
                  <pre className="text-xs overflow-x-auto">{`import requests

response = requests.post(
    '${window.location.origin}/api/v1/ai/summarize',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={'text': 'Long application logs here...'}
)

data = response.json()
print(data['result'])`}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(`import requests\n\nresponse = requests.post(\n    '${window.location.origin}/api/v1/ai/summarize',\n    headers={'Authorization': 'Bearer YOUR_API_KEY'},\n    json={'text': 'Long application logs here...'}\n)\n\ndata = response.json()\nprint(data['result'])`, "python-summarize")}
                    data-testid="button-copy-python-summarize"
                  >
                    {copiedCode === "python-summarize" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        {/* Credit Costs */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Credit Costs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Operation</th>
                  <th className="text-left py-2 px-3">Cost</th>
                  <th className="text-left py-2 px-3">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">POST /format</td>
                  <td className="py-2 px-3">0.1 credits</td>
                  <td className="py-2 px-3 text-muted-foreground">JSON, YAML, SQL formatting</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">POST /ai/explain</td>
                  <td className="py-2 px-3">1 credit</td>
                  <td className="py-2 px-3 text-muted-foreground">Code explanation</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">POST /ai/refactor</td>
                  <td className="py-2 px-3">2 credits</td>
                  <td className="py-2 px-3 text-muted-foreground">Code refactoring</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">POST /ai/summarize</td>
                  <td className="py-2 px-3">1 credit</td>
                  <td className="py-2 px-3 text-muted-foreground">Text summarization</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Rate Limits */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Rate Limits & Plans</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Free Plan</h3>
              <p className="text-sm text-muted-foreground">
                50 credits/month • No API access • Local formatters only
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Pro Plan ($10/month)</h3>
              <p className="text-sm text-muted-foreground">
                5,000 credits/month • 10K carryover • 3 API keys • Cloud sync
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Team Plan ($49/month)</h3>
              <p className="text-sm text-muted-foreground">
                25,000 credits/month • 50K carryover • Unlimited API keys • Team features
              </p>
            </div>
          </div>
        </Card>

        {/* Error Responses */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Error Responses</h2>
          <div className="space-y-3">
            <div>
              <code className="text-sm bg-muted px-2 py-1 rounded">400 Bad Request</code>
              <p className="text-sm text-muted-foreground mt-1">Invalid request body or parameters</p>
            </div>
            <div>
              <code className="text-sm bg-muted px-2 py-1 rounded">401 Unauthorized</code>
              <p className="text-sm text-muted-foreground mt-1">Missing or invalid API key</p>
            </div>
            <div>
              <code className="text-sm bg-muted px-2 py-1 rounded">402 Payment Required</code>
              <p className="text-sm text-muted-foreground mt-1">Insufficient credits - upgrade your plan</p>
            </div>
            <div>
              <code className="text-sm bg-muted px-2 py-1 rounded">500 Internal Server Error</code>
              <p className="text-sm text-muted-foreground mt-1">Server error - please try again</p>
            </div>
          </div>
        </Card>

        {/* Integration Examples */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Integration Examples</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Browser Extension</h3>
              <p className="text-sm text-muted-foreground">
                Use the DevClip API in your browser extension to format and analyze clipboard content.
                Store your API key securely in chrome.storage.sync.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">CI/CD Pipelines</h3>
              <p className="text-sm text-muted-foreground">
                Format logs and analyze code quality in your GitHub Actions, GitLab CI, or Jenkins pipelines.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">LangChain & AI Agents</h3>
              <p className="text-sm text-muted-foreground">
                Integrate DevClip API as a tool in your LangChain workflows for code analysis and formatting.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">n8n Workflows</h3>
              <p className="text-sm text-muted-foreground">
                Use HTTP Request nodes in n8n to call DevClip API for automated text processing.
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Need help?{" "}
            <Link href="/?tab=feedback">
              <a className="text-primary hover:underline cursor-pointer text-sm" data-testid="link-feedback">
                Send us feedback
              </a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
