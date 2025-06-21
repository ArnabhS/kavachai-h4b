# Kadakai White Hat Agent

A powerful VS Code extension for scanning Web2 and Web3 code for security vulnerabilities. Integrates seamlessly with the Kadakai web app for advanced security analysis.

## 🛡️ Features

- **Multi-language Support**: Scan JavaScript, TypeScript, HTML, and Solidity files
- **Real-time Vulnerability Detection**: Identify security issues as you code
- **Severity-based Reporting**: Critical, High, Medium, and Low priority issues
- **Line-level Analysis**: See exactly where vulnerabilities are located
- **Web3 Security**: Specialized scanning for smart contracts and blockchain code
- **API Integration**: Connect to your Kadakai web app account for enhanced features

## 🚀 Installation

1. **From VS Code Marketplace:**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Kadakai White Hat Agent"
   - Click Install

2. **Manual Installation:**
   - Download the `.vsix` file from releases
   - In VS Code: Extensions → Install from VSIX
   - Select the downloaded file

## 📋 Requirements

- VS Code 1.70.0 or higher
- Kadakai web app account (for API key)
- Internet connection for backend integration

## 🔧 Setup

1. **Get Your API Key:**
   - Sign up at [Kadakai Web App](https://your-app-url.com)
   - Go to Dashboard → VS Code Extension API Key
   - Copy your API key

2. **Configure the Extension:**
   - Open VS Code Command Palette (Ctrl+Shift+P)
   - Run "Kadakai: Enter API Key"
   - Paste your API key when prompted

## 💻 Usage

### Scan Your Workspace
1. Open a project folder in VS Code
2. Press `Ctrl+Shift+P` to open Command Palette
3. Run "Kadakai: Scan Workspace for Vulnerabilities"
4. View results in the "Kadakai Scan Results" output panel

### Supported File Types
- **JavaScript (.js)**: XSS, eval usage, localStorage security
- **TypeScript (.ts)**: Same as JavaScript plus type safety issues
- **HTML (.html)**: Inline scripts, event handlers, CSP issues
- **Solidity (.sol)**: Reentrancy, delegatecall, timestamp dependencies

## 🔍 Vulnerability Types

### JavaScript/TypeScript
- **Critical**: `eval()` usage, password storage in localStorage
- **High**: `innerHTML`, `document.write()`, password logging
- **Medium**: Environment variable exposure, external scripts

### HTML
- **High**: Inline scripts, missing CSP
- **Medium**: Inline event handlers, iframe security
- **Low**: Form security reminders

### Solidity
- **Critical**: Reentrancy risks, `delegatecall`, `selfdestruct`
- **High**: Low-level calls, transfer without checks
- **Medium**: `block.timestamp`, `block.number` dependencies

## 📊 Sample Output

```json
{
  "results": [
    {
      "file": "app.js",
      "issues": [
        {
          "type": "eval-usage",
          "severity": "critical",
          "message": "Use of eval() is dangerous and can lead to code injection",
          "line": 15,
          "code": "eval(userInput);"
        }
      ],
      "summary": {
        "total": 1,
        "critical": 1,
        "high": 0,
        "medium": 0,
        "low": 0
      }
    }
  ],
  "summary": {
    "total": 5,
    "critical": 2,
    "high": 1,
    "medium": 1,
    "low": 1
  }
}
```

## 🔧 Configuration

### Backend URL
Update the backend URL in the extension if you're using a custom deployment:
1. Open `src/extension.ts`
2. Change `BACKEND_URL` to your server URL
3. Rebuild the extension

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/yourusername/kadakai-vscode-extension.git
cd kadakai-vscode-extension
npm install
npm run compile
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/kadakai-vscode-extension/issues)
- **Documentation**: [Kadakai Docs](https://docs.kadakai.com)
- **Email**: support@kadakai.com

## 🔗 Links

- [Kadakai Web App](https://your-app-url.com)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=kadakai.kadakai-white-hat-agent)
- [GitHub Repository](https://github.com/yourusername/kadakai-vscode-extension)

## ⭐ Star Us

If you find this extension helpful, please give us a star on GitHub!

---

**Made with ❤️ by the Kadakai Team** 