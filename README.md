# Cursurgeon

**Surgical prompting for Cursor** — **Screenshot** on a live preview, drag the region you care about, then copy a **plain chat message** plus the crop for the model. No JSON forms or internal URLs in what you paste.

This repo includes:

- **Pitch site** (`#/`) — hackathon narrative, track fit, judge path
- **Live demo** (`#/demo`) — two-column flow + **Northwind** sample landing
- **Panel layout** (`#/workspace`) — compact layout for a narrow column (side panel or video)
- **Cursor / VS Code extension** (`extension/`) — **Cursurgeon** side pane: **live iframe** to your dev server + **Screenshot** (screen capture) → crop → **inline prompt** for chat

Routing uses the **hash** (`#/demo`, `#/workspace`) so static deploys (Vercel, GitHub Pages) need no server rewrites.

## Plug into Cursor (side panel)

1. Clone the repo and install (pick one):

   **Easiest (one command, works in PowerShell 5)** — npm runs the sub-steps in cmd, so you avoid `&&` issues in the shell:

   ```bash
   npm run setup
   ```

   **Manual:**

   ```bash
   npm install
   npm install --prefix extension
   npm run compile-extension
   npm run bundle-extension
   ```

   **Windows PowerShell 5:** if you type commands yourself, don’t use `&&` between commands (use separate lines or `;`). Or rely on `npm run setup` above.

   This installs deps, compiles the extension, builds the web app, and copies `dist/` → `extension/media/`.

2. In **Cursor**, open this repo folder.
3. **Run and Debug** → **Run Cursurgeon extension** (F5). An **[Extension Development Host]** window opens.
4. In that window: **Command Palette** → **Cursurgeon: Open surgical demo (side panel)**.
5. Drag the webview tab into the **right** editor group — code on the left, sample site + surgical flow on the right.

**Alternative (no extension):** run `npm run dev`, then Command Palette → **Cursurgeon: Open demo in Simple Browser** (from a normal window with the extension loaded) — requires dev server on port 5173.

Full recording steps: [DEMO.md](./DEMO.md). **If “Run” seems to do nothing:** read [RUN_IN_CURSOR.md](./RUN_IN_CURSOR.md) (second window + Command Palette).

## Try locally (browser only)

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — **Live demo** or **Panel layout**.

## Build & public demo URL

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder. Use these URLs in submissions and recordings:

- Pitch: `https://YOUR_HOST/#/`
- Demo: `https://YOUR_HOST/#/demo`
- Panel: `https://YOUR_HOST/#/workspace`

## Install the `.vsix` (recommended — **same Cursor window**, sidebar preview)

From repo root:

```bash
npm run package-vsix
```

Install **`extension/cursurgeon-*.vsix`** via **Extensions** → **⋯** → **Install from VSIX…**, then reload. Click the **Cursurgeon** icon in the activity bar to open **Preview**.

Step-by-step: [INSTALL_VSIX.md](./INSTALL_VSIX.md).

Debug builds (F5) still use a separate Extension Development Host — only needed while hacking the extension.

## Product thesis

- **Native Cursor (target UX):** inline prompt beside the screenshot; **Enter** starts the agent.
- **Hackathon track:** **Agent Runtime Tools** — runtime affordance for spatial, multimodal context.

## Submission

- **GitHub:** [github.com/mogonlac/cursurgeon](https://github.com/mogonlac/cursurgeon)
- **Main track:** Agent Runtime Tools
- **Demo URL:** your deployed origin with `#/demo` or `#/workspace`

## License

MIT
