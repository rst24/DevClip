# DevClip - Production Deployment Guide

## 🚀 Deploying to Production on Replit

### Overview
Your DevClip application is production-ready! This guide will walk you through deploying it to production, connecting a custom domain, and distributing the browser extension.

---

## 📦 Step 1: Publish Your App on Replit

### 1.1 Access Publishing
1. Click the **"Publish"** button at the top of your Replit workspace
2. Or navigate to **Tools** → **Publishing**

### 1.2 Choose Deployment Type
For DevClip, choose **Autoscale Deployment** (recommended):
- ✅ Automatically scales with traffic
- ✅ Ideal for web apps and APIs
- ✅ Pay only for what you use
- ✅ Handles variable user loads efficiently

### 1.3 Configure Deployment
1. **Machine Power**: Start with **1 vCPU / 1 GB RAM** (you can upgrade later)
2. **Max Machines**: Set to **3** for moderate scaling
3. **Run Command**: Should be pre-configured as `npm run dev`
4. **Environment Variables**: 
   - All your secrets are already configured (DATABASE_URL, STRIPE keys, etc.)
   - Verify critical variables are set in Secrets panel:
     - ✅ `STRIPE_SECRET_KEY`
     - ✅ `STRIPE_PRO_PRICE_ID`
     - ✅ `STRIPE_TEAM_PRICE_ID`
     - ✅ `VITE_STRIPE_PUBLIC_KEY`
     - ✅ `SESSION_SECRET`
     - ✅ `DATABASE_URL`

### 1.4 Configure Stripe Webhook
**IMPORTANT**: After deployment, you must configure your Stripe webhook:

1. Note your deployment URL (e.g., `https://devclip.replit.app`)
2. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
3. Click **"Add endpoint"**
4. Enter webhook URL: `https://devclip.replit.app/api/webhooks/stripe`
5. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
6. Copy the **Signing Secret** (starts with `whsec_...`)
7. Add it to your Replit Secrets as `STRIPE_WEBHOOK_SECRET`

### 1.5 Add Payment Method
- If prompted, add a payment method
- Publishing costs are deducted from your monthly Replit credits first
- Usage-based fees apply after credits are exhausted

### 1.6 Launch!
1. Click **"Publish"**
2. Wait 2-5 minutes for deployment
3. Your app will be live at: `https://[your-repl-name].replit.app`

---

## 🌐 Step 2: Connect Custom Domain (devclip.org)

### 2.1 Purchase Domain
1. Buy `devclip.org` from a domain registrar:
   - **Recommended**: Namecheap, Cloudflare, GoDaddy, Porkbun
   - Cost: ~$10-15/year for `.org` domains

### 2.2 Configure Domain in Replit
1. Go to **Deployments** → **Settings** tab in your Replit workspace
2. Click **"Link a domain"** or **"Manually connect from another registrar"**
3. Enter your domain: `devclip.org`
4. Replit will show DNS records you need to add:
   ```
   Type: A
   Name: @
   Value: 34.132.134.162 (or IP provided by Replit)
   
   Type: TXT
   Name: _replit-challenge
   Value: [verification string from Replit]
   ```

### 2.3 Update DNS at Your Registrar
**For Namecheap:**
1. Log in → Domain List → Manage
2. Advanced DNS → Add New Record
3. Add the A record and TXT record from Replit

**For Cloudflare:**
1. Log in → Select domain → DNS
2. Add Record
3. **IMPORTANT**: Disable the orange cloud (proxy) for the A record
4. Add both A and TXT records

**For GoDaddy:**
1. Log in → My Products → DNS Management
2. Add → A Record and TXT Record

### 2.4 Wait for DNS Propagation
- Propagation can take **5 minutes to 48 hours**
- Check status in Replit's Deployments → Settings
- When complete, you'll see **"Verified"** status
- Replit automatically provides **free SSL/HTTPS** for your domain

### 2.5 Update Your Application
Once the domain is verified, update these references in your code:
- Update SEO meta tags in `Landing.tsx` to use `devclip.org`
- Update any hardcoded URLs to use your custom domain
- Test Stripe webhooks with the new domain URL

---

## 🧩 Step 3: Distribute Browser Extension

### 3.1 Installation Instructions Created
I've created `extension/INSTALLATION.md` with complete instructions for:
- Installing unpacked extension in Chrome/Edge
- Configuring API keys
- Using local formatters vs. AI tools
- Troubleshooting common issues

### 3.2 Share Extension (Current Method)
1. **Zip the extension folder**:
   ```bash
   cd extension
   zip -r devclip-extension.zip . -x "*.DS_Store"
   ```
2. **Distribute via**:
   - Direct download from your website
   - GitHub releases
   - Email to customers
3. **Users install using**:
   - Developer Mode → Load Unpacked (see INSTALLATION.md)

### 3.3 Chrome Web Store (Future - Recommended)
**When you're ready for public distribution:**

1. **Prepare Assets** (Required by Chrome Web Store):
   - 128x128 icon PNG (required)
   - 440x280 promo screenshot (required)
   - Detailed description (at least 132 characters)
   - Privacy policy URL

2. **Create Developer Account**:
   - Visit [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - One-time registration fee: $5

3. **Submit Extension**:
   - Upload zipped extension folder
   - Fill in metadata (description, screenshots, category)
   - Submit for review (~1-3 days)

4. **Benefits of Chrome Web Store**:
   - ✅ One-click installation for users
   - ✅ Automatic updates
   - ✅ Increased discoverability
   - ✅ Better trust/credibility

---

## 📋 Pre-Launch Checklist

### Environment & Configuration
- [ ] All environment variables set in Replit Secrets
- [ ] Stripe webhook configured with production keys
- [ ] Database is using Replit's hosted PostgreSQL
- [ ] Session secret is properly configured

### Deployment
- [ ] App published via Replit Autoscale Deployment
- [ ] Custom domain (devclip.org) connected and verified
- [ ] SSL certificate active (HTTPS working)
- [ ] Test basic authentication flow (SSO login)

### Payment & Billing
- [ ] Stripe test mode disabled (using live keys)
- [ ] Stripe webhook endpoint configured
- [ ] Subscription checkout tested
- [ ] Webhook events tested (checkout.session.completed)

### Browser Extension
- [ ] Extension icons present (16x16, 48x48, 128x128 PNG)
- [ ] INSTALLATION.md included with extension
- [ ] Extension tested in Chrome and Edge
- [ ] API key authentication working

### Testing
- [ ] Landing page loads correctly
- [ ] User can sign up/login via Replit Auth
- [ ] API documentation accessible
- [ ] Settings panel shows correct credit balance
- [ ] Browser extension connects to production API

### Monitoring
- [ ] Error logs being captured (error_logs table)
- [ ] Analytics tracking AI operations
- [ ] Stripe webhooks logging properly

---

## 🎯 Post-Launch Tasks

### Month 1
- [ ] Monitor error logs for production issues
- [ ] Set up automated AI credit refresh (scheduled job)
- [ ] Create landing page for browser extension distribution
- [ ] Gather user feedback via Feedback tab

### Month 2-3
- [ ] Submit extension to Chrome Web Store
- [ ] Add usage alerts/notifications
- [ ] Optimize database queries based on analytics
- [ ] Consider email notifications for key events

### Month 4+
- [ ] Implement team API key sharing
- [ ] Add more AI-powered features
- [ ] Expand to Firefox extension (Manifest V3 compatible)
- [ ] Marketing and growth initiatives

---

## 💰 Cost Estimates

### Replit Deployment (Autoscale)
- **Low traffic** (dev/testing): ~$10-20/month
- **Moderate traffic** (100-1000 users): ~$20-50/month
- **High traffic** (1000+ users): $50-200+/month
- You receive monthly Replit credits that offset costs

### Domain Registration
- **devclip.org**: ~$10-15/year

### Stripe Fees
- **2.9% + $0.30** per successful charge
- Example: $10 Pro subscription = $0.59 fee per month

### Total First Year Estimate
- Domain: $15
- Replit hosting: $240-600 (depends on traffic)
- Stripe fees: Variable (based on revenue)
- **Total**: ~$255-615/year minimum

---

## 🆘 Support & Resources

### Replit Documentation
- [Publishing Overview](https://docs.replit.com/category/replit-deployments)
- [Custom Domains](https://docs.replit.com/cloud-services/deployments/custom-domains)
- [Autoscale Deployments](https://docs.replit.com/cloud-services/deployments/autoscale-deployments)

### Stripe Resources
- [Webhook Documentation](https://stripe.com/docs/webhooks)
- [Checkout Sessions](https://stripe.com/docs/payments/checkout)
- [Subscription Lifecycle](https://stripe.com/docs/billing/subscriptions/overview)

### Chrome Extension
- [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Extension Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)

---

## 🎉 You're Ready to Launch!

Your DevClip application is production-ready with:
- ✅ Modern Replit Auth SSO
- ✅ Stripe payment processing
- ✅ Browser extension (Manifest V3)
- ✅ REST API with tiered AI models
- ✅ Comprehensive error tracking
- ✅ Usage analytics dashboard

**Next Steps:**
1. Click the "Publish" button in Replit
2. Register devclip.org domain
3. Configure Stripe webhook
4. Share extension with users
5. Monitor and iterate based on feedback

Good luck with your launch! 🚀
