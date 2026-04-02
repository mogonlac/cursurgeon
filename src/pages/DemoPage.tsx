import html2canvas from 'html2canvas';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SampleSitePreview } from '../components/SampleSitePreview';
import { isCursurgeonHost, postSendToChat } from '../cursurgeonBridge';
import { buildInlineChatPrompt } from '../lib/inlineChatPrompt';

type Phase = 'idle' | 'selecting' | 'ready';

type DragState = { ax: number; ay: number; bx: number; by: number } | null;

export type DemoVariant = 'page' | 'workspace';

export type DemoPageProps = {
  variant?: DemoVariant;
};

export function DemoPage({ variant = 'page' }: DemoPageProps) {
  const isWorkspace = variant === 'workspace';
  const previewHostRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>('idle');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState>(null);
  const [cropUrl, setCropUrl] = useState<string | null>(null);
  /** First-line hint merged into the generated chat prompt when selection completes. */
  const [changeHint, setChangeHint] = useState('');
  const [promptDraft, setPromptDraft] = useState('');
  const [inExtension, setInExtension] = useState(false);

  useEffect(() => {
    setInExtension(isCursurgeonHost());
  }, []);

  const dragRect =
    drag && Math.abs(drag.bx - drag.ax) > 0 && Math.abs(drag.by - drag.ay) > 0
      ? {
          x: Math.min(drag.ax, drag.bx),
          y: Math.min(drag.ay, drag.by),
          w: Math.abs(drag.bx - drag.ax),
          h: Math.abs(drag.by - drag.ay),
        }
      : null;

  const reset = useCallback(() => {
    setPhase('idle');
    setDrag(null);
    setCropUrl(null);
    setError(null);
  }, []);

  const startScreenshot = useCallback(() => {
    setError(null);
    setCropUrl(null);
    setDrag(null);
    setPhase('selecting');
  }, []);

  const applySelectionToCanvas = useCallback(
    (canvas: HTMLCanvasElement, x1: number, y1: number, rw: number, rh: number, cw: number, ch: number) => {
      const sx = canvas.width / cw;
      const sy = canvas.height / ch;
      const cx = Math.round(x1 * sx);
      const cy = Math.round(y1 * sy);
      const cwi = Math.max(1, Math.round(rw * sx));
      const chi = Math.max(1, Math.round(rh * sy));
      const out = document.createElement('canvas');
      out.width = cwi;
      out.height = chi;
      const ctx = out.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(canvas, cx, cy, cwi, chi, 0, 0, cwi, chi);
      return out.toDataURL('image/png');
    },
    [],
  );

  const completeSelection = useCallback(async () => {
    if (!drag || !previewHostRef.current || phase !== 'selecting') return;
    const x1 = Math.min(drag.ax, drag.bx);
    const y1 = Math.min(drag.ay, drag.by);
    const x2 = Math.max(drag.ax, drag.bx);
    const y2 = Math.max(drag.ay, drag.by);
    const rw = x2 - x1;
    const rh = y2 - y1;
    setDrag(null);

    if (rw < 8 || rh < 8) {
      setPhase('idle');
      return;
    }

    const host = previewHostRef.current;
    const cw = host.clientWidth;
    const ch = host.clientHeight;
    if (!cw || !ch) return;

    setBusy(true);
    setError(null);
    try {
      const canvas = await html2canvas(host, {
        backgroundColor: '#070a0c',
        scale: window.devicePixelRatio > 1 ? 2 : 1,
        logging: false,
      });
      const dataUrl = applySelectionToCanvas(canvas, x1, y1, rw, rh, cw, ch);
      if (!dataUrl) throw new Error('Could not extract crop');
      setCropUrl(dataUrl);
      setPhase('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Capture failed');
      setPhase('idle');
    } finally {
      setBusy(false);
    }
  }, [drag, phase, applySelectionToCanvas]);

  useEffect(() => {
    if (phase !== 'ready' || !cropUrl) return;
    setPromptDraft(buildInlineChatPrompt(changeHint));
  }, [phase, cropUrl, changeHint]);

  useEffect(() => {
    if (phase !== 'selecting') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrag(null);
        setPhase('idle');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const overlayMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    const t = e.currentTarget.getBoundingClientRect();
    setDrag({ ax: e.clientX - t.left, ay: e.clientY - t.top, bx: e.clientX - t.left, by: e.clientY - t.top });
  };

  const overlayMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!drag) return;
    const t = e.currentTarget.getBoundingClientRect();
    setDrag({ ...drag, bx: e.clientX - t.left, by: e.clientY - t.top });
  };

  const copyForChat = async () => {
    if (!promptDraft.trim()) return;
    try {
      if (cropUrl) {
        const blob = await (await fetch(cropUrl)).blob();
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/plain': new Blob([promptDraft], { type: 'text/plain' }),
              [blob.type]: blob,
            }),
          ]);
          return;
        } catch {
          /* some hosts only support text */
        }
      }
      await navigator.clipboard.writeText(promptDraft);
    } catch {
      setError('Clipboard blocked — copy the text manually.');
    }
  };

  const pad = isWorkspace ? '12px 12px 24px' : '28px 22px 48px';
  const maxW = isWorkspace ? 'none' : 720;

  return (
    <div style={{ maxWidth: maxW, margin: '0 auto', padding: pad }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, letterSpacing: '-0.03em', fontSize: isWorkspace ? '0.95rem' : '1.05rem' }}>
            Cursurgeon<span style={{ color: 'var(--accent)' }}>.</span>
          </span>
          {!isWorkspace && (
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              Preview · screenshot · chat{inExtension ? ' · extension' : ''}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {phase === 'selecting' && (
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Drag a box on the preview · Esc to cancel</span>
          )}
          {phase !== 'selecting' && (
            <button
              type="button"
              onClick={startScreenshot}
              disabled={busy}
              style={btnScreenshot}
            >
              {busy ? 'Working…' : 'Screenshot'}
            </button>
          )}
          {phase === 'ready' && (
            <button type="button" onClick={reset} style={btnGhost}>
              New screenshot
            </button>
          )}
        </div>
      </header>

      {!isWorkspace && (
        <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
          Put this panel on the right, keep chat on the left. <strong style={{ color: 'var(--text)' }}>Screenshot</strong>, drag on the
          live preview, then <strong style={{ color: 'var(--text)' }}>copy</strong> the message into Cursor — plain language only.
        </p>
      )}

      {phase === 'idle' && (
        <>
          <p style={{ margin: '0 0 6px', fontSize: '0.88rem', color: 'var(--muted)' }}>
            Optional — what should change? (You can leave blank.)
          </p>
          <input
            type="text"
            value={changeHint}
            onChange={(e) => setChangeHint(e.target.value)}
            placeholder='e.g. "Align the primary CTA with the ghost button"'
            style={{ ...inputStyle, marginBottom: 16 }}
          />
        </>
      )}

      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius)',
          border: phase === 'selecting' ? '2px solid var(--accent)' : '1px solid var(--border)',
          overflow: 'hidden',
          marginBottom: 20,
        }}
      >
        <div ref={previewHostRef}>
          <SampleSitePreview />
        </div>
        {phase === 'selecting' && (
          <>
            <div
              role="presentation"
              onMouseDown={overlayMouseDown}
              onMouseMove={overlayMouseMove}
              onMouseUp={completeSelection}
              onMouseLeave={() => drag && void completeSelection()}
              style={{
                position: 'absolute',
                inset: 0,
                cursor: 'crosshair',
                background: 'rgba(0,0,0,0.35)',
              }}
            />
            {dragRect && dragRect.w >= 4 && dragRect.h >= 4 && (
              <div
                style={{
                  position: 'absolute',
                  left: dragRect.x,
                  top: dragRect.y,
                  width: dragRect.w,
                  height: dragRect.h,
                  border: '2px solid var(--accent)',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
                  pointerEvents: 'none',
                  boxSizing: 'border-box',
                }}
              />
            )}
          </>
        )}
      </div>

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: 12 }}>
          {error}
        </div>
      )}

      {phase === 'ready' && cropUrl && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)' }}>
            FOR CURSOR CHAT
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div
              style={{
                borderRadius: 12,
                border: '1px solid var(--border)',
                overflow: 'hidden',
                flexShrink: 0,
                maxWidth: 200,
                background: 'var(--bg-elevated)',
              }}
            >
              <img src={cropUrl} alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
            </div>
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <textarea
                value={promptDraft}
                onChange={(e) => setPromptDraft(e.target.value)}
                rows={6}
                style={chatPromptStyle}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {inExtension && (
                  <button
                    type="button"
                    onClick={() => postSendToChat(promptDraft)}
                    disabled={!promptDraft.trim()}
                    style={{ ...btnPrimary, width: '100%', border: '2px solid rgba(255,255,255,0.12)' }}
                  >
                    Send to Cursor chat
                  </button>
                )}
                <button
                  type="button"
                  onClick={copyForChat}
                  disabled={!promptDraft.trim()}
                  style={{
                    ...btnPrimary,
                    width: '100%',
                    background: inExtension ? 'transparent' : 'var(--accent)',
                    color: inExtension ? 'var(--accent)' : '#041109',
                    border: inExtension ? '1px solid var(--accent)' : 'none',
                  }}
                >
                  Copy for chat
                </button>
              </div>
              <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
                {inExtension
                  ? 'Send to Cursor chat: focuses Agent/Chat and pastes text. Drag the crop into the composer if the image is not there.'
                  : 'Paste in chat with the image. If the image didn’t copy, drag the thumbnail into the composer.'}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

const btnScreenshot: CSSProperties = {
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  background: 'var(--accent)',
  color: '#041109',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '0.9rem',
};

const btnGhost: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--muted)',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '0.85rem',
};

const btnPrimary: CSSProperties = {
  padding: '12px 18px',
  borderRadius: 10,
  border: 'none',
  background: 'var(--accent)',
  color: '#041109',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '0.9rem',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--bg-elevated)',
  color: 'var(--text)',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
};

const chatPromptStyle: CSSProperties = {
  width: '100%',
  margin: 0,
  padding: 14,
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: '#10161c',
  color: 'var(--text)',
  fontSize: '0.95rem',
  lineHeight: 1.5,
  fontFamily: 'var(--font-sans)',
  resize: 'vertical',
  boxSizing: 'border-box',
};
