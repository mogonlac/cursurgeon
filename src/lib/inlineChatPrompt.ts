/**
 * Plain text for Cursor chat — no JSON, no internal URLs.
 */
export function buildInlineChatPrompt(userChange: string): string {
  const ask =
    userChange.trim() ||
    'Adjust the highlighted UI so it fits the surrounding layout and design (spacing, alignment, color).';

  return [
    ask,
    '',
    'The attached image is an exact crop from my live preview — change only what’s in that region, not the whole page.',
  ].join('\n');
}
