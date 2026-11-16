import * as React from 'react';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Executor, type Item, SHIPPED } from './data';
import { Content, useT } from './i18n';
import type { TaskStore } from './store';
import { AllClear } from './TodayView';

type Tab = 'flight' | 'triage' | 'shipped';
const EXECUTORS: Executor[] = ['KASPER', 'AETHER', 'Koda'];

function DevRow({ item, onOpen, children, kind }: { item: Item; onOpen: (item: Item, opener: HTMLElement | null) => void; children?: React.ReactNode; kind?: 'triage' }) {
  return (
    <div className="tt-devrow" data-kind={kind}>
      <span className="tt-code">{item.code}</span>
      <button type="button" className="tt-title tt-focus" onClick={(event) => onOpen(item, event.currentTarget)} onKeyDown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          const all = Array.from(event.currentTarget.closest('[data-keyscope]')?.querySelectorAll<HTMLElement>('.tt-devrow .tt-title') ?? []);
          const next = all[all.indexOf(event.currentTarget) + (event.key === 'ArrowDown' ? 1 : -1)];
          if (next) { event.preventDefault(); next.focus(); }
        }
      }}>
        <Content className="tt-title-text" text={item.title} origin={item.origin} />
      </button>
      {children}
    </div>
  );
}

export function DevView({ store, onOpen }: { store: TaskStore; onOpen: (item: Item, opener: HTMLElement | null) => void }) {
  const t = useT();
  const [tab, setTab] = React.useState<Tab>('flight');
  const { items, phases } = store;
  const flight = items.filter((i) => i.devState === 'flight');
  const triage = items.filter((i) => i.devState === 'triage');
  const tabs: { id: Tab; count?: number }[] = [
    { id: 'flight', count: flight.length },
    { id: 'triage', count: triage.length },
    { id: 'shipped' },
  ];
  const tabRefs = React.useRef<Record<Tab, HTMLButtonElement | null>>({ flight: null, triage: null, shipped: null });

  return (
    <div className="tt-view tt-view-dev">
      <header className="tt-head">
        <div>
          <h2>{t.dev}</h2>
          <p className="tt-dev-intro">{t.devIntro}</p>
        </div>
      </header>

      <div className="tt-tabs" role="tablist" aria-label={t.devViews} onKeyDown={(event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        const i = tabs.findIndex((x) => x.id === tab);
        const next = tabs[(i + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].id;
        setTab(next);
        tabRefs.current[next]?.focus();
      }}>
        {tabs.map((x) => (
          <button
            key={x.id}
            ref={(el) => { tabRefs.current[x.id] = el; }}
            type="button"
            role="tab"
            id={`tt-tab-${x.id}`}
            aria-selected={tab === x.id}
            aria-controls={`tt-tabpanel-${x.id}`}
            tabIndex={tab === x.id ? 0 : -1}
            onClick={() => setTab(x.id)}
          >
            {t.devTabs[x.id]}{x.count ? <small>{x.count}</small> : null}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`tt-tabpanel-${tab}`} aria-labelledby={`tt-tab-${tab}`} data-keyscope>
        {tab === 'flight' ? EXECUTORS.map((executor) => {
          const rows = flight.filter((i) => i.executor === executor);
          if (rows.length === 0) return null;
          return (
            <section key={executor} className="tt-group">
              <h3 className="tt-group-head">{executor} <small>{rows.length}</small></h3>
              <div className="tt-devlist">
                {rows.map((item) => (
                  <DevRow key={item.id} item={item} onOpen={onOpen}>
                    <span className="tt-stage" data-waiting={item.stage === 'waitingKaleb'}>{item.stage ? t.stage[item.stage] : null}</span>
                  </DevRow>
                ))}
              </div>
            </section>
          );
        }) : null}

        {tab === 'triage' ? (triage.length === 0 ? (
          <AllClear category="dev" title={t.triageClear} detail={t.triageClearDetail} />
        ) : (
          <div className="tt-devlist">
            {triage.map((item) => (
              <div key={item.id} className="tt-collapse" data-row-id={item.id} data-phase={phases[item.id] === 'leave' ? 'leave' : undefined}>
                <div>
                  <DevRow item={item} onOpen={onOpen} kind="triage">
                    <span className="tt-triage-side">
                      <span className="tt-logged">{item.loggedBy ? t.from(item.loggedBy) : null}</span>
                      <span className="tt-triage-actions">
                        <Button variant="secondary" size="compact" disabled={Boolean(phases[item.id])} onClick={() => store.triage(item, 'flight')}>{t.accept}</Button>
                        <Button variant="ghost" size="compact" disabled={Boolean(phases[item.id])} onClick={() => store.triage(item, 'declined')}>{t.decline}</Button>
                        <Button variant="ghost" size="compact" disabled={Boolean(phases[item.id])} onClick={() => store.triage(item, 'snoozed')}>{t.snooze}</Button>
                      </span>
                    </span>
                  </DevRow>
                </div>
              </div>
            ))}
          </div>
        )) : null}

        {tab === 'shipped' ? (['today', 'yesterday', 'earlier'] as const).map((day) => {
          const entries = SHIPPED.filter((s) => s.day === day);
          return (
            <section key={day} className="tt-group">
              <h3 className="tt-group-head">{t.shippedDays[day]}</h3>
              <ul className="tt-feed">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <CircleCheck aria-hidden="true" />
                    <div>
                      <p><Content text={entry.sentence} origin={entry.origin} /></p>
                      <small>{entry.executor}, <Content text={entry.time} origin={entry.origin} /> <span className="tt-code">{entry.code}</span></small>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        }) : null}
      </div>
    </div>
  );
}
