import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';

const INITIAL_ROWS = [
  { id: 1, client: 'Atelier Montréal', service: 'Screen Printing', budget: '5,400.00 $', status: 'success', statusLabel: 'Nouveau', type: 'Prospect', isRush: false },
  { id: 2, client: 'GlobalVision Inc.', service: 'Embroidery Rush', budget: '12,850.00 $', status: 'warning', statusLabel: 'RUSH', type: 'Urgent', isRush: true },
  { id: 3, client: 'Studio Québec', service: 'Sublimation', budget: '1,200.00 $', status: 'success', statusLabel: 'Nouveau', type: 'Prospect', isRush: false }
];

export const Dashboard: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredRows = INITIAL_ROWS.filter(row => 
    row.client.toLowerCase().includes(search.toLowerCase()) ||
    row.service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <h1 className="text-xl font-display font-black tracking-tight">Console d'administration</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <input
            type="text"
            className="h-9 border border-border rounded px-3 bg-card text-foreground font-display text-[12.5px] outline-none focus:border-ring focus:ring-2 focus:ring-ud-accent-wash w-full sm:w-48"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="secondary" className="text-[12.5px] py-1.5 px-3.5 h-9 w-full sm:w-auto">Exporter CSV</Button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Leads du jour</div>
          <div className="font-data text-2xl font-bold mt-1 text-primary">148</div>
        </Card>
        <Card>
          <div className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Volume estimé</div>
          <div className="font-data text-2xl font-bold mt-1 text-foreground">42 500 $</div>
        </Card>
        <Card>
          <div className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Taux d'engagement</div>
          <div className="font-data text-2xl font-bold mt-1 text-emerald-700">92.4 %</div>
        </Card>
      </div>

      {/* High-density Table */}
      <Card padded={false} className="overflow-hidden">
        <div className="scroll-zone overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px] text-left">
            <thead>
              <tr className="bg-secondary text-muted-foreground font-display font-semibold text-[11px] uppercase tracking-wider border-b border-border">
                <th className="py-2 px-3">Client</th>
                <th className="py-2 px-3">Service</th>
                <th className="py-2 px-3">Budget</th>
                <th className="py-2 px-3">Statut</th>
                <th className="py-2 px-3">Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-border last:border-0 hover:bg-secondary/40 transition-colors ${
                    row.isRush 
                      ? 'bg-red-500/[0.04] hover:bg-red-500/[0.08]' 
                      : ''
                  }`}
                >
                  <td className={`py-1.5 px-3 font-semibold ${row.isRush ? 'border-l-[3px] border-l-destructive pl-[9px]' : ''}`}>
                    {row.isRush && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive mr-1.5 animate-pulse" />
                    )}
                    {row.client}
                  </td>
                  <td className="py-1.5 px-3 font-data">{row.service}</td>
                  <td className="py-1.5 px-3 font-data">{row.budget}</td>
                  <td className="py-1.5 px-3">
                    <Badge variant={row.isRush ? 'destructive' : 'success'}>
                      {row.statusLabel}
                    </Badge>
                  </td>
                  <td className={`py-1.5 px-3 ${row.isRush ? 'font-bold text-destructive' : ''}`}>{row.type}</td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground font-display">Aucun résultat trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
