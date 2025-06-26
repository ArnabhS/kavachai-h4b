import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyModel } from '@/lib/models';
import { connectDB } from '@/lib/mongodb';
import { Scan } from '@/lib/models';
import { v4 as uuidv4 } from 'uuid';
import { detectProjectType } from '@/lib/detectProjectType';
import { generateExtensionFix, detectVulnerabilitiesForExtension } from '@/lib/extensionAiClient';

interface ScanIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  line?: number;
  code?: string;
  originalCode?: string;
  fixedCode?: string;
  suggestion?: string;
  confidence?: number;
  aiDetected?: boolean;
}

interface ScanResult {
  file: string;
  issues: ScanIssue[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface ExtensionVulnerability {
  file: string;
  line: number;
  severity: 'high' | 'medium' | 'low';
  type: string;
  description: string;
  suggestion: string;
  originalCode: string;
  fixedCode: string;
}

interface ExtensionResponse {
  vulnerabilities: ExtensionVulnerability[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

// Enhanced vulnerability patterns with more comprehensive detection
const JS_VULNERABILITIES = [
  {
    pattern: /eval\s*\(/g,
    type: 'eval-usage',
    severity: 'critical' as const,
    message: 'Use of eval() is dangerous and can lead to code injection',
    suggestion: 'Replace eval() with safer alternatives like JSON.parse() or Function constructor with proper validation',
    fix: (code: string) => code.replace(/eval\s*\(/g, '// FIXED: Replace eval() with safer alternative')
  },
  {
    pattern: /innerHTML\s*=/g,
    type: 'innerhtml-usage',
    severity: 'high' as const,
    message: 'innerHTML can lead to XSS attacks, use textContent instead',
    suggestion: 'Use textContent or createElement for safe DOM manipulation',
    fix: (code: string) => code.replace(/innerHTML\s*=/g, 'textContent =')
  },
  {
    pattern: /document\.write\s*\(/g,
    type: 'document-write',
    severity: 'high' as const,
    message: 'document.write() can lead to XSS attacks',
    suggestion: 'Use DOM manipulation methods like appendChild or innerHTML with proper sanitization',
    fix: (code: string) => code.replace(/document\.write\s*\(/g, '// FIXED: Use DOM manipulation instead of document.write()')
  },
  {
    pattern: /localStorage\.setItem\s*\([^,]+,\s*[^)]*password[^)]*\)/gi,
    type: 'password-storage',
    severity: 'critical' as const,
    message: 'Storing passwords in localStorage is insecure',
    suggestion: 'Never store passwords in localStorage. Use secure authentication methods.',
    fix: (code: string) => code.replace(/localStorage\.setItem\s*\([^,]+,\s*[^)]*password[^)]*\)/gi, '// FIXED: Remove password storage from localStorage')
  },
  {
    pattern: /console\.log\s*\([^)]*password[^)]*\)/gi,
    type: 'password-logging',
    severity: 'high' as const,
    message: 'Logging passwords is a security risk',
    suggestion: 'Remove password logging or use secure logging methods',
    fix: (code: string) => code.replace(/console\.log\s*\([^)]*password[^)]*\)/gi, '// FIXED: Remove password logging')
  },
  {
    pattern: /process\.env\.\w+/g,
    type: 'env-exposure',
    severity: 'medium' as const,
    message: 'Environment variables should not be exposed in client-side code',
    suggestion: 'Move environment variables to server-side or use build-time configuration',
    fix: (code: string) => code.replace(/process\.env\.\w+/g, '// FIXED: Remove client-side env variable exposure')
  },
  {
    pattern: /<script\s+src\s*=\s*["'][^"']*["']/gi,
    type: 'external-script',
    severity: 'medium' as const,
    message: 'Loading external scripts can be a security risk',
    suggestion: 'Use Content Security Policy (CSP) and validate external script sources',
    fix: (code: string) => code.replace(/<script\s+src\s*=\s*["'][^"']*["']/gi, '// FIXED: Add CSP and validate external script sources')
  },
  // Enhanced patterns for better detection
  {
    pattern: /new\s+Function\s*\(/g,
    type: 'function-constructor',
    severity: 'high' as const,
    message: 'Function constructor can lead to code injection',
    suggestion: 'Avoid Function constructor, use safer alternatives',
    fix: (code: string) => code.replace(/new\s+Function\s*\(/g, '// FIXED: Replace Function constructor with safer alternative')
  },
  {
    pattern: /setTimeout\s*\([^,]+,\s*[^)]*\)/g,
    type: 'settimeout-injection',
    severity: 'medium' as const,
    message: 'setTimeout with string can lead to code injection',
    suggestion: 'Use function references instead of strings in setTimeout',
    fix: (code: string) => code.replace(/setTimeout\s*\(['"`][^'"`]*['"`]/g, '// FIXED: Use function reference instead of string')
  },
  {
    pattern: /setInterval\s*\([^,]+,\s*[^)]*\)/g,
    type: 'setinterval-injection',
    severity: 'medium' as const,
    message: 'setInterval with string can lead to code injection',
    suggestion: 'Use function references instead of strings in setInterval',
    fix: (code: string) => code.replace(/setInterval\s*\(['"`][^'"`]*['"`]/g, '// FIXED: Use function reference instead of string')
  }
];

// Enhanced HTML security patterns
const HTML_VULNERABILITIES = [
  {
    pattern: /<script[^>]*>/gi,
    type: 'inline-script',
    severity: 'high' as const,
    message: 'Inline scripts can be a security risk, use external scripts with CSP'
  },
  {
    pattern: /on\w+\s*=\s*["'][^"']*["']/gi,
    type: 'inline-event',
    severity: 'medium' as const,
    message: 'Inline event handlers can lead to XSS attacks'
  },
  {
    pattern: /<iframe[^>]*>/gi,
    type: 'iframe-usage',
    severity: 'medium' as const,
    message: 'Iframes can be a security risk, ensure proper sandboxing'
  },
  {
    pattern: /<form[^>]*>/gi,
    type: 'form-security',
    severity: 'low' as const,
    message: 'Ensure forms have proper CSRF protection and validation'
  },
  // Enhanced HTML patterns
  {
    pattern: /<object[^>]*>/gi,
    type: 'object-tag',
    severity: 'high' as const,
    message: 'Object tags can execute arbitrary code, use with caution'
  },
  {
    pattern: /<embed[^>]*>/gi,
    type: 'embed-tag',
    severity: 'high' as const,
    message: 'Embed tags can execute arbitrary code, use with caution'
  },
  {
    pattern: /javascript:/gi,
    type: 'javascript-protocol',
    severity: 'critical' as const,
    message: 'javascript: protocol can execute arbitrary code'
  },
  {
    pattern: /data:text\/html/gi,
    type: 'data-uri-html',
    severity: 'high' as const,
    message: 'data: URIs with HTML can lead to XSS attacks'
  }
];

// Enhanced Solidity smart contract vulnerabilities
const SOLIDITY_VULNERABILITIES = [
  {
    pattern: /reentrancy/gi,
    type: 'reentrancy-risk',
    severity: 'critical' as const,
    message: 'Potential reentrancy vulnerability - use ReentrancyGuard'
  },
  {
    pattern: /\.call\s*\(/g,
    type: 'low-level-call',
    severity: 'high' as const,
    message: 'Low-level calls can be dangerous, prefer higher-level functions'
  },
  {
    pattern: /\.delegatecall\s*\(/g,
    type: 'delegatecall-usage',
    severity: 'critical' as const,
    message: 'delegatecall can be dangerous and lead to security issues'
  },
  {
    pattern: /block\.timestamp/gi,
    type: 'timestamp-dependency',
    severity: 'medium' as const,
    message: 'block.timestamp can be manipulated by miners'
  },
  {
    pattern: /block\.number/gi,
    type: 'blocknumber-dependency',
    severity: 'medium' as const,
    message: 'block.number can be manipulated by miners'
  },
  {
    pattern: /require\s*\([^)]*\)/g,
    type: 'require-statement',
    severity: 'low' as const,
    message: 'Ensure require statements have meaningful error messages'
  },
  {
    pattern: /public\s+function/g,
    type: 'public-function',
    severity: 'low' as const,
    message: 'Review public functions for access control'
  },
  // Enhanced Solidity patterns
  {
    pattern: /\.send\s*\(/g,
    type: 'send-usage',
    severity: 'high' as const,
    message: '.send() can fail silently, use .call() or .transfer()'
  },
  {
    pattern: /\.transfer\s*\(/g,
    type: 'transfer-usage',
    severity: 'medium' as const,
    message: '.transfer() has gas limitations, consider using .call()'
  },
  {
    pattern: /selfdestruct\s*\(/g,
    type: 'selfdestruct-usage',
    severity: 'critical' as const,
    message: 'selfdestruct can permanently delete contract and funds'
  },
  {
    pattern: /suicide\s*\(/g,
    type: 'suicide-usage',
    severity: 'critical' as const,
    message: 'suicide is deprecated, use selfdestruct instead'
  }
];

// Enhanced Python vulnerability patterns
const PYTHON_VULNERABILITIES = [
  {
    pattern: /eval\s*\(/g,
    type: 'eval-usage',
    severity: 'critical' as const,
    message: 'Use of eval() is dangerous and can lead to code injection'
  },
  {
    pattern: /exec\s*\(/g,
    type: 'exec-usage',
    severity: 'critical' as const,
    message: 'Use of exec() is dangerous and can lead to code injection'
  },
  {
    pattern: /os\.system\s*\(/g,
    type: 'os-system',
    severity: 'critical' as const,
    message: 'os.system() can execute arbitrary commands'
  },
  {
    pattern: /subprocess\.call\s*\(/g,
    type: 'subprocess-call',
    severity: 'high' as const,
    message: 'subprocess.call() can execute arbitrary commands'
  },
  {
    pattern: /pickle\.loads\s*\(/g,
    type: 'pickle-loads',
    severity: 'critical' as const,
    message: 'pickle.loads() can execute arbitrary code'
  },
  {
    pattern: /yaml\.load\s*\(/g,
    type: 'yaml-load',
    severity: 'high' as const,
    message: 'yaml.load() can execute arbitrary code, use yaml.safe_load()'
  },
  // Enhanced Python patterns
  {
    pattern: /input\s*\(/g,
    type: 'input-usage',
    severity: 'medium' as const,
    message: 'input() can be dangerous in Python 2, use raw_input() or validate input'
  },
  {
    pattern: /__import__\s*\(/g,
    type: 'import-dynamic',
    severity: 'high' as const,
    message: 'Dynamic imports can be dangerous, validate module names'
  },
  {
    pattern: /compile\s*\(/g,
    type: 'compile-usage',
    severity: 'medium' as const,
    message: 'compile() can be dangerous with untrusted input'
  }
];

// Enhanced Java vulnerability patterns
const JAVA_VULNERABILITIES = [
  {
    pattern: /Runtime\.getRuntime\(\)\.exec\s*\(/g,
    type: 'runtime-exec',
    severity: 'critical' as const,
    message: 'Runtime.exec() can execute arbitrary commands'
  },
  {
    pattern: /ProcessBuilder\s*\(/g,
    type: 'process-builder',
    severity: 'high' as const,
    message: 'ProcessBuilder can execute arbitrary commands'
  },
  {
    pattern: /Class\.forName\s*\(/g,
    type: 'class-forname',
    severity: 'medium' as const,
    message: 'Class.forName() can load arbitrary classes'
  },
  {
    pattern: /ObjectInputStream\s*\(/g,
    type: 'object-input-stream',
    severity: 'high' as const,
    message: 'ObjectInputStream can deserialize malicious objects'
  },
  // Enhanced Java patterns
  {
    pattern: /JdbcTemplate\.queryForObject\s*\(/g,
    type: 'jdbc-query',
    severity: 'medium' as const,
    message: 'Ensure SQL queries are parameterized to prevent injection'
  },
  {
    pattern: /Statement\s+stmt\s*=/g,
    type: 'statement-usage',
    severity: 'high' as const,
    message: 'Use PreparedStatement instead of Statement to prevent SQL injection'
  }
];

// Enhanced PHP vulnerability patterns
const PHP_VULNERABILITIES = [
  {
    pattern: /eval\s*\(/g,
    type: 'eval-usage',
    severity: 'critical' as const,
    message: 'Use of eval() is dangerous and can lead to code injection'
  },
  {
    pattern: /exec\s*\(/g,
    type: 'exec-usage',
    severity: 'critical' as const,
    message: 'exec() can execute arbitrary commands'
  },
  {
    pattern: /system\s*\(/g,
    type: 'system-usage',
    severity: 'critical' as const,
    message: 'system() can execute arbitrary commands'
  },
  {
    pattern: /shell_exec\s*\(/g,
    type: 'shell-exec',
    severity: 'critical' as const,
    message: 'shell_exec() can execute arbitrary commands'
  },
  {
    pattern: /passthru\s*\(/g,
    type: 'passthru-usage',
    severity: 'critical' as const,
    message: 'passthru() can execute arbitrary commands'
  },
  // Enhanced PHP patterns
  {
    pattern: /include\s*\(\s*\$/g,
    type: 'include-variable',
    severity: 'high' as const,
    message: 'Variable includes can lead to arbitrary file inclusion'
  },
  {
    pattern: /require\s*\(\s*\$/g,
    type: 'require-variable',
    severity: 'high' as const,
    message: 'Variable requires can lead to arbitrary file inclusion'
  },
  {
    pattern: /mysql_query\s*\(/g,
    type: 'mysql-query',
    severity: 'high' as const,
    message: 'mysql_query() is deprecated and vulnerable to SQL injection'
  }
];

// Enhanced Ruby vulnerability patterns
const RUBY_VULNERABILITIES = [
  {
    pattern: /eval\s*\(/g,
    type: 'eval-usage',
    severity: 'critical' as const,
    message: 'Use of eval() is dangerous and can lead to code injection'
  },
  {
    pattern: /system\s*\(/g,
    type: 'system-usage',
    severity: 'critical' as const,
    message: 'system() can execute arbitrary commands'
  },
  {
    pattern: /`[^`]*`/g,
    type: 'backtick-exec',
    severity: 'critical' as const,
    message: 'Backtick execution can run arbitrary commands'
  },
  {
    pattern: /Kernel\.exec\s*\(/g,
    type: 'kernel-exec',
    severity: 'critical' as const,
    message: 'Kernel.exec() can execute arbitrary commands'
  },
  // Enhanced Ruby patterns
  {
    pattern: /YAML\.load\s*\(/g,
    type: 'yaml-load',
    severity: 'high' as const,
    message: 'YAML.load() can execute arbitrary code, use YAML.safe_load()'
  },
  {
    pattern: /Marshal\.load\s*\(/g,
    type: 'marshal-load',
    severity: 'high' as const,
    message: 'Marshal.load() can deserialize malicious objects'
  }
];

// Enhanced Go vulnerability patterns
const GO_VULNERABILITIES = [
  {
    pattern: /exec\.Command\s*\(/g,
    type: 'exec-command',
    severity: 'high' as const,
    message: 'exec.Command() can execute arbitrary commands'
  },
  {
    pattern: /os\./g,
    type: 'os-usage',
    severity: 'medium' as const,
    message: 'Review os package usage for security implications'
  },
  // Enhanced Go patterns
  {
    pattern: /template\.ParseFiles\s*\(/g,
    type: 'template-parse',
    severity: 'medium' as const,
    message: 'Ensure template files are validated to prevent path traversal'
  },
  {
    pattern: /http\.Get\s*\(/g,
    type: 'http-get',
    severity: 'low' as const,
    message: 'Ensure HTTP requests are made to trusted sources'
  }
];

// Enhanced Rust vulnerability patterns
const RUST_VULNERABILITIES = [
  {
    pattern: /unsafe\s*{/g,
    type: 'unsafe-block',
    severity: 'medium' as const,
    message: 'Unsafe blocks can lead to undefined behavior'
  },
  {
    pattern: /std::process::Command::new\s*\(/g,
    type: 'process-command',
    severity: 'high' as const,
    message: 'Command::new() can execute arbitrary commands'
  },
  // Enhanced Rust patterns
  {
    pattern: /std::fs::read_to_string\s*\(/g,
    type: 'fs-read',
    severity: 'low' as const,
    message: 'Ensure file paths are validated to prevent path traversal'
  }
];

// Enhanced C++ vulnerability patterns
const CPP_VULNERABILITIES = [
  {
    pattern: /system\s*\(/g,
    type: 'system-call',
    severity: 'critical' as const,
    message: 'system() can execute arbitrary commands'
  },
  {
    pattern: /popen\s*\(/g,
    type: 'popen-usage',
    severity: 'high' as const,
    message: 'popen() can execute arbitrary commands'
  },
  {
    pattern: /strcpy\s*\(/g,
    type: 'strcpy-usage',
    severity: 'high' as const,
    message: 'strcpy() is vulnerable to buffer overflows, use strncpy()'
  },
  {
    pattern: /strcat\s*\(/g,
    type: 'strcat-usage',
    severity: 'high' as const,
    message: 'strcat() is vulnerable to buffer overflows, use strncat()'
  },
  // Enhanced C++ patterns
  {
    pattern: /gets\s*\(/g,
    type: 'gets-usage',
    severity: 'critical' as const,
    message: 'gets() is vulnerable to buffer overflows, use fgets()'
  },
  {
    pattern: /scanf\s*\(/g,
    type: 'scanf-usage',
    severity: 'medium' as const,
    message: 'scanf() can be vulnerable, use safer alternatives'
  }
];

// Enhanced C# vulnerability patterns
const CSHARP_VULNERABILITIES = [
  {
    pattern: /Process\.Start\s*\(/g,
    type: 'process-start',
    severity: 'high' as const,
    message: 'Process.Start() can execute arbitrary commands'
  },
  {
    pattern: /SqlCommand\s*\(/g,
    type: 'sql-command',
    severity: 'medium' as const,
    message: 'Ensure SQL commands use parameterized queries'
  },
  {
    pattern: /File\.ReadAllText\s*\(/g,
    type: 'file-read',
    severity: 'low' as const,
    message: 'Ensure file paths are validated to prevent path traversal'
  },
  // Enhanced C# patterns
  {
    pattern: /Assembly\.Load\s*\(/g,
    type: 'assembly-load',
    severity: 'medium' as const,
    message: 'Assembly.Load() can load arbitrary assemblies'
  },
  {
    pattern: /Type\.GetType\s*\(/g,
    type: 'type-gettype',
    severity: 'medium' as const,
    message: 'Type.GetType() can load arbitrary types'
  }
];

const PROJECT_TYPE = detectProjectType();

// New function to generate AI-based fixes and validate findings
async function generateAIFix(code: string, fileType: string, issueType: string, issueMessage: string): Promise<{ fixedCode?: string, suggestion?: string }> {
  try {
    // Use the specialized extension AI function for better code fixes
    const result = await generateExtensionFix(code, fileType, issueType, issueMessage);
    
    // Only return if we got a valid fix
    if (result.fixedCode && result.fixedCode !== code) {
      return {
        fixedCode: result.fixedCode,
        suggestion: result.suggestion,
      };
    }
    
    // If no meaningful fix was generated, return nothing to filter it out
    return {};
  } catch (error) {
    console.error('AI fix generation failed:', error);
    return {};
  }
}

// AI-powered vulnerability detection function
async function detectVulnerabilitiesWithAI(content: string, fileType: string): Promise<ScanIssue[]> {
  try {
    // Use the specialized extension AI for better vulnerability detection and fixes
    const aiIssues = await detectVulnerabilitiesForExtension(content, fileType);
    return aiIssues;
  } catch (error) {
    console.error('AI vulnerability detection failed:', error);
    return [];
  }
}

// Enhanced scanning functions with AI integration
async function scanJavaScript(content: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');

  // Traditional regex-based scanning with AI validation
  for (const vuln of JS_VULNERABILITIES) {
    let match;
    const regex = new RegExp(vuln.pattern); // Create new RegExp object for each iteration
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim() || '';
      
      // Use AI to validate and generate a fix
      const aiFix = await generateAIFix(lineContent, 'JavaScript', vuln.type, vuln.message);

      if (aiFix.fixedCode) { 
        issues.push({
          type: vuln.type,
          severity: vuln.severity,
          message: vuln.message,
          line: lineNumber,
          code: lineContent,
          originalCode: lineContent,
          fixedCode: aiFix.fixedCode,
          suggestion: aiFix.suggestion || vuln.message,
          confidence: 95, // Higher confidence as it's AI validated
          aiDetected: true // Mark as AI-assisted
        });
      }
    }
  }

  // AI-powered scanning for complex vulnerabilities
  const aiIssues = await detectVulnerabilitiesWithAI(content, 'JavaScript');
  issues.push(...aiIssues);

  return issues;
}

async function scanHTML(content: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');

  // Traditional regex-based scanning with AI validation
  for (const vuln of HTML_VULNERABILITIES) {
    let match;
    const regex = new RegExp(vuln.pattern);
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim() || '';

      // For HTML, regex is less reliable for fixes, so we use AI
      const aiFix = await generateAIFix(lineContent, 'HTML', vuln.type, vuln.message);
      if (aiFix.fixedCode) { 
        issues.push({
          type: vuln.type,
          severity: vuln.severity,
          message: vuln.message,
          line: lineNumber,
          code: lineContent,
          originalCode: lineContent,
          fixedCode: aiFix.fixedCode,
          suggestion: aiFix.suggestion || vuln.message,
          confidence: 95,
          aiDetected: true 
        });
      }
    }
  }

  // AI-powered scanning for complex vulnerabilities
  const aiIssues = await detectVulnerabilitiesWithAI(content, 'HTML');
  issues.push(...aiIssues);

  return issues;
}

async function scanSolidity(content: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');

  // Traditional regex-based scanning with AI validation
  for (const vuln of SOLIDITY_VULNERABILITIES) {
    let match;
    const regex = new RegExp(vuln.pattern);
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim() || '';
      
      const aiFix = await generateAIFix(lineContent, 'Solidity', vuln.type, vuln.message);
      if (aiFix.fixedCode) {
        issues.push({
          type: vuln.type,
          severity: vuln.severity,
          message: vuln.message,
          line: lineNumber,
          code: lineContent,
          originalCode: lineContent,
          fixedCode: aiFix.fixedCode,
          suggestion: aiFix.suggestion || vuln.message,
          confidence: 95,
          aiDetected: true
        });
      }
    }
  }

  // AI-powered scanning for complex vulnerabilities
  const aiIssues = await detectVulnerabilitiesWithAI(content, 'Solidity');
  issues.push(...aiIssues);

  return issues;
}

async function scanPython(content: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');

  // Traditional regex-based scanning with AI validation
  for (const vuln of PYTHON_VULNERABILITIES) {
    let match;
    const regex = new RegExp(vuln.pattern);
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim() || '';

      const aiFix = await generateAIFix(lineContent, 'Python', vuln.type, vuln.message);
      if (aiFix.fixedCode) {
        issues.push({
          type: vuln.type,
          severity: vuln.severity,
          message: vuln.message,
          line: lineNumber,
          code: lineContent,
          originalCode: lineContent,
          fixedCode: aiFix.fixedCode,
          suggestion: aiFix.suggestion || vuln.message,
          confidence: 95,
          aiDetected: true
        });
      }
    }
  }

  // AI-powered scanning for complex vulnerabilities
  const aiIssues = await detectVulnerabilitiesWithAI(content, 'Python');
  issues.push(...aiIssues);

  return issues;
}

async function scanJava(content: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');

  // Traditional regex-based scanning with AI validation
  for (const vuln of JAVA_VULNERABILITIES) {
    let match;
    const regex = new RegExp(vuln.pattern);
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim() || '';
      
      const aiFix = await generateAIFix(lineContent, 'Java', vuln.type, vuln.message);
      if (aiFix.fixedCode) {
        issues.push({
          type: vuln.type,
          severity: vuln.severity,
          message: vuln.message,
          line: lineNumber,
          code: lineContent,
          originalCode: lineContent,
          fixedCode: aiFix.fixedCode,
          suggestion: aiFix.suggestion || vuln.message,
          confidence: 95,
          aiDetected: true
        });
      }
    }
  }

  // AI-powered scanning for complex vulnerabilities
  const aiIssues = await detectVulnerabilitiesWithAI(content, 'Java');
  issues.push(...aiIssues);

  return issues;
}

async function scanPHP(content: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');

  // Traditional regex-based scanning with AI validation
  for (const vuln of PHP_VULNERABILITIES) {
    let match;
    const regex = new RegExp(vuln.pattern);
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim() || '';
      
      const aiFix = await generateAIFix(lineContent, 'PHP', vuln.type, vuln.message);
      if (aiFix.fixedCode) {
        issues.push({
          type: vuln.type,
          severity: vuln.severity,
          message: vuln.message,
          line: lineNumber,
          code: lineContent,
          originalCode: lineContent,
          fixedCode: aiFix.fixedCode,
          suggestion: aiFix.suggestion || vuln.message,
          confidence: 95,
          aiDetected: true
        });
      }
    }
  }

  // AI-powered scanning for complex vulnerabilities
  const aiIssues = await detectVulnerabilitiesWithAI(content, 'PHP');
  issues.push(...aiIssues);

  return issues;
}

async function scanRuby(content: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');

  // Traditional regex-based scanning with AI validation
  for (const vuln of RUBY_VULNERABILITIES) {
    let match;
    const regex = new RegExp(vuln.pattern);
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim() || '';
      
      const aiFix = await generateAIFix(lineContent, 'Ruby', vuln.type, vuln.message);
      if (aiFix.fixedCode) {
        issues.push({
          type: vuln.type,
          severity: vuln.severity,
          message: vuln.message,
          line: lineNumber,
          code: lineContent,
          originalCode: lineContent,
          fixedCode: aiFix.fixedCode,
          suggestion: aiFix.suggestion || vuln.message,
          confidence: 95,
          aiDetected: true
        });
      }
    }
  }

  // AI-powered scanning for complex vulnerabilities
  const aiIssues = await detectVulnerabilitiesWithAI(content, 'Ruby');
  issues.push(...aiIssues);

  return issues;
}

async function scanGo(content: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');

  // Traditional regex-based scanning with AI validation
  for (const vuln of GO_VULNERABILITIES) {
    let match;
    const regex = new RegExp(vuln.pattern);
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim() || '';
      
      const aiFix = await generateAIFix(lineContent, 'Go', vuln.type, vuln.message);
      if (aiFix.fixedCode) {
        issues.push({
          type: vuln.type,
          severity: vuln.severity,
          message: vuln.message,
          line: lineNumber,
          code: lineContent,
          originalCode: lineContent,
          fixedCode: aiFix.fixedCode,
          suggestion: aiFix.suggestion || vuln.message,
          confidence: 95,
          aiDetected: true
        });
      }
    }
  }

  // AI-powered scanning for complex vulnerabilities
  const aiIssues = await detectVulnerabilitiesWithAI(content, 'Go');
  issues.push(...aiIssues);

  return issues;
}

async function scanRust(content: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');

  // Traditional regex-based scanning with AI validation
  for (const vuln of RUST_VULNERABILITIES) {
    let match;
    const regex = new RegExp(vuln.pattern);
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim() || '';
      
      const aiFix = await generateAIFix(lineContent, 'Rust', vuln.type, vuln.message);
      if (aiFix.fixedCode) {
        issues.push({
          type: vuln.type,
          severity: vuln.severity,
          message: vuln.message,
          line: lineNumber,
          code: lineContent,
          originalCode: lineContent,
          fixedCode: aiFix.fixedCode,
          suggestion: aiFix.suggestion || vuln.message,
          confidence: 95,
          aiDetected: true
        });
      }
    }
  }

  // AI-powered scanning for complex vulnerabilities
  const aiIssues = await detectVulnerabilitiesWithAI(content, 'Rust');
  issues.push(...aiIssues);

  return issues;
}

async function scanCpp(content: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');

  // Traditional regex-based scanning with AI validation
  for (const vuln of CPP_VULNERABILITIES) {
    let match;
    const regex = new RegExp(vuln.pattern);
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim() || '';
      
      const aiFix = await generateAIFix(lineContent, 'C++', vuln.type, vuln.message);
      if (aiFix.fixedCode) {
        issues.push({
          type: vuln.type,
          severity: vuln.severity,
          message: vuln.message,
          line: lineNumber,
          code: lineContent,
          originalCode: lineContent,
          fixedCode: aiFix.fixedCode,
          suggestion: aiFix.suggestion || vuln.message,
          confidence: 95,
          aiDetected: true
        });
      }
    }
  }

  // AI-powered scanning for complex vulnerabilities
  const aiIssues = await detectVulnerabilitiesWithAI(content, 'C++');
  issues.push(...aiIssues);

  return issues;
}

async function scanCSharp(content: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');

  // Traditional regex-based scanning with AI validation
  for (const vuln of CSHARP_VULNERABILITIES) {
    let match;
    const regex = new RegExp(vuln.pattern);
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim() || '';
      
      const aiFix = await generateAIFix(lineContent, 'C#', vuln.type, vuln.message);
      if (aiFix.fixedCode) {
        issues.push({
          type: vuln.type,
          severity: vuln.severity,
          message: vuln.message,
          line: lineNumber,
          code: lineContent,
          originalCode: lineContent,
          fixedCode: aiFix.fixedCode,
          suggestion: aiFix.suggestion || vuln.message,
          confidence: 95,
          aiDetected: true
        });
      }
    }
  }

  // AI-powered scanning for complex vulnerabilities
  const aiIssues = await detectVulnerabilitiesWithAI(content, 'C#');
  issues.push(...aiIssues);

  return issues;
}

async function scanFile(file: { file: string; content: string; environment?: string }): Promise<ScanResult> {
  const { file: filename, content, environment } = file;
  let issues: ScanIssue[] = [];

  let env = environment;
  if ((filename.endsWith('.js') || filename.endsWith('.ts')) && !env) {
    if (PROJECT_TYPE === 'next') {
      // Next.js: could be both, but default to 'server' unless in /pages or /app/client
      env = 'server';
    } else if (PROJECT_TYPE === 'react') {
      env = 'client';
    } else if (PROJECT_TYPE === 'node') {
      env = 'server';
    } else {
      env = 'server';
    }
  }

  // Use environment to scope rules and AI detection
  if (filename.endsWith('.js') || filename.endsWith('.ts')) {
    // Always treat as server-side for Node.js projects
    const jsIssues = await scanJavaScript(content);
    issues = jsIssues.filter(issue => 
      // Only include env-exposure for client-side
      !(issue.type === 'env-exposure')
    );
  } else if (filename.endsWith('.html')) {
    if (env === 'client' || env === 'unknown') {
      issues = await scanHTML(content);
    } // else skip HTML rules for server
  } else if (filename.endsWith('.sol')) {
    issues = await scanSolidity(content);
  } else if (filename.endsWith('.py')) {
    issues = await scanPython(content);
  } else if (filename.endsWith('.java')) {
    issues = await scanJava(content);
  } else if (filename.endsWith('.php')) {
    issues = await scanPHP(content);
  } else if (filename.endsWith('.rb')) {
    issues = await scanRuby(content);
  } else if (filename.endsWith('.go')) {
    issues = await scanGo(content);
  } else if (filename.endsWith('.rs')) {
    issues = await scanRust(content);
  } else if (filename.endsWith('.cpp')) {
    issues = await scanCpp(content);
  } else if (filename.endsWith('.cs')) {
    issues = await scanCSharp(content);
  } else {
    // Generic file scan with AI
    issues = await scanJavaScript(content);
  }

  const summary = {
    total: issues.length,
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length
  };

  return { file: filename, issues, summary };
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ message: 'Invalid content type.' }, { status: 400 });
  }
  
  const body = await req.json();
  if (!Array.isArray(body.files)) {
    return NextResponse.json({ message: 'Missing files array.' }, { status: 400 });
  }

  // Get API key from Authorization header
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Missing or invalid Authorization header.' }, { status: 401 });
  }

  const apiKey = authHeader.replace('Bearer ', '');
  
  // Find user from API key
  await connectDB();
  const apiKeyDoc = await ApiKeyModel.findOne({ apiKey });
  if (!apiKeyDoc) {
    return NextResponse.json({ message: 'Invalid API key.' }, { status: 401 });
  }

  const userId = apiKeyDoc.userId;

  // Create scan record
  const scanId = uuidv4();
  const scan = new Scan({
    id: scanId,
    type: 'smart-contracts', // VS Code extension scans are typically for smart contracts
    status: 'active',
    startedAt: new Date(),
    userId: userId,
    metadata: { 
      logSource: 'vscode-extension',
      fileCount: body.files.length
    }
  });
  await scan.save();

  try {
    // Scan each file with enhanced AI detection
    const results = await Promise.all(body.files.map(scanFile));
    
    // Convert to extension format
    const vulnerabilities: ExtensionVulnerability[] = [];
    results.forEach((result: ScanResult) => {
      result.issues.forEach((issue: ScanIssue) => {
        if (issue.line && issue.originalCode && issue.fixedCode) {
          vulnerabilities.push({
            file: result.file,
            line: issue.line,
            severity: issue.severity === 'critical' ? 'high' : issue.severity as 'high' | 'medium' | 'low',
            type: issue.type,
            description: issue.message,
            suggestion: issue.suggestion || 'Review and fix this security issue',
            originalCode: issue.originalCode,
            fixedCode: issue.fixedCode
          });
        }
      });
    });
    
    // Overall summary for extension
    const extensionSummary = {
      total: vulnerabilities.length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length
    };

    const extensionResponse: ExtensionResponse = {
      vulnerabilities,
      summary: extensionSummary
    };

    // Also keep the original format for backward compatibility
    const overallSummary = results.reduce((acc: { total: number; critical: number; high: number; medium: number; low: number }, result: ScanResult) => ({
      total: acc.total + result.summary.total,
      critical: acc.critical + result.summary.critical,
      high: acc.high + result.summary.high,
      medium: acc.medium + result.summary.medium,
      low: acc.low + result.summary.low
    }), { total: 0, critical: 0, high: 0, medium: 0, low: 0 });

    const response = { 
      results,
      summary: overallSummary,
      scanTime: new Date().toISOString(),
      // Add extension format
      vulnerabilities: extensionResponse.vulnerabilities,
      extensionSummary: extensionResponse.summary
    };

    // Update scan record as completed
    await Scan.findOneAndUpdate(
      { id: scanId },
      { 
        status: 'completed',
        completedAt: new Date(),
        results: response
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    // Update scan record as failed
    await Scan.findOneAndUpdate(
      { id: scanId },
      { 
        status: 'failed',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );

    throw error;
  }
}

// New API endpoint specifically for VS Code extension
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { files } = body;

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Files array is required' }, { status: 400 });
    }

    // Scan each file with specialized extension AI
    const results = await Promise.all(files.map(async (file: any) => {
      const { file: fileName, content } = file;
      const fileType = getFileType(fileName);
      
      let issues: ScanIssue[] = [];
      
      // Use specialized AI scanning for extension
      try {
        const aiIssues = await detectVulnerabilitiesForExtension(content, fileType);
        issues = aiIssues;
      } catch (error) {
        console.error(`AI scanning failed for ${fileName}:`, error);
      }

      // Calculate summary
      const summary = {
        total: issues.length,
        critical: issues.filter(i => i.severity === 'critical').length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length
      };

      return {
        file: fileName,
        issues,
        summary
      };
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Extension scan failed:', error);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}

// Helper function to get file type
function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': return 'JavaScript';
    case 'ts': return 'TypeScript';
    case 'jsx': return 'React';
    case 'tsx': return 'React';
    case 'py': return 'Python';
    case 'java': return 'Java';
    case 'php': return 'PHP';
    case 'rb': return 'Ruby';
    case 'go': return 'Go';
    case 'rs': return 'Rust';
    case 'cpp': return 'C++';
    case 'c': return 'C';
    case 'cs': return 'C#';
    case 'sol': return 'Solidity';
    case 'html': return 'HTML';
    default: return 'Unknown';
  }
} 