import { useMemo, useState } from 'react';
import { Badge, type BadgeProps } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

interface WorkOrder {
  id: string;
  client: string;
  service: string;
  total: string;
  status: BadgeProps['variant'];
  statusLabel: string;
  entity: 1 | 2 | 3 | 4;
}

const WORK_ORDERS: WorkOrder[] = [
  { id: 'WO-1842', client: 'Atelier Montréal', service: 'Screen print', total: '$5,400', status: 'success', statusLabel: 'Ready', entity: 1 },
  { id: 'WO-1847', client: 'GlobalVision', service: 'Rush embroidery', total: '$12,850', status: 'warning', statusLabel: 'Attention', entity: 2 },
  { id: 'WO-1851', client: 'Studio Québec', service: 'Sublimation', total: '$1,200', status: 'progress', statusLabel: 'In progress', entity: 3 },
  { id: 'WO-1855', client: 'Northline Co.', service: 'Direct to film', total: '$3,640', status: 'danger', statusLabel: 'Blocked', entity: 4 },
];

const METRICS = [
  { label: 'Orders today', value: '148', delta: '+12%', tone: 'positive' },
  { label: 'Estimated volume', value: '$42,500', delta: 'On plan', tone: 'neutral' },
  { label: 'Late orders', value: '7', delta: '+2', tone: 'negative' },
] as const;

export function Dashboard() {
  const [search, setSearch] = useState('');
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return WORK_ORDERS;
    return WORK_ORDERS.filter((order) =>
      `${order.id} ${order.client} ${order.service}`.toLowerCase().includes(query),
    );
  }, [search]);

  return (
    <div className="preview-page">
      <header className="preview-heading dashboard-heading">
        <div>
          <p className="preview-kicker">Operations</p>
          <h1>Production dashboard</h1>
        </div>
        <Button>New work order</Button>
      </header>

      <section className="metric-grid" aria-label="Production metrics">
        {METRICS.map((metric) => (
          <Card key={metric.label} className={`metric-card metric-${metric.tone}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.delta}</small>
          </Card>
        ))}
      </section>

      <section className="collection-section" aria-labelledby="orders-heading">
        <div className="collection-toolbar">
          <div>
            <p className="section-index">Responsive collection</p>
            <h2 id="orders-heading">Active work orders</h2>
          </div>
          <label className="search-field">
            <span>Search orders</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Client, service, or order"
            />
          </label>
        </div>

        {filteredOrders.length > 0 ? (
          <Card padded={false} className="responsive-collection">
            <div className="collection-table scroll-zone">
              <table>
                <caption>Active work orders and current production state</caption>
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Client</th>
                    <th scope="col">Service</th>
                    <th scope="col">Total</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td><code>{order.id}</code></td>
                      <td><span className={`entity-label entity-${order.entity}`}>{order.client}</span></td>
                      <td>{order.service}</td>
                      <td>{order.total}</td>
                      <td><Badge variant={order.status}>{order.statusLabel}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="collection-cards">
              {filteredOrders.map((order) => (
                <article key={order.id} className={`collection-card entity-${order.entity}`}>
                  <div>
                    <code>{order.id}</code>
                    <Badge variant={order.status}>{order.statusLabel}</Badge>
                  </div>
                  <h3>{order.client}</h3>
                  <p>{order.service}</p>
                  <strong>{order.total}</strong>
                </article>
              ))}
            </div>
          </Card>
        ) : (
          <Card surface="sunken" className="empty-state">
            <strong>No matching orders</strong>
            <p>Clear the search or try a client name.</p>
            <Button variant="secondary" onClick={() => setSearch('')}>Clear search</Button>
          </Card>
        )}
      </section>
    </div>
  );
}
