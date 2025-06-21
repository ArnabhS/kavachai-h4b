import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/models';
import { getUser } from '@civic/auth-web3/nextjs';

 

interface ScanIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  line?: number;
  code?: string;
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

// JavaScript/TypeScript vulnerability patterns
const JS_VULNERABILITIES = [
  {
    pattern: /eval\s*\(/g,
    type: 'eval-usage',
    severity: 'critical' as const,
    message: 'Use of eval() is dangerous and can lead to code injection'
  },
  {
    pattern: /innerHTML\s*=/g,
    type: 'innerhtml-usage',
    severity: 'high' as const,
    message: 'innerHTML can lead to XSS attacks, use textContent instead'
  },
  {
    pattern: /document\.write\s*\(/g,
    type: 'document-write',
    severity: 'high' as const,
    message: 'document.write() can lead to XSS attacks'
  },
  {
    pattern: /localStorage\.setItem\s*\([^,]+,\s*[^)]*password[^)]*\)/gi,
    type: 'password-storage',
    severity: 'critical' as const,
    message: 'Storing passwords in localStorage is insecure'
  },
  {
    pattern: /console\.log\s*\([^)]*password[^)]*\)/gi,
    type: 'password-logging',
    severity: 'high' as const,
    message: 'Logging passwords is a security risk'
  },
  {
    pattern: /process\.env\.\w+/g,
    type: 'env-exposure',
    severity: 'medium' as const,
    message: 'Environment variables should not be exposed in client-side code'
  },
  {
    pattern: /<script\s+src\s*=\s*["'][^"']*["']/gi,
    type: 'external-script',
    severity: 'medium' as const,
    message: 'Loading external scripts can be a security risk'
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

function scanJavaScript(content: string, filename: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lines = content.split('\n');
  
  JS_VULNERABILITIES.forEach(vuln => {
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

function scanHTML(content: string, filename: string): ScanIssue[] {
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

function scanSolidity(content: string, filename: string): ScanIssue[] {
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

function scanFile(file: { file: string; content: string }): ScanResult {
  const { file: filename, content } = file;
  let issues: ScanIssue[] = [];

  if (filename.endsWith('.js') || filename.endsWith('.ts')) {
    issues = scanJavaScript(content, filename);
  } else if (filename.endsWith('.html')) {
    issues = scanHTML(content, filename);
  } else if (filename.endsWith('.sol')) {
    issues = scanSolidity(content, filename);
  } else {
    // Generic file scan
    issues = scanJavaScript(content, filename);
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
  const user = await getUser();
  // Authenticate API key
  const authHeader = req.headers.get('authorization');
  if(!user){
    return NextResponse.json({ message: 'User not found.' }, { status: 404 });
  }
  const doc = await getApiKey(user?.id)
  if (!authHeader || !doc || authHeader !== `Bearer ${doc.apiKey}`) {
    return NextResponse.json({ message: 'Invalid or missing API key.' }, { status: 401 });
  }

  // Scan each file
  const results = body.files.map(scanFile);
  
  // Overall summary
  const overallSummary = results.reduce((acc: { total: number; critical: number; high: number; medium: number; low: number }, result: ScanResult) => ({
    total: acc.total + result.summary.total,
    critical: acc.critical + result.summary.critical,
    high: acc.high + result.summary.high,
    medium: acc.medium + result.summary.medium,
    low: acc.low + result.summary.low
  }), { total: 0, critical: 0, high: 0, medium: 0, low: 0 });

  return NextResponse.json({ 
    results,
    summary: overallSummary,
    scanTime: new Date().toISOString()
  });
} 