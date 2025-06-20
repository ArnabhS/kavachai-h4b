"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
function activate(context) {
    // Command to enter API key
    context.subscriptions.push(vscode.commands.registerCommand('kadakai.enterApiKey', async () => {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Kadakai API key',
            ignoreFocusOut: true,
            password: true,
        });
        if (apiKey) {
            await context.secrets.store('kadakaiApiKey', apiKey);
            vscode.window.showInformationMessage('API key saved!');
        }
    }));
    // On activation, check if API key exists, else prompt
    context.secrets.get('kadakaiApiKey').then((key) => {
        if (!key) {
            vscode.commands.executeCommand('kadakai.enterApiKey');
        }
    });
    // Output channel for results
    const outputChannel = vscode.window.createOutputChannel('Kadakai Scan Results');
    // Scan Workspace command
    context.subscriptions.push(vscode.commands.registerCommand('kadakai.scanWorkspace', async () => {
        const apiKey = await context.secrets.get('kadakaiApiKey');
        if (!apiKey) {
            vscode.window.showErrorMessage('Kadakai API key not set. Please run "Kadakai: Enter API Key".');
            return;
        }
        // Get all files matching extensions
        const files = await vscode.workspace.findFiles('**/*.{js,ts,sol,html}', '**/node_modules/**');
        if (files.length === 0) {
            vscode.window.showInformationMessage('No relevant files found in workspace.');
            return;
        }
        // Read file contents (limit size for demo)
        const fileContents = [];
        for (const file of files) {
            try {
                const content = fs.readFileSync(file.fsPath, 'utf8');
                fileContents.push({ file: path.basename(file.fsPath), content: content.slice(0, 10000) }); // limit to 10k chars
            }
            catch {
                // skip unreadable files
            }
        }
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Kadakai: Scanning workspace...'
        }, async () => {
            try {
                // TODO: Set your backend URL here
                const backendUrl = 'http://localhost:3000/api/scan-code';
                const res = await (0, node_fetch_1.default)(backendUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({ files: fileContents })
                });
                const result = await res.json();
                outputChannel.clear();
                outputChannel.appendLine('Scan Results:');
                outputChannel.appendLine(JSON.stringify(result, null, 2));
                outputChannel.show();
                vscode.window.showInformationMessage('Kadakai scan complete! See output panel for results.');
            }
            catch (err) {
                vscode.window.showErrorMessage('Kadakai scan failed: ' + err);
            }
        });
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map