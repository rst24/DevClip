# DevClip Browser Extension

A Chrome/Edge extension for local text formatting and AI-powered code tools.

## Features

### Local Formatters (Free, Offline)
- **JSON Formatter**: Pretty-print JSON with proper indentation
- **YAML Converter**: Convert JSON to YAML format
- **SQL Formatter**: Beautify SQL queries
- **ANSI Stripper**: Remove ANSI color codes from logs
- **Log to Markdown**: Convert plain logs to Markdown code blocks

### AI Tools (Requires API Key)
- **Explain Code**: Get AI explanations of code snippets (1 credit)
- **Refactor Code**: Improve and modernize your code (2 credits)
- **Summarize Logs**: Condense long log files (1 credit)

## Installation

### Icon Setup (Required)
Before loading the extension, you need to add proper PNG icon files:
1. Create or generate 16x16, 48x48, and 128x128 PNG icons
2. Save them as `icon16.png`, `icon48.png`, and `icon128.png` in the `extension/icons/` directory
3. Recommended: Blue clipboard icon with text lines

### Development
1. Add PNG icons to `extension/icons/` (see Icon Setup above)
2. Open Chrome/Edge and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `extension` directory

### Production
(Coming soon to Chrome Web Store)

## Setup

1. Install the extension
2. Click the DevClip icon in your toolbar
3. Click the settings icon (gear) in the popup
4. Generate an API key from the [DevClip Dashboard](http://localhost:5000)
5. Paste your API key in the settings page
6. Click "Save Settings" and "Test Connection"

## Usage

### Format Text Locally
1. Copy text to your clipboard or paste it in the extension
2. Click "Read from Clipboard" to load clipboard content
3. Choose a formatter (JSON, YAML, SQL, etc.)
4. The formatted result is automatically copied to your clipboard

### Use AI Tools
1. Paste your code or text in the AI Tools tab
2. Choose an operation (Explain, Refactor, or Summarize)
3. Results appear below and are copied to clipboard

## API Key

AI features require an API key from the DevClip web app:
- Free plan: No API access
- Pro plan: 5,000 AI credits/month, 3 API keys
- Team plan: 25,000 AI credits/month, unlimited API keys

## Privacy

- Local formatters run entirely offline in your browser
- AI requests are sent to the DevClip API with your API key
- No data is stored or tracked by the extension
- API keys are stored securely in Chrome's sync storage

## Support

- [Documentation](http://localhost:5000/docs)
- [Dashboard](http://localhost:5000)
- [Feedback](http://localhost:5000/?tab=feedback)

## Version

v1.0.0 - Initial release
