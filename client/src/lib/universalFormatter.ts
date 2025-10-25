// Universal code formatter supporting 20+ programming languages using Prettier
import prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import parserEstree from "prettier/plugins/estree";
import parserHtml from "prettier/plugins/html";
import parserCss from "prettier/plugins/postcss";
import parserMarkdown from "prettier/plugins/markdown";
import parserTypescript from "prettier/plugins/typescript";
import parserGraphql from "prettier/plugins/graphql";
import parserYaml from "prettier/plugins/yaml";

// Language detection patterns
const languagePatterns = {
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

export type SupportedLanguage = 
  | "javascript" | "typescript" | "jsx" | "tsx"
  | "html" | "css" | "scss" | "less"
  | "json" | "yaml" 
  | "markdown" | "graphql"
  | "vue";

// Detect language from code content
export function detectLanguage(code: string): SupportedLanguage {
  const trimmed = code.trim();
  
  // Check for specific patterns in order of specificity
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

// Get parser for language
function getParser(language: SupportedLanguage): string {
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
  
  return parserMap[language];
}

// Get plugins for language
function getPlugins(language: SupportedLanguage) {
  const pluginMap: Record<SupportedLanguage, any[]> = {
    javascript: [parserBabel, parserEstree],
    typescript: [parserTypescript, parserEstree],
    jsx: [parserBabel, parserEstree],
    tsx: [parserTypescript, parserEstree],
    html: [parserHtml],
    css: [parserCss],
    scss: [parserCss],
    less: [parserCss],
    json: [parserBabel, parserEstree],
    yaml: [parserYaml],
    markdown: [parserMarkdown],
    graphql: [parserGraphql],
    vue: [parserHtml, parserBabel, parserEstree],
  };
  
  return pluginMap[language];
}

// Format code with Prettier
export async function formatCode(code: string, language?: SupportedLanguage): Promise<string> {
  try {
    const detectedLanguage = language || detectLanguage(code);
    const parser = getParser(detectedLanguage);
    const plugins = getPlugins(detectedLanguage);
    
    const formatted = await prettier.format(code, {
      parser,
      plugins,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
      bracketSpacing: true,
      arrowParens: "always",
    });
    
    return formatted.trim();
  } catch (error) {
    throw new Error(`Failed to format ${language || 'code'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// All supported languages in the web app (browser-compatible only)
// Note: Angular is included as TypeScript (decorators @Component etc. are TS)
export const supportedLanguages = [
  { id: "javascript", label: "JavaScript", category: "Web" },
  { id: "typescript", label: "TypeScript/Angular", category: "Web" },
  { id: "jsx", label: "React JSX", category: "Web" },
  { id: "tsx", label: "React TSX", category: "Web" },
  { id: "html", label: "HTML", category: "Web" },
  { id: "css", label: "CSS", category: "Web" },
  { id: "scss", label: "SCSS", category: "Web" },
  { id: "less", label: "Less", category: "Web" },
  { id: "vue", label: "Vue", category: "Web" },
  { id: "json", label: "JSON", category: "Data" },
  { id: "yaml", label: "YAML", category: "Data" },
  { id: "graphql", label: "GraphQL", category: "Data" },
  { id: "markdown", label: "Markdown", category: "Document" },
] as const;

// Total count of supported languages (13)
export const languageCount = supportedLanguages.length;
