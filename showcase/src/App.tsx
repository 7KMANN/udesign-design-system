import React, { useState, useEffect } from 'react';
import { KitchenSink } from './pages/KitchenSink';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';

export default function App() {
  const [activePage, setActivePage] = useState<'kitchen-sink' | 'login' | 'dashboard' | 'analytics'>('kitchen-sink');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [versions, setVersions] = useState<string[]>([]);
  const [selectedVersionPath, setSelectedVersionPath] = useState('../dist/tokens.css');

  // Load versions array defined in history configs
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'versions.js';
    script.onload = () => {
      const globalVersions = (window as any).UD_VERSIONS || [];
      setVersions(globalVersions);
    };
    script.onerror = () => {
      console.warn('Failed to load versions.js');
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Update stylesheet href when token version picker is selected
  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedVersionPath(val);
    const linkEl = document.getElementById('tokens-link') as HTMLLinkElement;
    if (linkEl) {
      linkEl.href = val;
    }
  };

  const getViewportMaxWidth = () => {
    switch (viewport) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      case 'desktop':
      default: return 'max-w-[1200px]';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfaf6] text-[#1b1b1b]">
      {/* Shell Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 px-6 bg-white border-b border-[#e4ded0] sticky top-0 z-50">
        <div className="flex items-center gap-2.5 font-display font-black text-[17px] tracking-tight">
          <span className="w-[26px] h-[26px] rounded bg-[#1b1b1b] text-[#c79f6b] flex items-center justify-center font-black text-[13px]">U</span>
          UDesign Showcase & Previewer
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Page Picker */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8a8172]">
            <span>Page:</span>
            <select 
              value={activePage}
              onChange={(e) => setActivePage(e.target.value as any)}
              className="font-data text-[12px] py-1 px-2 border border-[#e4ded0] rounded bg-white text-[#1b1b1b] outline-none cursor-pointer"
            >
              <option value="kitchen-sink">Kitchen Sink</option>
              <option value="login">Login Canvas</option>
              <option value="dashboard">Admin Dashboard</option>
              <option value="analytics">Analytics & Charts</option>
            </select>
          </div>

          {/* Viewport resizing tool */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8a8172]">
            <span>Viewport:</span>
            <select
              value={viewport}
              onChange={(e) => setViewport(e.target.value as any)}
              className="font-data text-[12px] py-1 px-2 border border-[#e4ded0] rounded bg-white text-[#1b1b1b] outline-none cursor-pointer"
            >
              <option value="desktop">Desktop (1200px)</option>
              <option value="tablet">Tablet (768px)</option>
              <option value="mobile">Mobile (375px)</option>
            </select>
          </div>

          {/* Token version hook */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8a8172]">
            <span>Version:</span>
            <select
              value={selectedVersionPath}
              onChange={handleVersionChange}
              className="font-data text-[12px] py-1 px-2 border border-[#e4ded0] rounded bg-white text-[#1b1b1b] outline-none cursor-pointer"
            >
              {versions.map((v) => (
                <option key={v} value={`../history/${v}/tokens.css`}>{v}</option>
              ))}
              <option value="../dist/tokens.css">current (unreleased)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Frame wrapper viewport */}
      <div className="flex-1 p-6 flex justify-center items-start overflow-y-auto">
        <div 
          className={`w-full bg-background text-foreground font-display border border-border rounded-lg overflow-hidden shadow-shadow-2 transition-all duration-300 scroll-zone ${getViewportMaxWidth()}`}
        >
          <div className="p-8">
            {activePage === 'kitchen-sink' && <KitchenSink />}
            {activePage === 'login' && <Login />}
            {activePage === 'dashboard' && <Dashboard />}
            {activePage === 'analytics' && <Analytics />}
          </div>
        </div>
      </div>
    </div>
  );
}
