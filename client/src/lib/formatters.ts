// Local text formatters - all run client-side for privacy and speed

export function formatJson(text: string): string {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    throw new Error("Invalid JSON: " + (error instanceof Error ? error.message : "Unknown error"));
  }
}

export function formatYaml(text: string): string {
  try {
    // Basic YAML formatting without external dependencies
    const lines = text.split('\n');
    let formatted = '';
    let indentLevel = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        formatted += line + '\n';
        continue;
      }
      
      // Detect list items
      if (trimmed.startsWith('- ')) {
        formatted += '  '.repeat(Math.max(0, indentLevel)) + trimmed + '\n';
      }
      // Detect key-value pairs
      else if (trimmed.includes(':')) {
        const indent = '  '.repeat(indentLevel);
        formatted += indent + trimmed + '\n';
        
        // Increase indent for next level if line ends with :
        if (trimmed.endsWith(':')) {
          indentLevel++;
        }
      } else {
        formatted += '  '.repeat(Math.max(0, indentLevel)) + trimmed + '\n';
      }
    }
    
    return formatted;
  } catch (error) {
    throw new Error("Invalid YAML: " + (error instanceof Error ? error.message : "Unknown error"));
  }
}

export function formatSql(text: string): string {
  // Basic SQL formatting - uppercase keywords, proper indentation
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
    'ON', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
    'ALTER', 'DROP', 'INDEX', 'VIEW', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG',
    'MAX', 'MIN', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IS', 'NOT', 'NULL',
  ];
  
  let formatted = text.trim();
  
  // Replace keywords with uppercase
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    formatted = formatted.replace(regex, keyword);
  });
  
  // Add line breaks before major keywords
  const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'ORDER BY', 'GROUP BY', 'LIMIT'];
  majorKeywords.forEach(keyword => {
    formatted = formatted.replace(new RegExp(`\\s+${keyword}\\s+`, 'g'), `\n${keyword} `);
  });
  
  return formatted.trim();
}

export function stripAnsi(text: string): string {
  // Remove ANSI escape codes (color codes, etc.)
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

export function logToMarkdown(text: string): string {
  const lines = text.split('\n');
  let markdown = '# Log Summary\n\n';
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    // Detect log levels and format without emojis
    if (trimmed.match(/\[ERROR\]|ERROR:/i)) {
      markdown += `**[ERROR]**: ${trimmed.replace(/\[ERROR\]|ERROR:/i, '').trim()}\n\n`;
    } else if (trimmed.match(/\[WARN\]|WARNING:/i)) {
      markdown += `**[WARN]**: ${trimmed.replace(/\[WARN\]|WARNING:/i, '').trim()}\n\n`;
    } else if (trimmed.match(/\[INFO\]|INFO:/i)) {
      markdown += `**[INFO]**: ${trimmed.replace(/\[INFO\]|INFO:/i, '').trim()}\n\n`;
    } else if (trimmed.match(/\[DEBUG\]|DEBUG:/i)) {
      markdown += `**[DEBUG]**: ${trimmed.replace(/\[DEBUG\]|DEBUG:/i, '').trim()}\n\n`;
    } else {
      markdown += `${trimmed}\n\n`;
    }
  });
  
  return markdown;
}
