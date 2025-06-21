import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyModel } from '@/lib/models';
import { connectDB } from '@/lib/mongodb';
import { Scan } from '@/lib/models';
import { v4 as uuidv4 } from 'uuid';
import { detectProjectType } from '@/lib/detectProjectType';

interface ScanIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  line?: number;
  code?: string;
  originalCode?: string;
  fixedCode?: string;
  suggestion?: string;
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

// JavaScript/TypeScript vulnerability patterns
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
  }
];

// HTML security patterns
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
  }
];

// Solidity smart contract vulnerabilities
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
  }
];

// Python vulnerability patterns
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
    pattern: /subprocess\.call\s*\(/g,
    type: 'subprocess-call',
    severity: 'high' as const,
    message: 'subprocess.call() can be dangerous, use subprocess.run() with proper arguments'
  },
  {
    pattern: /os\.system\s*\(/g,
    type: 'os-system',
    severity: 'critical' as const,
    message: 'os.system() can lead to command injection, use subprocess.run() instead'
  },
  {
    pattern: /pickle\.loads\s*\(/g,
    type: 'pickle-usage',
    severity: 'critical' as const,
    message: 'pickle.loads() can lead to arbitrary code execution'
  },
  {
    pattern: /input\s*\(/g,
    type: 'input-usage',
    severity: 'medium' as const,
    message: 'input() can be dangerous, validate and sanitize user input'
  },
  {
    pattern: /password\s*=\s*['"][^'"]*['"]/gi,
    type: 'hardcoded-password',
    severity: 'high' as const,
    message: 'Hardcoded passwords are a security risk'
  },
  {
    pattern: /sqlite3\.connect\s*\(/g,
    type: 'sqlite-connection',
    severity: 'medium' as const,
    message: 'Ensure SQLite connections are properly secured'
  }
];

// Java vulnerability patterns
const JAVA_VULNERABILITIES = [
  {
    pattern: /Runtime\.getRuntime\(\)\.exec\s*\(/g,
    type: 'runtime-exec',
    severity: 'critical' as const,
    message: 'Runtime.exec() can lead to command injection'
  },
  {
    pattern: /ProcessBuilder\s*\(/g,
    type: 'process-builder',
    severity: 'high' as const,
    message: 'ProcessBuilder can be dangerous, validate arguments'
  },
  {
    pattern: /Class\.forName\s*\(/g,
    type: 'class-forname',
    severity: 'medium' as const,
    message: 'Class.forName() can lead to arbitrary class loading'
  },
  {
    pattern: /System\.getProperty\s*\(/g,
    type: 'system-property',
    severity: 'low' as const,
    message: 'System.getProperty() can expose sensitive information'
  },
  {
    pattern: /password\s*=\s*['"][^'"]*['"]/gi,
    type: 'hardcoded-password',
    severity: 'high' as const,
    message: 'Hardcoded passwords are a security risk'
  },
  {
    pattern: /String\.format\s*\([^,]+,\s*[^)]*\)/g,
    type: 'string-format',
    severity: 'medium' as const,
    message: 'String.format() can be vulnerable to format string attacks'
  },
  {
    pattern: /ObjectInputStream\s*\(/g,
    type: 'object-input-stream',
    severity: 'high' as const,
    message: 'ObjectInputStream can lead to arbitrary object deserialization'
  }
];

// PHP vulnerability patterns
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
    message: 'exec() can lead to command injection'
  },
  {
    pattern: /system\s*\(/g,
    type: 'system-usage',
    severity: 'critical' as const,
    message: 'system() can lead to command injection'
  },
  {
    pattern: /shell_exec\s*\(/g,
    type: 'shell-exec',
    severity: 'critical' as const,
    message: 'shell_exec() can lead to command injection'
  },
  {
    pattern: /\$_GET\[/g,
    type: 'get-usage',
    severity: 'medium' as const,
    message: '$_GET data should be validated and sanitized'
  },
  {
    pattern: /\$_POST\[/g,
    type: 'post-usage',
    severity: 'medium' as const,
    message: '$_POST data should be validated and sanitized'
  },
  {
    pattern: /mysql_query\s*\(/g,
    type: 'mysql-query',
    severity: 'high' as const,
    message: 'mysql_query() is deprecated and vulnerable to SQL injection'
  }
];

// Ruby vulnerability patterns
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
    message: 'system() can lead to command injection'
  },
  {
    pattern: /`[^`]*`/g,
    type: 'backtick-exec',
    severity: 'critical' as const,
    message: 'Backtick execution can lead to command injection'
  },
  {
    pattern: /Kernel\.exec\s*\(/g,
    type: 'kernel-exec',
    severity: 'critical' as const,
    message: 'Kernel.exec() can lead to command injection'
  },
  {
    pattern: /password\s*=\s*['"][^'"]*['"]/gi,
    type: 'hardcoded-password',
    severity: 'high' as const,
    message: 'Hardcoded passwords are a security risk'
  }
];

// Go vulnerability patterns
const GO_VULNERABILITIES = [
  {
    pattern: /exec\.Command\s*\(/g,
    type: 'exec-command',
    severity: 'high' as const,
    message: 'exec.Command() can be dangerous, validate arguments'
  },
  {
    pattern: /os\./g,
    type: 'os-usage',
    severity: 'medium' as const,
    message: 'OS operations should be validated'
  },
  {
    pattern: /fmt\.Sprintf\s*\([^,]+,\s*[^)]*\)/g,
    type: 'fmt-sprintf',
    severity: 'medium' as const,
    message: 'fmt.Sprintf() can be vulnerable to format string attacks'
  },
  {
    pattern: /password\s*:=\s*['"][^'"]*['"]/gi,
    type: 'hardcoded-password',
    severity: 'high' as const,
    message: 'Hardcoded passwords are a security risk'
  }
];

// Rust vulnerability patterns
const RUST_VULNERABILITIES = [
  {
    pattern: /unsafe\s*{/g,
    type: 'unsafe-block',
    severity: 'high' as const,
    message: 'Unsafe blocks can lead to undefined behavior'
  },
  {
    pattern: /std::process::Command::new\s*\(/g,
    type: 'process-command',
    severity: 'high' as const,
    message: 'Process::Command can be dangerous, validate arguments'
  },
  {
    pattern: /unwrap\(\)/g,
    type: 'unwrap-usage',
    severity: 'medium' as const,
    message: 'unwrap() can cause panics, handle errors properly'
  },
  {
    pattern: /expect\s*\(/g,
    type: 'expect-usage',
    severity: 'medium' as const,
    message: 'expect() can cause panics, handle errors properly'
  }
];

// C/C++ vulnerability patterns
const C_CPP_VULNERABILITIES = [
  {
    pattern: /system\s*\(/g,
    type: 'system-usage',
    severity: 'critical' as const,
    message: 'system() can lead to command injection'
  },
  {
    pattern: /strcpy\s*\(/g,
    type: 'strcpy-usage',
    severity: 'critical' as const,
    message: 'strcpy() is vulnerable to buffer overflows, use strncpy()'
  },
  {
    pattern: /strcat\s*\(/g,
    type: 'strcat-usage',
    severity: 'critical' as const,
    message: 'strcat() is vulnerable to buffer overflows, use strncat()'
  },
  {
    pattern: /sprintf\s*\(/g,
    type: 'sprintf-usage',
    severity: 'high' as const,
    message: 'sprintf() is vulnerable to buffer overflows, use snprintf()'
  },
  {
    pattern: /gets\s*\(/g,
    type: 'gets-usage',
    severity: 'critical' as const,
    message: 'gets() is vulnerable to buffer overflows, use fgets()'
  },
  {
    pattern: /malloc\s*\(/g,
    type: 'malloc-usage',
    severity: 'medium' as const,
    message: 'Check malloc() return value and handle memory properly'
  },
  {
    pattern: /free\s*\(/g,
    type: 'free-usage',
    severity: 'medium' as const,
    message: 'Ensure proper memory management with free()'
  }
];

// C# vulnerability patterns
const CSHARP_VULNERABILITIES = [
  {
    pattern: /Process\.Start\s*\(/g,
    type: 'process-start',
    severity: 'high' as const,
    message: 'Process.Start() can be dangerous, validate arguments'
  },
  {
    pattern: /Assembly\.Load\s*\(/g,
    type: 'assembly-load',
    severity: 'medium' as const,
    message: 'Assembly.Load() can lead to arbitrary assembly loading'
  },
  {
    pattern: /Type\.GetType\s*\(/g,
    type: 'type-gettype',
    severity: 'medium' as const,
    message: 'Type.GetType() can lead to arbitrary type loading'
  },
  {
    pattern: /password\s*=\s*['"][^'"]*['"]/gi,
    type: 'hardcoded-password',
    severity: 'high' as const,
    message: 'Hardcoded passwords are a security risk'
  },
  {
    pattern: /SqlCommand\s*\(/g,
    type: 'sql-command',
    severity: 'medium' as const,
    message: 'Ensure SQL commands are properly parameterized'
  }
];

const PROJECT_TYPE = detectProjectType();

function scanJavaScript(content: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');
  
  JS_VULNERABILITIES.forEach(vuln => {
    let match;
    while ((match = vuln.pattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const originalLine = lines[lineNumber - 1]?.trim() || '';
      issues.push({
        type: vuln.type,
        severity: vuln.severity,
        message: vuln.message,
        line: lineNumber,
        code: originalLine,
        originalCode: originalLine,
        fixedCode: vuln.fix(originalLine),
        suggestion: vuln.suggestion
      });
    }
  });

  // Additional checks
  if (content.includes('password') && content.includes('localStorage')) {
    issues.push({
      type: 'password-storage-pattern',
      severity: 'critical',
      message: 'Password storage pattern detected in localStorage',
      line: content.split('\n').findIndex(line => line.includes('password'))
    });
  }

  return issues;
}

function scanHTML(content: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');
  
  HTML_VULNERABILITIES.forEach(vuln => {
    let match;
    while ((match = vuln.pattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        type: vuln.type,
        severity: vuln.severity,
        message: vuln.message,
        line: lineNumber,
        code: lines[lineNumber - 1]?.trim()
      });
    }
  });

  // Check for missing security headers
  if (!content.includes('Content-Security-Policy')) {
    issues.push({
      type: 'missing-csp',
      severity: 'medium',
      message: 'Content Security Policy (CSP) header is missing'
    });
  }

  return issues;
}

function scanSolidity(content: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');
  
  SOLIDITY_VULNERABILITIES.forEach(vuln => {
    let match;
    while ((match = vuln.pattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        type: vuln.type,
        severity: vuln.severity,
        message: vuln.message,
        line: lineNumber,
        code: lines[lineNumber - 1]?.trim()
      });
    }
  });

  // Check for common Solidity security issues
  if (content.includes('transfer(') && !content.includes('require(')) {
    issues.push({
      type: 'transfer-without-check',
      severity: 'high',
      message: 'Transfer without checking return value - use SafeERC20'
    });
  }

  if (content.includes('selfdestruct(')) {
    issues.push({
      type: 'selfdestruct-usage',
      severity: 'critical',
      message: 'selfdestruct can lead to loss of funds'
    });
  }

  return issues;
}

function scanPython(content: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');
  
  PYTHON_VULNERABILITIES.forEach(vuln => {
    let match;
    while ((match = vuln.pattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        type: vuln.type,
        severity: vuln.severity,
        message: vuln.message,
        line: lineNumber,
        code: lines[lineNumber - 1]?.trim()
      });
    }
  });

  return issues;
}

function scanJava(content: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');
  
  JAVA_VULNERABILITIES.forEach(vuln => {
    let match;
    while ((match = vuln.pattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        type: vuln.type,
        severity: vuln.severity,
        message: vuln.message,
        line: lineNumber,
        code: lines[lineNumber - 1]?.trim()
      });
    }
  });

  return issues;
}

function scanPHP(content: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');
  
  PHP_VULNERABILITIES.forEach(vuln => {
    let match;
    while ((match = vuln.pattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        type: vuln.type,
        severity: vuln.severity,
        message: vuln.message,
        line: lineNumber,
        code: lines[lineNumber - 1]?.trim()
      });
    }
  });

  return issues;
}

function scanRuby(content: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');
  
  RUBY_VULNERABILITIES.forEach(vuln => {
    let match;
    while ((match = vuln.pattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        type: vuln.type,
        severity: vuln.severity,
        message: vuln.message,
        line: lineNumber,
        code: lines[lineNumber - 1]?.trim()
      });
    }
  });

  return issues;
}

function scanGo(content: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');
  
  GO_VULNERABILITIES.forEach(vuln => {
    let match;
    while ((match = vuln.pattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        type: vuln.type,
        severity: vuln.severity,
        message: vuln.message,
        line: lineNumber,
        code: lines[lineNumber - 1]?.trim()
      });
    }
  });

  return issues;
}

function scanRust(content: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');
  
  RUST_VULNERABILITIES.forEach(vuln => {
    let match;
    while ((match = vuln.pattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        type: vuln.type,
        severity: vuln.severity,
        message: vuln.message,
        line: lineNumber,
        code: lines[lineNumber - 1]?.trim()
      });
    }
  });

  return issues;
}

function scanCpp(content: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');
  
  C_CPP_VULNERABILITIES.forEach(vuln => {
    let match;
    while ((match = vuln.pattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        type: vuln.type,
        severity: vuln.severity,
        message: vuln.message,
        line: lineNumber,
        code: lines[lineNumber - 1]?.trim()
      });
    }
  });

  return issues;
}

function scanCSharp(content: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');
  
  CSHARP_VULNERABILITIES.forEach(vuln => {
    let match;
    while ((match = vuln.pattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        type: vuln.type,
        severity: vuln.severity,
        message: vuln.message,
        line: lineNumber,
        code: lines[lineNumber - 1]?.trim()
      });
    }
  });

  return issues;
}

function scanFile(file: { file: string; content: string; environment?: string }): ScanResult {
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

  // Use environment to scope rules
  if (filename.endsWith('.js') || filename.endsWith('.ts')) {
    // Always treat as server-side for Node.js projects
    issues = scanJavaScript(content).filter(issue => 
      // Only include env-exposure for client-side
      !(issue.type === 'env-exposure')
    );
  } else if (filename.endsWith('.html')) {
    if (env === 'client' || env === 'unknown') {
      issues = scanHTML(content);
    } // else skip HTML rules for server
  } else if (filename.endsWith('.sol')) {
    issues = scanSolidity(content);
  } else if (filename.endsWith('.py')) {
    issues = scanPython(content);
  } else if (filename.endsWith('.java')) {
    issues = scanJava(content);
  } else if (filename.endsWith('.php')) {
    issues = scanPHP(content);
  } else if (filename.endsWith('.rb')) {
    issues = scanRuby(content);
  } else if (filename.endsWith('.go')) {
    issues = scanGo(content);
  } else if (filename.endsWith('.rs')) {
    issues = scanRust(content);
  } else if (filename.endsWith('.cpp')) {
    issues = scanCpp(content);
  } else if (filename.endsWith('.cs')) {
    issues = scanCSharp(content);
  } else {
    // Generic file scan
    issues = scanJavaScript(content);
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
    // Scan each file
    const results = body.files.map(scanFile);
    
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