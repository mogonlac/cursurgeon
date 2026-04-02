/**
 * Fake in-app UI for capture demos — same origin so html2canvas works.
 */
export function MockPreview() {
  return (
    <div
      style={{
        height: '100%',
        minHeight: 360,
        background: 'linear-gradient(160deg, #12181c 0%, #0a0e11 50%)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>Acme Dashboard</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>v0.1 · local</span>
      </div>
      <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.95rem', maxWidth: 520 }}>
          This mock UI is captured as a bitmap. Drag a rectangle on the screenshot to mark exactly
          what you want to change.
        </p>
        <div
          style={{
            padding: 20,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 10,
            border: '1px solid var(--border)',
          }}
        >
          <h2 style={{ margin: '0 0 8px', fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
            Ship with surgical context
          </h2>
          <p style={{ margin: '0 0 18px', color: 'var(--muted)', fontSize: '0.92rem' }}>
            The model sees the crop + bbox + route — not a vague “fix the header.”
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: 'none',
                background: '#2d3f36',
                color: '#9bccc0',
                fontWeight: 600,
                cursor: 'default',
              }}
            >
              Secondary CTA
            </button>
            <button
              type="button"
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--accent)',
                color: '#03120c',
                fontWeight: 600,
                cursor: 'default',
                transform: 'translateY(4px)',
              }}
            >
              Primary action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
