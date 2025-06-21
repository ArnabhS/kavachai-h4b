# Changelog

All notable changes to the "Kadakai White Hat Agent" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release
- Multi-language vulnerability scanning (JavaScript, TypeScript, HTML, Solidity)
- API key validation and management
- Real-time workspace scanning
- Severity-based issue reporting
- Line-level vulnerability detection
- Integration with Kadakai web app backend

### Features
- **JavaScript/TypeScript Scanning**: Detects eval usage, XSS vulnerabilities, password storage issues
- **HTML Security**: Identifies inline scripts, event handlers, CSP issues
- **Solidity Analysis**: Finds reentrancy risks, delegatecall usage, timestamp dependencies
- **API Integration**: Secure connection to Kadakai backend for enhanced scanning

### Technical
- VS Code extension with TypeScript
- Node.js backend integration
- MongoDB for API key storage
- Real-time file analysis
- Comprehensive error handling

## [0.0.1] - 2024-01-15

### Added
- Initial beta release
- Basic vulnerability scanning functionality
- API key management system
- VS Code integration

---

## Version History

- **0.0.1**: Initial beta release with core scanning features 