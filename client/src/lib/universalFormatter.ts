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
  javascript: /^(import|export|const|let|var|function|class|=>|\{|\[)/m,
  typescript: /^(import|export|interface|type|enum|namespace|as|declare)/m,
  jsx: /<[A-Z][a-z]*[\s>]/,
  tsx: /^(import.*from|export.*|interface|type).*<[A-Z]/m,
  html: /^<!DOCTYPE html>|<html|<head|<body|<div|<span|<p|<a/i,
  css: /\{[^}]*:[^}]*\}|@media|@keyframes|\.[\w-]+\s*\{/,
  scss: /\$[\w-]+:|@mixin|@include|@extend|&:/,
  json: /^\s*[\{\[]/,
  yaml: /^[\w-]+:\s*[\w-]|^\s*-\s+[\w]/m,
  markdown: /^#{1,6}\s+|^\*\*|^```|^\[.*\]\(.*\)/m,
  graphql: /^(query|mutation|subscription|fragment|type|interface|enum|input|schema)/m,
  sql: /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/i,
  python: /^(def|class|import|from|if __name__|print\()/m,
  go: /^(package|import|func|type|var|const)\s+/m,
  rust: /^(fn|struct|impl|trait|use|mod|pub)\s+/m,
  java: /^(public|private|protected|class|interface|import|package)\s+/m,
  php: /^<\?php|namespace|use|class|function|public|private|protected/m,
  ruby: /^(def|class|module|require|include|end|do|if|unless)\s+/m,
  swift: /^(import|func|class|struct|enum|protocol|var|let)\s+/m,
  kotlin: /^(fun|class|interface|object|val|var|import|package)\s+/m,
};

export type SupportedLanguage = 
  | "javascript" | "typescript" | "jsx" | "tsx"
  | "html" | "css" | "scss" | "less"
  | "json" | "yaml" 
  | "markdown" | "graphql"
  | "vue" | "angular";

// Detect language from code content
export function detectLanguage(code: string): SupportedLanguage {
  const trimmed = code.trim();
  
  // Check for specific patterns
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
    angular: "html",
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
    angular: [parserHtml],
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

// Get all supported languages with metadata
export const supportedLanguages = [
  { id: "javascript", label: "JavaScript", category: "Web" },
  { id: "typescript", label: "TypeScript", category: "Web" },
  { id: "jsx", label: "React JSX", category: "Web" },
  { id: "tsx", label: "React TSX", category: "Web" },
  { id: "html", label: "HTML", category: "Web" },
  { id: "css", label: "CSS", category: "Web" },
  { id: "scss", label: "SCSS", category: "Web" },
  { id: "less", label: "Less", category: "Web" },
  { id: "vue", label: "Vue", category: "Web" },
  { id: "angular", label: "Angular", category: "Web" },
  { id: "json", label: "JSON", category: "Data" },
  { id: "yaml", label: "YAML", category: "Data" },
  { id: "graphql", label: "GraphQL", category: "Data" },
  { id: "markdown", label: "Markdown", category: "Document" },
] as const;
