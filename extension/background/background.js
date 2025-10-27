// Background service worker for DevClip extension
// Handles AI requests to the DevClip API

const API_BASE_URL = 'https://devclip.xyz/api/v1'; // Default to production

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'aiRequest') {
    handleAiRequest(request)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep channel open for async response
  }
});

// Handle AI requests
async function handleAiRequest({ operation, text }) {
  try {
    // Get API key from storage
    const data = await chrome.storage.sync.get(['apiKey', 'apiBaseUrl']);
    const apiKey = data.apiKey;
    const baseUrl = data.apiBaseUrl || API_BASE_URL;
    
    if (!apiKey) {
      throw new Error('No API key configured');
    }
    
    // Determine endpoint based on operation
    let endpoint;
    switch (operation) {
      case 'explain':
        endpoint = `${baseUrl}/ai/explain`;
        break;
      case 'refactor':
        endpoint = `${baseUrl}/ai/refactor`;
        break;
      case 'summarize':
        endpoint = `${baseUrl}/ai/summarize`;
        break;
      case 'format':
        endpoint = `${baseUrl}/format`;
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    
    // Make API request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ text })
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your settings.');
      } else if (response.status === 402) {
        throw new Error('Insufficient credits. Please upgrade your plan.');
      } else if (response.status === 403) {
        throw new Error('Access forbidden. Please upgrade your plan.');
      } else {
        throw new Error(responseData.message || `API request failed: ${response.status}`);
      }
    }
    
    return { result: responseData.result };
  } catch (error) {
    console.error('AI request error:', error);
    throw error;
  }
}

// Install/update handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('DevClip extension installed');
    // Open options page on first install
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    console.log('DevClip extension updated');
  }
});
