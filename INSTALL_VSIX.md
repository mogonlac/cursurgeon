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

1. **Cursor** → **Extensions** (`Ctrl+Shift+X`).
2. **`...`** menu (top of Extensions panel) → **Install from VSIX…**
3. Select the generated `extension/cursurgeon-*.vsix`.
4. **Reload** when prompted.

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
