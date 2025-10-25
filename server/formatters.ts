// Local text formatters - all run server-side but could be moved to client
import * as yaml from "yaml";
import * as prettier from "prettier";

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
    const parsed = yaml.parse(text);
    return yaml.stringify(parsed, { indent: 2 });
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

// Universal code formatter with auto-detection
export type SupportedLanguage = 
  | "javascript" | "typescript" | "jsx" | "tsx"
  | "html" | "css" | "scss" | "less"
  | "json" | "yaml" 
  | "markdown" | "graphql"
  | "php" | "ruby" | "xml" | "java" | "go";

// Language detection patterns
const languagePatterns: Record<string, RegExp> = {
  typescript: /^(import|export|interface|type|enum|namespace|as|declare)/m,
  tsx: /^(import.*from|export.*|interface|type).*<[A-Z]/m,
  jsx: /<[A-Z][a-z]*[\s>]/,
  html: /^<!DOCTYPE html>|<html|<head|<body|<div|<span|<p|<a/i,
  css: /\{[^}]*:[^}]*\}|@media|@keyframes|\.[\w-]+\s*\{/,
  scss: /\$[\w-]+:|@mixin|@include|@extend|&:/,
  json: /^\s*[\{\[]/,
  yaml: /^[\w-]+:\s*[\w-]|^\s*-\s+[\w]/m,
  markdown: /^#{1,6}\s+|^\*\*|^```|^\[.*\]\(.*\)/m,
  graphql: /^(query|mutation|subscription|fragment|type|interface|enum|input|schema)/m,
  php: /^<\?php|namespace|use|class|function|public|private|protected/m,
  ruby: /^(def|class|module|require|include|end|do|if|unless)\s+/m,
  xml: /^<\?xml|<[\w-]+.*>/,
  java: /^(public|private|protected|class|interface|import|package)\s+/m,
  go: /^(package|import|func|type|var|const)\s+/m,
  javascript: /^(import|export|const|let|var|function|class|=>|\{|\[)/m,
};

function detectLanguage(code: string): SupportedLanguage {
  const trimmed = code.trim();
  
  // Check patterns in order of specificity
  if (languagePatterns.typescript.test(trimmed) && !trimmed.includes('<')) {
    return "typescript";
  }
  if (languagePatterns.tsx.test(trimmed)) {
    return "tsx";
  }
  if (languagePatterns.jsx.test(trimmed)) {
    return "jsx";
  }
  if (languagePatterns.html.test(trimmed)) {
    return "html";
  }
  if (languagePatterns.scss.test(trimmed)) {
    return "scss";
  }
  if (languagePatterns.css.test(trimmed)) {
    return "css";
  }
  if (languagePatterns.json.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // Not valid JSON
    }
  }
  if (languagePatterns.yaml.test(trimmed)) {
    return "yaml";
  }
  if (languagePatterns.markdown.test(trimmed)) {
    return "markdown";
  }
  if (languagePatterns.graphql.test(trimmed)) {
    return "graphql";
  }
  if (languagePatterns.php.test(trimmed)) {
    return "php";
  }
  if (languagePatterns.ruby.test(trimmed)) {
    return "ruby";
  }
  if (languagePatterns.xml.test(trimmed)) {
    return "xml";
  }
  if (languagePatterns.java.test(trimmed)) {
    return "java";
  }
  if (languagePatterns.go.test(trimmed)) {
    return "go";
  }
  if (languagePatterns.javascript.test(trimmed)) {
    return "javascript";
  }
  
  return "javascript";
}

export async function formatCode(code: string, language?: SupportedLanguage): Promise<{ formatted: string; detectedLanguage: string }> {
  try {
    const detectedLanguage = language || detectLanguage(code);
    
    // Map language to Prettier parser
    const parserMap: Record<SupportedLanguage, string> = {
      javascript: "babel",
      typescript: "typescript",
      jsx: "babel",
      tsx: "typescript",
      html: "html",
      css: "css",
      scss: "scss",
      less: "less",
      json: "json",
      yaml: "yaml",
      markdown: "markdown",
      graphql: "graphql",
      php: "php",
      ruby: "ruby",
      xml: "xml",
      java: "java",
      go: "go-template",
    };
    
    const parser = parserMap[detectedLanguage];
    
    const formatted = await prettier.format(code, {
      parser,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
      bracketSpacing: true,
      arrowParens: "always",
      plugins: [
        "@prettier/plugin-php",
        "@prettier/plugin-ruby",
        "@prettier/plugin-xml",
        "prettier-plugin-java",
        "prettier-plugin-go-template",
      ],
    });
    
    return {
      formatted: formatted.trim(),
      detectedLanguage,
    };
  } catch (error) {
    throw new Error(`Failed to format ${language || 'code'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
