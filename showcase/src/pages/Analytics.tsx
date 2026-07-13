import React from 'react';
import { Card } from '../components/Card';

export const Analytics: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-display font-black">Rapports graphiques</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sparkline curve */}
        <Card className="md:col-span-2">
          <h3 className="font-display font-black text-sm mb-4">Évolution du volume de leads</h3>
          <div className="h-44 border-b border-l border-border flex items-end relative overflow-hidden">
            <svg viewBox="0 0 100 40" width="100%" height="100%" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-full">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              <path d="M 0 35 Q 20 15 40 25 T 80 5 T 100 10 L 100 40 L 0 40 Z" fill="url(#chart-grad)" />
              <path d="M 0 35 Q 20 15 40 25 T 80 5 T 100 10" fill="none" stroke="var(--primary)" strokeWidth="1.8" />
            </svg>
          </div>
          <div className="flex justify-between mt-2.5 font-data text-[11px] text-muted-foreground">
            <span>Lundi</span>
            <span>Mercredi</span>
            <span>Vendredi</span>
          </div>
        </Card>

        {/* Bar chart distribution */}
        <Card>
          <h3 className="font-display font-black text-sm mb-4">Répartition des ventes</h3>
          <div className="h-44 flex items-end justify-center gap-4 border-b border-border pb-2">
            <div className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="w-full bg-primary rounded-t-sm" style={{ height: '70%' }} />
              <span className="font-display text-[10px] font-semibold mt-2">Gold</span>
            </div>
            <div className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="w-full bg-secondary border border-border rounded-t-sm" style={{ height: '45%' }} />
              <span className="font-display text-[10px] font-semibold mt-2">Neutral</span>
            </div>
            <div className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="w-full bg-foreground rounded-t-sm" style={{ height: '90%' }} />
              <span className="font-display text-[10px] font-semibold mt-2">Ink</span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
