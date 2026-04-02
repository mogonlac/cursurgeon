import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('cursurgeon.openPanel', () => {
      openEmbeddedDemo(context, '/workspace');
    }),
    vscode.commands.registerCommand('cursurgeon.openSimpleBrowser', () => {
      const url = 'http://localhost:5173/#/workspace';
      void vscode.commands.executeCommand('simpleBrowser.show', url);
    }),
  );
}

function openEmbeddedDemo(context: vscode.ExtensionContext, hash: string) {
  const indexFsPath = path.join(context.extensionPath, 'media', 'index.html');
  if (!fs.existsSync(indexFsPath)) {
    void vscode.window.showErrorMessage(
      'Cursurgeon media missing. From repo root run: npm install && npm run bundle-extension — then reload the window.',
    );
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    'cursurgeon',
    'Cursurgeon · Surgical demo',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')],
    },
  );

  const mediaUri = vscode.Uri.joinPath(context.extensionUri, 'media');
  let html = fs.readFileSync(indexFsPath, 'utf8');

  html = html.replace(/(href|src)="(\.\/)?assets\/([^"]+)"/g, (_m, attr: string, _dot: string, file: string) => {
    const uri = panel.webview.asWebviewUri(vscode.Uri.joinPath(mediaUri, 'assets', file));
    return `${attr}="${uri}"`;
  });

  const injectHash = `<script>window.location.hash=${JSON.stringify(hash)};<\/script>`;
  html = html.replace('<body>', `<body>${injectHash}`);

  panel.webview.html = html;
}

export function deactivate() {}
