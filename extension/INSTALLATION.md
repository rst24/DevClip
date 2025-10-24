# DevClip Browser Extension - Installation Guide

## 📦 Installation Instructions

### Chrome / Edge Installation (Developer Mode)

Since the DevClip extension is not yet published on the Chrome Web Store, you'll need to install it manually using Developer Mode.

#### Step 1: Enable Developer Mode
1. Open your browser and navigate to:
   - **Chrome**: `chrome://extensions`
   - **Edge**: `edge://extensions`
2. Toggle **"Developer mode"** switch in the top-right corner

#### Step 2: Load the Extension
1. Click the **"Load unpacked"** button that appears
2. In the file picker dialog, navigate to and select the `extension` folder (the one containing `manifest.json`)
3. Click **"Select Folder"**

#### Step 3: Verify Installation
- The DevClip extension should now appear in your extensions list
- You'll see the DevClip icon in your browser toolbar
- Click the puzzle icon (🧩) in your toolbar and pin DevClip for easy access

---

## ⚙️ Initial Setup

### Configure Your API Key

1. **Right-click** the DevClip icon in your toolbar
2. Select **"Options"** from the menu
3. In the options page:
   - Paste your API key from the DevClip web dashboard
   - Click **"Test Connection"** to verify it works
   - Click **"Save Settings"**

### Get Your API Key
1. Visit the DevClip web dashboard at `https://[your-domain].replit.app`
2. Log in with your account
3. Navigate to the **Settings** tab
4. Click **"Generate New Key"** (Pro/Team plans only)
5. Copy the generated key (it will only be shown once!)

---

## 🚀 Using the Extension

### Local Formatters (No API Key Required)
Click the DevClip icon and select from:
- **Format JSON** - Beautify minified JSON
- **Format YAML** - Beautify YAML files
- **Format SQL** - Pretty-print SQL queries
- **Strip ANSI** - Remove color codes from terminal output
- **Log to Markdown** - Convert logs to formatted markdown

### AI-Powered Tools (Requires API Key)
- **Explain Code** - Get AI explanations of code snippets
- **Refactor Code** - Receive AI-powered refactoring suggestions
- **Summarize Logs** - Generate concise log summaries

---

## 🔧 Troubleshooting

### "Manifest file is missing or unreadable"
- Ensure you selected the `extension` folder (not a parent or child folder)
- Verify `manifest.json` exists in the selected folder

### "Load Unpacked doesn't respond"
- Restart your browser and try again
- Check that Developer Mode is enabled

### Extension icon not showing
- Check if the icon files exist in `extension/icons/` directory
- Reload the extension by clicking the refresh icon on the extensions page

### API calls failing
- Verify your API key is correct in the Options page
- Check your subscription plan (Free tier cannot use API keys)
- Ensure you have available AI credits

---

## 📋 Requirements

- **Browser**: Chrome 88+ or Edge 88+
- **API Access**: Pro or Team subscription plan required for API features
- **Local Formatters**: Available to all users (no API key needed)

---

## 🔄 Updating the Extension

When DevClip releases updates:

1. Download the new extension folder
2. Go to `chrome://extensions` or `edge://extensions`
3. Click the **refresh icon** (↻) on the DevClip extension card
4. Or remove the old version and load the new unpacked folder

---

## 🌐 Chrome Web Store (Coming Soon)

Once published to the Chrome Web Store, installation will be as simple as:
1. Visit the DevClip listing on the Chrome Web Store
2. Click **"Add to Chrome"** or **"Add to Edge"**
3. Confirm the permissions
4. Start using DevClip!

---

## ⚠️ Security Note

Only install this extension if you downloaded it from the official DevClip website or GitHub repository. Unpacked extensions have full browser permissions.

---

## 📞 Support

- **Web Dashboard**: Access your account and manage API keys
- **Documentation**: Visit `/docs` on the web app for API documentation
- **Issues**: Report bugs or request features through the Feedback tab

---

**Happy formatting! 🎉**
