# KavachAI - Your AI-Powered Cybersecurity Partner

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-purple.svg)

**KavachAI is an intelligent, multi-faceted security platform designed to make modern development safe and secure. In the era of "vibe coding," where speed and aesthetics often compromise security, KavachAI acts as your AI-powered cybersecurity co-pilot, integrating seamlessly into your workflow to detect and fix vulnerabilities in real-time.**

From web applications and smart contracts to your local development environment, KavachAI leverages the power of **Google's Gemini AI** to provide deep, context-aware security analysis, intelligent code fixes, and proactive threat detection.

---

## 🎥 Demo Video

**[Watch our 2-minute demo video here to see KavachAI in action!](https://www.loom.com/share/e119755fa000402ea9a3f2a3674fa5a1?sid=6c065464-a6ec-4b12-ba34-d8ad0f4313f3)**

---

## 🛡️ The Problem: The "Vibe Coding" Security Crisis

Modern development prioritizes speed. While this accelerates innovation, it often leaves critical security gaps:
*   **Rapid Development:** Fast-paced coding introduces vulnerabilities that are missed by traditional tools.
*   **AI-Assisted Coding without Oversight:** Tools like GitHub Copilot are fantastic for productivity but can generate insecure code.
*   **Lack of Security Expertise:** Developers are expected to be security experts, which is an unrealistic burden.
*   **False Positives:** Traditional security scanners flood developers with irrelevant warnings, leading to alert fatigue.

## ✨ The Solution: KavachAI - Cursor for Cybersecurity

KavachAI is not just another linter. It's a comprehensive security platform that understands your code. By integrating Gemini AI, we provide a **"Cursor for Cybersecurity"**—an intelligent assistant that makes security an intuitive part of your development process.

**Key Features:**
*   **🧠 AI-Powered Analysis:** Goes beyond simple pattern matching to understand code context and logic, powered by Gemini.
*   **🎯 False Positive Reduction:** Our AI validation layer critically reviews findings to eliminate noise and only report real threats.
*   **💡 Intelligent Code Fixes:** Get meaningful, context-aware code suggestions that fix the root cause of vulnerabilities.
*   **🌐 Multi-Platform Security:** Secure your entire technology stack: web applications, smart contracts, wallets, and your local code editor.
*   **🔒 Secure by Default:** Seamlessly integrates into your workflow, making security the default, not an afterthought.

---

## 🖼️ Screenshots

**Centralized Security Dashboard**
*A unified view of your project's security posture.*
![Dashboard Screenshot](/src/assets/webscrap.png) 

**Real-time Scanning in VS Code**
*Vulnerabilities detected and fixed directly in your editor.*
![VS Code Extension Screenshot](/src/assets/extension.png)

---

## 🚀 Core Components

### 1. Security Dashboard
A centralized hub to monitor the security posture of all your digital assets.
*   **Real-time Stats:** View completed scans, vulnerabilities found, and security trends.
*   **Comprehensive Scanning Tools:** Access scanners for web applications, smart contracts, and wallet security.
*   **Audit Logs:** Keep track of all security scans and activities.

### 2. VS Code Extension: Real-time Code Security
Bring the power of KavachAI directly into your code editor.
*   **Live Scanning:** Detects vulnerabilities in your code as you type.
*   **One-Click Fixes:** Apply AI-generated security fixes without leaving your editor.
*   **Security Linting:** Get intelligent feedback on security best practices.
*   **Multi-Language Support:** Secure code across JavaScript, Python, Solidity, Go, Rust, and more.

#### **Installation**
1.  Launch VS Code.
2.  Go to the Extensions view (`Ctrl+Shift+X`).
3.  Search for "**KavachAI**".
4.  Click **Install**.
5.  Configure your API key in the extension settings.

### 3. AI-Powered Scanners

#### Web Application Scanner
*   **Deep Vulnerability Detection:** Finds XSS, SQL Injection, CSRF, and other common web vulnerabilities.
*   **Auto-Fix Generation:** Provides exact code snippets to patch security holes.
*   **Best Practice Auditing:** Ensures your web app follows modern security standards.

#### Smart Contract Scanner
*   **Advanced Auditing:** Detects reentrancy, integer overflows, and other critical smart contract bugs.
*   **Gas Optimization:** AI provides suggestions to make your contracts more efficient.
*   **Solidity Best Practices:** Ensures your contracts are secure and optimized.

---

## 🛠️ Technology Stack

*   **Framework:** Next.js
*   **AI Engine:** Google Gemini Pro
*   **Styling:** Tailwind CSS
*   **Authentication:** Civic Pass
*   **Database:** MongoDB
*   **Deployment:** Vercel

---

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
*   Node.js (v18 or later)
*   npm or yarn
*   A Gemini API Key

### Installation & Setup

1.  **Clone the repo:**
    ```sh
    git clone https://github.com/ArnabhS/kavachai-h4b
    cd kavachai
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up your environment variables:**
    Create a `.env.local` file in the root of the project and add your API keys:
    ```
    GEMINI_API_KEY=your_gemini_api_key
    MONGODB_URI=your_mongodb_connection_string
    CIVIC_AUTH_API_KEY=your_api_key
    ETHERSCAN_API_KEY=your_api_key
    POLYGONSCAN_API_KEY=your_api_key
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
