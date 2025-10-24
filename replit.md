# DevClip - Developer Clipboard Manager

## Project Overview
DevClip is a developer-focused clipboard management tool with a React frontend and Node.js/Express backend. The application provides local text formatting (JSON, YAML, SQL prettify, ANSI strip, log-to-markdown) and AI-powered features (code explanation, refactoring, log summarization) with tiered AI models: GPT-5 Nano for Free, GPT-5 Mini for Pro, and GPT-5 for Team.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Neon) via Drizzle ORM with HTTP connections
- **Authentication**: bcryptjs (10 salt rounds), express-session with memorystore
- **Payments**: Stripe Checkout with webhooks
- **AI**: Tiered OpenAI models via Replit AI Integrations (GPT-5 Nano/Mini/Premium)

## Architecture

### Database Schema
- **users**: User accounts with authentication, Stripe customer IDs, subscription plans, AI credits
- **sessions**: Express session store for authentication
- **clipboard_items**: User clipboard history with content type and favorite flag
- **ai_operations**: Tracking of AI operations for analytics
- **feedback**: User feedback submissions
- **api_keys**: API keys for browser extension and external integrations (userId, key, name, createdAt, lastUsedAt, revokedAt)
- **error_logs**: Error tracking with endpoint, method, statusCode, errorMessage, errorStack, requestBody (redacted), userAgent, ipAddress

### Authentication Flow
1. Users sign up with email/username/password (validated with Zod)
2. Passwords hashed with bcryptjs (10 rounds)
3. Sessions stored in memory (memorystore) - suitable for development, needs durable store for production
4. Protected routes use requireAuth middleware
5. Frontend uses ProtectedRoute wrapper with useEffect-based redirects

### Subscription Plans
- **Free**: GPT-5 Nano, 50 AI credits/month, all local formatters, no API access
- **Pro**: GPT-5 Mini, 5,000 AI credits/month, 10K carryover, 3 API keys max, cloud sync ($10/month or $100/year)
- **Team**: GPT-5 (Premium), 25,000 AI credits/month, 50K carryover, unlimited API keys, team features ($49/month or $490/year)

### Stripe Integration
- Products and price IDs created in Stripe test mode
- Checkout flow via Stripe Checkout Sessions
- Webhooks handle subscription lifecycle:
  - `checkout.session.completed`: Activates subscription
  - `customer.subscription.updated`: Updates subscription status
  - `customer.subscription.deleted`: Downgrades to free
  - `invoice.payment_failed`: Logs payment failures

### API Routes

#### Authentication (Web-based)
- POST `/api/auth/signup` - Create new account
- POST `/api/auth/login` - Login with email/password
- POST `/api/auth/logout` - Destroy session
- GET `/api/auth/me` - Get current user (protected)

#### API Key Management (Web-based, requires auth)
- POST `/api/keys/generate` - Generate new API key with name
- GET `/api/keys` - List user's API keys (masked)
- DELETE `/api/keys/:id` - Revoke API key (soft delete)

#### Clipboard (Web-based, requires auth)
- GET `/api/history` - Get clipboard items (protected)
- POST `/api/history` - Save clipboard item (protected)
- PUT `/api/history/:id/favorite` - Toggle favorite (protected)
- DELETE `/api/history/:id` - Delete item (protected)

#### REST API v1 (Stateless, requires API key via Bearer token)
**Formatters** - 0.1 credits per operation
- POST `/api/v1/format` - Format text (operations: json, yaml, sql, ansi-strip, log-to-markdown)

**AI Operations** - 1-3 credits based on complexity
- POST `/api/v1/ai/explain` - Explain code (1 credit)
- POST `/api/v1/ai/refactor` - Refactor code (2 credits)
- POST `/api/v1/ai/summarize` - Summarize logs (1 credit)

All v1 endpoints:
- Require `Authorization: Bearer <api_key>` header
- Return 402 Payment Required when credits depleted
- Track usage in ai_operations table
- Update cached user balance after each deduction

#### Analytics (Web-based, requires auth)
- GET `/api/analytics` - Get usage analytics for authenticated user (30-day time series, operation breakdown, recent operations)

#### Billing
- POST `/api/billing/create-subscription` - Create Stripe checkout session (protected)
- POST `/api/billing/portal` - Access Stripe customer portal (protected)
- POST `/api/webhooks/stripe` - Stripe webhook handler (public, signature verified)

### Frontend Pages
- `/login` - Login page
- `/signup` - Signup page
- `/docs` - API documentation with endpoint specs, code examples, authentication guide
- `/` - Dashboard (protected) with tabs:
  - History: Clipboard items with search and favorites
  - Formatters: Local text formatting tools
  - Analytics: Usage analytics with recharts (30-day time series, operation breakdown, CSV export) - Authenticated only
  - Settings: User profile, plan management, API key management, preferences
  - Feedback: User feedback form

### Browser Extension
- **Location**: `extension/` directory
- **Manifest**: Manifest V3 compliant
- **Popup**: Local formatters (JSON, YAML, SQL, ANSI, log-to-markdown) + AI tools (explain, refactor, summarize)
- **Background Worker**: Service worker for API requests with Bearer token authentication
- **Options Page**: API key configuration, connection testing, quick links to web dashboard
- **Permissions**: storage, activeTab, clipboardRead, clipboardWrite
- **Note**: Requires proper PNG icons (16x16, 48x48, 128x128) to load in Chrome

## Environment Variables

### Required for Development and Production
- `DATABASE_URL` - PostgreSQL connection string (Neon-backed Replit database)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - PostgreSQL connection details (auto-configured by Replit)
- `SESSION_SECRET` - Express session secret for authentication (auto-configured by Replit)
- `REPL_ID` - Replit project ID for OIDC (auto-configured by Replit)
- `REPLIT_DOMAINS` - Comma-separated domains for Replit Auth (auto-configured by Replit)
- `ISSUER_URL` - OIDC issuer URL (defaults to https://replit.com/oidc)

### Stripe Payment Processing (Required for Production)
- `STRIPE_SECRET_KEY` - Stripe API secret key (get from Stripe dashboard)
  - **Development**: Use test mode key starting with `sk_test_...`
  - **Production**: Use live mode key starting with `sk_live_...`
- `STRIPE_PRO_PRICE_ID` - Stripe price ID for Pro plan ($10/month)
  - Create in Stripe dashboard → Products → Create product → Add pricing
- `STRIPE_TEAM_PRICE_ID` - Stripe price ID for Team plan ($49/month)
  - Create in Stripe dashboard → Products → Create product → Add pricing
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (for webhook verification)
  - Create webhook endpoint in Stripe dashboard → Developers → Webhooks
  - Add endpoint URL: `https://your-domain.replit.app/api/webhooks/stripe`
  - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key for frontend (pk_test_... or pk_live_...)

### Testing Stripe Keys (Development Only)
- `TESTING_STRIPE_SECRET_KEY` - Test mode Stripe secret key
- `TESTING_VITE_STRIPE_PUBLIC_KEY` - Test mode Stripe publishable key

### Optional / Future
- `NODE_ENV` - Environment (development/production) - auto-set by Replit

## Development Commands
- `npm run dev` - Start development server (backend + frontend)
- `npm run db:push` - Push Drizzle schema changes to database
- `npx tsx server/setup-stripe.ts` - Create Stripe products/prices

## Recent Changes (October 24, 2025)
1. ✅ Migrated from in-memory storage to PostgreSQL with Drizzle ORM
2. ✅ Implemented full authentication system (signup/login/logout/sessions)
3. ✅ Added protected routes with session-based auth
4. ✅ Integrated Stripe Checkout for subscriptions
5. ✅ Implemented Stripe webhooks for subscription lifecycle
6. ✅ Fixed ProtectedRoute to use useEffect for redirects (prevents render loops)
7. ✅ Updated all API routes to use authenticated user from session
8. ✅ **Multi-channel API Platform**: Built REST API v1 with stateless endpoints for browser extension and external integrations
9. ✅ **API Key System**: Crypto-based key generation, Bearer token auth middleware, soft-delete revocation
10. ✅ **Credit-Based Rate Limiting**: Pre-flight credit checks, atomic deduction with cache refresh, 402 responses when depleted
11. ✅ **API Key Management UI**: Settings panel with generate/revoke/copy functionality, masked key display, comprehensive error handling
12. ✅ **API Documentation**: Comprehensive /docs page with endpoint schemas, multi-language code examples, authentication guide, credit costs, integration patterns
13. ✅ **Tier-Based API Access**: Free tier blocked from API keys, Pro tier limited to 3 keys, Team tier unlimited, with pre-emptive UI disabling and upgrade prompts
14. ✅ **Browser Extension (Manifest V3)**: Complete extension structure with popup UI (local formatters + AI tools), background service worker, options page for API key config, clipboard integration (requires PNG icons for deployment)
15. ✅ **Usage Analytics Dashboard**: Analytics tab with recharts showing 30-day time series (zero-filled), operations by type, credits by type, recent operations list, CSV export
16. ✅ **Database Optimization**: Added performance indexes on clipboard_items (userId, createdAt), ai_operations (userId, createdAt, composite), feedback (userId), team_members (teamOwnerId, memberId), conversion_events (userId, eventType)
17. ✅ **Error Tracking & Monitoring**: Implemented error_logs table with recursive sensitive data redaction (handles camelCase/snake_case passwords, tokens, secrets, API keys), positioned error middleware last in chain to capture all errors, includes retry logic for transient failures
18. ✅ **Frontend Bundle Optimization**: Implemented lazy loading with React.lazy() and Suspense for heavy components (FormattersPanel, Analytics, SettingsPanel, AiActionsPanel, FeedbackForm), reduced main bundle from 855 kB to 388 kB (54% reduction), recharts (430 kB) now lazy-loaded only when Analytics tab clicked
19. ✅ **Tiered AI Models**: Implemented subscription-tier-based AI models for clear value differentiation - Free tier uses GPT-5 Nano (fast, efficient), Pro tier uses GPT-5 Mini (balanced quality), Team tier uses GPT-5 (premium quality). Frontend displays model tier badges, backend automatically selects model via getModelForPlan(), all AI endpoints updated to use tier-specific models

## Known Limitations / Production Considerations
1. **Session Store**: Currently using PostgreSQL-backed sessions (via connect-pg-simple). Production-ready.
2. **Stripe Keys**: Price IDs created with test keys need to match the STRIPE_SECRET_KEY environment (use TESTING_STRIPE_SECRET_KEY for development).
3. **Webhook Signature**: STRIPE_WEBHOOK_SECRET needs to be configured in Stripe dashboard and added to environment.
4. **AI Credits**: No automatic credit refresh implemented yet - needs scheduled job to reset monthly credits.
5. **Error Handling**: Some edge cases in webhook handling need more robust error recovery.
6. **Replit Auth Testing**: In development/testing environments, `/api/login` may redirect to relative `/auth/replit` path. This is expected behavior as Replit OIDC discovery returns relative endpoints. Full SSO flow requires actual user authentication and cannot be fully automated in e2e tests. In production (published Replit apps), the OIDC endpoints resolve correctly to absolute URLs.

## Strategic Roadmap
**Phase 1: Extension & API** (Current - 100% Complete) ✅
- ✅ REST API v1 with formatter and AI endpoints
- ✅ API key management system
- ✅ Browser extension (Manifest V3) for Chrome/Edge
- ✅ API documentation page with code examples
- ✅ Tier-based API key limits (Free: 0, Pro: 3, Team: unlimited)
- ✅ Usage analytics dashboard with recharts
- ✅ Database query optimization (indexes)
- ✅ Error tracking and monitoring
- ✅ Frontend bundle optimization (54% reduction)
- ✅ Tiered AI models (Free: GPT-5 Nano, Pro: GPT-5 Mini, Team: GPT-5)

**Phase 2: Optimization & Growth**
- Landing page redesign (extension-first)
- Chrome Web Store listing assets
- Usage alerts and notifications

**Phase 3: Enterprise Features**
- Team API key sharing
- Automated credit refresh (scheduled jobs)
- Email notifications for key events
- Production session store migration
