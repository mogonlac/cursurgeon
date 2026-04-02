import html2canvas from 'html2canvas';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SampleSitePreview } from '../components/SampleSitePreview';
import { buildSurgicalPrompt, type Bbox } from '../lib/buildSurgicalPrompt';

type Sel =
  | null
  | {
      x: number;
      y: number;
      w: number;
      h: number;
    };

function initialPreviewUrl() {
  if (typeof window === 'undefined') return 'http://localhost:5173/demo';
  return window.location.href;
}

export type DemoVariant = 'page' | 'workspace';

export type DemoPageProps = {
  /** `workspace` = Cursor side panel: tight layout, no global nav (route /workspace). */
  variant?: DemoVariant;
};

export function DemoPage({ variant = 'page' }: DemoPageProps) {
  const isWorkspace = variant === 'workspace';
  const previewHostRef = useRef<HTMLDivElement>(null);
  const shotWrapRef = useRef<HTMLDivElement>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [sel, setSel] = useState<Sel>(null);
  const [drag, setDrag] = useState<{ ax: number; ay: number; bx: number; by: number } | null>(null);
  const [cropUrl, setCropUrl] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState(initialPreviewUrl);
  const [route, setRoute] = useState(isWorkspace ? '/workspace' : '/demo');
  const [intent, setIntent] = useState(
    'Align the primary “Start free trial” button with “Book a walkthrough” and nudge it up — keep the gradient.',
  );

  const bboxNatural = useMemo((): Bbox | null => {
    if (!sel || !shotWrapRef.current) return null;
    const img = shotWrapRef.current.querySelector('img');
    if (!img || !img.naturalWidth || !img.clientWidth) return null;
    const sx = img.naturalWidth / img.clientWidth;
    const sy = img.naturalHeight / img.clientHeight;
    const x = Math.round(sel.x * sx);
    const y = Math.round(sel.y * sy);
    const width = Math.max(1, Math.round(sel.w * sx));
    const height = Math.max(1, Math.round(sel.h * sy));
    return { x, y, width, height };
  }, [sel]);

  useEffect(() => {
    if (!bboxNatural || !screenshot) {
      setCropUrl(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const { x, y, width, height } = bboxNatural;
      const c = document.createElement('canvas');
      c.width = width;
      c.height = height;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
      setCropUrl(c.toDataURL('image/png'));
    };
    img.src = screenshot;
  }, [bboxNatural, screenshot]);

  const promptText = useMemo(() => {
    if (!bboxNatural || !natural) return '';
    return buildSurgicalPrompt({
      preview_url: previewUrl,
      route,
      bbox: bboxNatural,
      viewport: { width: natural.w, height: natural.h },
      intent,
      captured_at: new Date().toISOString(),
    });
  }, [bboxNatural, natural, previewUrl, route, intent]);

  const onCapture = useCallback(async () => {
    const el = previewHostRef.current;
    if (!el) return;
    setError(null);
    setBusy(true);
    setScreenshot(null);
    setSel(null);
    setDrag(null);
    setCropUrl(null);
    setNatural(null);
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: '#070a0c',
        scale: window.devicePixelRatio > 1 ? 2 : 1,
        logging: false,
      });
      setScreenshot(canvas.toDataURL('image/png'));
      setNatural({ w: canvas.width, h: canvas.height });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Capture failed');
    } finally {
      setBusy(false);
    }
  }, []);

  const onShotLoad = useCallback(() => {
    const img = shotWrapRef.current?.querySelector('img');
    if (img?.naturalWidth) {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, []);

  const finalizeCrop = useCallback(() => {
    if (!drag) return;
    const x1 = Math.min(drag.ax, drag.bx);
    const y1 = Math.min(drag.ay, drag.by);
    const x2 = Math.max(drag.ax, drag.bx);
    const y2 = Math.max(drag.ay, drag.by);
    const w = x2 - x1;
    const h = y2 - y1;
    setDrag(null);
    if (w < 4 || h < 4) return;
    setSel({ x: x1, y: y1, w, h });
  }, [drag]);

  const overlayMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!screenshot) return;
    const t = e.currentTarget.getBoundingClientRect();
    setDrag({ ax: e.clientX - t.left, ay: e.clientY - t.top, bx: e.clientX - t.left, by: e.clientY - t.top });
    setSel(null);
    setCropUrl(null);
  };

  const overlayMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!drag) return;
    const t = e.currentTarget.getBoundingClientRect();
    setDrag({ ...drag, bx: e.clientX - t.left, by: e.clientY - t.top });
  };

  const copyPrompt = async () => {
    if (!promptText) return;
    try {
      await navigator.clipboard.writeText(promptText);
    } catch {
      setError('Clipboard blocked — select and copy manually.');
    }
  };

  const dims = drag
    ? {
        x: Math.min(drag.ax, drag.bx),
        y: Math.min(drag.ay, drag.by),
        w: Math.abs(drag.bx - drag.ax),
        h: Math.abs(drag.by - drag.ay),
      }
    : sel;

  const pad = isWorkspace ? '14px 14px 28px' : '32px 22px 80px';
  const maxW = isWorkspace ? 'none' : 1100;

  return (
    <div style={{ maxWidth: maxW, margin: '0 auto', padding: pad }}>
      {isWorkspace && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 14,
            paddingBottom: 12,
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
              Cursurgeon<span style={{ color: 'var(--accent)' }}>.</span>
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.08em' }}>PANEL</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Capture → crop → copy</span>
        </div>
      )}

      <h1
        style={{
          margin: '0 0 8px',
          fontSize: isWorkspace ? '1.15rem' : 'clamp(1.5rem, 3vw, 2rem)',
          letterSpacing: '-0.03em',
        }}
      >
        {isWorkspace ? 'Surgical prompt' : 'Live demo — construct a surgical prompt'}
      </h1>
      <p style={{ margin: '0 0 20px', color: 'var(--muted)', maxWidth: 720, fontSize: isWorkspace ? '0.88rem' : undefined }}>
        {isWorkspace ? (
          <>
            Sample site below — <strong style={{ color: 'var(--text)' }}>Capture</strong>, then drag on the shot to mark the UI you want
            changed. <strong style={{ color: 'var(--text)' }}>Copy prompt</strong> and paste into Cursor chat with the crop image.
          </>
        ) : (
          <>
            Capture the mock preview, drag a rectangle on the bitmap, then copy the structured block. In a full Cursor integration, this
            bundle sits inline beside the crop — <strong>Enter</strong> starts the agent.
          </>
        )}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isWorkspace ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)',
          gap: isWorkspace ? 18 : 22,
          alignItems: 'start',
        }}
        className="demo-grid"
      >
        <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--muted)' }}>
            PREVIEW (CAPTURE TARGET)
          </div>
          <div ref={previewHostRef}>
            <SampleSitePreview />
          </div>
          <button
            type="button"
            onClick={onCapture}
            disabled={busy}
            style={{
              alignSelf: 'flex-start',
              padding: '12px 20px',
              borderRadius: 10,
              border: '1px solid var(--accent)',
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              fontWeight: 600,
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            {busy ? 'Capturing…' : 'Capture screenshot'}
          </button>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--muted)' }}>
            CROP ON SCREENSHOT
          </div>
          <div
            ref={shotWrapRef}
            style={{
              position: 'relative',
              display: 'inline-block',
              maxWidth: '100%',
              minHeight: isWorkspace ? 160 : 200,
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius)',
              border: '1px dashed var(--border)',
            }}
          >
            {screenshot ? (
              <>
                <img
                  src={screenshot}
                  alt="Captured preview"
                  onLoad={onShotLoad}
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
                <div
                  role="presentation"
                  onMouseDown={overlayMouseDown}
                  onMouseMove={overlayMouseMove}
                  onMouseUp={finalizeCrop}
                  onMouseLeave={() => drag && finalizeCrop()}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'crosshair',
                  }}
                />
                {dims && dims.w > 0 && dims.h > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: dims.x,
                      top: dims.y,
                      width: dims.w,
                      height: dims.h,
                      border: '2px solid var(--accent)',
                      background: 'rgba(62, 203, 155, 0.12)',
                      pointerEvents: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                )}
              </>
            ) : (
              <div style={{ padding: 24, color: 'var(--muted)', fontSize: '0.95rem' }}>
                Capture the preview to enable selection.
              </div>
            )}
          </div>

          <label style={labelStyle}>
            Preview URL (metadata)
            <input value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Route / path
            <input value={route} onChange={(e) => setRoute(e.target.value)} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Intent
            <textarea value={intent} onChange={(e) => setIntent(e.target.value)} rows={isWorkspace ? 3 : 4} style={{ ...inputStyle, resize: 'vertical' }} />
          </label>

          {error && <div style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</div>}
        </section>
      </div>

      <section style={{ marginTop: isWorkspace ? 22 : 36 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--muted)' }}>
            SURGICAL PROMPT + CROP
          </div>
          <button
            type="button"
            onClick={copyPrompt}
            disabled={!promptText}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: promptText ? 'var(--accent)' : '#333',
              color: promptText ? '#041109' : '#888',
              fontWeight: 600,
              cursor: promptText ? 'pointer' : 'not-allowed',
            }}
          >
            Copy prompt text
          </button>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isWorkspace ? '1fr' : 'minmax(0,1.2fr) minmax(160px,220px)',
            gap: 16,
            alignItems: 'start',
          }}
          className="prompt-grid"
        >
          <pre
            style={{
              margin: 0,
              padding: 16,
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: '#080c0f',
              fontSize: isWorkspace ? '0.7rem' : '0.78rem',
              lineHeight: 1.45,
              overflow: 'auto',
              maxHeight: isWorkspace ? 240 : 360,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {promptText || 'Select a region on the screenshot to generate the surgical JSON block.'}
          </pre>
          {!isWorkspace && (
            <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', background: '#080c0f' }}>
              <div style={{ padding: '8px 10px', fontSize: '0.68rem', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                Cropped attachment
              </div>
              {cropUrl ? (
                <img src={cropUrl} alt="Crop" style={{ display: 'block', width: '100%', height: 'auto' }} />
              ) : (
                <div style={{ padding: 16, color: 'var(--muted)', fontSize: '0.85rem' }}>Select a region</div>
              )}
            </div>
          )}
        </div>
        {isWorkspace && (
          <div style={{ marginTop: 12, borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', background: '#080c0f' }}>
            <div style={{ padding: '8px 10px', fontSize: '0.68rem', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              Cropped attachment
            </div>
            {cropUrl ? (
              <img src={cropUrl} alt="Crop" style={{ display: 'block', maxWidth: 220, height: 'auto', margin: '0 auto' }} />
            ) : (
              <div style={{ padding: 16, color: 'var(--muted)', fontSize: '0.85rem' }}>Select a region</div>
            )}
          </div>
        )}
        {bboxNatural && (
          <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--muted)' }}>
            Bbox (natural px): {bboxNatural.x}, {bboxNatural.y} · {bboxNatural.width}×{bboxNatural.height}
          </p>
        )}
      </section>

      <style>{`
        @media (max-width: 900px) {
          .demo-grid { grid-template-columns: 1fr !important; }
          .prompt-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: '0.85rem',
  color: 'var(--muted)',
};

const inputStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--bg-elevated)',
  color: 'var(--text)',
  fontSize: '0.95rem',
};
