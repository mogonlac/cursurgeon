# Demo video script (~90s)

**Setup (before record):** `npm install` at repo root and `npm install` in `extension/`. Run `npm run bundle-extension` once so `extension/media/` exists.

## Path A — Side panel (best “native Cursor” look)

1. Open this repo in **Cursor**.
2. **Run and Debug** → **Run Cursurgeon extension** (or F5). A new `[Extension Development Host]` window opens.
3. In that window: Command Palette → **Cursurgeon: Open surgical demo (side panel)**.
4. Dock the new tab to the **right** editor group (drag tab title).
5. **Left:** your code or this README. **Right:** Northwind sample site + capture flow.
6. Click **Capture screenshot** → drag a box around **Start free trial** → **Copy prompt text**.
7. Paste into Cursor chat, attach the cropped PNG from the panel (screenshot the crop or save from devtools if needed for video).

## Path B — Browser + public URL (for judges)

1. Deploy `dist` (e.g. Vercel) or run `npm run dev`.
2. Open `https://YOUR_URL/#/demo` (full nav) or `https://YOUR_URL/#/workspace` (compact panel layout).
3. Same capture → crop → copy flow.

## One-liner pitch

> “Cursurgeon captures your preview, you draw a rectangle on the pixels, and it emits a surgical JSON block plus crop so the agent edits the right control — not the whole page.”
