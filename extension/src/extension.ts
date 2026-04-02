import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { buildWebviewHtml } from './webviewHtml';
import { sendPromptToCursorChat } from './sendToCursorChat';

function getPreviewUrl(): string {
  return vscode.workspace.getConfiguration('cursurgeon').get<string>('previewUrl', 'http://localhost:5173') ?? 'http://localhost:5173';
}

export function activate(context: vscode.ExtensionContext) {
  const disposableView = vscode.window.registerWebviewViewProvider(
    'cursurgeon.preview',
    new CursurgeonWebviewViewProvider(context),
    { webviewOptions: { retainContextWhenHidden: true } },
  );

  context.subscriptions.push(
    disposableView,
    vscode.commands.registerCommand('cursurgeon.openPanel', () => openEditorWebviewPanel(context)),
    vscode.commands.registerCommand('cursurgeon.openSimpleBrowser', () => {
      void vscode.commands.executeCommand('simpleBrowser.show', getPreviewUrl());
    }),
    vscode.commands.registerCommand('cursurgeon.focusPreview', () =>
      vscode.commands.executeCommand('cursurgeon.preview.focus').then(undefined, () =>
        vscode.window.showWarningMessage('Open the Cursurgeon icon in the activity bar first.'),
      ),
    ),
  );
}

class CursurgeonWebviewViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    const { webview } = webviewView;
    webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')],
    };

    const previewUrl = getPreviewUrl();
    webview.html = buildWebviewHtml(webview, this.context.extensionUri, this.context.extensionPath, '/embed', previewUrl);

    webview.onDidReceiveMessage((msg: { type?: string; text?: string; url?: string }) => {
      if (msg?.type === 'sendToChat' && typeof msg.text === 'string') {
        void sendPromptToCursorChat(msg.text);
      }
      if (msg?.type === 'setPreviewUrl' && typeof msg.url === 'string') {
        void vscode.workspace
          .getConfiguration('cursurgeon')
          .update('previewUrl', msg.url, vscode.ConfigurationTarget.Workspace);
      }
    });
  }
}

function openEditorWebviewPanel(context: vscode.ExtensionContext): void {
  const indexFsPath = path.join(context.extensionPath, 'media', 'index.html');
  if (!fs.existsSync(indexFsPath)) {
    void vscode.window.showErrorMessage('Cursurgeon media missing. Run: npm run setup — then reload the window.');
    return;
  }

  const panel = vscode.window.createWebviewPanel('cursurgeon', 'Cursurgeon', vscode.ViewColumn.Beside, {
    enableScripts: true,
    retainContextWhenHidden: true,
    localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')],
  });

  const previewUrl = getPreviewUrl();
  panel.webview.html = buildWebviewHtml(panel.webview, context.extensionUri, context.extensionPath, '/embed', previewUrl);

  panel.webview.onDidReceiveMessage((msg: { type?: string; text?: string; url?: string }) => {
    if (msg?.type === 'sendToChat' && typeof msg.text === 'string') {
      void sendPromptToCursorChat(msg.text);
    }
    if (msg?.type === 'setPreviewUrl' && typeof msg.url === 'string') {
      void vscode.workspace
        .getConfiguration('cursurgeon')
        .update('previewUrl', msg.url, vscode.ConfigurationTarget.Workspace);
    }
  });
}

export function deactivate() {}
