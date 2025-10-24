// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
  });
});

// Settings button
document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// ========== FORMAT TAB ==========
const inputText = document.getElementById('inputText');
const formatResult = document.getElementById('formatResult');

// Read from clipboard
document.getElementById('readClipboard').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
    showResult('formatResult', 'Clipboard text loaded', 'success');
  } catch (error) {
    showResult('formatResult', `Error reading clipboard: ${error.message}`, 'error');
  }
});

// Format JSON
document.getElementById('formatJson').addEventListener('click', () => {
  const text = inputText.value.trim();
  if (!text) {
    showResult('formatResult', 'Please enter some text first', 'error');
    return;
  }
  
  try {
    const parsed = JSON.parse(text);
    const formatted = JSON.stringify(parsed, null, 2);
    showResult('formatResult', formatted, 'success');
    copyToClipboard(formatted);
  } catch (error) {
    showResult('formatResult', `JSON parsing error: ${error.message}`, 'error');
  }
});

// Format YAML (basic conversion from JSON)
document.getElementById('formatYaml').addEventListener('click', () => {
  const text = inputText.value.trim();
  if (!text) {
    showResult('formatResult', 'Please enter some text first', 'error');
    return;
  }
  
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(text);
    const yaml = jsonToYaml(parsed);
    showResult('formatResult', yaml, 'success');
    copyToClipboard(yaml);
  } catch (error) {
    showResult('formatResult', `YAML conversion error: ${error.message}`, 'error');
  }
});

// Format SQL (basic beautification)
document.getElementById('formatSql').addEventListener('click', () => {
  const text = inputText.value.trim();
  if (!text) {
    showResult('formatResult', 'Please enter some text first', 'error');
    return;
  }
  
  const formatted = formatSql(text);
  showResult('formatResult', formatted, 'success');
  copyToClipboard(formatted);
});

// Strip ANSI codes
document.getElementById('stripAnsi').addEventListener('click', () => {
  const text = inputText.value.trim();
  if (!text) {
    showResult('formatResult', 'Please enter some text first', 'error');
    return;
  }
  
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  showResult('formatResult', stripped, 'success');
  copyToClipboard(stripped);
});

// Log to Markdown
document.getElementById('logToMarkdown').addEventListener('click', () => {
  const text = inputText.value.trim();
  if (!text) {
    showResult('formatResult', 'Please enter some text first', 'error');
    return;
  }
  
  const markdown = logToMarkdown(text);
  showResult('formatResult', markdown, 'success');
  copyToClipboard(markdown);
});

// ========== AI TAB ==========
const aiInputText = document.getElementById('aiInputText');
const aiResult = document.getElementById('aiResult');

// Check if API key is configured
async function checkApiKey() {
  const data = await chrome.storage.sync.get(['apiKey']);
  return data.apiKey;
}

// AI Explain
document.getElementById('explainCode').addEventListener('click', async () => {
  const text = aiInputText.value.trim();
  if (!text) {
    showResult('aiResult', 'Please enter some code first', 'error');
    return;
  }
  
  const apiKey = await checkApiKey();
  if (!apiKey) {
    showResult('aiResult', 'No API key configured. Go to Settings to add your key.', 'error');
    return;
  }
  
  showResult('aiResult', 'Processing...', 'info');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'aiRequest',
      operation: 'explain',
      text: text
    });
    
    if (response.error) {
      showResult('aiResult', `Error: ${response.error}`, 'error');
    } else {
      showResult('aiResult', response.result, 'success');
    }
  } catch (error) {
    showResult('aiResult', `Error: ${error.message}`, 'error');
  }
});

// AI Refactor
document.getElementById('refactorCode').addEventListener('click', async () => {
  const text = aiInputText.value.trim();
  if (!text) {
    showResult('aiResult', 'Please enter some code first', 'error');
    return;
  }
  
  const apiKey = await checkApiKey();
  if (!apiKey) {
    showResult('aiResult', 'No API key configured. Go to Settings to add your key.', 'error');
    return;
  }
  
  showResult('aiResult', 'Processing...', 'info');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'aiRequest',
      operation: 'refactor',
      text: text
    });
    
    if (response.error) {
      showResult('aiResult', `Error: ${response.error}`, 'error');
    } else {
      showResult('aiResult', response.result, 'success');
      copyToClipboard(response.result);
    }
  } catch (error) {
    showResult('aiResult', `Error: ${error.message}`, 'error');
  }
});

// AI Summarize
document.getElementById('summarizeLogs').addEventListener('click', async () => {
  const text = aiInputText.value.trim();
  if (!text) {
    showResult('aiResult', 'Please enter some text first', 'error');
    return;
  }
  
  const apiKey = await checkApiKey();
  if (!apiKey) {
    showResult('aiResult', 'No API key configured. Go to Settings to add your key.', 'error');
    return;
  }
  
  showResult('aiResult', 'Processing...', 'info');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'aiRequest',
      operation: 'summarize',
      text: text
    });
    
    if (response.error) {
      showResult('aiResult', `Error: ${response.error}`, 'error');
    } else {
      showResult('aiResult', response.result, 'success');
    }
  } catch (error) {
    showResult('aiResult', `Error: ${error.message}`, 'error');
  }
});

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

// Simple JSON to YAML converter
function jsonToYaml(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  let yaml = '';
  
  if (Array.isArray(obj)) {
    obj.forEach(item => {
      yaml += `${spaces}- `;
      if (typeof item === 'object' && item !== null) {
        yaml += '\n' + jsonToYaml(item, indent + 1);
      } else {
        yaml += `${item}\n`;
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        yaml += `${spaces}${key}:\n${jsonToYaml(value, indent + 1)}`;
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    });
  }
  
  return yaml;
}

// Basic SQL formatter
function formatSql(sql) {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 
                   'INNER JOIN', 'ON', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 
                   'HAVING', 'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES', 
                   'UPDATE', 'SET', 'DELETE FROM'];
  
  let formatted = sql;
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${keyword}`);
  });
  
  return formatted.trim();
}

// Log to Markdown converter
function logToMarkdown(log) {
  const lines = log.split('\n');
  let markdown = '# Log Output\n\n';
  markdown += '```\n';
  markdown += lines.join('\n');
  markdown += '\n```\n';
  return markdown;
}
