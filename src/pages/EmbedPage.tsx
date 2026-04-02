import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { isCursurgeonHost, postExtensionMessage, postSendToChat } from '../cursurgeonBridge';
import { buildInlineChatPrompt } from '../lib/inlineChatPrompt';

type Phase = 'idle' | 'streaming' | 'frozen' | 'ready';

declare global {
  interface Window {
    __CURSURGEON__?: { previewUrl?: string };
  }
}

function initialUrl(): string {
  if (typeof window !== 'undefined' && window.__CURSURGEON__?.previewUrl) {
    return window.__CURSURGEON__.previewUrl;
  }
  return 'http://localhost:5173';
}

/**
 * Extension side pane: iframe live preview + screen capture + crop + inline chat prompt.
 */
export function EmbedPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [urlInput, setUrlInput] = useState(initialUrl);
  const [iframeSrc, setIframeSrc] = useState(initialUrl);
  const [phase, setPhase] = useState<Phase>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [changeHint, setChangeHint] = useState('');
  const [cropUrl, setCropUrl] = useState<string | null>(null);
  const [promptDraft, setPromptDraft] = useState('');
  const [inExtension, setInExtension] = useState(false);

  const [drag, setDrag] = useState<{ ax: number; ay: number; bx: number; by: number } | null>(null);
  /** Re-copy bitmap to visible canvas when entering frozen phase */
  const [frozenTick, setFrozenTick] = useState(0);

  useEffect(() => {
    setInExtension(isCursurgeonHost());
  }, []);

  useEffect(() => {
    if (phase !== 'ready' || !cropUrl) return;
    setPromptDraft(buildInlineChatPrompt(changeHint));
  }, [phase, cropUrl, changeHint]);

  const stopStream = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  useEffect(() => () => stopStream(), [stopStream]);

  const applyUrl = useCallback(() => {
    const u = urlInput.trim() || 'http://localhost:5173';
    setIframeSrc(u);
    postExtensionMessage({ type: 'setPreviewUrl', url: u });
  }, [urlInput]);

  const reloadIframe = useCallback(() => {
    const el = iframeRef.current;
    if (el) el.src = iframeSrc;
  }, [iframeSrc]);

  const startCapture = async () => {
    setError(null);
    stopStream();
    setCropUrl(null);
    sourceCanvasRef.current = null;
    setDrag(null);
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
      setPhase('streaming');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Screen capture cancelled or blocked.');
      setPhase('idle');
    }
  };

  const freezeFrame = useCallback(() => {
    const v = videoRef.current;
    if (!v?.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    stopStream();
    sourceCanvasRef.current = c;
    setFrozenTick((t) => t + 1);
    setPhase('frozen');
  }, [stopStream]);

  useLayoutEffect(() => {
    if (phase !== 'frozen' || !sourceCanvasRef.current || !canvasRef.current) return;
    const src = sourceCanvasRef.current;
    const d = canvasRef.current;
    d.width = src.width;
    d.height = src.height;
    d.getContext('2d')?.drawImage(src, 0, 0);
  }, [phase, frozenTick]);

  const finalizeCrop = useCallback(() => {
    if (!drag) return;
    const src = sourceCanvasRef.current;
    const d = canvasRef.current;
    if (!src || !d) return;

    const x1 = Math.min(drag.ax, drag.bx);
    const y1 = Math.min(drag.ay, drag.by);
    const w = Math.abs(drag.bx - drag.ax);
    const h = Math.abs(drag.by - drag.ay);
    setDrag(null);

    if (w < 6 || h < 6) return;

    const sx = src.width / d.clientWidth;
    const sy = src.height / d.clientHeight;
    const cx = Math.round(x1 * sx);
    const cy = Math.round(y1 * sy);
    const cw = Math.max(1, Math.round(w * sx));
    const ch = Math.max(1, Math.round(h * sy));

    const out = document.createElement('canvas');
    out.width = cw;
    out.height = ch;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(src, cx, cy, cw, ch, 0, 0, cw, ch);
    setCropUrl(out.toDataURL('image/png'));
    setPhase('ready');
    sourceCanvasRef.current = null;
  }, [drag]);

  const onCanvasMouseDown = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (phase !== 'frozen') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    setDrag({ ax: e.clientX - r.left, ay: e.clientY - r.top, bx: e.clientX - r.left, by: e.clientY - r.top });
  };

  const onCanvasMouseMove = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!drag || phase !== 'frozen') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    setDrag({ ...drag, bx: e.clientX - r.left, by: e.clientY - r.top });
  };

  const resetAll = () => {
    stopStream();
    setPhase('idle');
    setCropUrl(null);
    sourceCanvasRef.current = null;
    setDrag(null);
    setError(null);
  };

  const copyForChat = async () => {
    if (!promptDraft.trim()) return;
    try {
      await navigator.clipboard.writeText(promptDraft);
    } catch {
      setError('Clipboard blocked.');
    }
  };

  const dims =
    drag && phase === 'frozen'
      ? {
          x: Math.min(drag.ax, drag.bx),
          y: Math.min(drag.ay, drag.by),
          w: Math.abs(drag.bx - drag.ax),
          h: Math.abs(drag.by - drag.ay),
        }
      : null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      <div
        style={{
          flexShrink: 0,
          padding: '10px 10px 8px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '0.92rem', letterSpacing: '-0.02em' }}>
          Cursurgeon<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.35 }}>
          <strong style={{ color: 'var(--text)' }}>Live preview</strong> loads your dev URL below. <strong style={{ color: 'var(--text)' }}>Screenshot</strong>{' '}
          shares your screen — pick the window or tab where that preview is visible, then <strong style={{ color: 'var(--text)' }}>Freeze frame</strong> and drag a
          region.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyUrl()}
            placeholder="http://localhost:5173"
            style={{ ...inp, flex: '1 1 140px', minWidth: 120 }}
          />
          <button type="button" onClick={applyUrl} style={btnSec}>
            Apply
          </button>
          <button type="button" onClick={reloadIframe} style={btnSec} disabled={phase !== 'idle'}>
            Reload
          </button>
          {phase === 'idle' && (
            <button type="button" onClick={startCapture} style={btnPri}>
              Screenshot
            </button>
          )}
          {phase === 'streaming' && (
            <>
              <button type="button" onClick={freezeFrame} style={btnPri}>
                Freeze frame
              </button>
              <button type="button" onClick={resetAll} style={btnGhost}>
                Cancel
              </button>
            </>
          )}
          {phase === 'frozen' && (
            <button type="button" onClick={resetAll} style={btnGhost}>
              Cancel
            </button>
          )}
          {phase === 'ready' && (
            <button type="button" onClick={resetAll} style={btnGhost}>
              New capture
            </button>
          )}
        </div>
        {phase === 'idle' && (
          <input
            type="text"
            value={changeHint}
            onChange={(e) => setChangeHint(e.target.value)}
            placeholder='Optional intent: "Fix the header spacing"'
            style={inp}
          />
        )}
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {phase === 'idle' && (
          <iframe
            ref={iframeRef}
            title="Live preview"
            src={iframeSrc}
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals allow-downloads"
            style={{ flex: 1, width: '100%', border: 'none', background: '#fff' }}
          />
        )}

        {phase === 'streaming' && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ flex: 1, width: '100%', objectFit: 'contain', background: '#000' }}
          />
        )}

        {phase === 'frozen' && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              background: '#000',
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              padding: 8,
            }}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <canvas
                ref={canvasRef}
                role="presentation"
                onMouseDown={onCanvasMouseDown}
                onMouseMove={onCanvasMouseMove}
                onMouseUp={finalizeCrop}
                onMouseLeave={() => drag && finalizeCrop()}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  height: 'auto',
                  cursor: 'crosshair',
                }}
              />
              {dims && dims.w > 4 && dims.h > 4 && (
                <div
                  style={{
                    position: 'absolute',
                    left: dims.x,
                    top: dims.y,
                    width: dims.w,
                    height: dims.h,
                    border: '2px solid var(--accent)',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
                    pointerEvents: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          </div>
        )}

        {phase === 'ready' && cropUrl && (
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '12px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--muted)' }}>INLINE PROMPT</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <img src={cropUrl} alt="" style={{ maxWidth: 160, borderRadius: 8, border: '1px solid var(--border)' }} />
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <textarea value={promptDraft} onChange={(e) => setPromptDraft(e.target.value)} rows={7} style={ta} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {inExtension && (
                    <button type="button" onClick={() => postSendToChat(promptDraft)} disabled={!promptDraft.trim()} style={btnPri}>
                      Send to Cursor chat
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={copyForChat}
                    disabled={!promptDraft.trim()}
                    style={inExtension ? { ...btnSec, width: '100%' } : { ...btnPri, width: '100%' }}
                  >
                    Copy for chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: '8px 10px', fontSize: '0.85rem', color: 'var(--danger)', borderTop: '1px solid var(--border)' }}>{error}</div>
      )}
    </div>
  );
}

const inp: CSSProperties = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--bg-elevated)',
  color: 'var(--text)',
  fontSize: '0.85rem',
  boxSizing: 'border-box',
};

const ta: CSSProperties = {
  ...inp,
  width: '100%',
  resize: 'vertical',
  fontFamily: 'var(--font-sans)',
  lineHeight: 1.45,
};

const btnPri: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--accent)',
  color: '#041109',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '0.82rem',
};

const btnSec: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--bg-elevated)',
  color: 'var(--text)',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '0.82rem',
};

const btnGhost: CSSProperties = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--muted)',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '0.8rem',
};
