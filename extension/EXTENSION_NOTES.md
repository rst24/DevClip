# DevClip Extension Notes

## Recent Fixes (October 27, 2025)

### Issue 1: API Key 401 Error - FIXED ✅
**Problem:** Extension showed "Connected" when saving API key, but "Test Connection" returned 401 Unauthorized.

**Root Cause:** The test was calling `/api/auth/user` which requires **session authentication** (cookies), not API key authentication. API keys only work with `/api/v1/*` endpoints.

**Solution:** Updated `options.js` to test connection using `/api/v1/format` endpoint which properly accepts Bearer token authentication.

**Files Changed:**
- `extension/options/options.js` - Updated testConnection() function
- `extension/popup/popup.js` - Updated loadUserData() function

---

### Issue 2: Dashboard Links Not Logged In - EXPECTED BEHAVIOR ℹ️
**Problem:** Clicking Dashboard/Manage Subscription links opens webapp without being logged in.

**Explanation:** This is **expected browser behavior** for security reasons:
- The browser extension and web app are on **different origins**
- Browser security prevents sharing session cookies across origins
- Opening a link from the extension to the webapp cannot carry over authentication

**User Workflow:**
1. User clicks "Dashboard" link in extension
2. Browser opens devclip.xyz in a new tab
3. User logs in with Replit Auth (Google, GitHub, Apple, X)
4. User accesses their dashboard

**Why we can't fix this:**
- Session cookies are bound to the origin (domain)
- Browser extensions can't inject session cookies into the web app
- This is a fundamental browser security feature (prevents session hijacking)

**Alternative:** Users need to log into the web app separately to manage their account, subscriptions, and view analytics. The extension uses API keys for authentication independently.

---

### Issue 3: Logo Still Shows Replit Icon - INVESTIGATING 🔍
**Expected:** Green paperclip on black background (matching web app)
**Actual:** Replit logo appearing

**Investigation:**
- Copied `client/public/favicon.png` to `extension/icons/icon-*.png`
- Updated `manifest.json` with icon paths
- File size: 1.2KB (seems correct for a small PNG)

**Possible Causes:**
1. The `favicon.png` file might actually contain the Replit logo
2. Browser cache - extension might need hard reload
3. Icon files not properly copied

**To Verify Logo in Extension:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Find DevClip extension
4. Click the reload button (circular arrow)
5. Check if icon updates in Chrome toolbar

**If still showing Replit logo:**
- The source `client/public/favicon.png` needs to be replaced with the green paperclip logo
- Then re-run the icon copy process
