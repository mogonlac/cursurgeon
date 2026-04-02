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
cursor --install-extension "C:\path\to\cursurgeon\extension\cursurgeon-0.3.0.vsix"
```

If `cursor` is not on PATH, use the full executable, for example:

```powershell
& "$env:LOCALAPPDATA\Programs\cursor\Cursor.exe" --install-extension "C:\path\to\extension\cursurgeon-0.3.0.vsix"
```

Then **Reload** if Cursor asks.

## 3. Use it (main window only)

1. In the **activity bar** (vertical icons), click **Cursurgeon** (chart icon).
2. The **Preview** view opens in the sidebar with the Northwind sample and **Screenshot** flow.
3. To put the sidebar on the **right**: **Settings** → search **`workbench.sideBar.location`** → **right**.
4. After you select a region, use **Send to Cursor chat** (paste + focus chat — see note below) or **Copy for chat**.

You do **not** need F5 or a second “Extension Development Host” window when installed this way.

## Chat integration note

Cursor does not ship a stable public API to inject chat messages. **Send to Cursor chat** copies your text, tries to run known internal commands to focus Agent/Chat, then runs the editor **Paste** action. If your Cursor build uses different command names, use **Copy for chat** and paste manually, and drag the crop image into the composer.

## Rebuild after UI changes

```powershell
npm run package-vsix
```

Then install the new VSIX again (or **Extensions** → Cursurgeon → update from VSIX).
