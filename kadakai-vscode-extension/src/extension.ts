import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

// Set your backend URL here
const BACKEND_URL = 'http://localhost:3000'; // <-- CHANGE THIS

interface Vulnerability {
  file: string;
  line: number;
  severity: 'high' | 'medium' | 'low';
  type: string;
  description: string;
  suggestion: string;
  originalCode: string;
  fixedCode: string;
}

interface ScanResult {
  vulnerabilities: Vulnerability[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface SensitiveFile {
  file: string;
  type: 'env' | 'git' | 'key' | 'secret' | 'config';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
}

// Sensitive file patterns that should not be committed
const SENSITIVE_FILE_PATTERNS = [
  {
    pattern: /\.env$/i,
    type: 'env' as const,
    severity: 'critical' as const,
    description: 'Environment variables file',
    suggestion: 'Add .env to .gitignore and use .env.example for templates'
  },
  {
    pattern: /\.git$/i,
    type: 'git' as const,
    severity: 'critical' as const,
    description: 'Git directory',
    suggestion: 'Never commit .git directory. Use .gitignore to exclude it'
  },
  {
    pattern: /\.gitignore$/i,
    type: 'git' as const,
    severity: 'low' as const,
    description: 'Git ignore file',
    suggestion: 'This file is safe to commit and should be included'
  },
  {
    pattern: /\.pem$/i,
    type: 'key' as const,
    severity: 'critical' as const,
    description: 'Private key file',
    suggestion: 'Never commit private keys. Use environment variables or secure key management'
  },
  {
    pattern: /\.key$/i,
    type: 'key' as const,
    severity: 'critical' as const,
    description: 'Key file',
    suggestion: 'Never commit key files. Use environment variables or secure key management'
  },
  {
    pattern: /\.p12$/i,
    type: 'key' as const,
    severity: 'critical' as const,
    description: 'PKCS#12 certificate file',
    suggestion: 'Never commit certificate files. Use environment variables or secure certificate management'
  },
  {
    pattern: /\.pfx$/i,
    type: 'key' as const,
    severity: 'critical' as const,
    description: 'Personal Information Exchange file',
    suggestion: 'Never commit certificate files. Use environment variables or secure certificate management'
  },
  {
    pattern: /secret/i,
    type: 'secret' as const,
    severity: 'high' as const,
    description: 'File containing "secret" in name',
    suggestion: 'Review this file for sensitive information before committing'
  },
  {
    pattern: /password/i,
    type: 'secret' as const,
    severity: 'high' as const,
    description: 'File containing "password" in name',
    suggestion: 'Review this file for sensitive information before committing'
  },
  {
    pattern: /config\.json$/i,
    type: 'config' as const,
    severity: 'medium' as const,
    description: 'Configuration file with potential secrets',
    suggestion: 'Review for hardcoded secrets and consider using environment variables'
  },
  {
    pattern: /\.sql$/i,
    type: 'config' as const,
    severity: 'medium' as const,
    description: 'SQL file with potential database credentials',
    suggestion: 'Review for hardcoded database credentials'
  },
  {
    pattern: /\.log$/i,
    type: 'config' as const,
    severity: 'medium' as const,
    description: 'Log file with potential sensitive information',
    suggestion: 'Log files should not be committed. Add to .gitignore'
  }
];

export function activate(context: vscode.ExtensionContext) {
  // Command to enter API key
  context.subscriptions.push(
    vscode.commands.registerCommand('kavachai.enterApiKey', async () => {
      const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your Kavach.ai API key',
        ignoreFocusOut: true,
        password: true,
      });
      if (apiKey) {
        // Validate API key with backend
        try {
          const res = await fetch(`${BACKEND_URL}/api/validate-apikey`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
          });
          if (res.ok) {
            await context.secrets.store('kavachaiApiKey', apiKey);
            vscode.window.showInformationMessage('API key validated and saved!');
          } else {
            const data = await res.json();
            vscode.window.showErrorMessage('Invalid API key: ' + (data.message || 'Validation failed'));
          }
        } catch (err) {
          vscode.window.showErrorMessage('Failed to validate API key: ' + err);
        }
      }
    })
  );

  // On activation, check if API key exists, else prompt
  context.secrets.get('kavachaiApiKey').then((key: string | undefined) => {
    if (!key) {
      vscode.commands.executeCommand('kavachai.enterApiKey');
    }
  });

  // Output channel for results
  const outputChannel = vscode.window.createOutputChannel('Kavach.ai Scan Results');

  // Check for sensitive files command
  context.subscriptions.push(
    vscode.commands.registerCommand('kavachai.checkSensitiveFiles', async () => {
      await checkSensitiveFiles(context);
    })
  );

  // Scan Workspace command
  context.subscriptions.push(
    vscode.commands.registerCommand('kavachai.scanWorkspace', async () => {
      const apiKey = await context.secrets.get('kavachaiApiKey');
      if (!apiKey) {
        vscode.window.showErrorMessage('Kavach.ai API key not set. Please login to the Kavach.ai web app and copy your API key from the dashboard.');
        return;
      }

      // First check for sensitive files
      const sensitiveFiles = await checkSensitiveFiles(context, false);
      if (sensitiveFiles.length > 0) {
        const shouldContinue = await vscode.window.showWarningMessage(
          `Found ${sensitiveFiles.length} sensitive files that should not be committed. Continue with security scan?`,
          'Continue', 'Cancel'
        );
        if (shouldContinue !== 'Continue') {
          return;
        }
      }

      // Get all files matching extensions
      const files = await vscode.workspace.findFiles('**/*.{js,ts,sol,html,py,java,php,rb,go,rs,cpp,c,cs}', '**/node_modules/**');
      if (files.length === 0) {
        vscode.window.showInformationMessage('No relevant files found in workspace.');
        return;
      }

      // Read file contents (limit size for demo)
      const fileContents: { file: string; content: string; path: string; environment?: string }[] = [];
      for (const file of files) {
        try {
          const content = fs.readFileSync(file.fsPath, 'utf8');
          // Detect environment (server or client)
          let environment = 'unknown';
          const lowerPath = file.fsPath.toLowerCase();
          if (lowerPath.includes('/pages/api/') || lowerPath.includes('server') || lowerPath.endsWith('.server.js') || lowerPath.endsWith('.server.ts')) {
            environment = 'server';
          } else if (lowerPath.includes('/pages/') || lowerPath.includes('components') || lowerPath.endsWith('.client.js') || lowerPath.endsWith('.client.ts') || lowerPath.endsWith('.jsx') || lowerPath.endsWith('.tsx')) {
            environment = 'client';
          } else if (content.match(/require\(['"]express['"]\)/) || content.match(/from ['"]express['"]/)) {
            environment = 'server';
          } else if (content.match(/import React/) || content.match(/from ['"]react['"]/)) {
            environment = 'client';
          }
          fileContents.push({ 
            file: path.basename(file.fsPath), 
            content: content.slice(0, 10000), // limit to 10k chars
            path: file.fsPath,
            environment
          });
        } catch {
          // skip unreadable files
        }
      }

      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Kavach.ai: Scanning workspace...'
      }, async () => {
        try {
          const backendUrl = `${BACKEND_URL}/api/scan-code`;
          const res = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ files: fileContents })
          });
          const result: ScanResult = await res.json();
          
          // Show results in custom panel
          showVulnerabilityPanel(result, context);
          
          // Also show in output channel for reference
          outputChannel.clear();
          outputChannel.appendLine('Scan Results:');
          outputChannel.appendLine(JSON.stringify(result, null, 2));
          outputChannel.show();
          
          vscode.window.showInformationMessage(`Kavach.ai scan complete! Found ${result.vulnerabilities?.length || 0} vulnerabilities.`);
        } catch (err) {
          vscode.window.showErrorMessage('Kavach.ai scan failed: ' + err);
        }
      });
    })
  );

  // Set up file system watcher for sensitive files
  setupFileWatcher(context);
}

// Function to check for sensitive files
async function checkSensitiveFiles(context: vscode.ExtensionContext, showNotification: boolean = true): Promise<SensitiveFile[]> {
  const sensitiveFiles: SensitiveFile[] = [];
  
  try {
    // Get all files in workspace
    const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**');
    
    for (const file of files) {
      const fileName = path.basename(file.fsPath);
      const relativePath = vscode.workspace.asRelativePath(file.fsPath);
      
      // Check against sensitive file patterns
      for (const pattern of SENSITIVE_FILE_PATTERNS) {
        if (pattern.pattern.test(fileName) || pattern.pattern.test(relativePath)) {
          sensitiveFiles.push({
            file: relativePath,
            type: pattern.type,
            severity: pattern.severity,
            description: pattern.description,
            suggestion: pattern.suggestion
          });
          break; // Only match first pattern
        }
      }
    }
    
    if (sensitiveFiles.length > 0 && showNotification) {
      const criticalFiles = sensitiveFiles.filter(f => f.severity === 'critical');
      const highFiles = sensitiveFiles.filter(f => f.severity === 'high');
      
      let message = `🚨 Found ${sensitiveFiles.length} sensitive files!`;
      if (criticalFiles.length > 0) {
        message += `\n${criticalFiles.length} CRITICAL files that should NEVER be committed!`;
      }
      if (highFiles.length > 0) {
        message += `\n${highFiles.length} HIGH risk files that need review.`;
      }
      
      const action = await vscode.window.showWarningMessage(
        message,
        'View Details', 'Dismiss'
      );
      
      if (action === 'View Details') {
        showSensitiveFilesPanel(sensitiveFiles, context);
      }
    }
    
    return sensitiveFiles;
  } catch (error) {
    if (showNotification) {
      vscode.window.showErrorMessage('Failed to check for sensitive files: ' + error);
    }
    return [];
  }
}

// Function to set up file system watcher
function setupFileWatcher(context: vscode.ExtensionContext) {
  const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
  
  fileWatcher.onDidCreate(async (uri) => {
    const fileName = path.basename(uri.fsPath);
    const relativePath = vscode.workspace.asRelativePath(uri.fsPath);
    
    // Check if the new file is sensitive
    for (const pattern of SENSITIVE_FILE_PATTERNS) {
      if (pattern.pattern.test(fileName) || pattern.pattern.test(relativePath)) {
        const action = await vscode.window.showWarningMessage(
          `🚨 Sensitive file detected: ${relativePath}\n${pattern.description}\n\n${pattern.suggestion}`,
          'Add to .gitignore', 'Dismiss'
        );
        
        if (action === 'Add to .gitignore') {
          await addToGitignore(relativePath);
        }
        break;
      }
    }
  });
  
  context.subscriptions.push(fileWatcher);
}

// Function to add file to .gitignore
async function addToGitignore(filePath: string) {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) return;
    
    const gitignorePath = path.join(workspaceFolder.uri.fsPath, '.gitignore');
    const gitignoreEntry = `\n# Kavach.ai: Sensitive file detected\n${filePath}\n`;
    
    // Check if .gitignore exists
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8');
      if (!content.includes(filePath)) {
        fs.appendFileSync(gitignorePath, gitignoreEntry);
        vscode.window.showInformationMessage(`Added ${filePath} to .gitignore`);
      }
    } else {
      fs.writeFileSync(gitignorePath, `# Kavach.ai: Auto-generated .gitignore\n${gitignoreEntry}`);
      vscode.window.showInformationMessage(`Created .gitignore and added ${filePath}`);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to update .gitignore: ${error}`);
  }
}

// Function to show sensitive files panel
function showSensitiveFilesPanel(sensitiveFiles: SensitiveFile[], context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'kavachaiSensitiveFiles',
    'Kavach.ai: Sensitive Files Detected',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  panel.webview.html = getSensitiveFilesWebviewContent(sensitiveFiles);

  // Handle messages from webview
  panel.webview.onDidReceiveMessage(
    async message => {
      switch (message.command) {
        case 'addToGitignore':
          await addToGitignore(message.filePath);
          break;
        case 'openFile':
          const fileUri = vscode.Uri.file(path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, message.filePath));
          await vscode.window.showTextDocument(fileUri);
          break;
      }
    },
    undefined,
    context.subscriptions
  );
}

// Function to generate webview content for sensitive files
function getSensitiveFilesWebviewContent(sensitiveFiles: SensitiveFile[]): string {
  const criticalFiles = sensitiveFiles.filter(f => f.severity === 'critical');
  const highFiles = sensitiveFiles.filter(f => f.severity === 'high');
  const mediumFiles = sensitiveFiles.filter(f => f.severity === 'medium');
  const lowFiles = sensitiveFiles.filter(f => f.severity === 'low');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kavach.ai: Sensitive Files Detected</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background: #1e1e1e;
                color: #ffffff;
                line-height: 1.6;
            }
            .header {
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: bold;
            }
            .summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }
            .summary-card {
                background: #2d2d2d;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                border-left: 4px solid;
            }
            .summary-card.critical { border-left-color: #ff6b6b; }
            .summary-card.high { border-left-color: #ffa726; }
            .summary-card.medium { border-left-color: #ffd54f; }
            .summary-card.low { border-left-color: #66bb6a; }
            .summary-card h3 {
                margin: 0 0 10px 0;
                font-size: 18px;
            }
            .summary-card .count {
                font-size: 32px;
                font-weight: bold;
            }
            .files-section {
                margin-bottom: 30px;
            }
            .files-section h2 {
                color: #ff6b6b;
                border-bottom: 2px solid #ff6b6b;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .file-item {
                background: #2d2d2d;
                margin-bottom: 10px;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid;
            }
            .file-item.critical { border-left-color: #ff6b6b; }
            .file-item.high { border-left-color: #ffa726; }
            .file-item.medium { border-left-color: #ffd54f; }
            .file-item.low { border-left-color: #66bb6a; }
            .file-name {
                font-weight: bold;
                margin-bottom: 5px;
                color: #ff6b6b;
            }
            .file-description {
                color: #cccccc;
                margin-bottom: 10px;
            }
            .file-suggestion {
                color: #66bb6a;
                font-style: italic;
                margin-bottom: 10px;
            }
            .file-actions {
                display: flex;
                gap: 10px;
            }
            .btn {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            }
            .btn-primary {
                background: #007acc;
                color: white;
            }
            .btn-primary:hover {
                background: #005a9e;
            }
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            .btn-secondary:hover {
                background: #545b62;
            }
            .warning {
                background: #fff3cd;
                color: #856404;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                border-left: 4px solid #ffc107;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚨 Sensitive Files Detected</h1>
            <p>These files contain sensitive information and should not be committed to version control</p>
        </div>

        <div class="warning">
            <strong>⚠️ Security Warning:</strong> Committing sensitive files can expose secrets, API keys, and other confidential information. 
            Review each file and add them to .gitignore if they contain sensitive data.
        </div>

        <div class="summary">
            ${criticalFiles.length > 0 ? `
                <div class="summary-card critical">
                    <h3>Critical</h3>
                    <div class="count">${criticalFiles.length}</div>
                    <p>Never commit these files!</p>
                </div>
            ` : ''}
            ${highFiles.length > 0 ? `
                <div class="summary-card high">
                    <h3>High Risk</h3>
                    <div class="count">${highFiles.length}</div>
                    <p>Review carefully</p>
                </div>
            ` : ''}
            ${mediumFiles.length > 0 ? `
                <div class="summary-card medium">
                    <h3>Medium Risk</h3>
                    <div class="count">${mediumFiles.length}</div>
                    <p>Check for secrets</p>
                </div>
            ` : ''}
            ${lowFiles.length > 0 ? `
                <div class="summary-card low">
                    <h3>Low Risk</h3>
                    <div class="count">${lowFiles.length}</div>
                    <p>Generally safe</p>
                </div>
            ` : ''}
        </div>

        ${criticalFiles.length > 0 ? `
            <div class="files-section">
                <h2>🚨 Critical Files (Never Commit)</h2>
                ${criticalFiles.map(file => `
                    <div class="file-item critical">
                        <div class="file-name">${escapeHtml(file.file)}</div>
                        <div class="file-description">${escapeHtml(file.description)}</div>
                        <div class="file-suggestion">💡 ${escapeHtml(file.suggestion)}</div>
                        <div class="file-actions">
                            <button class="btn btn-primary" onclick="addToGitignore('${file.file}')">Add to .gitignore</button>
                            <button class="btn btn-secondary" onclick="openFile('${file.file}')">Open File</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${highFiles.length > 0 ? `
            <div class="files-section">
                <h2>⚠️ High Risk Files</h2>
                ${highFiles.map(file => `
                    <div class="file-item high">
                        <div class="file-name">${escapeHtml(file.file)}</div>
                        <div class="file-description">${escapeHtml(file.description)}</div>
                        <div class="file-suggestion">💡 ${escapeHtml(file.suggestion)}</div>
                        <div class="file-actions">
                            <button class="btn btn-primary" onclick="addToGitignore('${file.file}')">Add to .gitignore</button>
                            <button class="btn btn-secondary" onclick="openFile('${file.file}')">Open File</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${mediumFiles.length > 0 ? `
            <div class="files-section">
                <h2>🔍 Medium Risk Files</h2>
                ${mediumFiles.map(file => `
                    <div class="file-item medium">
                        <div class="file-name">${escapeHtml(file.file)}</div>
                        <div class="file-description">${escapeHtml(file.description)}</div>
                        <div class="file-suggestion">💡 ${escapeHtml(file.suggestion)}</div>
                        <div class="file-actions">
                            <button class="btn btn-primary" onclick="addToGitignore('${file.file}')">Add to .gitignore</button>
                            <button class="btn btn-secondary" onclick="openFile('${file.file}')">Open File</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${lowFiles.length > 0 ? `
            <div class="files-section">
                <h2>✅ Low Risk Files</h2>
                ${lowFiles.map(file => `
                    <div class="file-item low">
                        <div class="file-name">${escapeHtml(file.file)}</div>
                        <div class="file-description">${escapeHtml(file.description)}</div>
                        <div class="file-suggestion">💡 ${escapeHtml(file.suggestion)}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <script>
            const vscode = acquireVsCodeApi();
            
            function addToGitignore(filePath) {
                vscode.postMessage({
                    command: 'addToGitignore',
                    filePath: filePath
                });
            }
            
            function openFile(filePath) {
                vscode.postMessage({
                    command: 'openFile',
                    filePath: filePath
                });
            }
        </script>
    </body>
    </html>
  `;
}

// Function to show vulnerability panel
function showVulnerabilityPanel(result: any, context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'kavachaiVulnerabilities',
    'Kavach.ai Security Vulnerabilities',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  // Handle both old and new response formats
  const vulnerabilities: Vulnerability[] = result.vulnerabilities || [];
  const summary = result.extensionSummary || result.summary || { total: 0, high: 0, medium: 0, low: 0 };
  
  panel.webview.html = getWebviewContent(vulnerabilities, summary);

  // Store vulnerabilities for later use in openFile
  panel.webview.onDidReceiveMessage(
    async message => {
      switch (message.command) {
        case 'applyFix':
          await applyCodeFix(message.vulnerability);
          break;
        case 'rejectFix':
          vscode.window.showInformationMessage('Fix rejected for: ' + message.vulnerability.description);
          break;
        case 'openFile':
          await openFileAtLine(message.file, message.line);
          // After opening, show Accept/Reject options in the editor
          const vuln = vulnerabilities[message.vulnIndex] || vulnerabilities.find((v: Vulnerability) => v.file === message.file && v.line === message.line);
          if (vuln) {
            const accept = await vscode.window.showInformationMessage('Apply suggested fix for this vulnerability?', 'Accept', 'Reject');
            if (accept === 'Accept') {
              await applyCodeFix(vuln);
            }
          }
          break;
      }
    },
    undefined,
    context.subscriptions
  );
}

async function applyCodeFix(vulnerability: Vulnerability) {
  try {
    // Try to find the file in the workspace
    const files = await vscode.workspace.findFiles(`**/${vulnerability.file}`, '**/node_modules/**');
    let document;
    
    if (files.length > 0) {
      document = await vscode.workspace.openTextDocument(files[0]);
    } else {
      // Fallback to just the filename
      document = await vscode.workspace.openTextDocument(vulnerability.file);
    }
    
    const editor = await vscode.window.showTextDocument(document);
    
    // Find the line with the vulnerability
    const line = document.lineAt(vulnerability.line - 1);
    const range = new vscode.Range(
      new vscode.Position(vulnerability.line - 1, 0),
      new vscode.Position(vulnerability.line - 1, line.text.length)
    );
    
    // Apply the fix
    await editor.edit(editBuilder => {
      editBuilder.replace(range, vulnerability.fixedCode);
    });
    
    vscode.window.showInformationMessage(`Applied fix for: ${vulnerability.description}`);
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to apply fix: ${error}`);
  }
}

async function openFileAtLine(filePath: string, line: number) {
  try {
    // Try to find the file in the workspace
    const files = await vscode.workspace.findFiles(`**/${filePath}`, '**/node_modules/**');
    let document;
    
    if (files.length > 0) {
      document = await vscode.workspace.openTextDocument(files[0]);
    } else {
      // Fallback to just the filename
      document = await vscode.workspace.openTextDocument(filePath);
    }
    
    const editor = await vscode.window.showTextDocument(document);
    
    // Reveal the line
    const position = new vscode.Position(line - 1, 0);
    editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
    
    // Set cursor position
    editor.selection = new vscode.Selection(position, position);
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to open file: ${error}`);
  }
}

function getWebviewContent(vulnerabilities: Vulnerability[], summary: any): string {
  const severityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
  };

  const vulnerabilityCards = vulnerabilities.map((vuln, index) => `
    <div class="vulnerability-card" data-index="${index}">
      <div class="vuln-header">
        <span class="severity-badge" style="background-color: ${severityColors[vuln.severity]}">
          ${vuln.severity.toUpperCase()}
        </span>
        <span class="vuln-type">${vuln.type}</span>
      </div>
      <div class="vuln-content">
        <h4>${vuln.description}</h4>
        <p class="file-info">File: ${vuln.file} (Line ${vuln.line})</p>
        <div class="side-by-side-diff">
          <div class="diff-block">
            <h5>Current Code</h5>
            <pre><code>${escapeHtml(vuln.originalCode)}</code></pre>
          </div>
          <div class="diff-block">
            <h5>Suggested Fix</h5>
            <pre><code>${escapeHtml(vuln.fixedCode)}</code></pre>
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-primary" onclick="acceptFix(${index})">Accept</button>
          <button class="btn btn-secondary" onclick="rejectFix(${index})">Reject</button>
          <button class="btn btn-outline" onclick="openFile('${vuln.file}', ${vuln.line}, ${index})">Open File</button>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kavach.ai Security Vulnerabilities</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
        }
        .header {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--vscode-panel-border);
        }
        .summary {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .summary-item {
          background: var(--vscode-editor-inactiveSelectionBackground);
          padding: 10px 15px;
          border-radius: 6px;
          text-align: center;
        }
        .summary-number {
          font-size: 24px;
          font-weight: bold;
        }
        .vulnerability-card {
          background: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 8px;
          margin-bottom: 20px;
          overflow: hidden;
        }
        .vuln-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px 20px;
          background: var(--vscode-editor-inactiveSelectionBackground);
          border-bottom: 1px solid var(--vscode-panel-border);
        }
        .severity-badge {
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .vuln-type {
          font-weight: 500;
          color: var(--vscode-descriptionForeground);
        }
        .vuln-content {
          padding: 20px;
        }
        .vuln-content h4 {
          margin: 0 0 10px 0;
          color: var(--vscode-editor-foreground);
        }
        .file-info {
          color: var(--vscode-descriptionForeground);
          font-size: 14px;
          margin-bottom: 15px;
        }
        .side-by-side-diff {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .diff-block {
          flex: 1;
          background: var(--vscode-editor-inactiveSelectionBackground);
          padding: 15px;
          border-radius: 6px;
        }
        .diff-block h5 {
          margin: 0 0 10px 0;
          color: var(--vscode-editor-foreground);
        }
        .diff-block pre {
          margin: 0;
          overflow-x: auto;
        }
        .diff-block code {
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 13px;
        }
        .actions {
          display: flex;
          gap: 10px;
        }
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-primary {
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
        }
        .btn-primary:hover {
          background: var(--vscode-button-hoverBackground);
        }
        .btn-secondary {
          background: var(--vscode-button-secondaryBackground);
          color: var(--vscode-button-secondaryForeground);
        }
        .btn-secondary:hover {
          background: var(--vscode-button-secondaryHoverBackground);
        }
        .btn-outline {
          background: transparent;
          color: var(--vscode-button-foreground);
          border: 1px solid var(--vscode-button-border);
        }
        .btn-outline:hover {
          background: var(--vscode-button-hoverBackground);
        }
        .no-vulnerabilities {
          text-align: center;
          padding: 40px;
          color: var(--vscode-descriptionForeground);
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Kavach.ai Security Scan Results</h1>
        <div class="summary">
          <div class="summary-item">
            <div class="summary-number">${summary.total}</div>
            <div>Total Issues</div>
          </div>
          <div class="summary-item">
            <div class="summary-number" style="color: #ef4444;">${summary.high}</div>
            <div>High</div>
          </div>
          <div class="summary-item">
            <div class="summary-number" style="color: #f59e0b;">${summary.medium}</div>
            <div>Medium</div>
          </div>
          <div class="summary-item">
            <div class="summary-number" style="color: #10b981;">${summary.low}</div>
            <div>Low</div>
          </div>
        </div>
      </div>
      ${vulnerabilities.length > 0 ? vulnerabilityCards : '<div class="no-vulnerabilities"><h3>🎉 No vulnerabilities found!</h3><p>Your code appears to be secure.</p></div>'}
      <script>
        const vscode = acquireVsCodeApi();
        const vulnerabilities = ${JSON.stringify(vulnerabilities)};
        function acceptFix(index) {
          vscode.postMessage({
            command: 'applyFix',
            vulnerability: vulnerabilities[index]
          });
        }
        function rejectFix(index) {
          vscode.postMessage({
            command: 'rejectFix',
            vulnerability: vulnerabilities[index]
          });
        }
        function openFile(file, line, index) {
          vscode.postMessage({
            command: 'openFile',
            file: file,
            line: line,
            vulnIndex: index
          });
        }
      </script>
    </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function deactivate() {} 