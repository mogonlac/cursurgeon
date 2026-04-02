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
cursor --install-extension "C:\path\to\cursurgeon\extension\cursurgeon-0.4.2.vsix"
```

If `cursor` is not on PATH, use the full executable, for example:

```powershell
& "$env:LOCALAPPDATA\Programs\cursor\Cursor.exe" --install-extension "C:\path\to\extension\cursurgeon-0.4.2.vsix"
```

Then **Reload** if Cursor asks.

## 3. Don’t see the Cursurgeon icon — or “cursurgeon” shows nothing?

### Command Palette (very common in Cursor)

Cursor often treats the palette as **quick open** first. **Type `>` (greater-than) to switch to commands**, then type **`cursurgeon`**. You should see entries like **Cursurgeon: Open side pane (if icon missing)**.

If the palette already shows **`>`** at the start of the input, just type **`cursurgeon`** after it.

### Extensions list

The marketplace search does **not** list this repo until it is published; that is normal. To confirm the VSIX is installed: **Ctrl+Shift+X** → in the search box type **`@installed cursurgeon`** (or **`mogonlac.cursurgeon`**). It must show **Enabled**.

### Open the pane and reload

1. **Ctrl+Shift+P** → **`>`** → **Cursurgeon: Open side pane (if icon missing)** — opens the view even when the activity bar is crowded.
2. **Ctrl+Shift+P** → **Developer: Reload Window** after installing a new VSIX.

Still broken? **Ctrl+Shift+P** → **Developer: Show Running Extensions** and check whether **`mogonlac.cursurgeon`** appears. If it is missing, Cursor did not load the extension (try reinstalling the VSIX with **`--force`**).

If the activity bar is hidden or compressed, use **View → Appearance → Activity Bar** and check the overflow (**⋯**) at the top/bottom of the bar for extra icons.

## 4. Use it (main window only)

1. Start your app (**`npm run dev`** or similar) so something is on e.g. `http://localhost:5173`.
2. In the **activity bar**, click **Cursurgeon**. The side pane loads a **live iframe** of that URL (change it with **Apply** if needed).
3. Optional: **`preview/sample.html`** — run `npx --yes serve preview` and set the URL Cursurgeon shows (e.g. `http://localhost:3000/sample.html`).
4. **Screenshot** → OS picker: choose the **window or tab** where your preview is visible → **Freeze frame** → drag region → **Send to Cursor chat** / **Copy for chat**.
5. Sidebar on the **right**: Settings → **`workbench.sideBar.location`** → **right**.

You do **not** need F5 or a second “Extension Development Host” window when installed this way.

## Screen capture / `display-capture` (Permissions-Policy)

Workbench webviews use a **sandboxed iframe** whose `allow=` list is built into **Cursor/VS Code** (next to `clipboard-read` / `clipboard-write`). If **`display-capture`** is missing, **Screenshot** fails with a permissions-policy error. **Extension code cannot change that list** — only the host app can.

### Fix on your machine (Cursor, Windows)

Close Cursor, then from this repo run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\patch-cursor-webview-display-capture.ps1
```

That edits Cursor’s installed `…\webview\browser\pre\index.html` to add **`display-capture;`** to the iframe `allow` rules (same change VS Code would need upstream). Restart Cursor. **Cursor updates may overwrite the file** — run the script again if Screenshot breaks after an update.

### Upstream

The proper long-term fix is for **Cursor / VS Code** to ship this in `src/vs/workbench/contrib/webview/browser/pre/index.html`. Until then, the script above is the practical workaround; you can also use **Import image** / **paste** or a normal browser (`RUN_IN_CURSOR.md`).

## Chat integration note

Cursor does not ship a stable public API to inject chat messages. **Send to Cursor chat** copies your text, tries to run known internal commands to focus Agent/Chat, then runs the editor **Paste** action. If your Cursor build uses different command names, use **Copy for chat** and paste manually, and drag the crop image into the composer.

## Rebuild after UI changes

```powershell
npm run package-vsix
```

Then install the new VSIX again (or **Extensions** → Cursurgeon → update from VSIX).
