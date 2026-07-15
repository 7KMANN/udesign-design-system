import { useEffect, useState } from 'react';
import { Analytics } from './pages/Analytics';
import { Dashboard } from './pages/Dashboard';
import { KitchenSink } from './pages/KitchenSink';
import { Login } from './pages/Login';

type Page = 'system' | 'login' | 'dashboard' | 'analytics';
type Viewport = 'desktop' | 'tablet' | 'mobile';
type Design = 'brand' | 'functional';
type Theme = 'light' | 'dark';

declare global {
  interface Window {
    UD_VERSIONS?: string[];
  }
}

const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  desktop: '1200px',
  tablet: '768px',
  mobile: '375px',
};

const getInitialViewport = (): Viewport => {
  if (window.innerWidth <= 480) return 'mobile';
  if (window.innerWidth <= 900) return 'tablet';
  return 'desktop';
};

export default function App() {
  const [activePage, setActivePage] = useState<Page>('system');
  const [viewport, setViewport] = useState<Viewport>(getInitialViewport);
  const [versions, setVersions] = useState<string[]>([]);
  const [selectedVersionPath, setSelectedVersionPath] = useState('../dist/tokens.css');
  const [design, setDesign] = useState<Design>('brand');
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    document.documentElement.dataset.design = design;
    document.documentElement.dataset.theme = theme;
  }, [design, theme]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'versions.js';
    script.onload = () => setVersions(window.UD_VERSIONS ?? []);
    script.onerror = () => console.warn('Failed to load versions.js');
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  const handleVersionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const path = event.target.value;
    setSelectedVersionPath(path);
    const stylesheet = document.getElementById('tokens-link') as HTMLLinkElement | null;
    if (stylesheet) stylesheet.href = path;
  };

  return (
    <div className="showcase-shell">
      <header className="showcase-toolbar">
        <div className="showcase-lockup">
          <span className="showcase-mark" aria-hidden="true">U</span>
          <span>
            <strong>UDesign</strong>
            <small>Semantic system preview</small>
          </span>
        </div>

        <div className="showcase-controls" aria-label="Preview controls">
          <button
            type="button"
            className="showcase-toggle"
            data-testid="profile-toggle"
            aria-label={`Switch to ${design === 'brand' ? 'functional' : 'brand'} profile`}
            onClick={() => setDesign(design === 'brand' ? 'functional' : 'brand')}
          >
            <span>Profile</span>
            <strong>{design === 'brand' ? 'Brand' : 'Functional'}</strong>
          </button>

          <button
            type="button"
            className="showcase-toggle"
            data-testid="theme-toggle"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <span>Theme</span>
            <strong>{theme === 'light' ? 'Light' : 'Dark'}</strong>
          </button>

          <label className="showcase-field">
            <span>Page</span>
            <select value={activePage} onChange={(event) => setActivePage(event.target.value as Page)}>
              <option value="system">System matrix</option>
              <option value="login">Form and focus</option>
              <option value="dashboard">Metrics and collection</option>
              <option value="analytics">Charts and entities</option>
            </select>
          </label>

          <label className="showcase-field">
            <span>Viewport</span>
            <select value={viewport} onChange={(event) => setViewport(event.target.value as Viewport)}>
              <option value="desktop">Desktop, 1200px</option>
              <option value="tablet">Tablet, 768px</option>
              <option value="mobile">Mobile, 375px</option>
            </select>
          </label>

          <label className="showcase-field">
            <span>Tokens</span>
            <select value={selectedVersionPath} onChange={handleVersionChange}>
              <option value="../dist/tokens.css">Current worktree</option>
              {versions.map((version) => (
                <option key={version} value={`../history/${version}/tokens.css`}>{version}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <main className="showcase-workspace">
        <p className="showcase-context" aria-live="polite">
          {design} profile, {theme} theme, {VIEWPORT_WIDTHS[viewport]} preview
        </p>
        <div
          className="showcase-preview"
          data-preview-viewport={viewport}
          style={{ maxInlineSize: VIEWPORT_WIDTHS[viewport] }}
        >
          {activePage === 'system' && <KitchenSink />}
          {activePage === 'login' && <Login />}
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'analytics' && <Analytics />}
        </div>
      </main>
    </div>
  );
}
