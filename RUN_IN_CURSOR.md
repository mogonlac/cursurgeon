# Run Cursurgeon inside Cursor (step by step)

## What “Run” is supposed to do

Starting the **extension debugger** does **not** show the demo in your current window. It should open a **second** Cursor/VS Code window. In that second window you run a **command** to open the panel.

If nothing seems to happen, check the **taskbar** or **Alt+Tab** for another window whose title includes **`[Extension Development Host]`**.

---

## 0. Open the correct folder

Use **File → Open Folder…** and choose **`cursurgeon`** — the folder that contains **`package.json`** at the top level and an **`extension`** subfolder.

Do **not** open only the `extension` folder; debug will break.

---

## 1. One-time build (terminal)

```text
npm run setup
```

(or: `npm run bundle-extension` then `npm run compile-extension`)

---

## 2. Start the extension debugger (this is not the green ▶ on a file)

1. Open the **Run and Debug** view: click the **play icon with a bug** in the left sidebar, or press **Ctrl+Shift+D**.
2. At the **top of that panel**, open the dropdown. Pick **`Run Cursurgeon extension`**.
3. Press **F5** (or click the green **Start Debugging** ▶ next to the dropdown).

**Do not** use a generic “Run” button on a TypeScript/JavaScript file — that runs the file, not the extension host.

---

## 3. Watch for the second window

A **new** window should open. Title bar will look like:

`[Extension Development Host] Cursurgeon - Cursor`

If you don’t see it, use **Alt+Tab** or the taskbar.

---

## 4. Open the demo (in that second window only)

1. Switch to **`[Extension Development Host]`** window.
2. **Ctrl+Shift+P** → Command Palette.
3. Type **`Cursurgeon`**.
4. Choose **`Cursurgeon: Open surgical demo (side panel)`**.

The surgical demo should appear in an editor tab. Drag that tab to the **right** to sit beside your code.

---

## 5. If F5 does nothing or errors

1. Run **`npm run setup`** again in the terminal.
2. In Run and Debug, try **`Run Cursurgeon extension (no prebuild)`** then **F5** (use this only after `npm run setup` succeeded once).
3. Open **View → Output**, choose **“Tasks”** in the dropdown — see if **prep-extension-full** failed.
4. Cursor sometimes behaves oddly with extension debugging; if needed, open the same **`cursurgeon`** folder in **VS Code** and repeat steps 2–4 there.

---

## Easiest fallback (no extension — good for a demo video)

In a terminal:

```text
npm run dev
```

Open **http://localhost:5173/#/workspace** in your browser. Snap the browser window to the **right** half of the screen and Cursor to the **left**. Same capture → crop → copy flow, without the webview.
