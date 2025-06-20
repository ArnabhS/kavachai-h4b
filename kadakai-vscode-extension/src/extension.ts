import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import fetch from 'node-fetch';

export function activate(context: vscode.ExtensionContext) {
  // Command to enter API key
  context.subscriptions.push(
    vscode.commands.registerCommand('kadakai.enterApiKey', async () => {
      const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your Kadakai API key',
        ignoreFocusOut: true,
        password: true,
      });
      if (apiKey) {
        await context.secrets.store('kadakaiApiKey', apiKey);
        vscode.window.showInformationMessage('API key saved!');
      }
    })
  );

  // On activation, check if API key exists, else prompt
  context.secrets.get('kadakaiApiKey').then((key: string | undefined) => {
    if (!key) {
      vscode.commands.executeCommand('kadakai.enterApiKey');
    }
  });

  // Output channel for results
  const outputChannel = vscode.window.createOutputChannel('Kadakai Scan Results');

  // Scan Workspace command
  context.subscriptions.push(
    vscode.commands.registerCommand('kadakai.scanWorkspace', async () => {
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
      const fileContents: { file: string; content: string }[] = [];
      for (const file of files) {
        try {
          const content = fs.readFileSync(file.fsPath, 'utf8');
          fileContents.push({ file: path.basename(file.fsPath), content: content.slice(0, 10000) }); // limit to 10k chars
        } catch {
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
          const res = await fetch(backendUrl, {
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
        } catch (err) {
          vscode.window.showErrorMessage('Kadakai scan failed: ' + err);
        }
      });
    })
  );
}

export function deactivate() {} 