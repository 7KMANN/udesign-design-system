import { Card } from '../components/Card';

const SERIES = [
  { label: 'Screen print', value: 82, entity: 1 },
  { label: 'Embroidery', value: 68, entity: 2 },
  { label: 'Direct to film', value: 56, entity: 3 },
  { label: 'Sublimation', value: 44, entity: 4 },
  { label: 'Laser', value: 38, entity: 1 },
  { label: 'Finishing', value: 31, entity: 2 },
  { label: 'Packing', value: 24, entity: 3 },
  { label: 'Dispatch', value: 17, entity: 4 },
] as const;

export function Analytics() {
  return (
    <div className="preview-page">
      <header className="preview-heading">
        <div>
          <p className="preview-kicker">Data roles</p>
          <h1>Production analytics</h1>
        </div>
        <p>Eight ordered series remain readable through labels, values, and entity markers.</p>
      </header>

      <div className="analytics-grid">
        <Card className="chart-card">
          <div className="section-heading">
            <div>
              <p className="section-index">Weekly output</p>
              <h2>Completed units by process</h2>
            </div>
            <span className="chart-total">360 units</span>
          </div>

          <div className="bar-chart" role="img" aria-label="Completed units by process. Screen print leads at 82 units and dispatch is lowest at 17 units.">
            {SERIES.map((series, index) => (
              <div className="bar-row" key={series.label}>
                <span>{series.label}</span>
                <div className="bar-track" aria-hidden="true">
                  <div
                    className="bar-fill"
                    style={{ inlineSize: `${series.value}%`, backgroundColor: `var(--data-${index + 1})` }}
                  />
                </div>
                <strong>{series.value}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card className="legend-card" surface="raised">
          <p className="section-index">Series key</p>
          <h2>Data and entity roles</h2>
          <div className="series-legend">
            {SERIES.map((series, index) => (
              <div key={series.label}>
                <span className="series-swatch" style={{ backgroundColor: `var(--data-${index + 1})` }} aria-hidden="true" />
                <span>{series.label}</span>
                <code>data-{index + 1}</code>
              </div>
            ))}
          </div>
          <div className="chart-tooltip" role="note">
            <strong>Tooltip surface</strong>
            <span>Embroidery: 68 units</span>
          </div>
        </Card>
      </div>

      <section className="preview-section" aria-labelledby="entity-analytics-heading">
        <div className="section-heading">
          <div>
            <p className="section-index">Assignment</p>
            <h2 id="entity-analytics-heading">Entity families stay product-owned</h2>
          </div>
          <p>The numbered role does not imply the same business type in another application.</p>
        </div>
        <div className="entity-grid">
          {[1, 2, 3, 4].map((entity) => (
            <div className={`entity-chip entity-${entity}`} key={entity}>
              <span aria-hidden="true">{entity}</span>
              <strong>{['Client', 'Work order', 'Process', 'Shipment'][entity - 1]}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
