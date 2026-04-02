import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';

export function buildWebviewHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  extensionPath: string,
  hash: string,
  previewUrl: string,
): string {
  const indexFsPath = path.join(extensionPath, 'media', 'index.html');
  if (!fs.existsSync(indexFsPath)) {
    return `<body><p>Run from repo: <code>npm run setup</code> then reload.</p></body>`;
  }

  const mediaUri = vscode.Uri.joinPath(extensionUri, 'media');
  let html = fs.readFileSync(indexFsPath, 'utf8');

  html = html.replace(/(href|src)="(\.\/)?assets\/([^"]+)"/g, (_m, attr: string, _dot: string, file: string) => {
    const uri = webview.asWebviewUri(vscode.Uri.joinPath(mediaUri, 'assets', file));
    return `${attr}="${uri}"`;
  });

  const bridge = `<script>(function(){var v=acquireVsCodeApi();window.cursurgeon={post:function(m){return v.postMessage(m)}};})();<\/script>`;
  const boot = `<script>window.__CURSURGEON__=${JSON.stringify({ previewUrl })};<\/script>`;
  const route = `<script>window.location.hash=${JSON.stringify(hash)};<\/script>`;
  html = html.replace('<body>', `<body>${bridge}${boot}${route}`);
  return html;
}
