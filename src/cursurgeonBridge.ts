declare global {
  interface Window {
    /** Injected by the Cursurgeon VS Code/Cursor extension webview only. */
    cursurgeon?: { post: (msg: unknown) => void };
  }
}

export function isCursurgeonHost(): boolean {
  return typeof window !== 'undefined' && typeof window.cursurgeon?.post === 'function';
}

export function postSendToChat(text: string): void {
  window.cursurgeon?.post({ type: 'sendToChat', text });
}
