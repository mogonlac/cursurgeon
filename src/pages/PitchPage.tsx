import { Link } from 'react-router-dom';

export function PitchPage() {
  return (
    <div>
      <section
        style={{
          padding: '56px 22px 72px',
          maxWidth: 920,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: '0 0 16px',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
          }}
        >
          Cursor Guild · Agent runtime tools
        </p>
        <h1
          style={{
            margin: '0 0 20px',
            fontSize: 'clamp(2.2rem, 5vw, 3.35rem)',
            fontWeight: 700,
            letterSpacing: '-0.045em',
            lineHeight: 1.08,
          }}
        >
          Click the UI. Crop the truth.
          <br />
          <span style={{ color: 'var(--muted)' }}>Prompt sits next to the shot — Enter runs the agent.</span>
        </h1>
        <p style={{ margin: '0 auto 32px', maxWidth: 640, fontSize: '1.15rem', color: 'var(--muted)', lineHeight: 1.55 }}>
          <strong style={{ color: 'var(--text)' }}>Cursurgeon</strong> packages a screenshot region, bounding box, route, and preview URL into
          a structured surgical prompt. No vague “fix the header.” No pasting into a different surface — the inline bundle is how Cursor should
          receive spatial UI intent.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/demo"
            style={{
              padding: '14px 24px',
              borderRadius: 10,
              background: 'var(--accent)',
              color: '#041109',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Try the live demo
          </Link>
          <a
            href="https://github.com/mogonlac/cursurgeon"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '14px 24px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontWeight: 600,
            }}
          >
            View on GitHub
          </a>
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--border)', background: 'linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg) 100%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 22px', display: 'grid', gap: 48 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22 }}>
            <PitchCard
              title="The problem"
              body="Front-end tweaks die in translation: the model lacks pixels and place. Prompts float without a viewport anchor, so edits sprawl across the wrong files."
            />
            <PitchCard
              title="The move"
              body="Capture → crop → structured block: JSON metadata (bbox, route, preview URL) + cropped image + short intent. Localized scope, repeatable packaging."
            />
            <PitchCard
              title="Native Cursor"
              body="This repo ships the surgical constructor in-browser for judges. The product thesis: extend Cursor so the prompt appears inline beside the crop; Enter submits to the agent — not a Composer handoff."
            />
          </div>

          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: '1.5rem', letterSpacing: '-0.03em' }}>Why Agent Runtime Tools</h2>
            <p style={{ margin: 0, color: 'var(--muted)', maxWidth: 800, lineHeight: 1.65, fontSize: '1.05rem' }}>
              Cursurgeon is not a software factory pipeline. It is a <strong style={{ color: 'var(--text)' }}>runtime affordance</strong>: it
              shapes what the agent sees at decision time — multi-modal, spatially grounded context with a tight edit window. That improves tool
              use without claiming multi-agent orchestration.
            </p>
          </div>

          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: '1.5rem', letterSpacing: '-0.03em' }}>Judge checklist (60 seconds)</h2>
            <ol style={{ margin: 0, paddingLeft: 22, color: 'var(--muted)', lineHeight: 1.85, maxWidth: 800 }}>
              <li>Open the live demo route.</li>
              <li>Capture the mock dashboard, drag a box around the primary CTA.</li>
              <li>Show the generated surgical block and the crop thumbnail.</li>
              <li>Copy prompt — that is the artifact the agent consumes next to the image in Cursor.</li>
            </ol>
          </div>

          <div
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: '28px 28px 32px',
              background: 'rgba(62, 203, 155, 0.06)',
            }}
          >
            <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem', color: 'var(--accent)' }}>Side quests</h2>
            <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>
              Strong fit for <strong style={{ color: 'var(--text)' }}>Best Cursor-native workflow</strong> and{' '}
              <strong style={{ color: 'var(--text)' }}>Best developer tool</strong> — the demo is the Cursor-adjacent loop: local preview,
              pixels, then agent-ready context.
            </p>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 22px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
        <a href="https://github.com/mogonlac/cursurgeon">mogonlac/cursurgeon</a> · surgical prompting for localized UI edits
      </footer>
    </div>
  );
}

function PitchCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        padding: 22,
        background: 'var(--bg-elevated)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <h3 style={{ margin: '0 0 10px', fontSize: '1rem', letterSpacing: '-0.02em' }}>{title}</h3>
      <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.55, fontSize: '0.98rem' }}>{body}</p>
    </div>
  );
}
