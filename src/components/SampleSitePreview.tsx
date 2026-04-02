/**
 * Polished mini “client site” for capture demos — looks like a real landing page on purpose.
 * Includes an intentional layout bug (primary CTA offset) perfect for surgical crop demos.
 */
export function SampleSitePreview() {
  return (
    <div
      data-cursurgeon-preview="sample-site"
      style={{
        minHeight: 420,
        background: 'linear-gradient(180deg, #0c1014 0%, #060809 55%, #0a0d10 100%)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 22px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent) 0%, #1a6b52 100%)',
              boxShadow: '0 0 20px rgba(62, 203, 155, 0.25)',
            }}
          />
          <span style={{ fontWeight: 700, letterSpacing: '-0.04em', fontSize: '0.95rem' }}>Northwind</span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: 'var(--muted)',
              textTransform: 'uppercase',
            }}
          >
            Preview
          </span>
        </div>
        <nav style={{ display: 'flex', gap: 18, fontSize: '0.8rem', color: 'var(--muted)' }}>
          <span>Product</span>
          <span>Pricing</span>
          <span>Docs</span>
        </nav>
      </header>

      <div
        style={{
          flex: 1,
          padding: '28px 22px 32px',
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: 22,
          alignItems: 'center',
        }}
        className="sample-site-grid"
      >
        <div>
          <p
            style={{
              margin: '0 0 12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
            }}
          >
            Launch-ready in days
          </p>
          <h1
            style={{
              margin: '0 0 14px',
              fontSize: 'clamp(1.45rem, 3vw, 1.85rem)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.15,
            }}
          >
            Ship product pages your team can actually iterate on.
          </h1>
          <p style={{ margin: '0 0 22px', color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.55, maxWidth: 440 }}>
            This panel is your local preview. Capture a bitmap, crop the exact control, and send structured context —
            not “make the green button nicer.”
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              className="sample-secondary-cta"
              style={{
                padding: '11px 20px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent',
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'default',
              }}
              aria-hidden
            >
              Book a walkthrough
            </button>
            <button
              type="button"
              className="sample-primary-cta"
              style={{
                padding: '12px 22px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(180deg, #4af0b8 0%, var(--accent) 45%, #238c6a 100%)',
                color: '#03140e',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'default',
                boxShadow: '0 10px 36px rgba(62, 203, 155, 0.28)',
                transform: 'translateY(6px)',
              }}
              aria-hidden
            >
              Start free trial
            </button>
          </div>
        </div>

        <div
          style={{
            borderRadius: 14,
            padding: 18,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 12, letterSpacing: '0.06em' }}>
            LIVE METRICS · DEMO DATA
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              ['Conversion', '3.8%', '+0.6%'],
              ['Latency p95', '118ms', '−12ms'],
              ['Deploys / wk', '34', '+8'],
            ].map(([k, v, d]) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(0,0,0,0.25)',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ color: 'var(--muted)' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
                <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .sample-site-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
