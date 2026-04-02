export type Bbox = { x: number; y: number; width: number; height: number };

export type SurgicalBundle = {
  preview_url: string;
  route: string;
  bbox: Bbox;
  viewport?: { width: number; height: number };
  intent: string;
  /** ISO timestamp */
  captured_at: string;
};

export function buildSurgicalPrompt(bundle: SurgicalBundle): string {
  const front = {
    kind: 'cursurgeon/surgical-prompt',
    v: 1,
    preview_url: bundle.preview_url,
    route: bundle.route,
    bbox: bundle.bbox,
    viewport: bundle.viewport,
    captured_at: bundle.captured_at,
  };

  return [
    '```surgical',
    JSON.stringify(front, null, 2),
    '```',
    '',
    '### Intent',
    bundle.intent.trim() || '(describe the change you want)',
    '',
    '### Instructions for the agent',
    '- Edit only the UI region corresponding to the **cropped screenshot** (bbox above, preview URL for context).',
    '- Prefer the smallest change: one component or stylesheet, not a full page rewrite.',
    '- If ambiguous, use route + bbox to disambiguate.',
    '',
    '_Attachment: include the cropped image with this prompt in Cursor._',
  ].join('\n');
}
