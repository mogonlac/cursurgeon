# Install Cursurgeon in Cursor (same window — no Extension Development Host)

## 1. Build the `.vsix` once

In the repo root (PowerShell-friendly: run lines one at a time if needed):

```powershell
npm install
npm install --prefix extension
npm run package-vsix
```

You get **`extension/cursurgeon-x.x.x.vsix`** (filename matches `version` in `extension/package.json`).

## 2. Install in Cursor

The **⋯** menu does not always show **Install from VSIX** in Cursor. Use any one of these:

### A. Command Palette (recommended)

1. **Ctrl+Shift+P**
2. Type **`vsix`**
3. Run **Extensions: Install from VSIX…** (wording may vary slightly)
4. Pick `extension\cursurgeon-*.vsix`
5. **Reload** when prompted

### B. Drag and drop

1. Open **Extensions** (`Ctrl+Shift+X`)
2. Drag your `.vsix` file from Explorer onto the Extensions side panel and drop it

### C. Terminal

```powershell
cursor --install-extension "C:\path\to\cursurgeon\extension\cursurgeon-0.4.0.vsix"
```

If `cursor` is not on PATH, use the full executable, for example:

```powershell
& "$env:LOCALAPPDATA\Programs\cursor\Cursor.exe" --install-extension "C:\path\to\extension\cursurgeon-0.4.0.vsix"
```

Then **Reload** if Cursor asks.

## 3. Use it (main window only)

1. Start your app (**`npm run dev`** or similar) so something is on e.g. `http://localhost:5173`.
2. In the **activity bar**, click **Cursurgeon**. The side pane loads a **live iframe** of that URL (change it with **Apply** if needed).
3. Optional: **`preview/sample.html`** — run `npx --yes serve preview` and set the URL Cursurgeon shows (e.g. `http://localhost:3000/sample.html`).
4. **Screenshot** → OS picker: choose the **window or tab** where your preview is visible → **Freeze frame** → drag region → **Send to Cursor chat** / **Copy for chat**.
5. Sidebar on the **right**: Settings → **`workbench.sideBar.location`** → **right**.

You do **not** need F5 or a second “Extension Development Host” window when installed this way.

## Chat integration note

Cursor does not ship a stable public API to inject chat messages. **Send to Cursor chat** copies your text, tries to run known internal commands to focus Agent/Chat, then runs the editor **Paste** action. If your Cursor build uses different command names, use **Copy for chat** and paste manually, and drag the crop image into the composer.

## Rebuild after UI changes

```powershell
npm run package-vsix
```

Then install the new VSIX again (or **Extensions** → Cursurgeon → update from VSIX).
