import type { CSSProperties } from 'react';
import { NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { DemoPage } from './pages/DemoPage';
import { EmbedPage } from './pages/EmbedPage';
import { PitchPage } from './pages/PitchPage';

function MainShell() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid var(--border)',
          background: 'rgba(7, 10, 12, 0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <nav
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '14px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <NavLink
            to="/"
            style={{
              fontWeight: 700,
              fontSize: '1.05rem',
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              textDecoration: 'none',
            }}
          >
            Cursurgeon<span style={{ color: 'var(--accent)' }}>.</span>
          </NavLink>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <NavLink to="/" style={navLinkStyle}>
              Pitch
            </NavLink>
            <NavLink to="/demo" style={navLinkStyle}>
              Live demo
            </NavLink>
            <a
              href="https://github.com/mogonlac/cursurgeon"
              target="_blank"
              rel="noreferrer"
              style={{ ...navStyle, marginLeft: 4 }}
            >
              GitHub
            </a>
          </div>
        </nav>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/embed" element={<EmbedPage />} />
      <Route path="/workspace" element={<DemoPage variant="workspace" />} />
      <Route element={<MainShell />}>
        <Route path="/" element={<PitchPage />} />
        <Route path="/demo" element={<DemoPage />} />
      </Route>
    </Routes>
  );
}

const navLinkStyle = ({ isActive }: { isActive: boolean }): CSSProperties => ({
  padding: '8px 14px',
  borderRadius: 8,
  fontSize: '0.9rem',
  fontWeight: 500,
  color: isActive ? 'var(--accent)' : 'var(--muted)',
  textDecoration: 'none',
  background: isActive ? 'var(--accent-dim)' : undefined,
});

const navStyle: CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  fontSize: '0.9rem',
  fontWeight: 500,
  color: 'var(--muted)',
  textDecoration: 'none',
};

export default App;
