// Load saved settings
async function loadSettings() {
  const data = await chrome.storage.sync.get(['apiKey', 'apiBaseUrl']);
  
  if (data.apiKey) {
    document.getElementById('apiKey').value = data.apiKey;
    updateApiKeyStatus(true);
  }
  
  if (data.apiBaseUrl) {
    document.getElementById('apiBaseUrl').value = data.apiBaseUrl;
  } else {
    // Default to production
    document.getElementById('apiBaseUrl').value = 'https://devclip.xyz/api/v1';
  }
  
  // Update dashboard links based on selected URL
  updateDashboardLinks();
}

// Update dashboard links with auto-login
function updateDashboardLinks() {
  const baseUrl = document.getElementById('apiBaseUrl').value.replace('/api/v1', '');
  const apiKey = document.getElementById('apiKey').value.trim();
  
  // If API key exists, use auto-login URL, otherwise direct link
  if (apiKey) {
    document.getElementById('dashboardLink').href = `${baseUrl}/api/auth/api-login?key=${encodeURIComponent(apiKey)}`;
    document.getElementById('dashboardLinkFooter').href = `${baseUrl}/api/auth/api-login?key=${encodeURIComponent(apiKey)}`;
    document.getElementById('subscriptionLink').href = `${baseUrl}/api/auth/api-login?key=${encodeURIComponent(apiKey)}`;
  } else {
    document.getElementById('dashboardLink').href = baseUrl;
    document.getElementById('dashboardLinkFooter').href = baseUrl;
    document.getElementById('subscriptionLink').href = `${baseUrl}/?tab=settings`;
  }
}

// Listen for URL changes
document.getElementById('apiBaseUrl').addEventListener('change', updateDashboardLinks);

// Save settings
async function saveSettings() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const apiBaseUrl = document.getElementById('apiBaseUrl').value || 'https://devclip.xyz/api/v1';
  
  if (!apiKey) {
    showAlert('Please enter an API key', 'error');
    return;
  }
  
  try {
    await chrome.storage.sync.set({
      apiKey,
      apiBaseUrl
    });
    
    showAlert('Settings saved successfully!', 'success');
    updateApiKeyStatus(true);
    updateDashboardLinks(); // Update links with API key for auto-login
  } catch (error) {
    showAlert(`Error saving settings: ${error.message}`, 'error');
  }
}

// Test API connection
async function testConnection() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const apiBaseUrl = document.getElementById('apiBaseUrl').value || 'https://devclip.xyz/api/v1';
  
  if (!apiKey) {
    showAlert('Please enter an API key first', 'error');
    return;
  }
  
  showAlert('Testing connection...', 'info');
  
  try {
    // Test with format endpoint (uses API key authentication)
    const response = await fetch(`${apiBaseUrl}/format`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        text: '{"test": "connection"}'
      })
    });
    
    if (response.ok) {
      showAlert(`✅ API Key Valid! Connection successful.`, 'success');
      updateApiKeyStatus(true);
    } else if (response.status === 401) {
      const data = await response.json().catch(() => ({}));
      showAlert(`❌ Invalid API key: ${data.message || 'Authentication failed'}`, 'error');
      updateApiKeyStatus(false);
    } else if (response.status === 402) {
      showAlert('⚠️ API key is valid but you have insufficient credits.', 'warning');
      updateApiKeyStatus(true);
    } else {
      const data = await response.json().catch(() => ({}));
      showAlert(`Connection failed: ${data.message || response.statusText}`, 'error');
      updateApiKeyStatus(false);
    }
  } catch (error) {
    showAlert(`Connection error: ${error.message}. Make sure you're online and the server is accessible.`, 'error');
    updateApiKeyStatus(false);
  }
}

// Clear settings
async function clearSettings() {
  if (confirm('Are you sure you want to clear all settings?')) {
    await chrome.storage.sync.clear();
    document.getElementById('apiKey').value = '';
    document.getElementById('apiBaseUrl').value = 'https://devclip.xyz/api/v1';
    showAlert('Settings cleared', 'info');
    updateApiKeyStatus(false);
    updateDashboardLinks();
  }
}

// Show alert message
function showAlert(message, type = 'info') {
  const container = document.getElementById('alertContainer');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  container.innerHTML = '';
  container.appendChild(alert);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

// Update API key status indicator
function updateApiKeyStatus(isConnected) {
  const statusElement = document.getElementById('apiKeyStatus');
  if (isConnected) {
    statusElement.innerHTML = '<span class="status-badge status-connected">Connected</span>';
  } else {
    statusElement.innerHTML = '<span class="status-badge status-disconnected">Not Connected</span>';
  }
}

// Event listeners
document.getElementById('saveSettings').addEventListener('click', saveSettings);
document.getElementById('testConnection').addEventListener('click', testConnection);
document.getElementById('clearSettings').addEventListener('click', clearSettings);

// Handle Enter key in input fields
document.getElementById('apiKey').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') saveSettings();
});

document.getElementById('apiBaseUrl').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') saveSettings();
});

// Load settings on page load
loadSettings();
