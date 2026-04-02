# Cursurgeon

**Surgical prompting for Cursor** — capture a region of your running UI, crop it, and emit a structured prompt (bbox, preview URL, route, intent) plus the cropped image so the agent edits the right place.

This repo includes:

- **Pitch site** (`/`) — hackathon narrative, track fit, 60-second judge path
- **Live demo** (`/demo`) — capture → crop → copy the `cursurgeon/surgical-prompt` bundle

## Product thesis

- **Native Cursor (target UX):** inline prompt beside the screenshot; **Enter** starts the agent — not a paste-into-Composer workflow.
- **Hackathon track:** **Agent Runtime Tools** — a runtime affordance for spatial, multimodal context at agent decision time.
- **Web demo:** proves the packaging format and judge flow; a Cursor/VS Code extension would wire the same bundle into the editor.

## Try locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — then **Live demo**.

## Build

```bash
npm run build
npm run preview
```

Deploy `dist/` to any static host; set **Demo URL** on the bounty form to your deployed `/demo` (or root if you prefer).

## Submission

- **GitHub:** [github.com/mogonlac/cursurgeon](https://github.com/mogonlac/cursurgeon)
- **Main track:** Agent Runtime Tools
- **Demo:** hosted URL with `/` (pitch) and `/demo` (interactive)

## License

MIT
