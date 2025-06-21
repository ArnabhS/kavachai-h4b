# Kavach.ai VS Code Extension - Interactive Security Scanner

## Overview

The Kavach.ai VS Code extension now provides **interactive code editing capabilities** with accept/reject options for security vulnerabilities, replacing the previous JSON-only output panel.

## New Features

### 🎯 Interactive Vulnerability Panel
- **Visual Security Dashboard**: Beautiful webview panel showing all detected vulnerabilities
- **Severity-based Color Coding**: High (red), Medium (yellow), Low (green) severity indicators
- **Code Comparison**: Side-by-side view of original vs. suggested fixed code
- **One-Click Fixes**: Apply security fixes directly to your code
- **File Navigation**: Jump directly to vulnerable lines in your code

### 🔧 Direct Code Editing
- **Apply Fix**: Automatically apply the suggested security fix to your code
- **Reject Fix**: Mark vulnerabilities as reviewed but not applied
- **Open File**: Navigate directly to the vulnerable line in your editor
- **Real-time Updates**: See changes applied immediately in your editor

## How to Use

### 1. Install and Setup
```bash
# Install the extension
code --install-extension kadakai-vscode-extension/kavachai-white-hat-agent-0.0.1.vsix

# Or install from VS Code marketplace (when published)
# Search for "Kavach.ai White Hat Agent"
```

### 2. Configure API Key
1. Open VS Code Command Palette (`Ctrl+Shift+P`)
2. Run `KavachAi: Enter API Key`
3. Enter your Kavach.ai API key
4. The key will be validated and stored securely

### 3. Scan Your Workspace
1. Open Command Palette (`Ctrl+Shift+P`)
2. Run `Kavach.Ai: Scan Workspace for Vulnerabilities`
3. Wait for the scan to complete
4. The **Interactive Vulnerability Panel** will open automatically

## Interactive Panel Features

### 📊 Security Summary
- Total number of vulnerabilities found
- Breakdown by severity (High, Medium, Low)
- Quick overview of security posture

### 🎨 Vulnerability Cards
Each vulnerability is displayed in a card with:

```
┌─────────────────────────────────────────────────────────┐
│ [HIGH] eval-usage                    File: app.js (Line 5) │
├─────────────────────────────────────────────────────────┤
│ Use of eval() is dangerous and can lead to code injection │
│                                                         │
│ Original Code:    │ Suggested Fix:                     │
│ eval(userInput);  │ // FIXED: Replace eval() with      │
│                   │ // safer alternative               │
│                                                         │
│ [Apply Fix] [Reject] [Open File]                       │
└─────────────────────────────────────────────────────────┘
```

### 🔄 Action Buttons
- **Apply Fix**: Automatically replace the vulnerable code with the suggested fix
- **Reject**: Mark as reviewed but keep original code
- **Open File**: Navigate to the exact line in your editor

## Supported Languages

The extension scans for vulnerabilities in:
- **JavaScript/TypeScript** (.js, .ts)
- **Solidity** (.sol) - Smart contracts
- **HTML** (.html)
- **Python** (.py)
- **Java** (.java)
- **PHP** (.php)
- **Ruby** (.rb)
- **Go** (.go)
- **Rust** (.rs)
- **C/C++** (.cpp, .c)
- **C#** (.cs)

## Vulnerability Types Detected

### JavaScript/TypeScript
- `eval()` usage (Critical)
- `innerHTML` assignments (High)
- `document.write()` calls (High)
- Password storage in localStorage (Critical)
- Password logging (High)
- Environment variable exposure (Medium)
- External script loading (Medium)

### Smart Contracts (Solidity)
- Reentrancy vulnerabilities (Critical)
- Low-level calls (High)
- `delegatecall` usage (Critical)
- Timestamp dependencies (Medium)
- Block number dependencies (Medium)

### Other Languages
- Command injection patterns
- SQL injection risks
- File system vulnerabilities
- Input validation issues

## Example Workflow

1. **Scan Workspace**: Run the scan command
2. **Review Panel**: Examine vulnerabilities in the interactive panel
3. **Apply Critical Fixes**: Click "Apply Fix" for high-severity issues
4. **Review Medium/Low**: Manually review and decide on each
5. **Navigate to Code**: Use "Open File" to examine context
6. **Iterate**: Re-scan after applying fixes

## Configuration

### Backend URL
Update the backend URL in `src/extension.ts`:
```typescript
const BACKEND_URL = 'http://localhost:3000'; // Change to your backend
```

### File Size Limits
Files are limited to 10,000 characters for performance. Adjust in `extension.ts`:
```typescript
content: content.slice(0, 10000) // Increase if needed
```

## Troubleshooting

### Common Issues

1. **API Key Not Set**
   - Run `KavachAi: Enter API Key` command
   - Ensure your backend is running

2. **No Vulnerabilities Found**
   - Check that your files have supported extensions
   - Verify file content contains actual code

3. **Fix Not Applied**
   - Ensure file is not read-only
   - Check file permissions
   - Verify file path resolution

4. **Panel Not Opening**
   - Check VS Code console for errors
   - Ensure webview permissions are enabled

### Debug Mode
Enable debug logging by setting:
```typescript
// In extension.ts
const DEBUG = true;
```

## Security Notes

- API keys are stored securely using VS Code's secrets storage
- No code is sent to external services without your API key
- All scanning happens locally with results sent to your backend
- Suggested fixes are generated based on security best practices

## Contributing

To add new vulnerability patterns:

1. Add patterns to the appropriate language array in `route.ts`
2. Include `suggestion` and `fix` functions
3. Test with sample vulnerable code
4. Update this documentation

## Next Steps

- [ ] Add more language support
- [ ] Implement custom fix suggestions
- [ ] Add vulnerability explanations
- [ ] Support for custom security rules
- [ ] Integration with CI/CD pipelines

---

**Happy Secure Coding! 🛡️** 