import React from 'react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';

const BRAND_SWATCHES = [
  { varName: '--ud-accent-wash', label: 'wash' },
  { varName: '--ud-accent-300', label: '300' },
  { varName: '--ud-accent-400', label: '400' },
  { varName: '--ud-accent', label: 'accent' },
  { varName: '--ud-accent-deep', label: 'accent deep' },
  { varName: '--ud-cream', label: 'cream' },
  { varName: '--ud-ink', label: 'ink' },
  { varName: '--ud-white', label: 'white' },
  { varName: '--ud-panel', label: 'panel' },
  { varName: '--ud-panel-2', label: 'panel 2' },
  { varName: '--ud-border', label: 'border' },
  { varName: '--ud-border-strong', label: 'border strong' },
  { varName: '--ud-muted', label: 'muted' },
  { varName: '--ud-muted-soft', label: 'muted soft' },
  { varName: '--ud-success', label: 'success' },
  { varName: '--ud-warning', label: 'warning' },
  { varName: '--ud-danger', label: 'danger' }
];

export const KitchenSink: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Colors section */}
      <div>
        <h2 className="text-xl font-display font-black mb-1">Color Palette</h2>
        <p className="text-sm text-muted-foreground mb-4 font-display">Token mappings showing color names and values.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {BRAND_SWATCHES.map((swatch) => (
            <div key={swatch.varName} className="border border-border rounded overflow-hidden bg-card">
              <div className="h-12" style={{ backgroundColor: `var(${swatch.varName})` }} />
              <div className="p-2">
                <div className="font-display font-semibold text-[11px] text-foreground">{swatch.label}</div>
                <div className="font-data text-[9px] text-muted-foreground mt-0.5">{swatch.varName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typo Section */}
      <div>
        <h2 className="text-xl font-display font-black mb-1">Typography Hierarchy</h2>
        <p className="text-sm text-muted-foreground mb-4 font-display">Hierarchy styles mapped from typography variables.</p>
        <div className="flex flex-col border-t border-border">
          {[
            { tag: 'display', cssClass: 'text-[3rem] font-black tracking-tight leading-none font-display' },
            { tag: 'h1', cssClass: 'text-[2.1rem] font-black tracking-tight leading-tight font-display' },
            { tag: 'h2', cssClass: 'text-[1.6rem] font-extrabold tracking-tight leading-normal font-display' },
            { tag: 'h3', cssClass: 'text-[1.2rem] font-bold leading-normal font-display' },
            { tag: 'body', cssClass: 'text-[1rem] font-normal leading-relaxed font-display' },
            { tag: 'label', cssClass: 'text-[0.78rem] font-semibold text-muted-foreground uppercase tracking-wider font-display' },
            { tag: 'data', cssClass: 'font-data text-[0.85rem] leading-normal font-data' }
          ].map((item) => (
            <div key={item.tag} className="flex items-baseline py-3 border-b border-border gap-4">
              <div className="font-data text-[11px] text-muted-foreground w-20 flex-shrink-0">{item.tag}</div>
              <div className={item.cssClass}>UDesign Productions</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action triggers */}
      <div>
        <h2 className="text-xl font-display font-black mb-3">Action Triggers</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Agrandir la référence</Button>
          <Button variant="secondary">Comparer</Button>
          <Button variant="outline">Fiche technique</Button>
        </div>
      </div>

      {/* State Badges */}
      <div>
        <h2 className="text-xl font-display font-black mb-3">State Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </div>

      {/* Spacing & Borders */}
      <div>
        <h2 className="text-xl font-display font-black mb-3">Radius & Spacing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-display font-bold text-sm mb-3">Border Radii</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'radius-sm', class: 'rounded-sm w-12 h-12 bg-primary' },
                { label: 'radius', class: 'rounded w-12 h-12 bg-primary' },
                { label: 'radius-lg', class: 'rounded-lg w-12 h-12 bg-primary' },
                { label: 'radius-pill', class: 'rounded-pill w-28 h-12 bg-primary' }
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-4">
                  <span className="font-data text-[11px] text-muted-foreground w-24">{r.label}</span>
                  <div className={r.class} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-display font-bold text-sm mb-3">Space Scales</h3>
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 6, 8].map((s) => (
                <div key={s} className="flex items-center gap-4">
                  <span className="font-data text-[11px] text-muted-foreground w-24">space-{s}</span>
                  <div className="h-4 bg-primary rounded-sm" style={{ width: `var(--space-${s})` }} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
