// ========== INITIALIZATION ==========
let apiKey = null;
let apiBaseUrl = null;
let userData = null;

//Initialize popup
async function init() {
  // Load settings
  const data = await chrome.storage.sync.get(['apiKey', 'apiBaseUrl']);
  apiKey = data.apiKey;
  apiBaseUrl = data.apiBaseUrl || 'https://devclip.xyz/api/v1'; // Default to production
  
  // Show setup banner or account info
  if (apiKey) {
    await loadUserData();
  } else {
    showSetupBanner();
  }
}

// Load user data from API
async function loadUserData() {
  try {
    const baseUrl = apiBaseUrl.replace('/api/v1', '');
    const response = await fetch(`${baseUrl}/api/auth/user`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      userData = await response.json();
      showAccountBar();
    } else {
      showSetupBanner();
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
    showSetupBanner();
  }
}

// Show setup banner
function showSetupBanner() {
  document.getElementById('setupBanner').style.display = 'block';
  document.getElementById('accountBar').style.display = 'none';
}

// Show account bar
function showAccountBar() {
  if (!userData) return;
  
  const bar = document.getElementById('accountBar');
  const planBadge = document.getElementById('planBadge');
  const creditsInfo = document.getElementById('creditsInfo');
  
  // Plan badge
  planBadge.textContent = userData.plan.toUpperCase();
  planBadge.className = `plan-badge plan-${userData.plan}`;
  
  // Credits info
  const creditsUsed = userData.aiCreditsUsed || 0;
  const creditsTotal = userData.aiCreditsBalance + creditsUsed;
  const creditsRemaining = userData.aiCreditsBalance;
  creditsInfo.textContent = `${creditsRemaining}/${creditsTotal} credits`;
  
  bar.style.display = 'flex';
  document.getElementById('setupBanner').style.display = 'none';
}

// ========== EVENT LISTENERS ==========

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
  });
});

// Settings buttons
document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

document.getElementById('openSettingsFromBanner')?.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// ========== UNIVERSAL FORMAT TAB ==========
const inputText = document.getElementById('inputText');
const formatResult = document.getElementById('formatResult');
const languageBadge = document.getElementById('detectedLanguage');

// Read from clipboard
document.getElementById('readClipboard').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
    detectLanguage(text);
    showResult('formatResult', 'Clipboard text loaded! Click Auto-Format to beautify.', 'success');
  } catch (error) {
    showResult('formatResult', `Error reading clipboard: ${error.message}`, 'error');
  }
});

// Auto-format
document.getElementById('autoFormat').addEventListener('click', async () => {
  const text = inputText.value.trim();
  if (!text) {
    showResult('formatResult', 'Please enter some code first', 'error');
    return;
  }
  
  const lang = detectLanguage(text);
  showResult('formatResult', 'Formatting...', 'info');
  
  try {
    const formatted = formatCode(text, lang);
    showResult('formatResult', formatted, 'success');
    copyToClipboard(formatted);
  } catch (error) {
    showResult('formatResult', `Formatting error: ${error.message}`, 'error');
  }
});

// Copy result
document.getElementById('copyResult').addEventListener('click', () => {
  const result = formatResult.textContent;
  if (result && formatResult.style.display !== 'none') {
    copyToClipboard(result);
    showResult('formatResult', result, 'success');
  }
});

// Detect language
function detectLanguage(code) {
  const trimmed = code.trim();
  
  // Vue (check before HTML due to template tags)
  if (trimmed.includes('<template>') && trimmed.includes('</template>')) {
    showLanguageBadge('Vue');
    return 'vue';
  }
  
  // TSX (TypeScript + JSX)
  if ((trimmed.includes('interface ') || trimmed.includes(': React.')) && 
      (trimmed.includes('</') || trimmed.includes('/>'))) {
    showLanguageBadge('TSX');
    return 'tsx';
  }
  
  // JSX (JavaScript + JSX)
  if ((trimmed.includes('</') || trimmed.includes('/>')) && 
      (trimmed.includes('function ') || trimmed.includes('const ') || trimmed.includes('=>'))) {
    showLanguageBadge('JSX');
    return 'jsx';
  }
  
  // JSON (check before JS because JSON is valid JS)
  if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && 
      !trimmed.includes('function') && !trimmed.includes('=>')) {
    try {
      JSON.parse(trimmed);
      showLanguageBadge('JSON');
      return 'json';
    } catch (e) {
      // Not JSON, continue checking
    }
  }
  
  // TypeScript
  if (trimmed.includes('interface ') || trimmed.includes(': string') || 
      trimmed.includes(': number') || trimmed.includes('type ')) {
    showLanguageBadge('TypeScript');
    return 'typescript';
  }
  
  // JavaScript
  if (trimmed.includes('function ') || trimmed.includes('=>') || 
      trimmed.includes('const ') || trimmed.includes('let ')) {
    showLanguageBadge('JavaScript');
    return 'javascript';
  }
  
  // HTML
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || 
      (trimmed.includes('<') && trimmed.includes('>'))) {
    showLanguageBadge('HTML');
    return 'html';
  }
  
  // GraphQL
  if (trimmed.includes('query ') || trimmed.includes('mutation ') || 
      trimmed.includes('subscription ') || trimmed.includes('fragment ')) {
    showLanguageBadge('GraphQL');
    return 'graphql';
  }
  
  // SCSS
  if (trimmed.includes('$') && (trimmed.includes('{') || trimmed.includes(':'))) {
    showLanguageBadge('SCSS');
    return 'scss';
  }
  
  // Less
  if (trimmed.includes('@') && trimmed.includes('{') && trimmed.includes(':')) {
    showLanguageBadge('Less');
    return 'less';
  }
  
  // CSS
  if (trimmed.includes('{') && trimmed.includes(':') && trimmed.includes(';')) {
    showLanguageBadge('CSS');
    return 'css';
  }
  
  // YAML
  if (trimmed.includes(':') && !trimmed.includes('{') && 
      (trimmed.includes('\n') || trimmed.includes('  '))) {
    showLanguageBadge('YAML');
    return 'yaml';
  }
  
  // Markdown
  if (trimmed.includes('#') || trimmed.includes('```') || 
      trimmed.includes('- ') || trimmed.includes('* ')) {
    showLanguageBadge('Markdown');
    return 'markdown';
  }
  
  // Default to text
  showLanguageBadge('Plain Text');
  return 'text';
}

// Show language badge
function showLanguageBadge(lang) {
  languageBadge.textContent = `📝 Detected: ${lang}`;
  languageBadge.style.display = 'inline-flex';
}

// Format code
function formatCode(code, lang) {
  switch (lang) {
    case 'json':
      return JSON.stringify(JSON.parse(code), null, 2);
    
    case 'yaml':
      // Basic YAML formatting
      return code.trim();
    
    case 'javascript':
    case 'typescript':
    case 'jsx':
    case 'tsx':
      // Basic JS/TS formatting
      return beautifyJS(code);
    
    case 'html':
      return beautifyHTML(code);
    
    case 'css':
    case 'scss':
    case 'less':
      return beautifyCSS(code);
    
    default:
      return code;
  }
}

// Basic JS beautifier
function beautifyJS(code) {
  let formatted = code;
  // Add newlines after semicolons
  formatted = formatted.replace(/;(?!\n)/g, ';\n');
  // Add newlines after braces
  formatted = formatted.replace(/\{(?!\n)/g, '{\n');
  formatted = formatted.replace(/\}(?!\n)/g, '}\n');
  return formatted.trim();
}

// Basic HTML beautifier
function beautifyHTML(html) {
  let formatted = html;
  formatted = formatted.replace(/></g, '>\n<');
  return formatted.trim();
}

// Basic CSS beautifier
function beautifyCSS(css) {
  let formatted = css;
  formatted = formatted.replace(/\{/g, ' {\n  ');
  formatted = formatted.replace(/;/g, ';\n  ');
  formatted = formatted.replace(/\}/g, '\n}\n');
  return formatted.trim();
}

// ========== AI TAB ==========
const aiInputText = document.getElementById('aiInputText');
const aiResult = document.getElementById('aiResult');

// AI Explain
document.getElementById('explainCode').addEventListener('click', async () => {
  await handleAiRequest('explain', aiInputText.value.trim());
});

// AI Refactor
document.getElementById('refactorCode').addEventListener('click', async () => {
  await handleAiRequest('refactor', aiInputText.value.trim());
});

// AI Summarize
document.getElementById('summarizeLogs').addEventListener('click', async () => {
  await handleAiRequest('summarize', aiInputText.value.trim());
});

async function handleAiRequest(operation, text) {
  if (!text) {
    showResult('aiResult', 'Please enter some code or text first', 'error');
    return;
  }
  
  if (!apiKey) {
    showResult('aiResult', 'No API key configured. Click ⚙️ Settings to add your key.', 'error');
    return;
  }
  
  showResult('aiResult', 'Processing...', 'info');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'aiRequest',
      operation,
      text
    });
    
    if (response.error) {
      showResult('aiResult', `Error: ${response.error}`, 'error');
    } else {
      showResult('aiResult', response.result, 'success');
      copyToClipboard(response.result);
    }
    
    // ALWAYS reload user data after AI request to update credits
    await loadUserData();
  } catch (error) {
    showResult('aiResult', `Error: ${error.message}`, 'error');
  }
}

// ========== HELPER FUNCTIONS ==========
function showResult(elementId, text, type = '') {
  const element = document.getElementById(elementId);
  element.style.display = 'block';
  element.textContent = text;
  element.className = `result ${type}`;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(error => {
    console.error('Failed to copy to clipboard:', error);
  });
}

// Initialize on load
init();
