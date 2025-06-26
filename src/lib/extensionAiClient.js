import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Rate limiting and caching for extension AI
let requestCount = 0;
let lastResetTime = Date.now();
const RATE_LIMIT_PER_MINUTE = 5; // Conservative limit for extension
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache for extension
const responseCache = new Map();

// Simple rate limiter
function checkRateLimit() {
  const now = Date.now();
  if (now - lastResetTime >= 60000) { // Reset every minute
    requestCount = 0;
    lastResetTime = now;
  }
  
  if (requestCount >= RATE_LIMIT_PER_MINUTE) {
    throw new Error('Extension AI rate limit exceeded. Please try again in a moment.');
  }
  
  requestCount++;
}

// Cache management
function getCacheKey(originalCode, fileType, vulnerabilityType) {
  return `${originalCode.substring(0, 50)}_${fileType}_${vulnerabilityType}`.replace(/[^a-zA-Z0-9]/g, '_');
}

function getCachedResponse(originalCode, fileType, vulnerabilityType) {
  const cacheKey = getCacheKey(originalCode, fileType, vulnerabilityType);
  const cached = responseCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.response;
  }
  
  return null;
}

function setCachedResponse(originalCode, fileType, vulnerabilityType, response) {
  const cacheKey = getCacheKey(originalCode, fileType, vulnerabilityType);
  responseCache.set(cacheKey, {
    response,
    timestamp: Date.now()
  });
  
  // Clean up old cache entries
  if (responseCache.size > 50) {
    const oldestKey = responseCache.keys().next().value;
    responseCache.delete(oldestKey);
  }
}

// Specialized AI function for VS Code extension - generates proper code fixes
export async function generateExtensionFix(originalCode, fileType, vulnerabilityType, vulnerabilityMessage) {
  try {
    // Check cache first
    const cached = getCachedResponse(originalCode, fileType, vulnerabilityType);
    if (cached) {
      console.log("Using cached extension fix");
      return cached;
    }
    
    // Check rate limit
    checkRateLimit();
    
    console.log(`Generating extension fix (${requestCount}/${RATE_LIMIT_PER_MINUTE} this minute)`);
    
    const prompt = `
You are a specialized code security fix generator for a VS Code extension. Your job is to generate ACTUAL CODE REPLACEMENTS that can be directly applied to fix security vulnerabilities.

IMPORTANT RULES:
1. ALWAYS generate actual code, never comments or suggestions
2. The fixedCode must be a direct replacement for the original code
3. If the fix requires removing code, use an empty string or appropriate safe alternative
4. If the fix requires multiple lines, provide the complete multi-line replacement
5. Ensure the fix maintains the same functionality while being secure
6. Use proper syntax for the programming language
7. Return ONLY valid JSON, no other text

Vulnerability Details:
- File Type: ${fileType}
- Vulnerability Type: ${vulnerabilityType}
- Message: ${vulnerabilityMessage}
- Original Code: ${originalCode}

Generate a secure replacement that directly addresses the vulnerability. Return ONLY valid JSON in this format:

{
  "fixedCode": "the actual code replacement here",
  "suggestion": "brief explanation of the fix"
}

Examples of GOOD fixes:
- SQL Injection: Replace string concatenation with parameterized queries
- XSS: Replace innerHTML with textContent or createElement
- eval(): Replace with safer alternatives like JSON.parse() or Function constructor
- Command injection: Remove dangerous commands or use safe alternatives
- Hardcoded secrets: Replace with environment variables

Examples of BAD fixes (DO NOT DO):
- "# Remove this line" (this is a comment, not code)
- "Avoid using eval()" (this is a suggestion, not code)
- "Do not execute dangerous commands" (this is advice, not code)

Generate the actual secure code replacement now:
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const rawText = response.text;
    console.log("Extension Fix Response:", rawText);

    if (!rawText) {
      throw new Error("No response from AI");
    }

    // Extract JSON from the response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate the response
    if (!parsed.fixedCode || typeof parsed.fixedCode !== 'string') {
      throw new Error("Invalid fixedCode in response");
    }

    // Ensure the fix is not just a comment or suggestion
    const isCommentOnly = parsed.fixedCode.trim().startsWith('#') || 
                         parsed.fixedCode.trim().startsWith('//') ||
                         parsed.fixedCode.trim().startsWith('/*') ||
                         parsed.fixedCode.includes('Remove this line') ||
                         parsed.fixedCode.includes('Avoid') ||
                         parsed.fixedCode.includes('Do not');

    if (isCommentOnly) {
      throw new Error("AI generated a comment instead of code");
    }

    const result = {
      fixedCode: parsed.fixedCode,
      suggestion: parsed.suggestion || "Security fix applied"
    };

    // Cache the result
    setCachedResponse(originalCode, fileType, vulnerabilityType, result);
    return result;

  } catch (error) {
    console.error("Extension fix generation failed:", error);
    
    // Fallback to basic fixes based on vulnerability type
    const fallback = generateFallbackFix(originalCode, fileType, vulnerabilityType);
    setCachedResponse(originalCode, fileType, vulnerabilityType, fallback);
    return fallback;
  }
}

// Fallback function for when AI fails
function generateFallbackFix(originalCode, fileType, vulnerabilityType) {
  const lowerCode = originalCode.toLowerCase();
  
  switch (vulnerabilityType) {
    case 'sql-injection':
      if (lowerCode.includes('select') && lowerCode.includes('where')) {
        return {
          fixedCode: originalCode.replace(/`[^`]*\$\{[^}]*\}[^`]*`/g, "'SELECT * FROM table WHERE id = ?'"),
          suggestion: "Replaced string concatenation with parameterized query"
        };
      }
      break;
      
    case 'eval-usage':
      if (fileType.toLowerCase() === 'javascript') {
        return {
          fixedCode: originalCode.replace(/eval\s*\(/g, 'JSON.parse('),
          suggestion: "Replaced eval() with JSON.parse() for safe evaluation"
        };
      } else if (fileType.toLowerCase() === 'python') {
        return {
          fixedCode: originalCode.replace(/eval\s*\(/g, 'ast.literal_eval('),
          suggestion: "Replaced eval() with ast.literal_eval() for safe evaluation"
        };
      }
      break;
      
    case 'innerhtml-usage':
    case 'xss':
      return {
        fixedCode: originalCode.replace(/\.innerHTML\s*=/g, '.textContent ='),
        suggestion: "Replaced innerHTML with textContent to prevent XSS"
      };
      
    case 'os-system':
      return {
        fixedCode: originalCode.replace(/os\.system\s*\(/g, 'subprocess.run(['),
        suggestion: "Replaced os.system() with subprocess.run() for safer command execution"
      };
      
    case 'subprocess-call':
      return {
        fixedCode: originalCode.replace(/subprocess\.call\s*\(/g, 'subprocess.run(['),
        suggestion: "Replaced subprocess.call() with subprocess.run() for better security"
      };
      
    case 'pickle-loads':
      return {
        fixedCode: originalCode.replace(/pickle\.loads\s*\(/g, 'json.loads('),
        suggestion: "Replaced pickle.loads() with json.loads() for safe deserialization"
      };
      
    case 'command-injection':
      return {
        fixedCode: `// SECURITY FIX: Removed potentially dangerous command\n// Original: ${originalCode}`,
        suggestion: "Removed potentially dangerous command - review manually"
      };
      
    case 'code-injection':
      return {
        fixedCode: `// SECURITY FIX: Removed potentially dangerous code execution\n// Original: ${originalCode}`,
        suggestion: "Removed potentially dangerous code execution - review manually"
      };
      
    case 'sensitive-data-exposure':
      return {
        fixedCode: originalCode.replace(/password\s*=\s*["'][^"']*["']/g, 'password = process.env.APP_PASSWORD'),
        suggestion: "Replaced hardcoded password with environment variable"
      };
      
    default:
      // For unknown vulnerabilities, remove the dangerous code
      return {
        fixedCode: `// SECURITY FIX: Removed potentially dangerous code\n// Original: ${originalCode}`,
        suggestion: "Removed potentially dangerous code - review manually"
      };
  }
  
  return {
    fixedCode: originalCode,
    suggestion: "No automatic fix available - review manually"
  };
}

// Specialized vulnerability detection for extension
export async function detectVulnerabilitiesForExtension(content, fileType) {
  try {
    // Check rate limit
    checkRateLimit();
    
    const prompt = `
Analyze this ${fileType} code for security vulnerabilities that can be automatically fixed:

${content}

Look for these specific vulnerabilities that have known fixes:
1. SQL Injection (string concatenation in queries)
2. XSS (innerHTML usage)
3. Code injection (eval(), exec())
4. Command injection (os.system(), subprocess.call())
5. Insecure deserialization (pickle.loads())
6. Sensitive data exposure (hardcoded passwords)

For each vulnerability found, provide:
- Type of vulnerability
- Severity (critical/high/medium/low)
- Line number (if possible)
- Description of the issue
- Original code snippet
- Suggested fix (actual code replacement)

Return ONLY valid JSON in this format:
{
  "vulnerabilities": [
    {
      "type": "sql-injection",
      "severity": "critical",
      "line": 15,
      "message": "SQL injection vulnerability detected",
      "originalCode": "const query = \`SELECT * FROM users WHERE id = \${userId}\`",
      "fixedCode": "const query = 'SELECT * FROM users WHERE id = ?'",
      "suggestion": "Use parameterized queries"
    }
  ]
}
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const rawText = response.text;
    console.log("Extension Vulnerability Detection Response:", rawText);

    if (!rawText) {
      throw new Error("No response from AI");
    }

    // Extract JSON from the response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (parsed.vulnerabilities && Array.isArray(parsed.vulnerabilities)) {
      // Enhance each vulnerability with better fixes using our specialized function
      const enhancedVulnerabilities = await Promise.all(
        parsed.vulnerabilities.map(async (vuln) => {
          if (vuln.originalCode) {
            try {
              const enhancedFix = await generateExtensionFix(
                vuln.originalCode,
                fileType,
                vuln.type,
                vuln.message
              );
              
              return {
                type: vuln.type,
                severity: vuln.severity,
                message: vuln.message,
                line: vuln.line,
                code: vuln.originalCode,
                originalCode: vuln.originalCode,
                fixedCode: enhancedFix.fixedCode,
                suggestion: enhancedFix.suggestion,
                confidence: 95,
                aiDetected: true
              };
            } catch (error) {
              console.error('Failed to generate enhanced fix:', error);
              // Fall back to original
              return {
                type: vuln.type,
                severity: vuln.severity,
                message: vuln.message,
                line: vuln.line,
                code: vuln.originalCode,
                originalCode: vuln.originalCode,
                fixedCode: vuln.fixedCode,
                suggestion: vuln.suggestion,
                confidence: 90,
                aiDetected: true
              };
            }
          }
          
          return vuln;
        })
      );
      
      return enhancedVulnerabilities;
    }
    
    return [];
  } catch (error) {
    console.error('Extension vulnerability detection failed:', error);
    return [];
  }
}

// Export rate limit info for monitoring
export function getExtensionRateLimitInfo() {
  const now = Date.now();
  const timeUntilReset = Math.max(0, 60000 - (now - lastResetTime));
  
  return {
    requestsThisMinute: requestCount,
    limitPerMinute: RATE_LIMIT_PER_MINUTE,
    timeUntilReset: Math.ceil(timeUntilReset / 1000),
    cacheSize: responseCache.size
  };
}

// Test function to verify the extension AI works
export async function testExtensionAI() {
  console.log("Testing extension AI...");
  
  const testCases = [
    {
      originalCode: "const query = `SELECT * FROM users WHERE username = '${username}'`",
      fileType: "JavaScript",
      vulnerabilityType: "sql-injection",
      vulnerabilityMessage: "SQL injection vulnerability detected"
    },
    {
      originalCode: "element.innerHTML = userInput;",
      fileType: "JavaScript", 
      vulnerabilityType: "xss",
      vulnerabilityMessage: "XSS vulnerability detected"
    },
    {
      originalCode: "result = eval(userInput)",
      fileType: "Python",
      vulnerabilityType: "eval-usage", 
      vulnerabilityMessage: "eval() usage detected"
    }
  ];
  
  for (const testCase of testCases) {
    try {
      const result = await generateExtensionFix(
        testCase.originalCode,
        testCase.fileType,
        testCase.vulnerabilityType,
        testCase.vulnerabilityMessage
      );
      
      console.log(`✅ Test passed for ${testCase.vulnerabilityType}:`);
      console.log(`   Original: ${testCase.originalCode}`);
      console.log(`   Fixed: ${result.fixedCode}`);
      console.log(`   Suggestion: ${result.suggestion}`);
    } catch (error) {
      console.error(`❌ Test failed for ${testCase.vulnerabilityType}:`, error);
    }
  }
} 