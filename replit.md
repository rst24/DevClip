# DevClip - Developer Clipboard Manager

## Overview
DevClip is a developer-focused clipboard management tool offering local text formatting and AI-powered features. It aims to streamline developer workflows by providing efficient clipboard management, code manipulation, and intelligent insights. The project integrates a React frontend, Node.js/Express backend, and leverages a tiered AI model approach (GPT-5 Nano for Free, GPT-5 Mini for Pro, GPT-5 for Team) to cater to various user needs, from individual developers to teams. Pricing: Free (100 AI tokens/month), Pro ($4.99/month, 300 tokens, 6 API keys), Team ($24.99/month, 1,000 tokens, unlimited keys). Its core purpose is to enhance productivity through advanced clipboard functionalities and AI assistance.

## User Preferences
I prefer clear and concise explanations. When making changes, please adopt an iterative development approach, explaining each step. Before implementing any major architectural shifts or significant code refactoring, I expect to be consulted. Please do not make changes to the `extension/` folder without explicit instruction, as this contains the browser extension which has its own deployment cycle. I also prefer detailed explanations for complex features or architectural decisions.

## System Architecture
DevClip is built with a React 18, TypeScript, Vite, Tailwind CSS, and shadcn/ui frontend, communicating with a Node.js/Express, TypeScript backend. Data persistence is handled by PostgreSQL (Neon) via Drizzle ORM. Authentication uses bcryptjs and express-session. Stripe Checkout manages payments and subscriptions.

**UI/UX Decisions:**
- Modern, clean interface leveraging Tailwind CSS and shadcn/ui components.
- Responsive design for various screen sizes.
- Tab-based navigation for Dashboard sections (History, Formatters, Analytics, Settings, Feedback).
- Visual cues for AI model tiers (badges) and credit usage.

**Technical Implementations:**
- **Authentication**: Replit Auth SSO for user login (Google, GitHub, Apple, X).
- **Database Schema**: Key tables include `users`, `sessions`, `clipboard_items`, `ai_operations`, `feedback`, `api_keys`, and `error_logs`. User token tracking uses `tokenBalance`, `tokensUsed`, and `tokenCarryover` columns (migrated from credit-based terminology October 2025).
- **Subscription Management**: Tiered plans (Free: 100 tokens/mo, Pro: $4.99/mo with 300 tokens + 6 API keys, Team: $24.99/mo with 1,000 tokens + unlimited keys).
- **Stripe Integration**: Handles subscription lifecycle via webhooks (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`).
- **API Key System**: Crypto-based API key generation, Bearer token authentication for `v1` endpoints, soft-delete revocation, and UI for management.
- **Token System**: Pre-flight token checks for AI and formatter operations, atomic deduction, and 402 responses on depletion. Token allocations: Free (100/mo), Pro (300/mo with carryover up to 600), Team (1,000/mo with carryover up to 2,000).
- **Error Tracking**: `error_logs` table with sensitive data redaction and error middleware.
- **Performance**: Frontend lazy loading with `React.lazy()` and `Suspense` for heavy components; database indexing for `clipboard_items`, `ai_operations`, etc.
- **Tiered AI Models**: Backend dynamically selects OpenAI models (GPT-5 Nano/Mini/Premium) based on user's subscription tier.

**Feature Specifications:**
- **Universal Code Formatter** (NEW - October 2025): Smart auto-detection and formatting for 13 programming languages using Prettier:
  - **Web Languages**: JavaScript, TypeScript (includes Angular), JSX, TSX, HTML, CSS, SCSS, Less, Vue
  - **Data Formats**: JSON, YAML, GraphQL
  - **Documents**: Markdown
  - Features: Auto-detection of language from code patterns, client-side formatting (web app), server-side API support, language badge display
  - **Detection Logic** (October 27, 2025): Critical ordering fixes applied to prevent misclassification:
    1. Check frameworks first (Vue, TSX, JSX)
    2. Check JSON before JavaScript (both start with `{`)
    3. Check JavaScript before CSS (CSS pattern matches JS object literals like `{a:1}`)
    4. Final order: Vue → TSX → JSX → JSON → TypeScript → JavaScript → HTML → GraphQL → SCSS → Less → CSS → YAML → Markdown
- **Legacy Formatters**: JSON, YAML, SQL prettify, ANSI strip, log-to-markdown (maintained for backward compatibility).
- **AI Operations**: Code explanation, refactoring, log summarization.
- **Analytics Dashboard**: Displays 30-day usage time series, operation breakdowns, and recent operations.
- **Browser Extension**: Manifest V3 compliant, offering local formatters and AI tools, configurable via an options page for API keys (universal formatter pending deployment).

**System Design Choices:**
- **Stateless REST API v1**: Designed for browser extension and external integrations using API key authentication.
- **Modular Frontend**: Separation of concerns with distinct pages and components.
- **Drizzle ORM**: Type-safe database interactions.
- **Centralized Environment Configuration**: Utilizes environment variables for sensitive data and configurations.

## External Dependencies
- **Replit Auth SSO**: For user authentication.
- **PostgreSQL (Neon)**: Database service for data persistence.
- **Stripe**: Payment gateway for subscriptions and billing.
- **OpenAI (via Replit AI Integrations)**: AI models (GPT-5 Nano, GPT-5 Mini, GPT-5) for AI-powered features.
- **Prettier**: Universal code formatter for 13 programming languages (JavaScript, TypeScript/Angular, JSX, TSX, HTML, CSS, SCSS, Less, Vue, JSON, YAML, GraphQL, Markdown).
- **`bcryptjs`**: For password hashing.
- **`express-session` with `memorystore`**: For session management (development).
- **`connect-pg-simple`**: For PostgreSQL-backed session store (production).
- **`Zod`**: For schema validation.
- **`recharts`**: For data visualization in the analytics dashboard.