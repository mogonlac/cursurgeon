/**
 * Copy Vite dist/ into extension/media/ for packaged webview assets.
 */
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');
const media = join(__dirname, 'media');

if (!existsSync(dist)) {
  console.error('Missing dist/. Run: npm run build');
  process.exit(1);
}

rmSync(media, { recursive: true, force: true });
mkdirSync(media, { recursive: true });
cpSync(dist, media, { recursive: true });
console.log('Copied dist/ → extension/media/');
