# DevClip - Developer Clipboard Manager

## Project Overview
DevClip is a developer-focused clipboard management tool with a React frontend and Node.js/Express backend. The application provides local text formatting (JSON, YAML, SQL prettify, ANSI strip, log-to-markdown) for free users and AI-powered features (code explanation, refactoring, log summarization via GPT-4o-mini) for paid tiers.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Neon) via Drizzle ORM with HTTP connections
- **Authentication**: bcryptjs (10 salt rounds), express-session with memorystore
- **Payments**: Stripe Checkout with webhooks
- **AI**: OpenAI GPT-4o-mini via Replit AI Integrations

## Architecture

### Database Schema
- **users**: User accounts with authentication, Stripe customer IDs, subscription plans, AI credits
- **sessions**: Express session store for authentication
- **clipboard_items**: User clipboard history with content type and favorite flag
- **ai_operations**: Tracking of AI operations for analytics
- **feedback**: User feedback submissions

### Authentication Flow
1. Users sign up with email/username/password (validated with Zod)
2. Passwords hashed with bcryptjs (10 rounds)
3. Sessions stored in memory (memorystore) - suitable for development, needs durable store for production
4. Protected routes use requireAuth middleware
5. Frontend uses ProtectedRoute wrapper with useEffect-based redirects

### Subscription Plans
- **Free**: 10 AI credits/month, all local formatters
- **Pro**: $10/month, 250 AI credits/month, cloud sync
- **Team**: $49/month, 2000 AI credits/month, team features

### Stripe Integration
- Products and price IDs created in Stripe test mode
- Checkout flow via Stripe Checkout Sessions
- Webhooks handle subscription lifecycle:
  - `checkout.session.completed`: Activates subscription
  - `customer.subscription.updated`: Updates subscription status
  - `customer.subscription.deleted`: Downgrades to free
  - `invoice.payment_failed`: Logs payment failures

### API Routes

#### Authentication
- POST `/api/auth/signup` - Create new account
- POST `/api/auth/login` - Login with email/password
- POST `/api/auth/logout` - Destroy session
- GET `/api/auth/me` - Get current user (protected)

#### Clipboard
- GET `/api/history` - Get clipboard items (protected)
- POST `/api/history` - Save clipboard item (protected)
- PUT `/api/history/:id/favorite` - Toggle favorite (protected)
- DELETE `/api/history/:id` - Delete item (protected)

#### AI Operations
- POST `/api/v1/ai/process` - Process text with AI (protected)
  - Operations: explain, refactor, summarize
  - Deducts credits and tracks usage

#### Billing
- POST `/api/billing/create-subscription` - Create Stripe checkout session (protected)
- POST `/api/billing/portal` - Access Stripe customer portal (protected)
- POST `/api/webhooks/stripe` - Stripe webhook handler (public, signature verified)

### Frontend Pages
- `/login` - Login page
- `/signup` - Signup page
- `/` - Dashboard (protected) with tabs:
  - History: Clipboard items with search and favorites
  - Formatters: Local text formatting tools
  - Settings: User profile, plan management, AI actions
  - Feedback: User feedback form

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `SESSION_SECRET` - Express session secret
- `STRIPE_SECRET_KEY` - Stripe API key (live or test)
- `STRIPE_PRO_PRICE_ID` - Stripe price ID for Pro plan
- `STRIPE_TEAM_PRICE_ID` - Stripe price ID for Team plan
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key for frontend

## Development Commands
- `npm run dev` - Start development server (backend + frontend)
- `npm run db:push` - Push Drizzle schema changes to database
- `npx tsx server/setup-stripe.ts` - Create Stripe products/prices

## Recent Changes (October 23, 2025)
1. ✅ Migrated from in-memory storage to PostgreSQL with Drizzle ORM
2. ✅ Implemented full authentication system (signup/login/logout/sessions)
3. ✅ Added protected routes with session-based auth
4. ✅ Integrated Stripe Checkout for subscriptions
5. ✅ Implemented Stripe webhooks for subscription lifecycle
6. ✅ Fixed ProtectedRoute to use useEffect for redirects (prevents render loops)
7. ✅ Updated all API routes to use authenticated user from session

## Known Limitations / Production Considerations
1. **Session Store**: Currently using memorystore (in-memory) which is not suitable for production. Should migrate to PostgreSQL-backed sessions or Redis.
2. **Stripe Keys**: Price IDs created with test keys need to match the STRIPE_SECRET_KEY environment (use TESTING_STRIPE_SECRET_KEY for development).
3. **Webhook Signature**: STRIPE_WEBHOOK_SECRET needs to be configured in Stripe dashboard and added to environment.
4. **AI Credits**: No automatic credit refresh implemented yet - needs scheduled job to reset monthly credits.
5. **Error Handling**: Some edge cases in webhook handling need more robust error recovery.

## Next Steps
- Implement usage analytics dashboard
- Add team workspace features
- Set up automated credit refresh
- Migrate to durable session store for production
- Add email notifications for subscription events
- Implement rate limiting for AI operations
