// Load saved settings
async function loadSettings() {
  const data = await chrome.storage.sync.get(['apiKey', 'apiBaseUrl']);
  
  if (data.apiKey) {
    document.getElementById('apiKey').value = data.apiKey;
    updateApiKeyStatus(true);
  }
  
  if (data.apiBaseUrl) {
    document.getElementById('apiBaseUrl').value = data.apiBaseUrl;
  }
}

// Save settings
async function saveSettings() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const apiBaseUrl = document.getElementById('apiBaseUrl').value.trim() || 'http://localhost:5000/api/v1';
  
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
  } catch (error) {
    showAlert(`Error saving settings: ${error.message}`, 'error');
  }
}

// Test API connection
async function testConnection() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const apiBaseUrl = document.getElementById('apiBaseUrl').value.trim() || 'http://localhost:5000/api/v1';
  
  if (!apiKey) {
    showAlert('Please enter an API key first', 'error');
    return;
  }
  
  showAlert('Testing connection...', 'info');
  
  try {
    const response = await fetch(`${apiBaseUrl}/format`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        text: '{"test": "connection"}',
        operation: 'json'
      })
    });
    
    if (response.ok) {
      showAlert('Connection successful! Your API key is valid.', 'success');
      updateApiKeyStatus(true);
    } else if (response.status === 401) {
      showAlert('Invalid API key. Please check your key and try again.', 'error');
      updateApiKeyStatus(false);
    } else if (response.status === 402) {
      showAlert('API key is valid but you have insufficient credits.', 'error');
    } else {
      const data = await response.json();
      showAlert(`Connection failed: ${data.message || response.statusText}`, 'error');
      updateApiKeyStatus(false);
    }
  } catch (error) {
    showAlert(`Connection error: ${error.message}. Make sure the DevClip server is running.`, 'error');
    updateApiKeyStatus(false);
  }
}

// Clear settings
async function clearSettings() {
  if (confirm('Are you sure you want to clear all settings?')) {
    await chrome.storage.sync.clear();
    document.getElementById('apiKey').value = '';
    document.getElementById('apiBaseUrl').value = 'http://localhost:5000/api/v1';
    showAlert('Settings cleared', 'info');
    updateApiKeyStatus(false);
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
