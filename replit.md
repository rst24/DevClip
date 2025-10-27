# DevClip - AI Code Memory Platform

## Overview
DevClip is a developer clipboard manager with AI-powered semantic search, code formatting, and intelligent insights. Users save code snippets and query them with natural language (e.g., "find JWT examples") using OpenAI embeddings and PostgreSQL pgvector.

**Pricing Tiers:**
- **Free**: 100 AI tokens/month, 7-day history, local formatters
- **Pro**: $4.99/month, 300 tokens, unlimited memory, AI search/tagging, 6 API keys
- **Team**: $24.99/month, 1,000 tokens, shared memory, analytics, unlimited keys

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Neon) with pgvector extension, Drizzle ORM
- **Auth**: Replit Auth SSO (Google, GitHub, Apple, X)
- **Payments**: Stripe Checkout with webhook subscriptions
- **AI**: OpenAI (GPT-5 Nano/Mini/Premium via Replit AI Integrations)

## Core Features

### 1. Universal Code Formatter
Smart auto-detection for 13 languages using Prettier:
- **Languages**: JavaScript, TypeScript, JSX, TSX, HTML, CSS, SCSS, Less, Vue, JSON, YAML, GraphQL, Markdown
- **Detection Order**: Vue → TSX → JSX → JSON → TypeScript → JavaScript → HTML → GraphQL → SCSS → Less → CSS → YAML → Markdown
- **Available**: Client-side (web app) + server API

### 2. Semantic Search (⚠️ Requires OpenAI API Key)
**Status**: Implementation complete, needs real OpenAI key to function

**Technical Implementation**:
- PostgreSQL pgvector extension with ivfflat index (1536-dimensional vectors)
- Parameterized SQL queries: `SELECT *, GREATEST(0, LEAST(1, 1 - (embedding <=> $1))) AS similarity`
- Endpoints: `/api/memory/search` (session auth), `/v1/memory/search` (API key auth)
- Features: Natural language search, similarity % badges, tag/language metadata
- Pricing: Pro/Team only, 10 tokens per search

**⚠️ Known Limitation**: Replit AI integrations don't support OpenAI embeddings endpoint. Need to configure `OPENAI_API_KEY` secret with real OpenAI key for embeddings to work.

### 3. AI Operations
- Code explanation, refactoring, log summarization
- Tiered models: GPT-5 Nano (Free), GPT-5 Mini (Pro), GPT-5 (Team)
- Token system with pre-flight checks and atomic deduction

### 4. API Key System
- Crypto-based key generation (`devclip_` prefix)
- Bearer token auth for `/v1/*` endpoints (browser extension)
- Soft-delete revocation with UI management

### 5. Analytics Dashboard
- 30-day usage time series (recharts visualization)
- Operation breakdowns and recent activity
- Token balance tracking with carryover (Pro: 600 max, Team: 2,000 max)

## Database Schema
**Key Tables**: `users`, `sessions`, `clipboard_items` (with embeddings), `ai_operations`, `feedback`, `api_keys`, `error_logs`

**Important Columns**:
- `users.plan`: 'free' | 'pro' | 'team' (NOT subscription_tier)
- `users.tokenBalance`, `tokensUsed`, `tokenCarryover`
- `clipboard_items.embedding`: vector(1536) with ivfflat index

## Architecture Patterns
- **REST API v1**: Stateless, API key auth for external integrations
- **Session Auth**: Cookie-based for web app (`/api/*` endpoints)
- **Dual Endpoints**: `/api/*` (session) + `/v1/*` (API key) for same features
- **Error Tracking**: Centralized error logs with sensitive data redaction
- **Performance**: React.lazy() + Suspense, database indexing

## Browser Extension
- Manifest V3 compliant
- Local formatters + AI tools
- Configurable API keys in options page
- Universal formatter deployment pending

## External Dependencies
- **Replit Auth SSO**: User authentication
- **PostgreSQL (Neon)**: Data persistence with pgvector
- **Stripe**: Subscription billing and webhooks
- **OpenAI**: AI models (requires real API key for embeddings)
- **Prettier**: Code formatting engine

## Development Notes
- Database migrations: Use `npm run db:push` (add `--force` for data-loss warnings)
- Session store: memorystore (dev), connect-pg-simple (production)
- Do NOT modify `extension/` folder without explicit instruction
- Column naming: Use `plan` not `subscriptionTier` in backend code
