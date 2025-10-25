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

// Universal code formatter with auto-detection (matching client-side capabilities)
export type SupportedLanguage = 
  | "javascript" | "typescript" | "jsx" | "tsx"
  | "html" | "css" | "scss" | "less"
  | "json" | "yaml" 
  | "markdown" | "graphql"
  | "vue";

// Language detection patterns (matching client-side)
const languagePatterns: Record<string, RegExp> = {
  vue: /^<template[\s>]|<script[\s>]|<style[\s>]/i,
  // TypeScript: Check for TS-specific syntax (type annotations, generics, decorators, keywords)
  typescript: /:\s*(?:string|number|boolean|any|void|never|unknown|object|Array|Promise|Record|Partial|Required)<|<[A-Z]\w*>|interface\s+\w+|type\s+\w+\s*=|enum\s+\w+|@Component|@NgModule|@Injectable|@Directive|@Pipe|import\s+(?:type\s+)?{|export\s+(?:type\s+|interface\s+|enum\s+)|as\s+(?:const|any)|declare\s+/,
  tsx: /^(import.*from|export.*|interface|type).*<[A-Z]/m,
  jsx: /<[A-Z][a-z]*[\s>]/,
  html: /^<!DOCTYPE html>|<html|<head|<body|<div|<span|<p|<a/i,
  scss: /\$[\w-]+:|@mixin|@include|@extend|&:/,
  less: /@[\w-]+:|\.[\w-]+\s*\{.*&:/,
  css: /\{[^}]*:[^}]*\}|@media|@keyframes|\.[\w-]+\s*\{/,
  json: /^\s*[\{\[]/,
  yaml: /^[\w-]+:\s*[\w-]|^\s*-\s+[\w]/m,
  markdown: /^#{1,6}\s+|^\*\*|^```|^\[.*\]\(.*\)/m,
  graphql: /^(query|mutation|subscription|fragment|type|interface|enum|input|schema)/m,
  javascript: /^(import|export|const|let|var|function|class|=>|\{|\[)/m,
};

function detectLanguage(code: string): SupportedLanguage {
  const trimmed = code.trim();
  
  // Check patterns in order of specificity (matching client-side logic)
  // Note: Order matters - more specific patterns first
  if (languagePatterns.vue.test(trimmed)) {
    return "vue";
  }
  if (languagePatterns.tsx.test(trimmed)) {
    return "tsx";
  }
  if (languagePatterns.jsx.test(trimmed)) {
    return "jsx";
  }
  if (languagePatterns.typescript.test(trimmed)) {
    return "typescript";
  }
  if (languagePatterns.html.test(trimmed)) {
    return "html";
  }
  if (languagePatterns.scss.test(trimmed)) {
    return "scss";
  }
  if (languagePatterns.less.test(trimmed)) {
    return "less";
  }
  if (languagePatterns.css.test(trimmed)) {
    return "css";
  }
  if (languagePatterns.json.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // Not valid JSON, continue detection
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
  if (languagePatterns.javascript.test(trimmed)) {
    return "javascript";
  }
  
  // Default to JavaScript if no pattern matches
  return "javascript";
}

export async function formatCode(code: string, language?: SupportedLanguage): Promise<{ formatted: string; detectedLanguage: string }> {
  try {
    const detectedLanguage = language || detectLanguage(code);
    
    // Map language to Prettier parser (matching client-side capabilities)
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
      vue: "vue",
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
    });
    
    return {
      formatted: formatted.trim(),
      detectedLanguage,
    };
  } catch (error) {
    throw new Error(`Failed to format ${language || 'code'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
