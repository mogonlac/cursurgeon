import * as vscode from 'vscode';

/** Cursor/VS Code chat is not a stable public API — try known command ids, then paste from clipboard. */
export async function sendPromptToCursorChat(text: string): Promise<void> {
  await vscode.env.clipboard.writeText(text);

  const openChatCommands = [
    'aichat.show-ai-chat',
    'workbench.action.chat.open',
    'workbench.action.chat.toggle',
    'workbench.action.quickchat.toggle',
    'cursor.chat.focus',
    'cursor.showChat',
    'composer.focusComposer',
    'composer.openComposer',
    'aichat.newchataction',
  ];

  let opened = false;
  for (const cmd of openChatCommands) {
    try {
      await vscode.commands.executeCommand(cmd);
      opened = true;
      break;
    } catch {
      // command not registered in this host
    }
  }

  await delay(380);

  try {
    await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
  } catch {
    try {
      await vscode.commands.executeCommand('paste');
    } catch {
      // ignore
    }
  }

  if (opened) {
    void vscode.window.showInformationMessage(
      'Cursurgeon: pasted into chat. If the crop image is missing, drag it from the preview panel into the composer.',
    );
  } else {
    void vscode.window.showWarningMessage(
      'Cursurgeon: could not open chat automatically — open Agent/Chat, then paste (Ctrl+V).',
    );
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
